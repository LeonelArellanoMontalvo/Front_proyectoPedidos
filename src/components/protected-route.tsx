
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ('CLIENTE' | 'ADMINISTRADOR')[];
}

/**
 * Componente que protege rutas basándose en el rol del usuario.
 * Si el rol no coincide, redirige al usuario a su área permitida.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const router = useRouter();
  
  const isAuthStatusKnown = typeof isAuthenticated === 'boolean';

  useEffect(() => {
    if (isAuthStatusKnown) {
      // 1. Si no está logueado, al login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      
      // 2. Si el rol no está en la lista de permitidos, redirigir
      const userRole = user?.rol.nombre;
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Si intenta entrar a admin siendo cliente va al home, 
        // si intenta entrar a cliente siendo admin va al dashboard.
        router.push(isAdmin ? "/admin/orders" : "/");
      }
    }
  }, [isAuthenticated, isAdmin, user, allowedRoles, router, isAuthStatusKnown]);

  // Mientras se verifica el estado, mostramos un cargando
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
