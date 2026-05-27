import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    let email = '';
    let redirectPath = '/';

    // Support both request body and URL search params
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email || '';
      redirectPath = body.redirectPath || '/';
    } else {
      const { searchParams } = new URL(request.url);
      email = searchParams.get('email') || '';
      redirectPath = searchParams.get('redirectPath') || '/';
    }

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Save token to database
    await query(
      'INSERT INTO pmo.temp_login_tokens (email, token, expires_at, redirect_path) VALUES ($1, $2, $3, $4)',
      [email, token, expiresAt, redirectPath]
    );

    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/temp-login?token=${token}`;

    console.log(`Generated Magic Link for ${email}: ${magicLink}`);

    // Return the response matching what Spring Boot returns, plus the token and link
    return new NextResponse('Mail sent', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-Magic-Link': magicLink // Send link in header for easy automation/dev testing
      }
    });
  } catch (error: any) {
    console.error('Error creating temp URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
