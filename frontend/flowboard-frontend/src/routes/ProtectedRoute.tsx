import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/features/auth/hooks/useAuth";

export function ProtectedRoute() {
  const me = useMe();

  if (me.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking session...</div>;
  }

  if (me.isError) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
