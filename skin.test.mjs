// skin.test.mjs — the organ's kernel, pinned. The skin never invents a figure and never misses one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStat, stepsFor, staggerDelay, REVEAL_STAGGER_S } from './skin.mjs';

test('parseStat reads plain, decimal, suffixed and prefixed figures exactly', () => {
  assert.deepEqual(parseStat('0.870'), { prefix: '', num: 0.87, suffix: '', decimals: 3 });
  assert.deepEqual(parseStat('250M'), { prefix: '', num: 250, suffix: 'M', decimals: 0 });
  assert.deepEqual(parseStat('32 B'), { prefix: '', num: 32, suffix: 'B', decimals: 0 });
  assert.deepEqual(parseStat('20.5×'), { prefix: '', num: 20.5, suffix: '×', decimals: 1 });
  assert.deepEqual(parseStat('£9'), { prefix: '£', num: 9, suffix: '', decimals: 0 });
  assert.deepEqual(parseStat('86.0%'), { prefix: '', num: 86, suffix: '%', decimals: 1 });
});
test('parseStat refuses junk rather than guessing', () => {
  assert.equal(parseStat('soon'), null);
  assert.equal(parseStat(''), null);
  assert.equal(parseStat(null), null);
  assert.equal(parseStat('NaNM'), null);
});
test('stepsFor starts at zero-ish, rises monotonically, and ENDS EXACTLY on the real figure', () => {
  const s = stepsFor(parseStat('0.870'), 36);
  assert.equal(s.length, 36);
  assert.equal(s[0], '0.000');
  assert.equal(s[35], '0.870');                                   // the figure is the figure
  const nums = s.map((x) => Number(x));
  for (let i = 1; i < nums.length; i++) assert.ok(nums[i] >= nums[i - 1], 'monotonic');
  assert.equal(stepsFor(parseStat('250M'), 10)[9], '250 M');
  assert.equal(stepsFor(parseStat('£9'), 5)[4], '£9');
});
test('stepsFor refuses a broken stat or frame count', () => {
  assert.equal(stepsFor(null), null);
  assert.equal(stepsFor(parseStat('5'), 1), null);
  assert.equal(stepsFor(parseStat('5'), 2.5), null);
});
test('staggerDelay steps by the constant and caps at 8 siblings', () => {
  assert.equal(staggerDelay(0), '0.00s');
  assert.equal(staggerDelay(1), REVEAL_STAGGER_S.toFixed(2) + 's');
  assert.equal(staggerDelay(3), (3 * REVEAL_STAGGER_S).toFixed(2) + 's');
  assert.equal(staggerDelay(50), (8 * REVEAL_STAGGER_S).toFixed(2) + 's');
  assert.equal(staggerDelay(-2), '0.00s');
  assert.equal(staggerDelay(null), '0.00s');
});

test('the exact boundaries: 2 frames is valid, and the easing curve itself is pinned', () => {
  const two = stepsFor(parseStat('5'), 2);
  assert.equal(two.length, 2);
  assert.equal(two[1], '5');                                       // still ends exactly
  assert.equal(stepsFor(parseStat('8'), 3)[1], '7');               // 8·ease(.5)=8·0.875 — pins the (frames−1) divisor
});
