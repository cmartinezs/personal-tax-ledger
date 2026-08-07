export function createBootstrapFeatureService(client: typeof import('../../api').api) {
  return { bootstrap: client.bootstrap, listYears: client.listYears, updateSettings: client.updateSettings };
}
