
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
import { ReceiptText, Search, FileDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // Consumiendo la API REST configurada en next.config.ts rewrites
        const response = await axios.get("/api/facturacion");
        // Nota: Asegúrate de que el backend devuelva un array de facturas
        setInvoices(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error cargando facturas:", err);
        toast({
          variant: "destructive",
          title: "Error al cargar facturas",
          description: "No se pudieron obtener los datos de la API REST.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [toast]);

  const filteredInvoices = invoices.filter(inv => 
    inv.codigoFactura.toLowerCase().includes(filter.toLowerCase()) ||
    inv.clienteNombre.toLowerCase().includes(filter.toLowerCase()) ||
    inv.clienteCedula.includes(filter)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <ReceiptText className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold">Módulo de Facturación</h1>
          <p className="text-muted-foreground">Gestión y consulta de facturas generadas vía API REST.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por código, nombre o cédula..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell colSpan={8}>
                            <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                 ))
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-bold text-primary">{inv.codigoFactura}</TableCell>
                    <TableCell>{inv.clienteNombre}</TableCell>
                    <TableCell>{inv.clienteCedula}</TableCell>
                    <TableCell>{new Date(inv.fechaEmision).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.subtotal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.iva)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(inv.total)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm">
                        Ver PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No se encontraron facturas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
