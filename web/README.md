# Web (Vite + React)

Quick start:

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173` and ensure the backend is running at `http://localhost:4000`.

Environment variables (for Vercel):
- `VITE_API_URL` — public backend URL (e.g. `https://your-backend.up.railway.app`)
- `VITE_AMAZON_ASSOCIATE_ID` — (optional) your Amazon Associate ID
- `VITE_WALMART_ASSOCIATE_ID` — (optional) your Walmart affiliate ID

Admin page:
- Visit `/admin.html` to open the admin dashboard. Provide the admin token (from `/auth/register` response) and click "Save & Refresh" to load pending AI drafts.
