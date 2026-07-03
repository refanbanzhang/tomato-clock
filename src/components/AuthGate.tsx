
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";
import { isPublicPath } from "@/lib/auth/public-paths";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const allowed = isPublicPath(pathname);

  useEffect(() => {
    if (loading || session || allowed) return;
    navigate("/landing", { replace: true });
  }, [loading, session, allowed, navigate]);

  if (!allowed && (loading || !session)) {
    return (
      <div className="page items-center justify-center">
        <div className="loader" role="status" />
      </div>
    );
  }

  return children;
}
