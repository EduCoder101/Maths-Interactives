/**
 * Sends activity results to your Google Sheet (via Apps Script Web app).
 * Set RESULTS_SCRIPT_URL in this file to your deployed Web app URL.
 * Optional: set RESULTS_SECRET_KEY to match the SECRET_KEY in Apps Script.
 */
var RESULTS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzCYPoI84V9jqJ4FouEkE4Opzp-gl3KOv8e46gHZOpbVlJ9SFl_t5qscijGiLWSjp3/exec'; // e.g. 'https://script.google.com/macros/s/.../exec'
var RESULTS_SECRET_KEY = ''; // optional; leave '' if you don't use a secret in Apps Script

function submitResult(activityId, activityName, score, total, modeOrLevel) {
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
  // Use text/plain to avoid CORS preflight (Apps Script still parses JSON from body)
  fetch(RESULTS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  }).catch(function () { /* fire-and-forget */ });
}
