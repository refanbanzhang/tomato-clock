import type { TFn } from "@/lib/i18n";
import type { AuthErrorCode } from "./errors";

export function authErrorMessage(t: TFn, code: AuthErrorCode, raw?: string): string {
  switch (code) {
    case "invalid_credentials":
      return t("authInvalidCredentials");
    case "email_not_confirmed":
      return t("authEmailNotConfirmed");
    case "email_rate_limit":
      return t("authEmailRateLimit");
    case "email_send_failed":
      return t("authEmailSendFailed");
    default:
      return raw ?? t("authErrorGeneric");
  }
}
