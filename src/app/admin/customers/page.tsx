
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Users, UserCheck, UserX, ArrowUpDown } from 'lucide-react';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  mutation CambiarEstadoUsuario($cedula: String!, $nuevoEstado: String!) {
    cambiarEstadoUsuario(cedula: $cedula, nuevoEstado: $nuevoEstado) {
      cedula
      estado
    }
  }
`;

type SortKey = keyof User;

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ nombre: '', cedula: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
    const { toast } = useToast();
    
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/graphql', { query: GET_USUARIOS_QUERY });
            const allUsers = response.data.data?.usuarios || [];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sortedAndFilteredCustomers = useMemo(() => {
        let sortableItems = [...customers];
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

        return sortableItems.filter(c => 
            (`${c.nombre} ${c.apellido}`.toLowerCase().includes(filters.nombre.toLowerCase())) &&
            (c.cedula.toLowerCase().includes(filters.cedula.toLowerCase()))
        );
    }, [customers, filters, sortConfig]);

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


    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFilters(prev => ({...prev, [name]: value}));
    };

    const toggleCustomerStatus = async (cedula: string) => {
        const customerToUpdate = customers.find(c => c.cedula === cedula);
        if (!customerToUpdate) return;
        const newStatus = customerToUpdate.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        
        try {
            await axios.post('/graphql', {
                query: UPDATE_USUARIO_MUTATION,
                variables: { cedula: cedula, nuevoEstado: newStatus }
            });
            
            // Update state on success
            const updatedCustomers = customers.map(customer => 
                customer.cedula === cedula ? {...customer, estado: newStatus} : customer
            );
            setCustomers(updatedCustomers);

            toast({
                title: "Estado del Cliente Actualizado",
                description: `El cliente está ahora ${newStatus.toLowerCase()}.`
            });
        } catch (error) {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Input placeholder="Filtrar por nombre..." name="nombre" value={filters.nombre} onChange={handleFilterChange} />
            <Input placeholder="Filtrar por cédula..." name="cedula" value={filters.cedula} onChange={handleFilterChange} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Button variant="ghost" onClick={() => requestSort('nombre')}>Cliente {getSortIcon('nombre')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('cedula')}>Cédula {getSortIcon('cedula')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('email')}>Email {getSortIcon('email')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('telefono')}>Teléfono {getSortIcon('telefono')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('estado')}>Estado {getSortIcon('estado')}</Button></TableHead>
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
              ) : sortedAndFilteredCustomers.map((customer) => (
                <TableRow key={customer.cedula}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{customer.nombre?.[0]}{customer.apellido?.[0]}</AvatarFallback>
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
