# Quickstart: Validación de sesión inválida o caducada

Esta guía valida la funcionalidad en navegador tras su implementación. No requiere
modificar el backend ni añadir herramientas de prueba.

## Prerrequisitos

- Dependencias del proyecto instaladas.
- Configuración local existente de la API.
- Entorno de backend de pruebas para comprobar la respuesta real ante credenciales
  incorrectas. No se ha podido verificar ese contrato desde el repositorio frontend.
- Cuenta de prueba y sesión activa, o herramientas del navegador para simular
  respuestas y fallos de red.

## Validación automática disponible

Desde la raíz del repositorio:

```powershell
bun run build
bun run lint
```

**Resultado esperado**: ambos comandos terminan sin errores. No se encontró runner
automatizado configurado; realizar los escenarios siguientes en navegador.

## Registro de verificación (2026-10-22)

No se ejecutaron solicitudes HTTP ni pruebas interactivas en navegador en esta
verificación. El repositorio disponible no identifica un backend de pruebas
autorizado ni una sesión/cuenta de prueba; no se usaron credenciales ni se contactó
producción. Se inspeccionó estáticamente el cliente API, `AuthProvider`, `AppLayout`,
el aviso visual y el flujo de login.

| Escenario | Resultado de inspección | Pendiente |
|---|---|---|
| HTTP 401 autenticado | El cliente solo emite la señal tras recibir una respuesta 401 con token y sin exclusión; `AuthProvider` limpia el almacenamiento y activa el estado del aviso. | Simular un 401 autenticado y confirmar almacenamiento, estado y aviso en navegador. |
| HTTP 401 no autenticado | La emisión también requiere que el cliente haya adjuntado un token. | Simular un 401 en una petición no autenticada y comprobar que no se invalida una sesión ni aparece el aviso. |
| HTTP 401 repetidos | `AuthProvider` usa una referencia para procesar la invalidación una sola vez mientras está activa; el layout presenta un único aviso basado en estado booleano. | Generar respuestas 401 repetidas/concurrentes y comprobar la estabilidad visual. |
| HTTP 401 en login | El servicio excluye explícitamente la señal global; el manejo de `ApiError` a `LoginError` y su presentación en el formulario están presentes. | Confirmar estado/cuerpo real con backend autorizado y comprobar el mensaje en navegador. |
| HTTP distinto de 401 | La señal global está condicionada a `response.status === 401`. | Simular otro estado HTTP con sesión activa y confirmar que no se invalida. |
| Fallo de conectividad | Si `fetch` rechaza sin `Response`, el flujo termina antes de llamar a la función que emite la señal. | Simular pérdida de red y comprobar que sesión y UI permanecen. |
| Acción «Volver a iniciar sesión» | El layout devuelve el aviso en lugar de `children` mientras el estado inválido está activo; el callback restablece ese estado y navega a `/login`. | Ejecutar la interacción en navegador y confirmar que no se presenta contenido protegido durante la transición. |

Estos resultados son una inspección del código, no una prueba dinámica de los
escenarios. Ejecutar las comprobaciones pendientes requiere un entorno autorizado
para simular respuestas o una sesión de prueba y validar la UI en navegador. No se
alteró código ni configuración para realizar esta verificación.

## Escenarios del navegador

1. **HTTP 401 autenticado**
   - Iniciar sesión y confirmar que `jornadas_auth` existe.
   - Simular HTTP 401 en una petición autenticada, incluyendo métodos de lectura,
     escritura y respuesta binaria del cliente.
   - **Esperado**: la sesión se elimina, el estado React pasa a no autenticado y se
     muestra un aviso global único.

2. **401 en inicio de sesión con credenciales incorrectas**
   - Cerrar sesión y enviar credenciales incorrectas desde `/login` contra un entorno
     backend de pruebas.
   - Confirmar estado HTTP y cuerpo devueltos por `/Auth/LoginAsync`.
   - **Esperado**: `ApiError` conserva el cuerpo de error esperado, `useLogin` lo
     convierte en `LoginError`, el formulario muestra su mensaje habitual y el aviso
     global no se activa. Si el backend no devuelve el contrato esperado, registrar la
     limitación y solicitar coordinación backend antes de cerrar la aceptación.

3. **401 de otra petición no autenticada**
   - Simular HTTP 401 en una petición no autenticada distinta del login.
   - **Esperado**: conserva el manejo actual, no limpia sesión por la regla global y no
     muestra aviso global.

4. **Cuerpo no JSON en 401**
   - Probar HTTP 401 autenticado con cuerpo vacío o no JSON.
   - Probar por separado el error de login en el formato que realmente devuelva el
     backend.
   - **Esperado**: el 401 autenticado se detecta antes del parseo y activa invalidación;
     el login no activa la señal global y conserva el manejo de `ApiError` existente
     cuando el cuerpo cumple el contrato actual.

5. **Fallo de conectividad**
   - Con sesión activa, simular fallo de red sin respuesta HTTP.
   - **Esperado**: `jornadas_auth` y el estado de autenticación permanecen; no aparece
     el aviso de sesión caducada.

6. **HTTP distinto de 401**
   - Simular una respuesta HTTP diferente de 401.
   - **Esperado**: se conserva el flujo de error previo y no se activa expiración.

7. **401 autenticados repetidos o concurrentes**
   - Provocar varias respuestas 401 autenticadas en la misma vista.
   - **Esperado**: limpieza idempotente y un único aviso estable.

8. **Volver al acceso**
   - Con el aviso visible, activar **«Volver a iniciar sesión»**.
   - **Esperado**: se abre el formulario `/login` existente sin redirigir antes del login
     exitoso.

## Relación con los artefactos de diseño

- Modelo de estado: [`data-model.md`](./data-model.md).
- Contrato de UI: [`contracts/session-invalid-ui.md`](./contracts/session-invalid-ui.md).
- Requisitos: [`spec.md`](./spec.md).
