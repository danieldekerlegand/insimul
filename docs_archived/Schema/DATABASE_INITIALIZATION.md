# Database Initialization Guide

This guide explains how to initialize and seed the Insimul database with a sample Talk of the Town world.

## Overview

Insimul uses MongoDB for data storage and includes a complete initialization system that:
- Creates a sample town with 10 founding families
- Establishes businesses and occupations
- Sets up residential properties
- Seeds behavioral rules
- Configures the Talk of the Town integration

## Quick Start

### 1. First Time Setup

If you're starting with a fresh database:

```bash
# Initialize and seed the database
npm run db:init

# Or manually with the startup script
npm run dev -- --init --seed
```

This will:
- Connect to MongoDB (uses `MONGO_URL` environment variable or defaults to local)
- Create a sample world called "Smalltown, USA" circa 1950
- Generate 10 founding families (30-50 characters)
- Create 10 businesses with various occupations
- Set up residential properties
- Load behavioral rules for the Talk of the Town system

### 2. Reset and Re-seed

To completely reset the database and start fresh:

```bash
# Reset database and seed with sample data
npm run db:reset

# Or manually
npm run dev -- --reset --seed
```

### 3. Seed Only

To add a sample world to an existing database:

```bash
# Seed sample world without resetting
npm run db:seed

# Or manually
npm run dev -- --seed
```

## Environment Variables

Configure the following environment variables in your `.env` file:

```env
# MongoDB connection string (optional, defaults to local)
MONGO_URL=mongodb://localhost:27017/insimul

# Server port (optional, defaults to 3000)
PORT=3000

# Auto-initialize empty database (optional, defaults to true)
AUTO_INIT=true

# Auto-seed when initializing (optional, defaults to true)  
AUTO_SEED=true
```

## Starting the Server

### Development Mode

```bash
# Start with automatic initialization if needed
npm run dev

# Start without any initialization
AUTO_INIT=false npm run dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start in production
npm start
```

## API Endpoints

Once the server is running, you can manage the database via API:

### Check Server Health
```bash
GET http://localhost:3000/health
```

### Get Current World Info
```bash
GET http://localhost:3000/api/world
```

### List All Worlds
```bash
GET http://localhost:3000/api/worlds
```

### Initialize Database
```bash
POST http://localhost:3000/api/database/initialize
Content-Type: application/json

{
  "reset": false,
  "seed": true
}
```

### Reset Database
```bash
POST http://localhost:3000/api/database/reset
```

### Seed Sample World
```bash
POST http://localhost:3000/api/database/seed
```

### Switch Active World
```bash
POST http://localhost:3000/api/world/{worldId}/activate
```

### Get Characters
```bash
GET http://localhost:3000/api/characters
```

### Get Rules
```bash
GET http://localhost:3000/api/rules
```

## Sample World Structure

The seeded world includes:

### Founding Families (10 families)
- **Smith** - Runs the General Store
- **Johnson** - Owns Hardware Store
- **Williams** - Operates the Diner
- **Brown** - Runs Barbershop
- **Davis** - Medical Clinic
- **Miller** - Law Firm
- **Wilson** - Bank
- **Moore** - Construction Company
- **Taylor** - Tavern
- **Anderson** - Apartment Complex

### Town Layout
- **Downtown**: Main Street, Market Square (commercial)
- **Northside**: Oak Avenue, Elm Street (residential)
- **Southside**: Church Road, School Lane (mixed)
- **Industrial**: Mill Road (industrial)

### Character Attributes
Each character has:
- Full name and age
- Gender and family relationships
- Big Five personality traits
- Memory capacity
- Education status
- Birth year and location
- Current residence

### Business System
Each business includes:
- Business type and name
- Owner and employees
- Address and founding year
- Available occupations
- Job vacancies

### Behavioral Rules
The system loads Talk of the Town rules for:
- Employment and career progression
- Social interactions and relationships
- Business operations
- Life events (birth, marriage, retirement)
- Personality-driven behaviors
- Memory and cognition

## Troubleshooting

### MongoDB Connection Issues

If you see connection errors:
1. Ensure MongoDB is running locally or
2. Check your `MONGO_URL` environment variable
3. Verify network connectivity to remote MongoDB

### Empty Database After Init

If the database appears empty:
1. Check the console for error messages
2. Verify AUTO_SEED is not set to false
3. Manually run `npm run db:seed`

### Port Already in Use

If port 3000 is occupied:
1. Change the port: `PORT=3001 npm run dev`
2. Or kill the process using port 3000

## Advanced Usage

### Custom Initialization

Create your own initialization script:

```javascript
import { MongoDatabaseInitializer } from './server/database/mongo-init';

const initializer = new MongoDatabaseInitializer();

// Custom initialization
await initializer.initialize({
  reset: false,  // Don't reset existing data
  seed: true     // Add sample world
});
```

### Programmatic World Creation

```javascript
import { storage } from './server/storage';

// Create a custom world
const world = await storage.createWorld({
  name: 'My Custom Town',
  description: 'A procedurally generated world',
  currentYear: 1900,
  population: 0
});

// Add characters
const character = await storage.createCharacter({
  worldId: world.id,
  firstName: 'Jane',
  lastName: 'Doe',
  age: 25,
  gender: 'female',
  isAlive: true
});
```

## Next Steps

After initialization:

1. **Explore the API**: Use the endpoints to query and modify the world
2. **Run Simulations**: Execute the behavioral rules to see emergent stories
3. **Add Custom Rules**: Create your own behavioral rules
4. **Extend the World**: Add more characters, businesses, and locations
5. **Generate Narratives**: Use the grammar system for story generation

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify environment variables are correctly set
3. Ensure MongoDB is accessible
4. Review the Talk of the Town documentation in `/docs`
