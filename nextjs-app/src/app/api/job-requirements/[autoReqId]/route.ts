import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ autoReqId: string }> }
) {
  try {
    const params = await props.params;
    const { autoReqId } = params;

    if (!autoReqId) {
      return NextResponse.json({ error: 'autoReqId is required' }, { status: 400 });
    }

    const deleteResult = await query('DELETE FROM pmo.br_data WHERE auto_req_id = $1 RETURNING auto_req_id', [autoReqId]);

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: `Job requirement with autoReqId ${autoReqId} not found` }, { status: 404 });
    }

    return NextResponse.json({
      message: `Job requirement BR ID ${autoReqId} deleted successfully.`,
      deletedBrId: autoReqId
    });
  } catch (error: any) {
    console.error('Error in job-requirements delete route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ autoReqId: string }> }
) {
  // Re-route to brdata endpoint
  const params = await props.params;
  const { autoReqId } = params;
  return NextResponse.redirect(new URL(`/api/brdata/${autoReqId}`, request.url));
}
