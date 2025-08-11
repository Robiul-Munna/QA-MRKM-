const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
app.use(cors({
  origin: 'https://qa-mrkm.vercel.app'
}));
app.use(express.json());

app.post('/run-playwright', async (req, res) => {
  const { url, searchTerm } = req.body;
  let result = '';
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    result += `Visited ${url}\n`;

    if (searchTerm) {
      // Try to find a search box and button (generic selectors)
      const searchBox = await page.$('input[type="search"], input[name*="search" i], input[placeholder*="search" i]');
      if (searchBox) {
        await searchBox.fill(searchTerm);
        // Try to find a button to click
        const searchButton = await page.$('button[type="submit"], button, input[type="submit"]');
        if (searchButton) {
          await searchButton.click();
          result += `Searched for '${searchTerm}'.\n`;
        } else {
          result += 'Search button not found.\n';
        }
        // Wait for results to load
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
