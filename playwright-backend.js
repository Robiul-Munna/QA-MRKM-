const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowed = [
      'https://qa-mrkm.vercel.app',
      'https://ee8d561d868e.ngrok.io'
    ];
    if (allowed.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.post('/run-playwright', async (req, res) => {
  const { url, searchTerm, customSteps } = req.body;
  let result = '';
  let screenshotBase64 = null;
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // If custom steps provided, parse and execute them
    if (customSteps && customSteps.trim()) {
      const steps = customSteps.split('\n').map(s => s.trim()).filter(Boolean);
      let videoPath = null;
      for (const step of steps) {
        // GOTO
        if (step.startsWith('goto ')) {
          const gotoUrl = step.replace('goto ', '').trim();
          await page.goto(gotoUrl);
          result += `Visited ${gotoUrl}\n`;
        }
        // TYPE (fill input)
        else if (step.startsWith('type ')) {
          // type [selector] [text]
          const match = step.match(/^type\s+([^\s]+)\s+(.+)$/);
          if (match) {
            const selector = match[1];
            let text = match[2];
            // Dynamic data: type input[name=email] {{randomEmail}}
            if (text.includes('{{randomEmail}}')) {
              text = text.replace(/\{\{randomEmail\}\}/g, `user${Date.now()}@test.com`);
            }
            if (text.includes('{{randomString}}')) {
              text = text.replace(/\{\{randomString\}\}/g, Math.random().toString(36).substring(2, 10));
            }
            await page.fill(selector, text);
            result += `Typed '${text}' into ${selector}\n`;
          } else {
            result += `Invalid type step: ${step}\n`;
          }
        }
        // CLICK by selector
        else if (step.startsWith('click ')) {
          // click [selector]
          const selector = step.replace('click ', '').trim();
          await page.click(selector);
          result += `Clicked ${selector}\n`;
        }
        // CLICK by text
        else if (step.startsWith('click-text ')) {
          // click-text [button text]
          const text = step.replace('click-text ', '').trim();
          await page.click(`text=${text}`);
          result += `Clicked element with text '${text}'\n`;
        }
        // WAIT
        else if (step.startsWith('wait ')) {
          // wait [ms]
          const ms = parseInt(step.replace('wait ', '').trim(), 10);
          await page.waitForTimeout(ms);
          result += `Waited ${ms}ms\n`;
        }
        // SCREENSHOT
        else if (step === 'screenshot') {
          const buffer = await page.screenshot();
          screenshotBase64 = buffer.toString('base64');
          result += 'Screenshot taken.\n';
        }
        // VIDEO (start/stop)
        else if (step === 'start-video') {
          videoPath = `test-video-${Date.now()}.webm`;
          await page.context().tracing.start({ screenshots: true, snapshots: true });
          result += 'Video recording started.\n';
        }
        else if (step === 'stop-video') {
          if (videoPath) {
            await page.context().tracing.stop({ path: videoPath });
            result += `Video recording stopped. Saved to ${videoPath}\n`;
          } else {
            result += 'No video recording in progress.\n';
          }
        }
        // ASSERT PRESENCE
        else if (step.startsWith('assert-present ')) {
          // assert-present [selector or text]
          const arg = step.replace('assert-present ', '').trim();
          let found = false;
          if (arg.startsWith('text=')) {
            found = await page.isVisible(arg);
          } else if (arg.startsWith('selector=')) {
            found = await page.isVisible(arg.replace('selector=', ''));
          } else {
            // Try as selector, then as text
            found = await page.isVisible(arg).catch(() => false);
            if (!found) {
              found = await page.isVisible(`text=${arg}`).catch(() => false);
            }
          }
          if (found) {
            result += `Element '${arg}' is present.\n`;
          } else {
            result += `Element '${arg}' NOT present.\n`;
          }
        }
        // ASSERT ABSENCE
        else if (step.startsWith('assert-absent ')) {
          // assert-absent [selector or text]
          const arg = step.replace('assert-absent ', '').trim();
          let found = false;
          if (arg.startsWith('text=')) {
            found = await page.isVisible(arg);
          } else if (arg.startsWith('selector=')) {
            found = await page.isVisible(arg.replace('selector=', ''));
          } else {
            found = await page.isVisible(arg).catch(() => false);
            if (!found) {
              found = await page.isVisible(`text=${arg}`).catch(() => false);
            }
          }
          if (!found) {
            result += `Element '${arg}' is absent.\n`;
          } else {
            result += `Element '${arg}' IS present (should be absent).\n`;
          }
        }
        // CUSTOM STEP (for future extensibility)
        else if (step.startsWith('custom ')) {
          result += `Custom step: ${step.replace('custom ', '')}\n`;
        }
        else {
          result += `Unknown step: ${step}\n`;
        }
      }
    } else {
      // Default: just visit the URL and do search if provided
      await page.goto(url);
      result += `Visited ${url}\n`;
      if (searchTerm) {
        const searchBox = await page.$('input[type="search"], input[name*="search" i], input[placeholder*="search" i]');
        if (searchBox) {
          await searchBox.fill(searchTerm);
          const searchButton = await page.$('button[type="submit"], button, input[type="submit"]');
          if (searchButton) {
            await searchButton.click();
            result += `Searched for '${searchTerm}'.\n`;
          } else {
            result += 'Search button not found.\n';
          }
          await page.waitForTimeout(2000);
          const bodyText = await page.textContent('body');
          if (bodyText && bodyText.toLowerCase().includes(searchTerm.toLowerCase())) {
            result += `Search term '${searchTerm}' found in results.\n`;
          } else {
            result += `Search term '${searchTerm}' NOT found in results.\n`;
          }
        } else {
          result += 'Search box not found.\n';
        }
      }
    }

    await browser.close();
    result += 'Automation complete.';
  } catch (e) {
    result = 'Error: ' + (e instanceof Error ? e.message : 'Unknown error');
  }
  res.json({ result, screenshotBase64 });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Playwright backend running on http://localhost:${PORT}`);
});
