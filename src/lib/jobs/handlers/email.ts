import { Resend } from "resend";
import { prisma } from "@/infra/db/prisma";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = "TrueHub <noreply@truehub.co.kr>";

export interface EmailPayload {
  templateType: "PARTICIPATION_APPROVED" | "PARTICIPATION_REJECTED" | "REWARD_SENT";
  recipientEmail: string;
  recipientType: "user" | "advertiser";
  recipientId: string;
  data: Record<string, unknown>;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

function getTemplate(
  type: EmailPayload["templateType"],
  data: Record<string, unknown>
): EmailTemplate {
  switch (type) {
    case "PARTICIPATION_APPROVED":
      return {
        subject: `[TrueHub] 참여가 승인되었습니다 - ${data.campaignTitle}`,
        html: `
          <div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #0052CC; font-size: 24px; margin-bottom: 24px;">참여가 승인되었습니다!</h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              안녕하세요,<br><br>
              <strong>${data.campaignTitle}</strong> 캠페인 참여가 승인되었습니다.
            </p>
            <div style="background: #F0FDF4; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="color: #166534; font-size: 18px; font-weight: 600; margin: 0;">
                지급 예정 리워드: ${data.rewardAmount}P
              </p>
            </div>
            <p style="color: #64748B; font-size: 14px;">
              리워드는 영업일 기준 1-3일 이내 지급됩니다.
            </p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">
              이 메일은 TrueHub에서 발송되었습니다.
            </p>
          </div>
        `,
      };

    case "PARTICIPATION_REJECTED":
      return {
        subject: `[TrueHub] 참여가 반려되었습니다 - ${data.campaignTitle}`,
        html: `
          <div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #EF4444; font-size: 24px; margin-bottom: 24px;">참여가 반려되었습니다</h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              안녕하세요,<br><br>
              안타깝게도 <strong>${data.campaignTitle}</strong> 캠페인 참여가 반려되었습니다.
            </p>
            ${
              data.rejectReason
                ? `
            <div style="background: #FEF2F2; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="color: #991B1B; font-size: 14px; margin: 0;">
                <strong>반려 사유:</strong><br>
                ${data.rejectReason}
              </p>
            </div>
            `
                : ""
            }
            <p style="color: #64748B; font-size: 14px;">
              다른 캠페인에 참여하여 리워드를 받아보세요!
            </p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">
              이 메일은 TrueHub에서 발송되었습니다.
            </p>
          </div>
        `,
      };

    case "REWARD_SENT":
      return {
        subject: `[TrueHub] 리워드가 지급되었습니다 - ${data.rewardAmount}P`,
        html: `
          <div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #00C7BE; font-size: 24px; margin-bottom: 24px;">리워드가 지급되었습니다!</h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              안녕하세요,<br><br>
              <strong>${data.campaignTitle}</strong> 캠페인 리워드가 지급되었습니다.
            </p>
            <div style="background: #ECFEFF; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: #0891B2; font-size: 32px; font-weight: 700; margin: 0;">
                ${data.rewardAmount}P
              </p>
              <p style="color: #06B6D4; font-size: 14px; margin-top: 8px;">
                지급 완료
              </p>
            </div>
            <p style="color: #64748B; font-size: 14px;">
              앞으로도 TrueHub와 함께해 주세요!
            </p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">
              이 메일은 TrueHub에서 발송되었습니다.
            </p>
          </div>
        `,
      };

    default:
      throw new Error(`Unknown template type: ${type}`);
  }
}

export async function sendEmail(payload: EmailPayload): Promise<string> {
  const template = getTemplate(payload.templateType, payload.data);

  const emailLog = await prisma.emailLog.create({
    data: {
      recipientEmail: payload.recipientEmail,
      recipientType: payload.recipientType,
      recipientId: payload.recipientId,
      templateType: payload.templateType,
      subject: template.subject,
      status: "PENDING",
    },
  });

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: payload.recipientEmail,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: "FAILED",
          errorMessage: error.message,
        },
      });
      throw new Error(error.message);
    }

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "SENT",
        resendMessageId: data?.id,
        sentAt: new Date(),
      },
    });

    return data?.id || "";
  } catch (error) {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
