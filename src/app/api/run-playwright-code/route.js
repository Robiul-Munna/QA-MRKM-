import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "No code provided." }, { status: 400 });

  // Save code to a temp file
  const tempFile = path.join("/tmp", `plain-test-${Date.now()}.spec.ts`);
  fs.writeFileSync(tempFile, code);

  // Run Playwright test
  return new Promise((resolve) => {
    exec(`npx playwright test ${tempFile} --project=chromium --reporter=line`, { timeout: 60000 }, (err, stdout, stderr) => {
      fs.unlinkSync(tempFile);
      if (err) {
        resolve(NextResponse.json({ error: stderr || err.message }));
      } else {
        resolve(NextResponse.json({ result: stdout }));
      }
    });
  });
}
