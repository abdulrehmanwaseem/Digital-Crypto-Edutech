/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_referralCode_key" ON "Payment"("referralCode");
