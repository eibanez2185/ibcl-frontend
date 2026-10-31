export type EstiloFirmaId =
  | "dancing-script"
  | "great-vibes"
  | "sacramento"
  | "allura"
  | "caveat"
  | "satisfy";

export interface EstiloFirma {
  id: EstiloFirmaId;
  nombre: string;
  fontFamily: string;
  clase: string;
}

export const estilosFirma: EstiloFirma[] = [
  {
    id: "dancing-script",
    nombre: "Dancing Script",
    fontFamily: "'Dancing Script', cursive",
    clase: "[font-family:'Dancing_Script',cursive]",
  },
  {
    id: "great-vibes",
    nombre: "Great Vibes",
    fontFamily: "'Great Vibes', cursive",
    clase: "[font-family:'Great_Vibes',cursive]",
  },
  {
    id: "sacramento",
    nombre: "Sacramento",
    fontFamily: "'Sacramento', cursive",
    clase: "[font-family:'Sacramento',cursive]",
  },
  {
    id: "allura",
    nombre: "Allura",
    fontFamily: "'Allura', cursive",
    clase: "[font-family:'Allura',cursive]",
  },
  {
    id: "caveat",
    nombre: "Caveat",
    fontFamily: "'Caveat',cursive",
    clase: "[font-family:'Caveat',cursive]",
  },
  {
    id: "satisfy",
    nombre: "Satisfy",
    fontFamily: "'Satisfy',cursive",
    clase: "[font-family:'Satisfy',cursive]",
  },
];
