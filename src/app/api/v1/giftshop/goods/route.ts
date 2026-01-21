import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";

type SortOption = "price_asc" | "price_desc" | "name_asc" | "discount_desc";

function getSortOrder(sort: SortOption): string {
  switch (sort) {
    case "price_asc":
      return "discount_price ASC";
    case "price_desc":
      return "discount_price DESC";
    case "name_asc":
      return "goods_name ASC";
    case "discount_desc":
      return "discount_rate DESC";
    default:
      return "discount_price ASC";
  }
}

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

    const conditions: string[] = ["is_active = true", "goods_state_cd = 'SALE'"];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (brand) {
      conditions.push(`(brand_code = $${paramIndex} OR brand_name ILIKE $${paramIndex + 1})`);
      params.push(brand, `%${brand}%`);
      paramIndex += 2;
    }

    if (search) {
      conditions.push(
        `(goods_name ILIKE $${paramIndex} OR brand_name ILIKE $${paramIndex} OR srch_keyword ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex += 1;
    }

    if (minPrice) {
      conditions.push(`discount_price >= $${paramIndex}`);
      params.push(parseInt(minPrice, 10));
      paramIndex += 1;
    }

    if (maxPrice) {
      conditions.push(`discount_price <= $${paramIndex}`);
      params.push(parseInt(maxPrice, 10));
      paramIndex += 1;
    }

    if (category) {
      conditions.push(`category1_seq = $${paramIndex}`);
      params.push(parseInt(category, 10));
      paramIndex += 1;
    }

    const whereClause = conditions.join(" AND ");
    const sortOrder = getSortOrder(sort);
    const offset = (page - 1) * size;

    const goodsQuery = `
      SELECT DISTINCT ON (goods_name, brand_name)
        goods_code, goods_name, brand_code, brand_name, brand_icon_img,
        goods_img_s, goods_img_b, sale_price, discount_price, discount_rate,
        limit_day, goods_type_dtl_nm, affiliate, category1_seq
      FROM giftishow_goods
      WHERE ${whereClause}
      ORDER BY goods_name, brand_name, synced_at DESC
    `;

    const paginatedQuery = `
      SELECT * FROM (${goodsQuery}) AS unique_goods
      ORDER BY ${sortOrder}
      LIMIT ${size} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM (${goodsQuery}) AS unique_goods
    `;

    const [goods, countResult] = await Promise.all([
      prisma.$queryRawUnsafe<
        Array<{
          goods_code: string;
          goods_name: string;
          brand_code: string;
          brand_name: string;
          brand_icon_img: string | null;
          goods_img_s: string | null;
          goods_img_b: string | null;
          sale_price: number;
          discount_price: number;
          discount_rate: number;
          limit_day: number;
          goods_type_dtl_nm: string | null;
          affiliate: string | null;
          category1_seq: number | null;
        }>
      >(paginatedQuery, ...params),
      prisma.$queryRawUnsafe<Array<{ total: bigint }>>(countQuery, ...params),
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    const formattedGoods = goods.map((g) => ({
      goodsCode: g.goods_code,
      goodsName: g.goods_name,
      brandCode: g.brand_code,
      brandName: g.brand_name,
      brandIconImg: g.brand_icon_img,
      goodsImgS: g.goods_img_s || g.goods_img_b,
      goodsImgB: g.goods_img_b || g.goods_img_s,
      salePrice: g.sale_price,
      discountPrice: g.discount_price,
      discountRate: g.discount_rate,
      limitDay: g.limit_day,
      goodsTypeDtlNm: g.goods_type_dtl_nm,
      affiliate: g.affiliate,
      category: g.category1_seq,
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
