import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required');
}

const backup = JSON.parse(await readFile('cloud-source.json', 'utf8'));
if (!backup.collections || typeof backup.collections !== 'object') {
  throw new Error('cloud-source.json has an invalid collections structure');
}

await mongoose.connect(uri);

try {
  const database = mongoose.connection.db;
  for (const [name, records] of Object.entries(backup.collections)) {
    if (!Array.isArray(records)) {
      throw new Error(`Collection "${name}" must contain an array of records`);
    }
    const collection = database.collection(name);
    await collection.deleteMany({});
    if (records.length > 0) {
      await collection.insertMany(records);
    }
  }
  console.log(
    `Database restored from cloud-source.json (${Object.keys(backup.collections).length} collections)`,
  );
} finally {
  await mongoose.disconnect();
}
