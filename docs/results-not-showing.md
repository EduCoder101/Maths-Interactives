# Results not showing in the spreadsheet – checklist

Use this if students complete activities but nothing appears in your Google Sheet.

---

## 1. Is the Web app URL still correct?

**If you clicked “New deployment”** (instead of “New version”), Google gives you a **new URL**. The old URL in `results-to-sheet.js` then stops working.

- In Apps Script: **Deploy → Manage deployments**.
- Click the **copy** icon next to your Web app URL.
- Open **`results-to-sheet.js`** and replace the value of `RESULTS_SCRIPT_URL` with this exact URL (in quotes).
- Save and redeploy your site (e.g. upload to GitHub again).

**To avoid changing the URL next time:** when you update the script, use **Deploy → Manage deployments → pencil (Edit) → Version: New version → Deploy**. That updates the same deployment and keeps the same URL.

---

## 2. Test the URL in your browser

1. Copy the Web app URL from **Deploy → Manage deployments** (the one that should be in `results-to-sheet.js`).
2. Paste it into your browser and press Enter.
3. You should see: **Maths Results – OK**

If you see “Authorization required” or a different error, the deployment may need to be set to **Who has access: Anyone**. If you see “Maths Results – OK”, the URL is correct and the script is running.

---

## 3. Are you testing from a real website (not file://)?

If you open the HTML files **directly from your computer** (double‑click or `file:///...` in the address bar), the browser can block the request to Google. **Use your live site** (e.g. the GitHub Pages URL) to test.

---

## 4. Name and class saved before the activity?

Students must:

1. Open the **main Maths Interactives page** (the one with the list of activities).
2. Enter **name** and **class** (5A, 5S or 5EG).
3. Click **Save**.
4. Then open and complete an activity (e.g. The Value Detective).

If they go straight to an activity without saving on the main page, the result can still be sent (as “Anonymous” and no class), but it’s a good check.

---

## 5. Do you see “Your result has been sent to your teacher”?

After completing **The Value Detective** or **Place Value Explorer**, the completion screen should show:

**“Your result has been sent to your teacher.”**

- **If you see it:** The site tried to send the result. If the spreadsheet is still empty, the problem is likely the **URL** (step 1) or the **Apps Script** (wrong sheet, errors in the script).
- **If you don’t see it:** The `results-to-sheet.js` script may not be loading (e.g. wrong path or 404). Check the browser: **F12 → Console** for red errors, and **Network** for a failed request to `results-to-sheet.js`.

---

## 6. Update the Apps Script again

1. Open **`google-apps-script.js`** in this folder and copy **all** of its contents.
2. In your Google Sheet: **Extensions → Apps Script**.
3. Select all the code there and paste (replace with the copied code).
4. **Save** (Ctrl+S).
5. **Deploy → Manage deployments → pencil → Version: New version → Deploy.**

Then test again with The Value Detective and check for “Your result has been sent to your teacher” and a new **The Value Detective** tab in the spreadsheet.
