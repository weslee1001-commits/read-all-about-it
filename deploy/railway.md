# Railway deployment (backend)

1. Create a Railway project and add a PostgreSQL plugin.
2. Connect the repository and set the root for the service to `backend`.
3. Railway will detect a Node service; set the start command to `npm run start` or use the provided `Dockerfile`.
4. Add the following environment variables in Railway -> Variables:
   - `DATABASE_URL` — provided by the PostgreSQL plugin (or your external DB URL)
   - `JWT_SECRET` — a secure random string
   - `AFFILIATE_REDIRECT_SECRET` — optional
   - `OPENAI_API_KEY` — optional (for AI integration)
5. Ensure build commands run `npx prisma generate` and `npx prisma migrate deploy`. You can add these to the build step in Railway.
6. Deploy; Railway will give you the backend URL which you should paste into Vercel's `VITE_API_URL`.
