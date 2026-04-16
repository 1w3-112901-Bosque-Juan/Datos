#!/usr/bin/env node
// Migrate user:{username} values in Redis from plaintext to bcrypt hashes
// Usage: node migrate-redis-bcrypt.js

const IORedis = require('ioredis');
const bcrypt = require('bcrypt');

const redis = new IORedis({ host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379 });
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');

(async function migrate() {
  console.log('Starting Redis user:* migration to bcrypt...');
  let cursor = '0';
  try {
    do {
      const res = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', 1000);
      cursor = res[0];
      const keys = res[1];
      for (const key of keys) {
        try {
          const val = await redis.get(key);
          if (!val) continue;
          if (/^\$2[aby]\$/.test(val)) {
            // already bcrypt
            continue;
          }
          const hashed = await bcrypt.hash(val, saltRounds);
          await redis.set(key, hashed);
          console.log(`Migrated ${key}`);
        } catch (err) {
          console.error(`Error migrating ${key}:`, err.message || err);
        }
      }
    } while (cursor !== '0');
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(2);
  }
})();
