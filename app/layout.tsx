import "./globals.css";
import "./brand.css";
import "./system-theme.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://live-electricity-bill.minarrolabs.dev"),
  title: "Live Electricity Bill | Demo de dashboard energético",
  description: "Demo de Minarrolabs para estimar una factura eléctrica con autoconsumo mediante datos simulados de consumo, producción solar y excedentes.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Live Electricity Bill | Dashboard energético",
    description: "Consumo, producción solar, excedentes y estimación de factura en un único panel.",
    type: "website",
    url: "/"
  }
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
