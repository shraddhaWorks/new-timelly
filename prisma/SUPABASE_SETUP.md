# Supabase: Create schema (tables) in your project

If you don’t see any tables in the Supabase Dashboard (Table Editor), the Prisma schema hasn’t been applied yet. Apply it with migrations.

## 1. Use the direct database URL for migrations

Your `.env` should have:

- **DATABASE_URL** – pooler URL (port **6543**) for the app.
- **DIRECT_URL** – direct URL (port **5432**) for migrations.

`prisma.config.ts` is set to use **DIRECT_URL** when running Prisma CLI commands (e.g. migrate), so migrations run against the direct connection. The app keeps using **DATABASE_URL** (pooler).

## 2. Apply all migrations (create tables)

From the project root:

```bash
npx prisma migrate deploy
```

This applies every migration in `prisma/migrations/` and creates all tables in the `public` schema in Supabase. It can take 1–2 minutes.

## 3. Confirm in Supabase

In the Supabase Dashboard:

- **Table Editor** – you should see tables like `User`, `School`, `Class`, `Student`, `Event`, etc.
- **SQL Editor** – you can run `SELECT * FROM "User" LIMIT 1;` (use double quotes for Prisma’s quoted names).

## If something goes wrong

- **“Connection” or timeout**  
  Use the **Direct** connection string from Supabase (Dashboard → Project Settings → Database → “Connection string” → **Direct**, port 5432). Put it in `.env` as **DIRECT_URL** and run `npx prisma migrate deploy` again.

- **“Migration failed” or “already applied”**  
  If the database was partly migrated before, you may need to either fix the failing migration or, only on a throwaway DB, use:

  ```bash
  npx prisma db push
  ```

  `db push` applies the current `schema.prisma` to the database without using migration history. Prefer `migrate deploy` when possible.

- **Empty DB and you want a clean start**  
  For a new Supabase project with no data, `npx prisma migrate deploy` is the right command; it will create the `_prisma_migrations` table and all app tables.
