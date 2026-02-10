
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";

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
          // Establecer el título del documento para que el nombre del PDF sea el número de factura
          document.title = found.numeroFactura;
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
        <p>Generando documento...</p>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:m-0">
      {/* 1. INTERFAZ DE VISTA PREVIA (SOLO PANTALLA) */}
      <div className="print:hidden">
        <div className="sticky top-0 z-50 w-full bg-white border-b px-4 py-3 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Vista Previa Profesional</span>
              <Button onClick={handlePrint} size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir ahora
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white p-12 shadow-xl border rounded-lg">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-4xl font-black text-primary mb-1">PEDIDO LISTO</h1>
                <p className="text-sm font-bold tracking-widest text-gray-400">RUC: 1005299489001</p>
              </div>
              <div className="text-right border-l-4 border-primary pl-6">
                <p className="text-lg font-bold text-gray-500 uppercase">Factura de Venta</p>
                <p className="text-3xl font-mono font-bold">{invoice.numeroFactura}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-10 bg-muted/30 p-6 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase">Cliente</p>
                <p className="font-bold text-lg">{invoice.usuario.nombre} {invoice.usuario.apellido}</p>
                <p className="text-sm">CI: {invoice.usuarioCedula}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase">Emisión</p>
                <p className="font-bold">{new Date(invoice.fechaFactura).toLocaleDateString()}</p>
                <p className="text-sm">{invoice.tipoFactura} | {invoice.estadoFactura}</p>
              </div>
            </div>

            <table className="w-full mb-10">
              <thead>
                <tr className="border-b-2 border-primary text-left">
                  <th className="py-2">Cant.</th>
                  <th className="py-2">Descripción</th>
                  <th className="py-2 text-right">Precio</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.detalles.map((det) => (
                  <tr key={det.id}>
                    <td className="py-4">{det.cantidad}</td>
                    <td className="py-4 font-medium">{det.platillo?.nombreItem || det.descripcionItem}</td>
                    <td className="py-4 text-right">{formatCurrency(Number(det.precioUnitario))}</td>
                    <td className="py-4 text-right font-bold">{formatCurrency(Number(det.subtotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(Number(invoice.montoSubtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (12%):</span>
                  <span>{formatCurrency(Number(invoice.montoIva))}</span>
                </div>
                <div className="flex justify-between text-2xl font-black border-t-2 pt-2 text-primary">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(Number(invoice.montoTotal))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FORMATO DE IMPRESIÓN (SOLO IMPRESORA - DOCUMENTO SIMPLE) */}
      <div className="hidden print:block p-0 m-0 text-black bg-white w-full">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold">PEDIDO LISTO</h1>
          <p className="text-sm">RUC: 1005299489001 | Tel: (06) 2645-123</p>
          <p className="text-sm">Dirección: Av. Principal y 10 de Agosto, Ibarra, Ecuador</p>
        </div>

        <div className="flex justify-between mb-8">
          <div className="text-sm space-y-1">
            <p><strong>CLIENTE:</strong> {invoice.usuario.nombre} {invoice.usuario.apellido}</p>
            <p><strong>CI/RUC:</strong> {invoice.usuarioCedula}</p>
            <p><strong>DIRECCIÓN:</strong> {invoice.usuario.direccionPrincipal}</p>
          </div>
          <div className="text-right text-sm space-y-1">
            <p className="text-lg font-bold">FACTURA: {invoice.numeroFactura}</p>
            <p><strong>FECHA:</strong> {new Date(invoice.fechaFactura).toLocaleString()}</p>
            <p><strong>TIPO:</strong> {invoice.tipoFactura}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-y border-black">
              <th className="py-2 text-left">CANT.</th>
              <th className="py-2 text-left">DESCRIPCIÓN</th>
              <th className="py-2 text-right">P. UNIT</th>
              <th className="py-2 text-right">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {invoice.detalles.map((det) => (
              <tr key={det.id} className="border-b border-gray-200">
                <td className="py-2">{det.cantidad}</td>
                <td className="py-2">{det.platillo?.nombreItem || det.descripcionItem}</td>
                <td className="py-2 text-right">{formatCurrency(Number(det.precioUnitario))}</td>
                <td className="py-2 text-right">{formatCurrency(Number(det.subtotal))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-48 text-sm space-y-1">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{formatCurrency(Number(invoice.montoSubtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA 12%:</span>
              <span>{formatCurrency(Number(invoice.montoIva))}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-black pt-1">
              <span>TOTAL:</span>
              <span>{formatCurrency(Number(invoice.montoTotal))}</span>
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[10px] text-gray-400 italic">Documento generado electrónicamente - Pedido Listo ©</p>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
          .hidden.print\:block {
            display: block !important;
          }
          /* Asegurar que el contenido principal ocupe todo el ancho al ocultar sidebar y header */
          div[class*="flex-1"], main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
