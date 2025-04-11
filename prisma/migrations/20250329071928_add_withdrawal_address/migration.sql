/*
  Warnings:

  - You are about to drop the column `duration` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `referralBonus` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `stipend` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `processingError` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `proofImageUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `referralCode` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `achievements` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `activities` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Referral` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferralStats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SiteSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalletTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Withdrawal` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_referralCode_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReferralStats" DROP CONSTRAINT "ReferralStats_userId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_walletId_fkey";

-- DropForeignKey
ALTER TABLE "Withdrawal" DROP CONSTRAINT "Withdrawal_userId_fkey";

-- DropForeignKey
ALTER TABLE "Withdrawal" DROP CONSTRAINT "Withdrawal_walletId_fkey";

-- DropIndex
DROP INDEX "Account_userId_idx";

-- DropIndex
DROP INDEX "Course_title_idx";

-- DropIndex
DROP INDEX "Payment_courseId_idx";

-- DropIndex
DROP INDEX "Payment_referralCode_key";

-- DropIndex
DROP INDEX "Payment_status_idx";

-- DropIndex
DROP INDEX "Payment_transactionId_key";

-- DropIndex
DROP INDEX "Payment_userId_idx";

-- DropIndex
DROP INDEX "Profile_userId_idx";

-- DropIndex
DROP INDEX "Session_userId_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_referralCode_idx";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "duration",
DROP COLUMN "imageUrl",
DROP COLUMN "published",
DROP COLUMN "referralBonus",
DROP COLUMN "stipend",
ALTER COLUMN "features" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "currency",
DROP COLUMN "processedAt",
DROP COLUMN "processingError",
DROP COLUMN "proofImageUrl",
DROP COLUMN "referralCode",
DROP COLUMN "transactionId",
ADD COLUMN     "proofUrl" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "achievements",
DROP COLUMN "activities",
ALTER COLUMN "bio" DROP DEFAULT,
ALTER COLUMN "location" DROP DEFAULT,
ALTER COLUMN "avatar" DROP DEFAULT,
ALTER COLUMN "twitter" DROP DEFAULT,
ALTER COLUMN "telegram" DROP DEFAULT,
ALTER COLUMN "website" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "hashedPassword" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "incomeRange" TEXT,
ADD COLUMN     "occupationType" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "referralCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "withdrawalAddress" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "occupation" DROP NOT NULL,
ALTER COLUMN "occupation" DROP DEFAULT;

-- DropTable
DROP TABLE "Enrollment";

-- DropTable
DROP TABLE "Referral";

-- DropTable
DROP TABLE "ReferralStats";

-- DropTable
DROP TABLE "SiteSettings";

-- DropTable
DROP TABLE "Wallet";

-- DropTable
DROP TABLE "WalletTransaction";

-- DropTable
DROP TABLE "Withdrawal";

-- DropEnum
DROP TYPE "EnrollmentStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "TransactionStatus";

-- DropEnum
DROP TYPE "TransactionType";

-- DropEnum
DROP TYPE "WithdrawalStatus";

-- CreateTable
CREATE TABLE "_CourseToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToUser_B_index" ON "_CourseToUser"("B");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToUser" ADD CONSTRAINT "_CourseToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToUser" ADD CONSTRAINT "_CourseToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update null payment status to 'PENDING'
UPDATE "Payment" SET status = 'PENDING' WHERE status IS NULL;

-- Convert payment status to string
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE TEXT USING status::TEXT;
