import test from 'node:test';
import assert from 'node:assert/strict';
import { incomeSourceRequest, incomeSourceResponse } from '@personal-tax-ledger/api-contracts';

test('los DTOs de ingresos conservan la forma serializada compartida', () => {
  const request = incomeSourceRequest({ name: ' Trabajo ', kind: 'SALARY', amount: '2000000', inputMode: 'GROSS', frequency: 'MONTHLY', months: 12, taxYear: 2026 });
  assert.deepEqual(JSON.parse(JSON.stringify(request)), {
    active: true,
    name: 'Trabajo',
    kind: 'SALARY',
    amount: 2_000_000,
    inputMode: 'GROSS',
    frequency: 'MONTHLY',
    months: 12,
    taxable: true,
    withholdingRate: 0,
    afpName: 'UNO',
    afpCommissionRate: null,
    healthSystem: 'FONASA',
    healthPlanAmount: 0,
    contractType: 'INDEFINITE',
    apvRegime: 'NONE',
    apvPaymentMethod: 'PAYROLL',
    apvMonthly: 0,
    notes: '',
    taxYear: 2026
  });
  const response = incomeSourceResponse({ ...request, id: '7' });
  assert.equal(response.id, 7);
  assert.equal(response.amount, 2_000_000);
});

test('el DTO de ingresos cubre AFP, salud, APV, retención y notas, no solo un subconjunto', () => {
  const request = incomeSourceRequest({
    name: 'Trabajo completo',
    kind: 'SALARY',
    amount: 1_500_000,
    taxYear: 2026,
    afpName: 'HABITAT',
    afpCommissionRate: '1.27',
    healthSystem: 'ISAPRE',
    healthPlanAmount: '80000',
    contractType: 'FIXED',
    apvRegime: 'B',
    apvPaymentMethod: 'DIRECT',
    apvMonthly: '150000',
    withholdingRate: '0.05',
    notes: 'Nota de prueba'
  });
  assert.equal(request.afpName, 'HABITAT');
  assert.equal(request.afpCommissionRate, 1.27);
  assert.equal(request.healthSystem, 'ISAPRE');
  assert.equal(request.healthPlanAmount, 80_000);
  assert.equal(request.contractType, 'FIXED');
  assert.equal(request.apvRegime, 'B');
  assert.equal(request.apvPaymentMethod, 'DIRECT');
  assert.equal(request.apvMonthly, 150_000);
  assert.equal(request.withholdingRate, 0.05);
  assert.equal(request.notes, 'Nota de prueba');

  const response = incomeSourceResponse({ ...request, id: 9 });
  assert.equal(response.afpCommissionRate, 1.27);
  assert.equal(response.healthPlanAmount, 80_000);
  assert.equal(response.apvMonthly, 150_000);
});
