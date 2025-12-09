
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Package, PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const dishFormSchema = z.object({
  nombreItem: z.string().min(3, { message: 'El nombre es requerido.' }),
  categoriaNombre: z.string().min(3, { message: 'La categoría es requerida.' }),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, { message: 'El precio debe ser positivo.' }),
  disponible: z.boolean(),
});

type DishFormValues = z.infer<typeof dishFormSchema>;

const CREATE_PLATILLO_MUTATION = `
  mutation createPlatillo($createPlatilloInput: CreatePlatilloInput!) {
    createPlatillo(createPlatilloInput: $createPlatilloInput) {
      id
      nombreItem
    }
  }
`;

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

const UPDATE_PLATILLO_MUTATION = `
    mutation updatePlatillo($updatePlatilloInput: UpdatePlatilloInput!) {
        updatePlatillo(updatePlatilloInput: $updatePlatilloInput) {
            id
            estado
        }
    }
`;

type SortKey = keyof Dish;

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const { toast } = useToast();

  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      nombreItem: '',
      categoriaNombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
    },
  });

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/graphql', {
        query: GET_PLATILLOS_QUERY,
      });
      setDishes(response.data.data?.platillos || []);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar platillos",
        description: "No se pudieron obtener los datos de la API.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedAndFilteredDishes = useMemo(() => {
    let sortableItems = [...dishes];
    if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableItems.filter(d => d.nombreItem.toLowerCase().includes(filter.toLowerCase()));
  }, [dishes, filter, sortConfig]);

  const requestSort = (key: SortKey) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-2 opacity-30" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const handleEditClick = (dish: Dish) => {
    setEditingDish(dish);
    form.reset({
        nombreItem: dish.nombreItem,
        categoriaNombre: dish.categoriaNombre,
        descripcion: dish.descripcion,
        precio: dish.precio,
        disponible: dish.disponible,
    });
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingDish(null);
    form.reset({
      nombreItem: '',
      categoriaNombre: '',
      descripcion: '',
      precio: 0,
      disponible: true,
    });
    setIsDialogOpen(true);
  };

  const toggleDishStatus = async (dish: Dish) => {
    const newStatus = dish.estado === 'ACTIVO' ? 'DESCONTINUADO' : 'ACTIVO';
    
    try {
        await axios.post('/graphql', {
            query: UPDATE_PLATILLO_MUTATION,
            variables: {
                updatePlatilloInput: {
                    id: dish.id,
                    estado: newStatus
                }
            }
        });

        const updatedDishes = dishes.map(d => 
            d.id === dish.id ? { ...d, estado: newStatus, disponible: newStatus === 'ACTIVO' } : d
        );
        setDishes(updatedDishes);

        toast({ title: "Estado del platillo actualizado", description: `"${dish.nombreItem}" ahora está ${newStatus.toLowerCase()}.`});
    } catch(error) {
        console.error("Error updating dish status:", error);
        toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: "No se pudo cambiar el estado del platillo."
        });
    }
  };

  async function onSubmit(data: DishFormValues) {
    // This needs a proper update mutation from the backend to work correctly for editing
    if (editingDish) {
      console.warn("Update functionality is not fully implemented in the backend yet.");
      const updatedDishes = dishes.map(d =>
        d.id === editingDish.id ? { ...d, ...data, estado: data.disponible ? 'ACTIVO' : 'DESCONTINUADO' } : d
      );
      setDishes(updatedDishes);
      toast({ title: 'Platillo Actualizado (Simulado)', description: `"${data.nombreItem}" ha sido actualizado localmente.` });

    } else {
      try {
        const createPlatilloInput: any = {
            nombreItem: data.nombreItem,
            precio: data.precio,
            categoriaNombre: data.categoriaNombre,
            estado: data.disponible ? 'ACTIVO' : 'DESCONTINUADO'
        };

        if (data.descripcion) {
            createPlatilloInput.descripcion = data.descripcion;
        }

        const response = await axios.post('/graphql', {
          query: CREATE_PLATILLO_MUTATION,
          variables: { createPlatilloInput }
        });

        const createdDishData = response.data.data?.createPlatillo;

        if (createdDishData) {
            fetchDishes(); // Refetch all dishes to get the new one
            toast({ title: 'Platillo Agregado', description: `"${data.nombreItem}" ha sido creado.` });
        } else {
             throw new Error(response.data.errors?.[0]?.message || "Error al crear el platillo");
        }
      } catch (error: any) {
        console.error("Error creating dish:", error);
        toast({
            variant: "destructive",
            title: "Error al crear platillo",
            description: error.response?.data?.errors?.[0]?.message || error.message || "No se pudo conectar a la API.",
        });
      }
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
              <FormField control={form.control} name="nombreItem" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="categoriaNombre" render={({ field }) => (
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
           <div className="pt-4">
             <Input 
                placeholder="Filtrar por nombre de platillo..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
              />
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Button variant="ghost" onClick={() => requestSort('nombreItem')}>Nombre {getSortIcon('nombreItem')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('categoriaNombre')}>Categoría {getSortIcon('categoriaNombre')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('precio')}>Precio {getSortIcon('precio')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('estado')}>Estado {getSortIcon('estado')}</Button></TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Cargando platillos...
                  </TableCell>
                </TableRow>
              ) : sortedAndFilteredDishes.map((dish) => (
                <TableRow key={dish.id}>
                  <TableCell className="font-medium">{dish.nombreItem}</TableCell>
                  <TableCell>{dish.categoriaNombre}</TableCell>
                  <TableCell>${dish.precio.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={dish.estado === 'ACTIVO' ? 'default' : 'destructive'}>{dish.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(dish)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => toggleDishStatus(dish)}>
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
