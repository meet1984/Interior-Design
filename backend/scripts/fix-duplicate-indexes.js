/**
 * FIX SCRIPT: Clean up duplicate Sequelize indexes
 *
 * Run this ONLY when you hit the MySQL "Too many keys" error (ER_TOO_MANY_KEYS).
 * This happens when sequelize.sync({ alter:true }) is run too many times on a table
 * that already has unique indexes.
 *
 * Usage: node scripts/fix-duplicate-indexes.js
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDuplicateIndexes() {
  const dbName = process.env.DB_NAME || 'designer_db';
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: dbName
    });

    const [rows] = await conn.query(
      `SELECT TABLE_NAME, INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = '${dbName}' AND INDEX_NAME != 'PRIMARY'`
    );

    for (const row of rows) {
      if (row.INDEX_NAME.match(/_\d+$/) || ['slug', 'name', 'email', 'key', 'filename'].includes(row.INDEX_NAME)) {
        console.log(`Dropping index ${row.INDEX_NAME} from ${row.TABLE_NAME}`);
        try {
          await conn.query(`ALTER TABLE \`${row.TABLE_NAME}\` DROP INDEX \`${row.INDEX_NAME}\``);
        } catch (e) {
          console.error(`  Failed to drop ${row.INDEX_NAME}:`, e.message);
        }
      }
    }

    console.log('Done cleaning duplicate indexes');
    await conn.end();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fixDuplicateIndexes();
