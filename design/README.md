# Million Attempt — landing + report

The funnel's front door, in the MRP Signature system. Two files, both payload/API-driven:

- `landing.html` — the page. Hero question ("What's troubling *your* business?"), the trouble
  box, the live team-working console, the email gate, two sample reports, the $500 fix plan,
  signature footer. Opens with a built-in DEMO of the working show; in production the same
  file talks to the real API (`window.MA_LIVE`).
- `report.html` — the mini-report template. Payload JSON fills every slot; the sample payload
  is the no-shows report. Includes the "what this report can't know" honesty box — that box
  is a brand element, not an apology, and stays in every report.

These files are the SOURCE for the deployed page at Projects\Million Attempt\landing\ —
design edits here should be synced back into the app's public/ folder, and vice versa.
Rules carried from the brand: coral-bright for big display numbers only (and small coral
labels only on ink surfaces), body text is ink, never grey; every number carries its source.
