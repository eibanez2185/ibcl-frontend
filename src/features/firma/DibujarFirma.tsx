import { useRef, useState, type PointerEvent } from "react";

interface DibujarFirmaProps {
  onCambiarFirma: (imagen: string | null) => void;
}

export function DibujarFirma({ onCambiarFirma }: DibujarFirmaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujandoRef = useRef(false);
  const tieneTrazosRef = useRef(false);
  const [tieneTrazos, setTieneTrazos] = useState(false);

  function obtenerCoordenadas(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function iniciarTrazo(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");
    const coordenadas = obtenerCoordenadas(event);

    if (!canvas || !contexto || !coordenadas) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dibujandoRef.current = true;

    contexto.beginPath();
    contexto.moveTo(coordenadas.x, coordenadas.y);
    contexto.lineWidth = 2.5;
    contexto.lineCap = "round";
    contexto.lineJoin = "round";
    contexto.strokeStyle = "#172033";
  }

  function continuarTrazo(event: PointerEvent<HTMLCanvasElement>) {
    if (!dibujandoRef.current) return;

    const contexto = canvasRef.current?.getContext("2d");
    const coordenadas = obtenerCoordenadas(event);

    if (!contexto || !coordenadas) return;

    contexto.lineTo(coordenadas.x, coordenadas.y);
    contexto.stroke();

    if (!tieneTrazosRef.current) {
      tieneTrazosRef.current = true;
      setTieneTrazos(true);
    }
  }

  function finalizarTrazo() {
    if (!dibujandoRef.current) return;

    dibujandoRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    onCambiarFirma(
      tieneTrazosRef.current ? canvas.toDataURL("image/png") : null,
    );
  }

  function limpiar() {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");

    if (!canvas || !contexto) return;

    contexto.clearRect(0, 0, canvas.width, canvas.height);
    dibujandoRef.current = false;
    tieneTrazosRef.current = false;
    setTieneTrazos(false);
    onCambiarFirma(null);
  }

  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-medium text-foreground">
        Dibuja tu firma en el recuadro
      </p>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <canvas
          ref={canvasRef}
          width={900}
          height={240}
          onPointerDown={iniciarTrazo}
          onPointerMove={continuarTrazo}
          onPointerUp={finalizarTrazo}
          onPointerCancel={finalizarTrazo}
          className="block h-48 w-full touch-none"
          aria-label="Área para dibujar tu firma"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Usa el ratón, el dedo o un lápiz digital.
        </p>

        <button
          type="button"
          onClick={limpiar}
          disabled={!tieneTrazos}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}
