
"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { DishCard } from '@/components/dish-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dish } from '@/lib/types';

const GET_PLATILLOS_QUERY = `
  query {
    platillos {
      id
      categoriaNombre
      nombreItem
      descripcion
      precio
      disponible
      estado
    }
  }
`;

export default function Home() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.post('/graphql', {
          query: GET_PLATILLOS_QUERY,
        });
        const allDishes = response.data.data?.platillos || [];
        const activeDishes = allDishes.filter((dish: Dish) => dish.disponible && dish.estado === 'ACTIVO');
        setDishes(activeDishes);
      } catch (error) {
        console.error("Error fetching dishes:", error);
        // Aquí se podría mostrar un mensaje de error al usuario
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">Nuestro Menú</h1>
        <p className="text-lg text-muted-foreground mt-2">Deléitate con nuestros sabores únicos.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {dishes.map((dish) => (
            <DishCard 
              key={dish.id} 
              dish={dish} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
