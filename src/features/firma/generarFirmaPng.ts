
import type { EstiloFirma } from "@/features/firma/estilosFirma";

interface GenerarFirmaPngOpciones {
  nombre: string;
  estilo: EstiloFirma;
  ancho?: number;
  alto?: number;
}

export async function generarFirmaPng({
  nombre,
  estilo,
  ancho = 1200,
  alto = 320,
}: GenerarFirmaPngOpciones): Promise<string> {
  const texto = nombre.trim();

  if (!texto) {
    throw new Error("Escribe tu nombre antes de generar la firma.");
  }

  await document.fonts.load(`48px ${estilo.fontFamily}`);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;

  const contexto = canvas.getContext("2d");

  if (!contexto) {
    throw new Error("No fue posible preparar la imagen de la firma.");
  }

  contexto.clearRect(0, 0, ancho, alto);
  contexto.fillStyle = "#172033";
  contexto.textAlign = "center";
  contexto.textBaseline = "middle";

  let tamanoFuente = 110;
  const margenHorizontal = 40;
  const anchoDisponible = ancho - margenHorizontal * 2;

  contexto.font = `${tamanoFuente}px ${estilo.fontFamily}`;

  while (
    contexto.measureText(texto).width > anchoDisponible &&
    tamanoFuente > 24
  ) {
    tamanoFuente -= 2;
    contexto.font = `${tamanoFuente}px ${estilo.fontFamily}`;
  }

  contexto.fillText(texto, ancho / 2, alto / 2, anchoDisponible);

  const imagen = contexto.getImageData(0, 0, ancho, alto);
  const pixeles = imagen.data;

  let izquierda = ancho;
  let arriba = alto;
  let derecha = -1;
  let abajo = -1;

  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const indice = (y * ancho + x) * 4;

      if (pixeles[indice + 3] > 0) {
        izquierda = Math.min(izquierda, x);
        arriba = Math.min(arriba, y);
        derecha = Math.max(derecha, x);
        abajo = Math.max(abajo, y);
      }
    }
  }

  if (derecha < izquierda || abajo < arriba) {
    throw new Error("No fue posible generar la imagen de la firma.");
  }

  const margen = 20;

  izquierda = Math.max(0, izquierda - margen);
  arriba = Math.max(0, arriba - margen);
  derecha = Math.min(ancho - 1, derecha + margen);
  abajo = Math.min(alto - 1, abajo + margen);

  const anchoRecortado = derecha - izquierda + 1;
  const altoRecortado = abajo - arriba + 1;

  const canvasRecortado = document.createElement("canvas");
  canvasRecortado.width = anchoRecortado;
  canvasRecortado.height = altoRecortado;

  const contextoRecortado = canvasRecortado.getContext("2d");

  if (!contextoRecortado) {
    throw new Error("No fue posible preparar la imagen de la firma.");
  }

  contextoRecortado.drawImage(
    canvas,
    izquierda,
    arriba,
    anchoRecortado,
    altoRecortado,
    0,
    0,
    anchoRecortado,
    altoRecortado,
  );

  return canvasRecortado.toDataURL("image/png");
}
