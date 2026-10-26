const KEY = "tomato-clock-theme";

export type Theme = "light" | "dark";

function savedTheme(): Theme | null {
  const value = localStorage.getItem(KEY);
  if (value === "light" || value === "dark") return value;
  return null;
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readTheme(): Theme {
  return savedTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

export function watchSystemTheme(onChange: (theme: Theme) => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = () => {
    if (savedTheme()) return;
    onChange(systemTheme());
  };
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
