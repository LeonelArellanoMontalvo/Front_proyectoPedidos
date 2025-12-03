import AdminSidebar from "@/components/admin-sidebar";
import ProtectedRoute from "@/components/protected-route";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
        <div className="flex min-h-[calc(100vh-8rem)]">
          <AdminSidebar />
          <div className="flex-1 p-8 bg-muted/30">
            {children}
          </div>
        </div>
    </ProtectedRoute>
  );
}
