# 11th Grade MEB English

A simple **unit → Student’s Book page → questions and answers** website, prepared by **Sinan Seden**.

## Student access

1. Open the home page and find the unit you are studying.
2. Click the large **page number** printed in your Student’s Book.
3. Read each exercise question. Its answer appears immediately underneath.

All answers are visible. Orange boxes mark **Sample answer** responses that students can personalise. Use **Choose another page**, the page dropdown, or the **Previous / Next page** buttons to move around. Print the current page or an entire unit with the buttons above the exercises.

## Included content

- **Unit 1: Future Jobs** — Student’s Book pages **10–24**.
- **Unit 2: Hobbies and Skills** — Student’s Book pages **26–36**.
- **26 pages, 90 activity groups**, including **36 groups of original brief model responses**.
- Exercise prompts for every activity, plus individual question–answer pairs for numbered tasks.
- Large page buttons, persistent access guidelines, readable text and mobile layouts.
- Shareable page links. Existing links such as `#/unit/2/page/36` continue to work.

Questions are transcribed or shortened for clarity from the supplied Teacher’s Guide photographs. Students should use their book for full reading texts, picture sets and recordings. Fixed answers follow the guide. Listening/video keys use the printed answer keys and transcripts. Appendix exercises and QR-linked further practice were not supplied. This is an independent teaching resource, not an official MEB publication.

## Run locally

No dependencies or build step are required. Serve `dist/` over HTTP:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Opening HTML directly with `file://` may prevent JSON content from loading.

Validate with Node 18 or newer:

```sh
node scripts/validate.mjs
node --check dist/app.js
```

## Add future units

1. Copy `docs/unit-template.json` to `dist/data/unit-03.json` and replace the example content using the next supplied unit.
2. Add its matching metadata to `dist/data/manifest.json` with `status: "available"` and `file: "unit-03.json"`. Keep the metadata fields consistent between files. Supported colors are `purple` and `teal`.
3. Use the Student’s Book page numbers and original activity labels. Keep existing IDs and page numbers stable so links continue to work.
4. Every activity requires `label`, `title`, `kind`, `prompt` and a nonempty `answers` array. Use `key` for fixed answers, `sample` for model responses and `practice` for action guidance.
5. For individual numbered questions, add a `questions` array with **exactly one question per answer**. The website pairs them in order. For a dialogue, list, paragraph or project model, use one `prompt` and the full response in `answers`.
6. Run validation, review the new pages, then commit. Unit navigation, page buttons, printing and the page dropdown update automatically.

Example activity:

```json
{
  "label": "2",
  "title": "Your hobbies",
  "kind": "sample",
  "prompt": "Discuss the questions with your partner.",
  "questions": ["What is your favourite hobby?", "Why do you like it?"],
  "answers": ["My favourite hobby is cycling.", "I like it because it keeps me active."]
}
```

Optional `note` text can explain alternatives, source context or submission guidance. Do not leave “students’ own answers” as the response; provide a brief model and set `kind: "sample"`.

## Hosting

Deploy **`dist/`** to a static host. All paths are relative, including page navigation, so the website works under a GitHub Pages repository subpath. No external fonts, accounts, browser storage or backend services are required.

An optional manual GitHub Pages workflow is included:

1. Set repository **Settings → Pages → Source** to **GitHub Actions**.
2. Open **Actions → Publish answer studio → Run workflow** on `main`.
3. Run it again after future updates.

Automatic content checks run on pushes and pull requests. The manual publishing workflow validates the content before deployment.

## Files

- `dist/index.html`: book title, unit navigation and access guidelines.
- `dist/app.js`: page directory, question–answer rendering, navigation and printing.
- `dist/styles.css`: responsive design and print layout.
- `dist/data/manifest.json`: available units and source-question note.
- `dist/data/unit-01.json`, `unit-02.json`: page-by-page prompts, questions and answers.
- `docs/unit-template.json`: structure for the next unit.
- `docs/source-map.md`: mapping to the supplied photographs.
- `scripts/validate.mjs`: checks content and one-to-one question–answer pairing.

The original 26 photographs from `English 11th Grade.rar` stay outside the repository. Full passages are not redistributed. Celebrity and scientist details are comprehension answers according to the book, rather than claims about current biographies. Actual self/peer evaluation must reflect the student’s own performance.
