# Feature Specification: Manejo de sesiones inválidas o caducadas

**Feature Branch**: `001-invalid-session-handling`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Implementar el manejo de sesiones no válidas o caducadas en IBCL Jornadas. Cuando una petición a la API devuelva HTTP 401 Unauthorized, la aplicación debe eliminar la sesión almacenada localmente y mostrar una pantalla clara que informe al usuario que su sesión ha caducado o ya no es válida. La pantalla debe incluir un botón "Volver a iniciar sesión" que dirija al formulario de acceso existente. Se debe reutilizar la arquitectura actual de React, TypeScript, el cliente de API y los mecanismos de autenticación y navegación existentes, evitando duplicar lógica. Los errores de conectividad o pérdida de Internet no deben confundirse con una sesión caducada y quedan fuera del alcance. Define los requisitos funcionales y los criterios de aceptación. No implementes código ni realices refactorizaciones."

## Clarifications

### Session 2026-10-22

- Q: ¿Qué respuestas HTTP 401 deben invalidar la sesión y activar el aviso global? → A: Solo las respuestas 401 de peticiones autenticadas; un 401 al enviar credenciales en el formulario de acceso conserva el mensaje habitual de credenciales incorrectas y no activa el aviso global.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Informar de una sesión no válida (Priority: P1)

Como usuario de IBCL Jornadas, quiero recibir una explicación clara cuando el servicio
rechaza mi sesión para saber por qué ya no puedo continuar y qué hacer.

**Why this priority**: Evita que el usuario interprete un rechazo de autenticación como
un fallo inexplicable de la aplicación y ofrece una acción para recuperarse.

**Independent Test**: Con una sesión local guardada y una petición autenticada,
provocar una respuesta HTTP 401 y comprobar que la sesión deja de estar disponible y
se presenta el aviso de sesión inválida o caducada.

**Acceptance Scenarios**:

1. **Given** una sesión guardada localmente y una petición autenticada a la API,
   **When** la respuesta es HTTP 401 Unauthorized, **Then** la sesión guardada se
   elimina y se informa al usuario que la sesión ha caducado o ya no es válida.
2. **Given** que ya se está mostrando el aviso de sesión inválida, **When** se recibe
   otra respuesta HTTP 401 de una petición autenticada, **Then** el aviso permanece
   disponible sin crear avisos duplicados ni restaurar la sesión eliminada.

---

### User Story 2 - Volver al acceso y conservar errores de credenciales (Priority: P1)

Como usuario cuya sesión fue rechazada, quiero volver al formulario de acceso desde el
aviso y recibir allí el mensaje habitual si mis nuevas credenciales son incorrectas.

**Why this priority**: El aviso solo es útil si ofrece una ruta clara para recuperar el
acceso.

**Independent Test**: Mostrar el aviso de sesión inválida, activar su botón y comprobar
que se abre el formulario existente; después, enviar credenciales incorrectas y
comprobar que se muestra el error del formulario sin el aviso global.

**Acceptance Scenarios**:

1. **Given** el aviso de sesión inválida o caducada, **When** el usuario activa
   «Volver a iniciar sesión», **Then** se le dirige al formulario de acceso existente.
2. **Given** que el usuario activa «Volver a iniciar sesión», **When** se abre el acceso,
   **Then** se utiliza el formulario y el flujo de navegación existentes, sin presentar
   una alternativa de acceso duplicada.
3. **Given** que el usuario está en el formulario de acceso, **When** el envío de
   credenciales incorrectas recibe HTTP 401, **Then** se conserva el mensaje habitual
   de credenciales incorrectas y no se activa el aviso global de sesión inválida.

---

### User Story 3 - Distinguir problemas de conectividad (Priority: P1)

Como usuario que pierde la conexión, quiero conservar mi sesión y recibir el
tratamiento habitual de error de conectividad, para no creer que mis credenciales
caducaron cuando no se obtuvo una respuesta de autenticación.

**Why this priority**: Confundir una desconexión con una sesión inválida puede cerrar
sesiones válidas y orientar al usuario a una solución incorrecta.

**Independent Test**: Con una sesión local guardada, simular pérdida de Internet o un
fallo de conexión sin respuesta HTTP y comprobar que la sesión no se elimina ni aparece
el aviso de sesión caducada.

**Acceptance Scenarios**:

1. **Given** una sesión guardada localmente, **When** una petición falla por pérdida de
   conectividad y no recibe respuesta HTTP 401, **Then** la sesión se conserva y no se
   muestra el aviso de sesión inválida o caducada.
