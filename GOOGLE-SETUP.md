# Google setup for georg.miami (15 minutes, one time)

These three are the things only you can do (they need your Google login). The on-page SEO is already done: JSON-LD schema, sitemap, AI-crawler access, and the contact form all shipped 2026-06-28. Once these three are live, Google has everything it needs to start ranking and showing you.

Where I plug in is marked **[I do this]**. Tell me when you hit those and I will finish them in seconds.

---

## 1. Google Search Console (proves you own the site + shows what people search)

This is how you finally see real Google data: what queries show your site, clicks, impressions, position. Right now we only have referer logs; this fills the gap.

1. Go to https://search.google.com/search-console
2. Click **Add property** and choose the **Domain** option (left box), enter `georg.miami`. Domain covers the apex AND every subdomain at once.
3. Google shows you a **TXT record** to add to your DNS. Copy it.
4. Add that TXT record at your domain registrar (where georg.miami DNS lives), type `TXT`, host `@`, value = the string Google gave you.
5. Back in Search Console, click **Verify**. (DNS can take a few minutes to propagate; if it fails, wait 10 minutes and click Verify again.)
6. Once verified, open **Sitemaps** in the left menu, enter `sitemap.xml`, click **Submit**. (The sitemap already lists the apex, roi, docs, and cascade.)

If the DNS option is a hassle, tell me. **[I do this]** I can instead deploy a Google HTML verification file to the site so you just paste the file name and click Verify (URL-prefix method, covers georg.miami only).

**[I do this]** After you verify, I wire a Search Console API pull into your sites dashboard so search queries/clicks/impressions show next to the referer data. That needs a service account you create in Google Cloud and grant read access; I will give you those 3 clicks when we get there.

---

## 2. Google Business Profile (the single biggest "Miami" lever)

This is what makes you show up when someone near Miami searches "AI automation consultant" or "AI consultant Miami." It is free and it is the highest-leverage item on this page.

1. Go to https://www.google.com/business and sign in.
2. **Business name:** `Georg Chimion - AI Automation` (use a hyphen, not an em dash).
3. **Primary category:** `Business management consultant`. **Additional categories:** add `Software company` and `Marketing consultant` if offered.
4. **Service area:** choose "I serve customers at their locations" and set **Miami, FL** (add Miami Beach, Coral Gables, Brickell if it lets you). You do not need to publish a street address.
5. **Phone + website:** your number, website `https://georg.miami`.
6. **Description** (paste this, it is em-dash free and on-brand):

   > Georg Chimion builds production AI automation for finance and regulated businesses in Miami. The work covers document processing, reconciliation, fraud and compliance systems, and multi-agent products built on Claude, running on real data. Engagements start with a free growth audit or a twenty minute call. Based in Miami, working with finance, banking, and operations teams.

7. **Photos:** add your headshot (the one on georg.miami) and 2 or 3 screenshots of live products (the dashboard, the ROI calculator, a flagship). Google ranks profiles with photos higher.
8. **Verification:** Google will verify by postcard, phone, or video depending on what it offers. Pick the fastest available and complete it.
9. After it is live, post one short update per month (Google rewards active profiles). I can draft those.

---

## 3. Booking: NOT doing cal.com

Decided against it (Georg's call, 2026-06-28). The contact form on georg.miami already lands every lead in Slack with their message, and the ROI calculator lands a lead with their savings estimate. A mailto fallback covers the rest. No booking tool, no events to manage.

---

## What's already done on my side (so you know the foundation is set)

- JSON-LD schema on georg.miami (Person + ProfessionalService + FAQ) so Google and AI search understand who you are, what you do, and that you are in Miami.
- sitemap.xml listing georg.miami + roi + docs + cascade, and robots.txt explicitly welcoming Google, ChatGPT, Perplexity, and Claude crawlers.
- A real contact form that lands leads in Slack #audit-requests with an on-page confirmation (replaced the old mailto).
- roi.georg.miami rebuilt as a live, light-themed ROI calculator that captures a lead together with the visitor's own savings estimate.
- The sites dashboard now shows where real visitors come from and your most-read pages, refreshed every 2 minutes.

Once 1, 2, and 3 above are done, the loop is closed: you can see who finds you, they can find you, and they can reach you.
