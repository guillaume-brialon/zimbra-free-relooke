// Banc d'essai hors ligne : sert le snapshot site.html avec les feuilles de style
// de l'extension injectées comme le ferait Firefox.
//
//   node tools/bench.mjs            puis http://localhost:8765/
//   http://localhost:8765/?theme=off   rendu d'origine, pour comparer
//   http://localhost:8765/?view=prefs  vue Préférences ; ?show=1 déplie menus et dialogues
//
// Limites : les images du webmail (icônes) exigent une session Free et ne s'affichent
// pas ici ; la mise en page calculée par le JavaScript de Zimbra est figée, bench.js
// n'en rejoue que le calage des grandes zones.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = normalize(join(fileURLToPath(import.meta.url), "..", ".."));
const EXT = join(ROOT, "extension");
const PORT = Number(process.env.PORT) || 8765;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

async function page(themed, snapshot) {
  let html = await readFile(join(ROOT, snapshot), "utf8");
  const manifest = JSON.parse(await readFile(join(EXT, "manifest.json"), "utf8"));

  html = html
    // Le snapshot est un DOM déjà construit : ses scripts ne doivent pas se rejouer.
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/href="\/zimbra\/css\/[^"]*"/, 'href="/site.css"')
    .replace(/href="\/service\/zimlet\/res\/Zimlets-nodev_all\.css[^"]*"/, 'href="/Zimlets-nodev_all.css"')
    // Les encarts restent dans la page (pour tester leur masquage) mais ne chargent rien.
    .replace(/(<iframe\b[^>]*?)\ssrc="https:\/\/passback\.free\.fr[^"]*"/g, '$1 src="about:blank#passback.free.fr"');

  const links = themed
    ? manifest.content_scripts[0].css.map((f) => `<link rel="stylesheet" href="/ext/${f}">`).join("\n")
    : "";
  return html.replace("</head>", `${links}\n<link rel="stylesheet" href="/bench.css">\n<script src="/bench.js" defer></script>\n</head>`);
}

async function file(base, rel) {
  const full = normalize(join(base, rel));
  if (!full.startsWith(base + sep) && full !== base) throw new Error("hors racine");
  return readFile(full);
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = decodeURIComponent(url.pathname);
  try {
    let body;
    let type = TYPES[extname(path)] || "application/octet-stream";
    if (path === "/") {
      // ?snap=1-mail.html choisit un autre snapshot du dossier (site.html par défaut).
      const snap = url.searchParams.get("snap") || "site.html";
      if (!/^[\w .-]+\.html$/.test(snap)) throw new Error("snapshot invalide");
      body = await page(url.searchParams.get("theme") !== "off", snap);
      type = TYPES[".html"];
    } else if (path === "/site.css" || path === "/Zimlets-nodev_all.css") {
      body = await file(ROOT, path.slice(1));
    } else if (path === "/bench.js" || path === "/bench.css") {
      body = await file(join(ROOT, "tools"), path.slice(1));
    } else if (path.startsWith("/ext/")) {
      body = await file(EXT, path.slice(5));
    } else {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(PORT, () => console.log(`Banc d'essai : http://localhost:${PORT}/`));
