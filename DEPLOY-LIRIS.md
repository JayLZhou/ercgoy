# Deploying GO-Y to a `liris.cnrs.fr` address

Confirmed by the LIRIS technical service: a static site can be hosted under
`liris.cnrs.fr` by requesting a **project account** and synchronising a GitLab
project onto it.

**Official references (LIRIS intranet — requires login):**

- Request a project account — <https://liris.cnrs.fr/intranet/service-technique/compte-projet>
- Static-site continuous integration — <https://liris.cnrs.fr/intranet/service-technique/integration-contenue-site-statique>

This repo already ships `.gitlab-ci.yml`, built on the same LIRIS infrastructure
(`connect.liris.cnrs.fr` + rsync into the project's `public_html`) that the
[LIRIS Hugo-theme deployment docs](https://projet.liris.cnrs.fr/hugo-theme/docs/deployment/)
describe. **Check it against the intranet static-site doc above and adjust the
rsync target if that doc specifies a different path.**

> **No Hugo rewrite needed.** LIRIS explicitly supports static sites, and their
> pipeline publishes whatever lands in `public/`. Our `build` job assembles the
> static files directly. All internal links are **relative**, so the site works
> unchanged whether the final URL is a sub-domain (`go-y.liris.cnrs.fr`) or a
> sub-path (`projet.liris.cnrs.fr/go-y/`) — verified locally under `/go-y/`.

---

## Steps

### 1. Request the project account  ← start here

Fill the form at
<https://liris.cnrs.fr/intranet/service-technique/compte-projet>.
Draft answers are in [`liris-account-request.md`](liris-account-request.md) —
copy/paste and adjust.

You should come back with:

- a project account + its `public_html` directory on `connect.liris.cnrs.fr`
- the public URL (confirm whether it is `go-y.liris.cnrs.fr` or
  `projet.liris.cnrs.fr/go-y/`)
- the login to use as `LIRIS_LOGIN` below

### 2. Create the GitLab repo and push

```bash
git remote add liris https://gitlab.liris.cnrs.fr/<group>/go-y.git
git push --set-upstream liris main
```

GitHub stays as-is: `.gitlab-ci.yml` is inert on GitHub, so GitHub Pages keeps
serving the preview. Push to both remotes to keep them in sync.

### 3. Create the deploy SSH key

```bash
ssh-keygen -t ed25519 -C "goy-gitlab-ci" -f ~/.ssh/goy_ci
```

Send the **public** key (`~/.ssh/goy_ci.pub`) to the technical service so it is
installed on the project account. Keep the private key for step 4.

### 4. Set the CI/CD variables

GitLab → **Settings → CI/CD → Variables**

| Variable | Value | Notes |
|---|---|---|
| `LIRIS_LOGIN` | the project account login | used as the rsync target |
| `SSH_PRIVATE_KEY` | contents of `~/.ssh/goy_ci` | mark **Masked** + **Protected** |
| `SSH_KNOWN_HOSTS` | output of `ssh-keyscan connect.liris.cnrs.fr` | |

```bash
ssh-keyscan connect.liris.cnrs.fr        # paste output into SSH_KNOWN_HOSTS
```

### 5. Push and verify

```bash
git push liris main
```

Pipeline runs `build` → `deploy`; then open the project URL and hard-refresh.

---

## Notes

- **Adding a page?** Add its filename to the `cp` line in the `build` job of
  `.gitlab-ci.yml`, or switch to a glob (`cp *.html public/`).
- **`--delete` is on**: files removed from the repo are removed from the server.
- If the intranet doc gives a different rsync destination (e.g. an explicit
  `…:public_html/` path rather than the bare `…:` used by the Hugo-theme docs),
  update the `rsync` line in `.gitlab-ci.yml` to match.
