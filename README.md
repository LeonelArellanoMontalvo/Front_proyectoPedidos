 .# Pedido Listo - Sistema de Pedidos de Comida

Este es un sistema de pedidos de comida en línea construido con Next.js y una API de GraphQL. Permite a los clientes explorar un menú, realizar pedidos y a los administradores gestionar la operativa del restaurante.

## Tecnologías Utilizadas

- **Framework**: Next.js (con App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes de UI**: Shadcn/ui
- **Comunicación con API**: Axios y GraphQL
- **Autenticación**: Basada en tokens, con gestión de roles.

## Características

### Para Clientes
- **Navegación de Menú**: Los usuarios pueden ver todos los platillos disponibles.
- **Carrito de Compras**: Funcionalidad completa para agregar, actualizar cantidad y eliminar platillos del carrito.
- **Notas Adicionales**: Posibilidad de agregar notas especiales a cada platillo del pedido (ej. "sin cebolla").
- **Autenticación de Usuarios**: Sistema de registro e inicio de sesión para clientes.
- **Historial de Pedidos**: Los clientes pueden ver un historial de todos los pedidos que han realizado.
- **Proceso de Compra**: Flujo completo para enviar el pedido al sistema.

### Panel de Administración
- **Gestión de Pedidos**:
  - Visualización de todos los pedidos del sistema.
  - Actualización del estado de los pedidos (de "Pendiente" a "Autorizado").
  - Visualización de los detalles completos de cada pedido, incluyendo notas.
- **Gestión de Platillos**:
  - Añadir, editar y ver todos los platillos.
  - Cambiar el estado de un platillo entre "Activo" y "Descontinuado".
- **Gestión de Clientes**:
  - Listado de todos los clientes registrados.
  - Activación y desactivación de cuentas de clientes.
- **Rutas Protegidas**: Acceso restringido al panel solo para usuarios con el rol de "ADMINISTRADOR".
