import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ documentId: string }> }
) {
  try {
    const params = await props.params;
    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json({ error: 'documentId parameter is required' }, { status: 400 });
    }

    const docIdNum = parseInt(documentId, 10);
    if (isNaN(docIdNum)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // Find document in DB
    const result = await query(
      'SELECT file_name, upload_location FROM pmo.candidate_profile_document WHERE candidate_profile_document_id = $1',
      [docIdNum]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { file_name, upload_location } = result.rows[0];

    // Download from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseServer.storage
      .from('candidate-resumes')
      .download(upload_location);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      return NextResponse.json({ error: `Failed to retrieve file from storage: ${downloadError?.message || 'Empty file'}` }, { status: 500 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file_name}"`
      }
    });

  } catch (error: any) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
