-- CreateEnum
CREATE TYPE "HighlightType" AS ENUM ('HERO_SLIDE', 'STORY_CIRCLE');

-- CreateTable
CREATE TABLE "BannerHighlight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "type" "HighlightType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerHighlight_pkey" PRIMARY KEY ("id")
);
