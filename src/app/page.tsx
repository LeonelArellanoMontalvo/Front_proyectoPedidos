import { DishCard } from '@/components/dish-card';
import { platillos as allDishes } from '@/lib/mock-data';
import type { Dish } from '@/lib/types';

export default function Home() {
  const activeDishes: Dish[] = allDishes.filter((dish) => dish.disponible && dish.estado === 'ACTIVO');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">Nuestro Menú</h1>
        <p className="text-lg text-muted-foreground mt-2">Deléitate con nuestros sabores únicos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {activeDishes.map((dish) => (
          <DishCard 
            key={dish.item_id} 
            dish={dish} 
          />
        ))}
      </div>
    </div>
  );
}
