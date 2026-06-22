# GO-Y — Project Website

**Unifying Graph Databases and Causal Models** — the official homepage for the ERC Advanced Grant
**GO-Y** (pronounced *“go why”*), led by Prof. Angela Bonifati at the Database (BD) team,
CNRS LIRIS / Université Claude Bernard Lyon 1.

A fast, dependency-free **static site** — just HTML, CSS and vanilla JS. No build step, no framework.

🌐 **Live:** https://jaylzhou.github.io/ercgoy/ · **Repo:** https://github.com/JayLZhou/ercgoy

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, vision/scientific gap, three research pillars, key concepts, ERC funding |
| `people.html` | PI, team, collaborators, and open positions |
| `publications.html` | Filterable list of foundational & recent publications |
| `events.html` | News timeline, planned workshops/schools, community venues |

## Structure

```
.
├── index.html  people.html  publications.html  events.html
├── assets/
│   ├── css/style.css          # full design system (dark + light themes)
│   ├── js/main.js             # nav, theme toggle, scroll-reveal, counters, pub filters
│   ├── js/graph-hero.js       # animated causal-graph hero (canvas)
│   └── img/
│       ├── favicon.svg        # causal-graph logomark
│       └── eu-emblem.svg      # official EU emblem (required ERC acknowledgement)
└── README.md
```

## Run locally

Any static file server works. With Node installed:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL (e.g. http://localhost:8080). You can also just open `index.html` directly.

## Deploy

This repo is published with **GitHub Pages** (Settings → Pages → *Deploy from a branch* → `main` / root).
A `.nojekyll` file is included so the `assets/` folder is served verbatim. Every push to `main`
re-deploys automatically; the live site is at https://jaylzhou.github.io/ercgoy/.

To update the site:

```bash
git add -A && git commit -m "Update site" && git push
```

It also works on any other static host (the LIRIS web server, Netlify, Vercel, etc.) — no
configuration required. All internal links are relative, so it runs from a subpath or a domain root.

## Customising

- **Colours / fonts / spacing:** CSS custom properties at the top of `assets/css/style.css` (`:root`).
- **Light theme:** the same tokens are overridden under `[data-theme="light"]`. A toggle is in the nav.
- **Content:** edit the HTML directly — each page is self-contained with a shared nav/footer block.
- **Hero animation:** tune node count, speed and colours in `assets/js/graph-hero.js`.

## Notes on content

Project facts (grant number `101199575`, EU contribution €2,315,565, 1 Dec 2025 – 30 Nov 2030, host
institution) come from the CORDIS fact sheet and the LIRIS/PI pages. Publications are real and link to their
DOIs. Planned workshops/schools and some news items are clearly framed as *upcoming/planned* and should be
confirmed before announcing. Update team roles and add member photos/links as the group grows.

---

*Funded by the European Union (ERC). Views and opinions expressed are those of the author(s) only and do not
necessarily reflect those of the European Union or the European Research Council.*
