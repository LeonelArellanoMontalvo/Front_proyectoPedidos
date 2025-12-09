
"use client";

import Link from 'next/link';
import { ShoppingCart, Plus, Minus, X, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';

const CREATE_PEDIDO_MUTATION = `
  mutation CreatePedido($createPedidoInput: CreatePedidoInput!) {
    createPedido(createPedidoInput: $createPedidoInput) {
      id
      usuarioCedula
      montoTotal
    }
  }
`;

const CREATE_DETALLE_PEDIDO_MUTATION = `
  mutation CreateDetallePedido($createDetallePedidoInput: CreateDetallePedidoInput!) {
    createDetallePedido(createDetallePedidoInput: $createDetallePedidoInput) {
      id
    }
  }
`;


export function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleSubmitOrder = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para hacer un pedido." });
        return;
    }
    setIsSubmitting(true);

    try {
        // 1. Create the main order
        const pedidoResponse = await axios.post('/graphql', {
            query: CREATE_PEDIDO_MUTATION,
            variables: {
                createPedidoInput: {
                    usuarioCedula: user.cedula,
                    tipoEntrega: "Delivery", // Defaulting to Delivery for now
                    direccionEntrega: user.direccionPrincipal,
                    montoTotal: cartTotal,
                    estadoPedido: "Pendiente"
                }
            }
        });

        const createdPedido = pedidoResponse.data.data?.createPedido;
        if (!createdPedido || !createdPedido.id) {
            throw new Error("No se pudo crear el pedido.");
        }
        
        const pedidoId = createdPedido.id;

        // 2. Create order details for each item in the cart
        for (const item of cartItems) {
            await axios.post('/graphql', {
                query: CREATE_DETALLE_PEDIDO_MUTATION,
                variables: {
                    createDetallePedidoInput: {
                        pedidoId: pedidoId,
                        itemId: item.id,
                        cantidad: item.quantity,
                        precioUnitario: item.precio,
                        subtotal: item.precio * item.quantity
                    }
                }
            });
        }

        toast({
            title: "¡Pedido Enviado!",
            description: "Tu pedido ha sido recibido y está siendo procesado.",
        });
        clearCart();
        router.push('/orders');

    } catch (error) {
        console.error("Error al enviar el pedido:", error);
        toast({
            variant: "destructive",
            title: "Error al enviar pedido",
            description: "No se pudo completar el pedido. Inténtalo de nuevo."
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {isClient && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Tu Pedido</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-6 pr-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.nombreItem}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.precio.toFixed(2)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 sm:justify-start">
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {isAuthenticated ? (
                  <Button onClick={handleSubmitOrder} disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Pedido"}
                  </Button>
                ) : (
                  <div className='text-center space-y-3 rounded-lg border-2 border-dashed border-primary/50 bg-accent/20 p-4'>
                    <div className='flex items-center justify-center gap-2 text-primary font-semibold'>
                        <AlertCircle className="h-5 w-5" />
                        <p>¡Casi listo!</p>
                    </div>
                    <p className='text-sm text-muted-foreground'>Por favor, inicia sesión o regístrate para completar tu pedido.</p>
                    <div className="flex gap-2 justify-center">
                        <SheetClose asChild>
                            <Button asChild size="sm">
                                <Link href="/login">Iniciar Sesión</Link>
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                             <Button asChild variant="secondary" size="sm">
                                <Link href="/register">Registrarse</Link>
                            </Button>
                        </SheetClose>
                    </div>
                  </div>
                )}
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
            <h3 className="font-semibold">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground">
              Agrega platillos del menú para empezar.
            </p>
            <SheetClose asChild>
                <Button asChild>
                    <Link href="/">Ver Menú</Link>
                </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
