/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `proofImageUrl` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "transactionId" TEXT NOT NULL,
ALTER COLUMN "proofImageUrl" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "ReferralStats_earnings_idx" ON "ReferralStats"("earnings");

-- CreateIndex
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");
