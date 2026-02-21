-- AlterTable NewsFeed: Add photo, photos, and likes (schema expects these)
ALTER TABLE "NewsFeed" ADD COLUMN IF NOT EXISTS "likes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "NewsFeed" ADD COLUMN IF NOT EXISTS "photo" TEXT;
ALTER TABLE "NewsFeed" ADD COLUMN IF NOT EXISTS "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill photo from mediaUrl if mediaUrl exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='NewsFeed' AND column_name='mediaUrl') THEN
    UPDATE "NewsFeed" SET "photo" = COALESCE("photo", "mediaUrl") WHERE "mediaUrl" IS NOT NULL;
  END IF;
END $$;