2. **Given** un error de conectividad, **When** se informa al usuario del error,
   **Then** el error no se presenta como una sesión caducada o inválida.
3. **Given** una respuesta HTTP distinta de 401, **When** la aplicación la recibe,
   **Then** no se activa el aviso ni el tratamiento de sesión inválida definido por esta
   funcionalidad.

### Edge Cases

- Una respuesta HTTP distinta de 401 no activa el tratamiento de sesión inválida
  definido por esta funcionalidad.
- Un fallo de conexión, una pérdida de Internet o una petición que no obtiene respuesta
  HTTP no elimina la sesión local ni muestra el aviso de sesión caducada.
- Respuestas HTTP 401 sucesivas de peticiones autenticadas mientras el aviso está
  visible no generan avisos superpuestos ni cambian el destino del botón de acceso.
- Una respuesta HTTP 401 de una petición no autenticada, incluido el envío de
  credenciales al iniciar sesión, no activa el aviso global ni elimina una sesión
  local; el inicio de sesión conserva su tratamiento habitual del error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cuando una petición autenticada a la API reciba HTTP 401 Unauthorized, el
  sistema MUST eliminar la sesión almacenada localmente.
- **FR-002**: Tras un HTTP 401 de una petición autenticada, el sistema MUST informar
  claramente que la sesión ha caducado o ya no es válida.
- **FR-003**: El aviso de sesión inválida MUST incluir un botón con el texto
  «Volver a iniciar sesión».
- **FR-004**: Al activar el botón, el sistema MUST dirigir al usuario al formulario de
  acceso existente.
- **FR-005**: Los errores de conectividad o pérdida de Internet sin respuesta HTTP 401
  MUST NOT eliminar la sesión almacenada ni presentarse como una sesión caducada o
  inválida.
- **FR-006**: Respuestas HTTP distintas de 401 MUST NOT activar el tratamiento de
  sesión inválida definido en esta funcionalidad.
- **FR-007**: El comportamiento MUST reutilizar los mecanismos existentes de sesión,
  autenticación y navegación, sin duplicar esos flujos.
- **FR-008**: Un HTTP 401 de una petición no autenticada, incluido el envío de
  credenciales en el formulario de acceso, MUST NOT eliminar la sesión ni activar el
  aviso global; el formulario MUST conservar su mensaje habitual de credenciales
  incorrectas.

### Key Entities *(include if feature involves data)*

- **Sesión local**: Estado de autenticación guardado en el dispositivo del usuario;
  deja de estar disponible al recibir HTTP 401 en una petición autenticada.
- **Respuesta de petición**: Resultado de una petición, que distingue una respuesta
  HTTP 401 de una petición autenticada, una respuesta de una petición no autenticada y
  los fallos sin respuesta HTTP causados por conectividad.
- **Aviso de sesión inválida**: Información visible que explica el rechazo de sesión
  y ofrece una acción para volver al formulario de acceso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100 % de las pruebas con HTTP 401 en una petición autenticada, la
  sesión almacenada localmente deja de estar disponible y el aviso de sesión inválida
  se presenta.
- **SC-002**: En el 100 % de las pruebas de pérdida de conectividad sin respuesta HTTP
  401, la sesión local se conserva y no se presenta el aviso de sesión caducada.
- **SC-003**: En el 100 % de las pruebas, activar «Volver a iniciar sesión» lleva al
  formulario de acceso existente.
- **SC-004**: Al menos 4 de 5 usuarios de prueba identifican en el aviso que su sesión
  ya no es válida y cuál es la acción para recuperar el acceso, sin ayuda externa.
- **SC-005**: En el 100 % de las pruebas con HTTP 401 al enviar credenciales
  incorrectas, se muestra el mensaje habitual del formulario y no aparece el aviso
  global de sesión inválida.

## Assumptions

- La aplicación ya cuenta con un formulario de acceso y un destino de navegación para
  llegar a él.
- Para esta funcionalidad, un HTTP 401 en una petición autenticada indica que la sesión
  ya no es válida; un HTTP 401 al enviar credenciales no significa que una sesión
  existente haya caducado.
- Los errores de conectividad sin respuesta HTTP se siguen tratando mediante el
  comportamiento de error existente; mejorar ese comportamiento queda fuera de alcance.
- La invalidación y navegación se integrarán con los mecanismos existentes y no
  requieren un flujo de inicio de sesión alternativo.
