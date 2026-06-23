export type AuthSessionStore = {
  otpCooldownByPhone: Map<string, number>;
  usedVerificationTokenIds: Map<string, number>;
  revokedRefreshTokenIds: Map<string, number>;
};

export const createAuthSessionStore = (): AuthSessionStore => ({
  otpCooldownByPhone: new Map(),
  usedVerificationTokenIds: new Map(),
  revokedRefreshTokenIds: new Map(),
});

export const pruneExpiredEntries = (store: Map<string, number>, now: number) => {
  for (const [key, expiresAt] of store.entries()) {
    if (expiresAt <= now) {
      store.delete(key);
    }
  }
};
