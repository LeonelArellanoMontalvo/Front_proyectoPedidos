
"use client";

import { useState, useEffect } from 'react';
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

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [filters, setFilters] = useState({
    nombreItem: '',
    categoriaNombre: '',
    precio: '',
    estado: ''
  });
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
      setFilteredDishes(response.data.data?.platillos || []);
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
  }, []);

  useEffect(() => {
    let filteredData = dishes;
    if (filters.nombreItem) {
        filteredData = filteredData.filter(d => d.nombreItem.toLowerCase().includes(filters.nombreItem.toLowerCase()));
    }
    if (filters.categoriaNombre) {
        filteredData = filteredData.filter(d => d.categoriaNombre.toLowerCase().includes(filters.categoriaNombre.toLowerCase()));
    }
    if (filters.precio) {
        filteredData = filteredData.filter(d => d.precio.toString().includes(filters.precio));
    }
    if (filters.estado) {
        filteredData = filteredData.filter(d => d.estado.toLowerCase().includes(filters.estado.toLowerCase()));
    }
    setFilteredDishes(filteredData);
  }, [filters, dishes]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
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
    const originalDishes = [...dishes];

    // Optimistic update
    const updateState = (dishList: Dish[]) => dishList.map(d => 
        d.id === dish.id ? { ...d, estado: newStatus, disponible: newStatus === 'ACTIVO' } : d
    );
    setDishes(updateState);
    setFilteredDishes(updateState);
    
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
        toast({ title: "Estado del platillo actualizado", description: `"${dish.nombreItem}" ahora está ${newStatus.toLowerCase()}.`});
    } catch(error) {
        setDishes(originalDishes);
        setFilteredDishes(originalDishes);
        console.error("Error updating dish status:", error);
        toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: "No se pudo cambiar el estado del platillo."
        });
    }
  };

  async function onSubmit(data: DishFormValues) {
    if (editingDish) {
      // Logic to update a dish will be implemented later (needs a new mutation)
      console.log("Updating dish (not implemented yet):", data);
      const updatedDishes = dishes.map(d =>
        d.id === editingDish.id ? { ...editingDish, ...data, estado: data.disponible ? 'ACTIVO' : 'DESCONTINUADO' } : d
      );
      setDishes(updatedDishes);
      setFilteredDishes(updatedDishes);
      toast({ title: 'Platillo Actualizado', description: `"${data.nombreItem}" ha sido actualizado.` });
    } else {
      // Add new dish via API
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
            const newDish: Dish = {
                ...createdDishData,
                descripcion: data.descripcion,
                precio: data.precio,
                disponible: data.disponible,
                categoriaNombre: data.categoriaNombre,
                estado: data.disponible ? 'ACTIVO' : 'DESCONTINUADO'
            };
            setDishes(currentDishes => [...currentDishes, newDish]);
            setFilteredDishes(currentDishes => [...currentDishes, newDish]);
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
               <TableRow>
                <TableCell><Input placeholder="Filtrar por nombre..." name="nombreItem" value={filters.nombreItem} onChange={handleFilterChange} /></TableCell>
                <TableCell><Input placeholder="Filtrar por categoría..." name="categoriaNombre" value={filters.categoriaNombre} onChange={handleFilterChange} /></TableCell>
                <TableCell><Input placeholder="Filtrar por precio..." name="precio" value={filters.precio} onChange={handleFilterChange} /></TableCell>
                <TableCell><Input placeholder="Filtrar por estado..." name="estado" value={filters.estado} onChange={handleFilterChange} /></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Cargando platillos...
                  </TableCell>
                </TableRow>
              ) : filteredDishes.map((dish) => (
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
