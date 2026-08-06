import assert from 'node:assert/strict';
import { assertWorkspaceContext } from './index.mjs';

export async function incomeSourceRepositoryContract(createRepository, createContext) {
  const context = createContext();
  assertWorkspaceContext(context);
  const repository = await createRepository();

  const isolatedYear = 1900 + Math.floor(Math.random() * 50);

  const initialList = await repository.list(context, isolatedYear);
  assert.ok(Array.isArray(initialList), 'list debe retornar un arreglo');
  assert.equal(initialList.length, 0, 'list en un año aislado debe iniciar vacío');

  const input = { name: 'Contract fixture', kind: 'SALARY', amount: 111, taxYear: isolatedYear };
  const created = await repository.create(context, input);
  assert.equal(created.name, input.name, 'create debe conservar el nombre');
  assert.equal(Number(created.amount), input.amount, 'create debe conservar el monto');
  assert.ok(created.id !== undefined && created.id !== null, 'create debe asignar un id');

  const fetched = await repository.get(context, created.id);
  assert.equal(fetched?.id, created.id, 'get debe devolver el registro creado');

  const listed = await repository.list(context, isolatedYear);
  assert.equal(listed.length, 1, 'list debe reflejar el registro creado');
  assert.ok(listed.some(item => Number(item.id) === Number(created.id)), 'list debe incluir el registro creado');

  const otherYear = isolatedYear + 1;
  const listedOtherYear = await repository.list(context, otherYear);
  assert.equal(listedOtherYear.length, 0, 'list debe filtrar por taxYear');

  const updated = await repository.update(context, created.id, { ...input, name: 'Contract fixture actualizado', amount: 222 });
  assert.ok(updated, 'update debe devolver el registro actualizado');
  assert.equal(updated.name, 'Contract fixture actualizado', 'update debe aplicar los cambios');
  assert.equal(Number(updated.amount), 222, 'update debe aplicar los cambios de monto');

  const fetchedAfterUpdate = await repository.get(context, created.id);
  assert.equal(fetchedAfterUpdate?.name, 'Contract fixture actualizado', 'get debe reflejar la actualización');

  const updatedMissing = await repository.update(context, -1, input);
  assert.equal(updatedMissing, null, 'update de un id inexistente debe devolver null');

  const removed = await repository.remove(context, created.id);
  assert.equal(removed, true, 'remove debe confirmar la eliminación');

  const fetchedAfterRemove = await repository.get(context, created.id);
  assert.equal(fetchedAfterRemove, null, 'get después de remove debe ser null');

  const listedAfterRemove = await repository.list(context, isolatedYear);
  assert.equal(listedAfterRemove.length, 0, 'list después de remove no debe incluir el registro');

  const removedAgain = await repository.remove(context, created.id);
  assert.equal(removedAgain, false, 'remove de un id ya eliminado debe devolver false');

  await assert.rejects(
    () => repository.list({ workspaceId: 'x' }, isolatedYear),
    /actorId/,
    'un WorkspaceContext inválido debe rechazar la promesa'
  );
}
