import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const pythonServiceUrl = process.env.PYTHON_RESUME_API_URL || 'http://localhost:8001';
    
    // Read the incoming form data
    const formData = await request.formData();

    // Create a new FormData object to forward
    const forwardData = new FormData();
    for (const [key, value] of formData.entries()) {
      forwardData.append(key, value);
    }

    console.log(`Proxying search_resumes_v2 request to Python service: ${pythonServiceUrl}/search_resumes_v2`);

    const response = await fetch(`${pythonServiceUrl}/search_resumes_v2`, {
      method: 'POST',
      body: forwardData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Python resume service error: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: `Python resume service failed: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in proxy route /api/search_resumes_v2:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
