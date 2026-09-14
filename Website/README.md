# ConnectX

Next.js 14 (App Router) + TypeScript + Tailwind CSS landing page for ConnectX.

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Production build

```bash
npm run build
npm run start
```

## Notes

- Fully responsive (mobile, tablet, desktop).
- SEO metadata, Open Graph/Twitter tags, `sitemap.xml`, and `robots.txt` are set up in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts`. Update `siteUrl` in `app/layout.tsx` and `app/sitemap.ts`/`app/robots.ts` once you have your final domain.
- Logo lives at `public/logo.png` — swap it out any time for a new export.
- Fonts (Poppins + Inter) load via Google Fonts `<link>` tags in `app/layout.tsx` for maximum host compatibility. If you'd rather self-host them, swap in `next/font/google`.
- All sections are separate components under `components/` — Header, Hero, Stats, HowItWorks, Features, ExpertCTA, Testimonials, FAQ, DownloadCTA, Footer — edit copy and content directly there.
