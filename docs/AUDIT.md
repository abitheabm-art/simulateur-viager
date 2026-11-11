# Audit de la version V7

Statut : **ne pas publier en l'état**. Tests réalisés : jsdom (`npm test`) et calculs Python. Pas de test sur navigateur réel, pas de validation actuarielle.

## Comparaison avec le simulateur notarial
Cas : couple F76 + H80, bien 400 000 €, loyer 1 104 €/mois, bouquet 60 000 €, taux 2 %.

| | Durée | DUH | Rente/mois | Écart rente |
|---|---|---|---|---|
| Notaire | 16,4 ans | 110 097 € | ~1 383 € | – |
| V6 (TGF05/TGH05 génération 1950) | 19,8 ans | 169 867 € | 759 € | −45 % |
| V7 (INSEE 2012-2016) | 15,7 ans | 140 657 € | 1 105 € | −20 % |
| V7, abattement 40 %, sans indexation | 15,7 ans | 105 493 € | 1 472 € | +6 % |

## Corrections apportées en V7
1. Table de mortalité INSEE par défaut : TGF05/TGH05 sont prudentes sur la longévité (19,6 ans pour ce couple, même avec la génération exacte).
2. Libellé « charges supportées par l'acquéreur » corrigé en « par l'occupant ».
3. Paramètres de calcul masqués au public (`EXPERT_MODE=false`), la réversion reste visible.
4. Messages d'erreur lisibles, recalcul avec anti-rebond de 350 ms.
5. Âge maximum 100 ans (la table INSEE s'arrête à 104 ans), alertes de cohérence.

## Décisions restantes
- Faire valider table, taux (2 %), indexation (1,5 %) et abattement (20 %) par un notaire ou un actuaire.
- Rechercher une table plus récente que 2012-2016, ou celle utilisée par le notaire.
- Réintégrer le loyer issu de l'observatoire (zone BDR 3) et le champ taxe foncière, présents avant la V6.
- Le site affiche encore doohome13@gmail.com ; l'adresse de contact annoncée est contact@abithea-littoral-provence.fr.
- Faire valider les mentions « simulation non contractuelle » avant de retirer `noindex`.
- Tester sur Safari iOS et Chrome Android (curseur, clavier, lecteur d'écran).

## Correction d'une erreur de la note V7
Les trois fichiers `morta_niv_2016*.xls` ont un contenu strictement identique (mêmes feuilles, mêmes valeurs) ; ils ne diffèrent que par leurs octets. Un seul est conservé dans `data/`.
