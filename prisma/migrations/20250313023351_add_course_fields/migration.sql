/*
  Warnings:

  - Added the required column `duration` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referralBonus` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "referralBonus" JSONB NOT NULL,
ADD COLUMN     "stipend" JSONB;
