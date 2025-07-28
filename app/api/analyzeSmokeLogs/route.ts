import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { uid, idToken } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
    }

    // In development, route naar de Firebase Function
    const functionUrl = process.env.NODE_ENV === 'development' 
      ? 'https://analyzesmokelogs-37j3djypbq-uc.a.run.app'
      : 'https://analyzesmokelogs-37j3djypbq-uc.a.run.app'; // Deze URL kun je ook uit firebase.json halen

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Stuur zowel uid als idToken in de body, niet in de headers
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uid, idToken }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('Response text:', responseText.substring(0, 200));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return NextResponse.json(
        { error: "De functie retourneerde een ongeldig antwoord." }, 
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to Firebase Function:', error);
    return NextResponse.json(
      { error: "Er ging iets mis bij de analyse." }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
