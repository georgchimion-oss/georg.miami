/* georg.miami/studio: motion. Runs after the deferred GSAP scripts (DOMContentLoaded). Content never depends on it. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var S = window.__studio || {};
  var root = document.documentElement;
  if (S.reduced || !window.gsap || !window.ScrollTrigger) { root.classList.add('no-motion'); return; }
  gsap.registerPlugin(ScrollTrigger);
  var hasMP = !!window.MotionPathPlugin; if (hasMP) gsap.registerPlugin(MotionPathPlugin);
  root.classList.add('motion');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
  var mm = gsap.matchMedia();

  function prepDraw(el) {
    var len = 300;
    try { len = el.getTotalLength(); } catch (e) {}
    el.style.strokeDasharray = len + ' ' + len;
    el.style.strokeDashoffset = len;
    el.__len = len;
    return len;
  }
  function setDraw(el, p) { if (el.__len == null) prepDraw(el); el.style.strokeDashoffset = el.__len * (1 - clamp(p)); }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- 1. hero entrance choreography ---------- */
  function split(el) {
    if (el.__words) return el.__words;
    var frag = document.createDocumentFragment(), words = [];
    function wrap(text, box) {
      text.split(/(\s+)/).forEach(function (t) {
        if (!t) return;
        if (/^\s+$/.test(t)) { box.appendChild(document.createTextNode(t)); return; }
        var m = document.createElement('span'); m.className = 'wm';
        var w = document.createElement('span'); w.className = 'w'; w.textContent = t;
        m.appendChild(w); box.appendChild(m); words.push(w);
      });
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) wrap(n.textContent, frag);
      else if (n.nodeType === 1) { var c = n.cloneNode(false); wrap(n.textContent, c); frag.appendChild(c); }
    });
    el.innerHTML = ''; el.appendChild(frag); el.__words = words; return words;
  }
  $$('.slide .h1').forEach(split);
  function enterSlide(slide, first, art) {
    var els = $$('.hero-el', slide).filter(function (x) { return !x.classList.contains('h1'); });
    var words = $$('.h1 .w', slide), vid = art && $('.art-vid', art), pf = art && $('.pf', art);
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: first ? 0.15 : 0 });
    tl.fromTo(els, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, 0)
      .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 0.85, stagger: 0.045 }, 0.12);
    if (vid) tl.fromTo(vid, { scale: 0.88, y: 24 }, { scale: 1, y: 0, duration: 1.2 }, 0.15);
    if (pf) {
      var ring = $('.pf-ring circle', pf); if (ring) { prepDraw(ring); tl.to(ring, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.1); }
      tl.fromTo($('.pf-disc', pf), { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, transformOrigin: '50% 100%' }, 0.1)
        .fromTo($$('.pf-pop, .pf-duo', pf), { yPercent: 8, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1 }, 0.25)
        .fromTo($$('.pf-chip', pf), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.8)', clearProps: 'transform' }, 0.7);
      var buddy = $('.pf-buddy', pf);
      if (buddy) tl.fromTo(buddy, { scale: 0.2, opacity: 0, y: 18 }, { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: 'back.out(2.6)', clearProps: 'transform' }, 0.95);
    }
    return tl;
  }
  enterSlide($('.slide.on'), true, $('.art.on'));
  gsap.fromTo('.rail-btn', { scale: 0 }, { scale: 1, duration: 0.6, stagger: 0.07, ease: 'back.out(2)', delay: 0.45 });
  gsap.fromTo('.hero-foot', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.9, ease: 'power2.out' });
  document.addEventListener('slidechange', function (e) { enterSlide(e.detail.el, false, e.detail.art); });
  /* hero exit: parallax and blur as it leaves (scrubbed) */
  gsap.to('.hero .slides', { yPercent: -5, opacity: 0.35, filter: 'blur(5px)', ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center top+=30%', end: 'bottom top', scrub: true } });
  gsap.to('.hero .art', { yPercent: 8, scale: 0.94, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.o1', { y: 140, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.o2', { y: -90, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- 2. reveals, staggers ---------- */
  gsap.set('.reveal', { opacity: 0, y: 34 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: function (batch) { gsap.fromTo(batch, { opacity: 0, y: 34, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true }); }
  });
  $$('[data-stagger]').forEach(function (g) {
    var kids = Array.prototype.slice.call(g.children);
    gsap.fromTo(kids, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 88%', once: true } });
  });
  gsap.fromTo('.pcard', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '#pgrid', start: 'top 85%', once: true } });
  gsap.fromTo('.scard', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#shelfTrack', start: 'top 85%', once: true } });
  gsap.fromTo('.dock-tile', { opacity: 0, y: 18, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.06, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.dock', start: 'top 88%', once: true } });

  /* ---------- 3. SVG draw-ins outside the scenes ---------- */
  $$('.swoosh path').forEach(function (p) {
    prepDraw(p);
    gsap.to(p, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out', scrollTrigger: { trigger: p.closest('svg'), start: 'top 90%', once: true } });
  });
  $$('.line-ic').forEach(function (svg) {
    var parts = $$('[data-draw]', svg); parts.forEach(prepDraw);
    gsap.to(parts, { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'left 95%', horizontal: false, once: true } });
  });
  var miami = $$('.miami [data-draw]'); miami.forEach(prepDraw);
  if (miami.length) gsap.to(miami, { strokeDashoffset: 0, duration: 1.8, stagger: 0.18, ease: 'power2.inOut', scrollTrigger: { trigger: '.foot', start: 'top 92%', once: true } });

  /* ---------- 4. counters ---------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count); if (isNaN(target)) return;
    var suf = el.dataset.suffix || '', o = { v: 0 };
    el.textContent = '0' + suf;
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
      gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = fmt(o.v) + suf; } });
    } });
  });

  /* ---------- 5. magnetic CTAs + hover tilt (max 3 degrees) ---------- */
  $$('.magnet').forEach(function (b) {
    var qx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3.out' });
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.25); qy((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener('mouseleave', function () { qx(0); qy(0); });
  });
  $$('.pcard, .scard, .sgroup, .pain').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      gsap.to(c, { rotateX: ((e.clientY - r.top) / r.height - 0.5) * -3, rotateY: ((e.clientX - r.left) / r.width - 0.5) * 3, transformPerspective: 900, duration: 0.3, ease: 'power2.out' });
    });
    c.addEventListener('mouseleave', function () { gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' }); });
  });

  /* ---------- 6. marquee runs only on screen ---------- */
  var mq = $('.mq-track');
  if (mq) ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onToggle: function (self) { mq.style.animationPlayState = self.isActive ? 'running' : 'paused'; } });

  /* ---------- 7. particles flowing along paths ---------- */
  function loopAlong(dot, dur, delay) {
    if (!hasMP || !dot || dot.__loop) return;
    var path = $(dot.dataset.path); if (!path) return;
    dot.__loop = gsap.to(dot, { duration: dur, delay: delay || 0, repeat: -1, ease: 'none', motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] }, onStart: function () { dot.style.opacity = 1; } });
  }

  /* ---------- 8. scene helpers (shared by desktop pins and mobile plays) ---------- */
  function flagState(panel, local) {
    var steps = $$('.fstep', panel), n = steps.length, k = Math.floor(local * (n + 0.6));
    steps.forEach(function (s, j) { s.classList.toggle('lit', j < k); });
    var line = $('.pipe-line', panel); if (line) setDraw(line, local * 1.15);
    if (local > 0.15) loopAlong($('.pipe-dot', panel), 2.4, 0);
  }
  function seatState(panel, local) {
    $$('.conn', panel).forEach(function (c, k) { setDraw(c, (local - k * 0.14) / 0.42); });
    $$('.conn-dot', panel).forEach(function (d, k) { if (local > 0.2 + k * 0.14) loopAlong(d, 1.8, k * 0.3); });
    var oc = $('.outcome', panel), t = clamp((local - 0.42) / 0.3);
    gsap.set(oc, { opacity: 0.25 + 0.75 * t, y: 18 * (1 - t), scale: 0.97 + 0.03 * t });
    $$('.pain', panel).forEach(function (p, k) { gsap.set(p, { opacity: 0.35 + 0.65 * clamp((local + 0.15 - k * 0.12) / 0.3), x: -16 * (1 - clamp((local + 0.15 - k * 0.12) / 0.3)) }); });
  }
  var aud = $('#audits'), audSteps = aud ? $$('.step', aud) : [];
  var lens = aud && $('.am-lens', aud), sigs = aud ? $$('.am-signals span', aud) : [], arc = aud && $('.amd-arc', aud), num = aud && $('[data-count-scene]', aud);
  var bars = aud ? $$('.am-bar b', aud) : [], typed = aud && $('.am-typed', aud), ship = aud && $('.am-ship', aud), sigBox = aud && $('.am-signals', aud);
  var typedText = typed ? (typed.dataset.text || typed.textContent) : '';
  function audState(p) {
    if (!aud) return;
    var r = clamp(p / 0.33), v = clamp((p - 0.33) / 0.33), s = clamp((p - 0.66) / 0.3);
    if (lens && sigBox) gsap.set(lens, { x: Math.sin(r * Math.PI) * Math.max(0, sigBox.offsetWidth * 0.62), rotate: -10 * Math.sin(r * Math.PI * 2) });
    sigs.forEach(function (g, k) { g.classList.toggle('hit', r * 4.4 > k + 0.6); });
    if (arc) arc.style.strokeDashoffset = 100 - 72 * v;
    if (num) num.textContent = Math.round(72 * v);
    bars.forEach(function (b, k) { gsap.set(b, { scaleX: clamp(v * 1.7 - k * 0.07) }); });
    if (typed) typed.textContent = typedText.slice(0, Math.round(s * typedText.length)) || ' ';
    if (ship) gsap.set(ship, { opacity: 0.2 + 0.8 * s, y: 14 * (1 - s) });
    var idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
    audSteps.forEach(function (st, k) { st.classList.toggle('on', k === idx); });
  }
  var tlRoot = $('#howitruns'), tlNodes = tlRoot ? $$('.tnode', tlRoot) : [], tlPath = tlRoot && $('#tlPath'), tlSpark = tlRoot && $('.tl-spark', tlRoot);
  function tlState(p) {
    if (tlPath) setDraw(tlPath, p);
    tlNodes.forEach(function (nd, k) { nd.classList.toggle('lit', p >= k / Math.max(1, tlNodes.length - 1) * 0.96); });
  }
  function meter(sel, p) { var m = $(sel + ' .scene-meter i'); if (m) gsap.set(m, { scaleX: p }); }

  /* ---------- 9a. desktop: four pinned, scroll-scrubbed scenes ---------- */
  mm.add('(min-width: 901px)', function () {
    window.__sceneGoto = {};
    function pinTabs(group, sel, perTab, stateFn) {
      var pin = $(sel + ' .pin'), api = window.__tabs && window.__tabs[group]; if (!pin || !api) return null;
      var n = api.count;
      var st = ScrollTrigger.create({
        trigger: pin, start: 'top top', end: '+=' + (n * perTab) + '%', pin: true, scrub: 0.6, anticipatePin: 1,
        animation: gsap.fromTo(sel + ' .scene-meter i', { scaleX: 0 }, { scaleX: 1, ease: 'none' }),
        onUpdate: function (self) {
          var p = self.progress, i = Math.min(n - 1, Math.floor(p * n)), local = clamp(p * n - i);
          if (api.get() !== i) api.set(i, true);
          var panel = $$(sel + ' [role=tabpanel]')[i];
          stateFn(panel, local);
        }
      });
      window.__sceneGoto[group] = function (i) {
        var y = st.start + (i + 0.35) / n * (st.end - st.start);
        window.scrollTo({ top: y, behavior: 'smooth' });
      };
      stateFn($$(sel + ' [role=tabpanel]')[0], 0);
      return st;
    }
    pinTabs('flag', '#work', 70, flagState);
    pinTabs('seat', '#seat', 60, seatState);
    if (aud) {
      audState(0);
      ScrollTrigger.create({ trigger: '#audits .pin', start: 'top top', end: '+=220%', pin: true, scrub: 0.5, anticipatePin: 1,
        animation: gsap.fromTo('#audits .scene-meter i', { scaleX: 0 }, { scaleX: 1, ease: 'none' }),
        onUpdate: function (self) { audState(self.progress); } });
    }
    if (tlRoot) {
      tlState(0);
      var tlTl = gsap.timeline();
      tlTl.fromTo('#howitruns .scene-meter i', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0);
      if (hasMP && tlSpark && tlPath) { tlTl.set(tlSpark, { opacity: 1 }, 0).to(tlSpark, { duration: 1, ease: 'none', motionPath: { path: tlPath, align: tlPath, alignOrigin: [0.5, 0.5] } }, 0); }
      ScrollTrigger.create({ trigger: '#howitruns .pin', start: 'top top', end: '+=180%', pin: true, scrub: 0.6, anticipatePin: 1, animation: tlTl,
        onUpdate: function (self) { tlState(self.progress); } });
    }
    return function () { window.__sceneGoto = null; };
  });

  /* ---------- 9b. phones and tablets: scenes play once on arrival, tabs animate on change ---------- */
  mm.add('(max-width: 900px)', function () {
    function play(fn, el, dur) { var o = { p: 0 }; gsap.to(o, { p: 1, duration: dur, ease: 'power2.inOut', onUpdate: function () { fn(el, o.p); } }); }
    var firstFlag = $('#work [role=tabpanel]'), firstSeat = $('#seat [role=tabpanel]');
    if (firstFlag) { flagState(firstFlag, 0); ScrollTrigger.create({ trigger: firstFlag, start: 'top 80%', once: true, onEnter: function () { play(flagState, $('#work [role=tabpanel].on'), 1.8); } }); }
    if (firstSeat) { seatState(firstSeat, 0); ScrollTrigger.create({ trigger: firstSeat, start: 'top 80%', once: true, onEnter: function () { play(seatState, $('#seat [role=tabpanel].on'), 1.6); } }); }
    var onTab = function (e) {
      var d = e.detail; if (d.fromScroll) return;
      if (d.group === 'flag') { flagState(d.panel, 0); play(flagState, d.panel, 1.6); }
      if (d.group === 'seat') { seatState(d.panel, 0); play(seatState, d.panel, 1.4); }
    };
    document.addEventListener('tabchange', onTab);
    if (aud) { audState(0); ScrollTrigger.create({ trigger: '.aud-stage', start: 'top 75%', once: true, onEnter: function () { play(function (_, p) { audState(p); }, null, 3.2); } }); }
    if (tlRoot) { tlState(0); ScrollTrigger.create({ trigger: '.tnodes', start: 'top 80%', once: true, onEnter: function () { play(function (_, p) { tlState(p); }, null, 2.2); } }); }
    return function () { document.removeEventListener('tabchange', onTab); };
  });

  /* ---------- 10. index filter, stack tabs: animate what appears ---------- */
  document.addEventListener('filterchange', function () {
    gsap.fromTo($$('.pcard:not(.hide)'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out' });
    ScrollTrigger.refresh();
  });
  document.addEventListener('tabchange', function (e) {
    if (e.detail.group === 'stack') gsap.fromTo($$('.sgroup', e.detail.panel), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' });
  });

  addEventListener('load', function () { ScrollTrigger.refresh(); });
});
