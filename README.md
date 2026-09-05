# Bok Yann's portfolio

Astro, TypeScript and Vue portfolio with responsive Japanese landscape artwork and a photography gallery.

## Local development

Use Node 22.12 or newer. Run `npm ci` and `npm run dev`.

## Publish

Push to `main`. GitHub Actions runs unit tests, checks publication readiness, builds the static site, and deploys GitHub Pages at https://choubokyann.github.io/.

Personal copy is in `src/data/profile.json`; gallery entries are in `src/data/gallery`. No résumé PDF is published. Project case studies are forthcoming. The approved option C trees are static; clouds, petals, headline and character have separate motion.

## Recovery

The previous Next.js website is preserved on `backup/pre-portfolio-2026-09-05`. New deployments can be rolled back by reverting the release commit and restoring the desired Pages source settings.
