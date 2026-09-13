import {
  createTaxApplicabilityProfileReviewUseCases,
  createTaxApplicabilityProfileUseCases,
  TAX_FACT_PRESENCE
} from '@personal-tax-ledger/application';
import { createSqliteTaxApplicabilityProfileRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createTaxApplicabilityProfileRouter } from '@personal-tax-ledger/http-api';

export function createApplicabilityProfileComposition(dependencies) {
  const repository = dependencies?.taxApplicabilityProfileRepository
    || createSqliteTaxApplicabilityProfileRepository(undefined, dependencies?.database);
  const profileUseCases = createTaxApplicabilityProfileUseCases({
    repository,
    resolveActiveContext: dependencies?.resolveAnnualContext
  });

  const readCanonicalFactPresence = async context => {
    const [incomes, feeReceipts, mortgages] = await Promise.all([
      dependencies.incomeUseCases.listIncomeSources(context),
      dependencies.feeReceiptUseCases.listFeeReceipts(context),
      dependencies.mortgageUseCases.listMortgageLoans(context)
    ]);
    const present = value => value ? TAX_FACT_PRESENCE.PRESENT : TAX_FACT_PRESENCE.NOT_PRESENT;
    return {
      DEPENDENT_INCOME: present(incomes.some(item => item.kind === 'SALARY')),
      DOMESTIC_FEE_INCOME: present(feeReceipts.length > 0),
      FOREIGN_SERVICE_INCOME: TAX_FACT_PRESENCE.UNAVAILABLE,
      APV_CONTRIBUTIONS: present(incomes.some(item => ['A', 'B'].includes(item.apvRegime) && Number(item.apvMonthly) > 0)),
      MORTGAGE_INTEREST: present(mortgages.length > 0)
    };
  };

  const reviewUseCases = createTaxApplicabilityProfileReviewUseCases({
    profileUseCases,
    readCanonicalFactPresence
  });

  return {
    taxApplicabilityProfileRepository: repository,
    taxApplicabilityProfileUseCases: profileUseCases,
    taxApplicabilityProfileReviewUseCases: reviewUseCases,
    createTaxApplicabilityProfileRouter: routerDependencies => createTaxApplicabilityProfileRouter({
      ...routerDependencies,
      reviewUseCases,
      resolveContext: dependencies.resolveAnnualContext
    })
  };
}
