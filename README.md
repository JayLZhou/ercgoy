# GO-Y — Project Website

**Unifying Graph Databases and Causal Models** — the official homepage for the ERC Advanced Grant
**GO-Y** (pronounced *“go why”*), led by Prof. Angela Bonifati at the Database (BD) team,
CNRS LIRIS / Université Claude Bernard Lyon 1.

A fast, dependency-free **static site** — just HTML, CSS and vanilla JS. No build step, no framework.

🌐 **Live:** https://erc-go-y.projet.liris.cnrs.fr/ (official, LIRIS) · **Preview:** https://jaylzhou.github.io/ercgoy/ · **Repo:** https://github.com/JayLZhou/ercgoy

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, scientific gap, six objectives (constellation chart), applications, ERC funding, hiring |
| `people.html` | PI, team (with photos), and open positions |
| `publications.html` | Filterable list of foundational & recent publications |
| `events.html` | News timeline, planned workshops/schools, community venues |

## Structure

```
.
├── index.html  people.html  publications.html  events.html
├── assets/
│   ├── css/style.css          # all styles (design tokens at the top, in :root)
│   ├── js/main.js             # mobile menu, nav highlight, publication filters
│   └── img/
│       ├── favicon.svg        # causal-graph logomark
│       ├── eu-emblem.svg      # official EU emblem (required ERC acknowledgement)
│       ├── logos/             # ERC, CNRS, Lyon 1, LIRIS
│       └── people/            # member photos (480×480 squares)
├── deploy-liris.sh            # publish to the LIRIS server
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

### LIRIS (official project domain)

The official site is the LIRIS project account `erc-go-y`, served at
**https://erc-go-y.projet.liris.cnrs.fr/** from `/home-projets/erc-go-y/public_html/` on
`connect.liris.cnrs.fr`. Publish with:

```bash
./deploy-liris.sh -n   # dry run: list what would change
./deploy-liris.sh      # upload, then check the live pages match
```

The script logs in as `yzhou1` with the key `~/.ssh/id_rsa_dsf` (override with `LIRIS_LOGIN` /
`LIRIS_KEY`) and uploads only the four pages and `assets/`. Always commit and push to GitHub as well,
so the repo stays the source of truth. After changing `style.css` or `main.js`, bump the `?v=` date
on their links in all four pages so browsers fetch the new files.

[DEPLOY-LIRIS.md](DEPLOY-LIRIS.md) describes an alternative GitLab CI route (not set up).

All internal links are relative, so the same files run from a sub-path or a domain root, and the
GitHub Pages preview and the LIRIS site can be served from one repo.

## Customising

- **Colours / fonts / spacing:** CSS custom properties at the top of `assets/css/style.css` (`:root`).
  Headings use Source Serif 4, body text Inter (both from Google Fonts).
- **Content:** edit the HTML directly — each page is self-contained with a shared nav/footer block.
- **Member photos:** see `assets/img/people/README.md`.

## Notes on content

Project facts (grant number `101199575`, EU contribution €2,315,565, 1 Dec 2025 – 30 Nov 2030, host
institution) come from the CORDIS fact sheet and the LIRIS/PI pages. Publications are real and link to their
DOIs. Planned workshops/schools and some news items are clearly framed as *upcoming/planned* and should be
confirmed before announcing. Update team roles and add member photos/links as the group grows.

---

*Funded by the European Union (ERC). Views and opinions expressed are those of the author(s) only and do not
necessarily reflect those of the European Union or the European Research Council.*
