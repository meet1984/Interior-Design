const mysql = require('mysql2/promise');
async function fix() {
  try {
    const conn = await mysql.createConnection({host: '127.0.0.1', user: 'root', password: 'root', database: 'designer_db'});
    const [rows] = await conn.query("SELECT TABLE_NAME, INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = 'designer_db' AND INDEX_NAME != 'PRIMARY'");
    for (const row of rows) {
      if (row.INDEX_NAME.match(/_\d+$/) || row.INDEX_NAME === 'slug' || row.INDEX_NAME === 'name' || row.INDEX_NAME.includes('slug') || row.INDEX_NAME.includes('name')) {
        console.log('Dropping index', row.INDEX_NAME, 'from', row.TABLE_NAME);
        try {
          await conn.query(`ALTER TABLE \`${row.TABLE_NAME}\` DROP INDEX \`${row.INDEX_NAME}\``);
        } catch (e) {
            console.error('Failed to drop', row.INDEX_NAME, e.message);
        }
      }
    }
    console.log('Done cleaning indexes');
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
fix();
