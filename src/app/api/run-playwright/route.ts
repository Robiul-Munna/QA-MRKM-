import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url, steps } = await req.json();
  // Dynamically import Playwright only on the server
  const { chromium } = await import('playwright');
  let result = '';
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    // Example: run steps (future: parse and run real steps)
    result += `Visited ${url}\n`;
    // Add more automation logic here based on 'steps'
    await browser.close();
    result += 'Automation complete.';
  } catch (e: any) {
    result = 'Error: ' + e.message;
  }
  return NextResponse.json({ result });
}
