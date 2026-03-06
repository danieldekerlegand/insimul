/**
 * Create Single-Field Index for isBase
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function createIsBaseIndex() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const rulesCollection = db.collection('rules');
    
    // Create single-field index on isBase
    console.log('\n📋 Creating single-field index on isBase...');
    await rulesCollection.createIndex({ isBase: 1 }, { name: 'isBase_single' });
    console.log('  ✓ Created index on isBase');
    
    // Test the query
    console.log('\n⏱️  Testing query with new index...');
    const explain = await rulesCollection
      .find({ isBase: true })
      .limit(10)
      .explain('executionStats');
      
    console.log(`  Query execution stats:`);
    console.log(`    - Execution time: ${explain.executionStats.executionTimeMillis}ms`);
    console.log(`    - Total docs examined: ${explain.executionStats.totalDocsExamined}`);
    console.log(`    - Docs returned: ${explain.executionStats.nReturned}`);
    console.log(`    - Index used: ${explain.executionStats.executionStages?.indexName || 'COLLSCAN'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
createIsBaseIndex()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
