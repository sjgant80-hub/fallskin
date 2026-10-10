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
    if (reduce || !frames) { b.textContent = frames ? frames[frames.length - 1] : b.dataset.value; continue; }
    b.textContent = frames[0];
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(b);
      let i = 0; const tick = () => { b.textContent = frames[i]; if (++i < frames.length) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.4 });
    io.observe(b);
  }

  const sticky = document.querySelector('.fs-sticky');
  const hero = document.querySelector('.fs-hero') || document.querySelector('header');
  if (sticky && hero) {
    const io = new IntersectionObserver((es) => es.forEach((e) => sticky.classList.toggle('is-on', !e.isIntersecting)), { threshold: 0.05 });
    io.observe(hero);
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
else wire();
