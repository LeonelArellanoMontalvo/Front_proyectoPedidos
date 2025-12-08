export interface Role {
  rol_id: number;
  nombre_rol: 'CLIENTE' | 'ADMINISTRADOR';
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface User {
  cedula?: string; // Optional for now
  rol: { nombre: 'CLIENTE' | 'ADMINISTRADOR' };
  nombre: string;
  apellido?: string;
  telefono?: string;
  email: string;
  direccion_principal?: string; // Optional for now
  estado?: 'ACTIVO' | 'INACTIVO'; // Optional for now
}

export interface Dish {
  item_id: number;
  categoria_nombre: string;
  nombre_item: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  estado: 'ACTIVO' | 'DESCONTINUADO';
}

export interface Order {
  pedido_id: number;
  usuario_cedula: string;
  fecha_pedido: string;
  estado_pedido: 'Pendiente' | 'Autorizado' | 'Enviado' | 'Entregado' | 'Cancelado';
  tipo_entrega: string;
  direccion_entrega: string;
  monto_total: number;
  estado: 'ACTIVO' | 'INACTIVO';
  detalles: OrderDetail[];
}

export interface OrderDetail {
  detalle_id: number;
  pedido_id: number;
  item_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas_adicionales?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface CartItem extends Dish {
  quantity: number;
}
