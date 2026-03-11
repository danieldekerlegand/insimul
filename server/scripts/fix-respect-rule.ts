/**
 * Fix "Respect for the Old Families" rule - restore proper Insimul DSL content
 * Usage: npx tsx server/scripts/fix-respect-rule.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function fix() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';
  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db;
  if (!db) { console.log('No DB connection'); process.exit(1); }

  const rule = await db.collection('rules').findOne({ name: 'Respect for the Old Families' });
  if (!rule) { console.log('Rule not found'); process.exit(1); }

  const newContent = `rule respect_for_the_old_families {
  when (
    Character(?newcomer) and
    Character(?old_family_member) and
    is_member_of_old_family(?old_family_member) and
    is_newcomer(?newcomer) and
    interacts_with(?newcomer, ?old_family_member) and
    not(shows_deference(?newcomer, ?old_family_member))
  )
  then {
    decrease_social_standing(?newcomer, 10)
    trigger_gossip_event(?old_family_member, ?newcomer)
    assign_social_label(?newcomer, "disrespectful_outsider")
  }
  priority: 5
  likelihood: 1
  tags: ["social", "hierarchy", "etiquette"]
}`;

  await db.collection('rules').updateOne(
    { _id: rule._id },
    { $set: { content: newContent, sourceFormat: 'insimul' } }
  );

  console.log('Updated successfully. New content:');
  console.log(newContent);
  await mongoose.disconnect();
}

fix();
