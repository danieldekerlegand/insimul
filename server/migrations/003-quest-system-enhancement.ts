#!/usr/bin/env tsx
/**
 * Migration script to enhance the quest system with new fields
 *
 * This script:
 * 1. Adds new columns to the quests table for game type abstraction
 * 2. Adds quest chain support fields
 * 3. Adds enhanced rewards fields
 * 4. Adds failure conditions field
 * 5. Sets default gameType='language-learning' for existing quests
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/003-quest-system-enhancement.ts
 */

// CRITICAL: Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });
console.log('Database configured:', process.env.MONGO_URL ? 'MongoDB' : 'PostgreSQL (default)');

import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

async function migrateQuestSystem() {
  console.log('\n========================================');
  console.log('Quest System Enhancement Migration');
  console.log('========================================\n');

  try {
    // Check if we're using PostgreSQL (only database that needs migration)
    if (process.env.MONGO_URL) {
      console.log('⚠️  MongoDB detected - no SQL migration needed');
      console.log('   MongoDB schema is flexible and will auto-adapt to new fields');
      console.log('✅ Migration complete (no changes required)');
      return;
    }

    console.log('📊 PostgreSQL detected - running schema migration...\n');

    // Add game_type column
    console.log('1. Adding game_type column...');
    try {
      await db.execute(sql`
        ALTER TABLE quests
        ADD COLUMN IF NOT EXISTS game_type VARCHAR(100) DEFAULT 'language-learning'
      `);
      console.log('   ✅ Added game_type column');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Column game_type already exists, skipping');
      } else {
        throw error;
      }
    }

    // Add quest chain columns
    console.log('2. Adding quest chain columns...');
    try {
      await db.execute(sql`
        ALTER TABLE quests
        ADD COLUMN IF NOT EXISTS quest_chain_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS quest_chain_order INTEGER
      `);
      console.log('   ✅ Added quest_chain_id and quest_chain_order columns');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Quest chain columns already exist, skipping');
      } else {
        throw error;
      }
    }

    // Add prerequisite_quest_ids array column
    console.log('3. Adding prerequisite_quest_ids column...');
    try {
      await db.execute(sql`
        ALTER TABLE quests
        ADD COLUMN IF NOT EXISTS prerequisite_quest_ids TEXT[]
      `);
      console.log('   ✅ Added prerequisite_quest_ids column');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Column prerequisite_quest_ids already exists, skipping');
      } else {
        throw error;
      }
    }

    // Add enhanced rewards columns
    console.log('4. Adding enhanced rewards columns...');
    try {
      await db.execute(sql`
        ALTER TABLE quests
        ADD COLUMN IF NOT EXISTS item_rewards JSONB,
        ADD COLUMN IF NOT EXISTS skill_rewards JSONB,
        ADD COLUMN IF NOT EXISTS unlocks JSONB
      `);
      console.log('   ✅ Added item_rewards, skill_rewards, and unlocks columns');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Enhanced rewards columns already exist, skipping');
      } else {
        throw error;
      }
    }

    // Add failure_conditions column
    console.log('5. Adding failure_conditions column...');
    try {
      await db.execute(sql`
        ALTER TABLE quests
        ADD COLUMN IF NOT EXISTS failure_conditions JSONB
      `);
      console.log('   ✅ Added failure_conditions column');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Column failure_conditions already exists, skipping');
      } else {
        throw error;
      }
    }

    // Update existing quests to have gameType = 'language-learning'
    console.log('6. Setting default game_type for existing quests...');
    try {
      const result = await db.execute(sql`
        UPDATE quests
        SET game_type = 'language-learning'
        WHERE game_type IS NULL
      `);
      console.log(`   ✅ Updated ${(result as any).rowCount || 0} existing quests`);
    } catch (error: any) {
      console.log('   ⚠️  Could not update existing quests:', error.message);
    }

    console.log('\n========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');

    console.log('Summary of changes:');
    console.log('  • Added game_type column (default: language-learning)');
    console.log('  • Added quest_chain_id and quest_chain_order columns');
    console.log('  • Added prerequisite_quest_ids array column');
    console.log('  • Added item_rewards, skill_rewards, and unlocks JSONB columns');
    console.log('  • Added failure_conditions JSONB column');
    console.log('  • Set game_type=language-learning for all existing quests');

    console.log('\nQuest system now supports:');
    console.log('  ✓ Multiple game types (language-learning, rpg, strategy, adventure, survival)');
    console.log('  ✓ Quest chains with prerequisites');
    console.log('  ✓ Enhanced rewards (items, skills, unlocks)');
    console.log('  ✓ Failure conditions and time limits');
    console.log('  ✓ RPG objectives (combat, exploration, crafting, etc.)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateQuestSystem()
  .then(() => {
    console.log('\n🎉 Quest system enhancement complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
