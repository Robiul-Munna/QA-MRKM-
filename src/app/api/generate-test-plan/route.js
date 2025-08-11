import { NextResponse } from 'next/server';

// POST /api/generate-test-plan
export async function POST(req) {
  try {
    const { requirements } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
    }
    // Prompt Gemini to generate a test plan from requirements
    const prompt = `Given the following software requirements, generate a concise test plan including: test strategy, scope, objectives, resource needs, schedule, and deliverables.\n\nRequirements:\n${requirements}`;
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
    const testPlan = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ testPlan });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
