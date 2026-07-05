-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'SILVER';

-- AlterTable
ALTER TABLE "VideoContent" ADD COLUMN     "allowedTiers" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "VideoFolder" ADD COLUMN     "allowedTiers" TEXT[] DEFAULT ARRAY[]::TEXT[];
