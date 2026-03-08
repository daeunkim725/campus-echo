/**
 * Firebase configuration for observability infrastructure.
 * Uses Firestore for: api_logs, metrics, audit_logs, backups
 *
 * Environment: Set these in your .env file:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Collections ──────────────────────────────
export const apiLogsCol = collection(db, 'api_logs');
export const metricsCol = collection(db, 'metrics');
export const auditLogsCol = collection(db, 'audit_logs');
export const dailyStatsCol = collection(db, 'daily_stats');

export { db, Timestamp, addDoc, query, where, orderBy, limit, getDocs, collection };
export default app;
