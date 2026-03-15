# Paddy's Project Context

## Who I am
Year 5 teacher in NSW, Australia. I build self-contained HTML maths interactives for 10-year-olds. The project lives in this folder and currently contains 33+ files across Place Value, Addition and Subtraction, and Decimals.

## Language and formatting preferences
- British English spelling throughout (colour, organised, centre, etc.)
- Never use em-dashes. Use full stops or commas instead.
- No emojis in any output unless I explicitly ask for them. This is non-negotiable.
- Write for 10-year-olds: clear, direct, age-appropriate language.
- Do not use bullet points or lists in conversational replies unless I ask for them.

## How I like to work
- Read the maths-interactives skill before touching any HTML file in this project. Every time, no exceptions.
- Present one change at a time for my approval before moving on.
- When redesigning, always open and reference the existing exemplar files first (Place Value Jumps, Place Value Explorer, Rounding Tool are the gold standards).
- Chunk instruction: one concept per card, slow and methodical.
- Verify all maths programmatically with node before presenting answers to me.
- If you are unsure about a pedagogical decision, ask. Do not guess.

## Project facts
- All files are fully self-contained: HTML, CSS, and JS in a single file, no build step, no frameworks.
- Only external dependencies: Google Fonts (Fredoka + Space Mono) and results-to-sheet.js for Google Sheets integration.
- Students use laptops only. No mobile or tablet optimisation needed.
- Curriculum: NSW K-6 Mathematics Syllabus, focus on Stage 3.
- Three file types: Lessons (Hook/I Do/We Do/You Do), Interactives/Practice, Tools.

## Things to always check
- Is the maths-interactives skill loaded? If working on any file in this folder, it must be.
- Are there emojis? Remove them from interactive/practice files.
- Is Space Mono used only for numbers in interactive contexts (not in worked examples)?
- Are visual models built step-by-step under teacher control? Never render complete on load.
- Is a LISC card present where one should be?
- Are algorithms and multi-step calculations laid out vertically, one step per row?
