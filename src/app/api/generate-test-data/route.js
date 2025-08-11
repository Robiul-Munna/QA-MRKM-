import { NextResponse } from 'next/server';

// POST /api/generate-test-data
export async function POST(req) {
  try {
    const { requirements, testCases, maskSensitive } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
    }
    // Prompt Gemini to generate and optionally mask test data
    let prompt = `Given the following requirements and test cases, generate a table of realistic test data. Include edge cases. Format as markdown table.\n`;
    if (maskSensitive) {
      prompt += `\nMask or anonymize any sensitive data (e.g., names, emails, phone numbers, addresses).`;
    }
    prompt += `\n\nRequirements:\n${requirements || ''}\n\nTest Cases:\n${testCases || ''}`;
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
    const testData = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ testData });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
