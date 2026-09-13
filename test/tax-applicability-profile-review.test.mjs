import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaxApplicabilityProfileReviewUseCases,
  TAX_APPLICABILITY_REVIEW_STATE,
  TAX_FACT_PRESENCE
} from '@personal-tax-ledger/application';

const context = {
  workspaceId: 'local-workspace',
  actorId: 'local-user',
  annualWorkspaceId: 'annual-tax-workspace-2026',
  commercialYear: 2026
};

function profile(answers) {
  return {
    annualWorkspaceId: context.annualWorkspaceId,
    commercialYear: 2026,
    profileVersion: 1,
    answers,
    updatedAt: '2026-09-13T05:40:00.000Z'
  };
}

const baseAnswers = {
  DEPENDENT_INCOME: 'UNKNOWN',
  DOMESTIC_FEE_INCOME: 'UNKNOWN',
  FOREIGN_SERVICE_INCOME: 'UNKNOWN',
  APV_CONTRIBUTIONS: 'UNKNOWN',
  MORTGAGE_INTEREST: 'UNKNOWN'
};

test('AW-004: UNKNOWN queda PENDING y no se convierte en inferencia tributaria', async () => {
  const useCases = createTaxApplicabilityProfileReviewUseCases({
    profileUseCases: {
      async getTaxApplicabilityProfile() { return profile(baseAnswers); },
      async saveTaxApplicabilityProfile() { throw new Error('not used'); }
    },
    async readCanonicalFactPresence() { return {}; }
  });
  const review = await useCases.getTaxApplicabilityProfileReview(context);
  assert.equal(review.pendingCount, 5);
  assert.equal(review.needsReviewCount, 0);
  assert.ok(review.dimensions.every(item => item.state === TAX_APPLICABILITY_REVIEW_STATE.PENDING));
});

test('AW-004: NO + hecho canónico PRESENT produce NEEDS_REVIEW sin reescribir el perfil', async () => {
  const answers = { ...baseAnswers, DEPENDENT_INCOME: 'NO' };
  const useCases = createTaxApplicabilityProfileReviewUseCases({
    profileUseCases: {
      async getTaxApplicabilityProfile() { return profile(answers); },
      async saveTaxApplicabilityProfile() { throw new Error('not used'); }
    },
    async readCanonicalFactPresence() {
      return { DEPENDENT_INCOME: TAX_FACT_PRESENCE.PRESENT };
    }
  });
  const review = await useCases.getTaxApplicabilityProfileReview(context);
  const row = review.dimensions.find(item => item.dimension === 'DEPENDENT_INCOME');
  assert.equal(row.answer, 'NO');
  assert.equal(row.factPresence, 'PRESENT');
  assert.equal(row.state, 'NEEDS_REVIEW');
  assert.equal(review.needsReviewCount, 1);
});

test('AW-004: ausencia de proveedor canónico no inventa conflicto', async () => {
  const answers = { ...baseAnswers, FOREIGN_SERVICE_INCOME: 'NO' };
  const useCases = createTaxApplicabilityProfileReviewUseCases({
    profileUseCases: {
      async getTaxApplicabilityProfile() { return profile(answers); },
      async saveTaxApplicabilityProfile() { throw new Error('not used'); }
    },
    async readCanonicalFactPresence() {
      return { FOREIGN_SERVICE_INCOME: TAX_FACT_PRESENCE.UNAVAILABLE };
    }
  });
  const review = await useCases.getTaxApplicabilityProfileReview(context);
  const row = review.dimensions.find(item => item.dimension === 'FOREIGN_SERVICE_INCOME');
  assert.equal(row.state, 'OK');
  assert.equal(row.factPresence, 'UNAVAILABLE');
});

test('AW-004: guardar conserva la declaración y recalcula el conflicto desde hechos', async () => {
  let savedAnswers;
  const useCases = createTaxApplicabilityProfileReviewUseCases({
    profileUseCases: {
      async getTaxApplicabilityProfile() { throw new Error('not used'); },
      async saveTaxApplicabilityProfile(_context, answers) {
        savedAnswers = { ...answers };
        return profile({ ...baseAnswers, ...answers });
      }
    },
    async readCanonicalFactPresence() {
      return { MORTGAGE_INTEREST: TAX_FACT_PRESENCE.PRESENT };
    }
  });
  const review = await useCases.saveTaxApplicabilityProfileReview(context, { MORTGAGE_INTEREST: 'NO' });
  assert.equal(savedAnswers.MORTGAGE_INTEREST, 'NO');
  assert.equal(review.dimensions.find(item => item.dimension === 'MORTGAGE_INTEREST').state, 'NEEDS_REVIEW');
});
