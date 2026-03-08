/**
 * Observability logger — writes structured request logs to Firestore.
 * Used by the admin Observability page to display errors, latency, and event counts.
 *
 * Usage from frontend API client:
 *   import { logApiCall } from '@/lib/observability';
 *   logApiCall({ route, status_code, latency_ms, ... });
 */

import { apiLogsCol, metricsCol, addDoc, Timestamp } from './firebaseConfig';

function generateRequestId() {
    return 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/**
 * Log a structured API call to Firestore (fire-and-forget).
 */
export async function logApiCall({
    route,
    method = 'POST',
    status_code,
    latency_ms,
    school_id = null,
    user_id = null,
    anon_id = null,
    error_code = null,
    error_message = null,
    request_id = null,
}) {
    try {
        const entry = {
            request_id: request_id || generateRequestId(),
            timestamp: Timestamp.now(),
            route,
            method,
            status_code,
            latency_ms: Math.round(latency_ms),
            school_id,
            user_id,
            anon_id,
            error_code,
            error_message,
            env: import.meta.env.MODE || 'development',
        };

        // Fire-and-forget — don't await in the caller
        addDoc(apiLogsCol, entry).catch(err => {
            console.warn('[observability] Failed to write api_log:', err.message);
        });
    } catch {
        // Never let logging break the app
    }
}

/**
 * Log a metric data point to Firestore.
 */
export async function logMetric({
    name,
    value,
    route = null,
    school_id = null,
    tags = {},
}) {
    try {
        addDoc(metricsCol, {
            name,
            value,
            route,
            school_id,
            tags,
            timestamp: Timestamp.now(),
            env: import.meta.env.MODE || 'development',
        }).catch(err => {
            console.warn('[observability] Failed to write metric:', err.message);
        });
    } catch {
        // Never let metrics break the app
    }
}

/**
 * Wraps an async API call with automatic latency tracking and error logging.
 * Returns the result of the wrapped function.
 *
 * Usage:
 *   const data = await withApiLogging('feedCreate', user, async () => {
 *     return await apiFetch('feedCreate', { method: 'POST', body: ... });
 *   });
 */
export async function withApiLogging(route, user, fn) {
    const start = performance.now();
    const request_id = generateRequestId();
    try {
        const result = await fn();
        const latency_ms = performance.now() - start;
        logApiCall({
            route,
            status_code: 200,
            latency_ms,
            school_id: user?.school_id || user?.school || null,
            user_id: user?.id || null,
            anon_id: user?.anon_id || null,
            request_id,
        });
        logMetric({ name: 'api_latency_ms', value: latency_ms, route });
        return result;
    } catch (err) {
        const latency_ms = performance.now() - start;
        logApiCall({
            route,
            status_code: err.status || 500,
            latency_ms,
            school_id: user?.school_id || user?.school || null,
            user_id: user?.id || null,
            error_code: err.code || 'UNKNOWN',
            error_message: err.message || 'Unknown error',
            request_id,
        });
        logMetric({ name: 'api_error', value: 1, route });
        throw err;
    }
}
