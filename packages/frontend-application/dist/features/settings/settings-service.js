export function createSettingsService(client) {
    return { update: settings => client.updateSettings(settings) };
}
