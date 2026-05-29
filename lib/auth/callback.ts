import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { mapAuthError, type AuthErrorCode } from "./errors";

export { mapAuthError, type AuthErrorCode } from "./errors";

export interface AuthCallbackResult {
  session: Session | null;
  error: string | null;
}

function readHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function clearAuthParamsFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("error");
  url.searchParams.delete("error_code");
  url.searchParams.delete("error_description");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

export async function handleAuthCallback(): Promise<AuthCallbackResult> {
  const query = new URLSearchParams(window.location.search);
  const hash = readHashParams();

  const queryError = query.get("error_description") ?? hash.get("error_description");
  if (queryError) {
    console.warn("[auth-callback] redirect error:", queryError);
    clearAuthParamsFromUrl();
    return { session: null, error: decodeURIComponent(queryError.replace(/\+/g, " ")) };
  }

  const code = query.get("code");
  if (code) {
    console.info("[auth-callback] exchanging PKCE code");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.warn("[auth-callback] PKCE exchange failed:", error.message);
      return { session: null, error: error.message };
    }
    clearAuthParamsFromUrl();
    return { session: data.session, error: null };
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    console.info("[auth-callback] setting session from hash tokens, type:", hash.get("type"));
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      console.warn("[auth-callback] setSession failed:", error.message);
      return { session: null, error: error.message };
    }
    clearAuthParamsFromUrl();
    return { session: data.session, error: null };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("[auth-callback] getSession failed:", error.message);
    return { session: null, error: error.message };
  }

  if (data.session) {
    console.info("[auth-callback] existing session found");
    clearAuthParamsFromUrl();
    return { session: data.session, error: null };
  }

  console.warn("[auth-callback] no auth params in URL");
  return { session: null, error: null };
}

export function mapSignInError(message: string): AuthErrorCode {
  return mapAuthError(message);
}
