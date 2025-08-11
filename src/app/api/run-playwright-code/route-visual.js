import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const { code, testName } = await req.json();
  if (!code || !testName) return NextResponse.json({ error: "No code or testName provided." }, { status: 400 });

  // Save code to a temp file
  const tempFile = path.join("/tmp", `plain-test-${Date.now()}.spec.ts`);
  fs.writeFileSync(tempFile, code);

  // Directory for Playwright screenshots
  const screenshotDir = path.join("/tmp", `screenshots-${Date.now()}`);
  fs.mkdirSync(screenshotDir);

  // Run Playwright test with screenshot output
  return new Promise((resolve) => {
    exec(
      `npx playwright test ${tempFile} --project=chromium --reporter=line --output=${screenshotDir}`,
      { timeout: 60000 },
      async (err, stdout, stderr) => {
        let screenshotBase64 = null;
        let visualResult = null;
        let diff = null;
        // Find screenshot file if exists
        const files = fs.existsSync(screenshotDir) ? fs.readdirSync(screenshotDir) : [];
        const screenshotFile = files.find(f => f.endsWith('.png'));
        if (screenshotFile) {
          const imgPath = path.join(screenshotDir, screenshotFile);
          screenshotBase64 = fs.readFileSync(imgPath).toString('base64');
          // Use node-fetch for server-side fetch
          const fetch = (await import('node-fetch')).default;
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/visual-regression`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testName, screenshotBase64 })
          });
          const data = await res.json();
          visualResult = data.result;
          diff = data.diff;
        }
        fs.unlinkSync(tempFile);
        if (fs.existsSync(screenshotDir)) fs.rmSync(screenshotDir, { recursive: true, force: true });
        if (err) {
          resolve(NextResponse.json({ error: stderr || err.message, visualResult, diff }));
        } else {
          resolve(NextResponse.json({ result: stdout, visualResult, diff }));
        }
      }
    );
  });
}
