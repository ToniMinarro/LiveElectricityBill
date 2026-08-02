"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "minarrolabs-theme";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const applyTheme = (nextTheme: Theme) => {
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    setTheme(nextTheme);

    const themeColor = document.getElementById("theme-color");
    if (themeColor instanceof HTMLMetaElement) {
      themeColor.content = nextTheme === "dark" ? "#090c14" : "#f5f7fb";
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (_) {
      // Keep the selected theme for the current page when storage is unavailable.
    }
  };

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";
  const label = nextTheme === "light" ? "Cambiar al tema claro" : "Cambiar al tema oscuro";

  return (
    <>
      <div className="persistent-theme-actions">
        <a className="back-link persistent-back-link" href="https://minarrolabs.dev/#examples">← Ver más ejemplos</a>
        <button
          id="theme-toggle"
          className="theme-toggle"
          type="button"
          aria-label={label}
          title={label}
          onClick={() => applyTheme(nextTheme)}
        >
          <svg className="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
          </svg>
          <svg className="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>

      <style jsx global>{`
        .site-header > .back-link {
          visibility: hidden;
        }

        .persistent-theme-actions {
          position: absolute;
          top: 24px;
          right: max(32px, calc((100vw - 1440px) / 2 + 32px));
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 12px;
          height: 40px;
        }

        @media (max-width: 760px) {
          .persistent-theme-actions {
            top: 18px;
            right: 18px;
          }

          .persistent-back-link {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
