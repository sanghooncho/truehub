import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/prisma";
import { getAdvertiserFromRequest } from "@/lib/advertiser-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const advertiser = await getAdvertiserFromRequest(request);
    if (!advertiser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        advertiserId: true,
        status: true,
        targetCount: true,
        creditCostPerValid: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMP_NOT_FOUND",
            message: "Campaign not found",
          },
        },
        { status: 404 }
      );
    }

    if (campaign.advertiserId !== advertiser.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to publish this campaign",
          },
        },
        { status: 403 }
      );
    }

    if (campaign.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMP_INVALID_STATUS",
            message: "Only draft campaigns can be published",
          },
        },
        { status: 400 }
      );
    }

    const requiredCredits = campaign.targetCount * campaign.creditCostPerValid;
    if (advertiser.creditBalance < requiredCredits) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CRED_INSUFFICIENT",
            message: `Insufficient credits. Required: ${requiredCredits.toLocaleString()}, Available: ${advertiser.creditBalance.toLocaleString()}`,
          },
        },
        { status: 400 }
      );
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "RUNNING",
        startAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        status: "RUNNING",
        message: "Campaign is now live.",
      },
    });
  } catch (error) {
    console.error("Campaign publish error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to publish campaign",
        },
      },
      { status: 500 }
    );
  }
}
