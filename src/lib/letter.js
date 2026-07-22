export function toRomanNumeral(value) {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    throw new RangeError("Letter number must be an integer from 1 to 3999");
  }

  const numerals = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let result = "";

  numerals.forEach(([amount, numeral]) => {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  });

  return result;
}

export function formatLetterLabel(number, locale) {
  const noun = locale === "fr" ? "LETTRE" : "LETTER";
  return `${noun} ${toRomanNumeral(number)}`;
}

export function formatLetterCode(number) {
  return toRomanNumeral(number);
}
