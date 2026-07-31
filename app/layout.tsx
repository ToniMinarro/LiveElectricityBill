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

const themeToggleScript = `
(() => {
  const storageKey = "minarrolabs-theme";
  const root = document.documentElement;

  const mountToggle = () => {
    const header = document.querySelector(".site-header");
    if (!(header instanceof HTMLElement) || document.getElementById("theme-toggle")) {
      return;
    }

    const backLink = header.querySelector(".back-link");
    const actions = document.createElement("div");
    actions.className = "site-header__actions";

    if (backLink) {
      backLink.replaceWith(actions);
      actions.append(backLink);
    } else {
      header.append(actions);
    }

    const button = document.createElement("button");
    button.id = "theme-toggle";
    button.className = "theme-toggle";
    button.type = "button";
    button.innerHTML = '<svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"></path></svg><svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    actions.append(button);

    let themeColor = document.getElementById("theme-color");
    if (!(themeColor instanceof HTMLMetaElement)) {
      themeColor = document.createElement("meta");
      themeColor.id = "theme-color";
      themeColor.name = "theme-color";
      document.head.append(themeColor);
    }

    const applyTheme = (theme, persist) => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;

      const nextTheme = theme === "dark" ? "light" : "dark";
      const label = nextTheme === "light" ? "Cambiar al tema claro" : "Cambiar al tema oscuro";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      themeColor.content = theme === "dark" ? "#090c14" : "#f5f7fb";

      if (persist) {
        try {
          window.localStorage.setItem(storageKey, theme);
        } catch (_) {
          // Keep the theme for the current page even without storage.
        }
      }
    };

    applyTheme(root.dataset.theme === "light" ? "light" : "dark", false);
    button.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  };

  if (document.readyState === "complete") {
    mountToggle();
  } else {
    window.addEventListener("load", mountToggle, { once: true });
  }
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
        <script dangerouslySetInnerHTML={{ __html: themeToggleScript }} />
      </body>
    </html>
  );
}
