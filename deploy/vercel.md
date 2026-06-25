# Vercel deployment (web)

1. Sign in to Vercel and import this GitHub repository.
2. When creating the project, set the root directory to `web`.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Add environment variables (Project Settings -> Environment Variables):
   - `VITE_API_URL` — URL of your backend (e.g. `https://your-backend.up.railway.app`).
5. Deploy; Vercel will provide a public URL.

Notes:
- If you want redirects from your web app to the backend affiliate endpoints, build client-side links that call `${VITE_API_URL}/affiliate/redirect?url=...`.
