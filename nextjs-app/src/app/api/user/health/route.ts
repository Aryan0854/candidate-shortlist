import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('Healthy', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
