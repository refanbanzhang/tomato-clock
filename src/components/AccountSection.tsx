
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";

export default function AccountSection() {
  const { t } = useLocale();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="set-split">
        <p className="set-label">{t("authAccount")}</p>
        <p className="subtitle mt-1">{t("authAccountHint")}</p>
        <div className="data-actions">
          <Link to="/auth/login" className="btn btn-primary py-2 text-sm">
            {t("authLoginBtn")}
          </Link>
          <Link to="/auth/register" className="btn btn-muted py-2 text-sm">
            {t("authRegisterBtn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="set-split">
      <p className="set-label">{t("authAccount")}</p>
      <p className="subtitle mt-1">{user.email}</p>
    </div>
  );
}
