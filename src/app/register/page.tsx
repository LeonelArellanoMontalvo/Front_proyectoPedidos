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

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es requerido." }),
  apellido: z.string().min(2, { message: "El apellido es requerido." }),
  email: z.string().email({ message: "Por favor, ingresa un correo válido." }),
  contrasena: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
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
      email: "",
      contrasena: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // The API implementation for register is pending
    // For now, we show a toast message.
    // const success = await register(values);
    setIsLoading(false);

    toast({
        variant: "destructive",
        title: "Función no implementada",
        description: "El registro de usuarios aún no está conectado a la API.",
    });
    
    // if (success) {
    //   toast({
    //     title: "¡Registro Exitoso!",
    //     description: "Tu cuenta ha sido creada. ¡Bienvenido!",
    //   });
    // } else {
    //   toast({
    //     variant: "destructive",
    //     title: "Error en el registro",
    //     description: "El correo electrónico o la cédula ya están en uso.",
    //   });
    // }
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
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
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="tu@correo.com" {...field} /></FormControl><FormMessage /></FormItem>
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
