
"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptText, Search, Eye, FileText, Printer, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/select';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Invoice, User, Dish } from "@/lib/types";
import { formatCurrency, calculateIVA, calculateTotal } from "@/lib/calculations";
import { useAuth } from "@/context/auth-context";

interface InvoiceDetailForm {
  itemId: number;
  cantidad: number;
  precioUnitario: number;
}

export default function BillingPage() {
  const { isVendedor } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  // Form State
  const [selectedCustomerCedula, setSelectedCustomerCedula] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('Venta directa');
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetailForm[]>([{ itemId: 0, cantidad: 1, precioUnitario: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const tokenString = window.localStorage.getItem('access_token');
      const token = tokenString ? JSON.parse(tokenString) : null;

      const [invoicesRes, graphqlRes] = await Promise.all([
        axios.get("/api/facturacion", { headers: { Authorization: `Bearer ${token}` } }),
        axios.post("/graphql", {
          query: `
            query {
              usuarios { cedula nombre apellido email telefono direccionPrincipal rol { nombre } }
              platillos { id nombreItem precio disponible estado }
            }
          `
        })
      ]);

      setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
      const allUsers = graphqlRes.data.data?.usuarios || [];
      setCustomers(allUsers.filter((u: User) => u.rol.nombre === 'CLIENTE'));
      setDishes(graphqlRes.data.data?.platillos.filter((d: Dish) => d.estado === 'ACTIVO' && d.disponible) || []);

    } catch (err: any) {
      console.error("Error loading billing data:", err);
      toast({
        variant: "destructive",
        title: "Error al cargar datos",
        description: "No se pudo sincronizar con la API.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [toast]);

  const filteredInvoices = invoices.filter(inv => 
    inv.numeroFactura.toLowerCase().includes(filter.toLowerCase()) ||
    `${inv.usuario.nombre} ${inv.usuario.apellido}`.toLowerCase().includes(filter.toLowerCase()) ||
    inv.usuarioCedula.includes(filter)
  );

  const selectedCustomerData = customers.find(c => c.cedula === selectedCustomerCedula);

  const addItemRow = () => {
    setInvoiceDetails([...invoiceDetails, { itemId: 0, cantidad: 1, precioUnitario: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (invoiceDetails.length > 1) {
      setInvoiceDetails(invoiceDetails.filter((_, i) => i !== index));
    }
  };

  const updateItemRow = (index: number, field: keyof InvoiceDetailForm, value: any) => {
    const newDetails = [...invoiceDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    if (field === 'itemId') {
      const dish = dishes.find(d => d.id === value);
      if (dish) newDetails[index].precioUnitario = dish.precio;
    }
    
    setInvoiceDetails(newDetails);
  };

  const currentSubtotal = invoiceDetails.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  const currentIva = calculateIVA(currentSubtotal);
  const currentTotal = calculateTotal(currentSubtotal, currentIva);

  const handleSubmitInvoice = async () => {
    if (!selectedCustomerCedula) return toast({ variant: "destructive", title: "Error", description: "Seleccione un cliente." });
    if (invoiceDetails.some(d => d.itemId === 0)) return toast({ variant: "destructive", title: "Error", description: "Seleccione platillos para todos los ítems." });

    setIsSubmitting(true);
    try {
      const tokenString = window.localStorage.getItem('access_token');
      const token = tokenString ? JSON.parse(tokenString) : null;

      const payload = {
        usuarioCedula: selectedCustomerCedula,
        detalles: invoiceDetails.map(d => ({
          itemId: Number(d.itemId),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario)
        })),
        descripcion: invoiceDescription
      };

      await axios.post("/api/facturacion/crear-directa", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Factura Creada", description: "La factura directa ha sido generada exitosamente." });
      setIsFormOpen(false);
      fetchInitialData();
      
      setSelectedCustomerCedula('');
      setInvoiceDetails([{ itemId: 0, cantidad: 1, precioUnitario: 0 }]);
      setInvoiceDescription('Venta directa');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al crear factura",
        description: error.response?.data?.message || "Ocurrió un problema en el servidor REST."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedItemIds = invoiceDetails.map(d => d.itemId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <ReceiptText className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold">Módulo de Facturación</h1>
            <p className="text-muted-foreground">Consulta y gestión de comprobantes electrónicos generados.</p>
          </div>
        </div>
        
        {isVendedor && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Factura Directa (Venta)</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Seleccionar Cliente</Label>
                    <Select value={selectedCustomerCedula} onValueChange={setSelectedCustomerCedula}>
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => (
                          <SelectItem key={c.cedula} value={c.cedula}>
                            {c.nombre} {c.apellido} ({c.cedula})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cédula / RUC</Label>
                    <Input value={selectedCustomerCedula} readOnly className="bg-muted" />
                  </div>
                </div>

                {selectedCustomerData && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg text-xs">
                    <div>
                      <p className="font-semibold text-muted-foreground uppercase">Email</p>
                      <p>{selectedCustomerData.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground uppercase">Teléfono</p>
                      <p>{selectedCustomerData.telefono}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground uppercase">Dirección</p>
                      <p>{selectedCustomerData.direccionPrincipal}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold">Detalles del Pedido</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Agregar Platillo
                    </Button>
                  </div>
                  
                  {invoiceDetails.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-4">
                      <div className="col-span-5 space-y-2">
                        <Label className="text-[10px]">Platillo</Label>
                        <Select 
                          value={String(item.itemId)} 
                          onValueChange={(val) => updateItemRow(index, 'itemId', Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {dishes.map(d => (
                              <SelectItem 
                                key={d.id} 
                                value={String(d.id)}
                                disabled={selectedItemIds.includes(d.id) && item.itemId !== d.id}
                              >
                                {d.nombreItem} - ${d.precio.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[10px]">Cant.</Label>
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.cantidad} 
                          onChange={(e) => updateItemRow(index, 'cantidad', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[10px]">Precio U.</Label>
                        <Input value={`$${item.precioUnitario.toFixed(2)}`} readOnly className="bg-muted" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[10px]">Subtotal</Label>
                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50 font-medium">
                          ${(item.cantidad * item.precioUnitario).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive" 
                          onClick={() => removeItemRow(index)}
                          disabled={invoiceDetails.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>Descripción / Observaciones</Label>
                    <Textarea 
                      value={invoiceDescription}
                      onChange={(e) => setInvoiceDescription(e.target.value)}
                      placeholder="Ej. Evento especial, pedido de oficina..."
                      className="h-full min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2 bg-muted/20 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(currentSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IVA (15%)</span>
                      <span>{formatCurrency(currentIva)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(currentTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button onClick={handleSubmitInvoice} disabled={isSubmitting}>
                  {isSubmitting ? "Generando..." : "Emitir Factura"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:hidden">
          <CardTitle>Historial de Facturas</CardTitle>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por número, cliente o cédula..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Factura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="print:hidden">Tipo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center print:hidden">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono font-bold text-primary">{inv.numeroFactura}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{inv.usuario.nombre} {inv.usuario.apellido}</span>
                          <span className="text-xs text-muted-foreground">{inv.usuarioCedula}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(inv.fechaFactura).toLocaleDateString()}</TableCell>
                      <TableCell className="print:hidden">
                        <Badge variant="outline">{inv.tipoFactura}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(Number(inv.montoTotal))}
                      </TableCell>
                      <TableCell className="text-center space-x-2 print:hidden">
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(inv)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedInvoice(inv);
                          setTimeout(handlePrint, 100);
                        }}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No se encontraron facturas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {selectedInvoice && (
              <DialogContent className="max-w-2xl print:max-w-none print:w-full print:fixed print:top-0 print:left-0 print:h-full print:bg-white print:z-[1000] print:m-0 print:p-8">
                <DialogHeader className="print:mb-8">
                  <DialogTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Detalle de Factura {selectedInvoice.numeroFactura}
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">Cliente</p>
                      <p className="font-bold">{selectedInvoice.usuario.nombre} {selectedInvoice.usuario.apellido}</p>
                      <p className="text-xs">{selectedInvoice.usuario.email}</p>
                      <p className="text-xs">CI: {selectedInvoice.usuarioCedula}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-muted-foreground">Fecha Emisión</p>
                      <p>{new Date(selectedInvoice.fechaFactura).toLocaleString()}</p>
                      <p className="mt-2 font-semibold text-muted-foreground">Tipo</p>
                      <Badge variant="outline">{selectedInvoice.tipoFactura}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-semibold mb-3">Ítems</p>
                    <div className="space-y-3">
                      {selectedInvoice.detalles.map((det) => (
                        <div key={det.id} className="flex justify-between text-sm border-b pb-2">
                          <div className="flex flex-col">
                            <span className="font-medium">{det.cantidad}x {det.platillo?.nombreItem || det.descripcionItem}</span>
                            <span className="text-xs text-muted-foreground">P. Unitario: {formatCurrency(Number(det.precioUnitario))}</span>
                          </div>
                          <span className="font-semibold">{formatCurrency(Number(det.subtotal))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1 text-sm bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(Number(selectedInvoice.montoSubtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA (15%)</span>
                      <span>{formatCurrency(Number(selectedInvoice.montoIva))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(Number(selectedInvoice.montoTotal))}</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-muted-foreground mt-8 hidden print:block">
                    <p>Gracias por su compra en Pedido Listo.</p>
                    <p>Este es un comprobante electrónico generado automáticamente.</p>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #radix-\:rq\:, #radix-\:rq\: * {
            visibility: visible;
          }
          .print\:hidden {
            display: none !important;
          }
          .print\:shadow-none {
            box-shadow: none !important;
          }
          .print\:border-none {
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
