/*
  Warnings:

  - You are about to drop the column `fdaApproved` on the `medications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('Y', 'N', 'NA');

-- AlterTable
ALTER TABLE "medications" DROP COLUMN "fdaApproved",
ADD COLUMN     "status" "MedicationStatus" NOT NULL DEFAULT 'NA';

-- DropEnum
DROP TYPE "FdaStatus";
