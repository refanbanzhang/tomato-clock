#!/usr/bin/env bash
# Configure Supabase Auth to send email via Resend SMTP.
#
# Prerequisites:
#   1. Resend account: https://resend.com
#   2. Verify domain (e.g. keepgoing2049.cn) in Resend → Domains
#   3. Create API key in Resend → API Keys
#   4. Supabase access token: https://supabase.com/dashboard/account/tokens
#
# Usage:
#   export SUPABASE_ACCESS_TOKEN="sbp_..."
#   export RESEND_API_KEY="re_..."
#   export SMTP_FROM="no-reply@keepgoing2049.cn"
#   ./scripts/configure-supabase-smtp.sh

set -euo pipefail

PROJECT_REF="${PROJECT_REF:-bfgbjtuyojgvcvvxjlxv}"
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:?Set SUPABASE_ACCESS_TOKEN}"
RESEND_API_KEY="${RESEND_API_KEY:?Set RESEND_API_KEY}"
SMTP_FROM="${SMTP_FROM:?Set SMTP_FROM e.g. no-reply@keepgoing2049.cn}"
SMTP_SENDER_NAME="${SMTP_SENDER_NAME:-Tomato Clock}"

echo "Configuring Supabase Auth SMTP (Resend) for project ${PROJECT_REF}..."

curl -fsS -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(cat <<EOF
{
  "external_email_enabled": true,
  "mailer_autoconfirm": true,
  "smtp_admin_email": "${SMTP_FROM}",
  "smtp_host": "smtp.resend.com",
  "smtp_port": 587,
  "smtp_user": "resend",
  "smtp_pass": "${RESEND_API_KEY}",
  "smtp_sender_name": "${SMTP_SENDER_NAME}"
}
EOF
)" | python3 -m json.tool 2>/dev/null || true

echo ""
echo "Done. Verify in dashboard:"
echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/auth/smtp"
echo ""
echo "Optional: raise email rate limit at"
echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/auth/rate-limits"
