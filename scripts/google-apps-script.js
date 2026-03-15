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
