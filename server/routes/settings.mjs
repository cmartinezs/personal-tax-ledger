export function createSettingsRouter({ useCases, context, readBody, json }) {
  return async function routeSettings({ req, res, path }) {
    if (path === '/api/settings' && req.method === 'PUT') {
      const body = await readBody(req);
      json(res, 200, await useCases.updateSettings(context, body));
      return true;
    }
    return false;
  };
}
