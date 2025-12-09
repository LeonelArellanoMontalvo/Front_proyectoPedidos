
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es requerido." }),
  apellido: z.string().min(2, { message: "El apellido es requerido." }),
  cedula: z.string().min(10, { message: "La cédula debe tener 10 dígitos." }).max(10, { message: "La cédula debe tener 10 dígitos." }),
  telefono: z.string().min(10, { message: "El teléfono debe tener 10 dígitos." }).max(10, { message: "El teléfono debe tener 10 dígitos." }),
  email: z.string().email({ message: "Por favor, ingresa un correo válido." }),
  direccion_principal: z.string().min(5, { message: "La dirección es requerida." }),
  contrasena: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
});

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      cedula: "",
      telefono: "",
      email: "",
      direccion_principal: "",
      contrasena: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = await register(values);
    setIsLoading(false);

    if (success) {
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: "No se pudo crear la cuenta. El correo o la cédula ya podrían estar en uso.",
      });
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo/>
            </div>
          <CardTitle className="font-headline text-3xl">Crea tu Cuenta</CardTitle>
          <CardDescription>
            Únete para disfrutar de la mejor comida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Tu nombre" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="apellido" render={({ field }) => (
                  <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input placeholder="Tu apellido" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField control={form.control} name="cedula" render={({ field }) => (
                  <FormItem><FormLabel>Cédula</FormLabel><FormControl><Input placeholder="0102030405" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="telefono" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="0991234567" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="tu@correo.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="direccion_principal" render={({ field }) => (
                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Textarea placeholder="Tu dirección completa" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="contrasena" render={({ field }) => (
                <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline text-primary">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
