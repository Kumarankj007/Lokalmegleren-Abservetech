/**
 * Keys that were already filled in from the server payload, so the client
 * components can skip their duplicate fetch on mount.
 */
const hydratedKeys = new Set<string>();

export const markHydrated = (key: string) => hydratedKeys.add(key);
export const isHydrated = (key: string) => hydratedKeys.has(key);
