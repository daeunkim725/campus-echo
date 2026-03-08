/**
 * Observability data fetching — queries Firestore for the admin dashboard.
 */

import {
    db, apiLogsCol, metricsCol, auditLogsCol, dailyStatsCol,
    query, where, orderBy, limit, getDocs, addDoc, Timestamp, collection
} from './firebaseConfig';

/**
 * Fetch recent error logs (status >= 400).
 */
export async function fetchRecentErrors(maxResults = 50) {
    const q = query(
        apiLogsCol,
        where('status_code', '>=', 400),
        orderBy('status_code'),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch recent API logs (all statuses).
 */
export async function fetchRecentLogs(maxResults = 100) {
    const q = query(
        apiLogsCol,
        orderBy('timestamp', 'desc'),
        limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch recent audit log entries.
 */
export async function fetchAuditLogs(maxResults = 50) {
    const q = query(
        auditLogsCol,
        orderBy('timestamp', 'desc'),
        limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Compute latency stats by route from recent logs.
 */
export async function fetchLatencyByRoute(maxLogs = 500) {
    const q = query(
        apiLogsCol,
        orderBy('timestamp', 'desc'),
        limit(maxLogs)
    );
    const snap = await getDocs(q);
    const byRoute = {};

    snap.docs.forEach(d => {
        const data = d.data();
        if (!data.route || !data.latency_ms) return;
        if (!byRoute[data.route]) byRoute[data.route] = [];
        byRoute[data.route].push(data.latency_ms);
    });

    const stats = {};
    for (const [route, latencies] of Object.entries(byRoute)) {
        latencies.sort((a, b) => a - b);
        const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
        const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
        const avg = latencies.reduce((s, v) => s + v, 0) / latencies.length;
        stats[route] = { p50: Math.round(p50), p95: Math.round(p95), avg: Math.round(avg), count: latencies.length };
    }
    return stats;
}

/**
 * Count events by type for today (from api_logs).
 * Maps routes to event types:
 *   authSignup → signups, feedCreate → posts, marketCreateListing → listings,
 *   marketUpdateListing (with offer) → offers, reportCreate → reports
 */
export async function fetchTodayEventCounts() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const ts = Timestamp.fromDate(todayStart);

    const q = query(
        apiLogsCol,
        where('timestamp', '>=', ts),
        where('status_code', '<', 400),
        orderBy('timestamp', 'desc'),
        limit(1000)
    );
    const snap = await getDocs(q);

    const counts = { signups: 0, posts: 0, listings: 0, offers: 0, reports: 0 };
    const bySchool = {};

    snap.docs.forEach(d => {
        const data = d.data();
        const route = data.route || '';
        const school = data.school_id || 'unknown';

        if (!bySchool[school]) bySchool[school] = { signups: 0, posts: 0, listings: 0, offers: 0, reports: 0 };

        if (route.includes('Signup') || route.includes('signup')) {
            counts.signups++;
            bySchool[school].signups++;
        } else if (route.includes('feedCreate') || route.includes('feed_create')) {
            counts.posts++;
            bySchool[school].posts++;
        } else if (route.includes('marketCreate') || route.includes('market_create')) {
            counts.listings++;
            bySchool[school].listings++;
        } else if (route.includes('marketUpdate') || route.includes('market_update')) {
            counts.offers++;
            bySchool[school].offers++;
        } else if (route.includes('report') || route.includes('Report')) {
            counts.reports++;
            bySchool[school].reports++;
        }
    });

    return { totals: counts, bySchool };
}

/**
 * Fetch daily stats for the past N days.
 */
export async function fetchDailyStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const ts = Timestamp.fromDate(startDate);

    const q = query(
        dailyStatsCol,
        where('date', '>=', ts),
        orderBy('date', 'desc'),
        limit(days)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
