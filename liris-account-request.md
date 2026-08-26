# Demande de compte projet LIRIS — GO-Y

Draft answers for <https://liris.cnrs.fr/intranet/service-technique/compte-projet>.
Adjust the fields the form actually asks for, then delete this file once the
account exists.

---

## Fiche projet

| Champ | Valeur |
|---|---|
| **Nom du projet** | GO-Y |
| **Nom du compte souhaité** | `go-y` (ou `goy` si le tiret pose problème) |
| **Intitulé complet** | GO-Y — Unifying Graph Databases and Causal Models |
| **Type** | Projet ERC Advanced Grant (HORIZON-ERC) |
| **Référence du financement** | Grant Agreement n° 101199575, appel ERC-2024-AdG |
| **Responsable scientifique (PI)** | Prof. Angela Bonifati — angela.bonifati@univ-lyon1.fr |
| **Équipe** | Équipe BD (Base de Données), LIRIS |
| **Tutelle** | Université Claude Bernard Lyon 1 / CNRS |
| **Durée** | 1er décembre 2025 → 30 novembre 2030 (60 mois) |
| **Contact technique** | Yingli Zhou (post-doctorante GO-Y) |

## Besoin

Hébergement du **site web public du projet GO-Y** (site vitrine : présentation
du projet, objectifs scientifiques, équipe, publications, actualités et offres
de recrutement), avec une adresse en `liris.cnrs.fr`.

Le site est **entièrement statique** (HTML / CSS / JavaScript, sans base de
données ni traitement côté serveur). Il est versionné sous Git et sera
synchronisé automatiquement depuis un projet GitLab LIRIS via l'intégration
continue, conformément à la documentation « intégration continue site statique ».

## Éléments techniques

- **Volume** : environ 600 Ko (4 pages HTML + feuilles de style, scripts et images)
- **Technologie** : site statique, aucun langage serveur requis
- **Déploiement** : GitLab CI → `rsync` par SSH vers `connect.liris.cnrs.fr`
  (le fichier `.gitlab-ci.yml` est déjà prêt côté projet)
- **Clé SSH de déploiement** : une clé `ed25519` dédiée sera fournie
  (clé publique communiquée au service technique)
- **URL souhaitée** : `go-y.liris.cnrs.fr` — ou une adresse en
  `projet.liris.cnrs.fr/go-y/` si c'est le format standard

## Questions au service technique

1. L'adresse sera-t-elle un **sous-domaine** (`go-y.liris.cnrs.fr`) ou un
   **sous-répertoire** (`projet.liris.cnrs.fr/go-y/`) ?
2. Quelle est la **destination exacte du `rsync`** (répertoire `public_html`,
   chemin complet) à utiliser dans le `.gitlab-ci.yml` ?
3. À quelle adresse faut-il envoyer la **clé publique SSH** de déploiement ?

---

*Version courte pour un e-mail :*

> Bonjour,
>
> Dans le cadre du projet ERC Advanced Grant **GO-Y** (« Unifying Graph
> Databases and Causal Models », GA n° 101199575), porté par Prof. Angela
> Bonifati au sein de l'équipe BD, nous souhaiterions créer un **compte projet**
> afin d'héberger le site web public du projet à une adresse en `liris.cnrs.fr`.
>
> Il s'agit d'un site **statique** (~600 Ko, HTML/CSS/JS, sans base de données),
> versionné sur GitLab et destiné à être synchronisé automatiquement via
> l'intégration continue.
>
> Pourriez-vous nous indiquer la destination exacte du `rsync` ainsi que
> l'adresse à laquelle transmettre la clé publique SSH de déploiement ?
>
> Merci d'avance,
