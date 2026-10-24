function toPlural(word) {
  if (!word) return '';

  const irregulars = {
    man: 'men',
    woman: 'women',
    child: 'children',
    person: 'people',
    mouse: 'mice',
    goose: 'geese',
    tooth: 'teeth',
    foot: 'feet',
    ox: 'oxen',
  };

  // irregular
  if (irregulars[word]) return irregulars[word];

  // f/fe -> ves (leaf -> leaves, knife -> knives)
  if (/(?:[^f]fe|[lr]f)$/.test(word)) {
    return word.replace(/fe$/, 'ves').replace(/f$/, 'ves');
  }

  // consonant + y -> ies
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) {
    return word.slice(0, -1) + 'ies';
  }

  // vowel + y -> +s
  if (word.endsWith('y')) {
    return word + 's';
  }

  // words ending in z
  if (word.endsWith('z')) {
    // nếu chỉ 1 z thì nhân đôi
    if (!word.endsWith('zz')) {
      return word + 'zes'; // quiz -> quizzes, fez -> fezzes
    }
    return word + 'es'; // buzz -> buzzes
  }

  // s, x, ch, sh
  if (
    word.endsWith('s') ||
    word.endsWith('x') ||
    word.endsWith('ch') ||
    word.endsWith('sh')
  ) {
    return word + 'es';
  }

  // default
  return word + 's';
}

// export cho generator
module.exports = { toPlural };
