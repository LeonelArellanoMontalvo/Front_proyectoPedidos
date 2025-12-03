"use client";

import Image from 'next/image';
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
import placeholderData from '@/lib/placeholder-images.json';

const dishImages = placeholderData.placeholderImages.filter(p => p.description.includes('dish'));

const getImageForDish = (dishId: number) => {
    if (!dishImages.length) return { imageUrl: '', imageHint: '' };
    // Use item_id to get a consistent image, trying to match by ID first.
    const specificImage = dishImages.find(p => p.id === `dish-${dishId}`);
    if (specificImage) {
        return specificImage;
    }
    // Fallback to a deterministic modulo operation if no direct match is found.
    return dishImages[dishId % dishImages.length];
}

export function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmitOrder = () => {
    // This is where you would call the API to create the order
    console.log("Submitting order for user:", user?.cedula, { items: cartItems, total: cartTotal });
    toast({
      title: "¡Pedido Enviado!",
      description: "Tu pedido ha sido recibido y está siendo procesado.",
    });
    clearCart();
    router.push('/orders');
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
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
              <div className="flex flex-col gap-4 p-6 pr-6">
                {cartItems.map((item) => {
                  const image = getImageForDish(item.item_id);
                  return (
                  <div key={item.item_id} className="flex items-start gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={image.imageUrl}
                        alt={item.nombre_item}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.nombre_item}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.precio.toFixed(2)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.item_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )})}
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
                  <SheetClose asChild>
                    <Button onClick={handleSubmitOrder}>Enviar Pedido</Button>
                  </SheetClose>
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
                <Button>Ver Menú</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
