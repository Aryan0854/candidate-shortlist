import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('Invalid link', { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }

    const result = await query(
      'SELECT email, expires_at, redirect_path FROM pmo.temp_login_tokens WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return new NextResponse('Invalid link', { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }

    const tokenData = result.rows[0];
    const expiresAt = new Date(tokenData.expires_at).getTime();
    const now = Date.now();

    if (expiresAt < now) {
      return new NextResponse('Link expired', { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }

    // Return session data
    return NextResponse.json({
      email: tokenData.email,
      redirectPath: tokenData.redirect_path
    });
  } catch (error: any) {
    console.error('Error during temp login validation:', error);
    return new NextResponse('Server Error', { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
}
