/**
 * Daily Ten — Google Sheet backup for the question bank
 *
 * SETUP:
 * 1. Create a new Google Sheet (or use an existing one).
 * 2. In the sheet: Extensions → Apps Script. Paste this entire file, save.
 * 3. Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL and paste it into the Daily Ten app (Backup to Google Sheet).
 *
 * Questions are stored in separate tabs by year group:
 * - "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"
 * Each tab has columns: id | topic | level | question | answer | working | custom | grade
 *
 * Save to Sheet: writes each grade's questions to its own tab.
 * Load from Sheet: reads all year tabs and returns one combined bank (with grade set per question).
 */

var GRADES = ['1', '2', '3', '4', '5', '6'];
var HEADER_ROW = ['id', 'topic', 'level', 'question', 'answer', 'working', 'custom', 'grade'];

function getSheetForGrade(grade) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'Year ' + grade;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
    if (action !== 'getBank') {
      return jsonResponse({ error: 'Use ?action=getBank' });
    }

    var bank = [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    for (var g = 0; g < GRADES.length; g++) {
      var grade = GRADES[g];
      var sheet = ss.getSheetByName('Year ' + grade);
      if (!sheet) continue;

      var data = sheet.getDataRange().getValues();
      if (!data || data.length < 2) continue;

      var header = data[0];
      var idCol = header.indexOf('id');
      var topicCol = header.indexOf('topic');
      var levelCol = header.indexOf('level');
      var questionCol = header.indexOf('question');
      var answerCol = header.indexOf('answer');
      var workingCol = header.indexOf('working');
      var customCol = header.indexOf('custom');
      var gradeCol = header.indexOf('grade');

      if (idCol < 0 || topicCol < 0 || questionCol < 0 || answerCol < 0) continue;

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[idCol]) continue;
        var gradeVal = (gradeCol >= 0 && row[gradeCol] !== undefined && row[gradeCol] !== null && row[gradeCol] !== '') ? String(row[gradeCol]) : grade;
        bank.push({
          id: String(row[idCol] || ''),
          topic: String(row[topicCol] || ''),
          level: String(row[levelCol] || ''),
          question: String(row[questionCol] || ''),
          answer: String(row[answerCol] || ''),
          working: row[workingCol] !== undefined && row[workingCol] !== null ? String(row[workingCol]) : '',
          custom: row[customCol] === true || row[customCol] === 'true',
          grade: gradeVal
        });
      }
    }

    return jsonResponse({ bank: bank });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ error: 'No post data' });
    }

    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var bank = body.bank;

    if (!Array.isArray(bank)) {
      return jsonResponse({ error: 'bank must be an array' });
    }

    if (action === 'appendBank') {
      // Append each question to the sheet for its grade (create tab if needed).
      var appended = 0;
      for (var i = 0; i < bank.length; i++) {
        var q = bank[i];
        var grade = (q.grade !== undefined && q.grade !== null && q.grade !== '') ? String(q.grade) : '3';
        if (GRADES.indexOf(grade) < 0) grade = '3';
        var sheet = getSheetForGrade(grade);
        if (sheet.getLastRow() === 0) {
          sheet.appendRow(HEADER_ROW);
        }
        sheet.appendRow([
          q.id || '',
          q.topic || '',
          q.level || '',
          q.question || '',
          q.answer || '',
          q.working != null ? q.working : '',
          q.custom === true ? 'true' : 'false',
          grade
        ]);
        appended++;
      }
      return jsonResponse({ status: 'success', ok: true, count: appended });
    }

    if (action !== 'saveBank') {
      return jsonResponse({ error: 'Use action: saveBank or appendBank' });
    }

    // Full save: write each grade's questions to its own tab (create tab if needed).
    var totalWritten = 0;
    for (var gi = 0; gi < GRADES.length; gi++) {
      var gradeKey = GRADES[gi];
      var sheet = getSheetForGrade(gradeKey);
      sheet.clear();
      sheet.appendRow(HEADER_ROW);

      for (var j = 0; j < bank.length; j++) {
        var q2 = bank[j];
        var qGrade = (q2.grade !== undefined && q2.grade !== null && q2.grade !== '') ? String(q2.grade) : '3';
        if (GRADES.indexOf(qGrade) < 0) qGrade = '3';
        if (qGrade !== gradeKey) continue;

        sheet.appendRow([
          q2.id || '',
          q2.topic || '',
          q2.level || '',
          q2.question || '',
          q2.answer || '',
          q2.working != null ? q2.working : '',
          q2.custom === true ? 'true' : 'false',
          qGrade
        ]);
        totalWritten++;
      }
    }

    return jsonResponse({ status: 'success', ok: true, count: totalWritten });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

/** Plain JSON response */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
