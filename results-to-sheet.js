/**
 * Sends activity results to your Google Sheet (via Apps Script Web app).
 * Set RESULTS_SCRIPT_URL in this file to your deployed Web app URL.
 * Optional: set RESULTS_SECRET_KEY to match the SECRET_KEY in Apps Script.
 */
var RESULTS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzCYPoI84V9jqJ4FouEkE4Opzp-gl3KOv8e46gHZOpbVlJ9SFl_t5qscijGiLWSjp3/exec'; // e.g. 'https://script.google.com/macros/s/.../exec'
var RESULTS_SECRET_KEY = ''; // optional; leave '' if you don't use a secret in Apps Script

/**
 * Build per-question data for analytics (which questions were right/wrong).
 * Use this so you can analyse student and cohort performance over time.
 * @param {Array<string|null>} questionStatus - Same array used for the progress circles: null, 'correct', 'incorrect', or 'partial'.
 * @param {number} [total] - Total questions in the set (defaults to questionStatus.length).
 * @returns {Array<{q: number, correct: boolean, result: string}>} One entry per question: q = 1-based index, correct = true/false, result = 'correct'|'incorrect'|'partial'|'unanswered'.
 */
function buildQuestionData(questionStatus, total) {
  var len = total != null ? total : (questionStatus ? questionStatus.length : 0);
  if (!len) return [];
  var out = [];
  for (var i = 0; i < len; i++) {
    var s = questionStatus[i];
    out.push({
      q: i + 1,
      correct: s === 'correct',
      result: s || 'unanswered'
    });
  }
  return out;
}

/**
 * Submit a result to the Google Sheet.
 * @param {string} activityId - Internal id (e.g. 'building-the-houses').
 * @param {string} activityName - Display name; used as the sheet tab name (e.g. 'Building the Houses', 'Place Value Explorer').
 * @param {number} score - Correct answers / marks.
 * @param {number} total - Total questions or marks.
 * @param {string} [modeOrLevel] - Level or mode label (e.g. 'Thousands House', 'Level 1').
 * @param {Array} [questionData] - Optional array of per-question data: [{ q: 1, correct: true, result: 'correct' }, ...]. Use buildQuestionData(questionStatus, total) to build from your progress array.
 */
function submitResult(activityId, activityName, score, total, modeOrLevel, questionData) {
  if (!RESULTS_SCRIPT_URL) return;
  var studentName = sessionStorage.getItem('maths_interactives_student_name') || 'Anonymous';
  var studentClass = sessionStorage.getItem('maths_interactives_student_class') || '';
  var payload = {
    timestamp: new Date().toISOString(),
    studentName: studentName,
    studentClass: studentClass,
    activityId: activityId,
    activityName: activityName,
    modeOrLevel: modeOrLevel || '',
    score: score,
    total: total
  };
  if (RESULTS_SECRET_KEY) payload.secret = RESULTS_SECRET_KEY;
  if (questionData && questionData.length) payload.questionData = questionData;

  var body = JSON.stringify(payload);

  // Use Content-Type: text/plain so the request is "simple" (no CORS preflight); body is sent and script receives it.
  // Do not use mode: 'no-cors' — it can prevent the request body from reaching the server.
  fetch(RESULTS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: body
  }).then(function () { /* success or CORS: request was sent */ }).catch(function () {
    // Fallback: form POST in hidden iframe so the server still receives the data
    try {
      var iframe = document.createElement('iframe');
      iframe.name = 'maths_results_iframe_' + Date.now();
      iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(iframe);
      var form = document.createElement('form');
      form.method = 'POST';
      form.action = RESULTS_SCRIPT_URL;
      form.target = iframe.name;
      form.style.display = 'none';
      var input = document.createElement('input');
      input.name = 'data';
      input.value = body;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      setTimeout(function () {
        try { document.body.removeChild(form); document.body.removeChild(iframe); } catch (e) {}
      }, 5000);
    } catch (e) { /* ignore */ }
  });
}
