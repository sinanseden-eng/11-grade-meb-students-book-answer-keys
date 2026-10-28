# English 11 · Answer Studio

A colorful, responsive MEB Grade 11 English answer collection prepared for **Sinan Seden**.

The first release includes **Unit 1: Future Jobs (Student’s Book pp. 10–24)** and **Unit 2: Hobbies and Skills (pp. 26–36)**: 26 pages and 90 activity groups. Fixed answers were transcribed and visually checked against the supplied Teacher’s Guide photographs. Open-ended tasks include brief original model responses, clearly labeled **Sample answer**.

## What’s inside

- Page-by-page navigation with shareable hash URLs.
- Search across every available unit, including answers and page numbers.
- Individual answer disclosures, Show all / Hide all, and answer-type filters.
- Saved pages and reviewed-page progress stored locally in the browser.
- Print an entire unit with all answers, regardless of the current page or filter.
- Responsive layouts, semantic headings, keyboard navigation, dialogs and reduced-motion support.
- A data-driven collection: future units need new JSON content, not a new interface.

This is an independent teaching resource, not an official MEB publication. Student’s Book page numbers differ from the larger Teacher’s Guide page numbers visible in the photographs. Listening/video keys are based on the printed answers and transcripts, not independently played media. Appendix exercises and media files were not supplied. No photographs or complete reading passages are redistributed.

## Run locally

No install or build step is required. Serve `dist/` over HTTP (opening `index.html` directly with `file://` will block JSON loading in some browsers):

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Validate the content with Node 18 or newer:

```sh
node scripts/validate.mjs
node --check dist/app.js
```

## Add the next unit

1. Copy `docs/unit-template.json` to `dist/data/unit-03.json` and fill in the content from the next supplied unit. Keep each page’s printed Student’s Book number and activity label.
2. Add a corresponding entry to `dist/data/manifest.json` with `status: "available"` and `file: "unit-03.json"`. Use `color: "purple"` or `"teal"`; unit art falls back to the creative illustration for later units.
3. Match `id`, `title`, `subtitle`, `color`, `icon`, `range`, `description` and `skills` between the manifest entry and unit file. The range describes the printed page span, e.g. `"38–48"`.
4. Each activity has a `label`, `title`, `kind` and nonempty `answers` array. Use `kind: "key"` for fixed answers, `"sample"` for original model responses, and `"practice"` for action guidance. Add an optional `note` when alternatives or context matter. Never leave “students’ own answers” as the response—write a short sample.
5. Run the validation commands, review the new pages, and commit. Navigation, search, statistics, print output and progress totals update automatically.

Existing page numbers and unit IDs should stay stable so saved pages and links continue to work. The global search file is the manifest; there is no separate index to maintain. Progress is specific to the browser and origin, with no accounts or server-side student records.

## Hosting

Deploy **`dist/`** to any static host. Paths are relative, so this works at both a domain root and a GitHub Pages repository subpath. The stylesheet uses Google Fonts with local system fallbacks. All answers and interface features work if font loading is unavailable.

An optional GitHub Pages workflow is included at `.github/workflows/pages.yml`. To publish:

1. In repository **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Open **Actions → Publish answer studio → Run workflow** on `main`.
3. Re-run this workflow after content updates. It validates the collection before publishing.

The workflow is manual so publishing begins only when Pages is configured. Continuous content validation runs on pushes and pull requests.

## Content and maintenance notes

- Model answers are examples, not the only acceptable answers. Students should personalize fictional experiences, family details and opinions.
- Celebrity and scientist answers follow the book’s text; they are reading-comprehension answers, not claims of current biography.
- “No information” is judged only from the supplied reading text.
- E-portfolio, recording and assessment tasks include guidance. Actual peer/self evaluation must reflect the student’s performance.
- The source materials were supplied as `English 11th Grade.rar` containing 26 photographs. Original photographs stay outside this repository.
- A source audit mapping each covered Student’s Book page to its photograph is in `docs/source-map.md`.

## Files

```text
dist/
  index.html          Accessible application shell
  styles.css          Responsive design and print layout
  app.js              Navigation, rendering, search and local progress
  data/
    manifest.json     Available-unit catalog
    unit-01.json      Future Jobs
    unit-02.json      Hobbies and Skills
docs/
  unit-template.json  Reusable content structure
  source-map.md       Source-page audit
scripts/
  validate.mjs        Content validation for future updates
```
