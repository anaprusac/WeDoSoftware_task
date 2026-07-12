# Demo walkthrough script

A suggested script/shot-list for the short demo video the task asks for. Follow it top to bottom
while screen-recording — each step maps to one feature area, in an order that tells a coherent
story rather than a feature checklist. Total run time following this as-is: roughly 5–7 minutes.

**Before recording:** `docker compose up -d --build` from the repo root, wait ~15s, open
http://localhost:4200. Have DBeaver open on `localhost:5432` in a second window if you want to show
the database briefly (optional, see step 0).

---

## 0. (Optional, ~20s) One-time setup proof
Show the terminal running `docker compose up -d --build`, then a browser tab at
http://localhost:8080/swagger to prove the API is documented and alive. This demonstrates the whole
stack (Postgres + API + Angular) comes up from one command with migrations and seed data already
applied — skip this if you'd rather start directly on the app.

## 1. Registration (~60s)
- Land on the login page — point out the welcome panel and the sign-in card.
- Click **"New here? Create account"** → the register modal opens over the dimmed page.
- Fill in email/username, start typing a weak password first to show the **live password rules**
  ticking off as requirements are met, then a valid one.
- Show the **age/height/weight pickers** — type a value, then scroll with the mouse wheel over one
  of them to show that works too.
- Click the **cm → in** toggle on height to show the unit conversion, then switch back to cm.
- Submit → you're logged in immediately and land on the home dashboard as the new user.

## 2. Home dashboard (~20s)
- Point out **Add workout** and **Find workout by the date**, and the workout cards below (empty
  for a brand-new account — mention that, or switch to the seeded `demo` account here instead if you
  want cards already populated: log out, log back in as `demo` / `Demo123!`).

## 3. Add a workout (~60s)
- Click **Add workout**.
- Pick a workout type from the dropdown (alphabetically sorted).
- Change the duration and point out **intensity updates live** as you type — mention it's computed
  from type + duration + gender, and that the server recomputes the same value on save (the client
  number is only a preview).
- Show the date field can't be pushed into the future (try it, or just mention the restriction).
- Click the **✕** button → show the "discard?" confirmation, click "No" to stay.
- Fill in optional calories/notes, click the **✓** button → show the "save?" confirmation, confirm.
- You're back on Home and the new workout card is there.

## 4. Find workout by date / calendar (~30s)
- Click **Find workout by the date**.
- Point out darker/clickable days (has a workout) vs. lighter/disabled days, and that future dates
  and future months can't be selected.
- Click a day with a workout → lands on the workout detail page for that date. If that day has more
  than one workout (the seeded `demo` account has one such day), scroll to show both, separated by a
  divider, in chronological order.

## 5. Statistics (~30s)
- Open the hamburger menu (point out the icon + "Track your progress" header, and the other links),
  click **Monthly statistics**.
- Change the month/year selectors — point out future months/years aren't selectable.
- Scroll through the weekly breakdown (total time, session count, average intensity/tiredness per
  week, with the first/last week possibly shorter than 7 days).

## 6. Profile (~45s)
- Open **Profile** from the menu.
- Change the weight or height value and pause — show it **auto-saves** (no Save button) and the
  **BMI** updates live below. Hover the (i) next to BMI to show the explanation tooltip.
- Toggle **dark mode** from the profile page, then point out the header's sun/moon icon reflects the
  same state (they're the same underlying setting).
- Switch the **language** to Serbian from the profile page — show the whole app (including this
  page) re-labels immediately, then switch back to English.
- Click **Reset password**, show the modal (current/new/repeat + live password rules), close without
  submitting (or actually change it and change it back, if you want to prove it end-to-end).

## 7. Forgot password (~20s, optional but recommended)
- Log out, click **Forgot password?** on the login page.
- Enter a username, submit — mention that a real email is sent if Gmail SMTP is configured (see
  README), otherwise show the reset link appearing in the API's terminal log as proof the flow
  works end-to-end without needing real email for the demo.

## 8. Wrap-up (~10s)
- Log back in, briefly show light/dark theme one more time side by side if you like, and close on
  the home dashboard.

---

### Things worth calling out verbally if there's time
- Clean Architecture on the backend (Domain has zero framework dependencies; the intensity/BMI/
  statistics formulas are pure and unit-tested — 57 backend tests).
- JWT + rotating refresh tokens in an http-only cookie (not localStorage).
- Every UI string comes from a translation file — no hardcoded text, which is why the language
  switch above updates *everything* instantly.
- Docker Compose brings up Postgres + API + Angular/nginx with one command, migrations and seed data
  included.
