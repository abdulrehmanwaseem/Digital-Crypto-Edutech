-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "referralBonus" JSONB,
ADD COLUMN     "stipend" JSONB;
