/**
 * Google Apps Script: paste this into your sheet's Apps Script editor
 * (Extensions → Apps Script). Deploy as Web app → Execute as Me, Who has access: Anyone.
 */

// Optional: set a secret key and check it in doPost to reject unknown requests
var SECRET_KEY = ''; // e.g. 'mySecretKey123' — leave empty to allow all requests

// Opening the Web app URL in a browser runs doGet. Use this to confirm the URL is correct.
function doGet() {
  return ContentService.createTextOutput('Maths Results – OK').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var raw = (e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var body = parsePostBody(raw);

    if (SECRET_KEY && body.secret !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorised' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var activityName = (body.activityName || 'Results').toString().replace(/[:*?\/\\[\]]/g, '').substring(0, 100);
    if (!activityName) activityName = 'Results';

    var sheet = ss.getSheetByName(activityName);
    if (!sheet) {
      sheet = ss.insertSheet(activityName);
      // Question data: JSON array of { q: 1-based index, correct: true/false, result: 'correct'|'incorrect'|'partial'|'unanswered' } for per-question analytics
    sheet.appendRow(['Timestamp', 'Student name', 'Class', 'Mode / level', 'Score', 'Total', 'Question data']);
    } else if (sheet.getLastRow() >= 1 && sheet.getRange(1, 7).getValue() === '') {
      sheet.getRange(1, 7).setValue('Question data');
    }

    var timestamp = body.timestamp || new Date().toISOString();
    var studentName = (body.studentName || 'Anonymous').toString();
    var studentClass = (body.studentClass || '').toString();
    var modeOrLevel = (body.modeOrLevel || '').toString();
    var score = body.score != null ? body.score : '';
    var total = body.total != null ? body.total : '';
    var questionDataStr = '';
    if (body.questionData && (typeof body.questionData === 'object' || typeof body.questionData === 'string')) {
      questionDataStr = typeof body.questionData === 'string' ? body.questionData : JSON.stringify(body.questionData);
      if (questionDataStr.length > 50000) questionDataStr = questionDataStr.substring(0, 50000) + '…';
    }
    sheet.appendRow([timestamp, studentName, studentClass, modeOrLevel, score, total, questionDataStr]);
    if (activityName === 'Theme Park Maths') { try { updateThemeParkSummary(ss, sheet); } catch (e2) { /* summary is best effort */ } }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Parse POST body: raw JSON (text/plain) or form-encoded "data" field (fallback from iframe form).
 */
function parsePostBody(raw) {
  if (!raw || typeof raw !== 'string') return {};
  var s = raw.trim();
  if (s.indexOf('data=') === 0) {
    try {
      var decoded = decodeURIComponent(s.replace(/^data=/, '').replace(/\+/g, ' '));
      return JSON.parse(decoded);
    } catch (err) { /* fall through to try as JSON */ }
  }
  try {
    return JSON.parse(s);
  } catch (err) {
    return {};
  }
}

/**
 * Theme Park Maths: rebuilds the "Theme Park Summary" tab from the log tab after every post.
 * One row per group: where they are, attempts per task, and the misconceptions that keep coming up.
 * Run it by hand from the editor (Run > updateThemeParkSummaryNow) if you ever need to rebuild it.
 */
function updateThemeParkSummaryNow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = ss.getSheetByName('Theme Park Maths');
  if (log) updateThemeParkSummary(ss, log);
}
function updateThemeParkSummary(ss, log) {
  var rows = log.getDataRange().getValues();
  var groups = {};
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var key = String(r[1]) + '|' + String(r[2]);
    var g = groups[key] || (groups[key] = { name: r[1], klass: r[2], last: '', lastLabel: '', stage: 0, attempts: {}, wrongCount: 0, miscon: {}, figures: {}, bonuses: 0 });
    var label = String(r[3] || '');
    var data = {};
    try { var arr = JSON.parse(r[6] || '[]'); data = (arr && arr[0]) || {}; } catch (e) { data = {}; }
    if (String(r[0]) > String(g.last)) { g.last = r[0]; g.lastLabel = label; }
    if (data.stage != null && Number(data.stage) > g.stage) g.stage = Number(data.stage);
    if (data.unlocked != null && Number(data.unlocked) > g.stage) g.stage = Number(data.unlocked);
    var task = label.replace(/:.*$/, '').replace(/^Day \d+$/, 'Days 1 to 10');
    if (/wrong|correct/.test(label)) g.attempts[task] = (g.attempts[task] || 0) + 1;
    if (data.wrong && data.wrong.length) {
      g.wrongCount += data.wrong.length;
      for (var k = 0; k < data.wrong.length; k++) {
        var m = String(data.wrong[k].msg || '').replace(/^You answered -?\$?[\d\s.,]+\. /, '').replace(/^Blank\. /, 'Blank: ').slice(0, 90);
        if (m) g.miscon[m] = (g.miscon[m] || 0) + 1;
      }
    }
    ['dailyCost', 'fee', 'feeS1', 'bankEndS1', 'visitors', 'profit', 'bankEndS2'].forEach(function (f) { if (data[f] != null && data[f] !== '') g.figures[f] = data[f]; });
    if (/^Teacher (bonus|fine)/.test(label) && data.amount != null) g.bonuses += Number(data.amount);
  }
  var stageNames = ['Choosing group', 'Task 1 Build', 'Task 2 Costs', 'Task 3 Fee', 'Tasks 4-5 Open', 'Task 6 Annual', 'Task 7 Improve', 'Task 8 Costs', 'Task 9 Fee', 'Task 10 Visitors', 'Task 11 Profit', 'Tasks 12-13 Tax', 'Season 2 finished'];
  var out = [['Group', 'Class', 'Furthest stage', 'Last seen', 'Last event', 'Attempts per task', 'Wrong boxes', 'Top misconceptions', 'Daily cost', 'Fee S1', 'Bank end S1', 'Visitors S2', 'Profit S2', 'Bank end S2', 'Bonuses and fines']];
  Object.keys(groups).sort().forEach(function (key) {
    var g = groups[key];
    var att = Object.keys(g.attempts).map(function (t) { return t + ': ' + g.attempts[t]; }).join('; ');
    var top = Object.keys(g.miscon).sort(function (a, b) { return g.miscon[b] - g.miscon[a]; }).slice(0, 3).map(function (m) { return m + ' (' + g.miscon[m] + ')'; }).join(' | ');
    out.push([g.name, g.klass, stageNames[g.stage] || g.stage, g.last, g.lastLabel, att, g.wrongCount, top, g.figures.dailyCost || '', g.figures.feeS1 || '', g.figures.bankEndS1 || '', g.figures.visitors || '', g.figures.profit || '', g.figures.bankEndS2 || '', g.bonuses]);
  });
  var sum = ss.getSheetByName('Theme Park Summary') || ss.insertSheet('Theme Park Summary');
  sum.clearContents();
  sum.getRange(1, 1, out.length, out[0].length).setValues(out);
  sum.getRange(1, 1, 1, out[0].length).setFontWeight('bold');
  sum.setFrozenRows(1);
}
