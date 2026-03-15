# Storing results in a Google Sheet (school account)

Student results are sent to a Google Sheet in your school account. Follow these steps once.

---

## Step 1: Create the sheet

1. In Google Drive (signed in with your school account), create a **new Google Sheet**.
2. Name it something like **Maths Interactives Results**.
3. You don’t need to add headers manually. The script **creates one tab per activity** (e.g. “Building the Houses”, “Rounding Ranger”) and adds this header row to each tab when it’s first used:

   | Timestamp | Student name | Class | Mode / level | Score | Total |

   You can filter by **Class** (5A, 5S, 5EG) in any tab.

---

## Step 2: Add the Apps Script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete any code in the editor and **paste in the code from `google-apps-script.js`** in this folder (open that file and copy all of it).
3. Click **Save** (disc icon). Name the project if prompted (e.g. "Maths Results Logger").

---

## Step 3: Deploy as a Web app

1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type", choose **Web app**.
3. Set:
   - **Description:** e.g. "Maths Interactives submit results"
   - **Execute as:** Me (your school account)
   - **Who has access:** Anyone (so the website can send data without users signing in)
4. Click **Deploy**.
5. **Authorise** when prompted (choose your school account, allow access).
6. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`). You will need this in Step 4.

---

## Step 4: Add the URL to your site

1. Open the file **`results-to-sheet.js`** in this folder.
2. Find the line: `var RESULTS_SCRIPT_URL = '';`
3. Paste your Web app URL between the quotes, for example:
   `var RESULTS_SCRIPT_URL = 'https://script.google.com/macros/s/ABC123.../exec';`
4. Save the file. When you deploy the site (e.g. to GitHub Pages), make sure this file is deployed too.

---

## Optional: Restrict who can send results

If you want to reduce the chance of random people sending data to your sheet, you can use a **secret key**:

1. In Apps Script, at the top of the code, set a secret (e.g. a long random string):
   `var SECRET_KEY = 'yourSecretKey123';`
2. In **`results-to-sheet.js`**, set the same value:
   `var RESULTS_SECRET_KEY = 'yourSecretKey123';`
3. Keep the key private; only your deployed site should use it. Anyone who gets the key could still send rows, but casual visitors cannot.

---

## Where students enter their name and class

On the **main Maths Interactives page** (the one with the list of activities), there is a box at the top: **“Before you start, enter your name and class.”** Students type their name, choose their class (5A, 5S or 5EG) from the dropdown, and click **Save**. That choice is remembered for the rest of the browser session, so they only need to do it once (or when they open the site in a new tab). Results are sent with that name and class when they complete any activity.

## Viewing results

Open your Google Sheet anytime. Each **tab** is one skill/activity (e.g. “Place Value Explorer”, “Number Ordering Detective”). New rows appear when students complete that activity. Columns: Timestamp, Student name, Class, Mode/level, Score, Total. Use the **Class** column to filter by 5A, 5S or 5EG.

---

## Troubleshooting

- **No new rows?** Check that students have entered their name and class on the main page and clicked Save before doing an activity, and that you’ve set `RESULTS_SCRIPT_URL` in `results-to-sheet.js`.
- **Place Value Explorer (or another activity) not showing?** Look for a **tab** with that activity's name (e.g. "Place Value Explorer"). If you haven't updated the Apps Script, results may still be going to the first sheet only. After completing an activity, the completion screen should show "Your result has been sent to your teacher" when the send was attempted.
- **Testing locally:** Opening the HTML files directly from your computer (file://) can block the request. Deploy to GitHub Pages (or another host) and test from the real URL.
- **"Authorization required"** when opening the Web app URL in a browser is normal; the site sends data via `fetch` (POST), not by opening the URL in the address bar.
- If you change the script or redeploy, the Web app URL might change; update `RESULTS_SCRIPT_URL` in `results-to-sheet.js` if it does.
