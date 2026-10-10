// Reporte les réglages sur <html> ; les feuilles de style s'appuient sur ces attributs.
// Sans attribut, le thème est actif et les publicités sont masquées : rien ne clignote
// pendant la lecture (asynchrone) des réglages.
const DEFAULTS = { enabled: true, hideAds: true };

// L'extension s'applique au thème « Simple » de Zimbra (identifiant : bare). Sous un
// autre thème, elle se suspend plutôt que d'afficher un mélange des deux.
const SUPPORTED_SKIN = "bare";

let settings = DEFAULTS;
let skin = null; // inconnu tant que la page n'a pas déclaré son thème

function apply() {
  const root = document.documentElement;
  const foreignSkin = skin !== null && skin !== SUPPORTED_SKIN;
  root.toggleAttribute("data-zm-off", !settings.enabled || foreignSkin);
  root.toggleAttribute("data-zm-ads", !settings.hideAds);
}

function loadSettings() {
  browser.storage.local.get(DEFAULTS).then((stored) => {
    settings = stored;
    apply();
  });
}

loadSettings();

// La page déclare son thème dans l'adresse de sa feuille de style (« …&skin=bare »).
// On le lit dès que ce lien apparaît, avant que Zimbra ne construise l'interface.
function readSkin() {
  const link = document.querySelector('link[rel="stylesheet"][href*="skin="]');
  if (!link) return false;
  skin = new URL(link.href, location.href).searchParams.get("skin") || SUPPORTED_SKIN;
  apply();
  // Pour la fenêtre de l'extension, qui explique alors pourquoi le style est suspendu.
  browser.storage.local.set({ skin });
  return true;
}

if (!readSkin()) {
  const observer = new MutationObserver(() => {
    if (readSkin()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", () => {
    readSkin();
    observer.disconnect();
  });
}

// Description d'une tâche : Zimbra l'affiche dans un cadre (iframe) sans aucun style,
// donc dans la police par défaut du navigateur. On lui donne celle d'un mail en texte
// brut. Une feuille de style d'extension ne franchit pas un cadre : on écrit la règle
// dans son document, à chaque fois que Zimbra le recharge.
const TASK_BODY_STYLE = "body { font-family: monospace; }";

document.addEventListener(
  "load",
  (event) => {
    const frame = event.target;
    if (!(frame instanceof HTMLIFrameElement) || !frame.closest(".ZmTaskMultiView")) return;
    if (document.documentElement.hasAttribute("data-zm-off")) return;
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.head || doc.getElementById("zm-task-body")) return;
      const style = doc.createElement("style");
      style.id = "zm-task-body";
      style.textContent = TASK_BODY_STYLE;
      doc.head.append(style);
    } catch {
      // cadre d'une autre origine : rien à faire
    }
  },
  true,
);

// Zimbra mesure ses textes pour dimensionner listes déroulantes et barres d'outils : les
// polices doivent être prêtes avant qu'il ne construise l'interface. On en lance le
// chargement dès maintenant, sans attendre qu'un texte les réclame.
for (const font of ['400 13px "Archivo"', '600 13px "Archivo"', '600 18px "Figtree"', '400 13px "Chivo Mono"']) {
  document.fonts.load(font).catch(() => {});
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && Object.keys(DEFAULTS).some((key) => key in changes)) loadSettings();
});
