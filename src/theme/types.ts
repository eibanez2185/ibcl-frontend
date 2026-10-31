export interface CompanyTheme {
  idEmpresa: number
  nombre: string
  logo: string
  icon: string

  colors: {
    primary: string
    primarySoft: string
    secondary: string
    background: string
    foreground: string
    card: string
    muted: string
    mutedForeground: string
    accent: string
    border: string
    input: string
    ring: string
    destructive: string
  }
}