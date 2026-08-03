import assert from "node:assert/strict";
import test from "node:test";
import { formatTimer, hourglassSandLevels, remainingTimerSeconds } from "../src/lib/timer.js";

test("timer labels remain stable at minute boundaries", () => {
  assert.equal(formatTimer(600), "10:00");
  assert.equal(formatTimer(59), "00:59");
  assert.equal(formatTimer(-1), "00:00");
});

test("timer progress follows wall time and never becomes negative", () => {
  assert.equal(remainingTimerSeconds(10_000, 1_250), 9);
  assert.equal(remainingTimerSeconds(10_000, 10_001), 0);
});

test("hourglass sand transfers completely from the upper to the lower chamber", () => {
  assert.deepEqual(hourglassSandLevels(0), { top: 1, bottom: 0 });
  assert.deepEqual(hourglassSandLevels(0.5), { top: 0.5, bottom: 0.5 });
  assert.deepEqual(hourglassSandLevels(1), { top: 0, bottom: 1 });
  assert.deepEqual(hourglassSandLevels(2), { top: 0, bottom: 1 });
});
