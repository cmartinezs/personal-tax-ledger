export type SettingsService<C extends Record<string, any>> = {
    update(settings: Parameters<C['updateSettings']>[0]): Promise<Awaited<ReturnType<C['updateSettings']>>>;
};
export declare function createSettingsService<C extends Record<string, any>>(client: C): SettingsService<C>;
