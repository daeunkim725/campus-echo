/**
 * apiClient.ts — Frontend shim that replaces base44Client.js
 *
 * All functions call the new Next.js API routes.
 * Swap your existing base44.* calls with these.
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include", // send httpOnly cookie
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "API error");
    }
    return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────

export const auth = {
    signup: (email: string, password: string, displayName?: string) =>
        apiFetch("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password, displayName }) }),

    login: (email: string, password: string) =>
        apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    me: () => apiFetch("/api/auth/me"),

    logout: () => apiFetch("/api/auth/logout", { method: "POST" }),

    sendCode: (school_email: string, school_code: string) =>
        apiFetch("/api/auth/send-code", { method: "POST", body: JSON.stringify({ school_email, school_code }) }),

    verifyCode: (verification_id: string, code: string) =>
        apiFetch("/api/auth/verify-code", { method: "POST", body: JSON.stringify({ verification_id, code }) }),
};

// ─── Onboarding ───────────────────────────────────────────────────────────

export const onboarding = {
    submitAge: (dob: string) =>
        apiFetch("/api/onboarding/age", { method: "POST", body: JSON.stringify({ dob }) }),
};

// ─── Feed ─────────────────────────────────────────────────────────────────

export const feed = {
    list: (params?: { sort?: string; page?: number; limit?: number; category?: string }) => {
        const qs = new URLSearchParams(params as Record<string, string>).toString();
        return apiFetch(`/api/feed${qs ? `?${qs}` : ""}`);
    },

    create: (body: {
        content?: string;
        category?: string;
        post_type?: string;
        poll_options?: string[];
        parent_post_id?: string;
        gif_url?: string;
    }) => apiFetch("/api/feed", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Posts ────────────────────────────────────────────────────────────────

export const posts = {
    get: (id: string) => apiFetch(`/api/posts/${id}`),
    delete: (id: string) => apiFetch(`/api/posts/${id}`, { method: "DELETE" }),
    listComments: (id: string) => apiFetch(`/api/posts/${id}/comments`),
    createComment: (id: string, content: string) =>
        apiFetch(`/api/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
};

// ─── Votes ────────────────────────────────────────────────────────────────

export const votes = {
    vote: (target_type: "post" | "comment", target_id: string, vote_value: 1 | -1 | 0) =>
        apiFetch("/api/votes", { method: "POST", body: JSON.stringify({ target_type, target_id, vote_value }) }),

    pollVote: (option_id: string) =>
        apiFetch("/api/polls/vote", { method: "POST", body: JSON.stringify({ option_id }) }),
};

// ─── Market ───────────────────────────────────────────────────────────────

export const market = {
    listListings: (params?: { page?: number; category?: string; condition?: string; status?: string }) => {
        const qs = new URLSearchParams(params as Record<string, string>).toString();
        return apiFetch(`/api/market/listings${qs ? `?${qs}` : ""}`);
    },

    createListing: (body: {
        title: string; description?: string; price?: number; is_free?: boolean;
        category: string; condition: string; pickup_location_tag?: string; images?: string[];
    }) => apiFetch("/api/market/listings", { method: "POST", body: JSON.stringify(body) }),

    getListing: (id: string) => apiFetch(`/api/market/listings/${id}`),
    updateListing: (id: string, body: Record<string, unknown>) =>
        apiFetch(`/api/market/listings/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    deleteListing: (id: string) => apiFetch(`/api/market/listings/${id}`, { method: "DELETE" }),

    getThreads: () => apiFetch("/api/market/threads"),
    createThread: (listing_id: string) =>
        apiFetch("/api/market/threads", { method: "POST", body: JSON.stringify({ listing_id }) }),

    getMessages: (thread_id: string) => apiFetch(`/api/market/threads/${thread_id}/messages`),
    sendMessage: (thread_id: string, content: string) =>
        apiFetch(`/api/market/threads/${thread_id}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
};

// ─── Reports ──────────────────────────────────────────────────────────────

export const reports = {
    create: (target_type: string, target_id: string, reason: string) =>
        apiFetch("/api/reports", { method: "POST", body: JSON.stringify({ target_type, target_id, reason }) }),
};

// ─── Leaderboard ─────────────────────────────────────────────────────────

export const leaderboard = {
    get: (school_id?: string, time_window?: string) => {
        const qs = new URLSearchParams({ ...(school_id ? { school_id } : {}), ...(time_window ? { time_window } : {}) }).toString();
        return apiFetch(`/api/leaderboard${qs ? `?${qs}` : ""}`);
    },
};
