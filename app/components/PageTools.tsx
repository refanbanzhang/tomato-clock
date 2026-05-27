"use client";

import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

type PageToolsProps = {
  children?: React.ReactNode;
};

export default function PageTools({ children }: PageToolsProps) {
  return (
    <div className="page-tools">
      <ThemeToggle />
      <LanguageSwitcher />
      {children}
    </div>
  );
}
