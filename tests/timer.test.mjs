import assert from "node:assert/strict";
import test from "node:test";
import { formatTimer, remainingTimerSeconds } from "../src/lib/timer.js";

test("timer labels remain stable at minute boundaries", () => {
  assert.equal(formatTimer(600), "10:00");
  assert.equal(formatTimer(59), "00:59");
  assert.equal(formatTimer(-1), "00:00");
});

test("timer progress follows wall time and never becomes negative", () => {
  assert.equal(remainingTimerSeconds(10_000, 1_250), 9);
  assert.equal(remainingTimerSeconds(10_000, 10_001), 0);
});
