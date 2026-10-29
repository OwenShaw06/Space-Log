# Low Orbit

A workout tracker run as a space station. Everything is computed from the sessions you log. No accounts, no server, no tracking. Data lives in your phone's storage.

## Put it on GitHub Pages

1. On github.com, create a new repository (for example `low-orbit`). Make it **Public** (free Pages requires this).
2. Click **Add file → Upload files**. Drag in everything from this folder: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, and the `icons` and `fonts` folders. Dragging folders from a computer keeps the structure. Commit.
3. Go to **Settings → Pages**. Under Build and deployment, choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After a minute the site is live at `https://<your-username>.github.io/low-orbit/`.

## Install on iPhone

1. Open that address in **Safari** (not Chrome).
2. Tap **Share → Add to Home Screen → Add**.
3. From now on, open it **only from the home-screen icon**. The icon and Safari keep separate storage, so anything logged in Safari will not appear in the icon app.

## Backups (important)

Data is stored only on the phone. Deleting the app or clearing Safari data erases it. In **Console → Settings**, use **Export backup** every few weeks and save the file to Files or iCloud. The app nudges you after 21 days. **Import backup** merges a backup back in.

## Updating

After you re-upload changed files, open the app, close it fully, and open it again. The first open fetches the update, the second shows it.

## Look and feel

A live starfield sits behind everything, and each tab has its own view out of the station window (planet, moon, nebula chart, ringed planet, target star). Switching tabs fires a short warp streak, and a cold start plays a 2.5 second boot sequence (tap to skip). All of it is drawn in code, so it works offline. If your iPhone has Reduce Motion on, the animations are skipped.

## What's in it

- **Console:** today's session, this week's schedule, 4-week coverage of every movement group (pull, push, legs, core, skill, cardio, mobility), recent records, totals, sessions per week.
- **Log:** start any day of the program with exercises pre-loaded, or add your own. Your last numbers show as hints.
- **Plan:** the weekly program (Mon pull, Tue push, Wed cardio and mobility, Thu legs and weights, Fri upper weights, Sat conditioning and skills, Sun rest) plus progression rules.
- **Progress:** best set per session charted for every exercise, with personal records marked.
- **Goals:** targets for any exercise (reps, holds, weight, or run distance) with progress read from your log.

The program is fixed in `app.js` (`PLAN` near the top). Swap exercises there, or just log whatever you actually did.
