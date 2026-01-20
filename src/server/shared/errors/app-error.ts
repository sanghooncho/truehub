import { ErrorCodes, type ErrorCodeKey } from "./error-codes";

export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details?: Record<string, unknown>;

  constructor(errorKey: ErrorCodeKey, details?: Record<string, unknown>) {
    const errorDef = ErrorCodes[errorKey];
    super(errorDef.message);
    this.code = errorDef.code;
    this.httpStatus = errorDef.http;
    this.details = details;
    this.name = "AppError";

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
