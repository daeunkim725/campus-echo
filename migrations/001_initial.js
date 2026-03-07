import fs from 'fs';
import path from 'path';
import { createClient } from '@base44/sdk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appId = process.env.VITE_BASE44_APP_ID;
const token = process.env.JWT_SECRET;
const serviceToken = process.env.BASE44_SERVICE_TOKEN;
const serverUrl = process.env.VITE_BASE44_APP_BASE_URL;

if (!appId || !token || !serviceToken || !serverUrl) {
    console.error("Missing required environment variables. Please check your .env file.");
    process.exit(1);
}

const base44 = createClient({ appId, token, serviceToken, serverUrl });

export const name = "001_initial_migrated_flag";

export async function up() {
    console.log(`Running migration: ${name} (up)`);
    try {
        const posts = await base44.asServiceRole.entities.Post.filter({});
        let migratedCount = 0;

        for (const post of posts) {
            if (!post.hasOwnProperty('migrated')) {
                await base44.asServiceRole.entities.Post.update(post.id, { migrated: true });
                migratedCount++;
            }
        }

        console.log(`Successfully migrated ${migratedCount} posts.`);
        return true;
    } catch (e) {
        console.error(`Migration failed: ${e.message}`);
        return false;
    }
}

export async function down() {
    console.log(`Reverting migration: ${name} (down)`);
    try {
        const posts = await base44.asServiceRole.entities.Post.filter({ migrated: true });
        let revertedCount = 0;

        for (const post of posts) {
            await base44.asServiceRole.entities.Post.update(post.id, { migrated: false });
            revertedCount++;
        }

        console.log(`Successfully reverted ${revertedCount} posts.`);
        return true;
    } catch (e) {
        console.error(`Revert failed: ${e.message}`);
        return false;
    }
}

// Simple runner
if (process.argv[2] === "up") {
    up().then(() => process.exit(0));
} else if (process.argv[2] === "down") {
    down().then(() => process.exit(0));
} else {
    console.error("Usage: node migrations/001_initial.js [up|down]");
    process.exit(1);
}
