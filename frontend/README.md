# Frontend Deployment (Vercel)

## Required Environment Variable

Set this in Vercel Project Settings -> Environment Variables:

- `VITE_API_BASE_URL`
  - Example: `https://your-backend-domain.vercel.app/api`

## Vercel Project Settings

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## Notes

- This project is configured as an SPA with rewrite rules in `frontend/vercel.json`.
- Only variables prefixed with `VITE_` are available in frontend runtime.
