/**
 * 기프티쇼 상품 DB 동기화 핸들러
 *
 * 기프티쇼 API에서 전체 상품 목록을 가져와 DB에 upsert합니다.
 * API 문서에 따르면 카테고리별 검색을 지원하지 않으므로,
 * 모든 상품을 가져와 DB에 저장 후 원하는 상품을 검색해서 사용해야 합니다.
 */

import { prisma } from "@/infra/db/prisma";
import { getGiftishowClient, GoodsItem } from "@/lib/giftishow";

export interface GiftishowSyncPayload {
  forceFullSync?: boolean;
}

export interface GiftishowSyncResult {
  totalFetched: number;
  inserted: number;
  updated: number;
  deactivated: number;
  errors: string[];
}

const PAGE_SIZE = 100;

/**
 * 기프티쇼 API에서 전체 상품 목록을 페이지네이션으로 가져옴
 */
async function fetchAllGoods(): Promise<GoodsItem[]> {
  const client = getGiftishowClient();
  const allGoods: GoodsItem[] = [];

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await client.getGoodsList(page, PAGE_SIZE);

      if (response.code !== "0000" || !response.result) {
        console.error(`Failed to fetch goods page ${page}:`, response.message);
        break;
      }

      const { goodsList, listNum } = response.result;
      allGoods.push(...goodsList);

      console.log(
        `Fetched page ${page}: ${goodsList.length} items (total: ${allGoods.length}/${listNum})`
      );

      if (allGoods.length >= listNum || goodsList.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }

      // Rate limiting - 100ms 대기
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching goods page ${page}:`, error);
      break;
    }
  }

  return allGoods;
}

/**
 * 상품 데이터를 DB에 upsert
 */
async function upsertGoods(goods: GoodsItem[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  // 배치 처리 (50개씩)
  const batchSize = 50;
  for (let i = 0; i < goods.length; i += batchSize) {
    const batch = goods.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (item) => {
        const existing = await prisma.giftishowGoods.findUnique({
          where: { goodsCode: item.goodsCode },
          select: { goodsCode: true },
        });

        await prisma.giftishowGoods.upsert({
          where: { goodsCode: item.goodsCode },
          create: {
            goodsCode: item.goodsCode,
            goodsNo: item.goodsNo,
            goodsName: item.goodsName,
            brandCode: item.brandCode,
            brandName: item.brandName,
            brandIconImg: item.brandIconImg || null,
            content: item.content || null,
            contentAddDesc: item.contentAddDesc || null,
            goodsImgS: item.goodsImgS || null,
            goodsImgB: item.goodsImgB || null,
            realPrice: item.realPrice,
            salePrice: item.salePrice,
            discountPrice: item.discountPrice,
            discountRate: item.discountRate,
            limitDay: item.limitDay,
            goodsTypeNm: item.goodsTypeNm || null,
            goodsTypeDtlNm: item.goodsTypeDtlNm || null,
            affiliate: item.affiliate || null,
            goodsStateCd: item.goodsStateCd,
            category1Seq: item.category1Seq || null,
            srchKeyword: item.srchKeyword || null,
            endDate: item.endDate || null,
            isActive: true,
            syncedAt: new Date(),
          },
          update: {
            goodsNo: item.goodsNo,
            goodsName: item.goodsName,
            brandCode: item.brandCode,
            brandName: item.brandName,
            brandIconImg: item.brandIconImg || null,
            content: item.content || null,
            contentAddDesc: item.contentAddDesc || null,
            goodsImgS: item.goodsImgS || null,
            goodsImgB: item.goodsImgB || null,
            realPrice: item.realPrice,
            salePrice: item.salePrice,
            discountPrice: item.discountPrice,
            discountRate: item.discountRate,
            limitDay: item.limitDay,
            goodsTypeNm: item.goodsTypeNm || null,
            goodsTypeDtlNm: item.goodsTypeDtlNm || null,
            affiliate: item.affiliate || null,
            goodsStateCd: item.goodsStateCd,
            category1Seq: item.category1Seq || null,
            srchKeyword: item.srchKeyword || null,
            endDate: item.endDate || null,
            isActive: true,
            syncedAt: new Date(),
          },
        });

        if (existing) {
          updated++;
        } else {
          inserted++;
        }
      })
    );

    console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} items`);
  }

  return { inserted, updated };
}

/**
 * API에서 더 이상 제공되지 않는 상품을 비활성화
 */
async function deactivateRemovedGoods(activeGoodsCodes: string[]): Promise<number> {
  const result = await prisma.giftishowGoods.updateMany({
    where: {
      goodsCode: { notIn: activeGoodsCodes },
      isActive: true,
    },
    data: {
      isActive: false,
      syncedAt: new Date(),
    },
  });

  return result.count;
}

/**
 * 기프티쇼 상품 동기화 실행
 */
export async function syncGiftishowGoods(
  payload: GiftishowSyncPayload = {}
): Promise<GiftishowSyncResult> {
  const errors: string[] = [];
  let totalFetched = 0;
  let inserted = 0;
  let updated = 0;
  let deactivated = 0;

  try {
    console.log("Starting Giftishow goods sync...");

    const allGoods = await fetchAllGoods();
    totalFetched = allGoods.length;
    console.log(`Fetched ${totalFetched} goods from Giftishow API`);

    if (allGoods.length === 0) {
      errors.push("No goods fetched from API");
      return { totalFetched, inserted, updated, deactivated, errors };
    }

    const upsertResult = await upsertGoods(allGoods);
    inserted = upsertResult.inserted;
    updated = upsertResult.updated;
    console.log(`Upserted goods: ${inserted} inserted, ${updated} updated`);

    const activeGoodsCodes = allGoods.map((g) => g.goodsCode);
    deactivated = await deactivateRemovedGoods(activeGoodsCodes);
    console.log(`Deactivated ${deactivated} removed goods`);

    console.log("Giftishow goods sync completed successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(message);
    console.error("Giftishow goods sync failed:", error);
  }

  return { totalFetched, inserted, updated, deactivated, errors };
}
