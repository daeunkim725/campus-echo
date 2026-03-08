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
    const hasJsonContentType = !(options.headers && (options.headers["Content-Type"] || options.headers["content-type"]));
    const headers = {
        ...(hasJsonContentType ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const queryString = options.params
        ? `?${new URLSearchParams(
            Object.entries(options.params)
                .filter(([, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
        ).toString()}`
        : "";

    const shouldStringifyBody =
        options.body &&
        typeof options.body === "object" &&
        !(options.body instanceof FormData) &&
        headers["Content-Type"] === "application/json";

    const response = await fetch(`${FUNCTIONS_BASE}/${functionName}${queryString}`, {
        ...options,
        body: shouldStringifyBody ? JSON.stringify(options.body) : options.body,
        headers,
    });

    const responseText = await response.text();
    let data = {};
    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { error: responseText };
        }
    }

    if (!response.ok) {
        const error = new Error(data.error || `Request failed with status ${response.status}`);
        /** @type {any} */ (error).status = response.status;
        /** @type {any} */ (error).data = data;
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

export async function apiRegenerateHandle() {
    return await apiFetch("usersHandleRegenerate", { method: "POST" });
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

// ───────────────────────────────────────────────
// Feed API (Anonymous)
// ───────────────────────────────────────────────

export const apiFeedList = async (sort = 'new', page = 1, limit = 20) => {
    return apiFetch('feedList', {
        method: 'GET',
        params: { sort, page, limit }
    });
};

export const apiFeedCreate = async (content, category, post_type = 'text', poll_options = null) => {
    return apiFetch('feedCreate', {
        method: 'POST',
        body: { content, category, post_type, poll_options }
    });
};

export const apiFeedDelete = async (postId) => {
    return apiFetch('feedDelete', {
        method: 'DELETE',
        params: { id: postId }
    });
};

// ───────────────────────────────────────────────
// Comment API (Anonymous)
// ───────────────────────────────────────────────

export const apiCommentList = async (postId) => {
    return apiFetch('commentList', {
        method: 'GET',
        params: { post_id: postId }
    });
};

export const apiCommentCreate = async (postId, content) => {
    return apiFetch('commentCreate', {
        method: 'POST',
        body: { post_id: postId, content }
    });
};

export const apiCommentDelete = async (commentId) => {
    return apiFetch('commentDelete', {
        method: 'DELETE',
        params: { id: commentId }
    });
};

// ───────────────────────────────────────────────
// Vote & Report API
// ───────────────────────────────────────────────

export const apiVote = async (targetType, targetId, voteValue) => {
    return apiFetch('vote', {
        method: 'POST',
        body: { target_type: targetType, target_id: targetId, vote_value: voteValue }
    });
};

export const apiPollVote = async (postId, optionIndex) => {
    return apiFetch('pollVote', {
        method: 'POST',
        body: { post_id: postId, option_index: optionIndex }
    });
};

export const apiReportCreate = async (targetType, targetId, reason) => {
    return apiFetch('reportCreate', {
        method: 'POST',
        body: { target_type: targetType, target_id: targetId, reason }
    });
};

// ───────────────────────────────────────────────
// Market API (Anonymous)
// ───────────────────────────────────────────────

export const apiMarketList = async (category, isFree, includeSold, sort = 'newest', page = 1, limit = 20) => {
    const params = { sort, page, limit };
    if (category) params.category = category;
    if (isFree !== undefined && isFree !== null) params.is_free = isFree;
    if (includeSold !== undefined && includeSold !== null) params.include_sold = includeSold;

    return apiFetch('marketListListings', {
        method: 'GET',
        params
    });
};

export const apiMarketCreate = async (listingData) => {
    // listingData: { title, description, price, is_free, category, condition, pickup_location_tag, images }
    return apiFetch('marketCreateListing', {
        method: 'POST',
        body: listingData
    });
};

export const apiMarketUpdate = async (listingId, updateData) => {
    return apiFetch('marketUpdateListing', {
        method: 'PUT',
        body: { id: listingId, ...updateData }
    });
};

export const apiMarketDelete = async (listingId) => {
    return apiFetch('marketDeleteListing', {
        method: 'DELETE',
        params: { id: listingId }
    });
};


export const apiLeaderboard = async () => {
    return apiFetch('leaderboard', {
        method: 'GET'
    });
};
