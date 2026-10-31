<!--
Sync Impact Report
Version change: unfilled scaffold -> 1.0.0
Modified principles: none (first substantive adoption)
Added principles: I. User-Centered Workflows; II. Modular, Typed Frontend;
  III. Secure Data Handling; IV. Accessible and Resilient UX; V. Verifiable Quality
Added sections: Additional Constraints; Development Workflow
Removed sections: none
Follow-up TODOs: Confirm the original ratification date.
-->

# Jornadas Frontend Constitution

## Core Principles

### I. User-Centered Workflows
Changes MUST support clear, predictable workflows for employees and administrators
using the jornadas application. Preserve existing behavior unless the change explicitly
calls for a user-visible difference, and make errors and next steps understandable.
This keeps essential time and personnel operations dependable.

### II. Modular, Typed Frontend
Application changes MUST use the existing React and TypeScript architecture, keep
responsibilities cohesive across routes, features, hooks, services, and shared UI, and
represent data with explicit types. Reuse established patterns before introducing new
abstractions. This limits coupling and makes changes easier to review and maintain.

### III. Secure Data Handling
Authentication and API changes MUST follow the existing authenticated-service patterns,
avoid exposing credentials or sensitive personnel data in logs, UI, or persisted client
state beyond what the workflow requires, and handle authorization and API failures
explicitly. This protects users and the integrity of personnel information.

### IV. Accessible and Resilient UX
Interactive controls MUST have clear labels and usable keyboard behavior. Forms and
data-driven screens MUST communicate loading, empty, success, and error states where
those states apply, and MUST avoid presenting failed requests as successful results.
This makes workflows usable and failures recoverable.

### V. Verifiable Quality
Changes MUST pass the applicable project checks, including TypeScript/build and lint
checks when available. New or changed behavior MUST receive focused tests when the
project has a suitable test setup; otherwise, validation MUST be recorded and performed
through the narrowest practical check. This provides evidence that changes work without
requiring unrelated tooling.

## Additional Constraints

- The frontend uses React, TypeScript, Vite, TanStack Router, and TanStack Query.
  New work MUST remain compatible with the configured project toolchain.
- API access MUST use the existing API service/client layer rather than adding
  ad-hoc network calls in presentation components.
- Environment-specific API configuration MUST remain external to committed source;
  credentials and tokens MUST NOT be committed.
- Dependencies and architectural abstractions MUST be added only when the change
  requires them and their maintenance cost is justified.

## Development Workflow

- Before implementation, inspect the relevant route, feature, hook, service, type, and
  shared UI patterns; keep changes scoped to the requested behavior.
- Validate changes with the smallest relevant checks. Run the project build and lint
  when the change affects application code or shared configuration.
- Review user-visible states, API error paths, authorization-sensitive behavior, and
  responsive or keyboard interaction when applicable.
- Pull requests and reviews MUST identify the behavior changed, checks performed, and
  any known limitations or deferred validation.

## Governance

This constitution governs project implementation and review. When another project
practice conflicts with it, the conflict MUST be resolved explicitly or this constitution
must be amended before the conflicting practice becomes standard.

Amendments MUST update this document, explain the rationale, and assess impacts on
existing code, templates, and workflows. Changes require project-owner approval through
the repository's normal review process. Contributors and reviewers MUST check applicable
principles during design, implementation, and review, and MUST document any necessary
deviation with its rationale and scope.

Versioning follows semantic versioning: MAJOR for incompatible governance or principle
changes, MINOR for new principles or materially expanded requirements, and PATCH for
clarifications and non-semantic wording changes. The version and last-amended date MUST
be updated with every approved amendment. Compliance is reviewed during pull request
review and when revising project development practices.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Confirm original adoption date | **Last Amended**: 2026-10-22
