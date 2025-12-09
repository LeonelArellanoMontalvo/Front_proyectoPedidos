
"use client";

import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import type { CartItem, Dish } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Dish) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateNotes: (itemId: number, notes: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cart', []);
  const { toast } = useToast();

  const addToCart = (item: Dish) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1, notasAdicionales: '' }];
    });
    toast({
      title: "Platillo agregado",
      description: `${item.nombreItem} fue agregado a tu pedido.`,
    })
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
    }
  };

  const updateNotes = (itemId: number, notes: string) => {
    setCartItems(prevItems => 
      prevItems.map(i => 
        i.id === itemId ? { ...i, notasAdicionales: notes } : i
      )
    )
  }

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.precio * item.quantity, 0);
  }, [cartItems]);
  
  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
