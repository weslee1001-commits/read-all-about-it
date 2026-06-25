Backend deployment notes

Railway setup quick steps

1. Create a Railway project and add a PostgreSQL plugin.
2. Add repo and set deploy command to `npm run start` or use the `Dockerfile`.
3. Set env vars in Railway:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `AFFILIATE_REDIRECT_SECRET`
   - `OPENAI_API_KEY` (optional)
4. Ensure Prisma client is generated during build: run `npx prisma generate`.
5. Run migrations: `npx prisma migrate deploy`.

Render (alternative)
- Create a Web Service, connect repo, set `backend` folder as root; add env vars and persistent Postgres.
