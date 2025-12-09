import type { User, Dish, Order } from './types';

// Mock Roles (as per schema)
// 1: CLIENTE
// 2: ADMINISTRADOR

export const usuarios: User[] = [
  {
    cedula: '1234567890',
    rol: { nombre: 'ADMINISTRADOR'},
    nombre: 'Admin',
    apellido: 'Principal',
    email: 'admin@pedidolisto.com',
    direccion_principal: 'Av. Siempre Viva 123',
    estado: 'ACTIVO',
    telefono: '0987654321',
  },
  {
    cedula: '0987654321',
    rol: { nombre: 'CLIENTE' },
    nombre: 'Carlos',
    apellido: 'Santana',
    email: 'carlos@cliente.com',
    direccion_principal: 'Calle Falsa 456',
    estado: 'ACTIVO',
    telefono: '0999888777',
  },
  {
    cedula: '1122334455',
    rol: { nombre: 'CLIENTE' },
    nombre: 'Ana',
    apellido: 'Guerra',
    email: 'ana@cliente.com',
    direccion_principal: 'Boulevard de los Sueños Rotos 789',
    estado: 'ACTIVO',
    telefono: '0911223344',
  },
];

// This data is now fetched from the API, but kept for reference
export const platillos: Dish[] = [];

export const pedidos: Order[] = [
  {
    pedido_id: 1,
    usuario_cedula: '0987654321',
    fecha_pedido: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estado_pedido: 'Entregado',
    tipo_entrega: 'Delivery',
    direccion_entrega: 'Calle Falsa 456',
    monto_total: 22.50,
    estado: 'ACTIVO',
    detalles: [
      {
        detalle_id: 1,
        pedido_id: 1,
        item_id: 1,
        cantidad: 1,
        precio_unitario: 12.50,
        subtotal: 12.50,
        estado: 'ACTIVO',
      },
      {
        detalle_id: 2,
        pedido_id: 1,
        item_id: 2,
        cantidad: 1,
        precio_unitario: 10.00,
        subtotal: 10.00,
        estado: 'ACTIVO',
      },
    ],
  },
  {
    pedido_id: 2,
    usuario_cedula: '1122334455',
    fecha_pedido: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estado_pedido: 'Autorizado',
    tipo_entrega: 'Recoger en tienda',
    direccion_entrega: 'N/A',
    monto_total: 14.50,
    estado: 'ACTIVO',
    detalles: [
      {
        detalle_id: 3,
        pedido_id: 2,
        item_id: 3,
        cantidad: 1,
        precio_unitario: 7.00,
        subtotal: 7.00,
        estado: 'ACTIVO',
      },
      {
        detalle_id: 4,
        pedido_id: 2,
        item_id: 4,
        cantidad: 1,
        precio_unitario: 8.50,
        subtotal: 7.50,
        estado: 'ACTIVO',
      },
    ],
  },
  {
    pedido_id: 3,
    usuario_cedula: '0987654321',
    fecha_pedido: new Date().toISOString(),
    estado_pedido: 'Pendiente',
    tipo_entrega: 'Delivery',
    direccion_entrega: 'Calle Falsa 456',
    monto_total: 17.50,
    estado: 'ACTIVO',
    detalles: [
      {
        detalle_id: 5,
        pedido_id: 3,
        item_id: 1,
        cantidad: 1,
        precio_unitario: 12.50,
        subtotal: 12.50,
        estado: 'ACTIVO',
      },
      {
        detalle_id: 6,
        pedido_id: 3,
        item_id: 6,
        cantidad: 1,
        precio_unitario: 5.00,
        subtotal: 5.00,
        estado: 'ACTIVO',
      },
    ],
  },
];
