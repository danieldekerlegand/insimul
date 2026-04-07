# Database Setup Guide

Insimul now uses MongoDB exclusively for all features, including Talk of the Town integration.

## 1. MongoDB (Default - Currently Configured)

The MongoDB setup is used for the main Insimul application and uses the `storage` proxy interface.

### Files:
- `server/mongo-startup.ts` - MongoDB server startup
- `server/database/mongo-init.ts` - MongoDB initialization and seeding
- `server/storage.ts` - Storage interface proxy
- `server/mongo-storage.ts` - MongoDB implementation

### To use MongoDB:
```bash
# Ensure MONGO_URL is set in .env
MONGO_URL=mongodb://localhost:27017/insimul

# Start the server (package.json is configured for MongoDB)
npm run dev

# Initialize and seed
npm run db:init
```

## 2. PostgreSQL (For Talk of the Town Features)

The PostgreSQL setup is required for the Talk of the Town integration features (managers, events, etc.).

### Files:
- `server/startup.ts` - PostgreSQL server startup
- `server/database/init.ts` - PostgreSQL initialization
- `server/db.ts` - Database connection for managers/events
- All files in `server/managers/` - Talk of the Town managers
- All files in `server/events/` - Talk of the Town events

### To use PostgreSQL:
```bash
# Set DATABASE_URL in .env
DATABASE_URL=postgresql://localhost:5432/insimul

# Update package.json scripts to use server/startup.ts instead of mongo-startup.ts
# Then start the server
npm run dev
```

## Important Notes:

1. **The Talk of the Town features (managers, events) require PostgreSQL** - They use Drizzle ORM and SQL queries that won't work with MongoDB.

2. **The main Insimul app currently uses MongoDB** - The package.json is configured to use `mongo-startup.ts`.

3. **Database Connection Files**:
   - MongoDB: Uses `storage` proxy (no direct db export)
   - PostgreSQL: Uses `server/db.ts` which exports the `db` connection

4. **Import Patterns**:
   - MongoDB files: `import { storage } from './storage'`
   - PostgreSQL files: `import { db } from '../db'`

## Choosing a Database

- **Use MongoDB if**: You want to use the existing Insimul features without Talk of the Town
- **Use PostgreSQL if**: You want to use the Talk of the Town integration features

## Migration Path

To switch from MongoDB to PostgreSQL:

1. Update `.env` with `DATABASE_URL`
2. Update `package.json` scripts:
   ```json
   "dev": "NODE_ENV=development tsx server/startup.ts",
   "build": "vite build && esbuild server/startup.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
   "start": "NODE_ENV=production node dist/startup.js"
   ```
3. Run migrations: `npm run db:push`
4. Initialize: `npm run db:init`

## Troubleshooting

### Error: "The requested module '../storage' does not provide an export named 'db'"
This means a file is trying to use PostgreSQL syntax with the MongoDB storage interface. Check that you're running the correct startup file for your database choice.

### Error: "Cannot connect to MongoDB"
Ensure MongoDB is running locally or check your `MONGO_URL` connection string.

### Error: "Cannot connect to PostgreSQL"
Ensure PostgreSQL is running and check your `DATABASE_URL` connection string.
