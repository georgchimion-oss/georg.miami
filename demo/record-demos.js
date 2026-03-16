/**
 * Product Demo Recorder
 *
 * Records short Playwright videos for each product on georg.miami.
 * Each demo is ~10-15 seconds of real interactions, then FFmpeg converts
 * WebM → MP4 (h264, no audio, small file).
 *
 * Usage:
 *   node demo/record-demos.js           # record all products
 *   node demo/record-demos.js penny     # record single product
 *
 * Prerequisites:
 *   - Playwright installed (npm install)
 *   - FFmpeg installed (brew install ffmpeg)
 *   - For Doc AI: `python3 -m http.server 8081` from ai-doc-demo/
 *   - ReconX: `npm run dev` in reconx/ (usually port 5173)
 *
 * Output: videos/*.mp4 (committed to git, deployed to GitHub Pages)
 */

const { chromium } = require('playwright');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'videos');
const TMP_DIR = path.join(__dirname, 'tmp');

// ── Product URLs ────────────────────────────────────────────────
const PRODUCTS = {
    penny:   { url: 'https://askpenny.georg.miami', name: 'askpenny' },
    reconx:  { url: 'https://reconx.georg.miami',   name: 'reconx' },
    venue:   { url: 'https://venue.georg.miami',     name: 'venue' },
    docai:   { url: null, /* served locally */       name: 'docai',  localPort: 8081 },
    factory: { url: null, /* copy existing mp4 */    name: 'factory' },
};

// ── Shared recording wrapper ────────────────────────────────────
async function recordProduct(name, url, interactionFn) {
    console.log(`\n  Recording ${name}...`);

    // Clean tmp dir
    if (fs.existsSync(TMP_DIR)) fs.rmSync(TMP_DIR, { recursive: true });
    fs.mkdirSync(TMP_DIR, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        recordVideo: { dir: TMP_DIR, size: { width: 1280, height: 800 } },
        // Disable animations for crisper recordings
        reducedMotion: 'no-preference',
    });
    const page = await context.newPage();

    try {
        // Navigate and wait for full load
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500); // Let CSS transitions finish

        // Run product-specific interactions
        await interactionFn(page);

        // Brief pause at the end
        await page.waitForTimeout(1000);
    } catch (err) {
        console.log(`    Warning: interaction error (${err.message}), saving partial recording`);
    }

    // Stop recording
    await page.close();
    await context.close();
    await browser.close();

    // Find the recorded WebM
    const webms = fs.readdirSync(TMP_DIR).filter(f => f.endsWith('.webm'));
    if (webms.length === 0) {
        console.log(`    No video file found for ${name}!`);
        return null;
    }

    const webmPath = path.join(TMP_DIR, webms[0]);
    const mp4Path = path.join(OUTPUT_DIR, `${name}.mp4`);

    // FFmpeg: WebM → MP4 (h264, small file, no audio)
    try {
        execSync(
            `ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 28 -an "${mp4Path}"`,
            { stdio: 'pipe' }
        );
        const size = (fs.statSync(mp4Path).size / 1024 / 1024).toFixed(2);
        console.log(`    Saved: ${mp4Path} (${size} MB)`);
    } catch (err) {
        console.log(`    FFmpeg error, keeping raw WebM`);
        const fallback = path.join(OUTPUT_DIR, `${name}.webm`);
        fs.copyFileSync(webmPath, fallback);
        console.log(`    Saved: ${fallback}`);
    }

    // Cleanup tmp
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
    return mp4Path;
}

