# Frontend Deployment (Vercel)

## Required Environment Variable

Set this in Vercel Project Settings -> Environment Variables:

- `VITE_API_BASE_URL`
  - Production value: `https://splitbuddy-frmt.onrender.com/api`

## Simple Localhost/Production Switch

- Local development uses `frontend/.env.development`:
  - `VITE_API_BASE_URL=http://localhost:5000/api`
- Production build uses `frontend/.env.production`:
  - `VITE_API_BASE_URL=https://splitbuddy-frmt.onrender.com/api`
- For Vercel, set `VITE_API_BASE_URL` in Project Settings (Environment Variables). Vercel value overrides local files.

## Vercel Project Settings

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## Notes

- This project is configured as an SPA with rewrite rules in `frontend/vercel.json`.
- Only variables prefixed with `VITE_` are available in frontend runtime.
