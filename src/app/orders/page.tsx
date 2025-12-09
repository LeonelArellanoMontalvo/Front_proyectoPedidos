"use client";

import { useAuth } from "@/context/auth-context";
import { pedidos as allOrders } from "@/lib/mock-data";
import { platillos as allDishes } from "@/lib/mock-data";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/protected-route";
import { History } from "lucide-react";

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

export default function OrdersPage() {
  const { user } = useAuth();
  
  // Logic to filter orders will need to be updated when API is connected
  // The current mock data uses `usuario_cedula`, but the new User type doesn't have `cedula`.
  // For now, let's show all orders for any logged in user for demonstration.
  const userOrders = user ? allOrders.sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime()) : [];

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
        
        {userOrders.length > 0 ? (
          <div className="space-y-6">
            {userOrders.map(order => (
              <Card key={order.pedido_id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Pedido #{order.pedido_id}</CardTitle>
                    <Badge variant={getStatusVariant(order.estado_pedido)} className="mt-2 sm:mt-0">{order.estado_pedido}</Badge>
                  </div>
                  <CardDescription>
                    Fecha: {new Date(order.fecha_pedido).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">Detalles del pedido:</p>
                  <ul className="space-y-2">
                    {order.detalles.map(detail => {
                      // This logic needs to be updated. `allDishes` is now empty and has a different structure.
                      // const dish = allDishes.find(d => d.id === detail.item_id);
                      return (
                        <li key={detail.detalle_id} className="flex justify-between items-center text-sm">
                          <span>{detail.cantidad}x Platillo ID: {detail.item_id}</span>
                          <span>${detail.subtotal.toFixed(2)}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <Separator className="my-4" />
                   <div className="text-sm">
                        <p><strong>Tipo de Entrega:</strong> {order.tipo_entrega}</p>
                        {order.tipo_entrega === 'Delivery' && <p><strong>Dirección:</strong> {order.direccion_entrega}</p>}
                   </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
                  <div className="w-full flex justify-end items-center font-bold text-lg">
                    <span>Total: ${order.monto_total.toFixed(2)}</span>
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
