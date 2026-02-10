
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Printer, Receipt } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from "@/components/ui/separator";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import ProtectedRoute from "@/components/protected-route";

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMyInvoices = async () => {
      try {
        const tokenString = window.localStorage.getItem('access_token');
        const token = tokenString ? JSON.parse(tokenString) : null;

        const response = await axios.get("/api/facturacion/mis-facturas", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setInvoices(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error("Error loading my invoices:", err);
        toast({
          variant: "destructive",
          title: "Error al cargar facturas",
          description: "No se pudieron obtener tus facturas del servidor.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyInvoices();
  }, [toast]);

  return (
    <ProtectedRoute allowedRoles={['CLIENTE']}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Receipt className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold">Mis Facturas</h1>
            <p className="text-muted-foreground">Consulta y descarga tus comprobantes electrónicos de compra.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Comprobantes</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número de Factura</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono font-bold text-primary">{inv.numeroFactura}</TableCell>
                        <TableCell>{new Date(inv.fechaFactura).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="outline">{inv.tipoFactura}</Badge></TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(Number(inv.montoTotal))}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(inv)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <Button variant="ghost" size="icon" asChild>
                             <Link href={`/invoices/${inv.id}/print`}>
                                <Printer className="h-4 w-4" />
                             </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No se han encontrado facturas asociadas a tu cuenta.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {selectedInvoice && (
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Detalle de Factura
                      </div>
                      <Button variant="outline" size="sm" asChild>
                          <Link href={`/invoices/${selectedInvoice.id}/print`}>
                             <Printer className="mr-2 h-4 w-4" />
                             Imprimir
                          </Link>
                      </Button>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-primary">Pedido Listo</h2>
                            <p className="text-sm text-muted-foreground font-medium">Comprobante Electrónico</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono font-bold text-lg">{selectedInvoice.numeroFactura}</p>
                            <p className="text-sm text-muted-foreground">{new Date(selectedInvoice.fechaFactura).toLocaleString()}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase text-[10px] mb-1">Datos del Cliente</p>
                        <p className="font-bold text-base">{selectedInvoice.usuario.nombre} {selectedInvoice.usuario.apellido}</p>
                        <p>Cédula/RUC: {selectedInvoice.usuarioCedula}</p>
                        <p className="text-muted-foreground italic">{selectedInvoice.usuario.direccionPrincipal}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-muted-foreground uppercase text-[10px] mb-1">Detalles del Documento</p>
                        <p><span className="font-medium">Tipo:</span> {selectedInvoice.tipoFactura}</p>
                        <p className="mt-2 font-semibold text-muted-foreground uppercase text-[10px]">Estado</p>
                        <Badge variant="outline" className="mt-1">{selectedInvoice.estadoFactura}</Badge>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="h-10">Cant.</TableHead>
                            <TableHead className="h-10">Descripción del Platillo</TableHead>
                            <TableHead className="h-10 text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedInvoice.detalles.map((det) => (
                            <TableRow key={det.id}>
                              <TableCell className="py-3 font-medium">{det.cantidad}</TableCell>
                              <TableCell className="py-3">
                                  <p className="font-bold">{det.platillo?.nombreItem || det.descripcionItem}</p>
                                  <p className="text-[10px] text-muted-foreground">Precio Unitario: {formatCurrency(Number(det.precioUnitario))}</p>
                              </TableCell>
                              <TableCell className="py-3 text-right font-semibold">{formatCurrency(Number(det.subtotal))}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end">
                      <div className="w-full max-w-[240px] space-y-2 text-sm bg-muted/20 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(Number(selectedInvoice.montoSubtotal))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">IVA (12%):</span>
                          <span className="font-medium">{formatCurrency(Number(selectedInvoice.montoIva))}</span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between font-bold text-xl pt-1">
                          <span>Total:</span>
                          <span className="text-primary">{formatCurrency(Number(selectedInvoice.montoTotal))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
