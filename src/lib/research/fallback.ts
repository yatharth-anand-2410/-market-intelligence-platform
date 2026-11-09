export const isRetryable = (e: unknown): boolean => {
  const s = (e as { status?: number })?.status;
  return s === 429 || s === 404 || s === 503;
};

/** Try each model in order; move on only for quota / unavailable / retired-model errors. */
export async function withFallback<T>(models: string[], fn: (model: string) => Promise<T>): Promise<T> {
  let last: unknown;
  for (const m of models) {
    try {
      return await fn(m);
    } catch (e) {
      last = e;
      if (!isRetryable(e)) throw e;
    }
  }
  throw last;
}
