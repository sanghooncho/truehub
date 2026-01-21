import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGiftishowClient, getGiftishowErrorMessage } from "@/lib/giftishow";

export async function GET() {
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

    const client = getGiftishowClient();
    const response = await client.getBrandList();

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

    const brands = response.result?.brandList || [];

    const formattedBrands = brands.map((b) => ({
      brandCode: b.brandCode,
      brandName: b.brandName,
      brandIconImg: b.brandIconImg,
      mmsThumImg: b.mmsThumImg,
      category1Name: b.category1Name,
      category1Seq: b.category1Seq,
    }));

    return NextResponse.json({
      success: true,
      data: {
        brands: formattedBrands,
        total: response.result?.listNum || 0,
      },
    });
  } catch (error) {
    console.error("GiftShop brands list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "브랜드 목록을 불러오는데 실패했습니다" },
      },
      { status: 500 }
    );
  }
}
