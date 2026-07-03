
import TomatoIcon from "./TomatoIcon";
import AppNav from "./AppNav";
import PageTools from "./PageTools";

interface AppShellProps {
  title: string;
  subtitle?: string;
  showBrand?: boolean;
  wide?: boolean;
  onSettingsClick?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AppShell({
  title,
  subtitle,
  showBrand = false,
  wide = false,
  onSettingsClick,
  children,
  footer,
}: AppShellProps) {
  return (
    <div className={`app${wide ? " app-wide" : ""}`}>
      <header className="app-head">
        <div className="app-top">
          <div className="app-brand">
            {showBrand && <TomatoIcon className="app-logo" />}
            <span className="app-name">{title}</span>
          </div>
          <div className="app-nav-slot">
            <AppNav />
          </div>
          <PageTools onSettingsClick={onSettingsClick} />
        </div>
      </header>

      {subtitle && <p className="app-lead">{subtitle}</p>}

      <main className="app-body">{children}</main>

      {footer}
    </div>
  );
}
