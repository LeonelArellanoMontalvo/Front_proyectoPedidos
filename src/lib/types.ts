
export interface Role {
  id: number;
  nombre: 'CLIENTE' | 'ADMINISTRADOR';
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface User {
  cedula: string;
  rol: Role;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccionPrincipal: string; // Corresponds to direccion_principal
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface Dish {
  id: number;
  categoriaNombre: string;
  nombreItem: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  estado: 'ACTIVO' | 'DESCONTINUADO';
}

export interface Order {
  id: number;
  usuarioCedula: string;
  fechaPedido: string;
  estadoPedido: 'Pendiente' | 'Autorizado' | 'Enviado' | 'Entregado' | 'Cancelado';
  tipoEntrega: string;
  direccionEntrega: string;
  montoTotal: number;
  estado: 'ACTIVO' | 'INACTIVO';
  detalles: OrderDetail[];
  usuario?: {
      cedula: string;
      nombre: string;
      email: string;
  }
}

export interface OrderDetail {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notasAdicionales?: string;
  platillo: {
      id: number;
      nombreItem: string;
      precio: number;
  }
}

export interface CartItem extends Dish {
  quantity: number;
  notasAdicionales?: string;
}
