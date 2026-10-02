# Privacy & Security Remediation Checklist

This checklist tracks the privacy hardening of `bowenislandsong.github.io` and associated public GitHub repositories.

> **Note:** No raw personal data (phone numbers, street addresses, IDs, or tokens) is recorded in this file since this repository is public. See your private local audit report for exact file and commit references.

---

## 1. Completed on `bowenislandsong.github.io`

- [x] **Sanitized Master's Thesis PDF (`publications/SCALABLE_STRING_RECONCILIATION_Thesis.pdf`)**
  - Stripped the appended 3-page CV (formerly PDF pages 95–97) that contained a personal phone number, former street address, and university email. The thesis text and bibliography (pages 1–94) remain intact.
- [x] **Removed Unreferenced Files & Metadata (`publications/LFMreport.pdf`, `img/aboutmepic/IMG_0647.JPG`, `img/IMG_0822.JPG`, etc.)**
  - Deleted an unlinked undergraduate lab report PDF that contained a university student ID number and email.
  - Deleted unlinked personal photos from `img/` that contained embedded camera EXIF/GPS coordinates and personal selfies.
  - Removed unused legacy PDFs, images, and `.gitleaksignore`.
- [x] **Generalized Current Role Details (`index.html`, `sections/personal.html`, `sections/engineering.html`)**
  - Generalized current role descriptions to `Software Engineer` at `Google` (`2026`), removing internal org/team identifiers, specific office city, and exact start month.
- [x] **Removed Direct Email Links (`index.html`, `sections/personal.html`, `sections/engineering.html`)**
  - Removed `mailto:` links and raw email addresses from the website, directing visitors to **LinkedIn**, **Google Scholar**, and **GitHub** instead.
- [x] **Purged `.git` Commit History (`main`)**
  - Collapsed repository history into a single clean orphan commit and force-pushed `main`, removing all historical commits that previously contained old resumes, cover letters, street addresses, phone numbers, and legacy API keys.

---

## 2. Remaining Manual Tasks (Other Repositories & Cloud Console)

### A. Lock Down Other Public Repositories on `github.com/Bowenislandsong`
Several older public repositories under `Bowenislandsong` contain historical resumes, street addresses, phone numbers, or debug logs:
- [ ] **`Bowenislandsong/webresume` (CRITICAL):** Make this repository **Private** (or delete it) in GitHub **Settings -> Danger Zone -> Change repository visibility**.
  - Contains `firebase-debug.log` with an old plaintext OAuth token/secret and resume files (`CV-Bowen SONG.doc`, `img/CV-Bowen_SONG.pdf`).
- [ ] **`Bowenislandsong/webCV` (HIGH):** Make this repository **Private** (or delete it).
  - Contains `public/CV/CV-BowenSong.tex`, `public/CV/CV-BowenSong.pdf`, and `public/Papers/LFMreport.pdf`.
- [ ] **`Bowenislandsong/Resume` (HIGH):** Make this repository **Private** (or delete it).
  - Contains `main.tex` with a former phone number and email.
- [ ] **`Bowenislandsong/gmail-bot` (LOW):** Make **Private** or archive if no longer needed (commit metadata references a former internship email).

### B. Revoke Legacy Cloud / OAuth Credentials
- [ ] Visit [Google Account Third-Party Connections](https://myaccount.google.com/permissions) on your personal Google account and revoke any legacy **Firebase CLI** access.
- [ ] Visit the [Google Cloud / Firebase Console](https://console.cloud.google.com/) and delete or disable the legacy `webresume-d2dc2` project (or rotate its API keys).

### C. Optional Cleanup
- [ ] Once sections 2A and 2B are complete, you can delete `PRIVACY_TODO.md` from this repository.
