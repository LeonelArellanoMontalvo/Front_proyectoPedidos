
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ('CLIENTE' | 'ADMINISTRADOR' | 'VENDEDOR')[];
}

/**
 * Componente que protege rutas basándose en el rol del usuario.
 * Si el rol no coincide, redirige al usuario a su área permitida.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isAdmin, isVendedor } = useAuth();
  const router = useRouter();
  
  const isAuthStatusKnown = typeof isAuthenticated === 'boolean';
  const isStaff = isAdmin || isVendedor;

  useEffect(() => {
    if (isAuthStatusKnown) {
      // 1. Si no está logueado, al login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      
      // 2. Si el rol no está en la lista de permitidos, redirigir
      const userRole = user?.rol.nombre;
      if (!userRole || !allowedRoles.includes(userRole as any)) {
        router.push(isStaff ? "/admin/orders" : "/");
      }
    }
  }, [isAuthenticated, isStaff, user, allowedRoles, router, isAuthStatusKnown]);

  // Mientras se verifica el estado, mostramos un cargando
  if (!isAuthStatusKnown || !isAuthenticated || (user && (!user.rol.nombre || !allowedRoles.includes(user.rol.nombre as any)))) {
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
