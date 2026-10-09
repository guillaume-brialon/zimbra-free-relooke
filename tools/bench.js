// Propre au banc d'essai. Rejoue à gros traits ce que fait Zimbra au chargement :
// caler chaque grande zone (positionnée en absolu) sur l'intérieur de son conteneur.

// Vue affichée au moment du snapshot : les blocs de premier niveau qui ne sont pas
// rangés hors écran, reconnus à leur identifiant.
function detect() {
  const pairs = [];
  for (const el of document.querySelectorAll("#z_shell > div[id]")) {
    if (el.style.position !== "absolute" || el.style.left === "-10000px" || el.style.display === "none") continue;
    if (el.classList.contains("ZmBrowseView")) pairs.push(["skin_container_search_builder", el.id]);
    else if (el.classList.contains("ZmBrowseToolBar")) pairs.push(["skin_container_search_builder_toolbar", el.id]);
    else if (/^ztb__/.test(el.id)) pairs.push(["skin_container_app_top_toolbar", el.id]);
    else if (/^zv__/.test(el.id) || /View(Mgr)?(\s|$)/.test(el.className)) pairs.push(["skin_container_app_main", el.id]);
    else if (/^zov__/.test(el.id)) pairs.push(["skin_container_tree", el.id]);
    else if (el.classList.contains("DwtCalendar")) pairs.push(["skin_container_tree_footer", el.id]);
  }
  return pairs;
}

const VIEWS = {
  snapshot: detect(),
  // La vue Préférences attend hors écran dans site.html.
  prefs: [
    ["skin_container_app_top_toolbar", "ztb__PREF"],
    ["skin_container_app_main", "DWT35"],
    ["skin_container_tree", "zov__main_Options"],
  ],
};
const ALWAYS = [
  ["skin_container_people_search", "ztb_people_search"],
  ["skin_container_tree_app_sash", "z_sash"],
];
let view = "snapshot";

// ?main=<id>&toolbar=<id> affiche une vue qui attend hors écran dans le snapshot
// (par exemple ?main=editcontactform&toolbar=ztb__CN pour le formulaire de contact).
{
  const params = new URLSearchParams(location.search);
  const picked = [
    ["skin_container_app_main", params.get("main")],
    ["skin_container_app_top_toolbar", params.get("toolbar")],
  ].filter(([, id]) => id && document.getElementById(id));
  if (picked.length) {
    VIEWS.picked = picked;
    view = "picked";
  }
}

