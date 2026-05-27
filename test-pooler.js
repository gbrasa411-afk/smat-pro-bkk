const postgres = require('postgres');

const projectRef = 'czlvffrymigalybaxumq';
const password = 'T3d1b3@r!@#';
const encPass = encodeURIComponent(password);

async function test(host, port, user) {
  const connStr = `postgresql://${user}:${encPass}@${host}:${port}/postgres`;
  console.log(`Testing connection: postgresql://${user}:****@${host}:${port}/postgres`);
  const sql = postgres(connStr, { prepare: false, connect_timeout: 4, idle_timeout: 1 });
  try {
    await sql`SELECT 1`;
    console.log(`  🎉 SUCCESS!`);
    await sql.end();
    return true;
  } catch (err) {
    await sql.end();
    console.log(`  ❌ FAILED: ${err.message}`);
    return false;
  }
}

async function run() {
  const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
  await test(host, 6543, `postgres.${projectRef}`);
  await test(host, 5432, `postgres.${projectRef}`);
  await test(host, 6543, 'postgres');
  await test(host, 5432, 'postgres');
  process.exit(0);
}

run();
