export function createSettingsFeatureService(client: typeof import('../../api').api) {
  return { update: client.updateSettings, listYears: client.listYears, bootstrap: client.bootstrap };
}
