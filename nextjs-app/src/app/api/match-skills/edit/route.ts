import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const pythonServiceUrl = process.env.PYTHON_AI_API_URL || 'http://localhost:8000';
    
    // Read the incoming form data
    const formData = await request.formData();

    // Create a new FormData object to forward
    const forwardData = new FormData();
    for (const [key, value] of formData.entries()) {
      forwardData.append(key, value);
    }

    console.log(`Proxying match-skills/edit request to Python service: ${pythonServiceUrl}/match-skills/edit`);

    const response = await fetch(`${pythonServiceUrl}/match-skills/edit`, {
      method: 'POST',
      body: forwardData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Python service error: ${response.status} - ${errorText}`);
      return NextResponse.json({ error: `Python service failed: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in proxy route /api/match-skills/edit:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
