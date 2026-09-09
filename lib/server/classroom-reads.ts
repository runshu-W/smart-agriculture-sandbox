import "server-only";
// Share only currently running reads, never retain completed results. Authorization
// stays per request; the returned classroom data is filtered for each actor afterward.
const pending = new Map<string, Promise<unknown>>();
export function classroomRead<T>(key: string, read: () => PromiseLike<T>): Promise<T> {
  const active = pending.get(key);
  if (active) return active as Promise<T>;
  const promise = Promise.resolve(read()).finally(() => { if (pending.get(key) === promise) pending.delete(key); });
  pending.set(key, promise);
  return promise;
}
