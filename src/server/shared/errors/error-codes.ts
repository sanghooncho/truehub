export const ErrorCodes = {
  AUTH_INVALID_TOKEN: { code: "AUTH_INVALID_TOKEN", http: 401, message: "Invalid or expired token" },
  AUTH_INVALID_CREDENTIALS: { code: "AUTH_INVALID_CREDENTIALS", http: 401, message: "Invalid email or password" },
  AUTH_TOTP_REQUIRED: { code: "AUTH_TOTP_REQUIRED", http: 403, message: "2FA verification required" },
  AUTH_TOTP_INVALID: { code: "AUTH_TOTP_INVALID", http: 403, message: "Invalid 2FA code" },
  AUTH_NOT_WHITELISTED: { code: "AUTH_NOT_WHITELISTED", http: 403, message: "Account not authorized for admin access" },
  AUTH_SESSION_EXPIRED: { code: "AUTH_SESSION_EXPIRED", http: 401, message: "Session expired, please login again" },

  CAMP_NOT_FOUND: { code: "CAMP_NOT_FOUND", http: 404, message: "Campaign not found" },
  CAMP_ALREADY_CLOSED: { code: "CAMP_ALREADY_CLOSED", http: 400, message: "Campaign is already closed" },
  CAMP_INSUFFICIENT_CREDIT: { code: "CAMP_INSUFFICIENT_CREDIT", http: 400, message: "Insufficient credit to publish campaign" },
  CAMP_INVALID_STATUS: { code: "CAMP_INVALID_STATUS", http: 400, message: "Invalid campaign status transition" },
  CAMP_TARGET_REACHED: { code: "CAMP_TARGET_REACHED", http: 400, message: "Campaign target already reached" },
  CAMP_EXPIRED: { code: "CAMP_EXPIRED", http: 400, message: "Campaign has expired" },

  PART_NOT_FOUND: { code: "PART_NOT_FOUND", http: 404, message: "Participation not found" },
  PART_ALREADY_SUBMITTED: { code: "PART_ALREADY_SUBMITTED", http: 400, message: "Already participated in this campaign" },
  PART_DAILY_LIMIT: { code: "PART_DAILY_LIMIT", http: 400, message: "Daily participation limit (3) reached" },
  PART_CAMPAIGN_CLOSED: { code: "PART_CAMPAIGN_CLOSED", http: 400, message: "Campaign is not accepting submissions" },
  PART_INVALID_IMAGE: { code: "PART_INVALID_IMAGE", http: 400, message: "Invalid image format or size" },
  PART_MISSING_REQUIRED: { code: "PART_MISSING_REQUIRED", http: 400, message: "Missing required submission fields" },
  PART_TEXT_TOO_SHORT: { code: "PART_TEXT_TOO_SHORT", http: 400, message: "Feedback must be at least 30 characters" },

  CRED_INSUFFICIENT: { code: "CRED_INSUFFICIENT", http: 400, message: "Insufficient credit balance" },
  CRED_INVALID_AMOUNT: { code: "CRED_INVALID_AMOUNT", http: 400, message: "Invalid top-up amount" },
  CRED_TOPUP_NOT_FOUND: { code: "CRED_TOPUP_NOT_FOUND", http: 404, message: "Top-up request not found" },
  CRED_ALREADY_CONFIRMED: { code: "CRED_ALREADY_CONFIRMED", http: 400, message: "Top-up already confirmed" },

  AI_COOLDOWN: { code: "AI_COOLDOWN", http: 429, message: "Please wait before regenerating the report" },

  VALIDATION_ERROR: { code: "VALIDATION_ERROR", http: 400, message: "Request validation failed" },
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", http: 500, message: "Internal server error" },
  FORBIDDEN: { code: "FORBIDDEN", http: 403, message: "Access denied" },
  NOT_FOUND: { code: "NOT_FOUND", http: 404, message: "Resource not found" },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;
