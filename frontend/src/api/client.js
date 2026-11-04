/**
 * Minimal JSON API client. `getBase` is called per request so the
 * backend URL can change at runtime from the Settings page.
 */
export function createApiClient(getBase) {
  return {
    async post(path, body) {
      const r = await fetch(`${getBase()}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('API ' + r.status);
      return r.json();
    },
    async get(path) {
      const r = await fetch(`${getBase()}${path}`);
      if (!r.ok) throw new Error('API ' + r.status);
      return r.json();
    },
  };
}
