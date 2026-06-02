import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/lib/constants";
import { EmptyState } from "@/components/ui/EmptyState";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can } = useAuth();
  if (!can(permission)) {
    return (
      <div className="py-10">
        <EmptyState
          icon={<ShieldAlert size={40} />}
          title="You don't have access to this page"
          description="Ask a SuperAdmin or Admin to grant you the required permission."
        />
      </div>
    );
  }
  return <>{children}</>;
}
