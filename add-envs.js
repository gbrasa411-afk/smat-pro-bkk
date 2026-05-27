const { execSync } = require('child_process');

const envs = [
  { name: 'DATABASE_URL', env: 'production', value: 'postgresql://postgres:T3d1b3%40r%21%40%23@db.czlvffrymigalybaxumq.supabase.co:5432/postgres' },
  { name: 'DATABASE_URL', env: 'preview', value: 'postgresql://postgres:T3d1b3%40r%21%40%23@db.czlvffrymigalybaxumq.supabase.co:5432/postgres' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', env: 'production', value: 'https://czlvffrymigalybaxumq.supabase.co' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', env: 'preview', value: 'https://czlvffrymigalybaxumq.supabase.co' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', env: 'production', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bHZmZnJ5bWlnYWx5YmF4dW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njc1MjksImV4cCI6MjA5NTQ0MzUyOX0.3btFB3y_rzG4hKux6rR8_wWteIydgApAz3H2KhpwIpE' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', env: 'preview', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bHZmZnJ5bWlnYWx5YmF4dW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njc1MjksImV4cCI6MjA5NTQ0MzUyOX0.3btFB3y_rzG4hKux6rR8_wWteIydgApAz3H2KhpwIpE' },
  { name: 'NEXTAUTH_SECRET', env: 'production', value: 'smat_pro_secret_key_12345678' },
  { name: 'NEXTAUTH_SECRET', env: 'preview', value: 'smat_pro_secret_key_12345678' }
];

console.log('Starting to add environment variables to Vercel...');

envs.forEach((item, index) => {
  console.log(`[${index + 1}/${envs.length}] Adding ${item.name} to ${item.env}...`);
  try {
    const cmd = `npx vercel env add ${item.name} ${item.env} --value "${item.value}" --yes --force`;
    const output = execSync(cmd, { stdio: 'pipe' }).toString();
    console.log(`  Success: ${output.trim().split('\n')[0]}`);
  } catch (err) {
    console.error(`  Error adding ${item.name}:`, err.stderr ? err.stderr.toString() : err.message);
  }
});

console.log('All environment variables processed!');
