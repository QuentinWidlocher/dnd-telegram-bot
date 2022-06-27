export const rollParseRegex = /(\d+)?[dD](\d+)([\+\-]\d+)?/;

export function parseRoll(roll: string) {
  console.debug("parsing the roll", roll);

  let parsed = rollParseRegex.exec(roll);

  if (parsed != null) {
    let [, rollNb = 1, sides, modifier] = parsed;

    let rolled = 0;
    let rolls = [];

    while (rolled < rollNb) {
      rolls.push(getRandom(parseInt(sides)));
      rolled++;
    }

    let totalBeforeModifiers = rolls.reduce((a, b) => a + b, 0);
    let total = modifier
      ? totalBeforeModifiers + parseInt(modifier)
      : totalBeforeModifiers;

    let result = {
      rolls,
      rollNb,
      sides,
      modifier,
      totalBeforeModifiers,
      total,
    };

    console.debug("parsed", result);

    return result;
  } else {
    console.error("roll is not valid");
    return null;
  }
}

export function fuzzySearchRegexTemplate(word: string) {
  return `(?=[a-z\u00E0-\u00FC]*${word}[a-z\u00E0-\u00FC]*)`;
}

function getRandom(max: number) {
  return Math.floor(Math.random() * max + 1);
}
