# 11th Grade MEB English

The website contains page-number buttons and completed answer-key pages only. It covers Unit 1 (Student’s Book pages 10–24) and Unit 2 (pages 26–36).

Click a page number to display the original book page with typed blue answers, marked choices and brief model responses. Click the page image to enlarge it; click again to return to the fitted view. Original page links remain supported.

## Source and answers

The original page artwork comes from the teacher-supplied 2026–2027 Grade 11 Yıldırım English Student’s Book PDF. Fixed answers follow the previously supplied Teacher’s Guide. Short model responses are examples and can be personalised. Longer responses are placed beside their numbered exercises on the same completed page, preserving the original questions. No later units or theme cover pages are included.

## Run and deploy

Serve `dist/` with `python3 -m http.server 8000 --directory dist`. Netlify is configured by the root `netlify.toml` to publish `dist`. Future GitHub pushes redeploy the connected Netlify site.

Validate with `node scripts/validate.mjs` and `node --check dist/app.js`. Validation checks all 26 completed page images as well as the answer content.

## Rebuild the annotated pages

Run `python scripts/annotate-book.py /absolute/path/to/original.pdf`. This uses PyMuPDF and Pillow, with the DejaVu Sans font installed. The original PDF is kept outside the repository.

The script creates the 26 WebP page images in `dist/pages/`, an annotation audit in `docs/annotation-audit.json`, and a local intermediate PDF (ignored by Git). Each numbered image corresponds to the printed Student’s Book page. The answer JSON remains available for screen-reader text and future content maintenance.

## Future units

Add the verified answer data and completed page images for the next supplied unit, then add its page range to the `units` array in `dist/app.js` and its data entry to `dist/data/manifest.json`. Existing page numbers and URLs should remain stable.

This is an independent teaching resource, not an official MEB publication.
