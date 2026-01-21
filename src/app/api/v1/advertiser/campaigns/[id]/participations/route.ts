import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, advertiserId: advertiser.id },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    const [participations, total] = await Promise.all([
      prisma.participation.findMany({
        where: {
          campaignId,
          status: "APPROVED",
        },
        include: {
          user: { select: { id: true, profileName: true } },
          assets: { select: { id: true, storageKey: true, slot: true }, orderBy: { slot: "asc" } },
        },
        orderBy: { reviewedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.participation.count({
        where: { campaignId, status: "APPROVED" },
      }),
    ]);

    const items = participations.map((p) => ({
      id: p.id,
      tester: {
        id: p.user.id,
        name: p.user.profileName || "익명 테스터",
      },
      answer1: p.answer1,
      answer2: p.answer2,
      feedback: p.feedback,
      approvedAt: p.reviewedAt?.toISOString() || null,
      submittedAt: p.submittedAt.toISOString(),
      screenshots: p.assets.map((a) => ({
        id: a.id,
        slot: a.slot,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/screenshots/${a.storageKey}`,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Fetch campaign participations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch participations" },
      },
      { status: 500 }
    );
  }
}
