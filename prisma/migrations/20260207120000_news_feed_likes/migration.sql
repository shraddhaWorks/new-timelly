-- CreateTable
CREATE TABLE "NewsFeedLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newsFeedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsFeedLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsFeedLike_newsFeedId_idx" ON "NewsFeedLike"("newsFeedId");

-- CreateIndex
CREATE INDEX "NewsFeedLike_userId_idx" ON "NewsFeedLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsFeedLike_userId_newsFeedId_key" ON "NewsFeedLike"("userId", "newsFeedId");

-- AddForeignKey
ALTER TABLE "NewsFeedLike" ADD CONSTRAINT "NewsFeedLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsFeedLike" ADD CONSTRAINT "NewsFeedLike_newsFeedId_fkey" FOREIGN KEY ("newsFeedId") REFERENCES "NewsFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
