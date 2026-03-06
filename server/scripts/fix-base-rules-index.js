/**
 * Fix Base Rules Index
 * 
 * The index exists but isn't being used. Let's check why and fix it.
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixBaseRulesIndex() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const rulesCollection = db.collection('rules');
    
    // 1. Drop and recreate the index
    console.log('\n🔧 Fixing index...');
    try {
      await rulesCollection.dropIndex('isBase_1_worldId_1');
      console.log('  Dropped existing index');
    } catch (error) {
      console.log('  Index did not exist or could not be dropped');
    }
    
    // Create index with explicit options
    await rulesCollection.createIndex(
      { isBase: 1, worldId: 1 }, 
      { 
        name: 'isBase_worldId_compound',
        background: true,
        partialFilterExpression: { isBase: true }
      }
    );
    console.log('  Created new index with partial filter');
    
    // 2. Force statistics update
    await db.command({ collMod: 'rules' });
    console.log('  Updated collection statistics');
    
    // 3. Test query again
    console.log('\n⏱️  Testing query after index fix...');
    const explain = await rulesCollection
      .find({ isBase: true, worldId: null })
      .explain('executionStats');
      
    console.log(`  Query execution stats:`);
    console.log(`    - Execution time: ${explain.executionStats.executionTimeMillis}ms`);
    console.log(`    - Total docs examined: ${explain.executionStats.totalDocsExamined}`);
    console.log(`    - Docs returned: ${explain.executionStats.nReturned}`);
    console.log(`    - Index used: ${explain.executionStats.executionStages?.indexName || 'COLLSCAN'}`);
    
    // 4. Test with lean query and limit
    console.log('\n⚡ Testing lean query with limit...');
    const leanStart = Date.now();
    const leanDocs = await rulesCollection
      .find({ isBase: true, worldId: null })
      .project({ _id: 1, worldId: 1, isBase: 1, name: 1, ruleType: 1, category: 1 })
      .limit(10)
      .toArray();
    const leanElapsed = Date.now() - leanStart;
    console.log(`  Lean query (10 docs) completed in ${leanElapsed}ms`);
    
    // 5. Check if we can use a simpler query
    console.log('\n🔍 Testing alternative query patterns...');
    
    // Test just isBase: true
    const explain2 = await rulesCollection
      .find({ isBase: true })
      .limit(10)
      .explain('executionStats');
    console.log(`  Query { isBase: true }: uses index ${explain2.executionStats.executionStages?.indexName || 'COLLSCAN'}`);
    
    // Test worldId: null
    const explain3 = await rulesCollection
      .find({ worldId: null })
      .limit(10)
      .explain('executionStats');
    console.log(`  Query { worldId: null }: uses index ${explain3.executionStats.executionStages?.indexName || 'COLLSCAN'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
fixBaseRulesIndex()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
