# AgroScan AI - Crop Disease Detection App

A mobile-first crop health analysis application using Claude AI and Supabase.

## 🌾 Features

- **AI-Powered Analysis**: Claude Sonnet 4 analyzes crop images for disease detection
- **Tamil Language Support**: All results available in English and Tamil
- **Mobile-First Design**: Optimized for field use on smartphones
- **Treatment Plans**: Specific fungicide/pesticide recommendations
- **Prevention Tips**: Long-term crop management advice
- **Cloud Storage**: All inspections saved to Supabase database

---

## 📋 Setup Instructions

### Step 1: Database Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing)
3. Go to SQL Editor
4. Run the SQL from `supabase-schema.sql`
5. Copy your:
   - Project URL (Settings → API → Project URL)
   - Anon/Public Key (Settings → API → Project API keys → anon/public)

### Step 2: Get Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up / Log in
3. Navigate to API Keys section
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)

### Step 3: Project Setup

1. **Create your project folder**:
   ```bash
   mkdir agroscan-ai
   cd agroscan-ai
   ```

2. **Copy package.json** from this folder

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

5. **Edit `.env`** and add your keys:
   ```
   VITE_CLAUDE_API_KEY=sk-ant-your-actual-key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

### Step 4: Project Structure

Create this folder structure:
```
agroscan-ai/
├── src/
│   ├── components/
│   │   ├── Scanner.tsx
│   │   └── History.tsx
│   ├── services/
│   │   ├── claudeService.ts
│   │   └── supabaseClient.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env
```

Copy all the TypeScript files I provided into their respective locations.

### Step 5: Additional Config Files

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**postcss.config.js**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**src/main.tsx**:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**src/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**index.html**:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AgroScan AI - Crop Disease Detection</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 6: Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

---

## 🎨 Design Features

- **Earthy Colors**: Green, amber, orange tones for agricultural feel
- **Mobile-Optimized**: Large touch targets, bottom navigation
- **Camera Access**: Direct camera capture on mobile devices
- **Offline-Ready**: Images stored as base64 in database
- **Responsive**: Works on phones, tablets, and desktop

---

## 🚀 Usage

1. **Login**: Enter your farmer name
2. **Scan**: Tap camera icon to capture crop photo
3. **Analyze**: Click "Analyze Crop Health"
4. **View Results**: See crop type, disease, treatment, prevention
5. **History**: View all past inspections

---

## 📱 Production Deployment

### Important: Backend API Required

⚠️ **Security Warning**: The current setup uses `dangerouslyAllowBrowser: true` for Claude API, which exposes your API key in the browser. This is ONLY for development.

**For production, you MUST**:
1. Create a backend API (Node.js/Express, Python/Flask, etc.)
2. Move API calls to the backend
3. Never expose your Claude API key in frontend code

---

## 🐛 Troubleshooting

**App won't start?**
- Check `.env` file exists and has all 3 variables
- Verify API keys are correct (no spaces)
- Run `npm install` again

**Analysis fails?**
- Check Claude API key is valid
- Ensure you have API credits
- Verify image is clear and shows crops

**Database errors?**
- Confirm Supabase SQL schema was run
- Check Supabase URL and key are correct
- Verify table name is `inspections`

---

## 📄 License

MIT - Free to use for agricultural purposes
