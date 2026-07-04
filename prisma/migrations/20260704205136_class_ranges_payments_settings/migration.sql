-- AlterTable
ALTER TABLE "ClassAnnouncement" ADD COLUMN     "endsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chartStyle" TEXT NOT NULL DEFAULT 'south',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light',
ADD COLUMN     "useTrueNodes" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ClassPayment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "contact" TEXT,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClassPayment" ADD CONSTRAINT "ClassPayment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassAnnouncement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
