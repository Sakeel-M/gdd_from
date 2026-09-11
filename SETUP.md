# Social Eagle — Registration Form

A branded form (Name, Email, Phone, Location) that saves each submission to a
Google Sheet via a Google Apps Script Web App.

## Files
- `index.html` — the form (open in any browser / host anywhere static).
- `Code.gs` — the Apps Script backend that writes rows to the sheet.
- `logo.png` — Social Eagle logo used in the form header.

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
   appear in the sheet with: Timestamp, Name, Email, Phone, Location.

## Notes
- If your sheet tab isn't named `Sheet1`, update `SHEET_NAME` in `Code.gs`
  (or it falls back to the first tab automatically).
- The browser can't read the response from Apps Script (Google sends no CORS
  headers), so the form submits in `no-cors` mode and shows success optimistically.
  Confirm writes by checking the sheet.
- To change what data is collected, edit both the inputs in `index.html` and the
  `appendRow([...])` line in `Code.gs`.
