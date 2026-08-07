import { ApiValidationError } from './http-errors.mjs';

export async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new ApiValidationError('payload_too_large', 'Payload demasiado grande');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new ApiValidationError('invalid_json', 'El cuerpo no es JSON válido');
  }
}
