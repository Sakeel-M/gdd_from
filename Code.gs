/**
 * Social Eagle — Registration form backend (Google Apps Script)
 *
 * Receives POSTs from index.html, appends a row to the connected Google Sheet,
 * then emails the submitter a confirmation with the framework PDF attached.
 *
 *   Sheet: https://docs.google.com/spreadsheets/d/1Emu1asgpmbadhBrYHyrXRb8IMIYpZH1I9lAQOfxhkmY/edit
 *
 * Deploy:  Extensions ▸ Apps Script  →  paste this  →  Deploy ▸ New deployment
 *          ▸ type "Web app" ▸ Execute as "Me" ▸ Who has access "Anyone".
 *          Copy the Web App URL into SCRIPT_URL in index.html.
 */

var SHEET_ID = '1Emu1asgpmbadhBrYHyrXRb8IMIYpZH1I9lAQOfxhkmY';
var SHEET_NAME = 'Sheet1'; // change if your tab has a different name

// ── The PDF that gets emailed ────────────────────────────────────────────────
// Pick ONE source for the attachment:
//   Option A (recommended): upload the PDF to Google Drive, open it, copy the
//   id from the URL (…/file/d/THIS_PART/view), and paste it below.
var PDF_FILE_ID = '';
//   Option B: leave PDF_FILE_ID empty and it will fetch the PDF straight from
//   the GitHub repo (works only while the repo is public).
var PDF_URL = 'https://raw.githubusercontent.com/Sakeel-M/gdd_from/main/Thedal_x_Social_Eagle_Framework.pdf';
var PDF_NAME = 'Thedal x Social Eagle Framework.pdf';

var EMAIL_SUBJECT = 'Welcome to Social Eagle — Your Framework';
var FROM_NAME = 'Social Eagle';

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

    // Email the submitter the PDF.
    if (p.email && isEmail_(p.email)) {
      sendFrameworkEmail_(p.email, p.name || 'there');
    }

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sendFrameworkEmail_(to, name) {
  var blob = getPdfBlob_();

  var body =
    'Hi ' + name + ',\n\n' +
    'Thank you for registering with Social Eagle! ' +
    'Your copy of the Thedal x Social Eagle Framework is attached to this email.\n\n' +
    'Together we rise.\n\n' +
    '— Team Social Eagle';

  var options = {
    name: FROM_NAME,
    body: body
  };
  if (blob) {
    options.attachments = [blob];
  }

  MailApp.sendEmail(to, EMAIL_SUBJECT, body, options);
}

function getPdfBlob_() {
  try {
    if (PDF_FILE_ID) {
      return DriveApp.getFileById(PDF_FILE_ID).getBlob().setName(PDF_NAME);
    }
    if (PDF_URL) {
      var resp = UrlFetchApp.fetch(PDF_URL, { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) {
        return resp.getBlob().setName(PDF_NAME);
      }
    }
  } catch (err) {
    // If the attachment can't be loaded, still send the email (without it)
    // rather than failing the whole submission.
  }
  return null;
}

function isEmail_(v) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v));
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
