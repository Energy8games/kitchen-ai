import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';

dotenv.config();

// ── Constants ───────────────────────────────────────────────────────────
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const IMAGEN_MODELS = [
  'imagen-4.0-fast-generate-001',
  'imagen-4.0-generate-001',
  'imagen-4.0-ultra-generate-001',
];
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-preview-native-audio-dialog';
const BODY_LIMIT = '12mb';

const MODEL_TIMEOUT = 15_000;              // 15 s
const FETCH_TIMEOUT = 60_000;              // 60 s for text endpoints
const MAX_INGREDIENTS = 50;
const MAX_INGREDIENT_LENGTH = 100;
const MAX_TITLE_LENGTH = 200;
const MAX_PROMPT_LENGTH = 500;
const MAX_BASE64_LENGTH = 16 * 1024 * 1024; // ~12 MB raw

const app = express();
const port = Number(process.env.PORT) || 5050;
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const corsOrigin = process.env.CORS_ORIGIN || '';

if (!corsOrigin) {
  console.warn('[WARN] CORS_ORIGIN is not set — falling back to same-origin only. Set CORS_ORIGIN env var for cross-origin access.');
}

// Trust only the first proxy hop (Traefik / nginx), not arbitrary X-Forwarded-* headers.
app.set('trust proxy', 1);

app.use(compression());
app.use(express.json({ limit: BODY_LIMIT }));
app.use(
  cors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((o) => o.trim())
      : false,
  }),
);

// ── Rate limiting ───────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 30,               // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const imageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,               // image gen is expensive
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many image requests, please try again later.' },
});

app.use('/api/vision', apiLimiter);
app.use('/api/recipe', apiLimiter);
app.use('/api/recipes', apiLimiter);
app.use('/api/recipe-detail', apiLimiter);
app.use('/api/meal-plan', apiLimiter);
app.use('/api/drinks', apiLimiter);
app.use('/api/image', imageLimiter);



const fetchWithRetry = async (url, options = {}, maxRetries = 5, label = '') => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();

      const status = response.status;
      let errorBody = '';
      try { errorBody = await response.text(); } catch (_) {}
      console.error(`[fetchWithRetry] ${label} attempt ${i + 1}/${maxRetries} — HTTP ${status}: ${errorBody.slice(0, 500)}`);

      if (status === 429 || status >= 500) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      // Non-retryable error (403, 400, 451, etc.)
      return null;
    } catch (err) {
      console.error(`[fetchWithRetry] ${label} attempt ${i + 1}/${maxRetries} — network error:`, err.message);
      if (i === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  return null;
};

const requireApiKey = (res) => {
  if (!apiKey) {
    res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    return false;
  }
  return true;
};

const geminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const imagenUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`;

// Common headers for Google AI API calls — key passed via header, not query string.
const googleApiHeaders = {
  'Content-Type': 'application/json',
  'x-goog-api-key': apiKey,
};

// ── Input validation helpers ────────────────────────────────────────────
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  // Strip control characters and trim
  return text.replace(/[\x00-\x1F\x7F]/g, '').trim();
};

const validateIngredients = (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null;
  if (ingredients.length > MAX_INGREDIENTS) return null;
  const cleaned = ingredients
    .map((i) => sanitizeText(String(i)).slice(0, MAX_INGREDIENT_LENGTH))
    .filter((i) => i.length > 0);
  return cleaned.length > 0 ? cleaned : null;
};

const validateTitle = (title) => {
  const t = sanitizeText(title);
  return t.length > 0 && t.length <= MAX_TITLE_LENGTH ? t : null;
};

app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    ok: true,
    memory: {
      rss: `${(mem.rss / 1024 / 1024).toFixed(1)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)} MB`,
    },

  });
});

app.post('/api/vision', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { imageBase64, mimeType, language } = req.body || {};
  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: 'imageBase64 and mimeType are required' });
    return;
  }

  // Validate base64 payload size and format
  if (typeof imageBase64 !== 'string' || imageBase64.length > MAX_BASE64_LENGTH) {
    res.status(400).json({ error: 'Image payload too large or invalid' });
    return;
  }
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimes.includes(mimeType)) {
    res.status(400).json({ error: 'Unsupported image format' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const prompt = `List all food items in this photo. Return JSON array of strings in ${targetLang}.`;

  try {
    const response = await fetchWithRetry(
      geminiUrl(GEMINI_MODEL),
      {
        method: 'POST',
        headers: googleApiHeaders,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      },
      5,
      'vision',
    );

    const resultText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = resultText ? JSON.parse(resultText) : [];
    res.json({ ingredients: Array.isArray(parsed) ? parsed : [] });
  } catch (err) {
    console.error('[/api/vision] Error:', err.message);
    res.status(500).json({ error: 'Vision request failed' });
  }
});

app.post('/api/recipe', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { language } = req.body || {};
  const ingredients = validateIngredients(req.body?.ingredients);
  if (!ingredients) {
    res.status(400).json({ error: 'ingredients are required (max 50, each max 100 chars)' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const systemPrompt = `You are a world-class chef. Create a gourmet recipe in ${targetLang}. Return ONLY JSON. \
