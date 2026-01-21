import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { Prisma } from "@prisma/client";

type SortOption = "price_asc" | "price_desc" | "name_asc" | "discount_desc";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const size = Math.min(100, Math.max(1, parseInt(searchParams.get("size") || "20", 10)));
    const brand = searchParams.get("brand") || "";
    const search = searchParams.get("search") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = (searchParams.get("sort") || "price_asc") as SortOption;
    const category = searchParams.get("category");

    const where: Prisma.GiftishowGoodsWhereInput = {
      isActive: true,
      goodsStateCd: "SALE",
    };

    if (brand) {
      where.OR = [{ brandCode: brand }, { brandName: { contains: brand, mode: "insensitive" } }];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { goodsName: { contains: search, mode: "insensitive" } },
            { brandName: { contains: search, mode: "insensitive" } },
            { srchKeyword: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (minPrice || maxPrice) {
      where.discountPrice = {};
      if (minPrice) {
        where.discountPrice.gte = parseInt(minPrice, 10);
      }
      if (maxPrice) {
        where.discountPrice.lte = parseInt(maxPrice, 10);
      }
    }

    if (category) {
      where.category1Seq = parseInt(category, 10);
    }

    const orderBy: Prisma.GiftishowGoodsOrderByWithRelationInput = (() => {
      switch (sort) {
        case "price_asc":
          return { discountPrice: "asc" as const };
        case "price_desc":
          return { discountPrice: "desc" as const };
        case "name_asc":
          return { goodsName: "asc" as const };
        case "discount_desc":
          return { discountRate: "desc" as const };
        default:
          return { discountPrice: "asc" as const };
      }
    })();

    const [goods, total] = await Promise.all([
      prisma.giftishowGoods.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
        select: {
          goodsCode: true,
          goodsName: true,
          brandCode: true,
          brandName: true,
          brandIconImg: true,
          goodsImgS: true,
          goodsImgB: true,
          salePrice: true,
          discountPrice: true,
          discountRate: true,
          limitDay: true,
          goodsTypeDtlNm: true,
          affiliate: true,
          category1Seq: true,
        },
      }),
      prisma.giftishowGoods.count({ where }),
    ]);

    const formattedGoods = goods.map((g) => ({
      goodsCode: g.goodsCode,
      goodsName: g.goodsName,
      brandCode: g.brandCode,
      brandName: g.brandName,
      brandIconImg: g.brandIconImg,
      goodsImgS: g.goodsImgS || g.goodsImgB,
      goodsImgB: g.goodsImgB || g.goodsImgS,
      salePrice: g.salePrice,
      discountPrice: g.discountPrice,
      discountRate: g.discountRate,
      limitDay: g.limitDay,
      goodsTypeDtlNm: g.goodsTypeDtlNm,
      affiliate: g.affiliate,
      category: g.category1Seq,
    }));

    return NextResponse.json({
      success: true,
      data: {
        goods: formattedGoods,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
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
