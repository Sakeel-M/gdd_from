# Social Eagle — Registration Form

A branded form (Name, Email, Phone, Location) that saves each submission to a
Google Sheet **and** emails the submitter the framework PDF — all via a Google
Apps Script Web App.

## Files
- `index.html` — the form (open in any browser / host anywhere static).
- `Code.gs` — the Apps Script backend: writes the row + sends the email.
- `logo.png` — Social Eagle logo used in the form header.
- `Thedal_x_Social_Eagle_Framework.pdf` — the PDF emailed to each registrant.

## One-time setup (connect the form to your sheet)

1. Open the target sheet:
   https://docs.google.com/spreadsheets/d/1Emu1asgpmbadhBrYHyrXRb8IMIYpZH1I9lAQOfxhkmY/edit

2. **Extensions ▸ Apps Script**. Delete any sample code, then paste the full
   contents of `Code.gs`. Save.

3. **Deploy ▸ New deployment**:
   - Click the gear ▸ select **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy**, authorize when prompted.
   - Copy the **Web app URL** (ends in `/exec`).

4. Open `index.html` and paste that URL into:
   ```js
   const SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
   ```

5. Open `index.html` in a browser and submit a test entry. A new row should
   appear in the sheet (Timestamp, Name, Email, Phone, Location), and the email
   you entered should receive the framework PDF.

## The emailed PDF — choose the attachment source (in `Code.gs`)
`Code.gs` needs to know where to load the PDF from. Two options:

- **Option A — Google Drive (recommended, most reliable):**
  Upload `Thedal_x_Social_Eagle_Framework.pdf` to your Google Drive, open it,
  and copy the id from the URL (`.../file/d/THIS_PART/view`). Paste it into
  `PDF_FILE_ID` in `Code.gs`.
- **Option B — GitHub (zero setup, but repo must stay public):**
  Leave `PDF_FILE_ID` empty. `Code.gs` already points `PDF_URL` at the PDF in
  this repo, so it fetches it automatically. If you make the repo private, this
  stops working — switch to Option A.

The first time you submit, Apps Script will ask you to authorize sending email
(and Drive access if you use Option A). Approve it once.

## Notes
- Email sending has a daily quota: ~100 recipients/day on a personal Gmail
  account, ~1,500/day on Google Workspace.
- If your sheet tab isn't named `Sheet1`, update `SHEET_NAME` in `Code.gs`
  (or it falls back to the first tab automatically).
- The browser can't read the response from Apps Script (Google sends no CORS
  headers), so the form submits in `no-cors` mode and shows success optimistically.
  Confirm writes by checking the sheet.
- To change what data is collected, edit both the inputs in `index.html` and the
  `appendRow([...])` line in `Code.gs`.
