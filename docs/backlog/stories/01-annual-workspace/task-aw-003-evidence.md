# PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-tax-applicability-profile`

## Objective

Persist the Block 01 annual applicability declaration without duplicating or mutating canonical tax facts.

Canonical invariant:

```text
Applicability profile != actual tax facts
```

## Domain contract

The profile is anchored to `annualWorkspaceId` and carries the workspace `commercialYear` for traceability. It is versioned from inception with `profileVersion = 1`.

Accepted dimensions:

- `DEPENDENT_INCOME`;
- `DOMESTIC_FEE_INCOME`;
- `FOREIGN_SERVICE_INCOME`;
- `APV_CONTRIBUTIONS`;
- `MORTGAGE_INTEREST`.

Each accepts only `YES | NO | UNKNOWN`; missing declarations normalize to `UNKNOWN` and unknown dimensions/invalid values are rejected.

## Persistence and safety

SQLite table `tax_applicability_profiles` is keyed by `annual_workspace_id`; the versioned answers document is persisted independently of canonical facts.

`createTaxApplicabilityProfileUseCases(...)` provides read/save operations under trusted `AnnualWorkspaceContext`, revalidates active context before mutation and has no dependency on income, BHE, mortgage, APV or evidence repositories. Therefore a `NO` answer cannot delete or rewrite facts.

## Automated evidence

`test/tax-applicability-profile.test.mjs` covers the exact allowlist, tri-state normalization, invalid values/versions, absent-profile all-`UNKNOWN`, declaration-only `NO`, stale-write protection and real SQLite round-trip.

## Canonical validation

`make validate` executed from a complete local checkout on 2026-09-13:

- typecheck: **PASS**;
- tests: **155/155 PASS, 0 fail**;
- `desktop:check`: **PASS**;
- `architecture:check`: **PASS**.

The AW-003-specific tests all passed, including `NO` without fact mutation and stale-context rejection.

## Boundary to PTL-US-AW-004

`NEEDS_REVIEW` conflict discovery and the visible tri-state editor remain Story behavior for `PTL-US-AW-004`; AW-003 supplies the closed persistence foundation.
