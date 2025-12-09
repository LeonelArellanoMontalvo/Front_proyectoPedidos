
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Eye } from 'lucide-react';
import type { Order, OrderDetail } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

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
        notasAdicionales
        platillo {
          id
          nombreItem
        }
      }
    }
  }
`;

const UPDATE_PEDIDO_MUTATION = `
    mutation UpdatePedidoEstado($updatePedidoInput: UpdatePedidoInput!) {
        updatePedido(updatePedidoInput: $updatePedidoInput) {
            id
            estadoPedido
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState({
    id: '',
    cliente: '',
    fecha: '',
    total: '',
    estado: ''
  });
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
        const response = await axios.post('/graphql', { query: GET_PEDIDOS_QUERY });
        const allOrders = response.data.data?.pedidos || [];
        const sortedOrders = allOrders.sort((a: Order, b: Order) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime());
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
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

  useEffect(() => {
    let filteredData = orders;
    if (filters.id) {
        filteredData = filteredData.filter(o => o.id.toString().includes(filters.id));
    }
    if (filters.cliente) {
        filteredData = filteredData.filter(o => (o.usuario?.nombre || o.usuarioCedula).toLowerCase().includes(filters.cliente.toLowerCase()));
    }
    if (filters.fecha) {
        filteredData = filteredData.filter(o => new Date(o.fechaPedido).toLocaleDateString().toLowerCase().includes(filters.fecha.toLowerCase()));
    }
    if (filters.total) {
        filteredData = filteredData.filter(o => o.montoTotal.toString().includes(filters.total));
    }
    if (filters.estado) {
        filteredData = filteredData.filter(o => o.estadoPedido.toLowerCase().includes(filters.estado.toLowerCase()));
    }
    setFilteredOrders(filteredData);
  }, [filters, orders]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
  };


  const handleStatusChange = async (orderId: number, newStatus: Order['estadoPedido']) => {
    const originalOrders = [...orders];
    
    // Optimistic update
    const updateState = (orderList: Order[]) => orderList.map(order =>
        order.id === orderId ? { ...order, estadoPedido: newStatus } : order
    );
    setOrders(updateState);
    setFilteredOrders(updateState);

    try {
        await axios.post('/graphql', {
            query: UPDATE_PEDIDO_MUTATION,
            variables: {
                updatePedidoInput: {
                    id: orderId,
                    estadoPedido: newStatus
                }
            }
        });
        toast({
            title: "Estado Actualizado",
            description: `El pedido #${orderId} ha sido actualizado a "${newStatus}".`
        });
    } catch (error) {
        // Revert on error
        setOrders(originalOrders);
        setFilteredOrders(originalOrders);
        console.error("Error updating order status:", error);
        toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: "No se pudo cambiar el estado del pedido."
        });
    }
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

      <Dialog>
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
                  <TableHead>Cambiar Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
                <TableRow>
                  <TableCell><Input placeholder="Filtrar ID..." name="id" value={filters.id} onChange={handleFilterChange} /></TableCell>
                  <TableCell><Input placeholder="Filtrar cliente..." name="cliente" value={filters.cliente} onChange={handleFilterChange} /></TableCell>
                  <TableCell><Input placeholder="Filtrar fecha..." name="fecha" value={filters.fecha} onChange={handleFilterChange} /></TableCell>
                  <TableCell><Input placeholder="Filtrar total..." name="total" value={filters.total} onChange={handleFilterChange} /></TableCell>
                  <TableCell><Input placeholder="Filtrar estado..." name="estado" value={filters.estado} onChange={handleFilterChange} /></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                          Cargando pedidos...
                      </TableCell>
                  </TableRow>
                ) : filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.usuario?.nombre || order.usuarioCedula}</TableCell>
                    <TableCell>{new Date(order.fechaPedido).toLocaleDateString()}</TableCell>
                    <TableCell>${order.montoTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.estadoPedido)}>{order.estadoPedido}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.estadoPedido}
                        onValueChange={(value: Order['estadoPedido']) =>
                          handleStatusChange(order.id, value)
                        }
                        disabled={order.estadoPedido === 'Entregado' || order.estadoPedido === 'Cancelado'}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Autorizado">Autorizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                          <DialogTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-4 w-4" />
                              </Button>
                          </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {selectedOrder && (
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Detalles del Pedido #{selectedOrder.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                  <div>
                      <h4 className="font-semibold">Cliente:</h4>
                      <p>{selectedOrder.usuario?.nombre || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.usuario?.email || selectedOrder.usuarioCedula}</p>
                  </div>
                  <div>
                      <h4 className="font-semibold">Entrega:</h4>
                      <p>{selectedOrder.tipoEntrega} - {selectedOrder.direccionEntrega}</p>
                  </div>
                  <Separator />
                  <div>
                      <h4 className="font-semibold mb-2">Platillos:</h4>
                      <ul className="space-y-3">
                          {selectedOrder.detalles.map((detail: OrderDetail) => (
                              <li key={detail.id} className="flex justify-between items-start text-sm border-b pb-2 last:border-b-0 last:pb-0">
                                  <div>
                                      <p><span className="font-medium">{detail.cantidad}x</span> {detail.platillo.nombreItem}</p>
                                      <p className="text-xs text-muted-foreground italic">
                                        Notas: {detail.notasAdicionales || 'S/N'}
                                      </p>
                                  </div>
                                  <p className="font-medium">${detail.subtotal.toFixed(2)}</p>
                              </li>
                          ))}
                      </ul>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                      <p>Monto Total:</p>
                      <p>${selectedOrder.montoTotal.toFixed(2)}</p>
                  </div>
              </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
