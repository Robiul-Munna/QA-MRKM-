import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not set.');
      return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 256,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return NextResponse.json({ error: `OpenAI API error: ${response.status}` }, { status: 500 });
    }
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response.';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
