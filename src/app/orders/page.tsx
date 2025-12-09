
"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from "@/context/auth-context";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/protected-route";
import { History } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function OrdersPage() {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.post('/graphql', { query: GET_PEDIDOS_QUERY });
            const allOrders = response.data.data?.pedidos || [];
            const filteredOrders = allOrders.filter((order: Order) => order.usuarioCedula === user.cedula);
            setUserOrders(filteredOrders.sort((a: Order, b: Order) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()));
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
    fetchOrders();
  }, [user, toast]);

  return (
    <ProtectedRoute allowedRoles={['CLIENTE']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <History className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Mis Pedidos</h1>
            <p className="text-lg text-muted-foreground">Aquí puedes ver el historial de tus pedidos.</p>
          </div>
        </div>
        
        {loading ? (
             <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
             </div>
        ) : userOrders.length > 0 ? (
          <div className="space-y-6">
            {userOrders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Pedido #{order.id}</CardTitle>
                    <Badge variant={getStatusVariant(order.estadoPedido)} className="mt-2 sm:mt-0">{order.estadoPedido}</Badge>
                  </div>
                  <CardDescription>
                    Fecha: {new Date(order.fechaPedido).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">Detalles del pedido:</p>
                  <ul className="space-y-2">
                    {order.detalles.map(detail => (
                        <li key={detail.id} className="flex justify-between items-center text-sm">
                          <span>{detail.cantidad}x {detail.platillo.nombreItem}</span>
                          <span>${detail.subtotal.toFixed(2)}</span>
                        </li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                   <div className="text-sm">
                        <p><strong>Tipo de Entrega:</strong> {order.tipoEntrega}</p>
                        {order.tipoEntrega === 'Delivery' && <p><strong>Dirección:</strong> {order.direccionEntrega}</p>}
                   </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
                  <div className="w-full flex justify-end items-center font-bold text-lg">
                    <span>Total: ${order.montoTotal.toFixed(2)}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">Aún no tienes pedidos</h2>
            <p className="text-muted-foreground mt-2">¡Explora nuestro menú y haz tu primer pedido!</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
