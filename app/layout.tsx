import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://live-electricity-bill.minarrolabs.dev"),
  title: "Live Electricity Bill | Dashboard energético de Minarrolabs",
  description: "Demo interactiva de un dashboard que estima la factura eléctrica combinando consumo, producción solar, excedentes, tarifas e impuestos.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Live Electricity Bill | Minarrolabs",
    description: "Consumo, producción solar, excedentes y factura estimada en un único dashboard.",
    url: "/",
    siteName: "Minarrolabs",
    locale: "es_ES",
    type: "website"
  },
  robots: { index: true, follow: true }
};

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return <html lang="es"><body>{children}</body></html>;
}
