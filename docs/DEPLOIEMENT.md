# Mise en ligne

La page est un fichier unique, `site/simulateur-viager-occupe.html`. Elle charge son logo et ses liens depuis `abithea-littoral-provence.fr`.

## 1. Version de test sur GitHub Pages
1. Dépôt > **Settings > Pages** > *Build and deployment* > Source : **GitHub Actions**.
2. Onglet **Actions** > « Publier la version de test » > **Run workflow**. Les tests passent d'abord ; en cas d'échec rien n'est publié.
3. Adresse : `https://abitheabm-art.github.io/simulateur-viager/simulateur-viager-occupe.html`

Points d'attention : le dépôt est public, donc la page l'est aussi. Elle contient `noindex`, ce qui demande aux moteurs de ne pas l'indexer sans l'empêcher d'être consultée par quiconque a le lien. Pour la garder confidentielle, passez le dépôt en privé (GitHub Pages sur dépôt privé dépend de votre offre).

## 2. Production sur OVH (après validation)
1. Faire valider les hypothèses (voir `docs/AUDIT.md`).
2. Dans `site/simulateur-viager-occupe.html` : retirer la balise `noindex,nofollow`, ajouter `<link rel="canonical" href="https://abithea-littoral-provence.fr/simulateur-viager-occupe.html">`, retirer le bandeau « Version de travail non publiable ».
3. Envoyer le fichier par FTP/SFTP (FileZilla) à la racine de l'hébergement, dossier `www`, à côté des autres pages du site.
4. Ajouter un lien depuis `viager-la-ciotat-ceyreste.html` et au sitemap.
5. Tester sur mobile et desktop, puis relancer `npm test` sur la version finale.

Une mise en ligne automatique vers OVH par GitHub Actions est possible (FTP avec identifiants stockés dans *Settings > Secrets*), mais je la déconseille tant que la page n'est pas validée.
