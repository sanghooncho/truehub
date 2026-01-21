import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getGiftishowClient,
  getGiftishowErrorMessage,
  isGiftishowMockMode,
  MOCK_GOODS_LIST,
  GoodsItem,
} from "@/lib/giftishow";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTH_INVALID_TOKEN", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "20", 10);
    const brand = searchParams.get("brand") || "";
    const search = searchParams.get("search") || "";
    const maxPrice = searchParams.get("maxPrice");

    let goods: GoodsItem[];
    let total: number;

    if (isGiftishowMockMode()) {
      goods = [...MOCK_GOODS_LIST];
      total = goods.length;
    } else {
      const client = getGiftishowClient();
      const response = await client.getGoodsList(page, size);

      if (response.code !== "0000") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: response.code,
              message: getGiftishowErrorMessage(response.code),
            },
          },
          { status: 400 }
        );
      }

      goods = response.result?.goodsList || [];
      total = response.result?.listNum || 0;
    }

    if (brand) {
      goods = goods.filter((g) => g.brandCode === brand);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      goods = goods.filter(
        (g) =>
          g.goodsName.toLowerCase().includes(searchLower) ||
          g.brandName.toLowerCase().includes(searchLower) ||
          g.srchKeyword?.toLowerCase().includes(searchLower)
      );
    }

    if (maxPrice) {
      const max = parseInt(maxPrice, 10);
      goods = goods.filter((g) => g.discountPrice <= max);
    }

    goods = goods.filter((g) => g.goodsStateCd === "SALE");

    const formattedGoods = goods.map((g) => ({
      goodsCode: g.goodsCode,
      goodsName: g.goodsName,
      brandCode: g.brandCode,
      brandName: g.brandName,
      brandIconImg: g.brandIconImg,
      goodsImgS: g.goodsImgS,
      goodsImgB: g.goodsImgB,
      salePrice: g.salePrice,
      discountPrice: g.discountPrice,
      discountRate: g.discountRate,
      limitDay: g.limitDay,
      goodsTypeDtlNm: g.goodsTypeDtlNm,
      affiliate: g.affiliate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        goods: formattedGoods,
        total,
        page,
        size,
      },
    });
  } catch (error) {
    console.error("GiftShop goods list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "상품 목록을 불러오는데 실패했습니다" },
      },
      { status: 500 }
    );
  }
}
