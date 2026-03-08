import { describe, it, expect, beforeEach, vi } from 'vitest';

function createStorage() {
  const store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.stubGlobal('localStorage', createStorage());
    vi.stubGlobal('FormData', class FormDataMock {});
  });

  it('serializes params and JSON body correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { apiFetch } = await import('./apiClient.js');

    await apiFetch('feedCreate', {
      method: 'POST',
      params: { page: 2, limit: 20 },
      body: { content: 'hello' },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/functions/feedCreate?page=2&limit=20');
    expect(options.body).toBe(JSON.stringify({ content: 'hello' }));
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('does not crash on non-JSON error body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal server error',
    });
    vi.stubGlobal('fetch', fetchMock);

    const { apiFetch } = await import('./apiClient.js');

    await expect(apiFetch('authMe')).rejects.toMatchObject({
      status: 500,
      message: 'Internal server error',
    });
  });
});
