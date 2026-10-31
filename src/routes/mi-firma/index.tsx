import { useState, useEffect } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStorage } from "@/services/auth/authStorage";
import {
  estilosFirma,
  type EstiloFirmaId,
} from "@/features/firma/estilosFirma";
import { DibujarFirma } from "@/features/firma/DibujarFirma";
import { generarFirmaPng } from "@/features/firma/generarFirmaPng";
import { useGuardarFirma } from "@/hooks/useGuardarFirma";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useObtenerFirma } from "@/hooks/useObtenerFirma";

export const Route = createFileRoute("/mi-firma/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (!auth) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: MiFirmaPage,
});

type ModoFirma = "escribir" | "dibujar";

function MiFirmaPage() {
  const [modo, setModo] = useState<ModoFirma>("escribir");
  const [nombre, setNombre] = useState("");

  const [estilo, setEstilo] = useState<EstiloFirmaId>("dancing-script");
  const [firmaDibujada, setFirmaDibujada] = useState<string | null>(null);

  const [firmaGenerada, setFirmaGenerada] = useState<string | null>(null);
  const [generandoFirma, setGenerandoFirma] = useState(false);
  const [errorFirma, setErrorFirma] = useState<string | null>(null);
  const [confirmarGuardado, setConfirmarGuardado] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const guardarFirma = useGuardarFirma();
  const firmaGuardada = useObtenerFirma();

  useEffect(() => {
    if (!mensajeExito && !errorFirma) {
      return;
    }

    const temporizador = window.setTimeout(() => {
      setMensajeExito(null);
      setErrorFirma(null);
    }, 5000);

    return () => window.clearTimeout(temporizador);
  }, [mensajeExito, errorFirma]);

  async function generarVistaPrevia() {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      setErrorFirma("Escribe tu nombre antes de generar la firma.");
      setFirmaGenerada(null);
      return;
    }

    const estiloSeleccionado = estilosFirma.find(
      (opcion) => opcion.id === estilo,
    );

    if (!estiloSeleccionado) {
      setErrorFirma("Selecciona un estilo de firma válido.");
      return;
    }

    try {
      setGenerandoFirma(true);
      setErrorFirma(null);

      const imagen = await generarFirmaPng({
        nombre: nombreLimpio,
        estilo: estiloSeleccionado,
      });

      setFirmaGenerada(imagen);
    } catch (error) {
      setErrorFirma(
        error instanceof Error
          ? error.message
          : "No fue posible generar la firma.",
      );
    } finally {
      setGenerandoFirma(false);
    }
  }

  function guardarFirmaUsuario() {
    if (!firmaGenerada) {
      setErrorFirma("Primero genera o dibuja tu firma.");
      setConfirmarGuardado(false);
      return;
    }

    guardarFirma.mutate(
      {
        imagenFirma: firmaGenerada,
        formato: "image/png",
      },
      {
        onSuccess: (respuesta) => {
          setConfirmarGuardado(false);

          if (respuesta.isSuccess) {
            setErrorFirma(null);
            setMensajeExito("Tu firma se ha guardado correctamente.");
          } else {
            setMensajeExito(null);
            setErrorFirma(
              respuesta.message || "No fue posible guardar la firma.",
            );
          }
        },
        onError: () => {
          setConfirmarGuardado(false);
          setMensajeExito(null);
          setErrorFirma("Ocurrió un error al guardar la firma.");
        },
      },
    );
  }

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-semibold text-foreground">Mi firma</h1>

        <p className="mt-2 text-base text-muted-foreground">
          Crea y administra la firma que utilizarás en tu planilla de jornada.
        </p>

        {firmaGuardada.isLoading && (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Consultando tu firma guardada...
            </p>
          </div>
        )}

        {firmaGuardada.isError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {firmaGuardada.error instanceof Error
              ? firmaGuardada.error.message
              : "No fue posible consultar tu firma guardada."}
          </div>
        )}

        {firmaGuardada.isSuccess && firmaGuardada.data && (
          <section className="mt-6 rounded-xl border border-green-200 bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Tu firma guardada
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Esta es la firma que tienes almacenada actualmente.
            </p>

            <div className="mt-4 flex min-h-28 items-center justify-center rounded-lg border border-border bg-background p-4">
              <img
                src={`data:${firmaGuardada.data.formato};base64,${firmaGuardada.data.imagenFirma}`}
                alt="Mi firma guardada"
                className="max-h-28 max-w-full object-contain"
              />
            </div>
          </section>
        )}

        <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Crear mi firma
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Elige cómo quieres crear tu firma personal.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setModo("escribir")}
              className={`rounded-lg border p-4 text-left transition-colors ${
                modo === "escribir"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <span className="block font-medium text-foreground">
                Escribir mi nombre
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Escribe tu nombre y elige un estilo manuscrito.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModo("dibujar")}
              className={`rounded-lg border p-4 text-left transition-colors ${
                modo === "dibujar"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <span className="block font-medium text-foreground">
                Dibujar mi firma
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Traza tu firma con el ratón o la pantalla táctil.
              </span>
            </button>
          </div>

          {modo === "escribir" ? (
            <div className="mt-6">
              <label
                htmlFor="nombre-firma"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Nombre para la firma
              </label>

              <input
                id="nombre-firma"
                type="text"
                value={nombre}
                onChange={(event) => {
                  setNombre(event.target.value);
                  setFirmaGenerada(null);
                  setErrorFirma(null);
                }}
                placeholder="Escribe tu nombre completo"
                maxLength={150}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Estilo de firma
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {estilosFirma.map((opcion) => (
                    <button
                      key={opcion.id}
                      type="button"
                      onClick={() => {
                        setEstilo(opcion.id);
                        setFirmaGenerada(null);
                        setErrorFirma(null);
                      }}
                      aria-pressed={estilo === opcion.id}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        estilo === opcion.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="block text-sm font-medium text-foreground">
                        {opcion.nombre}
                      </span>

                      <span
                        className="mt-2 block truncate text-2xl text-foreground"
                        style={{ fontFamily: opcion.fontFamily }}
                      >
                        Tu firma
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-background p-6">
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Vista previa
                </p>

                <div className="flex min-h-28 items-center justify-center overflow-hidden">
                  {firmaGenerada && (
                    <img
                      src={firmaGenerada}
                      alt="Vista previa de tu firma"
                      className="max-h-28 max-w-full object-contain"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={generarVistaPrevia}
                  disabled={generandoFirma}
                  className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generandoFirma
                    ? "Generando firma..."
                    : "Generar vista previa"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <DibujarFirma
                onCambiarFirma={(imagen) => {
                  setFirmaDibujada(imagen);
                  setFirmaGenerada(imagen);
                  setErrorFirma(null);
                }}
              />

              {firmaDibujada && (
                <div className="mt-5 rounded-lg border border-border bg-background p-6">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Vista previa
                  </p>

                  <div className="flex min-h-28 items-center justify-center overflow-hidden">
                    <img
                      src={firmaDibujada}
                      alt="Vista previa de tu firma dibujada"
                      className="max-h-28 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setConfirmarGuardado(true)}
            disabled={!firmaGenerada || guardarFirma.isPending}
            className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardarFirma.isPending ? "Guardando..." : "Guardar firma"}
          </button>

          <div className="mt-4 space-y-3">
            {mensajeExito && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold">
                  ✓
                </span>

                <div>
                  <p className="font-semibold">¡Firma guardada!</p>
                  <p className="mt-1 text-sm">{mensajeExito}</p>
                </div>
              </div>
            )}

            {errorFirma && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                  !
                </span>

                <div>
                  <p className="font-semibold">
                    No se pudo completar la operación
                  </p>
                  <p className="mt-1 text-sm">{errorFirma}</p>
                </div>
              </div>
            )}
          </div>

          <ConfirmDialog
            open={confirmarGuardado}
            title="Guardar firma"
            message="¿Estás seguro de que deseas guardar esta firma? Se utilizará en tu planilla de jornada."
            confirmText={
              guardarFirma.isPending ? "Guardando..." : "Sí, guardar"
            }
            cancelText="Cancelar"
            onConfirm={guardarFirmaUsuario}
            onCancel={() => setConfirmarGuardado(false)}
            confirmDisabled={guardarFirma.isPending}
          />
        </section>
      </div>
    </main>
  );
}
