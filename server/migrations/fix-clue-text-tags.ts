#!/usr/bin/env tsx
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URL!);
  const db = mongoose.connection.db!;

  // Add chapter 5 tags to clue texts that could appear in ch5
  const clueDocs = [
    'Carnet mouillé — Notes de recherche',
    'Page de journal intime — "Ils savent"',
    'Carte marquée de croix rouges',
  ];

  for (const title of clueDocs) {
    const result = await db.collection('gametexts').updateOne(
      { title },
      { $addToSet: { tags: { $each: ['chapter:5', 'chapterId:ch5_the_truth_emerges'] } } }
    );
    console.log(`${title}: ${result.modifiedCount ? 'updated' : 'already has tags'}`);
  }

  // Also add chapter 3 and 5 tags to the first edition book (appears in multiple chapters)
  const firstEdition = await db.collection('gametexts').updateOne(
    { title: 'Première édition — Note au crayon' },
    { $addToSet: { tags: { $each: ['chapter:3', 'chapterId:ch3_the_inner_circle', 'chapter:5', 'chapterId:ch5_the_truth_emerges'] } } }
  );
  console.log(`Première édition: ${firstEdition.modifiedCount ? 'updated' : 'already has tags'}`);

  // Add chapter 1 and 3 to the bench carving (could appear in early chapters)
  const bench = await db.collection('gametexts').updateOne(
    { title: 'Message gravé sur un banc' },
    { $addToSet: { tags: { $each: ['chapter:1', 'chapterId:ch1_assignment_abroad', 'chapter:3', 'chapterId:ch3_the_inner_circle'] } } }
  );
  console.log(`Message gravé: ${bench.modifiedCount ? 'updated' : 'already has tags'}`);

  await mongoose.disconnect();
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
