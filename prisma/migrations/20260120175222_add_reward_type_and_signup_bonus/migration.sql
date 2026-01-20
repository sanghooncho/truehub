-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('PARTICIPATION', 'SIGNUP_BONUS', 'REFERRAL_BONUS');

-- DropForeignKey
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_participation_id_fkey";

-- AlterTable
ALTER TABLE "rewards" ADD COLUMN     "type" "RewardType" NOT NULL DEFAULT 'PARTICIPATION',
ALTER COLUMN "participation_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "rewards_type_idx" ON "rewards"("type");

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "participations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
