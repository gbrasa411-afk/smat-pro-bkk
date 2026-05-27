const postgres = require('postgres');

async function test() {
  console.log(`Testing direct IPv6 connection using object options...`);
  const sql = postgres({
    host: '2406:da14:25a:5801:19e2:2aa6:3ad6:6cfd',
    port: 5432,
    username: 'postgres',
    password: 'T3d1b3@r!@#',
    database: 'postgres',
    prepare: false,
    connect_timeout: 5,
    idle_timeout: 1
  });
  try {
    await sql`SELECT 1`;
    console.log(`🎉 SUCCESS connecting to IPv6!`);
    await sql.end();
    process.exit(0);
  } catch (err) {
    await sql.end();
    console.log(`❌ FAILED. Error: ${err.message}`);
    process.exit(1);
  }
}

test();
