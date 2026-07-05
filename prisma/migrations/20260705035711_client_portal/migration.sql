-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "portalAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "portalAccessExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClientPortalSession" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientPortalSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClientPortalSession" ADD CONSTRAINT "ClientPortalSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
