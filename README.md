# Xpectrum AI — homepage

The public marketing homepage for Xpectrum AI, as a standalone Next.js app.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Links into the product

The page links to `/auth/signin`, `/auth/signup` and `/agents`. Set the
`APP_URL` environment variable (for example `https://app.example.com`) and
those paths redirect to the real app.

## Where things are

- `src/modules/landing/` — every section of the page
- `src/modules/landing/walkthrough/` — the animated "build your first agent" demo
- `src/styles/xpectrum-landing.css` — theme tokens, animations, backgrounds
