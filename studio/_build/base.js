/* georg.miami/studio: functionality. Works without GSAP. Motion layers on top in motion.js. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 901px)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  };
  window.__studio = { reduced: reduced };

  /* ---------- video loading ---------- */
  /* Alpha video: WebKit (Safari, every iOS browser) only renders transparency from HEVC-alpha .mov,
     Chromium/Firefox only from VP9-alpha .webm. Chrome can decode HEVC but drops the alpha, so pick by engine, not canPlayType. */
  var webkitOnly = (function () {
    var ua = navigator.userAgent;
    var iOS = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return iOS || (/Safari\//.test(ua) && !/(Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS)\//.test(ua));
  })();
  function loadVideo(v) {
    if (!v || v.dataset.loaded) return;
    var base = v.dataset.src; if (!base) { v.dataset.loaded = '1'; return; }
    var list = v.dataset.alpha
      ? (webkitOnly ? [['mov', 'video/mp4; codecs="hvc1"']] : [['webm', 'video/webm']])
      : [['webm', 'video/webm'], ['mp4', 'video/mp4']];
    list.forEach(function (x) {
      var s = document.createElement('source');
      s.src = base + '.' + x[0] + (v.dataset.v ? '?v=' + v.dataset.v : ''); s.type = x[1]; v.appendChild(s);
    });
    v.dataset.loaded = '1';
    v.load();
  }
  function play(v) {
    if (!v || reduced) return;
    loadVideo(v);
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function pause(v) { if (v && !v.paused) v.pause(); }
  if (reduced) { $$('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); }); }
  var lazyVids = $$('video[data-src]').filter(function (v) { return !v.closest('.art'); });
  if ('IntersectionObserver' in window && !reduced) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) play(en.target); else pause(en.target); });
    }, { rootMargin: '120px 0px' });
    lazyVids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- nav: progress, dropdown, mobile menu ---------- */
  var fill = $('#progFill');
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      if (fill) fill.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var dd = $('.dd'), ddBtn = $('.dd-btn');
  function ddSet(open) { if (!dd) return; dd.classList.toggle('open', open); ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  if (dd) {
    ddBtn.addEventListener('click', function (e) { e.stopPropagation(); ddSet(!dd.classList.contains('open')); });
    dd.addEventListener('mouseenter', function () { if (desktop.matches) ddSet(true); });
    dd.addEventListener('mouseleave', function () { if (desktop.matches) ddSet(false); });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) ddSet(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ddSet(false); });
    $$('[data-goto-flag]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        ddSet(false);
        var i = +a.dataset.gotoFlag;
        if (window.__tabs && window.__tabs.flag) { e.preventDefault(); window.__tabs.flag.select(i, true); }
      });
    });
  }
  var burger = $('.burger'), mnav = $('#mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.hidden; mnav.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { mnav.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }); });
  }

  /* ---------- section indicator ---------- */
  var ind = $('.sec-ind'), indB = ind && $('b', ind), indS = ind && $('span', ind);
  var secs = $$('[data-sec]');
  var foot = $('.foot');
  if (ind && foot && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { ind.classList.toggle('away', es[0].isIntersecting); }).observe(foot);
  if (ind && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { indB.textContent = en.target.dataset.sec + ' / ' + String(secs.length).padStart(2, '0'); indS.textContent = en.target.dataset.name || ''; }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- hero carousel ---------- */
  (function () {
    var hero = $('.hero'); if (!hero) return;
    var slides = $$('.slide', hero), rails = $$('.rail-btn', hero), arts = $$('.art', hero);
    var pagerFill = $('#pagerFill'), pagerNo = $('#pagerNo'), toggle = $('#pagerToggle');
    var DUR = 7000, cur = 0, timer = null, running = false, started = 0, remaining = DUR, playing = !reduced, hovered = false;
    function vids(i) { return arts[i] ? $$('video', arts[i]) : []; }
    function show(i, user) {
      i = (i + slides.length) % slides.length;
      if (i === cur && !user) return;
      slides.forEach(function (s, k) {
        var on = k === i; s.classList.toggle('on', on);
        if (on) { s.removeAttribute('aria-hidden'); s.inert = false; } else { s.setAttribute('aria-hidden', 'true'); s.inert = true; }
      });
      rails.forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      arts.forEach(function (a, k) { a.classList.toggle('on', k === i); });
      vids(cur).forEach(pause);
      cur = i;
      vids(cur).forEach(play);
      var next = (cur + 1) % slides.length; vids(next).forEach(loadVideo);
      if (pagerNo) pagerNo.textContent = String(cur + 1).padStart(2, '0');
      document.dispatchEvent(new CustomEvent('slidechange', { detail: { i: cur, el: slides[cur], art: arts[cur] } }));
      restart();
    }
    function animateFill(ms) {
      if (!pagerFill) return;
      pagerFill.style.transition = 'none'; pagerFill.style.transform = 'scaleX(' + (1 - ms / DUR) + ')';
      void pagerFill.offsetWidth;
      if (playing && !hovered) { pagerFill.style.transition = 'transform ' + ms + 'ms linear'; pagerFill.style.transform = 'scaleX(1)'; }
    }
    function restart() { clearTimeout(timer); remaining = DUR; run(); }
    function run() {
      clearTimeout(timer); running = false;
      animateFill(remaining);
      if (!playing || hovered) return;
      started = Date.now(); running = true;
      timer = setTimeout(function () { running = false; show(cur + 1); }, remaining);
    }
    function hold() {
      if (!running) return;  /* only a live countdown has time to bank; repeated holds must not subtract twice */
      clearTimeout(timer); running = false;
      remaining = Math.max(400, remaining - (Date.now() - started));
      if (pagerFill) { var m = getComputedStyle(pagerFill).transform; pagerFill.style.transition = 'none'; pagerFill.style.transform = m === 'none' ? 'scaleX(0)' : m; }
    }
    rails.forEach(function (b, k) { b.addEventListener('click', function () { show(k, true); }); });
    hero.addEventListener('mouseenter', function () { hovered = true; hold(); });
    hero.addEventListener('mouseleave', function () { hovered = false; run(); });
    hero.addEventListener('focusin', function () { hovered = true; hold(); });
    hero.addEventListener('focusout', function (e) { if (!hero.contains(e.relatedTarget)) { hovered = false; run(); } });
    hero.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(cur + 1, true); if (e.key === 'ArrowLeft') show(cur - 1, true); });
    var x0 = null;
    hero.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    hero.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), true); });
    function setToggle() {
      if (!toggle) return;
      toggle.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
      toggle.innerHTML = playing ? '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>' : '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
    }
    /* pause: bank the countdown BEFORE flipping the flag, otherwise the pending timer still fires one more slide */
    if (toggle) toggle.addEventListener('click', function () { if (playing) { hold(); playing = false; } else { playing = true; run(); } setToggle(); });
    setToggle();
    slides.forEach(function (s, k) { if (k !== 0) s.inert = true; });
    if (playing) { vids(0).forEach(play); vids(1).forEach(loadVideo); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) hold(); else run(); });
    run();
  })();

  /* ---------- tabs ---------- */
  window.__tabs = {};
  [['flag', '#work'], ['seat', '#seat'], ['stack', '#stack']].forEach(function (g) {
    var root = $(g[1]); if (!root) return;
    var tabs = $$('[role=tab]', root), panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var cur = 0;
    function set(i, fromScroll) {
      i = Math.max(0, Math.min(tabs.length - 1, i));
      if (i === cur && panels[i].classList.contains('on')) { return; }
      tabs.forEach(function (t, k) { var on = k === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p, k) { p.classList.toggle('on', k === i); });
      cur = i;
      if (!fromScroll) { var t = tabs[i]; if (t.scrollIntoView && t.parentElement.scrollWidth > t.parentElement.clientWidth) t.parentElement.scrollTo({ left: t.offsetLeft - 20, behavior: reduced ? 'auto' : 'smooth' }); }
      document.dispatchEvent(new CustomEvent('tabchange', { detail: { group: g[0], i: i, panel: panels[i], fromScroll: !!fromScroll } }));
    }
    function select(i, scrollIntoSection) {
      if (window.__sceneGoto && window.__sceneGoto[g[0]] && desktop.matches) { window.__sceneGoto[g[0]](i); return; }
      set(i);
      if (scrollIntoSection) root.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
    tabs.forEach(function (t, k) {
      t.tabIndex = k === 0 ? 0 : -1;
      t.addEventListener('click', function () { select(k); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (cur + 1) % tabs.length;
        if (e.key === 'ArrowLeft') n = (cur - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n); tabs[n].focus(); }
      });
    });
    window.__tabs[g[0]] = { set: set, select: select, count: tabs.length, get: function () { return cur; } };
  });

  /* ---------- index filter ---------- */
  var chips = $$('.chip'), cards = $$('.pcard');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.toggle('on', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      var cat = c.dataset.cat;
      cards.forEach(function (card) { card.classList.toggle('hide', cat !== 'all' && card.dataset.cat !== cat); });
      document.dispatchEvent(new CustomEvent('filterchange', { detail: { cat: cat } }));
    });
  });

  /* ---------- shelf carousel ---------- */
  (function () {
    var track = $('#shelfTrack'), dotsEl = $('#shelfDots'); if (!track) return;
    var items = $$('.scard', track);
    function step() { var c = items[0]; return c ? c.getBoundingClientRect().width + 20 : 300; }
    function pages() { return Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1); }
    function drawDots() {
      var n = pages(); dotsEl.innerHTML = '';
      for (var i = 0; i < n; i++) dotsEl.appendChild(document.createElement('i'));
      update();
    }
    function update() {
      var i = Math.round(track.scrollLeft / step());
      $$('i', dotsEl).forEach(function (d, k) { d.classList.toggle('on', k === Math.min(i, pages() - 1)); });
    }
    $('#shPrev').addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }); });
    $('#shNext').addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step() }); } if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step() }); } });
    addEventListener('resize', drawDots);
    drawDots();
  })();

  /* ---------- accordion ---------- */
  $$('.acc-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var acc = b.closest('.acc'), open = !acc.classList.contains('open');
      acc.classList.toggle('open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- brief box: typed examples + prefill the contact form ---------- */
  (function () {
    var typed = $('#typed'), form = $('#briefForm'), input = $('#briefText');
    var examples = []; try { examples = JSON.parse(typed.dataset.examples || '[]'); } catch (e) {}
    var ei = 0;
    if (typed && examples.length && !reduced) {
      var txt = examples[0], pos = txt.length, dir = -1;
      setTimeout(function tick() {
        if (document.hidden) { setTimeout(tick, 600); return; }
        if (dir < 0) { pos -= 2; if (pos <= 0) { pos = 0; dir = 1; ei = (ei + 1) % examples.length; txt = examples[ei]; } }
        else { pos += 1; if (pos >= txt.length) { pos = txt.length; dir = -1; typed.textContent = txt; setTimeout(tick, 2600); return; } }
        typed.textContent = txt.slice(0, pos);
        setTimeout(tick, dir < 0 ? 18 : 34);
      }, 3200);
    }
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = (input.value || '').trim() || examples[ei] || '';
      var target = $('#ctMessage');
      if (target) { target.value = msg; target.dispatchEvent(new Event('input')); }
      var contact = $('#contact');
      if (contact) contact.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { var n = $('#ctName'); if (n) n.focus({ preventScroll: true }); }, reduced ? 0 : 700);
    });
  })();

  /* ---------- audit request form (same endpoint and payload as the main site) ---------- */
  (function () {
    var STEP_LABELS = ['Step 1 of 4 · You', 'Step 2 of 4 · Industry', 'Step 3 of 4 · Pain', 'Step 4 of 4 · Budget'];
    var form = document.getElementById('aqForm'); if (!form) return;
    var currentStep = 1, maxStep = 4;
    var q = function (s) { return form.querySelector(s); }, qq = function (s) { return Array.prototype.slice.call(form.querySelectorAll(s)); };
    var backBtn = q('#aqBack'), nextBtn = q('#aqNext'), submitBtn = q('#aqSubmit'), errorEl = q('#aqError'), stepLabel = q('#aqStepLabel'), successEl = q('#aqSuccess');
    function showStep(n) {
      currentStep = n;
      qq('.aq-step').forEach(function (el) { el.classList.toggle('active', Number(el.dataset.step) === n); });
      qq('.aq-dot').forEach(function (d) { var i = Number(d.dataset.dot); d.classList.toggle('on', i === n); d.classList.toggle('done', i < n); });
      stepLabel.textContent = STEP_LABELS[n - 1];
      backBtn.hidden = n === 1; nextBtn.hidden = n === maxStep; submitBtn.hidden = n !== maxStep; errorEl.hidden = true;
      var first = q('.aq-step.active input'); if (first && n > 1) first.focus({ preventScroll: true });
    }
    function validateStep(n) {
      errorEl.hidden = true;
      if (n === 1) {
        var name = form.elements['name'].value.trim(), email = form.elements['email'].value.trim();
        if (!name) return 'Please enter your name.';
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';
      }
      if (n === 2 && !form.elements['industry'].value) return 'Pick what your business does.';
      if (n === 4) {
        if (!form.elements['budget'].value) return 'Pick a budget (or "Not sure").';
        if (!form.elements['timeline'].value) return 'Pick a timeline.';
      }
      return null;
    }
    nextBtn.addEventListener('click', function () {
      var err = validateStep(currentStep);
      if (err) { errorEl.textContent = err; errorEl.hidden = false; return; }
      if (currentStep < maxStep) showStep(currentStep + 1);
    });
    backBtn.addEventListener('click', function () { if (currentStep > 1) showStep(currentStep - 1); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && currentStep < maxStep) { e.preventDefault(); nextBtn.click(); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = validateStep(currentStep);
      if (err) { errorEl.textContent = err; errorEl.hidden = false; return; }
      submitBtn.disabled = true; submitBtn.textContent = 'Sending…';
      var pain = qq('input[name="pain"]:checked').map(function (c) { return c.value; });
      var payload = {
        name: form.elements['name'].value.trim(), email: form.elements['email'].value.trim(), company: form.elements['company'].value.trim(),
        industry: form.elements['industry'].value, pain: pain, painText: form.elements['painText'].value.trim(),
        budget: form.elements['budget'].value, timeline: form.elements['timeline'].value
      };
      fetch('https://api.georg.miami/ops/audit-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, data: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error((res.data && res.data.error) || 'Submission failed');
          qq('.aq-step, .aq-progress, .aq-nav, #aqError').forEach(function (el) { el.style.display = 'none'; });
          successEl.hidden = false; successEl.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        })
        .catch(function (er) {
          submitBtn.disabled = false; submitBtn.textContent = 'Submit audit request';
          errorEl.textContent = 'Something went wrong: ' + er.message + '. Email georg.chimion@gmail.com instead.'; errorEl.hidden = false;
        });
    });
    showStep(1);
  })();

  /* ---------- contact form (same endpoint and payload as the main site) ---------- */
  (function () {
    var form = document.getElementById('ctForm'); if (!form) return;
    var errEl = document.getElementById('ctError'), okEl = document.getElementById('ctSuccess'), btn = document.getElementById('ctSubmit');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); errEl.hidden = true;
      var name = form.elements['name'].value.trim(), email = form.elements['email'].value.trim(), message = form.elements['message'].value.trim();
      if (!name || !email) { errEl.textContent = 'Your name and email, please.'; errEl.hidden = false; return; }
      if (!emailRe.test(email)) { errEl.textContent = 'That email address looks off.'; errEl.hidden = false; return; }
      var label = btn.innerHTML; btn.disabled = true; btn.textContent = 'Sending…';
      fetch('https://api.georg.miami/ops/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email, message: message, page: location.pathname }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, data: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error((res.data && res.data.error) || 'Submission failed');
          form.style.display = 'none'; okEl.hidden = false; okEl.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        })
        .catch(function () {
          btn.disabled = false; btn.innerHTML = label;
          errEl.textContent = 'Something went wrong. Email georg.chimion@gmail.com instead.'; errEl.hidden = false;
        });
    });
  })();

  /* ---------- floating help ---------- */
  (function () {
    var btn = $('#helpBtn'), pop = $('#helpPop'), x = $('#helpX'); if (!btn) return;
    function set(open) { pop.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function () { set(pop.hidden); });
    x.addEventListener('click', function () { set(false); store.set('studioHelp', 'dismissed'); });
    $$('a', pop).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    var seen = false; try { seen = window.sessionStorage.getItem('studioHelpSeen') === '1'; } catch (e) {}
    if (store.get('studioHelp') !== 'dismissed' && desktop.matches && !seen) setTimeout(function () {
      if (!pop.hidden) return; set(true);
      try { window.sessionStorage.setItem('studioHelpSeen', '1'); } catch (e) {}
      setTimeout(function () { if (!pop.matches(':hover')) set(false); }, 9000);
    }, 8000);
  })();
})();
