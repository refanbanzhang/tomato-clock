
import { useEffect } from "react";
import { Link } from "react-router-dom";
import TomatoIcon from "@/components/TomatoIcon";
import LandingTimerDemo from "@/components/LandingTimerDemo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocale } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useLocale();

  useEffect(() => {
    document.title = t("landing_title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("landing_description"));
  }, [t]);

  return (
    <div className="landing">
      {/* ========== 1. Nav ========== */}
      <nav className="landing-nav">
        <Link to="/landing" className="landing-brand">
          <TomatoIcon className="w-7 h-7 flex-shrink-0" />
          {t("landing_brand")}
        </Link>
        <div className="landing-nav-tools">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link to="/auth/login" className="btn btn-primary py-2 px-4 text-sm">
            {t("landing_cta_start")}
          </Link>
        </div>
      </nav>

      {/* ========== 2. Hero ========== */}
      <section className="landing-sec hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-badge">{t("landing_hero_label")}</span>

            <h1 className="hero-title">
              {t("landing_hero_line1")}{" "}
              <span className="hero-hl">{t("landing_hero_highlight")}</span>
              {t("landing_hero_line3") && <> {t("landing_hero_line3")}</>}
            </h1>

            <p className="hero-desc">
              {t("landing_hero_desc1")} {t("landing_hero_desc2")}
            </p>

            <div className="hero-actions">
              <Link to="/auth/login" className="btn btn-cta">
                {t("landing_hero_btn")}
              </Link>
              <a href="#features" className="btn btn-warn btn-lg">
                {t("landing_hero_learn")}
              </a>
            </div>

            <p className="hero-note">{t("landing_hero_sub")}</p>
          </div>

          <LandingTimerDemo />
        </div>
      </section>

      {/* ========== 3. Features ========== */}
      <section id="features" className="landing-sec">
        <h2 className="sec-title">{t("landing_why_title")}</h2>
        <p className="sec-sub">{t("landing_why_sub")}</p>

        <div className="feat-grid">
          {/* Feature 1: Clock */}
          <div className="card feat-card">
            <div className="feat-icon">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="feat-title">{t("landing_card1_title")}</h3>
            <p className="feat-desc">{t("landing_card1_desc")}</p>
          </div>

          {/* Feature 2: Lightning */}
          <div className="card feat-card">
            <div className="feat-icon">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h3 className="feat-title">{t("landing_card2_title")}</h3>
            <p className="feat-desc">{t("landing_card2_desc")}</p>
          </div>

          {/* Feature 3: Chart */}
          <div className="card feat-card">
            <div className="feat-icon">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </div>
            <h3 className="feat-title">{t("landing_card3_title")}</h3>
            <p className="feat-desc">{t("landing_card3_desc")}</p>
          </div>
        </div>
      </section>

      {/* ========== 4. How it works ========== */}
      <section className="landing-sec">
        <h2 className="sec-title">{t("landing_steps_title")}</h2>
        <p className="sec-sub">{t("landing_steps_sub")}</p>

        <div className="step-grid">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <div className="step-num">{n}</div>
              <h3 className="step-title">
                {t(`landing_step${n}_title` as Parameters<typeof t>[0])}
              </h3>
              <p className="step-desc">
                {t(`landing_step${n}_desc` as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== 5. Stats band ========== */}
      <section className="landing-sec">
        <div className="card band">
          <div>
            <p className="band-num">
              25<span className="band-unit">min</span>
            </p>
            <p className="band-label">{t("landing_stat_time")}</p>
          </div>
          <div>
            <p className="band-num">
              100%<span className="band-unit">free</span>
            </p>
            <p className="band-label">{t("landing_stat_free")}</p>
          </div>
          <div>
            <p className="band-num">{t("landing_stat_platform")}</p>
            <p className="band-label">{t("landing_stat_platform_val")}</p>
          </div>
          <div>
            <p className="band-num">
              {t("landing_stat_sync")}
              <span className="band-unit">{t("landing_stat_sync_val")}</span>
            </p>
            <p className="band-label">{t("landing_stat_sync_label")}</p>
          </div>
        </div>
      </section>

      {/* ========== 6. CTA + Footer ========== */}
      <section className="landing-sec text-center">
        <h2 className="sec-title">{t("landing_cta_title")}</h2>
        <p className="sec-sub">{t("landing_cta_sub")}</p>
        <div className="mt-8">
          <Link to="/auth/login" className="btn btn-cta">
            {t("landing_cta_btn")}
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <TomatoIcon className="w-5 h-5" />
          <span>{t("landing_footer_brand")}</span>
        </div>
        <p className="landing-footer-note">{t("landing_footer")}</p>
      </footer>
    </div>
  );
}
