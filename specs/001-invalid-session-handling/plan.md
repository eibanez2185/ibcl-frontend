# Implementation Plan: Manejo de sesiones inválidas o caducadas

**Branch**: `001-invalid-session-handling` | **Date**: 2026-10-22 | **Spec**:
[`spec.md`](./spec.md)

**Input**: Feature specification from
`specs/001-invalid-session-handling/spec.md`

## Summary

Reconocer HTTP 401 en las respuestas a peticiones autenticadas del cliente API, pero
excluir explícitamente el envío de credenciales del formulario de acceso. El cliente
mantiene el flujo de `ApiError` existente y emite la señal global solo cuando se cumple
la política de invalidación. `AuthProvider` procesa la señal limpiando el almacenamiento
y el estado React; `AppLayout` muestra el aviso y su botón dirige al formulario `/login`
existente. Los 401 de peticiones no autenticadas y los errores de red no activan el
aviso ni limpian la sesión.

## Technical Context

**Language/Version**: TypeScript 6.x; React 19

**Primary Dependencies**: React, TanStack Router, TanStack Query; dependencias
configuradas en `package.json`

**Storage**: `localStorage`, encapsulado en `src/services/auth/authStorage.ts`

**Testing**: No se encontró runner de pruebas ni pruebas existentes. Validación
disponible: `bun run build` y `bun run lint`; escenarios del navegador en
`quickstart.md`.

**Target Platform**: Aplicación web Vite ejecutada en navegador

**Project Type**: Aplicación frontend web de un solo proyecto

**Performance Goals**: El estado global de sesión inválida se presenta al procesarse
la respuesta HTTP 401 autenticada, sin esperar a otra petición.

**Constraints**: La invalidación requiere HTTP 401 y una petición clasificada como
autenticada y elegible para invalidación. El envío de credenciales al iniciar sesión
está explícitamente excluido. Las peticiones no autenticadas y fallos sin respuesta
HTTP conservan su manejo actual. Mantener el flujo `ApiError` → `LoginError`; no añadir
rutas, dependencias ni otra arquitectura de autenticación.

**Scale/Scope**: Cliente API, proveedor de autenticación, layout global y un componente
común de aviso; sin cambios al servidor ni al contrato remoto.

## Constitution Check

- **I. User-Centered Workflows**: Cumple. Presenta una explicación y una acción clara
  para sesiones rechazadas, y conserva el error de credenciales en el acceso.
- **II. Modular, Typed Frontend**: Cumple. La clasificación de respuestas queda en el
  cliente API; estado y presentación usan el proveedor y layout existentes.
- **III. Secure Data Handling**: Cumple. Una respuesta autenticada 401 elimina la
  sesión de almacenamiento y de memoria, sin mostrar credenciales ni tokens.
- **IV. Accessible and Resilient UX**: Cumple. El aviso incluye una acción rotulada y
  el fallo de red no se confunde con expiración.
- **V. Verifiable Quality**: Cumple. Se definen casos verificables y se usan los
  comandos disponibles; el repositorio no contiene runner de pruebas.
- **Additional Constraints**: Cumple. Reutiliza las capas existentes y no añade
  dependencias.
- **Development Workflow**: Cumple. El trabajo queda limitado a los puntos de
  integración identificados.

**Gate pre-diseño**: PASS. La especificación acota la distinción entre llamadas
autenticadas, acceso y otros errores.

## Project Structure

### Documentation (this feature)

```text
specs/001-invalid-session-handling/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── session-invalid-ui.md
```

### Source Code (repository root)

```text
src/
├── auth/
│   └── AuthProvider.tsx                    # Escuchar señal y sincronizar estado de sesión
├── components/
│   ├── common/
│   │   └── SessionExpiredScreen.tsx        # Nuevo aviso y acción de recuperación
│   └── layout/
│       └── AppLayout.tsx                   # Mostrar aviso global
└── services/
    ├── api/
    │   ├── apiClient.ts                    # Clasificar 401 y emitir señal elegible
    │   └── authService.ts                  # Excluir explícitamente petición de login
    └── auth/
        └── authStorage.ts                  # Reutilizar clear(); sin cambio previsto
```

**Structure Decision**: El frontend existente es un único proyecto bajo `src/`.
Todos los archivos salvo `SessionExpiredScreen.tsx` existen. No se propone modificar
`useLogin`, `routes/login/index.tsx`, las rutas protegidas, `main.tsx` ni `queryClient.ts`.
El login seguirá manejando sus errores mediante `ApiError` → `LoginError`; el servicio
marcará la solicitud de login para excluirla de la señal global de invalidación.

## Diseño técnico

1. En `apiClient.ts`, comprobar el estado HTTP tras recibir `Response` y antes de
   parsear el cuerpo. Mantener intacta la creación y propagación de `ApiError` con el
   cuerpo de error actual.
2. La señal global se emite solo si concurren ambas condiciones: estado HTTP 401 y
   solicitud autenticada elegible para invalidación. La autenticación se determina por
   la presencia de las credenciales que el cliente adjunta a esa petición. Una petición
   sin credenciales no invalida una sesión.
3. La llamada de login en `authService.ts` pasa una opción explícita que excluye la
   invalidación global, incluso si en algún estado anómalo hubiera credenciales
   disponibles localmente. No inferir la exclusión solo del texto de la URL.
4. Centralizar la evaluación de la respuesta para los métodos existentes `get`, `post`,
   `put` y `postBlob`. Los errores de red que rechazan `fetch` sin producir `Response`
   no emiten señal. Los códigos distintos de 401 no emiten señal.
5. `AuthProvider.tsx` escucha la señal, ejecuta `authStorage.clear()`, establece `auth`
   en `null` y conserva un estado transitorio de sesión inválida para la presentación.
   Las señales repetidas se procesan de forma idempotente.
