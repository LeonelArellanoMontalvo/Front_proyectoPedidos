"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, ClipboardList, Shield, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from './logo';

const navItems = [
  { href: '/admin/orders', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/dishes', label: 'Platillos', icon: Package },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/audit', label: 'Auditoría', icon: ShieldCheck },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card text-card-foreground">
        <div className="flex h-full flex-col">
            <div className="h-16 flex items-center px-6 border-b">
               <Logo />
            </div>
            <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-accent text-primary font-semibold'
                    )}
                >
                    <Icon className="h-5 w-5" />
                    {item.label}
                </Link>
                );
            })}
            </nav>
            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <p className="font-semibold">Panel de Administrador</p>
                </div>
            </div>
        </div>
    </aside>
  );
}
