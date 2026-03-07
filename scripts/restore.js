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

const ENTITIES_TO_RESTORE = ["User", "Post", "Comment", "Vote", "Report"];

async function runRestore() {
    const backupFileArg = process.argv[2];
    if (!backupFileArg) {
        console.error("Please provide the path to the backup JSON file as an argument.");
        console.error("Usage: node scripts/restore.js <path-to-backup.json>");
        process.exit(1);
    }

    const backupFilePath = path.resolve(process.cwd(), backupFileArg);
    if (!fs.existsSync(backupFilePath)) {
        console.error(`Backup file not found at path: ${backupFilePath}`);
        process.exit(1);
    }

    try {
        console.log(`Starting restore process from file: ${backupFilePath}`);
        const fileContent = fs.readFileSync(backupFilePath, 'utf-8');
        const backupData = JSON.parse(fileContent);

        for (const entityName of ENTITIES_TO_RESTORE) {
            console.log(`\nRestoring entity: ${entityName}`);
            const records = backupData[entityName];

            if (!records || records.length === 0) {
                console.log(`- No records found for ${entityName} in backup.`);
                continue;
            }

            console.log(`- Found ${records.length} records to restore.`);

            let successCount = 0;
            let errorCount = 0;

            for (const record of records) {
                try {
                    // Attempt to create. Depending on Base44 SDK, we may need to strip system fields (like ID)
                    // or use an upsert/update if the ID is preserved.
                    const { id, ...createData } = record;
                    await base44.asServiceRole.entities[entityName].create(createData);
                    successCount++;
                } catch (e) {
                    errorCount++;
                    console.error(`  - Failed to restore record for ${entityName}: ${e.message}`);
                }
            }

            console.log(`- Restore summary for ${entityName}: ${successCount} successful, ${errorCount} failed.`);
        }

        console.log("\nRestore process completed!");

    } catch (error) {
        console.error("Restore failed:", error.message);
        process.exit(1);
    }
}

runRestore();
