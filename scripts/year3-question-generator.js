/**
 * Year 3 Daily Ten — Procedural Question Generator
 * Parameters derived from Karen's mental maths worksheets (Terms 3–4).
 * Each topic has three levels: less, more, most challenging,
 * plus "easier" and "harder" variants for breadth.
 */
const Year3Generator = (function () {
  'use strict';

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const fmt = n => Number(n).toLocaleString();

  const NAMES = [
    'Jack', 'Mia', 'Liam', 'Chloe', 'Noah', 'Isla', 'Ethan', 'Ava',
    'Oliver', 'Ruby', 'Matilda', 'Leo', 'Harper', 'Kai', 'Zara',
    'Lucy', 'Tom', 'Kim', 'Jay', 'Sarah', 'Jane', 'Zoe', 'Eve', 'Lily'
  ];

  const _used = new Set();
  function dedupe(key, fn, retries) {
    if (retries === undefined) retries = 30;
    if (_used.has(key) && retries > 0) return null;
    _used.add(key);
    return true;
  }

  function fill(tpl, vals) {
    let s = tpl;
    for (const [k, v] of Object.entries(vals)) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
    return s;
  }

  // ════════════════════════════════════════════
  // TOPIC DEFINITIONS
  // ════════════════════════════════════════════
  const TOPICS = {};

  // ── ADDITION ────────────────────────────────
  const ADD_CTX_LESS = [
    '{name} had {a} stickers and collected {b} more. How many altogether?',
    '{name} scored {a} goals in the first game and {b} in the second. How many goals in total?',
    '{name} picked {a} strawberries and {b} blueberries. How many berries in total?',
    'There are {a} students in Room 1 and {b} in Room 2. How many students altogether?',
    '{name} has {a} coloured pencils in one box and {b} in another. How many altogether?',
    '{name} shot {a} goals in one game and {b} in the next. How many goals altogether?',
    'A fruit shop sold {a} apples in the morning and {b} in the afternoon. How many in total?',
  ];
  const ADD_CTX_MORE = [
    'A cricket team scored {a} runs in one game and {b} in the next. How many runs altogether?',
    '{name} read {a} pages and then {b} more. How many pages in total?',
    '{name} cycled {a} metres on Saturday and {b} metres on Sunday. How far altogether?',
    'A school collected {a} cans in Week 1 and {b} in Week 2. How many cans in total?',
    '{name} did {a} mental maths problems and then {b} more. How many altogether?',
    'Saturday\'s spectators numbered {a} and Sunday\'s was {b}. What was the total?',
    'Dad drives {a} km and then a further {b} km. How far did he travel altogether?',
  ];
  const ADD_CTX_MOST = [
    'Two test matches drew {a} and {b} spectators. How many altogether?',
    'A festival sold {a} tickets in March and {b} in April. How many in total?',
    '{name}\'s school raised {a} house points, then gained {b} more. What is the total?',
    'A family drove {a} km from Sydney to Melbourne, and then {b} km to Broken Hill. How far altogether?',
    'An iPad costs ${a}. A desk costs ${b}. What is the total cost?',
    'A blazer costs ${a}. A school hat costs ${b}. What is the total cost?',
    'A pair of ice skates cost ${a}. A hockey stick costs ${b}. What is the total cost?',
  ];

  TOPICS['addition'] = {
    label: 'Addition',
    generate(level) {
      if (level === 'less') {
        const a = rand(10, 40), b = rand(5, 25);
        const k = 'add-l-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['addition'].generate(level);
        _used.add(k);
        const tpl = pick(ADD_CTX_LESS);
        return { topic: 'Addition', level, question: fill(tpl, { name: pick(NAMES), a, b }), answer: String(a + b), working: a + ' + ' + b + ' = ' + (a + b) };
      }
      if (level === 'more') {
        const a = rand(40, 500), b = rand(30, 420);
        const k = 'add-m-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['addition'].generate(level);
        _used.add(k);
        const tpl = pick(ADD_CTX_MORE);
        return { topic: 'Addition', level, question: fill(tpl, { name: pick(NAMES), a: fmt(a), b: fmt(b) }), answer: fmt(a + b), working: fmt(a) + ' + ' + fmt(b) + ' = ' + fmt(a + b) };
      }
      // most
      const useWord = Math.random() < 0.5;
      if (useWord) {
        const a = rand(100, 900), b = rand(20, 300);
        const k = 'add-M-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['addition'].generate(level);
        _used.add(k);
        const tpl = pick(ADD_CTX_MOST);
        return { topic: 'Addition', level, question: fill(tpl, { name: pick(NAMES), a: fmt(a), b: fmt(b) }), answer: fmt(a + b), working: fmt(a) + ' + ' + fmt(b) + ' = ' + fmt(a + b) };
      }
      const a = rand(100000, 200000), b = rand(50000, 150000);
      const k = 'add-M-' + a + '-' + b;
      if (_used.has(k)) return TOPICS['addition'].generate(level);
      _used.add(k);
      const tpl = pick(ADD_CTX_MOST);
      return { topic: 'Addition', level, question: fill(tpl, { name: pick(NAMES), a: fmt(a), b: fmt(b) }), answer: fmt(a + b), working: fmt(a) + ' + ' + fmt(b) + ' = ' + fmt(a + b) };
    }
  };

  // ── SUBTRACTION ─────────────────────────────
  const SUB_CTX_LESS = [
    'There were {a} books on the shelf. {b} were borrowed. How many are left?',
    '{name} had {a} lollies and gave away {b}. How many are left?',
    '{name} had {a} stickers. She gave {b} stickers away. How many are left?',
    '{b} students were told they couldn\'t climb the rock wall out of {a}. How many climbed it?',
    'There were {a} sandwiches in the canteen. {b} were eaten. How many are left?',
    'There were {a} cupcakes. {b} were sold. How many remain?',
    'A truck driver has a {a} km journey. He stops after {b} km. How much further to go?',
  ];
  const SUB_CTX_MORE = [
    '{a} tickets to the musical were available. If {b} were sold, how many remain?',
    'A school had {a} students. {b} went home early. How many are still at school?',
    '{name} wants to raise ${a} for charity. She has raised ${b}. How much more does she need?',
    'A farmer had {a} sheep. He sold {b}. How many are left?',
    '{a} people rode the Ferris wheel. If {b} tickets were sold, how many more need to ride?',
    '{name} has a collection of {a} football cards. Her brother has {b}. How many more does {name} have?',
  ];
  const SUB_CTX_MOST = [
    'A warehouse had {a} items. If {b} were shipped, how many remained?',
    'A pet shop bought {a} containers of fish food. If {b} were sold, how many remained?',
    'A box has {a} blocks. {b} blocks were used. How many remain?',
    'Teachers used {b} bobby pins during the musical. If they started with {a}, how many were left?',
    'There was {a} cm of ribbon. {name} used some and now there is {b} cm left. How much ribbon did {name} use?',
    'A man had ${a} to spend. He spent ${b}. How much money did he have left?',
  ];

  TOPICS['subtraction'] = {
    label: 'Subtraction',
    generate(level) {
      if (level === 'less') {
        const a = rand(20, 65), b = rand(5, Math.min(30, a - 5));
        const k = 'sub-l-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['subtraction'].generate(level);
        _used.add(k);
        return { topic: 'Subtraction', level, question: fill(pick(SUB_CTX_LESS), { name: pick(NAMES), a, b }), answer: String(a - b), working: a + ' − ' + b + ' = ' + (a - b) };
      }
      if (level === 'more') {
        const a = rand(80, 1000), b = rand(30, Math.min(600, a - 10));
        const k = 'sub-m-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['subtraction'].generate(level);
        _used.add(k);
        return { topic: 'Subtraction', level, question: fill(pick(SUB_CTX_MORE), { name: pick(NAMES), a: fmt(a), b: fmt(b) }), answer: fmt(a - b), working: fmt(a) + ' − ' + fmt(b) + ' = ' + fmt(a - b) };
      }
      const big = Math.random() < 0.5;
      const a = big ? rand(100000, 220000) : rand(200, 900);
      const b = big ? rand(50000, Math.min(120000, a - 1000)) : rand(100, Math.min(500, a - 10));
      const k = 'sub-M-' + a + '-' + b;
      if (_used.has(k)) return TOPICS['subtraction'].generate(level);
      _used.add(k);
      return { topic: 'Subtraction', level, question: fill(pick(SUB_CTX_MOST), { name: pick(NAMES), a: fmt(a), b: fmt(b) }), answer: fmt(a - b), working: fmt(a) + ' − ' + fmt(b) + ' = ' + fmt(a - b) };
    }
  };

  // ── MULTIPLICATION ──────────────────────────
  const MUL_CTX = [
    'There are {a} bags with {b} apples in each. How many apples altogether?',
    '{name} baked {a} trays of {b} cookies each. How many cookies in total?',
    'There are {a} teams with {b} players in each. How many players altogether?',
    '{a} children each brought {b} books to share. How many books altogether?',
    'A pack has {a} pencils. How many pencils in {b} packs?',
    '{name} has {a} boxes of pencils with {b} in each box. How many pencils in total?',
    'There are {a} rows of seats with {b} in each. How many seats altogether?',
    '{a} squads each have {b} training cones. How many cones altogether?',
    '{a} students in a group each have {b} markers. How many markers in total?',
  ];

  TOPICS['multiplication'] = {
    label: 'Multiplication',
    generate(level) {
      let a, b;
      if (level === 'less') {
        a = rand(2, 6); b = rand(2, 6);
      } else if (level === 'more') {
        a = rand(3, 10); b = rand(3, 12);
      } else {
        if (Math.random() < 0.5) {
          a = rand(6, 54); b = rand(6, 9);
        } else {
          a = rand(40, 60); b = rand(8, 10);
        }
      }
      const k = 'mul-' + level[0] + '-' + a + '-' + b;
      if (_used.has(k)) return TOPICS['multiplication'].generate(level);
      _used.add(k);
      const tpl = pick(MUL_CTX);
      return { topic: 'Multiplication', level, question: fill(tpl, { name: pick(NAMES), a, b }), answer: fmt(a * b), working: a + ' × ' + b + ' = ' + fmt(a * b) };
    }
  };

  // ── DIVISION ────────────────────────────────
  const DIV_CTX = [
    '{a} pencils are shared equally among {b} students. How many each?',
    '{a} toys are shared equally among {b} children. How many does each get?',
    '{a} harnesses are shared equally among {b} climbing groups. How many each?',
    '{a} oranges were packed into {b} crates equally. How many in each crate?',
    'Divide {a} chocolates equally among {b} children. How many does each get?',
    '{a} arrows are shared equally among {b} archery areas. How many per area?',
    '{a} lamingtons were packed into {b} boxes equally. How many per box?',
    '{a} muffins were put equally into {b} trays. How many per tray?',
    '{a} bottles were packed equally into {b} crates. How many per crate?',
    '{a} safety clips are shared equally among {b} teams. How many each?',
  ];

  TOPICS['division'] = {
    label: 'Division',
    generate(level) {
      let divisor, quotient;
      if (level === 'less') {
        divisor = rand(2, 5); quotient = rand(2, 10);
      } else if (level === 'more') {
        divisor = rand(3, 10); quotient = rand(5, 80);
      } else {
        divisor = rand(4, 12); quotient = rand(10, 300);
      }
      const dividend = divisor * quotient;
      const k = 'div-' + level[0] + '-' + dividend + '-' + divisor;
      if (_used.has(k)) return TOPICS['division'].generate(level);
      _used.add(k);
      const tpl = pick(DIV_CTX);
      return { topic: 'Division', level, question: fill(tpl, { a: fmt(dividend), b: divisor }), answer: fmt(quotient), working: fmt(dividend) + ' ÷ ' + divisor + ' = ' + fmt(quotient) };
    }
  };

  // ── PLACE VALUE ─────────────────────────────
  const PV_NAMES = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten-thousands', 100000: 'hundred-thousands' };

  TOPICS['place-value'] = {
    label: 'Place Value',
    generate(level) {
      let num, posOptions;
      if (level === 'less') {
        num = rand(10, 999);
      } else if (level === 'more') {
        num = rand(100, 9999);
      } else {
        num = rand(1000, 999999);
      }
      const digits = String(num).split('').map(Number);
      const valid = digits.map((d, i) => i).filter(i => digits[i] !== 0);
      if (valid.length === 0) return TOPICS['place-value'].generate(level);
      const pos = pick(valid);
      const d = digits[pos];
      const place = Math.pow(10, digits.length - 1 - pos);
      const value = d * place;
      const k = 'pv-' + num + '-' + pos;
      if (_used.has(k)) return TOPICS['place-value'].generate(level);
      _used.add(k);
      const pn = PV_NAMES[place] || place.toLocaleString();
      return { topic: 'Place Value', level, question: 'What is the value of the <strong>' + d + '</strong> in the number ' + fmt(num) + '?', answer: fmt(value), working: 'The ' + d + ' is in the ' + pn + ' place → value = ' + fmt(value) };
    }
  };

  // ── NUMBER PATTERNS ─────────────────────────
  TOPICS['patterns'] = {
    label: 'Number Patterns',
    generate(level) {
      let step, start, ascending;
      if (level === 'less') {
        step = pick([2, 3, 5, 10]);
        start = rand(1, 20) * step;
        ascending = Math.random() > 0.3;
      } else if (level === 'more') {
        step = pick([10, 20, 25, 50, 100]);
        start = rand(2, 30) * step;
        ascending = Math.random() > 0.4;
      } else {
        step = pick([25, 50, 100, 1000, 5000]);
        start = rand(5, 60) * (step >= 1000 ? step : 100);
        ascending = Math.random() > 0.4;
      }
      let seq, answer;
      if (ascending) {
        seq = [start, start + step, start + 2 * step, start + 3 * step];
        answer = start + 4 * step;
      } else {
        while (start - 4 * step < 0) start += step * 5;
        seq = [start, start - step, start - 2 * step, start - 3 * step];
        answer = start - 4 * step;
      }
      const k = 'pat-' + seq.join('-');
      if (_used.has(k)) return TOPICS['patterns'].generate(level);
      _used.add(k);
      const useFmt = answer >= 1000 || seq[0] >= 1000;
      const seqStr = useFmt ? seq.map(fmt).join(', ') : seq.join(', ');
      const ansStr = useFmt ? fmt(answer) : String(answer);
      const dir = ascending ? 'up' : 'down';
      const stepStr = useFmt ? fmt(step) : String(step);
      return { topic: 'Number Patterns', level, question: 'What comes next? ' + seqStr + ', ___', answer: ansStr, working: 'The pattern goes ' + dir + ' by ' + stepStr + ' each time. Answer: ' + ansStr };
    }
  };

  // ── FRACTIONS ───────────────────────────────
  const NUM_WORD = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven' };
  const DEN_WORD = { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 6: 'sixth', 8: 'eighth', 10: 'tenth' };
  const DEN_PL = { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths', 8: 'eighths', 10: 'tenths' };
  function fracWord(n, d) { return n === 1 ? 'one-' + DEN_WORD[d] : NUM_WORD[n] + '-' + DEN_PL[d]; }

  TOPICS['fractions'] = {
    label: 'Fractions',
    generate(level) {
      if (level === 'less') {
        const whole = pick([10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 36, 44, 88]);
        const ans = whole / 2;
        const k = 'frac-l-' + whole;
        if (_used.has(k)) return TOPICS['fractions'].generate(level);
        _used.add(k);
        return { topic: 'Fractions', level, question: 'What is one-half of ' + whole + '?', answer: String(ans), working: whole + ' ÷ 2 = ' + ans };
      }
      if (level === 'more') {
        const denom = pick([3, 4, 5]);
        const k2 = rand(2, 20);
        const whole = denom * k2;
        const word = fracWord(1, denom);
        const ans = k2;
        const k = 'frac-m-' + denom + '-' + whole;
        if (_used.has(k)) return TOPICS['fractions'].generate(level);
        _used.add(k);
        return { topic: 'Fractions', level, question: 'What is ' + word + ' of ' + whole + '?', answer: String(ans), working: whole + ' ÷ ' + denom + ' = ' + ans };
      }
      // most: compound fractions
      const denom = pick([3, 4, 5, 8, 10]);
      const numer = rand(2, denom - 1);
      const k2 = rand(3, denom <= 5 ? 30 : 1200);
      const whole = denom * k2;
      const ans = numer * k2;
      const word = fracWord(numer, denom);
      const k = 'frac-M-' + numer + '/' + denom + '-' + whole;
      if (_used.has(k)) return TOPICS['fractions'].generate(level);
      _used.add(k);
      return { topic: 'Fractions', level, question: 'What is ' + word + ' of ' + fmt(whole) + '?', answer: fmt(ans), working: fmt(whole) + ' ÷ ' + denom + ' = ' + fmt(k2) + ', then ' + fmt(k2) + ' × ' + numer + ' = ' + fmt(ans) };
    }
  };

  // ── MASS ────────────────────────────────────
  TOPICS['mass'] = {
    label: 'Mass',
    generate(level) {
      if (level === 'less') {
        const g = rand(200, 990);
        const k = 'mass-l-' + g;
        if (_used.has(k)) return TOPICS['mass'].generate(level);
        _used.add(k);
        const heavier = g >= 1000 ? g + ' g' : '1 kg';
        const expl = g >= 1000 ? g + ' g is more than 1,000 g (1 kg)' : '1 kg = 1,000 g, which is more than ' + g + ' g';
        return { topic: 'Mass', level, question: 'Which is heavier: ' + g + ' g or 1 kg?', answer: heavier, working: expl };
      }
      if (level === 'more') {
        const a = rand(200, 800), b = rand(100, 600);
        const total = a + b;
        const k = 'mass-m-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['mass'].generate(level);
        _used.add(k);
        const ctx = pick([
          'A bag of flour weighs {a} g and a bag of sugar weighs {b} g. What is the total mass?',
          '{name} packed a lunch box weighing {a} g and a drink bottle weighing {b} g. What is the total mass?',
          'A canteen sold {a} g of lamingtons and {b} g of brownies. What was the total mass?',
          '{name} has a toy car weighing {a} g and a toy truck weighing {b} g. What is the total mass?',
        ]);
        return { topic: 'Mass', level, question: fill(ctx, { name: pick(NAMES), a, b }), answer: fmt(total) + ' g', working: a + ' g + ' + b + ' g = ' + fmt(total) + ' g' };
      }
      // most: decimal mass addition
      const a10 = rand(20, 60), b10 = rand(15, 50);
      const aKg = (a10 / 10).toFixed(1), bKg = (b10 / 10).toFixed(1);
      const sum = ((a10 + b10) / 10).toFixed(1);
      const k = 'mass-M-' + a10 + '-' + b10;
      if (_used.has(k)) return TOPICS['mass'].generate(level);
      _used.add(k);
      const items = pick([
        ['A watermelon weighs {a} kg and a rockmelon weighs {b} kg. What is their total mass?', 'kg'],
        ['A bag weighs {a} kg and a box weighs {b} kg. What is the total mass?', 'kg'],
        ['{name} sold {a} kg of lamingtons and {b} kg of brownies. What was the total mass?', 'kg'],
        ['A stall sold {a} kg of fairy floss and {b} kg of popcorn. What is the total mass?', 'kg'],
      ]);
      return { topic: 'Mass', level, question: fill(items[0], { name: pick(NAMES), a: aKg, b: bKg }), answer: sum + ' ' + items[1], working: aKg + ' + ' + bKg + ' = ' + sum + ' ' + items[1] };
    }
  };

  // ── LENGTH ──────────────────────────────────
  TOPICS['length'] = {
    label: 'Length',
    generate(level) {
      if (level === 'less') {
        const useMM = Math.random() < 0.5;
        if (useMM) {
          const mm = rand(80, 990);
          const k = 'len-l-mm-' + mm;
          if (_used.has(k)) return TOPICS['length'].generate(level);
          _used.add(k);
          const ans = mm >= 1000 ? mm + ' mm' : '1 metre';
          return { topic: 'Length', level, question: 'Which is longer: ' + mm + ' mm or 1 metre?', answer: ans, working: '1 m = 1,000 mm. ' + mm + ' mm is ' + (mm >= 1000 ? 'equal to or more' : 'less') + ' than 1,000 mm.' };
        }
        const cm = rand(80, 120);
        const k = 'len-l-cm-' + cm;
        if (_used.has(k)) return TOPICS['length'].generate(level);
        _used.add(k);
        const ans = cm >= 100 ? cm + ' cm' : '1 metre';
        return { topic: 'Length', level, question: 'Which is longer: ' + cm + ' cm or 1 metre?', answer: ans, working: '1 m = 100 cm. ' + cm + ' cm is ' + (cm >= 100 ? 'equal to or more' : 'less') + ' than 100 cm.' };
      }
      if (level === 'more') {
        const cm = rand(100, 130);
        const k = 'len-m-' + cm;
        if (_used.has(k)) return TOPICS['length'].generate(level);
        _used.add(k);
        const m = (cm / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
        return { topic: 'Length', level, question: 'A table is ' + cm + ' cm long. How long is it in metres?', answer: m + ' m', working: cm + ' ÷ 100 = ' + m + ' m' };
      }
      // most: combined lengths
      const a = rand(10, 30), b10 = rand(150, 300);
      const bM = (b10 / 10).toFixed(1);
      const total = (a + b10 / 10).toFixed(1);
      const k = 'len-M-' + a + '-' + b10;
      if (_used.has(k)) return TOPICS['length'].generate(level);
      _used.add(k);
      return { topic: 'Length', level, question: 'Two ropes measure ' + a + ' m and ' + bM + ' m. What is their total length?', answer: total + ' m', working: a + ' + ' + bM + ' = ' + total + ' m' };
    }
  };

  // ── CHANCE ──────────────────────────────────
  const COLOURS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  TOPICS['chance'] = {
    label: 'Chance',
    generate(level) {
      if (level === 'less') {
        const sub = pick(['even', 'spinner', 'coin']);
        if (sub === 'coin') {
          const k = 'ch-l-coin';
          if (_used.has(k)) return TOPICS['chance'].generate(level);
          _used.add(k);
          return { topic: 'Chance', level, question: 'What is the chance of flipping a coin and landing on tails?', answer: 'Even chance (fifty-fifty)', working: 'A coin has 2 equally likely outcomes: heads or tails. So it is an even chance.' };
        }
        if (sub === 'even') {
          const n = rand(2, 6);
          const c1 = pick(COLOURS), c2 = pick(COLOURS.filter(c => c !== c1));
          const k = 'ch-l-even-' + n + c1 + c2;
          if (_used.has(k)) return TOPICS['chance'].generate(level);
          _used.add(k);
          return { topic: 'Chance', level, question: 'A spinner has ' + n + ' ' + c1 + ' and ' + n + ' ' + c2 + ' sections. What is the chance of landing on ' + c1 + '?', answer: 'Even chance (fifty-fifty)', working: 'There are equal numbers of ' + c1 + ' and ' + c2 + ', so the chance is even.' };
        }
        const nR = rand(1, 4), nB = rand(1, 4);
        const c1 = pick(COLOURS), c2 = pick(COLOURS.filter(c => c !== c1));
        const k = 'ch-l-sp-' + nR + '-' + nB + c1;
        if (_used.has(k)) return TOPICS['chance'].generate(level);
        _used.add(k);
        return { topic: 'Chance', level, question: 'A spinner has ' + nR + ' ' + c1 + ' and ' + nB + ' ' + c2 + ' sections. What is the chance of landing on ' + c1 + '?', answer: nR + ' out of ' + (nR + nB), working: 'There are ' + nR + ' ' + c1 + ' sections out of ' + (nR + nB) + ' total.' };
      }
      if (level === 'more') {
        const sub = pick(['die', 'impossible', 'spinner']);
        if (sub === 'die') {
          const target = rand(1, 6);
          const k = 'ch-m-die-' + target;
          if (_used.has(k)) return TOPICS['chance'].generate(level);
          _used.add(k);
          return { topic: 'Chance', level, question: 'What is the chance of rolling a ' + target + ' on a 6-sided die?', answer: '1 in 6', working: '1 face shows ' + target + ' out of 6 faces. Chance = 1 in 6.' };
        }
        if (sub === 'impossible') {
          const n = rand(7, 12);
          const k = 'ch-m-imp-' + n;
          if (_used.has(k)) return TOPICS['chance'].generate(level);
          _used.add(k);
          return { topic: 'Chance', level, question: 'What is the chance of rolling a ' + n + ' on a 6-sided die?', answer: 'Impossible', working: 'A standard die only shows 1 to 6. Rolling ' + n + ' is impossible.' };
        }
        const sections = rand(3, 8);
        const k = 'ch-m-sp-' + sections;
        if (_used.has(k)) return TOPICS['chance'].generate(level);
        _used.add(k);
        return { topic: 'Chance', level, question: 'A spinner has ' + sections + ' equal sections. What is the chance of landing on any one section?', answer: '1 in ' + sections, working: 'Each section is equally likely. Chance = 1 in ' + sections + '.' };
      }
      // most: probability from bags
      const c1 = pick(COLOURS), c2 = pick(COLOURS.filter(c => c !== c1));
      const a = rand(2, 8), b = rand(1, 9);
      const total = a + b;
      const k = 'ch-M-' + a + c1 + '-' + b + c2;
      if (_used.has(k)) return TOPICS['chance'].generate(level);
      _used.add(k);
      return { topic: 'Chance', level, question: 'What is the chance of picking a ' + c1 + ' marble from a bag of ' + a + ' ' + c1 + ' and ' + b + ' ' + c2 + ' marbles?', answer: a + ' in ' + total, working: 'There are ' + a + ' ' + c1 + ' out of ' + total + ' marbles. Chance = ' + a + ' in ' + total + '.' };
    }
  };

  // ── DATA ────────────────────────────────────
  const SURVEY_TOPICS = [
    { items: ['dogs', 'cats', 'rabbits'], label: 'favourite pets' },
    { items: ['soccer', 'netball', 'basketball'], label: 'favourite sports' },
    { items: ['apples', 'bananas', 'oranges'], label: 'favourite fruits' },
    { items: ['reading', 'craft', 'sport'], label: 'favourite hobbies' },
  ];
  const GRAPH_TYPES = ['column graph', 'bar graph', 'dot plot', 'pictograph'];

  TOPICS['data'] = {
    label: 'Data',
    generate(level) {
      if (level === 'less') {
        const sub = pick(['graph-type', 'tally']);
        if (sub === 'graph-type') {
          const surv = pick(SURVEY_TOPICS);
          const k = 'data-l-gt-' + surv.label;
          if (_used.has(k)) return TOPICS['data'].generate(level);
          _used.add(k);
          return { topic: 'Data', level, question: 'What would be a good graph to show ' + surv.label + ' of students?', answer: pick(GRAPH_TYPES), working: 'A ' + pick(GRAPH_TYPES) + ' works well for showing categories.' };
        }
        const k = 'data-l-tally-' + Math.random().toString(36).slice(2, 6);
        _used.add(k);
        return { topic: 'Data', level, question: 'When collecting data for a graph, how many tally marks do we collect in each bundle?', answer: '5', working: 'We group tallies in bundles of 5 (four vertical lines with one diagonal line crossing them).' };
      }
      if (level === 'more') {
        const surv = pick(SURVEY_TOPICS);
        const vals = surv.items.map(() => rand(8, 30));
        const maxI = vals.indexOf(Math.max(...vals));
        const minI = vals.indexOf(Math.min(...vals));
        const diff = vals[maxI] - vals[minI];
        const k = 'data-m-' + vals.join('-');
        if (_used.has(k)) return TOPICS['data'].generate(level);
        _used.add(k);
        return { topic: 'Data', level, question: 'A column graph shows ' + surv.label + ': ' + surv.items.map((it, i) => it + ' – ' + vals[i]).join(', ') + '. How many more votes were there for ' + surv.items[maxI] + ' than ' + surv.items[minI] + '?', answer: String(diff), working: vals[maxI] + ' − ' + vals[minI] + ' = ' + diff };
      }
      // most: totalling survey results
      const surv = pick(SURVEY_TOPICS);
      const vals = surv.items.map(() => rand(10, 35));
      const total = vals.reduce((s, v) => s + v, 0);
      const k = 'data-M-' + vals.join('-');
      if (_used.has(k)) return TOPICS['data'].generate(level);
      _used.add(k);
      const parts = surv.items.map((it, i) => vals[i] + ' like ' + it).join(', ');
      return { topic: 'Data', level, question: 'A survey shows ' + parts + '. How many students were surveyed?', answer: String(total), working: vals.join(' + ') + ' = ' + total };
    }
  };

  // ── ANGLES ──────────────────────────────────
  const ANGLE_TYPES = [
    { name: 'right angle', desc: 'exactly 90°', range: [90, 90] },
    { name: 'acute angle', desc: 'less than 90°', range: [10, 89] },
    { name: 'obtuse angle', desc: 'between 90° and 180°', range: [91, 179] },
    { name: 'reflex angle', desc: 'greater than 180°', range: [181, 350] },
    { name: 'full revolution', desc: 'exactly 360°', range: [360, 360] },
  ];

  TOPICS['angles'] = {
    label: 'Angles',
    generate(level) {
      if (level === 'less') {
        const k = 'ang-l-right-' + Math.random().toString(36).slice(2, 5);
        _used.add(k);
        return { topic: 'Angles', level, question: 'What is the name of an angle that is exactly 90°?', answer: 'Right angle', working: 'An angle of exactly 90° is called a right angle.' };
      }
      if (level === 'more') {
        const type = pick([ANGLE_TYPES[1], ANGLE_TYPES[2]]);
        const k = 'ang-m-' + type.name;
        if (_used.has(k)) return TOPICS['angles'].generate(level);
        _used.add(k);
        return { topic: 'Angles', level, question: 'What type of angle is ' + type.desc + '?', answer: type.name.charAt(0).toUpperCase() + type.name.slice(1), working: 'An angle ' + type.desc + ' is called a' + (type.name[0] === 'a' ? 'n ' : ' ') + type.name + '.' };
      }
      const type = pick([ANGLE_TYPES[2], ANGLE_TYPES[3], ANGLE_TYPES[4]]);
      const k = 'ang-M-' + type.name;
      if (_used.has(k)) return TOPICS['angles'].generate(level);
      _used.add(k);
      return { topic: 'Angles', level, question: 'What type of angle is ' + type.desc + '?', answer: type.name.charAt(0).toUpperCase() + type.name.slice(1), working: 'An angle ' + type.desc + ' is called a' + (type.name[0] === 'a' ? 'n ' : ' ') + type.name + '.' };
    }
  };

  // ── TIME ────────────────────────────────────
  const TIME_WORDS = {
    0: "o'clock", 5: 'five past', 10: 'ten past', 15: 'quarter past',
    20: 'twenty past', 25: 'twenty-five past', 30: 'half past',
    35: 'twenty-five to', 40: 'twenty to', 45: 'quarter to',
    50: 'ten to', 55: 'five to'
  };
  function timeWordStr(h, m) {
    const m5 = Math.round(m / 5) * 5;
    let hDisplay = h > 12 ? h - 12 : h === 0 ? 12 : h;
    if (m5 >= 35) hDisplay = (hDisplay % 12) + 1;
    const phrase = TIME_WORDS[m5] || m + ' minutes past';
    return phrase + ' ' + hDisplay;
  }

  TOPICS['time'] = {
    label: 'Time',
    generate(level) {
      if (level === 'less') {
        const h = rand(1, 12);
        const m = pick([0, 15, 30, 45]);
        const k = 'time-l-' + h + '-' + m;
        if (_used.has(k)) return TOPICS['time'].generate(level);
        _used.add(k);
        const answer = timeWordStr(h, m);
        return { topic: 'Time', level, question: 'A clock shows ' + h + ':' + String(m).padStart(2, '0') + '. Write this time in words.', answer: answer.charAt(0).toUpperCase() + answer.slice(1), working: h + ':' + String(m).padStart(2, '0') + ' in words is ' + answer };
      }
      if (level === 'more') {
        const h = rand(1, 12);
        const m = pick([5, 10, 20, 25, 35, 40, 50, 55]);
        const k = 'time-m-' + h + '-' + m;
        if (_used.has(k)) return TOPICS['time'].generate(level);
        _used.add(k);
        const answer = timeWordStr(h, m);
        return { topic: 'Time', level, question: 'Write the time ' + h + ':' + String(m).padStart(2, '0') + ' in analog time in words.', answer: answer.charAt(0).toUpperCase() + answer.slice(1), working: h + ':' + String(m).padStart(2, '0') + ' in words is ' + answer };
      }
      // most: 24-hour to 12-hour conversion
      const h24 = rand(13, 23);
      const m = rand(0, 11) * 5;
      const h12 = h24 - 12;
      const timeStr = h24 + ':' + String(m).padStart(2, '0');
      const answer = h12 + ':' + String(m).padStart(2, '0') + ' pm';
      const k = 'time-M-' + h24 + '-' + m;
      if (_used.has(k)) return TOPICS['time'].generate(level);
      _used.add(k);
      return { topic: 'Time', level, question: 'A clock shows ' + timeStr + '. Write this in 12-hour time.', answer, working: h24 + ' − 12 = ' + h12 + ', so the time is ' + answer };
    }
  };

  // ── ESTIMATION ──────────────────────────────
  TOPICS['estimation'] = {
    label: 'Estimation',
    generate(level) {
      if (level === 'less') {
        const a = rand(15, 50), b = rand(15, 50);
        const k = 'est-l-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['estimation'].generate(level);
        _used.add(k);
        const rounded = Math.round(a / 10) * 10 + Math.round(b / 10) * 10;
        return { topic: 'Estimation', level, question: 'Estimate the total of ' + a + ' and ' + b + '.', answer: 'About ' + rounded + ' (exact: ' + (a + b) + ')', working: a + ' ≈ ' + Math.round(a / 10) * 10 + ', ' + b + ' ≈ ' + Math.round(b / 10) * 10 + '. Estimate = ' + rounded };
      }
      if (level === 'more') {
        const a = rand(50, 200), b = rand(50, 200);
        const k = 'est-m-' + a + '-' + b;
        if (_used.has(k)) return TOPICS['estimation'].generate(level);
        _used.add(k);
        const rounded = Math.round(a / 10) * 10 + Math.round(b / 10) * 10;
        return { topic: 'Estimation', level, question: 'Estimate the total of ' + a + ' and ' + b + '.', answer: 'About ' + rounded + ' (exact: ' + (a + b) + ')', working: a + ' ≈ ' + Math.round(a / 10) * 10 + ', ' + b + ' ≈ ' + Math.round(b / 10) * 10 + '. Estimate = ' + rounded };
      }
      const a = rand(200, 900), b = rand(100, 500);
      const k = 'est-M-' + a + '-' + b;
      if (_used.has(k)) return TOPICS['estimation'].generate(level);
      _used.add(k);
      const rounded = Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
      return { topic: 'Estimation', level, question: 'Estimate the total of ' + a + ' and ' + b + ' to the nearest hundred.', answer: 'About ' + rounded + ' (exact: ' + (a + b) + ')', working: a + ' ≈ ' + Math.round(a / 100) * 100 + ', ' + b + ' ≈ ' + Math.round(b / 100) * 100 + '. Estimate = ' + rounded };
    }
  };

  // ── GEOMETRY / 3D SHAPES ────────────────────
  const SHAPES_3D = [
    { name: 'cube', faces: 6, vertices: 8, edges: 12 },
    { name: 'rectangular prism', faces: 6, vertices: 8, edges: 12 },
    { name: 'triangular prism', faces: 5, vertices: 6, edges: 9 },
    { name: 'square pyramid', faces: 5, vertices: 5, edges: 8 },
    { name: 'cylinder', faces: 3, vertices: 0, edges: 2 },
    { name: 'cone', faces: 2, vertices: 1, edges: 1 },
  ];

  TOPICS['geometry'] = {
    label: 'Geometry',
    generate(level) {
      if (level === 'less') {
        const s = pick(SHAPES_3D.slice(0, 4));
        const k = 'geo-l-' + s.name;
        if (_used.has(k)) return TOPICS['geometry'].generate(level);
        _used.add(k);
        return { topic: 'Geometry', level, question: 'I am a 3D shape with ' + s.faces + ' faces' + (s.vertices > 0 ? ', ' + s.vertices + ' vertices, and ' + s.edges + ' edges' : '') + '. What shape am I?', answer: s.name.charAt(0).toUpperCase() + s.name.slice(1), working: 'A ' + s.name + ' has ' + s.faces + ' faces, ' + s.vertices + ' vertices, and ' + s.edges + ' edges.' };
      }
      if (level === 'more') {
        const s = pick(SHAPES_3D);
        const k = 'geo-m-' + s.name;
        if (_used.has(k)) return TOPICS['geometry'].generate(level);
        _used.add(k);
        return { topic: 'Geometry', level, question: 'How many faces does a ' + s.name + ' have?', answer: String(s.faces), working: 'A ' + s.name + ' has ' + s.faces + ' faces.' };
      }
      // most: is it a prism or pyramid?
      const s = pick(SHAPES_3D);
      const isPrism = s.name.includes('prism') || s.name === 'cube' || s.name === 'cylinder';
      const k = 'geo-M-' + s.name;
      if (_used.has(k)) return TOPICS['geometry'].generate(level);
      _used.add(k);
      return { topic: 'Geometry', level, question: 'Is a ' + s.name + ' a prism or a pyramid (or neither)?', answer: isPrism ? 'Prism' : (s.name.includes('pyramid') ? 'Pyramid' : 'Neither (it is a ' + s.name + ')'), working: 'A ' + s.name + ' is classified as a ' + (isPrism ? 'prism' : s.name.includes('pyramid') ? 'pyramid' : s.name) + '.' };
    }
  };

  // ── MONEY ───────────────────────────────────
  TOPICS['money'] = {
    label: 'Money',
    generate(level) {
      if (level === 'less') {
        const price = rand(2, 8);
        const paid = pick([5, 10, 20]);
        if (paid <= price) return TOPICS['money'].generate(level);
        const change = paid - price;
        const k = 'mon-l-' + price + '-' + paid;
        if (_used.has(k)) return TOPICS['money'].generate(level);
        _used.add(k);
        return { topic: 'Money', level, question: 'A pack of cards costs $' + price + '. How much change from $' + paid + '?', answer: '$' + change, working: '$' + paid + ' − $' + price + ' = $' + change };
      }
      if (level === 'more') {
        const n = rand(2, 5);
        const cost = rand(3, 15);
        const paid = pick([20, 50]);
        const total = n * cost;
        if (total >= paid) return TOPICS['money'].generate(level);
        const change = paid - total;
        const k = 'mon-m-' + n + '-' + cost + '-' + paid;
        if (_used.has(k)) return TOPICS['money'].generate(level);
        _used.add(k);
        return { topic: 'Money', level, question: '{name} bought ' + n + ' items at $' + cost + ' each. How much change from $' + paid + '?'.replace('{name}', pick(NAMES)), answer: '$' + change, working: n + ' × $' + cost + ' = $' + total + '. $' + paid + ' − $' + total + ' = $' + change };
      }
      // most: adding costs
      const a = rand(50, 900), b = rand(20, 300);
      const k = 'mon-M-' + a + '-' + b;
      if (_used.has(k)) return TOPICS['money'].generate(level);
      _used.add(k);
      const items = pick([
        ['An iPad costs ${a}. A small desk costs ${b}. What is the total cost?'],
        ['A blazer costs ${a}. A school hat costs ${b}. What is the total cost?'],
        ['A pair of shoes costs ${a}. A bag costs ${b}. What is the total cost?'],
        ['A rare book costs ${a}. A pen costs ${b}. What is the total cost?'],
      ]);
      return { topic: 'Money', level, question: fill(items[0], { a: fmt(a), b: fmt(b) }), answer: '$' + fmt(a + b), working: '$' + fmt(a) + ' + $' + fmt(b) + ' = $' + fmt(a + b) };
    }
  };

  // ════════════════════════════════════════════
  // PUBLIC API
  // ════════════════════════════════════════════
  const ALL_TOPICS = Object.keys(TOPICS);

  function generateQuestion(topicKey, level) {
    const gen = TOPICS[topicKey];
    if (!gen) return null;
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        const q = gen.generate(level);
        if (q) return q;
      } catch (e) { /* retry */ }
    }
    return null;
  }

  function generateSet(topicKeys, level, count) {
    const questions = [];
    const available = topicKeys.length > 0 ? topicKeys : ALL_TOPICS;
    for (let i = 0; i < count; i++) {
      const topic = available[i % available.length];
      const q = generateQuestion(topic, level);
      if (q) questions.push(q);
    }
    if (questions.length < count) {
      for (let i = questions.length; i < count; i++) {
        const topic = pick(available);
        const q = generateQuestion(topic, level);
        if (q) questions.push(q);
      }
    }
    return questions;
  }

  function generateMixed(topicKeys, count) {
    const questions = [];
    const available = topicKeys.length > 0 ? topicKeys : ALL_TOPICS;
    const levels = ['less', 'more', 'most'];
    for (let i = 0; i < count; i++) {
      const topic = available[i % available.length];
      const level = levels[i % 3];
      const q = generateQuestion(topic, level);
      if (q) questions.push(q);
    }
    return questions;
  }

  function resetSession() { _used.clear(); }

  function getTopics() {
    return ALL_TOPICS.map(k => ({ key: k, label: TOPICS[k].label }));
  }

  return { generateQuestion, generateSet, generateMixed, resetSession, getTopics, ALL_TOPICS };
})();

if (typeof window !== 'undefined') window.Year3Generator = Year3Generator;
