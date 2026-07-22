import assert from "node:assert/strict";
import test from "node:test";
import { formatLetterCode, formatLetterLabel, toRomanNumeral } from "../src/lib/letter.js";

test("letter numbers become Roman numerals", () => {
  assert.equal(toRomanNumeral(1), "I");
  assert.equal(toRomanNumeral(4), "IV");
  assert.equal(toRomanNumeral(32), "XXXII");
  assert.equal(toRomanNumeral(99), "XCIX");
});

test("letter identity follows the active language", () => {
  assert.equal(formatLetterLabel(32, "en"), "LETTER XXXII");
  assert.equal(formatLetterLabel(32, "fr"), "LETTRE XXXII");
  assert.equal(formatLetterCode(32), "XXXII");
});

test("invalid letter numbers fail clearly", () => {
  assert.throws(() => toRomanNumeral(0), RangeError);
  assert.throws(() => toRomanNumeral(12.5), RangeError);
});
