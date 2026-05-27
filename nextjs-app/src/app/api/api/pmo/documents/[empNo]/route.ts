import { NextRequest, NextResponse } from 'next/server';
import { getDocumentsLogic } from '@/lib/documents';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ empNo: string }> }
) {
  try {
    const params = await props.params;
    const { empNo } = params;

    if (!empNo) {
      return NextResponse.json({ error: 'empNo parameter is required' }, { status: 400 });
    }

    const docs = await getDocumentsLogic(empNo);
    return NextResponse.json(docs);
  } catch (error: any) {
    console.error('Error listing candidate documents:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
