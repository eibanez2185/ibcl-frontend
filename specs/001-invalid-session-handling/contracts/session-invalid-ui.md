# UI Contract: Sesión inválida o caducada

## Activación del aviso global

- Una respuesta HTTP 401 de una petición autenticada y elegible activa la
  invalidación global.
- Se elimina la sesión local, el estado de autenticación cambia a no autenticado y
  se muestra el aviso en lugar del contenido protegido.
- Un HTTP 401 al enviar credenciales de acceso no activa el aviso global ni causa
  limpieza de sesión por este flujo.
- Un HTTP 401 de otra petición no autenticada conserva su manejo actual y no activa el
  aviso global.

## Presentación del aviso

- El mensaje informa en español que la sesión caducó o ya no es válida.
- Incluye un botón con el texto exacto **«Volver a iniciar sesión»**.
- El botón es enfocable y operable por teclado, con nombre accesible coherente con el
  texto visible.
- No se muestran credenciales ni tokens.
- Respuestas 401 autenticadas repetidas no apilan avisos.

## Acción y destino

- Activar **«Volver a iniciar sesión»** cierra el estado de aviso y navega a la ruta
  existente `/login`.
- Se reutiliza el formulario actual.

## Errores de acceso y exclusiones

- Un 401 de credenciales incorrectas sigue el manejo existente `ApiError` →
  `LoginError`; la ruta presenta el mensaje del error de login y no muestra el aviso
  global.
- Errores de conectividad sin respuesta HTTP no eliminan la sesión ni activan el aviso.
- Respuestas HTTP diferentes de 401 no activan el aviso.
- El estado HTTP y el formato exacto que el servidor devuelve por credenciales
  incorrectas no se han podido verificar en este repositorio; validar en un entorno
  backend de pruebas.
