import {
  createContext,
  useContext,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { CompanyTheme } from "./types";
import { companyThemes } from "./themes";

interface ThemeContextValue {
  theme: CompanyTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  idEmpresa?: number;
}

function setFavicon(icon: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = icon;
}

function createThemeVariables(theme: CompanyTheme): CSSProperties {
  return {
    "--primary": theme.colors.primary,
    "--primary-soft": theme.colors.primarySoft,
    "--secondary": theme.colors.secondary,
    "--background": theme.colors.background,
    "--foreground": theme.colors.foreground,
    "--card": theme.colors.card,
    "--muted": theme.colors.muted,
    "--muted-foreground": theme.colors.mutedForeground,
    "--accent": theme.colors.accent,
    "--border": theme.colors.border,
    "--input": theme.colors.input,
    "--ring": theme.colors.ring,
    "--destructive": theme.colors.destructive,
  } as CSSProperties;
}

export function ThemeProvider({ children, idEmpresa = 1 }: ThemeProviderProps) {
  const theme = companyThemes[idEmpresa] ?? companyThemes[1];

  const themeVariables = createThemeVariables(theme);

  useEffect(() => {
    setFavicon(theme.icon);
  }, [theme.icon]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div style={themeVariables}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): CompanyTheme {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe utilizarse dentro de ThemeProvider");
  }

  return context.theme;
}
