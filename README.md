# Relooking pour le Zimbra de Free

Extension Firefox qui modernise l'apparence du webmail Zimbra de Free
([zimbra.free.fr](https://zimbra.free.fr/)) : couleurs, typographie, icônes et
espacements. Elle ne change que le style des pages ; le webmail fonctionne comme avant.

Extension non officielle, sans lien avec Free ni Zimbra.

## Ce qu'elle fait

- Applique un thème clair aux vues du webmail : courrier, rédaction, carnet d'adresses,
  calendrier, tâches, porte-documents, recherche et préférences.
- Remplace les polices par Archivo, Figtree et Chivo Mono, embarquées dans l'extension.
- Redessine les icônes les plus visibles en SVG au trait.
- Masque les encarts publicitaires (réglage désactivable).

Elle ne demande que la permission `storage`, pour retenir ses deux réglages. Elle ne
collecte aucune donnée et n'envoie aucune requête : polices et icônes sont dans
l'extension.

## Prérequis

- Firefox 128 ou plus récent.
- Le thème « Simple » de Zimbra, à choisir dans Préférences > Général. Sous un autre
  thème, l'extension se suspend plutôt que d'afficher un mélange des deux, et sa fenêtre
  l'indique.

Les versions HTML simplifiée et mobile du webmail ne sont pas concernées.

## Installation

L'extension n'est pas publiée sur addons.mozilla.org. Pour l'essayer depuis ce dépôt :

1. Ouvrir `about:debugging#/runtime/this-firefox` dans Firefox.
2. Cliquer sur « Charger un module complémentaire temporaire… ».
3. Choisir le fichier `extension/manifest.json`.

Un module chargé ainsi disparaît à la fermeture de Firefox.

## Réglages

Un clic sur l'icône de l'extension ouvre une fenêtre à deux cases :

- **Activer le nouveau style** : rend au webmail son apparence d'origine quand elle est
  décochée.
- **Masquer les encarts publicitaires**.

Si la mise en page paraît décalée après un changement, recharger la page du webmail.

## Développement

```bash
npm install
```

| Commande | Rôle |
|---|---|
| `npm start` | lance Firefox avec l'extension chargée, sur le webmail |
| `npm run lint` | vérifie l'extension avec web-ext |
| `npm run build` | produit le paquet dans `dist/` |
| `npm run icons` | régénère `extension/css/icons.css` depuis `tools/icons.mjs` |
| `npm run bench` | lance le banc d'essai hors ligne |

Organisation du dépôt :

- `extension/` : l'extension elle-même, seul dossier livré. Les feuilles de style de
  `css/` sont chargées dans l'ordre du `manifest.json` ; `content.js` reporte les
  réglages sur la page et lit le thème de Zimbra.
- `tools/` : le générateur d'icônes et le banc d'essai.

### Banc d'essai

Le webmail exige une session Free. Le banc d'essai (`tools/bench.mjs`) sert donc une
copie enregistrée d'une page, avec les feuilles de style de l'extension injectées comme
le ferait Firefox, sur `http://localhost:8765/`.

Ces copies contiennent des données personnelles et le CSS de Zimbra : elles ne sont pas
dans le dépôt. Le banc les attend dans un dossier `reference/`, non suivi :

- `site.html` : le DOM d'une page du webmail une fois construite ;
- `site-simple.css` : la feuille de style de Zimbra sous le thème « Simple » ;
- `site.css` : celle d'un autre thème, servie par défaut, pour vérifier qu'un changement
  ne dépend pas du thème ;
- `Zimlets-nodev_all.css` : la feuille de style des zimlets.

Paramètres d'adresse :

| Paramètre | Effet |
|---|---|
| `?snap=1-mail.html` | sert une autre copie de page de `reference/` |
| `?theme=off` | rendu d'origine, sans l'extension |
| `?skin=simple` | feuille du thème « Simple » (`site-simple.css`) au lieu de `site.css` |
| `?view=prefs` | vue Préférences |
| `?show=1` | déplie les menus et les dialogues |
| `?js=1` | exécute aussi `content.js`, avec un faux stockage de réglages |

Les icônes d'origine du webmail ne s'y affichent pas, et la mise en page que calcule le
JavaScript de Zimbra y est figée.

## Licence

Le code est distribué sous [licence MIT](LICENCE).

Les polices embarquées gardent leur propre licence, la SIL Open Font License 1.1 :
voir [extension/fonts/LICENCES.md](extension/fonts/LICENCES.md).
