"use client";

import Image from 'next/image';
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

interface DishCardProps {
  dish: Dish;
  imageUrl?: string;
  imageHint?: string;
}

export function DishCard({ dish, imageUrl, imageHint }: DishCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full">
        {imageUrl && (
            <Image
              src={imageUrl}
              alt={dish.nombre_item}
              fill
              className="object-cover"
              data-ai-hint={imageHint}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        )}
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{dish.nombre_item}</CardTitle>
        <CardDescription className="text-base h-12 overflow-hidden">{dish.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="text-2xl font-bold text-primary">${dish.precio.toFixed(2)}</p>
        <Button onClick={() => addToCart(dish)}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}
