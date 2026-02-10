
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function AdminInvoicePrintPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const tokenString = window.localStorage.getItem('access_token');
        const token = tokenString ? JSON.parse(tokenString) : null;
        
        const response = await axios.get("/api/facturacion", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const found = response.data.find((inv: Invoice) => String(inv.id) === String(params.id));
        
        if (found) {
          setInvoice(found);
        } else {
          toast({ variant: "destructive", title: "Error", description: "No se encontró la factura." });
          router.push("/admin/billing");
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la factura." });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchInvoice();
  }, [params.id, router, toast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Cargando factura para impresión...</p>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-muted/30 pb-20 print:bg-white print:min-h-0 print:pb-0">
      {/* Barra de herramientas - No se imprime */}
      <div className="sticky top-0 z-50 w-full bg-background border-b px-4 py-3 print:hidden shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Vista Previa de Impresión</span>
             <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Factura
              </Button>
          </div>
        </div>
      </div>

      {/* Contenedor de la Factura */}
      <div className="container mx-auto px-4 py-8 print:p-0">
        <Card id="printable-invoice" className="max-w-3xl mx-auto shadow-none border-none sm:border print:m-0 print:p-0 print:w-full print:border-none">
          <CardContent className="p-8 sm:p-12 print:p-0">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-1">Pedido Listo</h1>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Comprobante de Venta Electrónico</p>
              </div>
              <div className="text-right">
                <div className="bg-primary/10 px-4 py-2 rounded-lg inline-block mb-2 print:border print:border-primary/20">
                    <p className="font-mono font-bold text-primary text-xl">{invoice.numeroFactura}</p>
                </div>
                <p className="text-sm text-muted-foreground">{new Date(invoice.fechaFactura).toLocaleString()}</p>
              </div>
            </div>

            <Separator className="mb-8" />

            <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
              <div className="space-y-1">
                <p className="font-bold text-muted-foreground uppercase text-[10px] mb-2">Información del Cliente</p>
                <p className="text-base font-bold">{invoice.usuario.nombre} {invoice.usuario.apellido}</p>
                <p><span className="font-semibold">Cédula/RUC:</span> {invoice.usuarioCedula}</p>
                <p><span className="font-semibold">Teléfono:</span> {invoice.usuario.telefono}</p>
                <p className="italic text-muted-foreground">{invoice.usuario.direccionPrincipal}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-muted-foreground uppercase text-[10px] mb-2">Detalles del Documento</p>
                <p><span className="font-semibold">Tipo:</span> {invoice.tipoFactura}</p>
                <div className="pt-2">
                    <Badge variant="outline" className="font-mono">{invoice.estadoFactura}</Badge>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-8 print:border-gray-300">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b print:bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">Cant.</th>
                    <th className="px-4 py-3 text-left font-bold">Descripción</th>
                    <th className="px-4 py-3 text-right font-bold">P. Unit.</th>
                    <th className="px-4 py-3 text-right font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y print:divide-gray-200">
                  {invoice.detalles.map((det) => (
                    <tr key={det.id}>
                      <td className="px-4 py-4">{det.cantidad}</td>
                      <td className="px-4 py-4 font-medium">{det.platillo?.nombreItem || det.descripcionItem}</td>
                      <td className="px-4 py-4 text-right">{formatCurrency(Number(det.precioUnitario))}</td>
                      <td className="px-4 py-4 text-right font-semibold">{formatCurrency(Number(det.subtotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-12">
              <div className="w-full max-w-[280px] space-y-3 bg-muted/20 p-6 rounded-xl border border-muted print:bg-gray-50 print:border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(Number(invoice.montoSubtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (12%):</span>
                  <span className="font-medium">{formatCurrency(Number(invoice.montoIva))}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-base font-bold">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(Number(invoice.montoTotal))}</span>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-muted-foreground border-t pt-6 space-y-1 print:border-gray-200">
              <p className="font-bold uppercase">¡Gracias por su compra!</p>
              <p>Este documento es un comprobante válido de la transacción realizada.</p>
              <p className="italic">Generado por el Sistema de Pedidos "Pedido Listo"</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .print\:hidden {
            display: none !important;
          }
          #printable-invoice {
            width: 100% !important;
            margin: 0 !important;
            padding: 2cm !important;
            border: none !important;
            box-shadow: none !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
