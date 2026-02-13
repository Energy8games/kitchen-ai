import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5050;
const apiKey = process.env.GOOGLE_API_KEY || '';
const corsOrigin = process.env.CORS_ORIGIN || '*';

// Trust proxy headers (required behind Traefik / reverse proxy)
app.set('trust proxy', true);

app.use(express.json({ limit: '12mb' }));
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
  }),
);

const fetchWithRetry = async (url, options = {}, maxRetries = 5) => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      if (response.status === 429 || response.status >= 500) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      return null;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  return null;
};

const requireApiKey = (res) => {
  if (!apiKey) {
    res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });
    return false;
  }
  return true;
};

const geminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const imagenUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/vision', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { imageBase64, mimeType, language } = req.body || {};
  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: 'imageBase64 and mimeType are required' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const prompt = `List all food items in this photo. Return JSON array of strings in ${targetLang}.`;

  try {
    const response = await fetchWithRetry(
      geminiUrl('gemini-2.5-flash-preview-09-2025'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      },
    );

    const resultText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = resultText ? JSON.parse(resultText) : [];
    res.json({ ingredients: Array.isArray(parsed) ? parsed : [] });
  } catch (err) {
    res.status(500).json({ error: 'Vision request failed' });
  }
});

app.post('/api/recipe', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { ingredients, language } = req.body || {};
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    res.status(400).json({ error: 'ingredients are required' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const systemPrompt = `You are a world-class chef. Create a gourmet recipe in ${targetLang}. Return ONLY JSON. \
Schema: { "title": "string", "description": "string", "prepTime": "string", "difficulty": "string", \
"nutrition": { "calories": number, "protein": "string", "fat": "string", "carbs": "string" },\
"ingredientsList": ["string"], "instructions": ["string"] }`;

  try {
    const response = await fetchWithRetry(
      geminiUrl('gemini-2.5-flash-preview-09-2025'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      },
    );

    const rawText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const recipe = JSON.parse(cleaned);
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Recipe request failed' });
  }
});

app.post('/api/meal-plan', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { title, language } = req.body || {};
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const prompt = `Based on recipe "${title}" create a weekly meal plan in ${targetLang}. JSON: [{day: "Day", meal: "Dish"}].`;

  try {
    const response = await fetchWithRetry(
      geminiUrl('gemini-2.5-flash-preview-09-2025'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const plan = JSON.parse(text);
    res.json(Array.isArray(plan) ? plan : []);
  } catch (err) {
    res.status(500).json({ error: 'Meal plan request failed' });
  }
});

app.post('/api/drinks', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { title, language } = req.body || {};
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const targetLang = language === 'ru' ? 'Russian' : 'English';
  const prompt = `Suggest drinks for "${title}" in ${targetLang}. JSON: {alcohol: "text", nonAlcohol: "text"}.`;

  try {
    const response = await fetchWithRetry(
      geminiUrl('gemini-2.5-flash-preview-09-2025'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: 'Drinks request failed' });
  }
});

app.post('/api/image', async (req, res) => {
  if (!requireApiKey(res)) return;
  const { recipeTitle } = req.body || {};
  if (!recipeTitle) {
    res.status(400).json({ error: 'recipeTitle is required' });
    return;
  }

  const prompt = `Gourmet cinematic food photography of ${recipeTitle}, exquisite plating, professional lighting, 4k`;

  const tryImagen = async (model) => {
    const response = await fetchWithRetry(imagenUrl(model), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: { prompt },
        parameters: { sampleCount: 1 },
      }),
    });
    const base64 = response?.predictions?.[0]?.bytesBase64Encoded;
    return base64 ? `data:image/png;base64,${base64}` : null;
  };

  try {
    let imageDataUrl = await tryImagen('imagen-4.0-generate-001');
    if (!imageDataUrl) imageDataUrl = await tryImagen('imagen-4.0-fast-generate-001');
    if (!imageDataUrl) imageDataUrl = await tryImagen('imagen-4.0-ultra-generate-001');

    if (!imageDataUrl) {
      const response = await fetchWithRetry(
        geminiUrl('gemini-2.5-flash-image-preview'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ['IMAGE'] },
          }),
        },
      );
      const base64 = response?.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData,
      )?.inlineData?.data;
      if (base64) imageDataUrl = `data:image/png;base64,${base64}`;
    }

    res.json({ imageDataUrl: imageDataUrl || null });
  } catch (err) {
    res.status(500).json({ error: 'Image request failed' });
  }
});

app.listen(port, () => {
  console.log(`API server listening on ${port}`);
});
