/**
 * API client utility – wraps fetch calls to Cloud Functions
 * Attaches JWT token from localStorage and handles common patterns.
 */

const FUNCTIONS_BASE = "/api/functions";

function getToken() {
    return localStorage.getItem("campus_echo_token");
}

export function setToken(token) {
    localStorage.setItem("campus_echo_token", token);
}

export function clearToken() {
    localStorage.removeItem("campus_echo_token");
}

export function hasToken() {
    return !!getToken();
}

/**
 * Make an authenticated request to a Cloud Function.
 */
export async function apiFetch(functionName, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${FUNCTIONS_BASE}/${functionName}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

// ──────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────

export async function apiSignup(email, password, displayName) {
    const data = await apiFetch("authSignup", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
    });
    if (data.token) setToken(data.token);
    return data;
}

export async function apiLogin(email, password) {
    const data = await apiFetch("authLogin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
}

export async function apiLogout() {
    try {
        await apiFetch("authLogout", { method: "POST" });
    } finally {
        clearToken();
    }
}

export async function apiMe() {
    return await apiFetch("authMe", { method: "GET" });
}

// ──────────────────────────────────────────
// Verification API
// ──────────────────────────────────────────

export async function apiSendVerificationCode(schoolEmail, schoolCode) {
    return await apiFetch("verifySendCode", {
        method: "POST",
        body: JSON.stringify({ school_email: schoolEmail, school_code: schoolCode }),
    });
}

export async function apiVerifyCode(code, verificationId) {
    return await apiFetch("verifyCheckCode", {
        method: "POST",
        body: JSON.stringify({ code, verification_id: verificationId }),
    });
}

// ──────────────────────────────────────────
// Feed API
// ──────────────────────────────────────────

export async function apiFeedList(params = {}) {
    return await apiFetch("feedList", {
        method: "POST",
        body: JSON.stringify(params),
    });
}

export async function apiFeedCreate(postData) {
    return await apiFetch("feedCreate", {
        method: "POST",
        body: JSON.stringify(postData),
    });
}
