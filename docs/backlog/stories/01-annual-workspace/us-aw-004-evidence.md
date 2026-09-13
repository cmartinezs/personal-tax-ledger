# PTL-US-AW-004 — Applicability Profile — Evidence

**Type:** Story  
**Capability:** TAX-01  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-applicability-profile-ui`

## User outcome implemented

The active Annual Workspace now exposes the five-dimension applicability profile defined by `PTL-SPIKE-AW-001` with explicit tri-state answers:

```text
YES | NO | UNKNOWN
```

Visible copy renders these as:

```text
Sí | No | Aún no sé
```

The editor states explicitly that the profile does not register amounts and does not prove that a situation occurred.

## Acceptance evidence

### AC-01 — tri-state editor

All five accepted dimensions render accessible radio groups with `Sí`, `No`, `Aún no sé`.

### AC-02 — UNKNOWN remains pending

`UNKNOWN` projects to `PENDING`. It is not validation failure and is not inferred to YES/NO.

### AC-03 — profile edits do not delete facts

AW-003 already isolates profile persistence from canonical fact repositories. AW-004 only saves the profile document and then recalculates a read-only conflict projection.

### AC-04 — NO versus canonical fact => NEEDS_REVIEW

A dimension projects `NEEDS_REVIEW` only when:

```text
profile answer = NO
AND
canonical fact presence = PRESENT
```

The profile remains `NO`; facts remain untouched. The UI explains that the profile was not modified automatically and directs the user to the owning data surface.

Current canonical presence providers are deliberately conservative:

- `DEPENDENT_INCOME` — persisted salary income source exists;
- `DOMESTIC_FEE_INCOME` — persisted BHE/fee receipt exists;
- `APV_CONTRIBUTIONS` — persisted income source contains APV A/B with positive contribution;
- `MORTGAGE_INTEREST` — persisted mortgage exists;
- `FOREIGN_SERVICE_INCOME` — `UNAVAILABLE` until a canonical foreign-service provider exists.

`UNAVAILABLE` never invents a conflict.

### AC-05 — reusable as proposal

The persisted, versioned profile remains structurally reusable by the future allowlisted prior-year initialization flow. AW-004 does not implement copying itself.

### AC-06 — downstream consumers do not treat profile as occurrence evidence

The review projection keeps applicability declarations and canonical fact presence as separate fields. Presence is read from owning capabilities; answers do not create facts.

## Architecture

Conflict detection is implemented in a separate application projection:

`createTaxApplicabilityProfileReviewUseCases(...)`

This preserves the AW-003 invariant that the profile repository/use case itself has no dependency on income/BHE/mortgage/APV repositories.

## HTTP/UI

Endpoint:

```text
GET /api/annual-workspace/applicability-profile
PUT /api/annual-workspace/applicability-profile
```

The web surface is implemented as `ApplicabilityProfileSection` under the active Annual Workspace context and reloads whenever `commercialYear` changes.

## Automated evidence

- `test/tax-applicability-profile-review.test.mjs`
  - UNKNOWN -> PENDING;
  - NO + PRESENT -> NEEDS_REVIEW;
  - UNAVAILABLE does not create a conflict;
  - saving keeps declaration and recalculates conflict from facts.
- `test/tax-applicability-profile-frontend.test.mjs`
  - exact visible tri-state copy;
  - no monetary input;
  - explicit NEEDS_REVIEW copy;
  - annual-context remount/reload;
  - explicit annual profile endpoint.

## Closure gate

Canonical validation remains mandatory:

```text
make validate
```

Until it passes, `PTL-US-AW-004` remains **IN_REVIEW**.
