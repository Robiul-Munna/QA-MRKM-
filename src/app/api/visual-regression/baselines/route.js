import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const baselineDir = path.join(process.cwd(), "visual-baselines");
  if (!fs.existsSync(baselineDir)) return NextResponse.json({ baselines: [] });
  const files = fs.readdirSync(baselineDir).filter(f => f.endsWith('.png'));
  const baselines = files.map(f => ({
    testName: f.replace(/\.png$/, ""),
    imageBase64: fs.readFileSync(path.join(baselineDir, f)).toString('base64'),
  }));
  return NextResponse.json({ baselines });
}

export async function DELETE(req) {
  const { testName } = await req.json();
  if (!testName) return NextResponse.json({ error: "No testName provided." }, { status: 400 });
  const baselineDir = path.join(process.cwd(), "visual-baselines");
  const baselinePath = path.join(baselineDir, `${testName}.png`);
  if (fs.existsSync(baselinePath)) {
    fs.unlinkSync(baselinePath);
    return NextResponse.json({ result: "Baseline deleted." });
  }
  return NextResponse.json({ error: "Baseline not found." }, { status: 404 });
}
