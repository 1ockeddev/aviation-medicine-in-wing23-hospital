/*
  Warnings:

  - The `status` column on the `medications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "medications" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Y';

-- DropEnum
DROP TYPE "MedicationStatus";
