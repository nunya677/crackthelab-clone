-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paypalSubscriptionId" TEXT,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planRenewsAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_paypalSubscriptionId_key" ON "User"("paypalSubscriptionId");

