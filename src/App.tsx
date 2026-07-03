import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import LocaleWrapper from "@/components/LocaleWrapper";
import HomePage from "@/pages/HomePage";
import StatsPage from "@/pages/StatsPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename={basename || undefined}>
          <LocaleWrapper>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            </Routes>
          </LocaleWrapper>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
