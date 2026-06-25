Deployment guide
----------------

Recommended targets:
- Web: Vercel (Vite app)
- Backend: Railway (Express + Postgres) or Render

Steps (high level):

1. Backend (Railway)
  - Create a Railway project and add a PostgreSQL plugin.
  - Set environment variables on Railway: `DATABASE_URL`, `JWT_SECRET`, `AFFILIATE_REDIRECT_SECRET`, any `AFFILIATE_*` IDs, and `OPENAI_API_KEY` if used.
  - Connect the GitHub repo or deploy via Docker using the `backend/Dockerfile`.
  - Run `npx prisma generate` and `npx prisma migrate deploy` in a Railway build step or run migrations manually.

2. Web (Vercel)
  - Create a Vercel project from the GitHub repo and set the root to the `web` folder.
  - Set environment variable `REACT_APP_API_URL` or update the web `API` constant to point to your deployed backend.
  - Deploy; Vercel will provide a public URL.

3. Domain
  - Add a custom domain in Vercel and configure DNS as instructed.

Notes:
- For quick local testing use SQLite by changing the `prisma/schema.prisma` datasource to `provider = "sqlite"` and `url = "file:./dev.db"` then run `npx prisma migrate dev --name init`.
- If you want, I can open a PR that switches `schema.prisma` to SQLite for dev and keeps Postgres as production only.
