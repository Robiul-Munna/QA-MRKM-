// Approve a new baseline by replacing the old one with the latest screenshot
export async function PUT(req) {
  const { testName, screenshotBase64 } = await req.json();
  if (!testName || !screenshotBase64) return NextResponse.json({ error: "Missing data." }, { status: 400 });
  const baselineDir = path.join(process.cwd(), "visual-baselines");
  if (!fs.existsSync(baselineDir)) fs.mkdirSync(baselineDir);
  const baselinePath = path.join(baselineDir, `${testName}.png`);
  fs.writeFileSync(baselinePath, Buffer.from(screenshotBase64, 'base64'));
  return NextResponse.json({ result: "Baseline updated." });
}
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export async function POST(req) {
  const { testName, screenshotBase64 } = await req.json();
  if (!testName || !screenshotBase64) return NextResponse.json({ error: "Missing data." }, { status: 400 });

  const baselineDir = path.join(process.cwd(), "visual-baselines");
  if (!fs.existsSync(baselineDir)) fs.mkdirSync(baselineDir);
  const baselinePath = path.join(baselineDir, `${testName}.png`);
  const newImg = PNG.sync.read(Buffer.from(screenshotBase64, 'base64'));

  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, Buffer.from(screenshotBase64, 'base64'));
    return NextResponse.json({ result: "Baseline created.", diff: null });
  }

  const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
  const { width, height } = baselineImg;
  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(baselineImg.data, newImg.data, diff.data, width, height, { threshold: 0.1 });
  const diffBase64 = diff.pack().read().toString('base64');

  return NextResponse.json({
    result: numDiffPixels === 0 ? "No visual changes." : `Visual difference: ${numDiffPixels} pixels`,
    diff: diffBase64
  });
}
