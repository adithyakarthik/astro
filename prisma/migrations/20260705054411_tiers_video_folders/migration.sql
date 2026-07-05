-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'SILVER';

-- AlterTable
ALTER TABLE "VideoContent" ADD COLUMN     "folderId" TEXT;

-- CreateTable
CREATE TABLE "VideoFolder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoFolderAccess" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoFolderAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoFolderAccess_folderId_clientId_key" ON "VideoFolderAccess"("folderId", "clientId");

-- AddForeignKey
ALTER TABLE "VideoContent" ADD CONSTRAINT "VideoContent_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "VideoFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoFolder" ADD CONSTRAINT "VideoFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoFolderAccess" ADD CONSTRAINT "VideoFolderAccess_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "VideoFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoFolderAccess" ADD CONSTRAINT "VideoFolderAccess_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
