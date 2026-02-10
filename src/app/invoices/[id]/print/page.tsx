
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
import ProtectedRoute from "@/components/protected-route";

export default function ClientInvoicePrintPage() {
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

        const response = await axios.get("/api/facturacion/mis-facturas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const found = response.data.find((inv: Invoice) => String(inv.id) === String(params.id));
        
        if (found) {
          setInvoice(found);
        } else {
          toast({ variant: "destructive", title: "Error", description: "No se encontró la factura." });
          router.push("/invoices");
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
        <p>Cargando tu factura...</p>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <ProtectedRoute allowedRoles={['CLIENTE']}>
      <div className="min-h-screen bg-muted/30 pb-20">
        <div className="sticky top-0 z-50 w-full bg-background border-b px-4 py-3 print:hidden shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Comprobante Electrónico</span>
               <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Factura
                </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card id="printable-invoice" className="max-w-3xl mx-auto shadow-none border-none sm:border print:m-0 print:p-0 print:w-full">
            <CardContent className="p-8 sm:p-12 print:p-0">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-1">Pedido Listo</h1>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Documento Electrónico de Compra</p>
                </div>
                <div className="text-right">
                  <div className="bg-primary/10 px-4 py-2 rounded-lg inline-block mb-2">
                      <p className="font-mono font-bold text-primary text-xl">{invoice.numeroFactura}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(invoice.fechaFactura).toLocaleString()}</p>
                </div>
              </div>

              <Separator className="mb-8" />

              <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
                <div className="space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-[10px] mb-2">Datos del Cliente</p>
                  <p className="text-base font-bold">{invoice.usuario.nombre} {invoice.usuario.apellido}</p>
                  <p><span className="font-semibold">CI / RUC:</span> {invoice.usuarioCedula}</p>
                  <p className="italic text-muted-foreground">{invoice.usuario.direccionPrincipal}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-muted-foreground uppercase text-[10px] mb-2">Estado del Pago</p>
                  <Badge variant="outline" className="font-mono uppercase px-3 py-1">{invoice.estadoFactura}</Badge>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Cant.</th>
                      <th className="px-4 py-3 text-left font-bold">Descripción</th>
                      <th className="px-4 py-3 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.detalles.map((det) => (
                      <tr key={det.id}>
                        <td className="px-4 py-4">{det.cantidad}</td>
                        <td className="px-4 py-4 font-medium">{det.platillo?.nombreItem || det.descripcionItem}</td>
                        <td className="px-4 py-4 text-right font-semibold">{formatCurrency(Number(det.subtotal))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-12">
                <div className="w-full max-w-[280px] space-y-3 bg-muted/20 p-6 rounded-xl border border-muted">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(Number(invoice.montoSubtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (12%):</span>
                    <span>{formatCurrency(Number(invoice.montoIva))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-base font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(Number(invoice.montoTotal))}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-muted-foreground border-t pt-8 space-y-2">
                <p className="font-bold uppercase tracking-widest text-primary">¡Gracias por preferir Pedido Listo!</p>
                <p>Conserve este documento como respaldo de su compra.</p>
                <p className="italic">Este es un comprobante electrónico generado por nuestro sistema.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <style jsx global>{`
          @media print {
            body { background-color: white !important; }
            .print\:hidden { display: none !important; }
            #printable-invoice {
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              position: absolute;
              top: 0;
              left: 0;
            }
            @page { margin: 1.5cm; }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
