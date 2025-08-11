

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not set.');
      return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
    }
    // Gemini API expects a POST to https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json({ error: `Gemini API error: ${response.status}` }, { status: 500 });
    }
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
