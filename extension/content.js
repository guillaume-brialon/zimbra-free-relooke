// Reporte les réglages sur <html> ; les feuilles de style s'appuient sur ces attributs.
// Sans attribut, le thème est actif et les publicités sont masquées : rien ne clignote
// pendant la lecture (asynchrone) des réglages.
const DEFAULTS = { enabled: true, hideAds: true };

function apply(settings) {
  const root = document.documentElement;
  root.toggleAttribute("data-zm-off", !settings.enabled);
  root.toggleAttribute("data-zm-ads", !settings.hideAds);
}

browser.storage.local.get(DEFAULTS).then(apply);

// Zimbra mesure ses textes pour dimensionner listes déroulantes et barres d'outils : les
// polices doivent être prêtes avant qu'il ne construise l'interface. On en lance le
// chargement dès maintenant, sans attendre qu'un texte les réclame.
for (const font of ['400 13px "Archivo"', '600 13px "Archivo"', '600 18px "Figtree"', '400 13px "Chivo Mono"']) {
  document.fonts.load(font).catch(() => {});
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  browser.storage.local.get(DEFAULTS).then(apply);
});
