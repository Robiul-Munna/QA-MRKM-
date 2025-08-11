import { NextResponse } from 'next/server';

// POST /api/analyze-requirements
export async function POST(req) {
  try {
    const { requirements } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
    }
    // Prompt Gemini to analyze requirements for ambiguity, risk, and coverage
    const prompt = `Analyze the following software requirements for:\n- Ambiguity or unclear statements\n- Missing information or assumptions\n- Potential risks\n- Test coverage gaps\n\nHighlight any issues and suggest improvements.\n\nRequirements:\n${requirements}`;
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro-latest:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${response.status} ${errorText}` }, { status: 500 });
    }
    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
