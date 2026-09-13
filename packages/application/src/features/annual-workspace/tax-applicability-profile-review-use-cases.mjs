import { assertAnnualWorkspaceContext } from '@personal-tax-ledger/contracts';

export const TAX_APPLICABILITY_REVIEW_STATE = Object.freeze({
  OK: 'OK',
  PENDING: 'PENDING',
  NEEDS_REVIEW: 'NEEDS_REVIEW'
});

export const TAX_FACT_PRESENCE = Object.freeze({
  PRESENT: 'PRESENT',
  NOT_PRESENT: 'NOT_PRESENT',
  UNAVAILABLE: 'UNAVAILABLE'
});

export function createTaxApplicabilityProfileReviewUseCases({ profileUseCases, readCanonicalFactPresence }) {
  if (typeof profileUseCases?.getTaxApplicabilityProfile !== 'function' || typeof profileUseCases?.saveTaxApplicabilityProfile !== 'function') {
    throw new TypeError('Applicability review requiere TaxApplicabilityProfileUseCases');
  }
  if (typeof readCanonicalFactPresence !== 'function') {
    throw new TypeError('Applicability review requiere readCanonicalFactPresence');
  }

  async function project(context, profile) {
    const scoped = assertAnnualWorkspaceContext(context);
    const presence = await readCanonicalFactPresence(scoped);
    const dimensions = Object.entries(profile.answers).map(([dimension, answer]) => {
      const factPresence = presence[dimension] || TAX_FACT_PRESENCE.UNAVAILABLE;
      const state = answer === 'NO' && factPresence === TAX_FACT_PRESENCE.PRESENT
        ? TAX_APPLICABILITY_REVIEW_STATE.NEEDS_REVIEW
        : answer === 'UNKNOWN'
          ? TAX_APPLICABILITY_REVIEW_STATE.PENDING
          : TAX_APPLICABILITY_REVIEW_STATE.OK;
      return Object.freeze({ dimension, answer, factPresence, state });
    });
    return Object.freeze({
      profile,
      dimensions,
      needsReviewCount: dimensions.filter(item => item.state === TAX_APPLICABILITY_REVIEW_STATE.NEEDS_REVIEW).length,
      pendingCount: dimensions.filter(item => item.state === TAX_APPLICABILITY_REVIEW_STATE.PENDING).length
    });
  }

  return {
    async getTaxApplicabilityProfileReview(context) {
      const scoped = assertAnnualWorkspaceContext(context);
      return project(scoped, await profileUseCases.getTaxApplicabilityProfile(scoped));
    },
    async saveTaxApplicabilityProfileReview(context, answers) {
      const scoped = assertAnnualWorkspaceContext(context);
      const saved = await profileUseCases.saveTaxApplicabilityProfile(scoped, answers);
      return project(scoped, saved);
    }
  };
}
