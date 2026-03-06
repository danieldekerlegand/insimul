/**
 * Debug Base Rules Query
 * 
 * This script helps diagnose why getBaseRules is timing out
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugBaseRules() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const rulesCollection = db.collection('rules');
    
    // 1. Count total rules
    console.log('\n📊 Counting documents...');
    const totalRules = await rulesCollection.countDocuments();
    const baseRules = await rulesCollection.countDocuments({ isBase: true });
    const baseRulesNullWorld = await rulesCollection.countDocuments({ isBase: true, worldId: null });
    console.log(`  Total rules: ${totalRules}`);
    console.log(`  Rules with isBase: true: ${baseRules}`);
    console.log(`  Rules with isBase: true AND worldId: null: ${baseRulesNullWorld}`);
    
    // 2. Check indexes
    console.log('\n🔍 Checking indexes...');
    const indexes = await rulesCollection.indexInformation();
    console.log('  Indexes on rules collection:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`    - ${indexName}: ${JSON.stringify(indexes[indexName].key)}`);
    });
    
    // 3. Test query performance with explain
    console.log('\n⏱️  Testing query performance...');
    const explain = await rulesCollection.find({ isBase: true, worldId: null }).explain('executionStats');
    console.log(`  Query execution stats:`);
    console.log(`    - Execution time: ${explain.executionStats.executionTimeMillis}ms`);
    console.log(`    - Total docs examined: ${explain.executionStats.totalDocsExamined}`);
    console.log(`    - Docs returned: ${explain.executionStats.nReturned}`);
    console.log(`    - Index used: ${explain.executionStats.executionStages?.indexName || 'COLLSCAN'}`);
    
    // 4. Check for large documents
    console.log('\n📏 Checking document sizes...');
    const sample = await rulesCollection.find({ isBase: true, worldId: null }).limit(5).toArray();
    sample.forEach((rule, i) => {
      const size = JSON.stringify(rule).length;
      console.log(`  Rule ${i + 1} (${rule.name}): ${size} characters`);
      if (size > 10000) {
        console.log(`    - Large field sizes:`);
        Object.keys(rule).forEach(key => {
          const fieldSize = JSON.stringify(rule[key]).length;
          if (fieldSize > 1000) {
            console.log(`      ${key}: ${fieldSize} characters`);
          }
        });
      }
    });
    
    // 5. Test with lean query
    console.log('\n⚡ Testing lean query...');
    const leanStart = Date.now();
    const leanDocs = await rulesCollection
      .find({ isBase: true, worldId: null })
      .project({ _id: 1, worldId: 1, isBase: 1, content: 1, name: 1, sourceFormat: 1, 
                ruleType: 1, category: 1, priority: 1, likelihood: 1, 
                conditions: 1, effects: 1, tags: 1, dependencies: 1, 
                isActive: 1, description: 1, isCompiled: 1, compiledOutput: 1, 
                createdAt: 1, updatedAt: 1 })
      .toArray();
    const leanElapsed = Date.now() - leanStart;
    console.log(`  Lean query completed in ${leanElapsed}ms, returned ${leanDocs.length} documents`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
debugBaseRules()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
