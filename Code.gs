/**
 * Social Eagle — Registration form backend (Google Apps Script)
 *
 * Receives POSTs from index.html, appends a row to the connected Google Sheet,
 * then emails the submitter an attractive HTML thank-you with the framework
 * PDF attached.
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

// Logo shown inside the email (fetched from the repo; or set a Drive file id).
var LOGO_FILE_ID = '';
var LOGO_URL = 'https://raw.githubusercontent.com/Sakeel-M/gdd_from/main/logo.png';

var EMAIL_SUBJECT = 'Thank You for Attending GD Dharaneetharan’s Session 🦅';
var FROM_NAME = 'Social Eagle';
var SPEAKER = 'GD Dharaneetharan';

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
  var pdf = getPdfBlob_();
  var logo = getLogoBlob_();

  var html = buildEmailHtml_(name, !!logo);

  var plain =
    'Hi ' + name + ',\n\n' +
    'Thank you for attending ' + SPEAKER + '’s session! We’re thrilled ' +
    'to have had you with us.\n\n' +
    'Your copy of the Thedal x Social Eagle Framework is attached to this email.\n\n' +
    'Together we rise.\n— Team Social Eagle';

  var options = { name: FROM_NAME, htmlBody: html };
  if (pdf) options.attachments = [pdf];
  if (logo) options.inlineImages = { seLogo: logo };

  MailApp.sendEmail(to, EMAIL_SUBJECT, plain, options);
}

function buildEmailHtml_(name, hasLogo) {
  var safeName = escapeHtml_(name);
  var logoBlock = hasLogo
    ? '<img src="cid:seLogo" alt="Social Eagle" width="220" ' +
      'style="display:block;margin:0 auto;max-width:220px;height:auto;" />'
    : '<div style="font:700 24px Arial,sans-serif;color:#ffffff;' +
      'letter-spacing:1px;">SOCIAL EAGLE</div>';

  return [
'<!DOCTYPE html>',
'<html><head><meta charset="utf-8">',
'<meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
'<body style="margin:0;padding:0;background:#f4f5f7;">',
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;">',
'<tr><td align="center" style="padding:28px 12px;">',

'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);">',

// Header
'<tr><td align="center" style="background:#000000;padding:34px 24px 28px;">',
logoBlock,
'</td></tr>',

// Red accent bar
'<tr><td style="height:5px;background:#c8102e;line-height:5px;font-size:0;">&nbsp;</td></tr>',

// Body
'<tr><td style="padding:38px 36px 8px;font-family:Arial,Helvetica,sans-serif;color:#1f2426;">',

'<p style="margin:0 0 6px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c8102e;font-weight:700;">Thank You</p>',
'<h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:#1f2426;">Thanks for attending<br>' + escapeHtml_(SPEAKER) + '’s session!</h1>',

'<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a4145;">Hi <strong>' + safeName + '</strong>,</p>',

'<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a4145;">We’re so glad you joined us. It was a pleasure having you in the session with <strong>' + escapeHtml_(SPEAKER) + '</strong>. We hope you walked away inspired and ready to rise. 🚀</p>',

'<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#3a4145;">As promised, your copy of the <strong>Thedal &times; Social Eagle Framework</strong> is attached to this email — keep it handy as you put what you learned into action.</p>',

// Attachment callout
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f4;border:1px solid #f4c9d1;border-radius:12px;margin:0 0 28px;">',
'<tr><td style="padding:16px 18px;font-family:Arial,sans-serif;">',
'<span style="font-size:15px;color:#9c0d24;font-weight:700;">📎 Attached:</span> ',
'<span style="font-size:15px;color:#3a4145;">Thedal &times; Social Eagle Framework (PDF)</span>',
'</td></tr></table>',

'<p style="margin:0 0 4px;font-size:16px;line-height:1.6;color:#3a4145;">Together we rise,</p>',
'<p style="margin:0 0 30px;font-size:16px;line-height:1.6;color:#1f2426;font-weight:700;">Team Social Eagle</p>',

'</td></tr>',

// Footer
'<tr><td style="background:#000000;padding:20px 24px;text-align:center;font-family:Arial,sans-serif;">',
'<p style="margin:0;font-size:13px;color:#ffffff;">together we <span style="color:#c8102e;font-weight:700;">rise</span></p>',
'<p style="margin:6px 0 0;font-size:12px;color:#8a9096;">&copy; Social Eagle</p>',
'</td></tr>',

'</table>',
'</td></tr></table>',
'</body></html>'
  ].join('');
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
    // If the attachment can't be loaded, still send the email (without it).
  }
  return null;
}

function getLogoBlob_() {
  try {
    if (LOGO_FILE_ID) {
      return DriveApp.getFileById(LOGO_FILE_ID).getBlob().setName('logo.png');
    }
    if (LOGO_URL) {
      var resp = UrlFetchApp.fetch(LOGO_URL, { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) {
        return resp.getBlob().setName('logo.png');
      }
    }
  } catch (err) {
    // Fall back to a text logo in the email header.
  }
  return null;
}

function isEmail_(v) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v));
}

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
