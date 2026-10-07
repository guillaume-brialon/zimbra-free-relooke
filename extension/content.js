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

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  browser.storage.local.get(DEFAULTS).then(apply);
});
