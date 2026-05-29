export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "email_rate_limit"
  | "email_send_failed"
  | "generic";

export function mapAuthError(message: string): AuthErrorCode {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "invalid_credentials";
  }
  if (lower.includes("email not confirmed")) {
    return "email_not_confirmed";
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit exceeded")
  ) {
    return "email_rate_limit";
  }
  if (
    lower.includes("error sending recovery email") ||
    lower.includes("error sending") ||
    lower.includes("not verified") ||
    lower.includes("unexpected_failure")
  ) {
    return "email_send_failed";
  }
  return "generic";
}
