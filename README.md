# Kitchen.AI

AI-powered recipe generator: scan ingredients with your camera, get gourmet recipes from Google Gemini, generate food photos with Imagen.

## Quick Start

### Backend

```bash
cd server
cp .env.example .env   # fill in GEMINI_API_KEY
npm install
npm run dev
```

### Frontend

```bash
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:5050
npm install
npm run dev
```

## Features

- **AI Recipe Generation** — Google Gemini API
- **AI Food Photography** — Imagen API
- **Live Camera Scanner** — detect ingredients in real time
- **Voice Input** — dictate ingredients
- **Favorites** — Firebase Auth + Firestore
- **Meal Plans & Drink Pairing** — weekly plans from a single dish
- **PWA** — installable, works offline
- **Bilingual** — Russian / English

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: Lucide React Icons
- **Backend Services**: 
  - Firebase (Authentication & Firestore Database)
  - Google Gemini API (Recipe Generation)
  - Google Imagen API (Image Generation)

## Prerequisites

- Node.js 16+ and npm
- Google Cloud Project with:
  - Gemini API enabled
  - Imagen API enabled
- Firebase Project with:
  - Authentication enabled
  - Firestore Database configured

## Installation & Setup

### 1. Install Dependencies

Dependencies are already installed. If needed, run:
```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Get your Firebase config from Firebase Console → Project Settings
3. Edit `public/firebase-config.js` with your credentials:

```js
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

window.__app_id = "YOUR_APP_ID";
```

4. Enable Anonymous Authentication in Firebase Console

### 3. Configure Gemini API

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. The `.env.local` file is already created. Add your key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

3. Restart the dev server for env changes to take effect

### 4. Set up Firestore Database

1. Create a Firestore database in your Firebase project
2. Set up the following collection structure:
   ```
   artifacts/
   └── {appId}/
       └── users/
           └── {userId}/
               └── favorites/
                   └── {recipeId}
   ```

## Running the App

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
kitchen-ai-pwa/
├── src/
│   ├── App.tsx              # Main application component
│   ├── index.css            # Tailwind CSS entry point
│   └── main.tsx             # React entry point
├── public/
│   └── firebase-config.js   # Firebase configuration (UPDATE WITH YOUR CREDENTIALS)
├── index.html               # HTML template
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.ts           # Vite configuration
└── README.md
```

## Environment Variables

The `.env.local` file has been created. Add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here (optional)
```

## How to Use

1. **Add Ingredients**: Type to search or browse the ingredient list
2. **Generate Recipe**: Click "Создать рецепт" to generate a new recipe
3. **View Details**: See ingredients, instructions, prep time, difficulty, and nutrition info
4. **Save Favorites**: Click the heart button to save recipes
5. **View Favorites**: Click the "Избранное" button in the top navigation
6. **Share**: Recipes in favorites can be viewed anytime

## Features Breakdown

### Recipe Generation
- Accepts multiple ingredients as input
- Uses Gemini API to generate authentic Russian recipes
- Returns recipes with:
  - Title and detailed description
  - Preparation time and difficulty level
  - Complete nutrition information (calories, proteins, fats, carbs)
  - Detailed ingredients list
  - Step-by-step cooking instructions

### Image Generation
- Generates professional food photography
- Uses Google Imagen API
- Images display as recipe hero/header
- Falls back to icon if generation fails

### Favorites Management
- Stores recipes in Firebase Firestore
- Persists across browser sessions
- Syncs across devices with same Firebase user
- Includes recipe image, title, and all metadata
- One-click removal

## Customization

### Add More Ingredients

Edit the `ALL_INGREDIENTS` array in `src/App.tsx`:

```typescript
const ALL_INGREDIENTS = [
  'Авокадо', 'Ананас', 'Апельсин',
  // ... add more ingredients
];
```

### Change Color Scheme

The app uses Tailwind CSS color classes. Common colors to modify:
- `emerald-600` - Primary accent color
- `slate-900` - Text and backgrounds
- `rose-500` - Highlight/favorite color
- `slate-100` - Secondary backgrounds

### Update API Models

In `src/App.tsx`, change these endpoints:
- Recipe model: Update `gemini-2.5-flash-preview-09-2025` to a newer model
- Image model: Update `imagen-4.0-generate-001` to a newer model

## Troubleshooting

### Firebase Configuration Issues

**Error**: Firebase config not found
- Ensure `public/firebase-config.js` exists
- Verify the script tag in `index.html` loads before the main app
- Check browser console for errors

**Error**: Authentication fails
- Verify Firebase project has Anonymous Authentication enabled
- Check that the API key in `firebase-config.js` is correct
- Ensure Firestore database is created

### Gemini API Issues

**Error**: `VITE_GEMINI_API_KEY not set`
- Create or update `.env.local` with your API key
- Restart the dev server after adding the key
- Verify the key from Google AI Studio is correct

**Error**: Recipe generation fails
- Check that Gemini API is enabled in your Google Cloud project
- Verify the API key has the correct permissions
- Check your API quota in Google Cloud Console

### Recipe Saving Issues

**Error**: Favorites not saving
- Verify Firebase authentication is working (check console)
- Ensure Firestore database exists and is accessible
- Check Firestore security rules allow reads/writes for authenticated users

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Deploy to Netlify

1. Push code to GitHub
2. Log in to Netlify and select "Import from Git"
3. Build settings will be detected automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add `VITE_API_KEY` in Site Settings > Environment Variables
5. (Optional) Add `VITE_OPENROUTER_API_KEY` to enable RU/BY OpenRouter routing
6. Deploy

## License

MIT

## Support & Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev)
- [Tailwind CSS](https://tailwindcss.com)
