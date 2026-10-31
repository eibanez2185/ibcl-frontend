---

description: "Task list for handling invalid or expired sessions"
---

# Tasks: Manejo de sesiones inválidas o caducadas

**Input**: Design documents from `specs/001-invalid-session-handling/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/session-invalid-ui.md`, `quickstart.md`

**Tests**: The project has no configured automated test runner. Validate the listed
acceptance scenarios manually in the browser and run the existing build and lint
commands; do not add test dependencies for this feature.

**Organization**: Tasks are grouped by user story. The shared API response policy is
foundational; the user-story phases deliver and verify their respective outcomes.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization is needed; this feature uses the existing
frontend, dependencies, routes, and validation scripts. Do not add dependencies.

No setup tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared API response classification needed by the authenticated
session flow and the login exception.

- [X] T001 Add centralized HTTP 401 classification and an explicit per-request invalidation policy in `src/services/api/apiClient.ts`; emit the global signal only for HTTP 401 responses on authenticated, eligible requests, before parsing response bodies, while preserving `ApiError` construction and propagation for all failures.

**Checkpoint**: The client distinguishes authenticated eligible requests from opted-out
or unauthenticated requests; user-story work can proceed.

---

## Phase 3: User Story 1 - Informar de una sesión no válida (Priority: P1) 🎯 MVP

**Goal**: Invalidate a local authenticated session after an eligible HTTP 401 and show
one clear global notice with a recovery action.

**Independent Test**: With an authenticated session, simulate HTTP 401 and verify
`jornadas_auth` is removed, React auth state becomes unauthenticated, and a single
session-invalid notice appears.

### Implementation for User Story 1

- [X] T002 [US1] Subscribe to the API client's eligible session-invalid signal in `src/auth/AuthProvider.tsx`; call `authStorage.clear()`, set auth state to `null`, and expose an idempotent invalid-session state and reset action.
- [X] T003 [P] [US1] Create the accessible notice with the exact action label «Volver a iniciar sesión» in `src/components/common/SessionExpiredScreen.tsx`; keep its navigation action exposed as a typed callback for layout integration.
- [X] T004 [US1] Integrate `SessionExpiredScreen.tsx` into `src/components/layout/AppLayout.tsx` to replace protected content while invalid-session state is active and navigate to `/login` on activation (depends on T002 and T003).

**Checkpoint**: An authenticated eligible 401 clears persistent and in-memory session
state and displays one notice; its action reaches the existing login route.

---

## Phase 4: User Story 2 - Volver al acceso y conservar errores de credenciales (Priority: P1)

**Goal**: Return to the existing login form while preserving its normal credential-error
handling and preventing login 401 responses from triggering global session invalidation.

**Independent Test**: From the invalid-session notice, open `/login`, submit invalid
credentials against an approved test backend, and verify the existing `LoginError`
message appears without the global notice.

### Implementation and validation for User Story 2

- [X] T005 [US2] Mark the credentials submission as explicitly excluded from global session invalidation in `src/services/api/authService.ts`; preserve the existing `ApiError` → `LoginError` flow in `src/hooks/useLogin.ts` and the message rendering in `src/routes/login/index.tsx`.
- [X] T006 [US2] Verify the actual HTTP status and error body for invalid credentials from `/Auth/LoginAsync` in an approved backend test environment; document the observed result or the inability to verify it in `specs/001-invalid-session-handling/research.md`, without storing credentials or changing the backend contract as part of this feature.

**Checkpoint**: Login 401 remains local to the login flow, shows its expected message,
and does not activate the global notice; any backend contract limitation is recorded.

---

## Phase 5: User Story 3 - Distinguir problemas de conectividad (Priority: P1)

**Goal**: Keep connectivity errors and non-401 HTTP responses separate from invalid
authenticated-session handling.

**Independent Test**: With a session active, simulate a rejected network request and
HTTP statuses other than 401; verify the session remains and no global session notice
appears.

### Validation for User Story 3

- [X] T007 [US3] Run and record the connectivity, unauthenticated-401, non-401-response, and repeated-authenticated-401 scenarios in `specs/001-invalid-session-handling/quickstart.md`; confirm network failures without a `Response` do not emit the global signal and repeated signals do not stack notices.

**Checkpoint**: Connectivity and other HTTP errors preserve their existing behavior;
repeated authenticated 401 responses produce one stable invalid-session state.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate the complete feature and ensure no unrelated setup or code is
introduced.

- [X] T008 Run all applicable scenarios in `specs/001-invalid-session-handling/quickstart.md`, then run `bun run build` and `bun run lint` from the repository root; record any failures or remaining backend verification limitation in `specs/001-invalid-session-handling/research.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks; the frontend project and its scripts already exist.
- **Foundational (Phase 2)**: T001 must finish before any story work because it defines
  the shared response classification and opt-out policy.
- **User Stories (Phase 3+)**: Each story depends on T001. US2 and US3 acceptance
  validation depends on US1 so the notice and recovery path are available end-to-end.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after T001; delivers session clearing and global notice.
- **User Story 2 (P1)**: T005 depends on T001; end-to-end validation depends on US1 so
  the recovery path and existing login form can both be exercised.
- **User Story 3 (P1)**: Depends on T001 and US1; validates network and other response
  handling against the global notice.

### Within Each User Story

- Complete shared API policy T001 before dependent work.
- In US1, T002 and T003 create independent session-state and notice components; T004
  integrates them after both are complete.
- In US2, verify the login-specific exclusion and preserve the current error mapping;
  backend verification may be blocked if no approved test environment is available.
- Complete acceptance validation for each story before the final cross-cutting checks.

### Parallel Opportunities

- After T001, the notice component file `src/components/common/SessionExpiredScreen.tsx`
  can be drafted independently of provider work in `src/auth/AuthProvider.tsx`; layout
  integration waits for both.
- After T001 and US1 are complete, US2 backend verification and US3 connectivity/status
  validation can be performed in parallel because they use separate scenarios and
  documentation sections.
- T007 is a final integration check and is not parallel with unfinished story work.

---

## Parallel Example: User Story 1

```text
After T001, run independent tasks in parallel:
Task: T002 - Subscribe to invalid-session signal in src/auth/AuthProvider.tsx
Task: T003 - Create the notice component in src/components/common/SessionExpiredScreen.tsx

Then run T004 to integrate the provider state and notice in src/components/layout/AppLayout.tsx.
```

## Parallel Example: User Stories 2 and 3

```text
After T001 and User Story 1:
Task: T006 - Verify login 401 behavior and update specs/001-invalid-session-handling/research.md
Task: T007 - Validate connectivity and non-401 behavior using specs/001-invalid-session-handling/quickstart.md
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 to establish eligible authenticated-401 signaling.
2. Complete T002 and T003 to clear session state and present the global notice.
3. Complete T002, T003, and T004, then validate User Story 1 independently using the
   authenticated-401 and recovery scenarios in
   `specs/001-invalid-session-handling/quickstart.md`.

### Incremental Delivery

1. Deliver the authenticated-session invalidation MVP.
2. Add US2's explicit login opt-out and verify that the existing
   `ApiError` → `LoginError` path remains visible; resolve or record backend uncertainty.
3. Validate US3 network and non-401 behavior and repeated 401 handling.
4. Run the complete quickstart guide, `bun run build`, and `bun run lint`.
