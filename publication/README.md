# Publication sur addons.mozilla.org

Ce dossier garde ce qui a été saisi sur le site des modules de Firefox pour publier
l'extension : les textes de la fiche, son icône, sa capture d'écran et les notes aux
relecteurs. Rien de ce dossier n'entre dans le paquet de l'extension.

Relevé du 11 octobre 2026, pour la version 1.0.0, alors en attente de relecture.

## Fiche

| Champ | Valeur |
|---|---|
| Nom | Relooking pour le Zimbra de Free |
| Adresse | https://addons.mozilla.org/firefox/addon/relooking-pour-zimbra-de-free/ |
| Identifiant | `zimbra-free-relooke@brialon.com` |
| Langue par défaut | Français |
| Catégorie | Appearance |
| Tags | aucun |
| Page d'accueil | https://brialon.com |
| Assistance | https://github.com/guillaume-brialon/zimbra-free-relooke/issues (pas d'adresse de courriel) |
| Expérimental | non |
| Paiement requis | non |

### Résumé

Repris du champ `description` de `extension/manifest.json`.

```text
Modernise l'apparence du webmail Zimbra de Free (zimbra.free.fr, thème Simple) : couleurs, typographie, icônes, espacements. Extension non officielle, sans lien avec Free ni Zimbra.
```

### Description

```text
Le webmail Zimbra de Free (zimbra.free.fr) fonctionne plutôt bien, mais son apparence est vraiment datée. Cette extension lui donne une allure actuelle, sans rien changer à son fonctionnement : vos mails, vos dossiers, vos contacts et vos réglages restent exactement là où ils sont.

Ce qui change :
- des couleurs claires et un contraste plus net,
- des polices modernes et lisibles (Archivo, Figtree, Chivo Mono),
- des icônes redessinées au trait,
- des espacements plus aérés dans les listes, les formulaires et les menus,
- les encarts publicitaires masqués (vous pouvez les réafficher dans les réglages).

Toutes les vues sont concernées : courrier, rédaction, carnet d'adresses, calendrier, tâches, porte-documents, recherche et préférences.

Avant de commencer :
L'extension fonctionne avec le thème "Simple" de Zimbra. Pour le choisir, ouvrez Préférences > Général dans le webmail, sélectionnez le thème "Simple", puis rechargez la page. Sous un autre thème, l'extension se met en pause et vous l'indique.

Réglages :
Un clic sur l'icône de l'extension permet de désactiver le nouveau style, pour retrouver l'apparence d'origine, ou de réafficher les encarts publicitaires.

Vie privée :
Firefox indique que l'extension peut "accéder à vos données pour zimbra.free.fr" : c'est la mention standard pour toute extension qui modifie l'apparence d'un site. Celle-ci ne collecte aucune donnée et n'envoie aucune requête ; elle ne fait qu'appliquer des feuilles de style à la page. Son autre permission sert à retenir vos deux réglages sur votre ordinateur.

Extension non officielle, sans lien avec Free ni Zimbra. Le code source est libre, sous licence MIT : https://github.com/guillaume-brialon/zimbra-free-relooke
```

## Images

| Fichier | Rôle |
|---|---|
| `icon.svg` | dessin d'origine de l'icône de la fiche |
| `icon-128.png` | la même en 128 × 128, telle que téléversée |
| `capture-mail.png` | capture d'écran de la vue des mails, 1440 × 900 |

Le paquet 1.0.0 embarque une autre icône, `extension/icons/icon.svg`.

La capture vient du banc d'essai, rendue dans Firefox avec la feuille du thème
« Simple ». Tout ce qu'elle montre est inventé : le compte, les dossiers, les
discussions et le message affiché.

## Soumission de la version 1.0.0

À la question sur l'usage d'un minifieur, d'un outil d'assemblage, d'un moteur de
gabarits ou d'un autre outil de prétraitement, la réponse est oui : `css/icons.css` est
produit par `tools/icons.mjs`. Le code source est donc joint, sous la forme d'une
archive du dépôt :

```bash
git archive --format=zip --prefix=zimbra-free-relooke/ -o dist/zimbra-free-relooke-source-1.0.0.zip 805b55e
```

### Notes aux relecteurs

```text
WHAT IT DOES
A restyle of the Zimbra webmail of the French ISP Free (zimbra.free.fr). It only injects CSS, plus a small content script (content.js, about 160 lines). It runs on https://zimbra.free.fr/zimbra/* only.

HOW TO TEST
The webmail requires a Free subscriber mailbox; I cannot share credentials.
The extension only applies to Zimbra's "Simple" skin: in the webmail, go to Préférences > Général, choose the "Simple" theme, then reload. Under any other skin the extension suspends itself and its popup explains why.

SOURCE CODE AND BUILD
No minifier, bundler or transpiler is used. The package is the "extension/" directory of the public repository, zipped as is:
https://github.com/guillaume-brialon/zimbra-free-relooke (commit 805b55e)

One file is generated: css/icons.css, written by tools/icons.mjs, a plain Node script without dependencies. It is readable CSS containing inline SVG data URIs. To reproduce the package exactly:
1. git clone the repository and check out commit 805b55e
2. npm install            (installs web-ext only)
3. node tools/icons.mjs   (rewrites extension/css/icons.css, identical to the committed file)
4. npm run build          (web-ext build, output in dist/)
Tested with Node 22.

WHAT THE CONTENT SCRIPT DOES
- Reads two settings from storage.local and sets attributes on <html>, which the stylesheets rely on.
- Reads the Zimbra skin name from the page's stylesheet URL and stores it in storage.local, so the popup can say why the style is suspended.
- Adds a <style> element to two same-origin iframes that Zimbra leaves unstyled (task description, file preview placeholder).
- Draws Zimbra's folder icons on a 16x16 canvas and reads their average colour with getImageData, to tell coloured folders from plain ones. The result only toggles an attribute on the image; nothing is stored or sent.
- Preloads the bundled fonts with document.fonts.load.

PRIVACY AND PERMISSIONS
- Only permission: "storage", for the two settings and the skin name.
- No network request, no remote code, no eval, no innerHTML. Fonts and icons are bundled.
- web_accessible_resources exposes fonts/*.woff2 to zimbra.free.fr, as required by @font-face in a content stylesheet.

ADS
By default the CSS hides the advertising iframes served from passback.free.fr. This is stated in the listing and can be turned off in the popup.

BUNDLED FONTS
Archivo, Figtree and Chivo Mono, under the SIL Open Font License 1.1. The licence texts are in fonts/.

VALIDATION WARNINGS
The two "strict_min_version" warnings are known: Firefox 128 to 139 ignore the data_collection_permissions key. The minimum version will be raised to 140 in the next release.
```
