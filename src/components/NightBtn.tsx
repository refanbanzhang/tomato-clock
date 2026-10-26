import { useEffect, useState } from "react";
import { applyTheme, readTheme, saveTheme, watchSystemTheme, type Theme } from "@/lib/theme";

export default function NightBtn() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const dark = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => watchSystemTheme(setTheme), []);

  return (
    <button
      className="btn"
      type="button"
      aria-pressed={dark}
      onClick={() => {
        const next = dark ? "light" : "dark";
        saveTheme(next);
        setTheme(next);
      }}
    >
      {dark ? "日间" : "夜间"}
    </button>
  );
}
