import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required');
}

await mongoose.connect(uri);

try {
  const database = mongoose.connection.db;
  const collections = {};
  const collectionInfos = await database.listCollections().toArray();

  for (const collectionInfo of collectionInfos) {
    if (collectionInfo.name.startsWith('system.')) {
      continue;
    }
    collections[collectionInfo.name] = await database
      .collection(collectionInfo.name)
      .find({})
      .toArray();
  }

  await writeFile(
    'cloud-source.json',
    JSON.stringify(
      { exportedAt: new Date().toISOString(), collections },
      (_, value) => (value instanceof Buffer ? value.toString('base64') : value),
      2,
    ),
    'utf8',
  );
  console.log(
    `Database backup written to cloud-source.json (${Object.keys(collections).length} collections)`,
  );
} finally {
  await mongoose.disconnect();
}
