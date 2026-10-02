import { ThemeProvider } from "@/components/ThemeProvider";
import { LocaleProvider } from "@/lib/i18n";
import HomePage from "@/pages/HomePage";

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <HomePage />
      </LocaleProvider>
    </ThemeProvider>
  );
}
