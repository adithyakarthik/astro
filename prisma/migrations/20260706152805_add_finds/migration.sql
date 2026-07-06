-- AlterTable
ALTER TABLE "User" ALTER COLUMN "enabledModules" SET DEFAULT '["clients","matchmaking","muhurta","transits","videos","classes","finds"]';

-- CreateTable
CREATE TABLE "Find" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "heading" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shopName" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Find_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindPhoto" (
    "id" TEXT NOT NULL,
    "findId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FindPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Find_userId_idx" ON "Find"("userId");

-- CreateIndex
CREATE INDEX "Find_userId_heading_idx" ON "Find"("userId", "heading");

-- AddForeignKey
ALTER TABLE "Find" ADD CONSTRAINT "Find_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindPhoto" ADD CONSTRAINT "FindPhoto_findId_fkey" FOREIGN KEY ("findId") REFERENCES "Find"("id") ON DELETE CASCADE ON UPDATE CASCADE;
