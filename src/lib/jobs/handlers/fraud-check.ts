import { FraudDecision, ParticipationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/infra/db/prisma";
import { findSimilarImages } from "./phash";
import { findDuplicateImages } from "./sha256";

export interface FraudCheckPayload {
  participationId: string;
}

interface FraudSignalInput {
  signalType: string;
  signalValue: string;
  score: number;
  details?: Record<string, unknown>;
}

const SIGNAL_WEIGHTS = {
  DUPLICATE_IMAGE: 50,
  SIMILAR_IMAGE: 25,
  SAME_DEVICE: 20,
  RAPID_SUBMISSION: 15,
  BANNED_USER: 100,
  SHORT_FEEDBACK: 10,
  DUPLICATE_FEEDBACK: 30,
};

export async function calculateFraudScore(
  payload: FraudCheckPayload
): Promise<{ score: number; decision: FraudDecision; signals: FraudSignalInput[] }> {
  const participation = await prisma.participation.findUnique({
    where: { id: payload.participationId },
    include: {
      user: true,
      campaign: true,
      assets: true,
    },
  });

  if (!participation) {
    throw new Error("Participation not found");
  }

  const signals: FraudSignalInput[] = [];

  if (participation.user.isBanned) {
    signals.push({
      signalType: "BANNED_USER",
      signalValue: participation.user.id,
      score: SIGNAL_WEIGHTS.BANNED_USER,
    });
  }

  for (const asset of participation.assets) {
    if (asset.sha256) {
      const duplicates = await findDuplicateImages(asset.sha256, asset.id);
      if (duplicates.length > 0) {
        signals.push({
          signalType: "DUPLICATE_IMAGE",
          signalValue: asset.id,
          score: SIGNAL_WEIGHTS.DUPLICATE_IMAGE,
          details: { duplicateCount: duplicates.length, duplicateIds: duplicates },
        });
      }
    }

    if (asset.phash) {
      const similar = await findSimilarImages(asset.phash, asset.id, 5);
      if (similar.length > 0) {
        signals.push({
          signalType: "SIMILAR_IMAGE",
          signalValue: asset.id,
          score: SIGNAL_WEIGHTS.SIMILAR_IMAGE,
          details: {
            similarCount: similar.length,
            closestDistance: similar[0]?.distance,
          },
        });
      }
    }
  }

  if (participation.user.deviceFingerprint) {
    const sameDeviceCount = await prisma.participation.count({
      where: {
        id: { not: participation.id },
        user: { deviceFingerprint: participation.user.deviceFingerprint },
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (sameDeviceCount > 3) {
      signals.push({
        signalType: "SAME_DEVICE",
        signalValue: participation.user.deviceFingerprint,
        score: SIGNAL_WEIGHTS.SAME_DEVICE,
        details: { recentCount: sameDeviceCount },
      });
    }
  }

  const recentSubmissions = await prisma.participation.count({
    where: {
      userId: participation.userId,
      submittedAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
  });

  if (recentSubmissions > 5) {
    signals.push({
      signalType: "RAPID_SUBMISSION",
      signalValue: String(recentSubmissions),
      score: SIGNAL_WEIGHTS.RAPID_SUBMISSION,
      details: { submissionsInLastHour: recentSubmissions },
    });
  }

  if (participation.feedback.length < 50) {
    signals.push({
      signalType: "SHORT_FEEDBACK",
      signalValue: String(participation.feedback.length),
      score: SIGNAL_WEIGHTS.SHORT_FEEDBACK,
    });
  }

  const duplicateFeedback = await prisma.participation.findFirst({
    where: {
      id: { not: participation.id },
      feedback: participation.feedback,
    },
  });

  if (duplicateFeedback) {
    signals.push({
      signalType: "DUPLICATE_FEEDBACK",
      signalValue: duplicateFeedback.id,
      score: SIGNAL_WEIGHTS.DUPLICATE_FEEDBACK,
    });
  }

  const totalScore = Math.min(
    100,
    signals.reduce((sum, s) => sum + s.score, 0)
  );

  let decision: FraudDecision;
  if (totalScore >= 70) {
    decision = FraudDecision.REJECT;
  } else if (totalScore >= 40) {
    decision = FraudDecision.REVIEW;
  } else {
    decision = FraudDecision.PASS;
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (signals.length > 0) {
      await tx.fraudSignal.createMany({
        data: signals.map((s) => ({
          participationId: payload.participationId,
          signalType: s.signalType,
          signalValue: s.signalValue,
          score: s.score,
          details: s.details ? (s.details as Prisma.InputJsonValue) : Prisma.JsonNull,
        })),
      });
    }

    const newStatus =
      decision === FraudDecision.REJECT
        ? ParticipationStatus.AUTO_REJECTED
        : decision === FraudDecision.REVIEW
          ? ParticipationStatus.MANUAL_REVIEW
          : ParticipationStatus.PENDING_REVIEW;

    await tx.participation.update({
      where: { id: payload.participationId },
      data: {
        fraudScore: totalScore,
        fraudDecision: decision,
        fraudReasons: signals.map((s) => s.signalType),
        status: newStatus,
      },
    });
  });

  return { score: totalScore, decision, signals };
}
