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
      
      const userRole = isAdmin ? 'ADMINISTRADOR' : 'CLIENTE';
      if (!allowedRoles.includes(userRole)) {
        router.push(isAdmin ? "/admin" : "/");
      }
    }
  }, [isAuthenticated, isAdmin, allowedRoles, router, isAuthStatusKnown]);

  if (!isAuthStatusKnown || !isAuthenticated || (user && !allowedRoles.includes(isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'))) {
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
