export const FEE_RECEIPT_REPOSITORY_METHODS = Object.freeze(['list', 'get', 'create', 'update', 'remove', 'duplicate']);

export function assertFeeReceiptRepositoryContract(repository) {
  for (const method of FEE_RECEIPT_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new TypeError(`El repositorio de boletas requiere ${method}()`);
  }
  return repository;
}
