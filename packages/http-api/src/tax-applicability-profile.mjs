import { apiError as respondError, json as respond, readJsonBody } from './index.mjs';

export function createTaxApplicabilityProfileRouter({
  reviewUseCases,
  resolveContext,
  readBody = readJsonBody,
  json = respond,
  apiError = respondError
}) {
  return async function routeTaxApplicabilityProfile({ req, res, path }) {
    if (path !== '/api/annual-workspace/applicability-profile') return false;
    try {
      const context = await resolveContext();
      if (req.method === 'GET') {
        json(res, 200, await reviewUseCases.getTaxApplicabilityProfileReview(context));
        return true;
      }
      if (req.method === 'PUT') {
        const body = await readBody(req);
        json(res, 200, await reviewUseCases.saveTaxApplicabilityProfileReview(context, body.answers || {}));
        return true;
      }
      return false;
    } catch (error) {
      if (error?.code === 'workspace_year_mismatch') throw error;
      apiError(res, 400, 'invalid_applicability_profile', error instanceof Error ? error.message : 'Perfil de aplicabilidad inválido');
      return true;
    }
  };
}
