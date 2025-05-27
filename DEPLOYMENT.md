# Deployment Checklist

## Before Pushing to GitHub:

1. **Environment Variables**
   - [ ] App.js uses `process.env.REACT_APP_API_URL` (not hardcoded URLs)
   - [ ] No API keys or secrets in code
   - [ ] .env files are in .gitignore

2. **Test Locally**
   - [ ] Frontend runs on http://localhost:3000
   - [ ] Backend runs on http://localhost:5000
   - [ ] Chat functionality works

3. **Dependencies**
   - [ ] All packages in package.json are needed
   - [ ] No experimental or local-only packages

## Deployment Configuration:

### Frontend (Vercel/Netlify/Render):
Set environment variable:
```
REACT_APP_API_URL = https://atd-webapp-v4.onrender.com
```

Build command: `npm run build`
Publish directory: `build`

### Backend (Render):
Environment variables:
```
OPENAI_API_KEY = your-key-here
NODE_ENV = production
```

Build command: `npm install`
Start command: `node server.js`

## Post-Deployment Verification:

1. [ ] Visit production URL
2. [ ] Test chat functionality
3. [ ] Check browser console for errors
4. [ ] Verify API calls go to production backend