function fit() {
  const active = [...VIEWS[view], ...VIEWS.snapshot.filter(([c]) => !VIEWS[view].some(([c2]) => c2 === c)), ...ALWAYS];
  for (const pairs of Object.values(VIEWS)) {
    for (const [, widgetId] of pairs) {
      const widget = document.getElementById(widgetId);
      if (widget && !active.some(([, id]) => id === widgetId)) Object.assign(widget.style, { left: "-10000px", top: "-10000px" });
    }
  }
  for (const [containerId, widgetId] of active) {
    const container = document.getElementById(containerId);
    const widget = document.getElementById(widgetId);
    if (!container || !widget) continue;
    const box = container.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    // Comme Zimbra : à l'intérieur des bordures et des marges internes du conteneur.
    const cs = getComputedStyle(container);
    const px = (prop) => parseFloat(cs[prop]) || 0;
    const left = box.left + px("borderLeftWidth") + px("paddingLeft");
    const top = box.top + px("borderTopWidth") + px("paddingTop");
    const right = box.right - px("borderRightWidth") - px("paddingRight");
    const bottom = box.bottom - px("borderBottomWidth") - px("paddingBottom");
    Object.assign(widget.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${right - left}px`,
      height: `${bottom - top}px`,
      zIndex: "300", // Zimbra : 300 pour une vue affichée, 100 pour une vue en attente
    });
  }

  // Préférences : les pages gardent la taille de l'écran d'origine.
  const prefs = document.getElementById("DWT35_page");
  if (prefs) {
    const { width, height } = prefs.parentElement.getBoundingClientRect();
    const tabs = document.getElementById("DWT35_tabbar").offsetHeight;
    for (const prefPage of prefs.querySelectorAll(":scope > .ZmPreferencesPage")) {
      Object.assign(prefPage.style, { width: `${width}px`, height: `${height - tabs}px` });
    }
  }

  // Vue mail : liste en haut, volet de lecture en bas, séparés par une poignée.
  const pane = document.querySelector(".ZmConvDoublePaneView, .ZmTradView");
  const list = pane?.querySelector(":scope > .DwtListView");
  const msg = pane?.querySelector(":scope > .ZmMailMsgView");
  if (pane && list && msg) {
    const { width, height } = pane.getBoundingClientRect();
    const sash = pane.querySelector(":scope > .AppSash-vert");
    const sashHeight = sash?.offsetHeight || 8;
    const listHeight = Math.round(height * 0.4);
    const header = list.querySelector(".DwtListView-ColHeader");
    const rows = list.querySelector(".DwtListView-Rows");
    Object.assign(list.style, { width: `${width}px`, height: `${listHeight}px` });
    // Zimbra 7 retranche une hauteur d'en-tête fixe de 24 px, sans la mesurer.
    if (rows) Object.assign(rows.style, { width: `${width}px`, height: `${listHeight - (header ? 24 : 0)}px` });
    if (sash) Object.assign(sash.style, { top: `${listHeight}px`, width: `${width}px` });
    Object.assign(msg.style, {
      width: `${width}px`,
      top: `${listHeight + sashHeight}px`,
      height: `${height - listHeight - sashHeight}px`,
    });
  }

  // Calendrier : sa grille garde la taille de l'écran d'origine ; on rogne ce qui dépasse.
  for (const mgr of document.querySelectorAll(".ZmCalViewMgr")) mgr.style.overflow = "hidden";

  // Rédaction : la zone de texte garde la taille de l'écran d'origine.
  for (const compose of document.querySelectorAll(".ZmComposeView")) {
    const area = compose.querySelector(".DwtHtmlEditorTextArea");
    const head = compose.querySelector(":scope > table");
    if (!area || !compose.offsetWidth) continue;
    Object.assign(area.style, {
      width: `${compose.clientWidth - 8}px`,
      height: `${Math.max(120, compose.clientHeight - (head?.offsetHeight || 0) - 12)}px`,
    });
  }
}

// Menus et boîtes de dialogue attendent hors écran (left/top à -10000px) : on peut en
// faire apparaître quelques-uns pour juger de leur style.
const SHOWCASE = [
  [".ActionMenu.ZHasIcon", { left: "260px", top: "150px" }],
  [".DwtMenu", { left: "520px", top: "150px" }],
  [".DwtDialog", { left: "760px", top: "150px" }],
  [".DwtToolTip", { left: "260px", top: "470px" }],
];
const shown = [];

function showcase(on) {
  if (on) {
    for (const [selector, pos] of SHOWCASE) {
      const el = [...document.querySelectorAll(selector)].find((e) => e.style.left === "-10000px" && e.textContent.trim());
      if (!el) continue;
      shown.push([el, el.style.left, el.style.top, el.style.zIndex]);
      Object.assign(el.style, pos, { zIndex: "900" });
    }
  } else {
    for (const [el, left, top, zIndex] of shown.splice(0)) Object.assign(el.style, { left, top, zIndex });
  }
}

function bar() {
  const params = new URLSearchParams(location.search);
  const themed = params.get("theme") !== "off";
  const other = new URLSearchParams(params);
  if (themed) other.set("theme", "off");
  else other.delete("theme");
  const el = document.createElement("div");
  el.id = "bench-bar";
  el.innerHTML = `
    <a href="?${other}">${themed ? "Voir l'original" : "Voir le nouveau style"}</a>
    ${document.getElementById("ztb__PREF") ? '<button type="button" id="bench-view" aria-pressed="false">Préférences</button>' : ""}
    <button type="button" id="bench-showcase" aria-pressed="false">Menus et dialogues</button>
    <button type="button" id="bench-ads" aria-pressed="false">Afficher les pubs</button>`;
  document.body.append(el);
  const toggle = (id, action) => {
    el.querySelector(id)?.addEventListener("click", (e) => {
      const on = e.target.getAttribute("aria-pressed") !== "true";
      e.target.setAttribute("aria-pressed", on);
      action(on);
    });
  };
  toggle("#bench-view", (on) => {
    view = on ? "prefs" : "snapshot";
    fit();
  });
  toggle("#bench-showcase", showcase);
  toggle("#bench-ads", (on) => document.documentElement.toggleAttribute("data-zm-ads", on));
}

// ?view=prefs et ?show=1 ouvrent directement la vue Préférences et les menus.
// ?unread=1 simule des mails non lus (Zimbra pose la classe Unread sur la ligne).
addEventListener("load", () => {
  fit();
  bar();
  const params = new URLSearchParams(location.search);
  // ?hover=1 simule le survol du bouton « Nouveau » (état et image de flèche compris).
  if (params.has("hover")) {
    const button = document.querySelector('[id$="__NEW_MENU"]');
    button?.classList.add("ZHover");
    button?.querySelector(".ImgSelectPullDownArrow")?.setAttribute("class", "ImgSelectPullDownArrowHover");
  }
  // ?dialog=<id> amène à l'écran un dialogue qui attend hors champ ; &tab=N y affiche
  // le N-ième onglet (par exemple ?snap=modale-fichiers.html&dialog=DWT79&tab=2).
  if (params.has("dialog")) {
    const dialog = document.getElementById(params.get("dialog"));
    if (dialog) {
      Object.assign(dialog.style, { left: "300px", top: "110px", zIndex: "900" });
      if (params.has("tab")) {
        const wanted = Number(params.get("tab"));
        dialog.querySelectorAll(".ZTabPage").forEach((page, i) => (page.style.display = i === wanted ? "block" : "none"));
        dialog.querySelectorAll(".ZTabBar .ZButton").forEach((tab, i) => tab.classList.toggle("ZSelected", i === wanted));
      }
    }
  }
  // ?body=1 remplit la zone de rédaction d'un texte d'essai.
  if (params.has("body")) {
    const area = document.querySelector(".DwtHtmlEditorTextArea");
    if (area) {
      area.value = [
        "Bonjour,",
        "",
        "Ceci est un texte d'essai pour juger de la zone de saisie.",
        "  - une liste alignée",
        "  - grâce à la chasse fixe",
        "",
        "Cordialement",
      ].join("\n");
    }
  }
  if (params.has("unread")) {
    const rows = document.querySelectorAll(".DwtListView-Rows > .Row > table tr");
    for (const i of [1, 4]) rows[i]?.classList.add("Unread");
    document.querySelector(".DwtListView-Rows .ImgCheckboxUnchecked")?.setAttribute("class", "ImgCheckboxChecked");
  }
  if (params.get("view") === "prefs") document.getElementById("bench-view")?.click();
  // ?page=N affiche la N-ième page de préférences déjà construite dans le snapshot.
  if (params.has("page")) {
    const pages = [...document.querySelectorAll("#DWT35_page > .ZmPreferencesPage")].filter((p) => p.textContent.trim());
    pages.forEach((p, i) => (p.style.display = i === Number(params.get("page")) ? "block" : "none"));
  }
  if (params.has("show")) document.getElementById("bench-showcase").click();
});
addEventListener("resize", fit);
