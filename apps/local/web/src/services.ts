import { api } from './api';
import {
  createFeeReceiptService as createFeeReceiptServicePackage,
  createMortgageService as createMortgageServicePackage,
  createScenarioService as createScenarioServicePackage,
  createSourceService as createSourceServicePackage,
  createExecutionLogService as createExecutionLogServicePackage,
  createSettingsService as createSettingsServicePackage
} from '@personal-tax-ledger/frontend-application';

export function createFeeReceiptService(client = api) {
  return createFeeReceiptServicePackage(client);
}

export function createMortgageService(client = api) {
  return createMortgageServicePackage(client);
}

export function createScenarioService(client = api) {
  return createScenarioServicePackage(client);
}

export function createSourceService(client = api) {
  return createSourceServicePackage(client);
}

export function createExecutionLogService(client = api) {
  return createExecutionLogServicePackage(client);
}

export function createSettingsService(client = api) {
  return createSettingsServicePackage(client);
}

export const feeReceiptService = createFeeReceiptServicePackage(api);
export const mortgageService = createMortgageServicePackage(api);
export const scenarioService = createScenarioServicePackage(api);
export const sourceService = createSourceServicePackage(api);
export const executionLogService = createExecutionLogServicePackage(api);
export const settingsService = createSettingsServicePackage(api);
