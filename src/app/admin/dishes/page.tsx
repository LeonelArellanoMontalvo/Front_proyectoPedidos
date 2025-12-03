"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Dish } from '@/lib/types';
import { platillos as mockDishes } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const dishFormSchema = z.object({
  nombre_item: z.string().min(3, { message: 'El nombre es requerido.' }),
  categoria_nombre: z.string().min(3, { message: 'La categoría es requerida.' }),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, { message: 'El precio debe ser positivo.' }),
  disponible: z.boolean(),
});

type DishFormValues = z.infer<typeof dishFormSchema>;

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const { toast } = useToast();

  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      nombre_item: '',
      categoria_nombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
    },
  });

  const handleEditClick = (dish: Dish) => {
    setEditingDish(dish);
    form.reset({
        nombre_item: dish.nombre_item,
        categoria_nombre: dish.categoria_nombre,
        descripcion: dish.descripcion,
        precio: dish.precio,
        disponible: dish.disponible,
    });
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingDish(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const toggleDishStatus = (dishId: number) => {
    setDishes(currentDishes =>
      currentDishes.map(dish => {
        if (dish.item_id === dishId) {
          const newStatus = dish.estado === 'ACTIVO' ? 'DESCONTINUADO' : 'ACTIVO';
          toast({ title: "Estado del platillo actualizado", description: `"${dish.nombre_item}" ahora está ${newStatus.toLowerCase()}.`});
          return { ...dish, estado: newStatus, disponible: newStatus === 'ACTIVO' };
        }
        return dish;
      })
    );
  };

  function onSubmit(data: DishFormValues) {
    if (editingDish) {
      // Update existing dish
      const updatedDishes = dishes.map(d =>
        d.item_id === editingDish.item_id ? { ...editingDish, ...data, estado: data.disponible ? 'ACTIVO' : editingDish.estado } : d
      );
      setDishes(updatedDishes);
      toast({ title: 'Platillo Actualizado', description: `"${data.nombre_item}" ha sido actualizado.` });
    } else {
      // Add new dish
      const newDish: Dish = {
        item_id: Math.max(...dishes.map(d => d.item_id)) + 1,
        ...data,
        estado: data.disponible ? 'ACTIVO' : 'DESCONTINUADO',
      };
      setDishes([...dishes, newDish]);
      toast({ title: 'Platillo Agregado', description: `"${data.nombre_item}" ha sido creado.` });
    }
    setIsDialogOpen(false);
    setEditingDish(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Package className="h-10 w-10 text-primary" />
            <div>
            <h1 className="font-headline text-4xl font-bold">Gestión de Platillos</h1>
            <p className="text-muted-foreground">Añade, edita y gestiona los platillos del menú.</p>
            </div>
        </div>
        <Button onClick={handleAddNewClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Platillo
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDish ? 'Editar Platillo' : 'Añadir Nuevo Platillo'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nombre_item" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="categoria_nombre" render={({ field }) => (
                  <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="descripcion" render={({ field }) => (
                  <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="precio" render={({ field }) => (
                  <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="disponible" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5"><FormLabel>Disponible en Menú</FormLabel></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Platillos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.map((dish) => (
                <TableRow key={dish.item_id}>
                  <TableCell className="font-medium">{dish.nombre_item}</TableCell>
                  <TableCell>{dish.categoria_nombre}</TableCell>
                  <TableCell>${dish.precio.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={dish.estado === 'ACTIVO' ? 'default' : 'destructive'}>{dish.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(dish)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => toggleDishStatus(dish.item_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
