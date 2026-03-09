interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store — works fine for single-process dev/staging
// For production with multiple workers, replace with Redis
const store = new Map<string, RateLimitEntry>();

/**
 * Returns a 429 Response if the given key has exceeded `limit` calls
 * within `windowMs` milliseconds. Returns null if the request is allowed.
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Response | null {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return null;
    }

    if (entry.count >= limit) {
        return Response.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
                },
            }
        );
    }

    entry.count++;
    return null;
}

/**
 * Get a namespaced rate-limit key so different endpoints don't collide.
 */
export function rateLimitKey(namespace: string, identifier: string): string {
    return `${namespace}:${identifier}`;
}