6. `AppLayout.tsx` muestra `SessionExpiredScreen` en lugar del contenido actual cuando
   la sesión fue invalidada. El botón despeja el estado del aviso y navega a `/login`
   mediante TanStack Router.
7. La petición de login mantiene el recorrido actual: `apiClient` rechaza con
   `ApiError`; `useLogin` convierte ese error a `LoginError`; la mutación expone
   `LoginError.message` y `routes/login/index.tsx` lo presenta. La exclusión global no
   debe interceptar ni sustituir este recorrido.
8. No cambiar `authStorage.ts`, `useLogin.ts`, `routes/login/index.tsx`, servicios de
   dominio, guardas, `main.tsx` ni `queryClient.ts`, salvo que la implementación revele
   un bloqueo concreto revisable.

### Archivos y responsabilidades

| Archivo | Estado | Cambio previsto |
|---|---|---|
| `src/services/api/apiClient.ts` | Existente | Clasificar 401 antes de parsear y emitir señal solo para peticiones autenticadas elegibles; mantener `ApiError`. |
| `src/services/api/authService.ts` | Existente | Marcar el envío de credenciales para que su 401 no dispare la invalidación global. |
| `src/auth/AuthProvider.tsx` | Existente | Escuchar señal elegible, borrar sesión local y en memoria, exponer estado/reset de expiración. |
| `src/components/layout/AppLayout.tsx` | Existente | Mostrar pantalla global mientras el estado de expiración esté activo. |
| `src/components/common/SessionExpiredScreen.tsx` | Nuevo | Mensaje accesible y botón que vuelve al formulario existente. |
| `src/services/auth/authStorage.ts` | Existente, sin cambio | Proveer `clear()` ya existente. |
| `src/hooks/useLogin.ts` | Existente, sin cambio | Conservar conversión actual `ApiError` → `LoginError`. |
| `src/routes/login/index.tsx` | Existente, sin cambio | Conservar el formulario y su presentación de `LoginError.message`. |

### Pruebas pertinentes y validación

- **Petición autenticada 401**: con sesión guardada y credencial enviada, probar los
  métodos API pertinentes. Esperado: señal global, clave `jornadas_auth` eliminada,
  contexto no autenticado y una única pantalla de aviso.
- **Login 401 por credenciales incorrectas**: en un entorno de prueba, enviar
  credenciales inválidas. Esperado: respuesta manejada como `ApiError`, conversión a
  `LoginError`, mensaje habitual en el formulario, ninguna señal global ni limpieza
  causada por el aviso.
- **Login 401 con sesión local preexistente**: verificar la exclusión explícita:
  conserva el flujo del formulario y no activa aviso ni borra sesión a causa de esa
  respuesta. Confirmar primero el comportamiento real del guard y del estado de acceso.
- **Otra petición no autenticada 401**: comprobar que conserva su manejo previo y no
  genera invalidación global.
- **Red sin respuesta**: simular rechazo de `fetch`; sesión local y estado se conservan
  y no aparece el aviso.
- **Otro estado HTTP**: verificar que el error se propaga por el recorrido actual sin
  activar expiración.
- **401 autenticados repetidos o concurrentes**: verificar un único estado de aviso
  estable y limpieza idempotente.
- **Recuperación**: activar «Volver a iniciar sesión»; confirmar navegación a `/login`,
  formulario existente y que no se redirige a la zona autenticada antes del login.
- **Cuerpo de error**: probar un 401 autenticado con cuerpo vacío/no JSON para asegurar
  que la detección ocurre antes del parseo; probar por separado el JSON de error del
  login requerido por `useLogin`.
- Ejecutar `bun run build` y `bun run lint`. No existe runner automatizado en el
  proyecto; no se añadirá uno como parte de este alcance.

### Riesgos y limitaciones de integración

- **Respuesta real de credenciales incorrectas no verificada**: este repositorio
  contiene solo el frontend; no se halló código backend, contrato de endpoint ni pruebas
  de integración que demuestren el estado HTTP y el cuerpo que devuelve
  `/Auth/LoginAsync` ante credenciales incorrectas. El código frontend muestra que
  `useLogin` convierte un `ApiError` con cuerpo compatible con `ApiResponse` a
  `LoginError` y que la ruta presenta su `message`; no prueba qué devuelve el servidor.
  Validar en un entorno backend de prueba antes de cerrar la implementación. Si la
  respuesta no contiene el mensaje esperado, preservar el mensaje habitual podría
  requerir coordinar un contrato con el backend, fuera del alcance actual.
- **Clasificación de peticiones autenticadas**: el cliente actual añade el token
  almacenado a sus peticiones. La implementación debe basarse en si se adjuntaron
  credenciales y respetar la exclusión explícita del login; no basta con que exista
  cualquier estado local ni con comparar una URL.
- **Parseo previo al control HTTP**: `post` y `put` parsean JSON antes de comprobar
  `response.ok`. La señal debe evaluarse inmediatamente al recibir `Response` sin
  consumir el cuerpo, conservando después el flujo de error para `ApiError`.
- **Estado React desincronizado**: limpiar solamente `localStorage` no actualiza el
  estado interno del `AuthProvider`; ambos deben cambiar por una misma señal procesada
  por el proveedor.
- **401 simultáneos**: múltiples peticiones protegidas pueden fallar a la vez; la
  transición debe ser idempotente y no presentar avisos superpuestos.

**Gate post-diseño**: PASS. La excepción de login se refleja en el contrato, el flujo
actual de errores se preserva y la falta de evidencia del backend se documenta como
validación requerida, no como un hecho supuesto.

## Complexity Tracking

No hay violaciones de la constitución ni dependencias, rutas o proyectos adicionales.
