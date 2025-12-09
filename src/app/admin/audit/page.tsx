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
import { ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface AuditLog {
    id: string;
    usuarioCedula: string;
    fechaHora: string;
    tipoAccion: string;
    nombreTabla: string;
    registroId: string;
    datosAnteriores: any;
    datosNuevos: any;
}

const GET_AUDITORIAS_QUERY = `
  query {
    auditorias {
      id
      usuarioCedula
      fechaHora
      tipoAccion
      nombreTabla
      registroId
      datosAnteriores
      datosNuevos
    }
  }
`;

export default function AuditPage() {
  const [registros, setRegistros] = useState<AuditLog[]>([]);
  const [filteredRegistros, setFilteredRegistros] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    id: '',
    usuarioCedula: '',
    tipoAccion: '',
    nombreTabla: '',
    registroId: '',
    fechaHora: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/graphql", { 
                query: GET_AUDITORIAS_QUERY 
            });
            const sortedData = response.data.data?.auditorias.sort((a: AuditLog, b: AuditLog) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
            setRegistros(sortedData || []);
            setFilteredRegistros(sortedData || []);
        } catch (err) {
            console.error("Error cargando auditoría:", err);
            toast({
                variant: "destructive",
                title: "Error al cargar auditoría",
                description: "No se pudieron obtener los datos de la API.",
            });
        } finally {
            setLoading(false);
        }
    };
    fetchAuditLogs();
  }, [toast]);

  useEffect(() => {
    let filteredData = registros;
    if (filters.id) {
        filteredData = filteredData.filter(log => log.id.toLowerCase().includes(filters.id.toLowerCase()));
    }
    if (filters.usuarioCedula) {
        filteredData = filteredData.filter(log => log.usuarioCedula.toLowerCase().includes(filters.usuarioCedula.toLowerCase()));
    }
    if (filters.tipoAccion) {
        filteredData = filteredData.filter(log => log.tipoAccion.toLowerCase().includes(filters.tipoAccion.toLowerCase()));
    }
    if (filters.nombreTabla) {
        filteredData = filteredData.filter(log => log.nombreTabla.toLowerCase().includes(filters.nombreTabla.toLowerCase()));
    }
    if (filters.registroId) {
        filteredData = filteredData.filter(log => log.registroId.toLowerCase().includes(filters.registroId.toLowerCase()));
    }
    if (filters.fechaHora) {
        filteredData = filteredData.filter(log => new Date(log.fechaHora).toLocaleString().toLowerCase().includes(filters.fechaHora.toLowerCase()));
    }

    setFilteredRegistros(filteredData);
  }, [filters, registros]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold">Registros de Auditoría</h1>
          <p className="text-muted-foreground">Consulta las acciones realizadas en el sistema.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cambios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cédula Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tabla</TableHead>
                <TableHead>ID Registro</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Datos Anteriores</TableHead>
                <TableHead>Datos Nuevos</TableHead>
              </TableRow>
               <TableRow>
                    <TableCell><Input placeholder="Filtrar ID..." name="id" value={filters.id} onChange={handleFilterChange} /></TableCell>
                    <TableCell><Input placeholder="Filtrar Cédula..." name="usuarioCedula" value={filters.usuarioCedula} onChange={handleFilterChange} /></TableCell>
                    <TableCell><Input placeholder="Filtrar Acción..." name="tipoAccion" value={filters.tipoAccion} onChange={handleFilterChange} /></TableCell>
                    <TableCell><Input placeholder="Filtrar Tabla..." name="nombreTabla" value={filters.nombreTabla} onChange={handleFilterChange} /></TableCell>
                    <TableCell><Input placeholder="Filtrar ID Registro..." name="registroId" value={filters.registroId} onChange={handleFilterChange} /></TableCell>
                    <TableCell><Input placeholder="Filtrar Fecha..." name="fechaHora" value={filters.fechaHora} onChange={handleFilterChange} /></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
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
              ) : filteredRegistros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.usuarioCedula}</TableCell>
                  <TableCell>{r.tipoAccion}</TableCell>
                  <TableCell>{r.nombreTabla}</TableCell>
                  <TableCell>{r.registroId}</TableCell>
                  <TableCell>{new Date(r.fechaHora).toLocaleString()}</TableCell>
                  <TableCell><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(r.datosAnteriores, null, 2)}</pre></TableCell>
                  <TableCell><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(r.datosNuevos, null, 2)}</pre></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
