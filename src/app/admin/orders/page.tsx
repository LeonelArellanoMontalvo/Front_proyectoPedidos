"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import type { Order } from '@/lib/types';
import { pedidos as mockPedidos } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

function getStatusVariant(status: Order['estado_pedido']) {
    switch (status) {
        case 'Pendiente': return 'secondary';
        case 'Autorizado': return 'default';
        case 'Enviado': return 'default';
        case 'Entregado': return 'outline';
        case 'Cancelado': return 'destructive';
        default: return 'secondary';
    }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockPedidos.sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime()));
  const { toast } = useToast();

  const handleStatusChange = (orderId: number, newStatus: "Pendiente" | "Autorizado") => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.pedido_id === orderId ? { ...order, estado_pedido: newStatus } : order
      )
    );
    toast({
        title: "Estado Actualizado",
        description: `El pedido #${orderId} ha sido actualizado a "${newStatus}".`
    })
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">Revisa y actualiza el estado de los pedidos de los clientes.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido ID</TableHead>
                <TableHead>Cédula Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado Actual</TableHead>
                <TableHead className="text-right">Cambiar Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.pedido_id}>
                  <TableCell className="font-medium">#{order.pedido_id}</TableCell>
                  <TableCell>{order.usuario_cedula}</TableCell>
                  <TableCell>{new Date(order.fecha_pedido).toLocaleDateString()}</TableCell>
                  <TableCell>${order.monto_total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.estado_pedido)}>{order.estado_pedido}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={order.estado_pedido}
                      onValueChange={(value: "Pendiente" | "Autorizado") =>
                        handleStatusChange(order.pedido_id, value)
                      }
                      disabled={order.estado_pedido === 'Entregado' || order.estado_pedido === 'Cancelado'}
                    >
                      <SelectTrigger className="w-[150px] ml-auto">
                        <SelectValue placeholder="Cambiar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Autorizado">Autorizado</SelectItem>
                      </SelectContent>
                    </Select>
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
