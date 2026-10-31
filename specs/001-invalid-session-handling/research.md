# Research: Manejo de sesiones inválidas o caducadas

## Flujo existente de inicio de sesión

- **Decision**: Mantener `authService.login` → `apiClient.post` → `useLogin` como flujo
  de login. Una respuesta de error HTTP sigue produciendo `ApiError`; `useLogin` lo
  convierte a `LoginError` usando `ApiError.data.message`, y la ruta `/login` muestra
  `loginMutation.error.message`. El servicio de login marcará explícitamente su llamada
  para excluirla de la invalidación global.
- **Rationale**: Esto conserva el manejo actual del error de credenciales y evita que
  el aviso global lo sustituya. La exclusión explícita hace la regla robusta incluso
  si en el futuro un estado de login tuviera credenciales locales presentes.
- **Alternatives considered**:
  - Invalidar para todo HTTP 401: descartado porque incluye credenciales incorrectas
    y oculta el error del formulario.
  - Excluir el login comparando solo la ruta del endpoint: descartado porque vincula
    una regla de autenticación al texto de URL y es frágil ante cambios de ruta.
  - Cambiar el tratamiento de `LoginError`: descartado porque la ruta ya presenta el
    mensaje existente y no requiere otro flujo.

## Clasificación de HTTP 401

- **Decision**: Emitir una señal global solo cuando la respuesta sea 401, la petición
  lleve credenciales de autenticación y su política permita invalidar sesión. La
  llamada de login opta explícitamente por no invalidar. Las llamadas no autenticadas
  no generan la señal.
- **Rationale**: La regla refleja la aclaración funcional y distingue una sesión
  rechazada de una solicitud pública o de credenciales de acceso rechazadas.
- **Alternatives considered**:
  - Basarse solo en que exista `authStorage`: descartado si la petición no envía el
    token o la llamada está explícitamente excluida.
  - Tratar cualquier error de `fetch` como 401: descartado; un fallo de red no tiene
    respuesta HTTP.

## Coordinación de estado y presentación

- **Decision**: El cliente HTTP centraliza la evaluación de respuesta; `AuthProvider`
  limpia `authStorage` y actualiza el estado React; `AppLayout` muestra un componente
  común y navega al formulario de login existente.
- **Rationale**: El código actual mantiene almacenamiento y autenticación en memoria
  por separado. El cliente no posee navegación, y el layout ya envuelve la aplicación.
  Esta asignación conserva las responsabilidades existentes.
- **Alternatives considered**:
  - Navegar desde el cliente API: descartado por acoplamiento entre el cliente HTTP y
    el router.
  - Añadir una ruta de expiración: descartado porque el layout permite presentar el
    estado sin una ruta adicional.
  - Limpiar únicamente almacenamiento: descartado porque el contexto React quedaría
    autenticado.

## Estado del servidor para credenciales incorrectas

- **Resultado de verificación (2026-10-22)**: No se pudo confirmar el estado HTTP ni
  el cuerpo que devuelve `/Auth/LoginAsync` ante credenciales incorrectas. El
  repositorio disponible contiene el frontend, pero no código del servidor ni una
  configuración que identifique un backend de pruebas autorizado. No se realizaron
  solicitudes remotas ni se intentó acceder a producción; tampoco se usaron
  credenciales.
- **Comportamiento del frontend verificado por inspección**: `authService.login`
  envía un `POST` a `/Auth/LoginAsync` y excluye explícitamente la señal global de
  invalidación. `apiClient.post` lee la respuesta como JSON y, si no es exitosa,
  construye `ApiError` con el estado y cuerpo. `useLogin` convierte `ApiError.data`
  al formato esperado `ApiResponse` (`message` y `error`) y lo expone como
  `LoginError`; la ruta `/login` muestra el mensaje y los errores de validación del
  formulario. Esto confirma el manejo implementado por el frontend, pero no el
  estado ni el contrato real del backend.
- **Limitación del formato**: El cliente debe poder parsear el cuerpo como JSON antes
  de construir `ApiError`. Un cuerpo vacío o no JSON no sigue el flujo `ApiError` →
  `LoginError`; el comportamiento real de esos casos tampoco se pudo verificar.
- **Pendiente**: Repetir la comprobación de estado HTTP y cuerpo con credenciales de
  prueba no sensibles en un entorno de backend autorizado, y confirmar si la
  respuesta coincide con el JSON `ApiResponse` esperado por el frontend.
- **Alternatives considered**:
  - Afirmar un estado HTTP o mensaje específico del servidor: descartado por falta de
    evidencia.
  - Probar contra producción sin autorización: descartado.

## Pruebas y validación

- **Decision**: Cubrir con escenarios de navegador el 401 autenticado, el 401 del login,
  401 no autenticado, fallos de red, otros estados, repeticiones y recuperación. Ejecutar
  `bun run build` y `bun run lint`.
- **Rationale**: La inspección no encontró framework ni pruebas existentes; el
  `package.json` ofrece scripts de build y lint. Añadir un runner no es necesario para
  actualizar este plan.
- **Alternatives considered**:
  - Añadir infraestructura automatizada en este alcance: descartado por el principio
    de simplicidad y la solicitud de no añadir dependencias innecesarias.

### Validación final T008 (2026-10-22)

- `bun run build`: **PASS**. `tsc -b` y `vite build` finalizaron correctamente.
- `bun run lint`: **FAIL**, 13 errores y 0 warnings. Doce errores están en archivos
  fuera de los cambios de esta funcionalidad. El error restante está en
  `src/auth/AuthProvider.tsx`, por la regla `react-refresh/only-export-components`.
  La misma exportación de `useAuth` ya existía en la versión base del archivo, por lo
  que el hallazgo es preexistente; no se modificó para corregirlo en T008.
- ESLint focalizado en `AuthProvider.tsx`, `AppLayout.tsx`, `SessionExpiredScreen.tsx`,
  `apiClient.ts` y `authService.ts`: **FAIL** únicamente por ese mismo error
  preexistente en `AuthProvider.tsx`; los otros cuatro archivos no reportaron errores.
- `git diff --check`: **PASS**, sin errores de espacios en blanco.
- Verificación manual en navegador y respuestas HTTP: **NO EJECUTADA**. Los casos
  pendientes y el requisito de contar con un backend autorizado, sesión de prueba o
  simulación de respuestas están enumerados en el registro de
  `specs/001-invalid-session-handling/quickstart.md`. No se usaron credenciales ni se
  hicieron solicitudes a producción.
- Estado de Git: los cuatro archivos de aplicación rastreados modificados son
  `src/auth/AuthProvider.tsx`, `src/components/layout/AppLayout.tsx`,
  `src/services/api/apiClient.ts` y `src/services/api/authService.ts`. También aparece
  sin seguimiento `src/components/common/SessionExpiredScreen.tsx` y documentación/
  configuración Spec Kit generadas en `.github/`, `.specify/` y
  `specs/001-invalid-session-handling/`. Estos archivos preexistían a T008 en el
  worktree; T008 no cambió archivos de aplicación ni configuración.
