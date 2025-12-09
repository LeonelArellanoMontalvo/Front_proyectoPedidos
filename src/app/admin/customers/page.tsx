
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX } from 'lucide-react';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const GET_USUARIOS_QUERY = `
  query {
    usuarios {
      cedula
      nombre
      apellido
      email
      telefono
      direccionPrincipal
      estado
      rol {
        id
        nombre
      }
    }
  }
`;

const UPDATE_USUARIO_MUTATION = `
  mutation UpdateUsuarioEstado($updateUsuarioInput: UpdateUsuarioInput!) {
    updateUsuario(updateUsuarioInput: $updateUsuarioInput) {
      cedula
      estado
    }
  }
`;

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/graphql', { query: GET_USUARIOS_QUERY });
            const allUsers = response.data.data?.usuarios || [];
            // Filter for users with CLIENTE role
            const clientUsers = allUsers.filter((user: User) => user.rol.nombre === 'CLIENTE');
            setCustomers(clientUsers);
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast({
                variant: "destructive",
                title: "Error al cargar clientes",
                description: "No se pudieron obtener los datos de la API.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const toggleCustomerStatus = async (cedula: string) => {
        const originalCustomers = [...customers];
        const newStatus = customers.find(c => c.cedula === cedula)?.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        
        // Optimistic update
        setCustomers(currentCustomers => 
            currentCustomers.map(customer => 
                customer.cedula === cedula ? {...customer, estado: newStatus} : customer
            )
        );

        try {
            await axios.post('/graphql', {
                query: UPDATE_USUARIO_MUTATION,
                variables: {
                    updateUsuarioInput: {
                        cedula,
                        estado: newStatus
                    }
                }
            });
            toast({
                title: "Estado del Cliente Actualizado",
                description: `El cliente está ahora ${newStatus.toLowerCase()}.`
            });
        } catch (error) {
            // Revert on error
            setCustomers(originalCustomers);
            console.error("Error updating customer status:", error);
            toast({
                variant: "destructive",
                title: "Error al actualizar",
                description: "No se pudo cambiar el estado del cliente."
            });
        }
    }


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Users className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Consulta la lista de clientes registrados en el sistema.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Activar/Desactivar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Cargando clientes...
                  </TableCell>
                </TableRow>
              ) : customers.map((customer) => (
                <TableRow key={customer.cedula}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{customer.nombre[0]}{customer.apellido?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p>{customer.nombre} {customer.apellido}</p>
                            <p className='text-xs text-muted-foreground'>{customer.direccionPrincipal}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.cedula}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.telefono}</TableCell>
                  <TableCell>
                    <Badge variant={customer.estado === 'ACTIVO' ? 'default' : 'destructive'}>
                        {customer.estado === 'ACTIVO' ? <UserCheck className='w-3 h-3 mr-1' /> : <UserX className='w-3 h-3 mr-1'/>}
                        {customer.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                        checked={customer.estado === 'ACTIVO'}
                        onCheckedChange={() => toggleCustomerStatus(customer.cedula)}
                        aria-label={`Activar o desactivar cliente ${customer.nombre}`}
                    />
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
