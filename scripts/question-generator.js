/**
 * Daily Ten — Procedural Question Generator
 * Year 1–7 NSW NESA Curriculum Spectrum
 *
 * Difficulty scale: 1–20
 *   1-3  → Year 1       9-11  → Year 4       18-20 → Year 7
 *   4-5  → Year 2       12-14 → Year 5
 *   6-8  → Year 3       15-17 → Year 6
 *
 * Exports: QuestionGenerator.generateQuestion(topic, difficulty)
 *          QuestionGenerator.resetSession()
 *          QuestionGenerator.getAvailableTopics()
 *          QuestionGenerator.selfTest()
 */
const QuestionGenerator = (function () {
  'use strict';

  // ════════════════════════════════════════════
  // NUMERIC DIFFICULTY SCALE (1–20)
  // ════════════════════════════════════════════
  const DIFFICULTY_MIN = 1;
  const DIFFICULTY_MAX = 20;
  function clampDifficulty(d) {
    const n = Math.round(Number(d));
    return Math.max(DIFFICULTY_MIN, Math.min(DIFFICULTY_MAX, isNaN(n) ? 8 : n));
  }
  function levelToDefaultNumeric(level) {
    if (level === 'less') return 5;
    if (level === 'more') return 8;
    if (level === 'most') return 12;
    return 8;
  }

  // ════════════════════════════════════════════
  // UTILITIES
  // ════════════════════════════════════════════
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmt = (n) => Number(n).toLocaleString();

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }

  function simplifyFraction(n, d) {
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  }

  function fillTemplate(template, values) {
    let t = template;
    for (const [k, v] of Object.entries(values)) {
      t = t.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
    }
    return t;
  }

  // ════════════════════════════════════════════
  // NAME & CONTEXT POOLS
  // ════════════════════════════════════════════
  const NAMES = [
    'Jack', 'Mia', 'Liam', 'Chloe', 'Noah', 'Isla', 'Ethan', 'Ava',
    'Oliver', 'Ruby', 'Matilda', 'Leo', 'Harper', 'Kai', 'Zara'
  ];

  // ── Addition contexts ───────────────────────
  const CTX_ADD_LESS = [
    '{name} collected {a} shells and found {b} more. How many shells altogether?',
    '{name} scored {a} points in the first round and {b} in the second. How many points in total?',
    '{name} read {a} pages on Monday and {b} pages on Tuesday. How many pages altogether?',
    '{name} picked {a} strawberries and {b} blueberries. How many berries in total?',
    'There are {a} students in Room 1 and {b} in Room 2. How many students altogether?',
    '{name} counted {a} birds in the morning and {b} in the afternoon. How many birds altogether?',
    '{name} has {a} marbles and wins {b} more. How many marbles now?',
    'A farm has {a} sheep and {b} goats. How many animals in total?',
    '{name} walked {a} steps before lunch and {b} steps after. How many steps altogether?',
    '{name} made {a} cupcakes and {b} muffins. How many baked goods altogether?',
  ];
  const CTX_ADD_MORE = [
    'A cricket team scored {a} runs in the first innings and {b} in the second. How many runs altogether?',
    '{name} cycled {a} metres on Saturday and {b} metres on Sunday. How far altogether?',
    'A school collected {a} cans in Week 1 and {b} in Week 2. How many cans in total?',
    '{name} counted {a} spectators in one stand and {b} in another. How many spectators altogether?',
    'A bus carried {a} passengers in the morning and {b} in the afternoon. How many passengers in total?',
    '{name} read a book with {a} pages and another with {b} pages. How many pages in total?',
    'A library has {a} fiction books and {b} non-fiction books. How many books altogether?',
    'A relay team ran {a} metres, then {b} metres. How far did they run in total?',
    '{name} earned {a} points on Monday and {b} on Tuesday. What is the total?',
    'A bakery sold {a} pies in the morning and {b} in the afternoon. How many pies altogether?',
  ];
  const CTX_ADD_MOST = [
    'Two concerts drew crowds of {a} and {b}. What was the total attendance?',
    'A charity raised {a} dollars in Term 1 and {b} dollars in Term 2. How much was raised altogether?',
    'Stadium A holds {a} people and Stadium B holds {b}. How many seats in total?',
    'A city had {a} visitors in January and {b} in February. How many visitors altogether?',
    '{name}\'s school raised {a} dollars and {name}\'s friend\'s school raised {b} dollars. What is the combined total?',
    'A factory produced {a} items last month and {b} this month. How many items in total?',
    '{a} people attended a sports carnival and {b} attended a music festival. How many people went to events altogether?',
    'A dam held {a} megalitres and received {b} more megalitres of rain. How much water is in the dam now?',
  ];
  const CTX_DECIMAL_ADD = [
    '{name} bought a drink for ${a} and a sandwich for ${b}. How much did {name} spend altogether?',
    'A plank is {a} metres long. Another is {b} metres long. What is the total length?',
    '{name} ran {a} km on Saturday and {b} km on Sunday. How far did {name} run altogether?',
    'Two parcels weigh {a} kg and {b} kg. What is the total mass?',
  ];

  // ── Subtraction contexts ────────────────────
  const CTX_SUB_LESS = [
    'There were {a} birds on a fence. {b} flew away. How many are left?',
    '{name} had {a} stickers and gave {b} to a friend. How many stickers are left?',
    'A jar had {a} lollies. {name} ate {b}. How many remain?',
    '{name} had {a} crayons and lost {b}. How many are left?',
    'There were {a} books on the shelf. {b} were borrowed. How many are left?',
    '{name} baked {a} biscuits. The family ate {b}. How many are left?',
    'A pond had {a} ducks. {b} swam away. How many remain?',
    '{name} had {a} cards and traded away {b}. How many does {name} have now?',
    'There were {a} apples in a basket. {b} were eaten. How many are left?',
    '{name} saved {a} stickers and used {b} for a project. How many remain?',
  ];
  const CTX_SUB_MORE = [
    'A library had {a} books. {b} were loaned out. How many remain?',
    '{name} had {a} points and lost {b}. How many points are left?',
    'A school had {a} students. {b} went home early. How many are still at school?',
    '{name} raised {a} dollars for charity and spent {b} dollars on supplies. How much is left?',
    'A sports club had {a} members. {b} did not renew. How many members remain?',
    'A train had {a} passengers. {b} got off at the next stop. How many are still on the train?',
    '{name} collected {a} bottle caps and gave {b} to a friend. How many are left?',
    'A farm had {a} chickens. {b} were sold. How many chickens remain?',
    'A pool had {a} litres of water. {b} litres evaporated. How many litres are left?',
    '{name} had {a} beads and used {b} to make a necklace. How many beads remain?',
  ];
  const CTX_SUB_MOST = [
    'A warehouse stored {a} containers. {b} were shipped. How many remained?',
    'A festival sold {a} tickets. {b} people asked for refunds. How many tickets stayed sold?',
    'A city had a population of {a}. Then {b} people moved away. What is the population now?',
    '{a} trees were planted in a forest. After a storm, {b} were lost. How many trees remain?',
    'A factory had {a} items in stock. {b} were sold. How many are left?',
    'An arena had {a} seats. {b} were removed for renovation. How many seats remain?',
    'A reservoir held {a} megalitres. {b} megalitres were used. How much water is left?',
    '{a} books were printed. {b} were distributed. How many books remain in the warehouse?',
  ];
  const CTX_DECIMAL_SUB = [
    '{name} had ${a} and spent ${b}. How much money is left?',
    'A rope was {a} metres long. {name} cut off {b} metres. How long is the remaining piece?',
    '{name} had {a} litres of juice and poured out {b} litres. How much is left?',
    'A bag of flour weighed {a} kg. {name} used {b} kg. How much flour remains?',
  ];

  // ── Multiplication contexts ─────────────────
  const CTX_MUL_LESS = [
    'There are {a} bags with {b} apples in each. How many apples altogether?',
    '{name} has {a} boxes of pencils with {b} in each box. How many pencils in total?',
    'There are {a} rows of chairs with {b} in each row. How many chairs altogether?',
    '{name} baked {a} trays of {b} cookies each. How many cookies in total?',
    'There are {a} teams with {b} players in each. How many players altogether?',
    '{name} planted {a} rows of flowers with {b} in each row. How many flowers in total?',
    'There are {a} packs of cards with {b} cards in each. How many cards altogether?',
    '{name} made {a} necklaces using {b} beads on each. How many beads were used?',
    'There are {a} shelves with {b} books on each. How many books altogether?',
    '{name} set up {a} tables with {b} plates on each. How many plates in total?',
  ];
  const CTX_MUL_MORE = [
    'There are {a} rows of seats with {b} in each row. How many seats altogether?',
    '{name} bought {a} packs of stickers with {b} stickers in each. How many stickers in total?',
    'A car park has {a} rows with {b} spaces in each. How many parking spaces?',
    '{name} collected {a} bags of marbles with {b} in each bag. How many marbles altogether?',
    'There are {a} classrooms with {b} desks in each. How many desks in total?',
    '{name} arranged {a} groups of {b} cupcakes for a party. How many cupcakes altogether?',
    'A train has {a} carriages with {b} seats in each. How many seats in total?',
    '{name} did {a} sets of {b} star jumps. How many star jumps altogether?',
    'There are {a} baskets with {b} oranges in each. How many oranges in total?',
    'A garden has {a} rows with {b} plants in each. How many plants altogether?',
  ];
  const CTX_MUL_MOST = [
    'A factory produces {b} items per day. How many items in {a} days?',
    '{name}\'s school ordered {a} boxes with {b} exercise books in each. How many books altogether?',
    'A theatre has {a} rows with {b} seats in each row. How many seats in total?',
    '{a} buses each carry {b} passengers. How many passengers altogether?',
    'There are {a} crates with {b} bottles in each. How many bottles in total?',
    '{name} counted {a} pages, each with {b} words. How many words in total?',
    'A warehouse stores {a} pallets with {b} boxes on each. How many boxes altogether?',
    'A farm has {a} paddocks, each with {b} animals. How many animals in total?',
  ];

  // ── Division contexts ───────────────────────
  const CTX_DIV_LESS = [
    '{a} pencils are shared equally among {b} students. How many does each student get?',
    '{name} has {a} stickers to share equally between {b} friends. How many stickers each?',
    '{a} lollies are put into {b} bags equally. How many lollies in each bag?',
    '{name} divides {a} marbles equally into {b} groups. How many in each group?',
    '{a} biscuits are shared equally among {b} children. How many biscuits each?',
    'There are {a} apples to share equally between {b} baskets. How many in each basket?',
    '{name} puts {a} cards equally into {b} piles. How many cards in each pile?',
    '{a} crayons are sorted equally into {b} cups. How many crayons per cup?',
    '{name} shares {a} grapes equally among {b} friends. How many grapes does each friend get?',
    '{a} books are placed equally on {b} shelves. How many books on each shelf?',
  ];
  const CTX_DIV_MORE = [
    '{a} students travel in {b} equal groups. How many per group?',
    '{name} has {a} seeds to plant equally in {b} pots. How many seeds per pot?',
    '{a} oranges are packed into {b} boxes equally. How many in each box?',
    'A school has {a} students split equally into {b} classes. How many per class?',
    '{a} muffins are shared equally between {b} plates. How many on each plate?',
    '{name} divides {a} beads equally into {b} jars. How many beads per jar?',
    '{a} tickets are split equally among {b} groups. How many tickets per group?',
    'A baker puts {a} bread rolls equally into {b} trays. How many per tray?',
    '{a} water bottles are placed equally in {b} crates. How many per crate?',
    '{name} has {a} stickers and puts them equally into {b} albums. How many per album?',
  ];
  const CTX_DIV_MOST = [
    'A hall has {a} seats in {b} equal sections. How many seats per section?',
    '{a} books are stored equally on {b} shelves. How many per shelf?',
    'A factory packs {a} items equally into {b} cartons. How many items per carton?',
    '{name} shares {a} points equally among {b} team members. How many each?',
    '{a} litres of water are poured equally into {b} tanks. How many litres per tank?',
    'A school distributes {a} pencils equally to {b} classrooms. How many per classroom?',
    '{a} passengers are seated equally across {b} carriages. How many per carriage?',
    'A charity splits {a} donations equally among {b} causes. How many per cause?',
  ];

  // ── Fraction helpers ────────────────────────
  const DENOM_WORD = { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 6: 'sixth', 8: 'eighth', 10: 'tenth' };
  const DENOM_PLURAL = { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths', 8: 'eighths', 10: 'tenths' };
  const NUM_WORD = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' };

  function fractionWord(n, d) {
    if (n === 1) return 'one-' + DENOM_WORD[d];
    return NUM_WORD[n] + '-' + DENOM_PLURAL[d];
  }

  const CTX_FRAC_MOST = [
    '{name} had {whole} stickers and gave {frac} of them away. How many did {name} give away?',
    'A farmer sold {frac} of his {whole} apples. How many apples were sold?',
    '{name} read {frac} of a {whole}-page book. How many pages did {name} read?',
    'A shop sold {frac} of its {whole} pies. How many pies were sold?',
    '{name} used {frac} of {whole} beads to make bracelets. How many beads were used?',
    'A class ate {frac} of {whole} sandwiches. How many sandwiches were eaten?',
    '{name} spent {frac} of {whole} minutes practising piano. How many minutes was that?',
    'A garden had {whole} flowers. {frac} of them were red. How many red flowers were there?',
  ];

  // ── Mass contexts ───────────────────────────
  const CTX_MASS_LESS_ADD = [
    '{name} carried a {a} kg bag and a {b} kg box. What was the total mass?',
    'A watermelon weighs {a} kg and a pumpkin weighs {b} kg. What is the total mass?',
    '{name} bought {a} kg of potatoes and {b} kg of carrots. What is the total mass?',
    'A cat weighs {a} kg and a dog weighs {b} kg. What is their total mass?',
  ];
  const CTX_MASS_MORE = [
    'A book weighs {a} g and a pencil case weighs {b} g. What is the total mass in grams?',
    '{name} packed a lunch box weighing {a} g and a drink bottle weighing {b} g. What is the total mass?',
    'A bag of flour weighs {a} g and a bag of sugar weighs {b} g. What is the total mass in grams?',
    '{name} has a toy car weighing {a} g and a toy truck weighing {b} g. What is the total mass?',
  ];

  // ── Length contexts ─────────────────────────
  const CTX_LEN_LESS = [
    'A ribbon is {a} cm long. {name} cuts off {b} cm. How much is left?',
    '{name} has a piece of string {a} cm long and cuts {b} cm. How many cm remain?',
    'A stick is {a} cm long. {name} breaks off {b} cm. How long is the remaining piece?',
    '{name} had a rope {a} cm long and used {b} cm. How much rope is left?',
  ];

  // ── Time contexts ───────────────────────────
  const CTX_TIME_LESS = [
    '{name} spent {a} minutes reading and {b} minutes drawing. How many minutes altogether?',
    'It takes {a} minutes to walk to school and {b} minutes to walk home. How many minutes is that in total?',
    '{name} played outside for {a} minutes and inside for {b} minutes. How long did {name} play altogether?',
    'A class spent {a} minutes on maths and {b} minutes on spelling. How many minutes in total?',
    '{name} spent {a} minutes eating breakfast and {b} minutes getting dressed. How long did that take altogether?',
  ];
  const CTX_TIME_MORE = [
    'A movie lasted {h} hour{hs} and {m} minutes. How many minutes is that altogether?',
    '{name} studied for {h} hour{hs} and {m} minutes. How many minutes did {name} study?',
    'A bus trip took {h} hour{hs} and {m} minutes. How many minutes was the trip?',
    'A sports match lasted {h} hour{hs} and {m} minutes. How long was that in minutes?',
  ];

  // ── Data contexts ───────────────────────────
  const DATA_CATEGORIES = [
    { items: ['dogs', 'cats', 'fish', 'birds'], label: 'favourite pets' },
    { items: ['soccer', 'netball', 'cricket', 'swimming'], label: 'favourite sports' },
    { items: ['apples', 'bananas', 'oranges', 'grapes'], label: 'favourite fruits' },
    { items: ['pizza', 'pasta', 'tacos', 'sushi'], label: 'favourite foods' },
    { items: ['reading', 'drawing', 'sport', 'music'], label: 'favourite hobbies' },
    { items: ['red', 'blue', 'green', 'yellow'], label: 'favourite colours' },
  ];

  // ── Chance colours ──────────────────────────
  const CHANCE_COLOURS_A = ['red', 'blue', 'green', 'yellow'];
  const CHANCE_COLOURS_B = ['purple', 'orange', 'white', 'pink'];

  // ════════════════════════════════════════════
  // SESSION TRACKER
  // ════════════════════════════════════════════
  const _usedKeys = new Set();
  function _sessionKey(topic, difficulty, params) { return topic + '|' + difficulty + '|' + JSON.stringify(params); }
  function _isDuplicate(key) { return _usedKeys.has(key); }
  function _record(key) { _usedKeys.add(key); }

  // ════════════════════════════════════════════
  // PLACE-VALUE HELPERS
  // ════════════════════════════════════════════
  const PLACE_NAMES = {
    1: 'ones', 10: 'tens', 100: 'hundreds',
    1000: 'thousands', 10000: 'ten-thousands', 100000: 'hundred-thousands',
    1000000: 'millions', 10000000: 'ten-millions'
  };

  function safePlaceValueNumber(min, max) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const num = rand(min, max);
      const digits = String(num).split('').map(Number);
      const nonZero = digits.filter(d => d !== 0);
      if (new Set(nonZero).size === nonZero.length && nonZero.length >= 1) return num;
    }
    const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const numDigits = String(min).length;
    const digits = [];
    for (let i = 0; i < numDigits; i++) {
      const idx = rand(0, available.length - 1);
      digits.push(available[idx]);
      available.splice(idx, 1);
    }
    return parseInt(digits.join(''), 10);
  }

  // Helper: display level label from numeric difficulty
  function diffLabel(d) { return d <= 7 ? 'less' : d <= 14 ? 'more' : 'most'; }

  // ════════════════════════════════════════════
  // TOPIC GENERATORS (all use d = 1–20)
  // ════════════════════════════════════════════
  const TOPICS = {};

  // ──────────────────────────────────────────
  // TOPIC 1: ADDITION (d 1–20)
  // 1-3: Y1 (≤20)  4-5: Y2 (≤99)  6-8: Y3 (≤999)
  // 9-11: Y4 (≤99,999)  12-14: Y5 (≤999,999)
  // 15-16: Y6 decimal add  17: Y6 BODMAS
  // 18-20: Y7 directed numbers
  // ──────────────────────────────────────────
  TOPICS['addition'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: Directed number addition (d 18-20) ──
      if (d >= 18) {
        if (d <= 19) {
          const a = rand(-15, 10);
          const b = rand(-12, -1);
          const sum = a + b;
          const key = _sessionKey('addition', 'd' + d, { a, b });
          if (_isDuplicate(key) && retries > 0) return TOPICS['addition'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'addition', difficulty: diffLabel(d),
            question: 'Solve: ' + a + ' + (' + b + ')',
            answer: String(sum),
            explanation: a + ' + (' + b + ') = ' + sum
          };
        }
        const a = -rand(3, 15);
        const b = -rand(2, 10);
        const c = -rand(1, 8);
        const answer = a + b - c;
        const key = _sessionKey('addition', 'd' + d, { a, b, c });
        if (_isDuplicate(key) && retries > 0) return TOPICS['addition'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'addition', difficulty: diffLabel(d),
          question: 'Solve: ' + a + ' + (' + b + ') − (' + c + ')',
          answer: String(answer),
          explanation: a + ' + (' + b + ') = ' + (a + b) + ', then ' + (a + b) + ' − (' + c + ') = ' + (a + b) + ' + ' + (-c) + ' = ' + answer
        };
      }

      // ── Y6: Order of operations (d 17) ──
      if (d === 17) {
        const type = pick(['addMul', 'brackets']);
        if (type === 'addMul') {
          const a = rand(5, 30);
          const b = rand(2, 10);
          const c = rand(2, 10);
          const answer = a + b * c;
          const key = _sessionKey('addition', 'd17', { a, b, c, type });
          if (_isDuplicate(key) && retries > 0) return TOPICS['addition'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'addition', difficulty: diffLabel(d),
            question: 'Use the order of operations to solve: ' + a + ' + ' + b + ' × ' + c,
            answer: String(answer),
            explanation: 'Multiply first: ' + b + ' × ' + c + ' = ' + (b * c) + '. Then ' + a + ' + ' + (b * c) + ' = ' + answer
          };
        }
        const a = rand(10, 30);
        const b = rand(2, 8);
        const c = rand(5, 15);
        const e = rand(1, c - 1);
        const answer = a + b * (c - e);
        const key = _sessionKey('addition', 'd17', { a, b, c, e });
        if (_isDuplicate(key) && retries > 0) return TOPICS['addition'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'addition', difficulty: diffLabel(d),
          question: 'Use the order of operations to solve: ' + a + ' + ' + b + ' × (' + c + ' − ' + e + ')',
          answer: String(answer),
          explanation: 'Brackets first: ' + c + ' − ' + e + ' = ' + (c - e) + '. Then ' + b + ' × ' + (c - e) + ' = ' + (b * (c - e)) + '. Then ' + a + ' + ' + (b * (c - e)) + ' = ' + answer
        };
      }

      // ── Y6: Decimal addition (d 15-16) ──
      if (d >= 15) {
        const aW = rand(1, d >= 16 ? 25 : 9);
        const aD = d >= 16 ? rand(1, 99) : pick([25, 5, 50, 75]) * (pick([1, 1, 10]) === 10 ? 1 : 1);
        const bW = rand(1, d >= 16 ? 20 : 9);
        const bD = d >= 16 ? rand(1, 99) : pick([25, 5, 50, 75]);
        const aDec = aD < 10 ? '0' + aD : String(aD);
        const bDec = bD < 10 ? '0' + bD : String(bD);
        const a = parseFloat(aW + '.' + aDec);
        const b = parseFloat(bW + '.' + bDec);
        const sum = +(a + b).toFixed(2);
        const key = _sessionKey('addition', 'd' + d, { a, b });
        if (_isDuplicate(key) && retries > 0) return TOPICS['addition'].generateByDifficulty(d, retries - 1);
        _record(key);
        const template = pick(CTX_DECIMAL_ADD);
        const name = pick(NAMES);
        return { topic: 'addition', difficulty: diffLabel(d),
          question: fillTemplate(template, { name, a: a.toFixed(2), b: b.toFixed(2) }),
          answer: String(sum),
          explanation: a.toFixed(2) + ' + ' + b.toFixed(2) + ' = ' + sum
        };
      }

      // ── Standard whole-number addition (d 1-14) ──
      let r;
      if (d <= 1)       r = { maxSum: 10,      minA: 1,     maxA: 5,      minB: 1,    maxB: 5,     t: CTX_ADD_LESS, f: false };
      else if (d <= 2)  r = { maxSum: 15,      minA: 2,     maxA: 10,     minB: 1,    maxB: 8,     t: CTX_ADD_LESS, f: false };
      else if (d <= 3)  r = { maxSum: 20,      minA: 5,     maxA: 15,     minB: 2,    maxB: 10,    t: CTX_ADD_LESS, f: false };
      else if (d <= 4)  r = { maxSum: 50,      minA: 10,    maxA: 35,     minB: 5,    maxB: 20,    t: CTX_ADD_LESS, f: false };
      else if (d <= 5)  r = { maxSum: 99,      minA: 15,    maxA: 65,     minB: 10,   maxB: 40,    t: CTX_ADD_LESS, f: false };
      else if (d <= 6)  r = { maxSum: 200,     minA: 28,    maxA: 130,    minB: 16,   maxB: 80,    t: CTX_ADD_MORE, f: false };
      else if (d <= 7)  r = { maxSum: 999,     minA: 100,   maxA: 600,    minB: 50,   maxB: 399,   t: CTX_ADD_MORE, f: true };
      else if (d <= 8)  r = { maxSum: 999,     minA: 250,   maxA: 720,    minB: 100,  maxB: 500,   t: CTX_ADD_MORE, f: true };
      else if (d <= 9)  r = { maxSum: 9999,    minA: 1000,  maxA: 5000,   minB: 300,  maxB: 4500,  t: CTX_ADD_MOST, f: true };
      else if (d <= 10) r = { maxSum: 20000,   minA: 4000,  maxA: 15000,  minB: 2000, maxB: 10000, t: CTX_ADD_MOST, f: true };
      else if (d <= 11) r = { maxSum: 99999,   minA: 10000, maxA: 60000,  minB: 5000, maxB: 40000, t: CTX_ADD_MOST, f: true };
      else if (d <= 12) r = { maxSum: 200000,  minA: 15000, maxA: 120000, minB: 5000, maxB: 80000, t: CTX_ADD_MOST, f: true };
      else if (d <= 13) r = { maxSum: 999999,  minA: 50000, maxA: 600000, minB: 20000,maxB: 400000,t: CTX_ADD_MOST, f: true };
      else              r = { maxSum: 4999999, minA: 800000,maxA: 3500000,minB: 300000,maxB:2000000,t: CTX_ADD_MOST, f: true };

      const a = rand(r.minA, r.maxA);
      let b = rand(r.minB, Math.min(r.maxB, r.maxSum - a));
      if (b < r.minB) b = rand(r.minB, Math.max(r.minB, r.maxSum - a));
      const sum = a + b;
      const key = _sessionKey('addition', 'd' + d, { a, b });
      if (_isDuplicate(key) && retries > 0) return TOPICS['addition'].generateByDifficulty(d, retries - 1);
      _record(key);
      const template = pick(r.t);
      const name = pick(NAMES);
      return { topic: 'addition', difficulty: diffLabel(d),
        question: fillTemplate(template, { name, a: r.f ? fmt(a) : a, b: r.f ? fmt(b) : b }),
        answer: r.f ? fmt(sum) : String(sum),
        explanation: (r.f ? fmt(a) : a) + ' + ' + (r.f ? fmt(b) : b) + ' = ' + (r.f ? fmt(sum) : sum)
      };
    },
    less(retries) { return TOPICS['addition'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['addition'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['addition'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 2: SUBTRACTION (d 1–20)
  // ──────────────────────────────────────────
  TOPICS['subtraction'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: Directed number subtraction (d 18-20) ──
      if (d >= 18) {
        if (d <= 19) {
          const a = rand(-10, 10);
          const b = rand(-12, 12);
          const diff = a - b;
          const key = _sessionKey('subtraction', 'd' + d, { a, b });
          if (_isDuplicate(key) && retries > 0) return TOPICS['subtraction'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'subtraction', difficulty: diffLabel(d),
            question: 'Solve: ' + a + ' − (' + b + ')',
            answer: String(diff),
            explanation: a + ' − (' + b + ') = ' + a + (b < 0 ? ' + ' + (-b) : ' − ' + b) + ' = ' + diff
          };
        }
        const result = rand(-5, 10);
        const subtracted = -rand(5, 15);
        const me = result + subtracted;
        const key = _sessionKey('subtraction', 'd20', { me, subtracted, result });
        if (_isDuplicate(key) && retries > 0) return TOPICS['subtraction'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'subtraction', difficulty: diffLabel(d),
          question: 'I am a number. When you subtract ' + subtracted + ' from me, the result is ' + result + '. What number am I?',
          answer: String(me),
          explanation: 'me − (' + subtracted + ') = ' + result + '. So me = ' + result + ' + (' + subtracted + ') = ' + me
        };
      }

      // ── Y6: Finding starting number (d 17) ──
      if (d === 17) {
        const decreased = rand(10, 25);
        const result = rand(30, 80);
        const start = result + decreased;
        const key = _sessionKey('subtraction', 'd17', { start, decreased, result });
        if (_isDuplicate(key) && retries > 0) return TOPICS['subtraction'].generateByDifficulty(d, retries - 1);
        _record(key);
        const name = pick(NAMES);
        return { topic: 'subtraction', difficulty: diffLabel(d),
          question: 'A number is decreased by ' + decreased + ' to get ' + result + '. What was the starting number?',
          answer: String(start),
          explanation: result + ' + ' + decreased + ' = ' + start
        };
      }

      // ── Y6: Decimal subtraction (d 15-16) ──
      if (d >= 15) {
        const aW = rand(5, d >= 16 ? 30 : 12);
        const aD = d >= 16 ? rand(10, 99) : pick([25, 50, 75]);
        const bW = rand(1, Math.max(1, aW - 2));
        const bD = d >= 16 ? rand(1, 99) : pick([25, 50, 75]);
        const aDec = aD < 10 ? '0' + aD : String(aD);
        const bDec = bD < 10 ? '0' + bD : String(bD);
        const a = parseFloat(aW + '.' + aDec);
        const b = parseFloat(bW + '.' + bDec);
        if (b >= a) return TOPICS['subtraction'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const diff = +(a - b).toFixed(2);
        const key = _sessionKey('subtraction', 'd' + d, { a, b });
        if (_isDuplicate(key) && retries > 0) return TOPICS['subtraction'].generateByDifficulty(d, retries - 1);
        _record(key);
        const template = pick(CTX_DECIMAL_SUB);
        const name = pick(NAMES);
        return { topic: 'subtraction', difficulty: diffLabel(d),
          question: fillTemplate(template, { name, a: a.toFixed(2), b: b.toFixed(2) }),
          answer: String(diff),
          explanation: a.toFixed(2) + ' − ' + b.toFixed(2) + ' = ' + diff
        };
      }

      // ── Standard whole-number subtraction (d 1-14) ──
      let r;
      if (d <= 1)       r = { minA: 5,      maxA: 10,      minB: 1,     maxB: 4,     t: CTX_SUB_LESS, f: false };
      else if (d <= 2)  r = { minA: 8,      maxA: 15,      minB: 1,     maxB: 7,     t: CTX_SUB_LESS, f: false };
      else if (d <= 3)  r = { minA: 10,     maxA: 20,      minB: 2,     maxB: 10,    t: CTX_SUB_LESS, f: false };
      else if (d <= 4)  r = { minA: 20,     maxA: 50,      minB: 5,     maxB: 25,    t: CTX_SUB_LESS, f: false };
      else if (d <= 5)  r = { minA: 30,     maxA: 99,      minB: 10,    maxB: 50,    t: CTX_SUB_LESS, f: false };
      else if (d <= 6)  r = { minA: 100,    maxA: 300,     minB: 20,    maxB: 150,   t: CTX_SUB_MORE, f: false };
      else if (d <= 7)  r = { minA: 200,    maxA: 720,     minB: 50,    maxB: 400,   t: CTX_SUB_MORE, f: true };
      else if (d <= 8)  r = { minA: 400,    maxA: 999,     minB: 100,   maxB: 500,   t: CTX_SUB_MORE, f: true };
      else if (d <= 9)  r = { minA: 2000,   maxA: 9999,    minB: 500,   maxB: 5000,  t: CTX_SUB_MOST, f: true };
      else if (d <= 10) r = { minA: 8000,   maxA: 20000,   minB: 2000,  maxB: 10000, t: CTX_SUB_MOST, f: true };
      else if (d <= 11) r = { minA: 15000,  maxA: 99999,   minB: 5000,  maxB: 50000, t: CTX_SUB_MOST, f: true };
      else if (d <= 12) r = { minA: 40000,  maxA: 200000,  minB: 10000, maxB: 100000,t: CTX_SUB_MOST, f: true };
      else if (d <= 13) r = { minA: 100000, maxA: 999999,  minB: 20000, maxB: 500000,t: CTX_SUB_MOST, f: true };
      else              r = { minA: 1500000,maxA: 5500000, minB: 200000,maxB: 2000000,t: CTX_SUB_MOST, f: true };

      const a = rand(Math.max(r.minA, r.minB + 2), r.maxA);
      let b = rand(r.minB, Math.min(r.maxB, a - 1));
      if (b >= a) b = rand(r.minB, Math.max(r.minB, a - 1));
      const diff = a - b;
      const key = _sessionKey('subtraction', 'd' + d, { a, b });
      if (_isDuplicate(key) && retries > 0) return TOPICS['subtraction'].generateByDifficulty(d, retries - 1);
      _record(key);
      const template = pick(r.t);
      const name = pick(NAMES);
      return { topic: 'subtraction', difficulty: diffLabel(d),
        question: fillTemplate(template, { name, a: r.f ? fmt(a) : a, b: r.f ? fmt(b) : b }),
        answer: r.f ? fmt(diff) : String(diff),
        explanation: (r.f ? fmt(a) : a) + ' − ' + (r.f ? fmt(b) : b) + ' = ' + (r.f ? fmt(diff) : diff)
      };
    },
    less(retries) { return TOPICS['subtraction'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['subtraction'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['subtraction'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 3: MULTIPLICATION (d 1–20)
  // 1-2: Y1 groups  3-5: Y2-3 tables  6-8: Y3 ext
  // 9-11: Y4 factors/multiples  12-14: Y5 strategies
  // 15-17: Y6 rates  18-20: Y7 large
  // ──────────────────────────────────────────
  TOPICS['multiplication'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);
      let a, b, product, templates, useFmt;

      if (d <= 2) {
        const table = pick([2, 5, 10]);
        a = rand(1, 5);
        b = table;
        product = a * b;
        templates = CTX_MUL_LESS; useFmt = false;
      } else if (d <= 3) {
        b = pick([2, 3, 4, 5, 10]);
        a = rand(2, 6);
        product = a * b;
        templates = CTX_MUL_LESS; useFmt = false;
      } else if (d <= 5) {
        b = rand(2, 10);
        a = rand(2, 10);
        product = a * b;
        templates = CTX_MUL_LESS; useFmt = false;
      } else if (d <= 7) {
        b = rand(2, 12);
        a = rand(2, 12);
        product = a * b;
        templates = CTX_MUL_MORE; useFmt = false;
      } else if (d <= 8) {
        a = rand(2, 9);
        b = pick([20, 30, 40, 50, 100]);
        product = a * b;
        templates = CTX_MUL_MORE; useFmt = false;
      } else if (d <= 10) {
        b = rand(3, 12);
        a = rand(10, 50);
        product = a * b;
        templates = CTX_MUL_MORE; useFmt = true;
      } else if (d <= 12) {
        a = rand(12, 99);
        b = rand(3, 12);
        product = a * b;
        templates = CTX_MUL_MOST; useFmt = true;
      } else if (d <= 14) {
        a = rand(15, 100);
        b = pick([10, 100, 25, 50]);
        product = a * b;
        templates = CTX_MUL_MOST; useFmt = true;
      } else if (d <= 16) {
        a = rand(20, 200);
        b = rand(5, 15);
        product = a * b;
        templates = CTX_MUL_MOST; useFmt = true;
      } else if (d <= 17) {
        // Rate problem: e.g. 45 pages/min for 150 min
        const rate = rand(10, 60);
        const hours = pick([1.5, 2, 2.5, 3]);
        const mins = hours * 60;
        product = rate * mins;
        const key = _sessionKey('multiplication', 'd17', { rate, hours });
        if (_isDuplicate(key) && retries > 0) return TOPICS['multiplication'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'multiplication', difficulty: diffLabel(d),
          question: 'A printer produces ' + rate + ' pages per minute. How many pages can it print in ' + hours + ' hours?',
          answer: fmt(product),
          explanation: hours + ' hours = ' + mins + ' minutes. ' + rate + ' × ' + mins + ' = ' + fmt(product)
        };
      } else {
        a = rand(100, 999);
        b = rand(5, 25);
        product = a * b;
        templates = CTX_MUL_MOST; useFmt = true;
      }

      const key = _sessionKey('multiplication', 'd' + d, { a, b });
      if (_isDuplicate(key) && retries > 0) return TOPICS['multiplication'].generateByDifficulty(d, retries - 1);
      _record(key);
      const template = pick(templates);
      const name = pick(NAMES);
      return { topic: 'multiplication', difficulty: diffLabel(d),
        question: fillTemplate(template, { name, a, b }),
        answer: useFmt ? fmt(product) : String(product),
        explanation: a + ' × ' + b + ' = ' + (useFmt ? fmt(product) : product)
      };
    },
    less(retries) { return TOPICS['multiplication'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['multiplication'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['multiplication'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 4: DIVISION (d 1–20)
  // ──────────────────────────────────────────
  TOPICS['division'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);
      let divisor, quotient, dividend, templates, useFmt;

      if (d <= 2) {
        divisor = pick([2, 5]);
        quotient = rand(1, 5);
        templates = CTX_DIV_LESS; useFmt = false;
      } else if (d <= 3) {
        divisor = pick([2, 3, 4, 5, 10]);
        quotient = rand(2, 6);
        templates = CTX_DIV_LESS; useFmt = false;
      } else if (d <= 5) {
        divisor = rand(2, 10);
        quotient = rand(2, 10);
        templates = CTX_DIV_LESS; useFmt = false;
      } else if (d <= 7) {
        divisor = rand(2, 12);
        quotient = rand(3, 12);
        templates = CTX_DIV_MORE; useFmt = false;
      } else if (d <= 8) {
        divisor = rand(3, 12);
        quotient = rand(5, 20);
        templates = CTX_DIV_MORE; useFmt = false;
      } else if (d <= 10) {
        divisor = rand(4, 12);
        quotient = rand(10, 50);
        templates = CTX_DIV_MORE; useFmt = true;
      } else if (d <= 12) {
        divisor = rand(4, 12);
        quotient = rand(20, 100);
        templates = CTX_DIV_MOST; useFmt = true;
      } else if (d <= 14) {
        divisor = rand(5, 15);
        quotient = rand(50, 200);
        templates = CTX_DIV_MOST; useFmt = true;
      } else if (d <= 16) {
        divisor = rand(6, 20);
        quotient = rand(100, 500);
        templates = CTX_DIV_MOST; useFmt = true;
      } else if (d <= 17) {
        // Rate division: items per time
        const totalItems = rand(3, 8) * 1000;
        const hours = pick([4, 5, 6, 8, 10]);
        quotient = totalItems / hours;
        if (quotient !== Math.floor(quotient)) return TOPICS['division'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const perMinute = quotient / 60;
        if (perMinute === Math.floor(perMinute)) {
          const key = _sessionKey('division', 'd17rate', { totalItems, hours });
          if (_isDuplicate(key) && retries > 0) return TOPICS['division'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'division', difficulty: diffLabel(d),
            question: 'A factory produces ' + fmt(totalItems) + ' items in an ' + hours + '-hour shift. How many items do they produce per minute?',
            answer: String(perMinute),
            explanation: fmt(totalItems) + ' ÷ ' + hours + ' = ' + fmt(quotient) + ' per hour. ' + fmt(quotient) + ' ÷ 60 = ' + perMinute + ' per minute.'
          };
        }
        divisor = hours; dividend = totalItems;
        const key = _sessionKey('division', 'd17', { dividend: totalItems, divisor: hours });
        if (_isDuplicate(key) && retries > 0) return TOPICS['division'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'division', difficulty: diffLabel(d),
          question: 'A factory produces ' + fmt(totalItems) + ' items in ' + hours + ' hours. How many items per hour?',
          answer: fmt(quotient),
          explanation: fmt(totalItems) + ' ÷ ' + hours + ' = ' + fmt(quotient)
        };
      } else {
        divisor = rand(8, 25);
        quotient = rand(200, 1000);
        templates = CTX_DIV_MOST; useFmt = true;
      }

      dividend = quotient * divisor;
      if (quotient < 1) return TOPICS['division'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
      const key = _sessionKey('division', 'd' + d, { dividend, divisor });
      if (_isDuplicate(key) && retries > 0) return TOPICS['division'].generateByDifficulty(d, retries - 1);
      _record(key);
      const template = pick(templates);
      const name = pick(NAMES);
      return { topic: 'division', difficulty: diffLabel(d),
        question: fillTemplate(template, { name, a: useFmt ? fmt(dividend) : dividend, b: divisor }),
        answer: useFmt ? fmt(quotient) : String(quotient),
        explanation: (useFmt ? fmt(dividend) : dividend) + ' ÷ ' + divisor + ' = ' + (useFmt ? fmt(quotient) : quotient)
      };
    },
    less(retries) { return TOPICS['division'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['division'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['division'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 5: PLACE VALUE (d 1–20)
  // 1-3: Y1 (2-digit)  4-5: Y2 (3-digit)  6-8: Y3 (3-4 digit)
  // 9-11: Y4 (5-digit)  12-14: Y5 (6-digit)
  // 15-16: Y6 (millions)  17-18: Y6 negatives  19-20: Y7 negatives
  // ──────────────────────────────────────────
  TOPICS['place-value'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y6-7: Negative numbers (d 17-20) ──
      if (d >= 17) {
        if (d <= 18) {
          const start = rand(2, 10);
          const countBack = rand(start + 1, start + 12);
          const answer = start - countBack;
          const key = _sessionKey('place-value', 'd' + d, { start, countBack });
          if (_isDuplicate(key) && retries > 0) return TOPICS['place-value'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'place-value', difficulty: diffLabel(d),
            question: 'Start at ' + start + ' and count back ' + countBack + '. What number do you land on?',
            answer: String(answer),
            explanation: start + ' − ' + countBack + ' = ' + answer
          };
        }
        const nums = [];
        for (let i = 0; i < 5; i++) nums.push(rand(-15, 15));
        const unique = [...new Set(nums)];
        if (unique.length < 4) return TOPICS['place-value'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const sorted = [...unique].sort((x, y) => x - y);
        const ascending = Math.random() < 0.5;
        const key = _sessionKey('place-value', 'd' + d, { nums: unique.join(','), ascending });
        if (_isDuplicate(key) && retries > 0) return TOPICS['place-value'].generateByDifficulty(d, retries - 1);
        _record(key);
        const answer = ascending ? sorted.join(', ') : [...sorted].reverse().join(', ');
        return { topic: 'place-value', difficulty: diffLabel(d),
          question: 'Arrange these numbers in ' + (ascending ? 'ascending' : 'descending') + ' order: ' + unique.join(', '),
          answer: answer,
          explanation: (ascending ? 'Smallest to largest' : 'Largest to smallest') + ': ' + answer
        };
      }

      // ── Digit-value questions and skip-counting ──
      let numMin, numMax, steps, stepMult, useFmt;
      if (d <= 1)       { numMin = 10;      numMax = 50;       steps = [2, 5];           stepMult = 1;      useFmt = false; }
      else if (d <= 2)  { numMin = 10;      numMax = 99;       steps = [2, 5, 10];       stepMult = 1;      useFmt = false; }
      else if (d <= 3)  { numMin = 10;      numMax = 99;       steps = [5, 10];          stepMult = 1;      useFmt = false; }
      else if (d <= 4)  { numMin = 100;     numMax = 999;      steps = [10, 50, 100];    stepMult = 1;      useFmt = false; }
      else if (d <= 5)  { numMin = 100;     numMax = 999;      steps = [25, 50, 100];    stepMult = 1;      useFmt = true; }
      else if (d <= 6)  { numMin = 100;     numMax = 9999;     steps = [100, 500];       stepMult = 1;      useFmt = true; }
      else if (d <= 7)  { numMin = 1000;    numMax = 9999;     steps = [100, 500, 1000]; stepMult = 1;      useFmt = true; }
      else if (d <= 8)  { numMin = 1000;    numMax = 9999;     steps = [500, 1000, 2000];stepMult = 1;      useFmt = true; }
      else if (d <= 9)  { numMin = 10000;   numMax = 50000;    steps = [1000, 2000];     stepMult = 1;      useFmt = true; }
      else if (d <= 10) { numMin = 10000;   numMax = 99999;    steps = [1000, 5000];     stepMult = 1;      useFmt = true; }
      else if (d <= 11) { numMin = 10000;   numMax = 99999;    steps = [5000, 10000];    stepMult = 1;      useFmt = true; }
      else if (d <= 12) { numMin = 100000;  numMax = 999999;   steps = [10000, 50000];   stepMult = 1;      useFmt = true; }
      else if (d <= 13) { numMin = 100000;  numMax = 999999;   steps = [25000, 50000, 100000]; stepMult = 1; useFmt = true; }
      else if (d <= 14) { numMin = 100000;  numMax = 999999;   steps = [50000, 100000];  stepMult = 1;      useFmt = true; }
      else if (d <= 15) { numMin = 1000000; numMax = 9999999;  steps = [100000, 500000]; stepMult = 1;      useFmt = true; }
      else              { numMin = 1000000; numMax = 99999999; steps = [500000, 1000000]; stepMult = 1;      useFmt = true; }

      if (Math.random() < 0.6) {
        const num = safePlaceValueNumber(numMin, numMax);
        const digits = String(num).split('').map(Number);
        const valid = digits.map((_, i) => i).filter(i => digits[i] !== 0);
        if (valid.length === 0) return TOPICS['place-value'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const pos = pick(valid);
        const digitVal = digits[pos];
        const place = Math.pow(10, digits.length - 1 - pos);
        const value = digitVal * place;
        const key = _sessionKey('place-value', 'd' + d, { num, pos });
        if (_isDuplicate(key) && retries > 0) return TOPICS['place-value'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'place-value', difficulty: diffLabel(d),
          question: 'What is the value of the ' + digitVal + ' in the number ' + (useFmt ? fmt(num) : num) + '?',
          answer: useFmt ? fmt(value) : String(value),
          explanation: 'The ' + digitVal + ' is in the ' + PLACE_NAMES[place] + ' place, so its value is ' + (useFmt ? fmt(value) : value) + '.'
        };
      }

      const step = pick(steps);
      const start = rand(1, 30) * (stepMult || 1) + rand(0, 3) * step;
      const ascending = Math.random() > 0.4;
      let seq, answer, direction;
      if (ascending) {
        seq = [start, start + step, start + 2 * step, start + 3 * step];
        answer = start + 4 * step;
        direction = 'up';
      } else {
        let s = start + 6 * step;
        seq = [s, s - step, s - 2 * step, s - 3 * step];
        answer = s - 4 * step;
        direction = 'down';
      }
      const key = _sessionKey('place-value', 'd' + d, { start: seq[0], step, direction });
      if (_isDuplicate(key) && retries > 0) return TOPICS['place-value'].generateByDifficulty(d, retries - 1);
      _record(key);
      const seqStr = useFmt ? seq.map(fmt).join(', ') : seq.join(', ');
      const ansStr = useFmt ? fmt(answer) : String(answer);
      return { topic: 'place-value', difficulty: diffLabel(d),
        question: 'What comes next? ' + seqStr + ', ___',
        answer: ansStr,
        explanation: 'The pattern goes ' + direction + ' by ' + (useFmt ? fmt(step) : step) + ' each time. ' + (useFmt ? fmt(seq[3]) : seq[3]) + (direction === 'up' ? ' + ' : ' − ') + (useFmt ? fmt(step) : step) + ' = ' + ansStr + '.'
      };
    },
    less(retries) { return TOPICS['place-value'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['place-value'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['place-value'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 6: PATTERNS (d 1–20)
  // ──────────────────────────────────────────
  TOPICS['patterns'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: Algebraic rules (d 18-20) ──
      if (d >= 18) {
        const mult = rand(2, 6);
        const add = rand(1, 10);
        const inputs = [1, 2, 3, 4];
        const outputs = inputs.map(x => mult * x + add);
        const answer = mult * 5 + add;
        const key = _sessionKey('patterns', 'd' + d, { mult, add });
        if (_isDuplicate(key) && retries > 0) return TOPICS['patterns'].generateByDifficulty(d, retries - 1);
        _record(key);
        const pairs = inputs.map((x, i) => x + ' → ' + outputs[i]).join(', ');
        return { topic: 'patterns', difficulty: diffLabel(d),
          question: 'A rule machine gives: ' + pairs + '. What output does 5 give?',
          answer: String(answer),
          explanation: 'The rule is: multiply by ' + mult + ', then add ' + add + '. 5 × ' + mult + ' + ' + add + ' = ' + answer
        };
      }

      // ── Y6: Square numbers / powers (d 15-17) ──
      if (d >= 15) {
        if (Math.random() < 0.5) {
          const base = rand(2, 12);
          const sq = base * base;
          const key = _sessionKey('patterns', 'd' + d, { type: 'sq', base });
          if (_isDuplicate(key) && retries > 0) return TOPICS['patterns'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'patterns', difficulty: diffLabel(d),
            question: 'What is ' + base + '²?',
            answer: String(sq),
            explanation: base + '² = ' + base + ' × ' + base + ' = ' + sq
          };
        }
        const vals = [1, 4, 9, 16, 25, 36, 49];
        const idx = rand(0, vals.length - 2);
        const seq = vals.slice(idx, idx + 4);
        const answer = vals[idx + 4] || (Math.round(Math.sqrt(seq[3])) + 1) ** 2;
        const key = _sessionKey('patterns', 'd' + d, { seq: seq.join(',') });
        if (_isDuplicate(key) && retries > 0) return TOPICS['patterns'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'patterns', difficulty: diffLabel(d),
          question: 'What comes next in this pattern? ' + seq.join(', ') + ', ___',
          answer: String(answer),
          explanation: 'These are square numbers: 1², 2², 3², 4², ... The next is ' + answer + '.'
        };
      }

      // ── Standard skip-counting (d 1-14) ──
      let stepChoices, startMax, baseMult, useFmt;
      if (d <= 1)       { stepChoices = [2];                        startMax = 2;   baseMult = 1;    useFmt = false; }
      else if (d <= 2)  { stepChoices = [2, 5];                     startMax = 5;   baseMult = 1;    useFmt = false; }
      else if (d <= 3)  { stepChoices = [2, 5, 10];                 startMax = 10;  baseMult = 1;    useFmt = false; }
      else if (d <= 4)  { stepChoices = [3, 4, 5, 10];              startMax = 15;  baseMult = 1;    useFmt = false; }
      else if (d <= 5)  { stepChoices = [5, 10, 25];                startMax = 20;  baseMult = 1;    useFmt = false; }
      else if (d <= 6)  { stepChoices = [25, 50, 100];              startMax = 20;  baseMult = 1;    useFmt = true; }
      else if (d <= 7)  { stepChoices = [50, 100, 200];             startMax = 20;  baseMult = 10;   useFmt = true; }
      else if (d <= 8)  { stepChoices = [100, 250, 500];            startMax = 20;  baseMult = 100;  useFmt = true; }
      else if (d <= 9)  { stepChoices = [500, 1000, 2000];          startMax = 20;  baseMult = 1000; useFmt = true; }
      else if (d <= 10) { stepChoices = [1000, 2000, 5000];         startMax = 20;  baseMult = 1000; useFmt = true; }
      else if (d <= 11) { stepChoices = [5000, 10000];              startMax = 20;  baseMult = 10000;useFmt = true; }
      else if (d <= 12) { stepChoices = [10000, 25000, 50000];      startMax = 30;  baseMult = 10000;useFmt = true; }
      else if (d <= 13) { stepChoices = [50000, 100000];            startMax = 40;  baseMult = 10000;useFmt = true; }
      else              { stepChoices = [100000, 250000, 500000];    startMax = 60;  baseMult = 100000;useFmt = true; }

      const step = pick(stepChoices);
      const start = rand(1, startMax) * baseMult;
      const ascending = Math.random() > 0.35;
      let seq, answer, direction;
      if (ascending) {
        seq = [start, start + step, start + 2 * step, start + 3 * step];
        answer = start + 4 * step;
        direction = 'up';
      } else {
        let s = start + 6 * step;
        seq = [s, s - step, s - 2 * step, s - 3 * step];
        answer = s - 4 * step;
        direction = 'down';
      }
      const key = _sessionKey('patterns', 'd' + d, { start: seq[0], step, direction });
      if (_isDuplicate(key) && retries > 0) return TOPICS['patterns'].generateByDifficulty(d, retries - 1);
      _record(key);
      const seqStr = useFmt ? seq.map(fmt).join(', ') : seq.join(', ');
      const ansStr = useFmt ? fmt(answer) : String(answer);
      return { topic: 'patterns', difficulty: diffLabel(d),
        question: 'What comes next? ' + seqStr + ', ___',
        answer: ansStr,
        explanation: 'The pattern goes ' + direction + ' by ' + (useFmt ? fmt(step) : step) + ' each time. ' + (useFmt ? fmt(seq[3]) : seq[3]) + (direction === 'up' ? ' + ' : ' − ') + (useFmt ? fmt(step) : step) + ' = ' + ansStr + '.'
      };
    },
    less(retries) { return TOPICS['patterns'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['patterns'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['patterns'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 7: FRACTIONS (d 1–20)
  // 1-2: Y1 halves  3-4: Y2 halves/quarters  5-6: Y3 unit fractions
  // 7-8: Y3-4 non-unit  9-10: Y4 fraction↔decimal
  // 11-12: Y5 % of amount  13-14: Y5-6 discounts
  // 15-16: Y6 % increase/what %  17-18: Y7 ratios  19-20: Y7 ext
  // ──────────────────────────────────────────
  TOPICS['fractions'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // d 1-2: Y1 — half of small even numbers
      if (d <= 2) {
        const whole = rand(1, d <= 1 ? 5 : 10) * 2;
        const answer = whole / 2;
        const key = _sessionKey('fractions', 'd' + d, { whole });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'What is half of ' + whole + '?',
          answer: String(answer),
          explanation: whole + ' ÷ 2 = ' + answer
        };
      }

      // d 3-4: Y2 — halves and quarters
      if (d <= 4) {
        const denom = pick([2, 4]);
        const k = rand(2, denom === 2 ? 15 : 8);
        const whole = denom * k;
        const word = denom === 2 ? 'half' : 'one-quarter';
        const key = _sessionKey('fractions', 'd' + d, { denom, whole });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'What is ' + word + ' of ' + whole + '?',
          answer: String(k),
          explanation: whole + ' ÷ ' + denom + ' = ' + k
        };
      }

      // d 5-6: Y3 — unit fractions (1/3, 1/4, 1/5, 1/8, 1/10)
      if (d <= 6) {
        const denom = pick([3, 4, 5, 8, 10]);
        const k = rand(2, Math.floor(50 / denom));
        const whole = denom * k;
        const word = fractionWord(1, denom);
        const key = _sessionKey('fractions', 'd' + d, { denom, whole });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'What is ' + word + ' of ' + whole + '?',
          answer: String(k),
          explanation: whole + ' ÷ ' + denom + ' = ' + k
        };
      }

      // d 7-8: Y3-4 — non-unit fractions (3/8 of 40)
      if (d <= 8) {
        const denom = pick([3, 4, 5, 6, 8, 10]);
        const numer = rand(2, denom - 1);
        const k = rand(2, Math.floor(200 / denom));
        const whole = denom * k;
        const answer = numer * k;
        const word = fractionWord(numer, denom);
        const key = _sessionKey('fractions', 'd' + d, { numer, denom, whole });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        const template = pick(CTX_FRAC_MOST);
        const name = pick(NAMES);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: fillTemplate(template, { name, whole, frac: word }),
          answer: String(answer),
          explanation: whole + ' ÷ ' + denom + ' = ' + k + ', then ' + k + ' × ' + numer + ' = ' + answer
        };
      }

      // d 9-10: Y4 — fraction ↔ decimal conversion
      if (d <= 10) {
        const conversions = [
          { frac: '1/2', dec: '0.5' }, { frac: '1/4', dec: '0.25' }, { frac: '3/4', dec: '0.75' },
          { frac: '1/5', dec: '0.2' }, { frac: '2/5', dec: '0.4' }, { frac: '3/5', dec: '0.6' },
          { frac: '4/5', dec: '0.8' }, { frac: '1/10', dec: '0.1' }, { frac: '3/10', dec: '0.3' },
          { frac: '7/10', dec: '0.7' }, { frac: '9/10', dec: '0.9' },
        ];
        const pair = pick(conversions);
        const toDecimal = Math.random() < 0.5;
        const key = _sessionKey('fractions', 'd' + d, { pair: pair.frac, toDecimal });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        if (toDecimal) {
          return { topic: 'fractions', difficulty: diffLabel(d),
            question: 'Convert ' + pair.frac + ' into a decimal.',
            answer: pair.dec, explanation: pair.frac + ' = ' + pair.dec
          };
        }
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'Write ' + pair.dec + ' as a fraction.',
          answer: pair.frac, explanation: pair.dec + ' = ' + pair.frac
        };
      }

      // d 11-12: Y5 — percentage of an amount
      if (d <= 12) {
        const pct = pick([10, 20, 25, 50]);
        const baseLookup = { 10: [30, 50, 70, 80, 100, 150, 200, 350], 20: [20, 30, 50, 80, 100, 150], 25: [20, 40, 60, 80, 100, 120, 200], 50: [20, 40, 60, 80, 100, 120, 200] };
        const base = pick(baseLookup[pct]);
        const answer = base * pct / 100;
        const key = _sessionKey('fractions', 'd' + d, { pct, base });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'What is ' + pct + '% of $' + base + '?',
          answer: '$' + answer,
          explanation: pct + '% of $' + base + ' = $' + base + ' × ' + pct + '/100 = $' + answer
        };
      }

      // d 13-14: Y5-6 — fraction / percentage discount
      if (d <= 14) {
        if (Math.random() < 0.5) {
          const denom = pick([3, 4, 5]);
          const priceLookup = { 3: [30, 60, 90, 120, 150], 4: [40, 80, 120, 160], 5: [50, 100, 150, 200] };
          const price = pick(priceLookup[denom]);
          const discount = price / denom;
          const answer = price - discount;
          const key = _sessionKey('fractions', 'd' + d, { type: 'fracOff', denom, price });
          if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'fractions', difficulty: diffLabel(d),
            question: 'A $' + price + ' item is ' + fractionWord(1, denom) + ' off. What is the sale price?',
            answer: '$' + answer,
            explanation: '1/' + denom + ' of $' + price + ' = $' + discount + '. $' + price + ' − $' + discount + ' = $' + answer
          };
        }
        const pct = pick([10, 20, 25, 30, 50]);
        const baseLookup = { 10: [50, 80, 100, 120, 200], 20: [40, 50, 80, 100, 150], 25: [40, 60, 80, 100, 200], 30: [50, 100, 150, 200], 50: [30, 50, 60, 80, 100] };
        const price = pick(baseLookup[pct]);
        const discount = price * pct / 100;
        const answer = price - discount;
        const key = _sessionKey('fractions', 'd' + d, { type: 'pctOff', pct, price });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'A $' + price + ' item is ' + pct + '% off. What is the sale price?',
          answer: '$' + answer,
          explanation: pct + '% of $' + price + ' = $' + discount + '. $' + price + ' − $' + discount + ' = $' + answer
        };
      }

      // d 15-16: Y6 — what percentage / increase by %
      if (d <= 16) {
        if (Math.random() < 0.5) {
          const total = pick([20, 25, 40, 50, 100, 200]);
          const partOptions = [];
          for (let p = 1; p < total; p++) { if ((p / total * 100) === Math.floor(p / total * 100)) partOptions.push(p); }
          if (partOptions.length === 0) return TOPICS['fractions'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
          const part = pick(partOptions);
          const pct = Math.round(part / total * 100);
          const key = _sessionKey('fractions', 'd' + d, { type: 'whatPct', part, total });
          if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
          _record(key);
          const name = pick(NAMES);
          return { topic: 'fractions', difficulty: diffLabel(d),
            question: 'In a bag of ' + total + ' lollies, ' + part + ' are red. What percentage are red?',
            answer: pct + '%',
            explanation: part + ' ÷ ' + total + ' = ' + (part / total) + ' = ' + pct + '%'
          };
        }
        const pct = pick([10, 15, 20, 25, 50]);
        const baseLookup = { 10: [40, 60, 80, 100, 200], 15: [40, 60, 100, 200], 20: [50, 60, 80, 100, 150], 25: [40, 60, 80, 100, 200], 50: [20, 40, 60, 80, 100] };
        const base = pick(baseLookup[pct]);
        const increase = base * pct / 100;
        const answer = base + increase;
        const key = _sessionKey('fractions', 'd' + d, { type: 'increase', pct, base });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'Increase $' + base + ' by ' + pct + '%.',
          answer: '$' + answer,
          explanation: pct + '% of $' + base + ' = $' + increase + '. $' + base + ' + $' + increase + ' = $' + answer
        };
      }

      // d 17-18: Y7 — ratios
      if (d <= 18) {
        const ratios = [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 3 }, { a: 2, b: 5 }, { a: 3, b: 4 }, { a: 3, b: 5 }];
        const r = pick(ratios);
        const sum = r.a + r.b;
        const k = rand(2, Math.floor(50 / sum));
        const total = k * sum;
        const contexts = [
          { gA: 'boys', gB: 'girls', label: 'students' },
          { gA: 'red marbles', gB: 'blue marbles', label: 'marbles' },
          { gA: 'adults', gB: 'children', label: 'people' },
        ];
        const ctx = pick(contexts);
        const askB = Math.random() < 0.5;
        const answer = askB ? k * r.b : k * r.a;
        const asked = askB ? ctx.gB : ctx.gA;
        const part = askB ? r.b : r.a;
        const key = _sessionKey('fractions', 'd' + d, { ra: r.a, rb: r.b, total, askB });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'The ratio of ' + ctx.gA + ' to ' + ctx.gB + ' is ' + r.a + ':' + r.b + '. If there are ' + total + ' ' + ctx.label + ', how many are ' + asked + '?',
          answer: String(answer),
          explanation: 'Total parts = ' + sum + '. Each part = ' + total + ' ÷ ' + sum + ' = ' + k + '. ' + asked + ' = ' + part + ' × ' + k + ' = ' + answer
        };
      }

      // d 19-20: Y7 ext — decimal→%, decrease by %, complex ratio
      {
        const roll = Math.random();
        if (roll < 0.35) {
          const decimals = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
          const dec = pick(decimals);
          const pct = dec * 100;
          const key = _sessionKey('fractions', 'd' + d, { type: 'decToPct', dec });
          if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'fractions', difficulty: diffLabel(d),
            question: 'Convert ' + dec + ' into a percentage.',
            answer: pct + '%',
            explanation: dec + ' × 100 = ' + pct + '%'
          };
        }
        if (roll < 0.7) {
          const pct = pick([10, 15, 20, 25, 30]);
          const baseLookup = { 10: [60, 80, 100, 200, 300], 15: [60, 100, 200], 20: [50, 80, 100, 150], 25: [60, 80, 100, 200], 30: [50, 100, 200] };
          const base = pick(baseLookup[pct]);
          const decrease = base * pct / 100;
          const answer = base - decrease;
          const key = _sessionKey('fractions', 'd' + d, { type: 'decrease', pct, base });
          if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'fractions', difficulty: diffLabel(d),
            question: 'Decrease $' + base + ' by ' + pct + '%.',
            answer: '$' + answer,
            explanation: pct + '% of $' + base + ' = $' + decrease + '. $' + base + ' − $' + decrease + ' = $' + answer
          };
        }
        const ratios = [{ a: 3, b: 5 }, { a: 2, b: 7 }, { a: 4, b: 5 }, { a: 3, b: 8 }];
        const r = pick(ratios);
        const sum = r.a + r.b;
        const k = rand(3, Math.floor(80 / sum));
        const total = k * sum;
        const answer = k * r.b;
        const key = _sessionKey('fractions', 'd' + d, { type: 'ratio2', ra: r.a, rb: r.b, total });
        if (_isDuplicate(key) && retries > 0) return TOPICS['fractions'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'fractions', difficulty: diffLabel(d),
          question: 'A recipe uses flour and sugar in the ratio ' + r.a + ':' + r.b + '. If the total mixture is ' + total + ' grams, how many grams of sugar are needed?',
          answer: answer + ' g',
          explanation: 'Total parts = ' + sum + '. Each part = ' + total + ' ÷ ' + sum + ' = ' + k + ' g. Sugar = ' + r.b + ' × ' + k + ' = ' + answer + ' g.'
        };
      }
    },
    less(retries) { return TOPICS['fractions'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['fractions'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['fractions'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 8: MASS (d 1–20)
  // 1-3: Y1-2 comparison/simple  4-7: Y3 grams  8-11: Y4 conversions
  // 12-14: Y5 decimal kg  15-17: Y6 tonnes  18-20: Y7 complex
  // ──────────────────────────────────────────
  TOPICS['mass'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      if (d <= 3) {
        if (Math.random() < 0.4) {
          const grams = rand(100, 900);
          const key = _sessionKey('mass', 'd' + d, { type: 'compare', grams });
          if (_isDuplicate(key) && retries > 0) return TOPICS['mass'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'mass', difficulty: diffLabel(d), question: 'Which is heavier: ' + grams + ' g or 1 kg?', answer: '1 kg', explanation: '1 kg = 1,000 g, which is more than ' + grams + ' g.' };
        }
        const a = rand(1, 8); let b = rand(1, 8);
        while (a + b > 15) b = rand(1, 15 - a);
        const key = _sessionKey('mass', 'd' + d, { type: 'add', a, b });
        if (_isDuplicate(key) && retries > 0) return TOPICS['mass'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'mass', difficulty: diffLabel(d), question: fillTemplate(pick(CTX_MASS_LESS_ADD), { name: pick(NAMES), a, b }), answer: (a + b) + ' kg', explanation: a + ' kg + ' + b + ' kg = ' + (a + b) + ' kg' };
      }

      if (d <= 7) {
        const a = rand(100, 800); let b = rand(100, 800);
        while (a + b > 1600) b = rand(100, 1600 - a);
        const key = _sessionKey('mass', 'd' + d, { a, b });
        if (_isDuplicate(key) && retries > 0) return TOPICS['mass'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'mass', difficulty: diffLabel(d), question: fillTemplate(pick(CTX_MASS_MORE), { name: pick(NAMES), a, b }), answer: fmt(a + b) + ' g', explanation: a + ' g + ' + b + ' g = ' + fmt(a + b) + ' g' };
      }

      if (d <= 11) {
        if (Math.random() < 0.5) {
          const kg = rand(1, 8); const g = rand(1, 9) * 100;
          const totalG = kg * 1000 + g;
          const key = _sessionKey('mass', 'd' + d, { kg, g });
          if (_isDuplicate(key) && retries > 0) return TOPICS['mass'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'mass', difficulty: diffLabel(d), question: pick(NAMES) + ' has a bag weighing ' + kg + ' kg ' + g + ' g. How many grams is that in total?', answer: fmt(totalG) + ' g', explanation: kg + ' kg = ' + fmt(kg * 1000) + ' g. ' + fmt(kg * 1000) + ' + ' + g + ' = ' + fmt(totalG) + ' g' };
        }
        const items = [{ name: '2 kg 500 g, 1 kg 200 g, 500 g', sorted: '500 g, 1 kg 200 g, 2 kg 500 g' }, { name: '3 kg, 1 kg 800 g, 750 g', sorted: '750 g, 1 kg 800 g, 3 kg' }, { name: '4 kg 100 g, 900 g, 2 kg', sorted: '900 g, 2 kg, 4 kg 100 g' }];
        const item = pick(items);
        const key = _sessionKey('mass', 'd' + d, { item: item.name });
        if (_isDuplicate(key) && retries > 0) return TOPICS['mass'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'mass', difficulty: diffLabel(d), question: 'Order these from lightest to heaviest: ' + item.name, answer: item.sorted, explanation: 'Convert all to grams and compare.' };
      }

      if (d <= 14) {
        const aInt = rand(100, 999); const bInt = rand(100, 999);
        const sumKg = ((aInt + bInt) / 100).toFixed(2);
        const key = _sessionKey('mass', 'd' + d, { a: aInt, b: bInt });
        if (_isDuplicate(key) && retries > 0) return TOPICS['mass'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'mass', difficulty: diffLabel(d), question: pick(NAMES) + ' has a bag weighing ' + (aInt / 100).toFixed(2) + ' kg and another weighing ' + (bInt / 100).toFixed(2) + ' kg. What is the total mass?', answer: sumKg + ' kg', explanation: (aInt / 100).toFixed(2) + ' kg + ' + (bInt / 100).toFixed(2) + ' kg = ' + sumKg + ' kg' };
      }

      const tonnes = d >= 18 ? rand(25, 120) : rand(1, 15);
      const key = _sessionKey('mass', 'd' + d, { type: 'tonnes', tonnes });
      if (_isDuplicate(key) && retries > 0) return TOPICS['mass'].generateByDifficulty(d, retries - 1);
      _record(key);
      return { topic: 'mass', difficulty: diffLabel(d), question: 'A truck carries ' + tonnes + ' tonnes of sand. How many kilograms is that?', answer: fmt(tonnes * 1000) + ' kg', explanation: tonnes + ' × 1,000 = ' + fmt(tonnes * 1000) + ' kg' };
    },
    less(retries) { return TOPICS['mass'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['mass'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['mass'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 9: LENGTH (d 1–20)
  // 1-3: Y1-2 cm compare  4-7: Y3 mm/cm  8-11: Y4 m/cm conversions
  // 12-14: Y5 km  15-17: Y6 area/perimeter  18-20: Y7 triangles/circles
  // ──────────────────────────────────────────
  TOPICS['length'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: Triangle area / circumference (d 18-20) ──
      if (d >= 18) {
        if (Math.random() < 0.5) {
          const base = rand(4, 20); const height = rand(3, 15);
          const area = (base * height) / 2;
          const areaStr = area === Math.floor(area) ? String(area) : area.toFixed(1);
          const key = _sessionKey('length', 'd' + d, { type: 'tri', base, height });
          if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'length', difficulty: diffLabel(d),
            question: 'Find the area of a triangle with a base of ' + base + ' cm and a perpendicular height of ' + height + ' cm.',
            answer: areaStr + ' cm²',
            explanation: 'Area = ½ × ' + base + ' × ' + height + ' = ' + areaStr + ' cm²'
          };
        }
        const radius = pick([7, 14, 21]);
        const circumference = 2 * 22 / 7 * radius;
        const key = _sessionKey('length', 'd' + d, { type: 'circ', radius });
        if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'length', difficulty: diffLabel(d),
          question: 'Calculate the circumference of a circle with a radius of ' + radius + ' cm. (Use π = 22/7)',
          answer: circumference + ' cm',
          explanation: 'C = 2 × π × r = 2 × 22/7 × ' + radius + ' = ' + circumference + ' cm'
        };
      }

      // ── Y6: Area and perimeter (d 15-17) ──
      if (d >= 15) {
        if (Math.random() < 0.5) {
          const l = rand(3, 15); const w = rand(2, 10);
          const area = l * w;
          const key = _sessionKey('length', 'd' + d, { type: 'area', l, w });
          if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'length', difficulty: diffLabel(d),
            question: 'A rectangular garden is ' + l + ' m long and ' + w + ' m wide. What is its area?',
            answer: area + ' m²',
            explanation: 'Area = ' + l + ' × ' + w + ' = ' + area + ' m²'
          };
        }
        const side = rand(3, 15);
        const perim = side * 4;
        const area = side * side;
        const key = _sessionKey('length', 'd' + d, { type: 'sqPerim', side });
        if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'length', difficulty: diffLabel(d),
          question: 'A square has a side of ' + side + ' cm. What is its perimeter?',
          answer: perim + ' cm',
          explanation: 'Perimeter = 4 × ' + side + ' = ' + perim + ' cm'
        };
      }

      // ── Y5: km conversions (d 12-14) ──
      if (d >= 12) {
        const km = rand(1, 25);
        const key = _sessionKey('length', 'd' + d, { km });
        if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'length', difficulty: diffLabel(d),
          question: pick(['A running track is ' + km + ' km long. How many metres is that?', 'A cycling race covers ' + km + ' km. How many metres is that?']),
          answer: fmt(km * 1000) + ' m',
          explanation: km + ' × 1,000 = ' + fmt(km * 1000) + ' m'
        };
      }

      // ── Y4: m/cm conversions (d 8-11) ──
      if (d >= 8) {
        if (Math.random() < 0.5) {
          const cm = rand(1, 9) * 100 + rand(0, 1) * 50;
          const m = (cm / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
          const key = _sessionKey('length', 'd' + d, { type: 'cm_to_m', cm });
          if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'length', difficulty: diffLabel(d), question: 'A board is ' + cm + ' cm long. How long is that in metres?', answer: m + ' m', explanation: cm + ' ÷ 100 = ' + m + ' m' };
        }
        const n = rand(2, 10);
        const key = _sessionKey('length', 'd' + d, { type: 'mm', n });
        if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'length', difficulty: diffLabel(d), question: 'How many millimetres are in ' + n + ' metres?', answer: fmt(n * 1000) + ' mm', explanation: n + ' × 1,000 = ' + fmt(n * 1000) + ' mm' };
      }

      // ── Y3: mm/cm (d 4-7) ──
      if (d >= 4) {
        if (Math.random() < 0.5) {
          const cm = rand(5, 30);
          const mm = cm * 10;
          const key = _sessionKey('length', 'd' + d, { type: 'cmtomm', cm });
          if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'length', difficulty: diffLabel(d), question: 'How many millimetres are in ' + cm + ' centimetres?', answer: mm + ' mm', explanation: cm + ' × 10 = ' + mm + ' mm' };
        }
        const a = rand(30, 100);
        const b = rand(5, a - 5);
        const key = _sessionKey('length', 'd' + d, { type: 'ribbon', a, b });
        if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'length', difficulty: diffLabel(d), question: fillTemplate(pick(CTX_LEN_LESS), { name: pick(NAMES), a, b }), answer: (a - b) + ' cm', explanation: a + ' cm − ' + b + ' cm = ' + (a - b) + ' cm' };
      }

      // ── Y1-2: comparison (d 1-3) ──
      if (Math.random() < 0.4) {
        const cm = rand(10, 90);
        const key = _sessionKey('length', 'd' + d, { type: 'compare', cm });
        if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'length', difficulty: diffLabel(d), question: 'Which is longer: ' + cm + ' cm or 1 m?', answer: '1 m', explanation: '1 m = 100 cm, which is more than ' + cm + ' cm.' };
      }
      const a = rand(10, 30); const b = rand(2, a - 2);
      const key = _sessionKey('length', 'd' + d, { a, b });
      if (_isDuplicate(key) && retries > 0) return TOPICS['length'].generateByDifficulty(d, retries - 1);
      _record(key);
      return { topic: 'length', difficulty: diffLabel(d), question: fillTemplate(pick(CTX_LEN_LESS), { name: pick(NAMES), a, b }), answer: (a - b) + ' cm', explanation: a + ' cm − ' + b + ' cm = ' + (a - b) + ' cm' };
    },
    less(retries) { return TOPICS['length'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['length'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['length'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 10: TIME (d 1–20)
  // 1-3: Y1-2 telling time  4-5: Y2 minutes  6-8: Y3 duration
  // 9-11: Y4 24-hour  12-14: Y5 timetable  15-17: Y6 time zones
  // 18-20: Y7 speed/distance/time
  // ──────────────────────────────────────────
  TOPICS['time'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: Speed/distance/time (d 18-20) ──
      if (d >= 18) {
        const speed = pick([40, 50, 60, 80, 100, 120]);
        const distance = pick([10, 15, 20, 30, 40, 60]);
        const minutes = distance / speed * 60;
        if (minutes !== Math.floor(minutes)) return TOPICS['time'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const key = _sessionKey('time', 'd' + d, { speed, distance });
        if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'time', difficulty: diffLabel(d),
          question: 'A car travels at a constant speed of ' + speed + ' km/h. How many minutes will it take to travel ' + distance + ' km?',
          answer: minutes + ' minutes',
          explanation: distance + ' ÷ ' + speed + ' = ' + (distance / speed) + ' hours = ' + minutes + ' minutes'
        };
      }

      // ── Y6: Time zones (d 15-17) ──
      if (d >= 15) {
        if (Math.random() < 0.5) {
          const sydneyHour = rand(8, 16);
          const diff = pick([3, 2, 5]);
          const cities = { 3: 'Perth', 2: 'Adelaide', 5: 'London' };
          const city = cities[diff];
          const otherHour = sydneyHour - diff;
          const otherFormatted = (otherHour <= 0 ? (otherHour + 12) + ':00 pm (previous day)' : (otherHour > 12 ? (otherHour - 12) + ':00 pm' : otherHour + ':00 ' + (otherHour < 12 ? 'am' : 'pm')));
          const key = _sessionKey('time', 'd' + d, { sydneyHour, diff });
          if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'time', difficulty: diffLabel(d),
            question: 'If it is ' + sydneyHour + ':00 ' + (sydneyHour < 12 ? 'am' : (sydneyHour === 12 ? 'pm' : 'pm')) + ' in Sydney, and ' + city + ' is ' + diff + ' hours behind, what time is it in ' + city + '?',
            answer: otherFormatted,
            explanation: sydneyHour + ':00 − ' + diff + ' hours = ' + otherHour + ':00'
          };
        }
        const hour24 = rand(13, 23); const minute = rand(0, 11) * 5;
        const hour12 = hour24 - 12;
        const answer12 = hour12 + ':' + String(minute).padStart(2, '0') + ' pm';
        const key = _sessionKey('time', 'd' + d, { hour24, minute });
        if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'time', difficulty: diffLabel(d),
          question: 'Convert ' + hour24 + ':' + String(minute).padStart(2, '0') + ' to 12-hour time.',
          answer: answer12,
          explanation: hour24 + ' − 12 = ' + hour12 + ', so the time is ' + answer12
        };
      }

      // ── Y5: Complex duration (d 12-14) ──
      if (d >= 12) {
        const startH = rand(8, 16); const startM = rand(0, 11) * 5;
        const durH = rand(1, 3); const durM = rand(1, 11) * 5;
        let endH = startH + durH; let endM = startM + durM;
        if (endM >= 60) { endH++; endM -= 60; }
        const startStr = startH + ':' + String(startM).padStart(2, '0');
        const endStr = endH + ':' + String(endM).padStart(2, '0');
        const totalMin = durH * 60 + durM;
        const key = _sessionKey('time', 'd' + d, { startH, startM, durH, durM });
        if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
        _record(key);
        const name = pick(NAMES);
        return { topic: 'time', difficulty: diffLabel(d),
          question: name + ' left home at ' + startStr + ' and arrived at ' + endStr + '. How long was the trip?',
          answer: durH + ' hour' + (durH > 1 ? 's' : '') + ' and ' + durM + ' minutes',
          explanation: 'From ' + startStr + ' to ' + endStr + ' = ' + durH + 'h ' + durM + 'min (' + totalMin + ' minutes)'
        };
      }

      // ── Y4: 24-hour time (d 9-11) ──
      if (d >= 9) {
        if (Math.random() < 0.5) {
          const hour12 = rand(1, 12); const pm = Math.random() < 0.5;
          const minute = rand(0, 11) * 5;
          const hour24 = pm ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
          const str12 = hour12 + ':' + String(minute).padStart(2, '0') + (pm ? ' pm' : ' am');
          const str24 = String(hour24).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
          const key = _sessionKey('time', 'd' + d, { hour12, pm, minute });
          if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'time', difficulty: diffLabel(d), question: 'Convert ' + str12 + ' into 24-hour time.', answer: str24, explanation: str12 + ' = ' + str24 };
        }
        const h = rand(1, 3); const m = rand(1, 11) * 5;
        const total = h * 60 + m;
        const key = _sessionKey('time', 'd' + d, { h, m });
        if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'time', difficulty: diffLabel(d), question: 'How many minutes are in ' + h + ' hour' + (h > 1 ? 's' : '') + ' and ' + m + ' minutes?', answer: total + ' minutes', explanation: h + ' × 60 = ' + (h * 60) + '. ' + (h * 60) + ' + ' + m + ' = ' + total + ' minutes.' };
      }

      // ── Y3: Duration and calendar (d 6-8) ──
      if (d >= 6) {
        if (Math.random() < 0.5) {
          const h = rand(1, 3); const m = rand(1, 11) * 5;
          const total = h * 60 + m;
          const key = _sessionKey('time', 'd' + d, { h, m });
          if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'time', difficulty: diffLabel(d), question: fillTemplate(pick(CTX_TIME_MORE), { name: pick(NAMES), h, m, hs: h > 1 ? 's' : '' }), answer: total + ' minutes', explanation: h + ' hour' + (h > 1 ? 's' : '') + ' = ' + (h * 60) + ' minutes. ' + (h * 60) + ' + ' + m + ' = ' + total + ' minutes.' };
        }
        const months = [{ name: 'January', days: 31 }, { name: 'March', days: 31 }, { name: 'April', days: 30 }, { name: 'June', days: 30 }, { name: 'September', days: 30 }, { name: 'November', days: 30 }];
        const month = pick(months);
        const key = _sessionKey('time', 'd' + d, { month: month.name });
        if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'time', difficulty: diffLabel(d), question: 'How many days are in ' + month.name + '?', answer: month.days + ' days', explanation: month.name + ' has ' + month.days + ' days.' };
      }

      // ── Y2: Minutes (d 4-5) ──
      if (d >= 4) {
        const a = rand(1, 6) * 5; let b = rand(1, 6) * 5;
        while (a + b > 60) b = rand(1, Math.floor((60 - a) / 5)) * 5;
        const key = _sessionKey('time', 'd' + d, { a, b });
        if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'time', difficulty: diffLabel(d), question: fillTemplate(pick(CTX_TIME_LESS), { name: pick(NAMES), a, b }), answer: (a + b) + ' minutes', explanation: a + ' + ' + b + ' = ' + (a + b) + ' minutes' };
      }

      // ── Y1: Basic time concepts (d 1-3) ──
      if (Math.random() < 0.5) {
        const key = _sessionKey('time', 'd' + d, { type: 'minInHour' });
        if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'time', difficulty: diffLabel(d), question: 'How many minutes are in one hour?', answer: '60 minutes', explanation: '1 hour = 60 minutes.' };
      }
      const hours = rand(2, 5);
      const key = _sessionKey('time', 'd' + d, { hours });
      if (_isDuplicate(key) && retries > 0) return TOPICS['time'].generateByDifficulty(d, retries - 1);
      _record(key);
      return { topic: 'time', difficulty: diffLabel(d), question: 'How many minutes are in ' + hours + ' hours?', answer: (hours * 60) + ' minutes', explanation: hours + ' × 60 = ' + (hours * 60) + ' minutes.' };
    },
    less(retries) { return TOPICS['time'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['time'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['time'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 11: ANGLES (d 1–20)
  // 1-3: Y1-2 shapes  4-6: Y3 acute/right/obtuse
  // 7-9: Y4 multiples  10-12: Y5 angles on a line
  // 13-15: Y6 triangle angle sum  16-18: Y6-7 at a point
  // 19-20: Y7 parallel lines
  // ──────────────────────────────────────────
  TOPICS['angles'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: Parallel lines (d 19-20) ──
      if (d >= 19) {
        if (Math.random() < 0.5) {
          const angle = rand(30, 150);
          const key = _sessionKey('angles', 'd' + d, { type: 'alternate', angle });
          if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'angles', difficulty: diffLabel(d),
            question: 'Two parallel lines are cut by a transversal. One angle is ' + angle + '°. What is the alternate angle?',
            answer: angle + '°',
            explanation: 'Alternate angles are equal when lines are parallel. The alternate angle is ' + angle + '°.'
          };
        }
        const angle = rand(40, 140);
        const cointerior = 180 - angle;
        const key = _sessionKey('angles', 'd' + d, { type: 'cointerior', angle });
        if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'angles', difficulty: diffLabel(d),
          question: 'Two parallel lines are cut by a transversal. Co-interior angles add to 180°. If one angle is ' + angle + '°, what is the co-interior angle?',
          answer: cointerior + '°',
          explanation: '180° − ' + angle + '° = ' + cointerior + '°'
        };
      }

      // ── Y6-7: Angles at a point (d 16-18) ──
      if (d >= 16) {
        const a = rand(50, 150); const b = rand(30, 130);
        const c = rand(20, Math.min(120, 360 - a - b - 10));
        const x = 360 - a - b - c;
        if (x <= 0) return TOPICS['angles'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const key = _sessionKey('angles', 'd' + d, { a, b, c });
        if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'angles', difficulty: diffLabel(d),
          question: 'Angles around a point add to 360°. Three angles are ' + a + '°, ' + b + '°, and ' + c + '°. What is the fourth angle?',
          answer: x + '°',
          explanation: a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c) + '. 360 − ' + (a + b + c) + ' = ' + x + '°'
        };
      }

      // ── Y6: Triangle angle sum (d 13-15) ──
      if (d >= 13) {
        const a = rand(20, 80); const b = rand(20, Math.min(100, 160 - a));
        const x = 180 - a - b;
        const key = _sessionKey('angles', 'd' + d, { a, b });
        if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'angles', difficulty: diffLabel(d),
          question: 'A triangle has angles of ' + a + '° and ' + b + '°. What is the third angle?',
          answer: x + '°',
          explanation: 'Angles in a triangle add to 180°. 180 − ' + a + ' − ' + b + ' = ' + x + '°'
        };
      }

      // ── Y5: Angles on a straight line (d 10-12) ──
      if (d >= 10) {
        const a = rand(20, 150);
        const x = 180 - a;
        const key = _sessionKey('angles', 'd' + d, { type: 'line', a });
        if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'angles', difficulty: diffLabel(d),
          question: 'Two angles on a straight line are ' + a + '° and x°. What is x?',
          answer: x + '°',
          explanation: 'Angles on a straight line add to 180°. 180 − ' + a + ' = ' + x + '°'
        };
      }

      // ── Y4: Multiples of angles / half/quarter turns (d 7-9) ──
      if (d >= 7) {
        if (Math.random() < 0.5) {
          const angle = pick([30, 45, 60, 90]);
          const n = rand(2, 4);
          const key = _sessionKey('angles', 'd' + d, { angle, n });
          if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'angles', difficulty: diffLabel(d),
            question: 'An angle measures ' + angle + '°. What is ' + n + ' times this angle?',
            answer: (angle * n) + '°',
            explanation: angle + ' × ' + n + ' = ' + (angle * n) + '°'
          };
        }
        const turns = pick([{ label: 'quarter', deg: 90 }, { label: 'half', deg: 180 }, { label: 'three-quarter', deg: 270 }, { label: 'full', deg: 360 }]);
        const key = _sessionKey('angles', 'd' + d, { turn: turns.label });
        if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'angles', difficulty: diffLabel(d),
          question: 'How many degrees are in a ' + turns.label + ' turn?',
          answer: turns.deg + '°',
          explanation: 'A ' + turns.label + ' turn = ' + turns.deg + '°'
        };
      }

      // ── Y3: Angle classification (d 4-6) ──
      if (d >= 4) {
        const angle = rand(10, 170);
        let type;
        if (angle < 90) type = 'acute';
        else if (angle === 90) type = 'right';
        else type = 'obtuse';
        const key = _sessionKey('angles', 'd' + d, { angle });
        if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'angles', difficulty: diffLabel(d),
          question: 'Is an angle of ' + angle + '° acute, right, or obtuse?',
          answer: type.charAt(0).toUpperCase() + type.slice(1),
          explanation: angle + '° is ' + (angle < 90 ? 'less than 90° → acute' : angle === 90 ? 'exactly 90° → right angle' : 'greater than 90° → obtuse')
        };
      }

      // ── Y1-2: Shape sides and right angles (d 1-3) ──
      const shapes = [
        { name: 'triangle', sides: 3, corners: 3 },
        { name: 'square', sides: 4, corners: 4 },
        { name: 'rectangle', sides: 4, corners: 4 },
        { name: 'pentagon', sides: 5, corners: 5 },
        { name: 'hexagon', sides: 6, corners: 6 },
      ];
      const shape = pick(shapes);
      const askSides = Math.random() < 0.5;
      const key = _sessionKey('angles', 'd' + d, { shape: shape.name, askSides });
      if (_isDuplicate(key) && retries > 0) return TOPICS['angles'].generateByDifficulty(d, retries - 1);
      _record(key);
      if (askSides) {
        return { topic: 'angles', difficulty: diffLabel(d), question: 'How many sides does a ' + shape.name + ' have?', answer: String(shape.sides), explanation: 'A ' + shape.name + ' has ' + shape.sides + ' sides.' };
      }
      return { topic: 'angles', difficulty: diffLabel(d), question: 'How many corners (vertices) does a ' + shape.name + ' have?', answer: String(shape.corners), explanation: 'A ' + shape.name + ' has ' + shape.corners + ' corners.' };
    },
    less(retries) { return TOPICS['angles'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['angles'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['angles'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 12: CHANCE (d 1–20)
  // 1-4: Y1-3 impossible/certain/even  5-7: Y3-4 likely
  // 8-10: Y5 die/spinner  11-13: Y6 probability fraction
  // 14-16: Y6 expected values  17-18: Y7 NOT probability
  // 19-20: Y7 simplest form
  // ──────────────────────────────────────────
  TOPICS['chance'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: NOT probability / simplest form (d 17-20) ──
      if (d >= 17) {
        if (d >= 19) {
          const r = rand(2, 6); const b = rand(2, 6); const g = rand(2, 6);
          const total = r + b + g;
          const notGreen = r + b;
          const s = simplifyFraction(notGreen, total);
          const key = _sessionKey('chance', 'd' + d, { r, b, g, type: 'not' });
          if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'chance', difficulty: diffLabel(d),
            question: 'A bag contains ' + r + ' red, ' + b + ' blue, and ' + g + ' green marbles. What is the probability of NOT picking a green marble? Give your answer as a fraction in simplest form.',
            answer: s.n + '/' + s.d,
            explanation: 'Not green = ' + r + ' + ' + b + ' = ' + notGreen + ' out of ' + total + '. ' + notGreen + '/' + total + ' = ' + s.n + '/' + s.d
          };
        }
        const colA = pick(CHANCE_COLOURS_A); const colB = pick(CHANCE_COLOURS_B);
        const countA = rand(3, 10); const countB = rand(3, 10);
        const total = countA + countB;
        const s = simplifyFraction(countA, total);
        const key = _sessionKey('chance', 'd' + d, { countA, countB });
        if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'chance', difficulty: diffLabel(d),
          question: 'A bag has ' + countA + ' ' + colA + ' and ' + countB + ' ' + colB + ' marbles. What is the probability of picking a ' + colA + ' marble? Give your answer as a fraction in simplest form.',
          answer: s.n + '/' + s.d,
          explanation: countA + ' out of ' + total + ' = ' + countA + '/' + total + ' = ' + s.n + '/' + s.d
        };
      }

      // ── Y6: Expected values (d 14-16) ──
      if (d >= 14) {
        const probability = pick([0.2, 0.25, 0.3, 0.4, 0.5]);
        const totals = { 0.2: [10, 20, 30, 50], 0.25: [12, 20, 40], 0.3: [10, 20, 30], 0.4: [10, 20, 25, 50], 0.5: [10, 20, 30, 40] };
        const total = pick(totals[probability]);
        const answer = probability * total;
        if (answer !== Math.floor(answer)) return TOPICS['chance'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const col = pick(CHANCE_COLOURS_A);
        const key = _sessionKey('chance', 'd' + d, { probability, total });
        if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'chance', difficulty: diffLabel(d),
          question: 'The probability of picking a ' + col + ' marble is ' + probability + '. If there are ' + total + ' marbles in the bag, how many are ' + col + '?',
          answer: String(answer),
          explanation: probability + ' × ' + total + ' = ' + answer
        };
      }

      // ── Y6: Probability as fraction (d 11-13) ──
      if (d >= 11) {
        const colA = pick(CHANCE_COLOURS_A); const colB = pick(CHANCE_COLOURS_B);
        const countA = rand(2, 8); const countB = rand(2, 8);
        const total = countA + countB;
        const key = _sessionKey('chance', 'd' + d, { countA, countB });
        if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'chance', difficulty: diffLabel(d),
          question: 'A bag has ' + countA + ' ' + colA + ' and ' + countB + ' ' + colB + ' marbles. What is the probability of picking a ' + colA + ' marble?',
          answer: countA + '/' + total,
          explanation: countA + ' ' + colA + ' out of ' + total + ' total = ' + countA + '/' + total
        };
      }

      // ── Y5: Die/spinner (d 8-10) ──
      if (d >= 8) {
        if (Math.random() < 0.6) {
          const target = rand(1, 6);
          const key = _sessionKey('chance', 'd' + d, { type: 'die', target });
          if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
          _record(key);
          return { topic: 'chance', difficulty: diffLabel(d), question: 'A fair six-sided die is rolled. What is the chance of rolling a ' + target + '?', answer: '1 in 6', explanation: 'There is 1 face showing ' + target + ' out of 6 faces.' };
        }
        const sections = rand(3, 8);
        const key = _sessionKey('chance', 'd' + d, { type: 'spinner', sections });
        if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'chance', difficulty: diffLabel(d), question: 'A spinner has ' + sections + ' equal sections numbered 1 to ' + sections + '. What is the chance of landing on the number 1?', answer: '1 in ' + sections, explanation: '1 section out of ' + sections + ' equal sections.' };
      }

      // ── Y3-4: More/less likely (d 5-7) ──
      if (d >= 5) {
        const colA = pick(CHANCE_COLOURS_A); const colB = pick(CHANCE_COLOURS_B);
        const countA = rand(2, 8); let countB = rand(2, 8);
        while (countA === countB) countB = rand(2, 8);
        const total = countA + countB;
        let answer, explanation;
        if (countA > countB) { answer = 'More likely'; explanation = countA + ' out of ' + total + ' is more than ' + countB + '.'; }
        else { answer = 'Less likely'; explanation = countA + ' out of ' + total + ' is fewer than ' + countB + '.'; }
        const key = _sessionKey('chance', 'd' + d, { countA, countB });
        if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'chance', difficulty: diffLabel(d), question: 'A bag has ' + countA + ' ' + colA + ' and ' + countB + ' ' + colB + ' marbles. Is picking a ' + colA + ' marble more likely or less likely than picking a ' + colB + '?', answer, explanation };
      }

      // ── Y1-3: Impossible/certain/even (d 1-4) ──
      const subtype = pick(['impossible', 'certain', 'even', 'normal']);
      const colA = pick(CHANCE_COLOURS_A); const colB = pick(CHANCE_COLOURS_B);
      let countA, countB, question, answer, explanation;
      if (subtype === 'impossible') {
        countA = rand(3, 8);
        question = 'A bag has ' + countA + ' ' + colA + ' marbles and nothing else. What is the chance of picking a ' + colB + ' marble?';
        answer = 'Impossible'; explanation = 'There are no ' + colB + ' marbles.';
      } else if (subtype === 'certain') {
        countA = rand(3, 8);
        question = 'A bag has ' + countA + ' ' + colA + ' marbles and nothing else. What is the chance of picking a ' + colA + ' marble?';
        answer = 'Certain'; explanation = 'Every marble is ' + colA + '.';
      } else if (subtype === 'even') {
        countA = rand(2, 6);
        question = 'A bag has ' + countA + ' ' + colA + ' marbles and ' + countA + ' ' + colB + ' marbles. What is the chance of picking a ' + colA + ' marble?';
        answer = 'Even chance'; explanation = 'Equal numbers of each colour.';
      } else {
        countA = rand(2, 8); countB = rand(2, 8);
        while (countA === countB) countB = rand(2, 8);
        question = 'A bag has ' + countA + ' ' + colA + ' marbles and ' + countB + ' ' + colB + ' marbles. What is the chance of picking a ' + colA + ' marble?';
        answer = countA + ' in ' + (countA + countB);
        explanation = countA + ' ' + colA + ' out of ' + (countA + countB) + '.';
      }
      const key = _sessionKey('chance', 'd' + d, { subtype, countA, countB: countB || 0 });
      if (_isDuplicate(key) && retries > 0) return TOPICS['chance'].generateByDifficulty(d, retries - 1);
      _record(key);
      return { topic: 'chance', difficulty: diffLabel(d), question, answer, explanation };
    },
    less(retries) { return TOPICS['chance'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['chance'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['chance'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ──────────────────────────────────────────
  // TOPIC 13: DATA (d 1–20)
  // 1-3: Y1-2 tallies  4-7: Y3 differences  8-10: Y4 multi-category
  // 11-13: Y5 larger  14-15: Y6 range  16-17: Y6 mean
  // 18-20: Y7 median
  // ──────────────────────────────────────────
  TOPICS['data'] = {
    generateByDifficulty(difficultyNum, retries) {
      if (retries === undefined) retries = 20;
      const d = clampDifficulty(difficultyNum);

      // ── Y7: Median (d 18-20) ──
      if (d >= 18) {
        const count = pick([5, 7, 9]);
        const vals = Array.from({ length: count }, () => rand(1, 30)).sort((a, b) => a - b);
        const median = vals[Math.floor(count / 2)];
        const key = _sessionKey('data', 'd' + d, { vals: vals.join(',') });
        if (_isDuplicate(key) && retries > 0) return TOPICS['data'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'data', difficulty: diffLabel(d),
          question: 'What is the median of this data set: ' + vals.join(', ') + '?',
          answer: String(median),
          explanation: 'Sorted: ' + vals.join(', ') + '. The middle value is ' + median + '.'
        };
      }

      // ── Y6: Mean (d 16-17) ──
      if (d >= 16) {
        const count = pick([3, 4, 5]);
        let vals;
        for (let attempt = 0; attempt < 50; attempt++) {
          vals = Array.from({ length: count }, () => rand(5, d >= 17 ? 50 : 25));
          const total = vals.reduce((s, v) => s + v, 0);
          if (total % count === 0) break;
        }
        const total = vals.reduce((s, v) => s + v, 0);
        const mean = total / count;
        if (mean !== Math.floor(mean)) return TOPICS['data'].generateByDifficulty(d, retries > 0 ? retries - 1 : 0);
        const key = _sessionKey('data', 'd' + d, { vals: vals.join(',') });
        if (_isDuplicate(key) && retries > 0) return TOPICS['data'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'data', difficulty: diffLabel(d),
          question: 'Find the mean (average) of ' + vals.join(', ') + '.',
          answer: String(mean),
          explanation: vals.join(' + ') + ' = ' + total + '. ' + total + ' ÷ ' + count + ' = ' + mean
        };
      }

      // ── Y6: Range (d 14-15) ──
      if (d >= 14) {
        const count = rand(5, 8);
        const vals = Array.from({ length: count }, () => rand(1, 30));
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const range = max - min;
        const key = _sessionKey('data', 'd' + d, { vals: vals.join(',') });
        if (_isDuplicate(key) && retries > 0) return TOPICS['data'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'data', difficulty: diffLabel(d),
          question: 'What is the range of these scores: ' + vals.join(', ') + '?',
          answer: String(range),
          explanation: 'Highest = ' + max + ', Lowest = ' + min + '. Range = ' + max + ' − ' + min + ' = ' + range
        };
      }

      // ── Y5: Larger data totals (d 11-13) ──
      if (d >= 11) {
        const count = rand(4, 6);
        const vals = Array.from({ length: count }, () => rand(10, 50));
        const total = vals.reduce((s, v) => s + v, 0);
        const key = _sessionKey('data', 'd' + d, { vals: vals.join(',') });
        if (_isDuplicate(key) && retries > 0) return TOPICS['data'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'data', difficulty: diffLabel(d),
          question: 'The following scores were recorded: ' + vals.join(', ') + '. What is the total of all the scores?',
          answer: String(total),
          explanation: vals.join(' + ') + ' = ' + total
        };
      }

      // ── Y4: Multi-category (d 8-10) ──
      if (d >= 8) {
        const cat = pick(DATA_CATEGORIES);
        const items = cat.items.slice(0, d >= 10 ? 4 : 3);
        const vals = items.map(() => rand(5, 20));
        const total = vals.reduce((s, v) => s + v, 0);
        const key = _sessionKey('data', 'd' + d, { items: items.join(','), vals: vals.join(',') });
        if (_isDuplicate(key) && retries > 0) return TOPICS['data'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'data', difficulty: diffLabel(d),
          question: 'A class survey about ' + cat.label + ' found: ' + items.map((item, i) => item + ' – ' + vals[i]).join(', ') + '. How many students answered the survey?',
          answer: String(total),
          explanation: vals.join(' + ') + ' = ' + total
        };
      }

      // ── Y3: Differences (d 4-7) ──
      if (d >= 4) {
        const cat = pick(DATA_CATEGORIES);
        const items = cat.items.slice(0, 2);
        const valA = rand(8, 25);
        const valB = rand(3, valA - 1);
        const key = _sessionKey('data', 'd' + d, { items: items.join(','), valA, valB });
        if (_isDuplicate(key) && retries > 0) return TOPICS['data'].generateByDifficulty(d, retries - 1);
        _record(key);
        return { topic: 'data', difficulty: diffLabel(d),
          question: 'In a survey, ' + valA + ' students chose ' + items[0] + ' and ' + valB + ' chose ' + items[1] + '. How many more students chose ' + items[0] + '?',
          answer: String(valA - valB),
          explanation: valA + ' − ' + valB + ' = ' + (valA - valB)
        };
      }

      // ── Y1-2: Simple tally/count (d 1-3) ──
      const cat = pick(DATA_CATEGORIES);
      const items = cat.items.slice(0, 3);
      const vals = items.map(() => rand(2, 10));
      const total = vals.reduce((s, v) => s + v, 0);
      const key = _sessionKey('data', 'd' + d, { items: items.join(','), vals: vals.join(',') });
      if (_isDuplicate(key) && retries > 0) return TOPICS['data'].generateByDifficulty(d, retries - 1);
      _record(key);
      return { topic: 'data', difficulty: diffLabel(d),
        question: 'A class survey about ' + cat.label + ' found: ' + items.map((item, i) => item + ' – ' + vals[i]).join(', ') + '. How many students answered the survey?',
        answer: String(total),
        explanation: vals.join(' + ') + ' = ' + total
      };
    },
    less(retries) { return TOPICS['data'].generateByDifficulty(5, retries); },
    more(retries) { return TOPICS['data'].generateByDifficulty(8, retries); },
    most(retries, opts) { return TOPICS['data'].generateByDifficulty((opts && opts.harder) ? 20 : 12, retries); }
  };

  // ════════════════════════════════════════════
  // SELF-TEST
  // ════════════════════════════════════════════
  function selfTest() {
    const errors = [];
    const topics = Object.keys(TOPICS);
    const diffs = ['less', 'more', 'most'];
    const COUNT = 30;

    topics.forEach(topic => {
      diffs.forEach(diff => {
        for (let i = 0; i < COUNT; i++) {
          _usedKeys.clear();
          try {
            const q = TOPICS[topic][diff]();
            if (!q) continue;
            if (typeof q.question !== 'string' || q.question.length === 0)
              errors.push(topic + '/' + diff + '/' + i + ': empty question');
            if (typeof q.answer !== 'string' || q.answer.length === 0)
              errors.push(topic + '/' + diff + '/' + i + ': empty answer');
            if (typeof q.explanation !== 'string' || q.explanation.length === 0)
              errors.push(topic + '/' + diff + '/' + i + ': empty explanation');
            if (q.topic !== topic)
              errors.push(topic + '/' + diff + '/' + i + ': wrong topic: ' + q.topic);
          } catch (e) {
            errors.push(topic + '/' + diff + '/' + i + ': EXCEPTION: ' + e.message);
          }
        }
      });
    });

    [1, 3, 5, 8, 10, 12, 15, 17, 19, 20].forEach(numDiff => {
      topics.forEach(topic => {
        const gen = TOPICS[topic];
        if (!gen || !gen.generateByDifficulty) return;
        _usedKeys.clear();
        try {
          const q = gen.generateByDifficulty(numDiff);
          if (!q) return;
          if (typeof q.question !== 'string' || q.question.length === 0)
            errors.push(topic + '/d' + numDiff + ': empty question');
          if (typeof q.answer !== 'string' || q.answer.length === 0)
            errors.push(topic + '/d' + numDiff + ': empty answer');
        } catch (e) {
          errors.push(topic + '/d' + numDiff + ': EXCEPTION: ' + e.message);
        }
      });
    });

    return {
      total: topics.length * diffs.length * COUNT,
      errors: errors.length,
      details: errors
    };
  }

  // ════════════════════════════════════════════
  // PUBLIC API
  // ════════════════════════════════════════════
  return {
    generateQuestion(topic, difficulty, options) {
      const gen = TOPICS[topic];
      if (!gen) return null;
      const numericOverride = options && options.numericDifficulty != null;
      const numeric = numericOverride ? clampDifficulty(options.numericDifficulty) : levelToDefaultNumeric(difficulty);
      if (gen.generateByDifficulty) {
        const harder = !numericOverride && difficulty === 'most' && options && options.harder;
        const d = harder ? DIFFICULTY_MAX : numeric;
        return gen.generateByDifficulty(d);
      }
      const fn = gen[difficulty];
      if (!fn) return null;
      if (difficulty === 'most' && options && options.harder)
        return fn(undefined, { harder: true });
      return fn();
    },

    resetSession() { _usedKeys.clear(); },
    getAvailableTopics() { return Object.keys(TOPICS); },
    selfTest,
    DIFFICULTY_MIN,
    DIFFICULTY_MAX,
    clampDifficulty,

    TOPIC_MAP: {
      'Addition': 'addition',
      'Subtraction': 'subtraction',
      'Multiplication': 'multiplication',
      'Division': 'division',
      'Place Value': 'place-value',
      'Fractions': 'fractions',
      'Number Patterns': 'patterns',
      'Time': 'time',
      'Data': 'data',
    }
  };
})();

if (typeof window !== 'undefined') {
  window.QuestionGenerator = QuestionGenerator;
}
