import type { CompanyTheme } from './types'
import logoIbcl from "@/assets/logo-ibcl.png";
import iconIbcl from "@/assets/icon-ibcl.ico";

export const ibclTheme: CompanyTheme = {
  idEmpresa: 1,
  nombre: 'IBCL',
  logo: logoIbcl,
  icon: iconIbcl,
  
  colors: {
    primary: 'oklch(0.68 0.16 45)',
    primarySoft: 'oklch(0.92 0.06 40)',
    secondary: 'oklch(0.94 0.02 76)',
    background: 'oklch(0.965 0.018 76)',
    foreground: 'oklch(0.21 0.04 270)',
    card: 'oklch(0.985 0.012 80)',
    muted: 'oklch(0.94 0.015 76)',
    mutedForeground: 'oklch(0.5 0.02 270)',
    accent: 'oklch(0.92 0.04 40)',
    border: 'oklch(0.88 0.02 70)',
    input: 'oklch(0.88 0.02 70)',
    ring: 'oklch(0.64 0.196 33)',
    destructive: 'oklch(0.58 0.22 27)',
  },
}

export const companyThemes: Record<number, CompanyTheme> = {
  [ibclTheme.idEmpresa]: ibclTheme,
}