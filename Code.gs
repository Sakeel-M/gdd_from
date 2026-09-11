/**
 * Social Eagle — Registration form backend (Google Apps Script)
 *
 * This Web App receives POSTs from index.html and appends a row to the
 * connected Google Sheet:
 *   https://docs.google.com/spreadsheets/d/1Emu1asgpmbadhBrYHyrXRb8IMIYpZH1I9lAQOfxhkmY/edit
 *
 * Deploy:  Extensions ▸ Apps Script  →  paste this  →  Deploy ▸ New deployment
 *          ▸ type "Web app" ▸ Execute as "Me" ▸ Who has access "Anyone".
 *          Copy the Web App URL into SCRIPT_URL in index.html.
 */

var SHEET_ID = '1Emu1asgpmbadhBrYHyrXRb8IMIYpZH1I9lAQOfxhkmY';
var SHEET_NAME = 'Sheet1'; // change if your tab has a different name

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // avoid two submissions writing the same row

  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    }

    // Add a header row once, if the sheet is empty.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Location']);
    }

    var p = (e && e.parameter) ? e.parameter : {};

    sheet.appendRow([
      new Date(),
      p.name || '',
      p.email || '',
      p.phone || '',
      p.location || ''
    ]);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the Web App URL in a browser to confirm it is live.
function doGet() {
  return json({ result: 'ok', message: 'Social Eagle registration endpoint is live.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
