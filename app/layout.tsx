import "./globals.css";
import "./brand.css";
import "./system-theme.css";
import "./mobile.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import ThemeToggle from "./theme-toggle";

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

const themeInitScript = `
(() => {
  const storageKey = "minarrolabs-theme";
  let theme = "dark";

  try {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
    }
  } catch (_) {
    // Local storage may be unavailable in privacy-restricted browsers.
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta id="theme-color" name="theme-color" content="#090c14" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
