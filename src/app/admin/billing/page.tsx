
"use client";

import React, { useEffect, useState } from "react";
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
import { ReceiptText, Search, Eye, FileText, Printer } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Separator } from "@/components/ui/separator";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const token = window.localStorage.getItem('access_token');
        const cleanToken = token ? JSON.parse(token) : null;

        const response = await axios.get("/api/facturacion", {
          headers: {
            Authorization: `Bearer ${cleanToken}`
          }
        });
        
        setInvoices(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error("Error cargando facturas:", err);
        toast({
          variant: "destructive",
          title: "Error al cargar facturas",
          description: err.response?.data?.message || "No se pudo conectar con la API REST.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [toast]);

  const filteredInvoices = invoices.filter(inv => 
    inv.numeroFactura.toLowerCase().includes(filter.toLowerCase()) ||
    `${inv.usuario.nombre} ${inv.usuario.apellido}`.toLowerCase().includes(filter.toLowerCase()) ||
    inv.usuarioCedula.includes(filter)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 print:hidden">
        <ReceiptText className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold">Módulo de Facturación</h1>
          <p className="text-muted-foreground">Consulta y gestión de comprobantes electrónicos generados.</p>
        </div>
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
