# Data Model: Manejo de sesiones inválidas o caducadas

Esta funcionalidad no introduce entidades persistentes ni modifica el formato de
autenticación. Modela el contexto de autenticación de una petición y el estado
transitorio existente en memoria.

## Entidades y estado

### Sesión autenticada

- **Representación persistente**: objeto almacenado bajo `jornadas_auth` mediante
  `authStorage`.
- **Representación en memoria**: `auth` en `AuthProvider`; `isAuthenticated` se deriva
  de si `auth` no es `null`.
- **Invalidación**: una respuesta HTTP 401 a una petición autenticada y elegible
  elimina la sesión mediante `authStorage.clear()` y establece `auth` en `null`.
- **Relación**: almacenamiento y estado React representan la misma sesión y deben
  actualizarse durante la misma transición.

### Clasificación de petición

- **Autenticada**: la petición realmente incluye las credenciales de autenticación que
  adjunta el cliente existente.
- **Elegible para invalidación**: la petición autenticada permite que un HTTP 401
  active el tratamiento global. El envío de credenciales a `/Auth/LoginAsync` está
  explícitamente excluido.
- **No autenticada**: no lleva credenciales; su HTTP 401 conserva el manejo actual y
  no elimina una sesión ni activa el aviso global.
- **Validación**: solo se activa invalidación cuando hay HTTP 401, petición
  autenticada y elegibilidad global.

### Estado de aviso de sesión inválida

- **Tipo**: estado transitorio en memoria; no se persiste.
- **Valores**: inactivo o activo.
- **Transición a activo**: señal de HTTP 401 autenticado y elegible.
- **Transición a inactivo**: el usuario solicita volver al formulario existente.
- **Repetición**: señales duplicadas o concurrentes no crean avisos adicionales.
- **Sin transición**: 401 de login, 401 no autenticado, otro estado HTTP o fallo de
  conectividad no activan el aviso global.

### Error del formulario de acceso

- **Representación**: `ApiError` creado por el cliente a partir de la respuesta HTTP;
  `useLogin` lo convierte a `LoginError` con el mensaje y errores de validación de
  `ApiError.data`.
- **Presentación**: la ruta `/login` muestra `loginMutation.error.message`.
- **Regla**: la exclusión de invalidación global no modifica esta conversión ni la
  presentación existente.
- **Limitación**: el formato y estado HTTP reales de credenciales incorrectas dependen
  del backend y no se pueden confirmar con el código frontend disponible.

## Invariantes

1. Solo un 401 autenticado y elegible limpia la sesión y activa el aviso global.
2. El 401 de login conserva el flujo `ApiError` → `LoginError` y no activa el aviso.
3. Con el aviso activo, la sesión persistida está vacía y `AuthProvider` no considera
   autenticado al usuario.
4. Fallos de red y respuestas distintas de 401 no activan la invalidación.
5. El aviso no muestra credenciales ni token.
