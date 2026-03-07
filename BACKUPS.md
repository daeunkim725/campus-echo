# Database Backups & Restore

This document explains the backup and restore procedures for our Base44 App.
Since the Base44 database is handled via an SDK that acts as an ORM, our backups process involves exporting collections to a local JSON file.

## Backing Up Data

The backup script connects to the application using service role credentials and retrieves all records for confirmed entities (`User`, `Post`, `Comment`, `Vote`, `Report`).

### Running the Backup

1. Navigate to the root directory.
2. Provide your actual environment variables (e.g., `VITE_BASE44_APP_ID`, `JWT_SECRET`, `BASE44_SERVICE_TOKEN`, `VITE_BASE44_APP_BASE_URL`).
3. Run the backup script using Node.js:

```bash
node scripts/backup.js
```

This will generate a JSON file in the `backups/` directory (e.g., `backups/backup-2023-10-27T10-00-00-000Z.json`). This process should be automated via a cron job on your server to run daily.

## Restoring Data

The restore script reads a previously generated JSON backup file and attempts to re-create the missing records in the database.

> **Warning:** This will re-insert records. Existing records with conflicting IDs may be ignored or cause errors depending on the Base44 backend behavior.

### Running the Restore

1. Navigate to the root directory.
2. Make sure your environment variables are set.
3. Pass the path to your backup JSON file as an argument:

```bash
node scripts/restore.js backups/backup-2023-10-27T10-00-00-000Z.json
```

The script will iterate over all saved entities and report the success/failure counts.
