import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { requirements } = await req.json();
  if (!requirements) {
    return NextResponse.json({ error: 'No requirements provided.' }, { status: 400 });
  }
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set.' }, { status: 500 });
    }
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Analyze these requirements for QA: ${requirements}` }] }]
      })
    });
    const geminiData = await geminiRes.json();
    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis result.';
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: 'Gemini API error', details: String(e) }, { status: 500 });
  }
}
