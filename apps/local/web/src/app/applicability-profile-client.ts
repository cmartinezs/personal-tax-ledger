export type ApplicabilityAnswer = 'YES' | 'NO' | 'UNKNOWN';
export type FactPresence = 'PRESENT' | 'NOT_PRESENT' | 'UNAVAILABLE';
export type ApplicabilityReviewState = 'OK' | 'PENDING' | 'NEEDS_REVIEW';

export type ApplicabilityDimensionReview = {
  dimension: string;
  answer: ApplicabilityAnswer;
  factPresence: FactPresence;
  state: ApplicabilityReviewState;
};

export type ApplicabilityProfileReview = {
  profile: {
    annualWorkspaceId: string;
    commercialYear: number;
    profileVersion: number;
    answers: Record<string, ApplicabilityAnswer>;
    updatedAt: string;
  };
  dimensions: ApplicabilityDimensionReview[];
  needsReviewCount: number;
  pendingCount: number;
};

async function request<T>(method: 'GET' | 'PUT', body?: unknown): Promise<T> {
  const response = await fetch('/api/annual-workspace/applicability-profile', {
    method,
    headers: { 'content-type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || 'No se pudo actualizar el perfil del año');
  return payload as T;
}

export const applicabilityProfileClient = {
  get: () => request<ApplicabilityProfileReview>('GET'),
  save: (answers: Record<string, ApplicabilityAnswer>) => request<ApplicabilityProfileReview>('PUT', { answers })
};
