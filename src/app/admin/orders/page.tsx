
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
import { useToast } from '@/hooks/use-toast';

const GET_PEDIDOS_QUERY = `
  query {
    pedidos {
      id
      usuarioCedula
      tipoEntrega
      direccionEntrega
      montoTotal
      estadoPedido
      estado
      fechaPedido
      usuario {
        cedula
        nombre
        email
      }
      detalles {
        id
        cantidad
        precioUnitario
        subtotal
        platillo {
          id
          nombreItem
        }
      }
    }
  }
`;

function getStatusVariant(status: Order['estadoPedido']) {
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
        const response = await axios.post('/graphql', { query: GET_PEDIDOS_QUERY });
        const allOrders = response.data.data?.pedidos || [];
        setOrders(allOrders.sort((a: Order, b: Order) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()));
    } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
            variant: "destructive",
            title: "Error al cargar pedidos",
            description: "No se pudieron obtener los datos de la API.",
        });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId: number, newStatus: "Pendiente" | "Autorizado") => {
    // This will need a mutation later
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId ? { ...order, estadoPedido: newStatus } : order
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
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado Actual</TableHead>
                <TableHead className="text-right">Cambiar Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Cargando pedidos...
                    </TableCell>
                </TableRow>
              ) : orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.usuario?.nombre || order.usuarioCedula}</TableCell>
                  <TableCell>{new Date(order.fechaPedido).toLocaleDateString()}</TableCell>
                  <TableCell>${order.montoTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.estadoPedido)}>{order.estadoPedido}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={order.estadoPedido}
                      onValueChange={(value: "Pendiente" | "Autorizado") =>
                        handleStatusChange(order.id, value)
                      }
                      disabled={order.estadoPedido === 'Entregado' || order.estadoPedido === 'Cancelado'}
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
