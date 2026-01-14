import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Factura eléctrica en curso",
  description: "Resumen en tiempo real del consumo y compensación solar."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
