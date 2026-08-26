# Deploying GO-Y to `projet.liris.cnrs.fr`

Target: **`https://projet.liris.cnrs.fr/<project>/`** (e.g. `.../go-y/`)

This repo already contains `.gitlab-ci.yml`, adapted from the
[LIRIS Hugo-theme deployment docs](https://projet.liris.cnrs.fr/hugo-theme/docs/deployment/).
The pipeline builds nothing (the site is plain static HTML/CSS/JS) and rsyncs the
files to the LIRIS project space on every push to `main`.

> **Why no Hugo?** The LIRIS pipeline publishes whatever ends up in `public/` —
> for a Hugo site that is `hugo build` output, here it is the static files
> themselves. All internal links are **relative**, so the site works unchanged at
> any sub-path (verified locally under `/go-y/`).

---

## Steps

### 1. Request the project space (do this first — it is the long pole)

Ask the LIRIS IT team to create a project web space, which gives you:

- a directory `/home-projets/<project>/public_html` on `connect.liris.cnrs.fr`
- the public URL `https://projet.liris.cnrs.fr/<project>/`
- an rsync-restricted (`rrsync`) account for CI to push into it

Contact: the LIRIS IT service that maintains the theme — the Hugo theme lives at
`gitlab.liris.cnrs.fr/cell-si/hugo-theme-liris`, so **cell-si** is the group to
ask (confirm the current channel with the lab: a ticket, `sysadmin@liris.cnrs.fr`,
or Angela's admin contact). Mention it is for the **ERC GO-Y** project and give
the desired short name, e.g. `go-y`.

### 2. Create the GitLab repo

```bash
git remote add liris https://gitlab.liris.cnrs.fr/<group>/go-y.git
git push --set-upstream liris main
```

(GitHub stays as-is; `.gitlab-ci.yml` is ignored by GitHub, and GitHub Pages
keeps working as a preview. Push to both remotes to keep them in sync.)

### 3. Create the deploy SSH key

```bash
ssh-keygen -t ed25519 -C "goy-gitlab-ci" -f ~/.ssh/goy_ci
```

Give the **public** key (`~/.ssh/goy_ci.pub`) to LIRIS IT so it is installed on
the rsync account. Keep the private key for step 4.

### 4. Set the CI/CD variables

In GitLab: **Settings → CI/CD → Variables**

| Variable | Value | Notes |
|---|---|---|
| `LIRIS_LOGIN` | your LIRIS login | the rsync account |
| `SSH_PRIVATE_KEY` | contents of `~/.ssh/goy_ci` | mark **Masked**/**Protected** |
| `SSH_KNOWN_HOSTS` | output of `ssh-keyscan connect.liris.cnrs.fr` | |

```bash
ssh-keyscan connect.liris.cnrs.fr        # paste the output into SSH_KNOWN_HOSTS
```

### 5. Push and verify

```bash
git push liris main
```

The pipeline runs `build` → `deploy`. Then open
`https://projet.liris.cnrs.fr/<project>/` and hard-refresh.

---

## Notes

- **Adding a page?** Add its filename to the `cp` line in `.gitlab-ci.yml`'s
  `build` job, or switch that line to a glob (`cp *.html public/`).
- **`--delete`** is on: files removed from the repo are removed from the server.
- **Custom sub-domain** (e.g. `go-y.liris.cnrs.fr`) is a separate request to
  LIRIS IT; the site itself needs no change, since all paths are relative.
- If LIRIS asks for the **official theme** for branding consistency, the content
  here maps onto it directly: `people.html` → `content/members/`,
  `publications.html` → `content/publications/`, `events.html` →
  `content/events/` (see the theme's *Adding members / publications / events*
  docs). That is a rewrite, not a redeploy — ask before starting it.
