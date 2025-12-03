import Link from 'next/link';
import { Utensils } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Utensils className="h-7 w-7 text-primary" />
      <span className="font-headline text-2xl font-bold tracking-tight text-foreground">
        Pedido Listo
      </span>
    </Link>
  );
}