Schema: { "title": "string", "description": "string", "prepTime": "string", "difficulty": "string", \
"nutrition": { "calories": number, "protein": "string", "fat": "string", "carbs": "string" },\
"ingredientsList": ["string"], "instructions": ["string"] }`;

  try {
    const response = await fetchWithRetry(
      geminiUrl(GEMINI_MODEL),
      {
        method: 'POST',
        headers: googleApiHeaders,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Ingredients: ${ingredients.join(', ')}`,
                },
              ],
            },
          ],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      },
      5,
      'recipe',
    );

    const rawText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) {
      res.status(502).json({ error: 'Empty response from AI model' });
      return;
    }
    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const recipe = JSON.parse(cleaned);
    res.json(recipe);
  } catch (err) {
    console.error('[/api/recipe] Error:', err.message);
    res.status(500).json({ error: 'Recipe request failed' });
  }
});

// Create 3 recipe suggestions (array), matching the frontend schema
app.post('/api/recipes', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { language, diet } = req.body || {};
  const ingredients = validateIngredients(req.body?.ingredients);
  if (!ingredients) {
    res.status(400).json({ error: 'ingredients are required (max 50, each max 100 chars)' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const safeDiet = sanitizeText(String(diet || 'none')).slice(0, 30);
  const systemPrompt = `Michelin Chef. Create 3 distinct recipes based on the ingredients provided. Respond ONLY with a JSON array of 3 objects.\n` +
    `Schema for each object: { "title": "str", "description": "str", "prepTime": "str", "difficulty": "str", ` +
    `"nutrition": {"calories": num, "protein": "str", "fat": "str", "carbs": "str"}, ` +
    `"ingredientsList": ["str"], "instructions": ["str"] } in ${targetLang}. Diet: ${safeDiet}.`;

  try {
    const response = await fetchWithRetry(
      geminiUrl(GEMINI_MODEL),
      {
        method: 'POST',
        headers: googleApiHeaders,
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Ingredients: ${ingredients.join(', ')}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      },
      5,
      'recipes',
    );

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) {
      res.status(502).json({ error: 'Empty response from AI model' });
      return;
    }
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = cleaned ? JSON.parse(cleaned) : [];
    res.json(Array.isArray(parsed) ? parsed : [parsed]);
  } catch (err) {
    console.error('[/api/recipes] Error:', err.message);
    res.status(500).json({ error: 'Recipes request failed' });
  }
});

// Create one detailed recipe by title (used when clicking meal plan items)
app.post('/api/recipe-detail', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { language, diet } = req.body || {};
  const title = validateTitle(req.body?.title);
  if (!title) {
    res.status(400).json({ error: 'title is required (max 200 chars)' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const safeDiet = sanitizeText(String(diet || 'none')).slice(0, 30);
  const systemPrompt = `Expert Chef. Create a detailed recipe for the dish described by the user. Respond ONLY valid JSON object with schema: ` +
    `{ "title": "str", "description": "str", "prepTime": "str", "difficulty": "str", ` +
    `"nutrition": {"calories": num, "protein": "str", "fat": "str", "carbs": "str"}, ` +
    `"ingredientsList": ["str"], "instructions": ["str"] } in ${targetLang}. Diet: ${safeDiet}.`;

  try {
    const response = await fetchWithRetry(
      geminiUrl(GEMINI_MODEL),
      {
        method: 'POST',
        headers: googleApiHeaders,
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Recipe for: ${title}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      },
      5,
      'recipe-detail',
    );

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) {
      res.status(502).json({ error: 'Empty response from AI model' });
      return;
    }
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = cleaned ? JSON.parse(cleaned) : null;
    res.json(parsed || {});
  } catch (err) {
    console.error('[/api/recipe-detail] Error:', err.message);
    res.status(500).json({ error: 'Recipe detail request failed' });
  }
});

app.post('/api/meal-plan', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { language, diet } = req.body || {};
  const title = validateTitle(req.body?.title);
  if (!title) {
    res.status(400).json({ error: 'title is required (max 200 chars)' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const safeDiet = sanitizeText(String(diet || 'none')).slice(0, 30);
  const dietCtx = safeDiet !== 'none' ? `Diet: ${safeDiet}.` : '';
  const prompt = `Based on the dish described by the user, create a balanced 7-day meal plan. Return JSON array of 7 objects. ` +
    `Schema: { "day": "Day Name", "breakfast": "Dish", "lunch": "Dish", "dinner": "Dish" }. Use ${targetLang}. ${dietCtx}`;

  try {
    const response = await fetchWithRetry(
      geminiUrl(GEMINI_MODEL),
      {
        method: 'POST',
        headers: googleApiHeaders,
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Dish: ${title}` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      },
      5,
      'meal-plan',
    );
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const plan = JSON.parse(text);
    res.json(Array.isArray(plan) ? plan : []);
  } catch (err) {
    console.error('[/api/meal-plan] Error:', err.message);
    res.status(500).json({ error: 'Meal plan request failed' });
  }
});

app.post('/api/drinks', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { language, diet } = req.body || {};
  const title = validateTitle(req.body?.title);
  if (!title) {
    res.status(400).json({ error: 'title is required (max 200 chars)' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const safeDiet = sanitizeText(String(diet || 'none')).slice(0, 30);
  const dietCtx = safeDiet !== 'none' ? `Diet: ${safeDiet}.` : '';
  const prompt = `Suggest drinks for the dish described by the user in ${targetLang}. ${dietCtx} JSON: {alcohol: "text", nonAlcohol: "text"}.`;

  try {
    const response = await fetchWithRetry(
      geminiUrl(GEMINI_MODEL),
      {
        method: 'POST',
        headers: googleApiHeaders,
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Dish: ${title}` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      },
      5,
      'drinks',
    );
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('[/api/drinks] Error:', err.message);
    res.status(500).json({ error: 'Drinks request failed' });
  }
});

app.post('/api/image', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { recipeTitle } = req.body || {};
  const rawPrompt = sanitizeText(String(req.body?.prompt || ''));

  if (!recipeTitle && !rawPrompt) {
    res.status(400).json({ error: 'recipeTitle or prompt is required' });
    return;
  }

  const safeTitle = sanitizeText(String(recipeTitle || '')).slice(0, MAX_TITLE_LENGTH);
  const finalPrompt =
    rawPrompt.length > 0
      ? rawPrompt.slice(0, MAX_PROMPT_LENGTH)
      : `Gourmet cinematic food photography of ${safeTitle}, exquisite plating, professional lighting, 4k`;

  const tryImagen = async (model) => {
    const response = await fetchWithRetry(imagenUrl(model), {
      method: 'POST',
      headers: googleApiHeaders,
      body: JSON.stringify({
        instances: [{ prompt: finalPrompt }],
        parameters: { sampleCount: 1 },
      }),
      signal: AbortSignal.timeout(MODEL_TIMEOUT),
    }, 1, `imagen:${model}`);
    const base64 = response?.predictions?.[0]?.bytesBase64Encoded;
    return base64 ? { base64, mime: 'image/png' } : null;
  };

  const tryGeminiImage = async (model) => {
    const response = await fetchWithRetry(
      geminiUrl(model),
      {
        method: 'POST',
        headers: googleApiHeaders,
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
        signal: AbortSignal.timeout(MODEL_TIMEOUT),
      },
      1,
      `gemini-image:${model}`,
    );
    const part = response?.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData,
    );
    const base64 = part?.inlineData?.data;
    const mime = part?.inlineData?.mimeType || 'image/png';
    return base64 ? { base64, mime } : null;
  };

  // Sequential fallback: try each model one at a time, stop on first success
  const models = [
    () => tryGeminiImage(GEMINI_IMAGE_MODEL),
    () => tryImagen(IMAGEN_MODELS[0]),
    () => tryImagen(IMAGEN_MODELS[1]),
    () => tryImagen(IMAGEN_MODELS[2]),
  ];

  try {
    let base64 = null;
    let mime = 'image/png';
    for (const tryModel of models) {
      try {
        const result = await tryModel();
        if (result) { base64 = result.base64; mime = result.mime; break; }
      } catch (err) {
        console.error(`[/api/image] model error:`, err.message);
      }
    }

    if (base64) {
      const imageBase64 = `data:${mime};base64,${base64}`;
      res.json({ imageBase64 });
    } else {
      res.json({ imageBase64: null });
    }
  } catch (err) {
    console.error(`[/api/image] Unhandled error for "${recipeTitle}":`, err.message);
    res.status(500).json({ error: 'Image request failed' });
  }
});

app.listen(port, () => {
  console.log(`API server listening on ${port}`);
});
