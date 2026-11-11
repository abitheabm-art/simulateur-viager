# Simulateur de viager occupé – ABITHÉA Littoral Provence

Page web autonome (un seul fichier HTML) qui estime, pour un viager occupé, la valeur du **droit d'usage et d'habitation (DUH)**, le **bouquet** et la **rente mensuelle**, avec un curseur pour faire varier bouquet et rente.

> **Statut : version de test (V7), non validée.** Aucune validation actuarielle ou notariale. La page porte `noindex,nofollow` et ne doit pas être mise en production en l'état. Voir `docs/AUDIT.md`.

## Contenu du dépôt

| Dossier | Rôle |
|---|---|
| `site/simulateur-viager-occupe.html` | Le simulateur (HTML + CSS + JS, aucune dépendance) |
| `tests/` | Tests de bout en bout (jsdom) : `npm test` |
| `data/` | Tables de mortalité sources (INSEE 2012-2016, TGF05/TGH05) |
| `scripts/` | Comparaison des tables de mortalité avec le simulateur notarial (Python) |
| `docs/` | Audit (`AUDIT.md`) et mise en ligne (`DEPLOIEMENT.md`) |

## Méthode de calcul

1. **Valeur locative nette annuelle** = loyer mensuel × 12 × (1 − abattement) − charges supportées par l'occupant.
2. **DUH** = valeur locative nette × coefficient de capitalisation (probabilité de survie du dernier survivant, actualisée au taux technique, sans indexation).
3. **Valeur occupée** = valeur libre − DUH.
4. **Rente mensuelle** = (valeur occupée − bouquet) ÷ coefficient de rente ÷ 12. La rente est indexée et réversible selon le paramètre saisi pour un couple.

### Hypothèses actuelles

| Paramètre | Valeur | Où la changer |
|---|---|---|
| Table de mortalité | INSEE 2012-2016, ensemble de la population | constante `MORTALITY_TABLE` |
| Taux d'actualisation | 2 % | champ `rate` |
| Indexation de la rente | 1,5 % par an | champ `growth` |
| Abattement d'occupation | 20 % | champ `discount` |
| Versement | mensuel, à terme échu | fonction `factor` |
| Paramètres experts | masqués au public | constante `EXPERT_MODE` |

## Limites connues

- Les hypothèses ne sont pas certifiées. Sur le cas de référence du simulateur notarial (couple de 76 et 80 ans, bien à 400 000 €, loyer de 1 104 €/mois, bouquet de 60 000 €), la V7 donne environ 1 105 €/mois contre environ 1 383 € chez le notaire. Un abattement de 40 % et l'absence d'indexation ramènent l'écart à quelques pourcents.
- La table INSEE est une table de période (2012-2016), pas une table par génération.
- Les tables TGF05/TGH05 (tables d'assureur, prudentes sur la longévité) sont disponibles mais donnent un DUH nettement plus élevé et une rente plus faible.
- Ni fiscalité, ni frais d'acte, ni santé des vendeurs, ni clause de droit de retour.
- Résultat **indicatif et non contractuel** : une vente en viager se formalise chez un notaire.

## Développement

```bash
npm install
npm test        # 11 tests, nécessite Node 20 ou plus
```

Les tests s'exécutent automatiquement à chaque `push` et chaque *pull request* (GitHub Actions, `.github/workflows/ci.yml`).

Comparatif des tables de mortalité (Python 3, `pandas`, `xlrd`) :

```bash
pip install pandas xlrd
python3 scripts/comparatif_tables_mortalite.py
```

## Mise en ligne

Voir `docs/DEPLOIEMENT.md` : version de test sur GitHub Pages (déploiement manuel) puis hébergement OVH.

## Sources

- INSEE, *Tables de mortalité par sexe, âge et niveau de vie* (2012-2016).
- Tables TGF05 et TGH05, homologuées par l'arrêté du 1er août 2006.
- Observatoire local des loyers des Bouches-du-Rhône (zone BDR 3 pour La Ciotat), utilisé dans les versions précédentes.
