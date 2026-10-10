// fallskin/skin.mjs — the organ's tiny kernel: reveals on scroll, stat count-ups from REAL numbers
// only (data-value attributes — the skin never invents a figure), and the sticky till that appears
// once the hero is passed. Deterministic (no Math.random, no Date-dependent output); the pure parts
// are exported for the witness gate. Reduced-motion users get everything instantly, animated for no
// one who asked not to be. Powered by the Konomi architecture, created by Thomas Frumkin.

// ── PURE · parse a stat string: number + suffix ("0.870" · "250M" · "32 B" · "127/127" passthru) ──
export function parseStat(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  const m = t.match(/^([£$€]?)(\d+(?:\.\d+)?)\s*([a-zA-Z%×/].*)?$/);
  if (!m) return null;
  const num = Number(m[2]);
  if (!Number.isFinite(num)) return null;
  const decimals = (m[2].split('.')[1] || '').length;
  return { prefix: m[1] || '', num, suffix: (m[3] || '').trim(), decimals };
}

// ── PURE · the count-up frames: 0 → value, eased, ending EXACTLY on the real figure ──────────────
export function stepsFor(stat, frames = 30) {
  if (!stat || !Number.isFinite(stat.num) || !Number.isInteger(frames) || frames < 2) return null;
  const ease = (t) => 1 - Math.pow(1 - t, 3);                 // cubic out — arrives, doesn't crawl
  const out = [];
  for (let i = 0; i < frames; i++) {
    const v = stat.num * ease(i / (frames - 1));
    out.push(stat.prefix + v.toFixed(stat.decimals) + (stat.suffix ? ' ' + stat.suffix : ''));
  }
  out[frames - 1] = stat.prefix + stat.num.toFixed(stat.decimals) + (stat.suffix ? ' ' + stat.suffix : '');
  return out;
}

export const REVEAL_STAGGER_S = 0.08;   // per-sibling delay
export function staggerDelay(indexInParent) {
  const i = Math.max(0, Number.isInteger(indexInParent) ? indexInParent : 0);
  return (Math.min(i, 8) * REVEAL_STAGGER_S).toFixed(2) + 's';
}

// Browser: pull in the DOM glue (skin-wire.mjs). Guarded so the gated kernel stays pure in node —
// and if this guard is ever flipped, the wire file explodes loudly under node:test, killing the mutant.
if (typeof document !== 'undefined') import('./skin-wire.mjs');

export default { parseStat, stepsFor, staggerDelay, REVEAL_STAGGER_S };
