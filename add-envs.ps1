$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "Adding DATABASE_URL..."
npx vercel env add DATABASE_URL production --value "postgresql://postgres:T3d1b3%40r%21%40%23@db.czlvffrymigalybaxumq.supabase.co:5432/postgres" --yes --force
npx vercel env add DATABASE_URL preview --value "postgresql://postgres:T3d1b3%40r%21%40%23@db.czlvffrymigalybaxumq.supabase.co:5432/postgres" --yes --force

Write-Host "Adding NEXT_PUBLIC_SUPABASE_URL..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://czlvffrymigalybaxumq.supabase.co" --yes --force
npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview --value "https://czlvffrymigalybaxumq.supabase.co" --yes --force

Write-Host "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bHZmZnJ5bWlnYWx5YmF4dW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njc1MjksImV4cCI6MjA5NTQ0MzUyOX0.3btFB3y_rzG4hKux6rR8_wWteIydgApAz3H2KhpwIpE" --yes --force
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bHZmZnJ5bWlnYWx5YmF4dW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njc1MjksImV4cCI6MjA5NTQ0MzUyOX0.3btFB3y_rzG4hKux6rR8_wWteIydgApAz3H2KhpwIpE" --yes --force

Write-Host "Adding NEXTAUTH_SECRET..."
npx vercel env add NEXTAUTH_SECRET production --value "smat_pro_secret_key_12345678" --yes --force
npx vercel env add NEXTAUTH_SECRET preview --value "smat_pro_secret_key_12345678" --yes --force

Write-Host "Done!"
