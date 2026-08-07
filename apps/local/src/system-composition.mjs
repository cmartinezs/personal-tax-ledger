import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createSystemUseCases } from '@personal-tax-ledger/application';
import { createSimulationRouter, createSystemRouter } from '@personal-tax-ledger/http-api';
import { simulatePortfolio, compareApv, buildScenarios } from '@personal-tax-ledger/core';
import { computeArticle55BisBenefit, computeFeeReceiptAmounts } from '@personal-tax-ledger/core';
import { defaultSettings } from '@personal-tax-ledger/core/defaults';

export function createSystemComposition(dependencies) {
  const useCases = createSystemUseCases({
    context: LOCAL_WORKSPACE_CONTEXT,
    settingsUseCases: dependencies.settingsUseCases,
    incomeUseCases: dependencies.incomeUseCases,
    referenceUseCases: dependencies.referenceUseCases,
    yearUseCases: dependencies.yearUseCases,
    taxParameterUseCases: dependencies.taxParameterUseCases,
    simulatePortfolio,
    compareApv,
    buildScenarios,
    computeArticle55BisBenefit,
    computeFeeReceiptAmounts,
    defaultSettings
  });
  return {
    systemUseCases: useCases,
    createSystemRouter: routerDependencies => createSystemRouter({ ...routerDependencies, useCases }),
    createSimulationRouter: routerDependencies => createSimulationRouter({ ...routerDependencies, useCases })
  };
}
