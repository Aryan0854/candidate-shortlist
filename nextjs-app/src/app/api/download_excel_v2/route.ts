import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const pythonServiceUrl = process.env.PYTHON_RESUME_API_URL || 'http://localhost:8001';
    
    // Read the incoming JSON body
    const body = await request.json();

    console.log(`Proxying download_excel_v2 request to Python service: ${pythonServiceUrl}/download_excel_v2`);

    const response = await fetch(`${pythonServiceUrl}/download_excel_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Python download excel error: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: `Python service failed: ${errorText}` }, { status: response.status });
    }

    const fileBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=resume_matches_v2.xlsx'
      }
    });
  } catch (error: any) {
    console.error('Error in proxy route /api/download_excel_v2:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
