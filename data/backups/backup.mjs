import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('MONGO_URL not found in .env');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(__dirname, timestamp);
fs.mkdirSync(outDir, { recursive: true });

console.log(`Connecting to MongoDB...`);
await mongoose.connect(MONGO_URL);

const db = mongoose.connection.db;
const collections = await db.listCollections().toArray();

console.log(`Found ${collections.length} collections. Backing up to ${outDir}/\n`);

for (const col of collections) {
  const name = col.name;
  const docs = await db.collection(name).find({}).toArray();
  const outFile = path.join(outDir, `${name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(docs, null, 2));
  console.log(`  ${name}: ${docs.length} documents`);
}

await mongoose.disconnect();
console.log(`\nBackup complete!`);
