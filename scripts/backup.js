import fs from 'fs';
import path from 'path';
import { createClient } from '@base44/sdk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace these with your actual environment variables for production scripts
const appId = process.env.VITE_BASE44_APP_ID;
const token = process.env.JWT_SECRET;
const serviceToken = process.env.BASE44_SERVICE_TOKEN;
const serverUrl = process.env.VITE_BASE44_APP_BASE_URL;

if (!appId || !token || !serviceToken || !serverUrl) {
    console.error("Missing required environment variables. Please check your .env file.");
    process.exit(1);
}

const base44 = createClient({ appId, token, serviceToken, serverUrl });

const ENTITIES_TO_BACKUP = ["User", "Post", "Comment", "Vote", "Report"];

async function runBackup() {
    console.log("Starting backup process...");
    const backupData = {};
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
        for (const entityName of ENTITIES_TO_BACKUP) {
            console.log(`Backing up entity: ${entityName}`);
            // Fetching all records without filters implies getting the whole collection
            const records = await base44.asServiceRole.entities[entityName].filter({});
            backupData[entityName] = records || [];
            console.log(`- Found ${backupData[entityName].length} records.`);
        }

        const backupsDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        const fileName = `backup-${timestamp}.json`;
        const filePath = path.join(backupsDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
        console.log(`Backup completed successfully! Saved to: ${filePath}`);

    } catch (error) {
        console.error("Backup failed:", error.message);
        process.exit(1);
    }
}

runBackup();
