#!/usr/bin/env bash
# Publish the GO-Y site to the LIRIS project account "erc-go-y".
#
#   ./deploy-liris.sh       upload the pages and assets that changed
#   ./deploy-liris.sh -n    dry run: list what would change, upload nothing
#
# Live site: https://erc-go-y.projet.liris.cnrs.fr/
# Logs in to connect.liris.cnrs.fr as yzhou1 with the SSH key ~/.ssh/id_rsa_dsf
# (it falls back to asking for the LIRIS password if the key is refused).
# Override with:  LIRIS_LOGIN=<login> LIRIS_KEY=<key file> ./deploy-liris.sh
set -euo pipefail
cd "$(dirname "$0")"

LOGIN="${LIRIS_LOGIN:-yzhou1}"
KEY="${LIRIS_KEY:-$HOME/.ssh/id_rsa_dsf}"
DEST="$LOGIN@connect.liris.cnrs.fr:/home-projets/erc-go-y/public_html/"
SITE="https://erc-go-y.projet.liris.cnrs.fr"
PAGES="index.html people.html publications.html events.html"

# Only the published site goes up (no .git, README, deploy notes...).
# Files are made world-readable so the web server can always serve them.
# No --delete: a file removed here must also be removed on the server by hand.
# -c compares file contents, so only files that really changed are sent.
rsync -rlptzcv -e "ssh -i '$KEY' -o IdentitiesOnly=yes" \
  --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r --exclude='.DS_Store' \
  "$@" $PAGES assets "$DEST"

for arg in "$@"; do
  case "$arg" in -n|--dry-run) echo "Dry run: nothing was uploaded."; exit 0 ;; esac
done

# Check that the live pages now match the local ones.
echo "Checking $SITE/ ..."
for f in $PAGES; do
  if curl -fsS --max-time 20 "$SITE/$f" | cmp -s - "$f"; then
    echo "  ok       $f"
  else
    echo "  DIFFERS  $f  (try again in a minute)"
  fi
done
