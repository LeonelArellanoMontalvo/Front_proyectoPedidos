"use client";

import Link from 'next/link';
import { ShoppingCart, LogIn, UserPlus, LogOut, Shield, History } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cart } from '@/components/cart';
import { Logo } from '@/components/logo';
import placeholderData from '@/lib/placeholder-images.json';

const userAvatars = placeholderData.placeholderImages.filter(p => p.description.includes('avatar'));

const getAvatarForUser = (cedula: string) => {
  if (!userAvatars.length) return null;
  // A simple way to get a consistent index for a given cedula
  const numericCedula = parseInt(cedula.replace(/\D/g, '')) || 0;
  const index = numericCedula % userAvatars.length;
  return userAvatars[index];
}


export default function Header() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const userInitial = user?.nombre?.[0]?.toUpperCase() || 'U';
  const userAvatar = user ? getAvatarForUser(user.cedula) : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Cart />
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user.nombre} data-ai-hint={userAvatar.imageHint} />}
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.nombre} {user.apellido}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                     <DropdownMenuItem asChild>
                        <Link href="/admin/orders">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Panel de Admin</span>
                        </Link>
                      </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <History className="mr-2 h-4 w-4" />
                        <span>Mis Pedidos</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
