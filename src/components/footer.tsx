import { Logo } from "./logo";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} Pedido Listo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
