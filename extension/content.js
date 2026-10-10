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
  // Les fenêtres séparées (éditeur de document) chargent la leur par « @import ».
  const imported = [...document.querySelectorAll("style")].map((style) => /[?&]skin=([\w-]+)/.exec(style.textContent)).find(Boolean);
  if (!link && !imported) return false;
  skin = (link ? new URL(link.href, location.href).searchParams.get("skin") : imported[1]) || SUPPORTED_SKIN;
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

// Cadres (iframes) que Zimbra remplit sans aucun style, donc dans la police par défaut
// du navigateur. Une feuille de style d'extension ne franchit pas un cadre : on écrit
// la règle dans son document, à chaque fois que Zimbra le recharge.
const FRAME_STYLES = [
  // Description d'une tâche : la police d'un mail en texte brut.
  { within: ".ZmTaskMultiView", css: () => "body { font-family: monospace; }" },
  // Aperçu d'un fichier du porte-documents : le message d'attente (« Création de
  // l'aperçu… ») prend la police de l'interface. Un véritable aperçu apporte ses propres
  // styles : on n'y touche pas.
  {
    within: ".PreviewFrame",
    unstyledOnly: true,
    css: () => `@font-face { font-family: "Archivo"; font-weight: 100 900; src: url("${browser.runtime.getURL("fonts/archivo-latin.woff2")}") format("woff2"); }
body { font-family: "Archivo", "Segoe UI", system-ui, sans-serif; font-size: 13px; color: ${getComputedStyle(document.documentElement).getPropertyValue("--zm-text-muted") || "#4d6177"}; }`,
  },
];

document.addEventListener(
  "load",
  (event) => {
    const frame = event.target;
    if (!(frame instanceof HTMLIFrameElement)) return;
    const rule = FRAME_STYLES.find(({ within }) => frame.closest(within));
    if (!rule || document.documentElement.hasAttribute("data-zm-off")) return;
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.head || doc.getElementById("zm-frame-style")) return;
      if (rule.unstyledOnly && doc.querySelector('style, link[rel~="stylesheet"]')) return;
      const style = doc.createElement("style");
      style.id = "zm-frame-style";
      style.textContent = rule.css();
      doc.head.append(style);
    } catch {
      // cadre d'une autre origine (lecteur PDF du navigateur…) : rien à faire
    }
  },
  true,
);

// Dossiers de couleur. Zimbra fabrique l'image d'un dossier coloré sans rien noter dans
// la page : seuls ses pixels portent la couleur. Quand une image d'arbre apparaît
// (l'animation « zm-folder-probe » d'icons.css le signale), on en lit la teinte moyenne ;
// si elle s'écarte de celle du dossier ordinaire, data-zm-tint demande à la feuille de
// style un dossier à cette couleur.
const PLAIN_FOLDER = [212, 163, 85]; // teinte moyenne du dossier jaune d'origine
const probeCanvas = document.createElement("canvas");
probeCanvas.width = probeCanvas.height = 16;
const probeContext = probeCanvas.getContext("2d", { willReadFrequently: true });

// Certains réglages de confidentialité font mentir la lecture d'un canevas : on s'en
// assure sur une couleur connue, et on renonce alors à colorer les dossiers.
function canReadPixels() {
  try {
    probeContext.clearRect(0, 0, 16, 16);
    probeContext.fillStyle = "rgb(10, 200, 90)";
    probeContext.fillRect(0, 0, 16, 16);
    const [r, g, b] = probeContext.getImageData(8, 8, 1, 1).data;
    return r === 10 && g === 200 && b === 90;
  } catch {
    return false;
  }
}

function markTintedFolder(img) {
  try {
    probeContext.clearRect(0, 0, 16, 16);
    probeContext.drawImage(img, 0, 0, 16, 16);
    const { data } = probeContext.getImageData(0, 0, 16, 16);
    const sum = [0, 0, 0];
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] <= 128) continue;
      sum[0] += data[i];
      sum[1] += data[i + 1];
      sum[2] += data[i + 2];
      count++;
    }
    if (!count) return;
    const distance = Math.hypot(...sum.map((channel, i) => channel / count - PLAIN_FOLDER[i]));
    img.toggleAttribute("data-zm-tint", distance > 50);
  } catch {
    // image illisible : le dossier garde son dessin ordinaire
  }
}

if (probeContext && canReadPixels()) {
  document.addEventListener("animationstart", (event) => {
    if (event.animationName !== "zm-folder-probe") return;
    const img = event.target;
    if (img.complete && img.naturalWidth) markTintedFolder(img);
    else img.addEventListener("load", () => markTintedFolder(img), { once: true });
  });
}

// Zimbra mesure ses textes pour dimensionner listes déroulantes et barres d'outils : les
// polices doivent être prêtes avant qu'il ne construise l'interface. On en lance le
// chargement dès maintenant, sans attendre qu'un texte les réclame.
for (const font of ['400 13px "Archivo"', '600 13px "Archivo"', '600 18px "Figtree"', '400 13px "Chivo Mono"']) {
  document.fonts.load(font).catch(() => {});
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && Object.keys(DEFAULTS).some((key) => key in changes)) loadSettings();
});
