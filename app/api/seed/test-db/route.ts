import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Mask the password in connection string for security
  let maskedUrl = 'not defined';
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      url.password = '****';
      maskedUrl = url.toString();
    } catch {
      maskedUrl = 'invalid url format (cannot parse)';
    }
  }

  try {
    // Attempt a simple query
    const start = Date.now();
    const result = await db.execute(sql`SELECT NOW()`);
    const duration = Date.now() - start;

    // Check if we can select from users table
    const userCount = await db.select().from(users).limit(1);

    return NextResponse.json({
      success: true,
      maskedUrl,
      durationMs: duration,
      result: result,
      hasUsers: userCount.length > 0,
      envKeys: Object.keys(process.env).filter(key => 
        key.includes('DB') || 
        key.includes('DATABASE') || 
        key.includes('AUTH') || 
        key.includes('SUPABASE')
      )
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      maskedUrl,
      error: error.message || String(error),
      stack: error.stack,
      envKeys: Object.keys(process.env).filter(key => 
        key.includes('DB') || 
        key.includes('DATABASE') || 
        key.includes('AUTH') || 
        key.includes('SUPABASE')
      )
    }, { status: 500 });
  }
}
