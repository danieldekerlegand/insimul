/**
 * Create Indexes for Export Performance
 * 
 * This script creates the necessary indexes to optimize the export queries.
 * Run this once to improve export performance.
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createIndexes() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Create indexes for Rules collection
    console.log('\n📋 Creating indexes for Rules collection...');
    await db.collection('rules').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on worldId');
    await db.collection('rules').createIndex({ isBase: 1, worldId: 1 });
    console.log('  ✓ Created compound index on isBase, worldId');
    
    // Create indexes for Actions collection
    console.log('\n⚡ Creating indexes for Actions collection...');
    await db.collection('actions').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on worldId');
    await db.collection('actions').createIndex({ isBase: 1, worldId: 1 });
    console.log('  ✓ Created compound index on isBase, worldId');
    
    // Create indexes for other frequently queried collections
    console.log('\n🌍 Creating indexes for world-related collections...');
    await db.collection('settlements').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on settlements.worldId');
    
    await db.collection('countries').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on countries.worldId');
    
    await db.collection('states').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on states.worldId');
    
    await db.collection('states').createIndex({ countryId: 1 });
    console.log('  ✓ Created index on states.countryId');
    
    await db.collection('characters').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on characters.worldId');
    
    await db.collection('quests').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on quests.worldId');
    
    await db.collection('grammars').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on grammars.worldId');
    
    await db.collection('truths').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on truths.worldId');
    
    await db.collection('worldlanguages').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on worldlanguages.worldId');
    
    await db.collection('visualassets').createIndex({ worldId: 1 });
    console.log('  ✓ Created index on visualassets.worldId');
    
    console.log('\n✅ All indexes created successfully!');
    console.log('\n📊 Export performance should now be significantly improved.');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
createIndexes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
