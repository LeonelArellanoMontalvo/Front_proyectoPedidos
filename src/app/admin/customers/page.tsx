"use client";

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
import { usuarios as mockUsers } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import placeholderData from '@/lib/placeholder-images.json';

const userAvatars = placeholderData.placeholderImages.filter(p => p.description.includes('avatar'));

const getAvatarForUser = (cedula: string) => {
  if (!userAvatars.length) return { imageUrl: '', imageHint: '' };
  // A simple way to get a consistent index for a given cedula
  const numericCedula = parseInt(cedula.replace(/\D/g, '')) || 0;
  const index = numericCedula % userAvatars.length;
  return userAvatars[index];
}


export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<User[]>(mockUsers.filter(u => u.rol_id === 1));
    const { toast } = useToast();
    
    const toggleCustomerStatus = (cedula: string) => {
        setCustomers(currentCustomers => 
            currentCustomers.map(customer => {
                if (customer.cedula === cedula) {
                    const newStatus = customer.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
                    toast({
                        title: "Estado del Cliente Actualizado",
                        description: `El cliente ${customer.nombre} está ahora ${newStatus.toLowerCase()}.`
                    });
                    return {...customer, estado: newStatus};
                }
                return customer;
            })
        )
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
              {customers.map((customer) => {
                const avatar = getAvatarForUser(customer.cedula);
                return (
                <TableRow key={customer.cedula}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={avatar.imageUrl} alt={customer.nombre} data-ai-hint={avatar.imageHint} />
                            <AvatarFallback>{customer.nombre[0]}{customer.apellido?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p>{customer.nombre} {customer.apellido}</p>
                            <p className='text-xs text-muted-foreground'>{customer.direccion_principal}</p>
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
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
