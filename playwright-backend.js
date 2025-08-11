const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run-playwright', async (req, res) => {
  const { url } = req.body;
  let result = '';
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    result += `Visited ${url}\n`;
    // Add more automation steps here as needed
    await browser.close();
    result += 'Automation complete.';
  } catch (e) {
    result = 'Error: ' + (e instanceof Error ? e.message : 'Unknown error');
  }
  res.json({ result });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Playwright backend running on http://localhost:${PORT}`);
});