// ── Ask Penny — Scroll-based showcase ───────────────────────────
async function demoPenny(page) {
    // Landing hero — pause for viewer to absorb
    await page.waitForTimeout(2000);

    // Scroll to the phone mockup area
    await page.evaluate(() => {
        const phone = document.querySelector('.phone-wrapper') || document.querySelector('.phone');
        if (phone) phone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(2500);

    // Scroll to features section
    await page.evaluate(() => {
        const features = document.querySelector('.section-title') ||
                         document.querySelector('.features-grid') ||
                         document.querySelector('[class*="feature"]');
        if (features) features.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(2500);

    // Scroll down more to show additional content
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);
}

// ── ReconX — Sidebar navigation clicks ──────────────────────────
async function demoReconX(page) {
    // Wait for React SPA to render
    await page.waitForSelector('.sidebar', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Dashboard is the default view — pause to show it
    await page.waitForTimeout(1500);

    // Click "Matching Engine" in sidebar
    const matchingLink = page.locator('.nav-link', { hasText: 'Matching Engine' });
    if (await matchingLink.count() > 0) {
        await matchingLink.click();
        await page.waitForTimeout(2500);
    }

    // Click "Balance Pools"
    const balanceLink = page.locator('.nav-link', { hasText: 'Balance Pools' });
    if (await balanceLink.count() > 0) {
        await balanceLink.click();
        await page.waitForTimeout(2500);
    }

    // Click "Exceptions"
    const exceptionsLink = page.locator('.nav-link', { hasText: 'Exceptions' });
    if (await exceptionsLink.count() > 0) {
        await exceptionsLink.click();
        await page.waitForTimeout(2000);
    }

    // Back to Dashboard
    const dashLink = page.locator('.nav-link', { hasText: 'Dashboard' });
    if (await dashLink.count() > 0) {
        await dashLink.click();
        await page.waitForTimeout(1500);
    }
}

// ── VENUE — Booking wizard flow ─────────────────────────────────
async function demoVenue(page) {
    // Landing screen (s0) — pause to show the landing
    await page.waitForTimeout(2000);

    // Click "Book My Event" or navigate to step 1
    // The VENUE site uses go('s1') to navigate between screens
    await page.evaluate(() => {
        if (typeof go === 'function') go('s1');
    });
    await page.waitForTimeout(2000);

    // Pick an event type — "Birthday Party"
    const birthdayCard = page.locator('.event-card', { hasText: 'Birthday' });
    if (await birthdayCard.count() > 0) {
        await birthdayCard.first().click();
        await page.waitForTimeout(1500);
    } else {
        // Try clicking by evaluating pickEvent directly
        await page.evaluate(() => {
            const cards = document.querySelectorAll('.event-card');
            if (cards.length > 0) cards[0].click();
        });
        await page.waitForTimeout(1500);
    }

    // Navigate to step 2 (details)
    await page.evaluate(() => {
        if (typeof go === 'function') go('s2');
    });
    await page.waitForTimeout(2000);

    // Interact with some options — click a space type if available
    const spaceCard = page.locator('.space-card').first();
    if (await spaceCard.count() > 0) {
        await spaceCard.click();
        await page.waitForTimeout(1000);
    }

    // Click a guest count up a few times
    await page.evaluate(() => {
        if (typeof chGuests === 'function') {
            chGuests(1); chGuests(1); chGuests(1);
        }
    });
    await page.waitForTimeout(1000);

    // Navigate to step 3 (budget/preferences)
    await page.evaluate(() => {
        if (typeof go === 'function') go('s3');
    });
    await page.waitForTimeout(2000);

    // Pick a budget tier
    const budgetCard = page.locator('.cat-card').first();
    if (await budgetCard.count() > 0) {
        await budgetCard.click();
        await page.waitForTimeout(1500);
    }

    // Go back to landing to show the full loop
    await page.evaluate(() => {
        if (typeof go === 'function') go('s0');
    });
    await page.waitForTimeout(1500);
}

// ── Doc AI — Tab switching showcase ─────────────────────────────
async function demoDocAI(page) {
    // Invoice tab is active by default — show it
    await page.waitForTimeout(2500);

    // Wait for processing animation to finish (if auto-starts)
    await page.waitForSelector('#json-output', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    // Click "Receipt" tab
    const receiptBtn = page.locator('.doc-btn', { hasText: 'Receipt' });
    if (await receiptBtn.count() > 0) {
        await receiptBtn.click();
        await page.waitForTimeout(3000); // Let processing animation run
    }

    // Click "Contract" tab
    const contractBtn = page.locator('.doc-btn', { hasText: 'Contract' });
    if (await contractBtn.count() > 0) {
        await contractBtn.click();
        await page.waitForTimeout(3000);
    }

    // Back to Invoice
    const invoiceBtn = page.locator('.doc-btn', { hasText: 'Invoice' });
    if (await invoiceBtn.count() > 0) {
        await invoiceBtn.click();
        await page.waitForTimeout(2000);
    }
}

// ── Main orchestrator ───────────────────────────────────────────
(async () => {
    console.log('=== Product Demo Recorder ===\n');

    // Ensure output dir exists
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Parse CLI args — optionally record a single product
    const target = process.argv[2]?.toLowerCase();
    const validTargets = Object.keys(PRODUCTS);

    if (target && !validTargets.includes(target)) {
        console.log(`Unknown product: ${target}`);
        console.log(`Valid options: ${validTargets.join(', ')}`);
        process.exit(1);
    }

    const toRecord = target ? [target] : validTargets;

    for (const key of toRecord) {
        const product = PRODUCTS[key];

        if (key === 'factory') {
            // Factory: copy existing demo video
            console.log(`\n  Factory: copying existing demo...`);
            const src = path.join(__dirname, 'factory-demo-fast.mp4');
            const dest = path.join(OUTPUT_DIR, 'factory.mp4');
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                const size = (fs.statSync(dest).size / 1024 / 1024).toFixed(2);
                console.log(`    Copied: ${dest} (${size} MB)`);
            } else {
                console.log(`    Warning: ${src} not found, skipping Factory`);
            }
            continue;
        }

        // Determine URL
        let url = product.url;
        if (!url && product.localPort) {
            url = `http://localhost:${product.localPort}`;
            console.log(`  Note: ${product.name} needs local server on port ${product.localPort}`);
        }

        if (!url) {
            console.log(`  Skipping ${key} — no URL configured`);
            continue;
        }

        // Pick the right interaction function
        const interactionFn = {
            penny: demoPenny,
            reconx: demoReconX,
            venue: demoVenue,
            docai: demoDocAI,
        }[key];

        await recordProduct(product.name, url, interactionFn);
    }

    // Summary
    console.log('\n=== Recording Complete ===');
    if (fs.existsSync(OUTPUT_DIR)) {
        const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.mp4'));
        console.log(`Videos in ${OUTPUT_DIR}:`);
        for (const f of files) {
            const size = (fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024 / 1024).toFixed(2);
            console.log(`  ${f} — ${size} MB`);
        }
    }
})();
