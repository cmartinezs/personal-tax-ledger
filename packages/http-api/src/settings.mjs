import { json as respond } from './http-errors.mjs';
import { readJsonBody } from './read-json-body.mjs';

export function createSettingsRouter({ useCases, context, readBody = readJsonBody, json = respond }) {
  return async function routeSettings({ req, res, path }) {
    if (path === '/api/settings' && req.method === 'PUT') {
      const body = await readBody(req);
      json(res, 200, await useCases.updateSettings(context, body));
      return true;
    }
    return false;
  };
}
