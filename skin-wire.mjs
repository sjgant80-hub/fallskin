// fallskin/skin-wire.mjs — the DOM glue (observers, count-up ticks, the sticky till). Deliberately
// OUTSIDE the mutation gate: it is browser-only wiring with no business truth in it; the live pattern
// book and ui-gate police it. All figures and timing come from the GATED kernel in skin.mjs.
import { parseStat, stepsFor, staggerDelay } from './skin.mjs';

function wire() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveals = [...document.querySelectorAll('.fs-reveal')];
  for (const el of reveals) {
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList && c.classList.contains('fs-reveal')) : [el];
    el.style.setProperty('--d', staggerDelay(sibs.indexOf(el)));
  }
  if (reveals.length) {
    if (reduce) reveals.forEach((el) => el.classList.add('is-in'));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12 });
      reveals.forEach((el) => io.observe(el));
    }
  }

  const stats = [...document.querySelectorAll('.fs-stat b[data-value]')];
  for (const b of stats) {
    const stat = parseStat(b.dataset.value);
    if (!stat) continue;
    const frames = stepsFor(stat, 36);
    const final = frames ? frames[frames.length - 1] : b.dataset.value;
    if (reduce || !frames) { b.textContent = final; continue; }
    b.textContent = frames[0];
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(b);
      // time-based so a hidden tab (rAF frozen) still advances; on completion it clears ITSELF and
      // pins the exact final frame.
      const dur = 900, t0 = performance.now();
      b._fsIv = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / dur);
        b.textContent = frames[Math.min(frames.length - 1, Math.floor(k * (frames.length - 1)))];
        if (k >= 1) { clearInterval(b._fsIv); b._fsIv = null; b.textContent = final; }
      }, 16);
    }), { threshold: 0.4 });
    io.observe(b);
  }
  // THE FIGURE LAW: within 3s the EXACT figure is on screen. CLEAR any running count first — a
  // throttled interval (hidden tab, frozen clock) must never re-zero the value after — then set final.
  setTimeout(() => { for (const b of stats) { if (b._fsIv) { clearInterval(b._fsIv); b._fsIv = null; } const st = parseStat(b.dataset.value); const fr = st && stepsFor(st, 2); if (fr) b.textContent = fr[1]; } }, 3000);

  const sticky = document.querySelector('.fs-sticky');
  const hero = document.querySelector('.fs-hero') || document.querySelector('header');
  if (sticky && hero) {
    const io = new IntersectionObserver((es) => es.forEach((e) => sticky.classList.toggle('is-on', !e.isIntersecting)), { threshold: 0.05 });
    io.observe(hero);
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
else wire();
