import { NextRequest, NextResponse } from 'next/server';
import { deleteDocumentsLogic } from '@/lib/documents';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ empNo: string }> }
) {
  try {
    const params = await props.params;
    const { empNo } = params;

    if (!empNo) {
      return NextResponse.json({ error: 'empNo parameter is required' }, { status: 400 });
    }

    const result = await deleteDocumentsLogic(empNo);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error during document deletion:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
