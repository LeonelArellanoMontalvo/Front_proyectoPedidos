"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ('CLIENTE' | 'ADMINISTRADOR')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const router = useRouter();
  
  // A state to check if authentication status is determined
  const isAuthStatusKnown = typeof isAuthenticated === 'boolean';

  useEffect(() => {
    if (isAuthStatusKnown) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      
      const userRole = user?.rol.nombre;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push(isAdmin ? "/admin" : "/");
      }
    }
  }, [isAuthenticated, isAdmin, user, allowedRoles, router, isAuthStatusKnown]);

  if (!isAuthStatusKnown || !isAuthenticated || (user && (!user.rol.nombre || !allowedRoles.includes(user.rol.nombre)))) {
    return (
        <div className="container mx-auto px-4 py-8 space-y-4">
            <Skeleton className="h-12 w-1/4" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6" />
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
