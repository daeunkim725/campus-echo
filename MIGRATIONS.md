# Schema Migrations

Base44 applications use NoSQL-style dynamic collections based on `@base44/sdk` access.
However, for structural predictability and adding backward-compatible changes to our Data Models, we employ simple Javascript migration scripts.

## Running Migrations

Migrations are stored in the `migrations/` folder. They contain two async functions:
- `up()`: Applies the schema/data change
- `down()`: Reverts the change

### Example: Running a Migration

```bash
node migrations/001_initial.js up
```

### Example: Reverting a Migration

```bash
node migrations/001_initial.js down
```

## Writing a New Migration

Create a new JavaScript file (e.g., `migrations/002_add_user_status.js`) following the pattern of `001_initial.js`.
Be sure to fetch records, iterate over them, and use `base44.asServiceRole.entities.[EntityName].update()` to apply changes to the objects. Always handle errors cleanly.
