// Render og.html to ../og.jpg (1200x630) for link previews (WhatsApp, LinkedIn, Slack, X).
// usage: NODE_PATH=<playwright-core node_modules> node og.js <url of og.html> <out.jpg> [chromium executable]
const { chromium } = require('playwright-core');
(async () => {
  const [url, out, exe] = process.argv.slice(2);
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  const fonts = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
  await p.screenshot({ path: out, type: 'jpeg', quality: 88 });
  console.log('fonts loaded:', [...new Set(fonts)].join(', '));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
