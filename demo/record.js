/**
 * Agent Factory Demo Recorder
 *
 * Records a split-screen video: Factory animation (left) + Mock Telegram (right)
 * Connects to the real factory SSE stream to sync mock Telegram messages
 * with factory events. Triggers a real build, records everything, then
 * uses FFmpeg to speed up the output to ~45 seconds.
 *
 * Usage: node demo/record.js
 * Output: demo/factory-demo-fast.mp4
 */

const { chromium } = require('playwright');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const TOKEN = '0394108422d56aa17dedeb9dc2b99c18';
const FACTORY_API = 'https://api.georg.miami';
const DEMO_PATH = path.join(__dirname, 'demo.html');
const OUTPUT_DIR = __dirname;
const TARGET_SECS = 45;
const MAX_WAIT = 5 * 60 * 1000;

// ── SSE helper ───────────────────────────────────────────────────────────
function connectSSE(token) {
    return new Promise((resolve, reject) => {
        const url = `${FACTORY_API}/factory/api/stream?token=${token}`;
        const events = [];
        let buildComplete = false;

        const req = https.get(url, (res) => {
            let buf = '';
            res.on('data', (chunk) => {
                buf += chunk.toString();
                // SSE messages are separated by double newline
                const parts = buf.split('\n\n');
                buf = parts.pop(); // keep incomplete part
                for (const part of parts) {
                    const dataLine = part.split('\n').find(l => l.startsWith('data: '));
                    if (!dataLine) continue;
                    try {
                        const event = JSON.parse(dataLine.slice(6));
                        events.push(event);
                        if (event.type === 'connected') {
                            resolve({ req, events, isBuildComplete: () => buildComplete });
                        }
                        if (event.type === 'celebrate') buildComplete = true;
                    } catch (e) { /* skip malformed */ }
                }
            });
            res.on('error', reject);
        });
        req.on('error', reject);
        setTimeout(() => reject(new Error('SSE connect timeout')), 15000);
    });
}

// ── POST helper ──────────────────────────────────────────────────────────
function postChat(token, message) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ message });
        const url = new URL(`${FACTORY_API}/factory/api/chat?token=${token}`);
        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve(d));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── Main ─────────────────────────────────────────────────────────────────
