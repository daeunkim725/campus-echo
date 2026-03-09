/**
 * Data export script: pulls all entities from Base44 and writes them to /tmp/base44-export/
 *
 * Usage: BASE44_APP_ID=xxx BASE44_TOKEN=xxx npx tsx scripts/export-base44.ts
 */
import * as fs from "fs";
import * as path from "path";

const APP_ID = process.env.BASE44_APP_ID ?? process.env.VITE_BASE44_APP_ID;
const TOKEN = process.env.BASE44_TOKEN;
const BASE_URL = `https://api.base44.app/api/apps/${APP_ID}`;

if (!APP_ID || !TOKEN) {
    console.error("Set BASE44_APP_ID and BASE44_TOKEN env vars");
    process.exit(1);
}

const OUT_DIR = path.join(__dirname, "../tmp/base44-export");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ENTITIES = [
    "User",
    "Post",
    "Comment",
    "Vote",
    "PollVote",
    "MarketListing",
    "MarketThread",
    "MarketMessage",
    "EmailVerification",
    "Report",
    "Block",
];

async function fetchEntity(entity: string): Promise<unknown[]> {
    const results: unknown[] = [];
    let page = 1;
    while (true) {
        const res = await fetch(`${BASE_URL}/entities/${entity}?limit=100&page=${page}`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) {
            console.warn(`  ⚠ Could not fetch ${entity} page ${page}: ${res.status}`);
            break;
        }
        const data = (await res.json()) as unknown[];
        if (!Array.isArray(data) || data.length === 0) break;
        results.push(...data);
        if (data.length < 100) break;
        page++;
    }
    return results;
}

async function main() {
    for (const entity of ENTITIES) {
        process.stdout.write(`Exporting ${entity}... `);
        try {
            const records = await fetchEntity(entity);
            const outPath = path.join(OUT_DIR, `${entity}.json`);
            fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
            console.log(`✓ ${records.length} records → ${outPath}`);
        } catch (e) {
            console.log(`✗ failed: ${e}`);
        }
    }
    console.log("\nExport complete.");
}

main();
