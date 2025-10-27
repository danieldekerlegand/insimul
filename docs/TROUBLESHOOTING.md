# Troubleshooting Guide

## Country Creation Not Working

If you're experiencing issues creating countries through the Locations tab, follow these steps:

### 1. Verify Database Connection

Run the database verification script:
```bash
npm run db:verify
```

This will:
- Check MongoDB connection
- List existing collections
- Test CRUD operations for countries
- Attempt to create and delete a test country

### 2. Check Server Logs

Start the development server and watch for errors:
```bash
npm run dev
```

When you try to create a country, check the terminal for:
- `Country creation error:` messages
- Validation errors from Zod
- MongoDB connection errors

### 3. Verify MongoDB is Running

Make sure MongoDB is running locally:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Or start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or start MongoDB manually
mongod --dbpath /path/to/your/data
```

### 4. Check Environment Variables

Verify your `.env` file has the correct MongoDB URL:
```bash
MONGO_URL=mongodb://localhost:27017/insimul
```

### 5. Check Browser Console

Open the browser DevTools (F12) and check:
- **Network tab**: Look at the POST request to `/api/worlds/:worldId/countries`
  - Check the request payload
  - Check the response status code
  - Check the response body for error messages
- **Console tab**: Look for any JavaScript errors

### 6. Common Issues

#### Issue: "Cannot connect to MongoDB"
**Solution**: Ensure MongoDB is running locally on port 27017, or update `MONGO_URL` in `.env`

#### Issue: "Invalid country data" / Zod validation error
**Solution**: Check that all required fields are provided:
- `name` (required)
- `worldId` (automatically added from URL)
- Optional: `governmentType`, `economicSystem`, `foundedYear`, `description`

#### Issue: "Network error" / CORS error
**Solution**: Ensure the development server is running on the correct port and the API endpoint is accessible

#### Issue: "Collection not found"
**Solution**: MongoDB creates collections automatically on first insert. Run `npm run db:verify` to test.

### 7. Manual Testing via cURL

Test the API endpoint directly:

```bash
# Replace {worldId} with an actual world ID from your database
curl -X POST http://localhost:5000/api/worlds/{worldId}/countries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Kingdom",
    "description": "A test country",
    "governmentType": "monarchy",
    "economicSystem": "feudal",
    "foundedYear": 1200
  }'
```

Expected success response (201):
```json
{
  "id": "...",
  "worldId": "...",
  "name": "Test Kingdom",
  "governmentType": "monarchy",
  ...
}
```

### 8. Reset Database (Last Resort)

If all else fails, reset and re-initialize the database:
```bash
npm run db:reset
```

⚠️ **Warning**: This will delete all existing data!

### 9. Database Schema Notes

**Important**: Insimul uses MongoDB by default (not PostgreSQL). The schema defined in `shared/schema.ts` is for Drizzle/PostgreSQL and is primarily used for Talk of the Town features. The actual MongoDB schemas are defined in `server/mongo-storage.ts` using Mongoose.

Collections in MongoDB:
- `worlds` - Abstract universes
- `countries` - Nation-states within worlds
- `states` - Provinces/regions within countries
- `settlements` - Cities/towns/villages
- `characters` - NPCs and characters
- `rules` - Game rules
- `grammars` - Narrative templates

### 10. Get Help

If you're still experiencing issues:

1. **Check server logs** for the specific error message
2. **Run `npm run db:verify`** and share the output
3. **Check browser console** for error details
4. **Try manual cURL** test to isolate frontend vs backend issues

## Related Files

- **Frontend**: `/client/src/components/LocationsTab.tsx`
- **Backend Routes**: `/server/routes.ts`
- **Storage Layer**: `/server/mongo-storage.ts`
- **MongoDB Schemas**: `/server/mongo-storage.ts` (CountrySchema, StateSchema, SettlementSchema)
- **Verification Script**: `/server/verify-db.ts`
