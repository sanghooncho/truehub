-- CreateEnum
CREATE TYPE "GiftExchangeStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "JobType" ADD VALUE 'GIFT_EXCHANGE';

-- CreateTable
CREATE TABLE "gift_exchanges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "goods_code" TEXT NOT NULL,
    "goods_name" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "goods_image_url" TEXT,
    "amount" INTEGER NOT NULL,
    "discount_price" INTEGER NOT NULL,
    "points_used" INTEGER NOT NULL,
    "phone_number" TEXT NOT NULL,
    "tr_id" TEXT NOT NULL,
    "order_no" TEXT,
    "pin_no" TEXT,
    "coupon_image_url" TEXT,
    "status" "GiftExchangeStatus" NOT NULL DEFAULT 'PENDING',
    "send_method" TEXT NOT NULL DEFAULT 'N',
    "giftishow_code" TEXT,
    "giftishow_msg" TEXT,
    "valid_until" TIMESTAMP(3),
    "fail_reason" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_exchanges_tr_id_key" ON "gift_exchanges"("tr_id");

-- CreateIndex
CREATE INDEX "gift_exchanges_user_id_idx" ON "gift_exchanges"("user_id");

-- CreateIndex
CREATE INDEX "gift_exchanges_status_idx" ON "gift_exchanges"("status");

-- CreateIndex
CREATE INDEX "gift_exchanges_tr_id_idx" ON "gift_exchanges"("tr_id");

-- AddForeignKey
ALTER TABLE "gift_exchanges" ADD CONSTRAINT "gift_exchanges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