(async () => {
    console.log('=== Agent Factory Demo Recording ===\n');

    // 1. Connect to SSE stream (before iframe, so we catch all events)
    console.log('[1/8] Connecting to factory SSE stream...');
    const sse = await connectSSE(TOKEN);
    console.log('  SSE connected.\n');

    // 2. Launch browser with video recording
    console.log('[2/8] Launching Chromium...');
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: { dir: OUTPUT_DIR, size: { width: 1920, height: 1080 } }
    });
    const page = await context.newPage();

    // 3. Load demo page
    console.log('[3/8] Loading demo page...');
    await page.goto(`file://${DEMO_PATH}`);
    await page.waitForTimeout(1000);

    // Load factory iframe (this creates a 2nd SSE connection — fine, both get events)
    await page.evaluate(() => window.loadFactory());
    console.log('  Waiting for factory iframe to load...');
    await page.waitForTimeout(5000);
    console.log('  Factory loaded.\n');

    // 4. Type user message with realistic animation
    console.log('[4/8] Typing user message...');
    const userMsg = 'Build me a Miami coffee shop landing page';
    for (let i = 1; i <= userMsg.length; i++) {
        await page.evaluate((t) => window.setInput(t), userMsg.slice(0, i));
        await page.waitForTimeout(30 + Math.random() * 30); // 30-60ms per char
    }
    await page.waitForTimeout(500);

    // Send the message
    await page.evaluate((t) => {
        window.addUserMsg(t);
        window.setInput('');
    }, userMsg);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.showTyping(true));

    // 5. Trigger real build via API
    console.log('[5/8] Triggering build...');
    await postChat(TOKEN, userMsg);
    console.log('  Build triggered.\n');

    // 6. Forward SSE events to mock Telegram in real-time
    console.log('[6/8] Recording build (this takes 2-4 minutes)...');
    let lastIdx = 0;
    const t0 = Date.now();

    while (!sse.isBuildComplete() && (Date.now() - t0) < MAX_WAIT) {
        // Process any new events
        while (lastIdx < sse.events.length) {
            const ev = sse.events[lastIdx++];

            // Show chat messages from agents (not from user, not super-long ones)
            if (ev.type === 'chat_message' && ev.agent !== 'user' && ev.message) {
                const msg = String(ev.message);
                if (msg.length < 500) {
                    await page.evaluate((m) => {
                        window.showTyping(false);
                        window.addBotMsg(m);
                    }, msg);
                    await page.waitForTimeout(600);
                    if (!sse.isBuildComplete()) {
                        await page.evaluate(() => window.showTyping(true));
                    }
                    console.log(`  [${ev.agent}] ${msg.slice(0, 80)}${msg.length > 80 ? '...' : ''}`);
                } else {
                    console.log(`  [${ev.agent}] (long message, ${msg.length} chars — skipped in chat)`);
                }
            }

            // Log agent status changes
            if (ev.type === 'agent_status') {
                console.log(`  [${ev.agent}] status: ${ev.status} ${ev.message || ''}`);
            }
        }

        if (!sse.isBuildComplete()) await page.waitForTimeout(500);
    }

    await page.evaluate(() => window.showTyping(false));
    const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`  Build ${sse.isBuildComplete() ? 'complete' : 'timed out'} (${elapsed}s).\n`);

    // 7. Navigate to the live site
    let liveUrl = null;
    for (const ev of sse.events) {
        if (ev.message) {
            const m = String(ev.message).match(/https?:\/\/[a-z0-9-]+\.georg\.miami/i);
            if (m) liveUrl = m[0];
        }
    }

    if (liveUrl) {
        console.log(`[7/8] Loading live site: ${liveUrl}`);
        await page.evaluate((u) => window.loadSite(u), liveUrl);
        await page.waitForTimeout(6000);
    } else {
        console.log('[7/8] No live URL found, waiting...');
        await page.waitForTimeout(3000);
    }

    // 8. Stop recording and post-process
    console.log('[8/8] Stopping recording...\n');
    sse.req.destroy();

    await page.close();
    await context.close();
    await browser.close();

    // Find the recorded webm
    const webms = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
    const latestWebm = webms.sort().pop();

    if (!latestWebm) {
        console.log('No video file found!');
        process.exit(1);
    }

    const webmPath = path.join(OUTPUT_DIR, latestWebm);
    const mp4Path = path.join(OUTPUT_DIR, 'factory-demo.mp4');
    const fastPath = path.join(OUTPUT_DIR, 'factory-demo-fast.mp4');

    try {
        // Get raw duration
        const dur = parseFloat(
            execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${webmPath}"`).toString().trim()
        );
        const speedFactor = Math.max(1, dur / TARGET_SECS);
        const pts = (1 / speedFactor).toFixed(4);

        console.log(`Raw video: ${dur.toFixed(0)}s`);
        console.log(`Speed factor: ${speedFactor.toFixed(1)}x → target ${TARGET_SECS}s\n`);

        // Convert to MP4
        console.log('Converting to MP4...');
        execSync(`ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 22 "${mp4Path}"`, { stdio: 'inherit' });

        // Create sped-up version
        console.log(`\nCreating ${speedFactor.toFixed(1)}x speed version...`);
        execSync(`ffmpeg -y -i "${mp4Path}" -filter:v "setpts=${pts}*PTS" "${fastPath}"`, { stdio: 'inherit' });

        // Cleanup
        fs.unlinkSync(webmPath);

        console.log(`\n=== Done! ===`);
        console.log(`Normal speed: ${mp4Path}`);
        console.log(`Fast version:  ${fastPath}`);

    } catch (e) {
        console.log('FFmpeg error, keeping raw .webm');
        const finalPath = path.join(OUTPUT_DIR, 'factory-demo.webm');
        if (webmPath !== finalPath) fs.renameSync(webmPath, finalPath);
        console.log(`Saved: ${finalPath}`);
    }
})();
