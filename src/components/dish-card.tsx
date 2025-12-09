
"use client";

import { PlusCircle } from 'lucide-react';
import type { Dish } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{dish.nombreItem}</CardTitle>
        <CardDescription className="text-base h-12 overflow-hidden">{dish.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="text-2xl font-bold text-primary">${dish.precio.toFixed(2)}</p>
        <Button onClick={() => addToCart(dish)} disabled={isAdmin}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}
