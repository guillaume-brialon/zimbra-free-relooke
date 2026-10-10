// Génère extension/css/icons.css : les icônes les plus visibles du webmail, redessinées
// en SVG au trait, à la place des images de 2012.
//
//   node tools/icons.mjs      (ou : npm run icons)
//
// Chaque dessin sert de masque : la forme vient du SVG, la couleur d'une variable du
// thème. Les SVG sont inscrits dans la feuille de style elle-même, ce qui évite tout
// chargement de fichier depuis la page.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../extension/css/icons.css", import.meta.url));

// Formes réutilisées
const FOLDER = "<path d='M2 4.6c0-.6.5-1.1 1.1-1.1h2.8l1.4 1.5h5.600c.6 0 1.100.5 1.100 1.100v5.800c0 .6-.5 1.100-1.100 1.100H3.100c-.6 0-1.100-.5-1.100-1.100z'/>";
const CALENDAR = "<rect x='2.5' y='3' width='11' height='10.5' rx='1.5'/><path d='M2.5 6.500h11M5.500 1.800v2.400M10.500 1.800v2.400'/>";
const TAG = "<path d='M2.5 3.600c0-.6.5-1.100 1.100-1.100h3.900l6 6c.4.4.4 1.100 0 1.500l-3.500 3.500c-.4.4-1.100.4-1.500 0l-6-6z'/><circle cx='5.400' cy='5.400' r='.8'/>";
const FRAME = "<rect x='2' y='2.5' width='12' height='11' rx='1.500'/>";
const INBOX = "<path d='M2.500 9.500 4.300 3.500h7.400l1.800 6v3c0 .3-.2.5-.5.5H3c-.3 0-.5-.2-.5-.5zM2.500 9.500h3.300l.7 1.500h3l.7-1.500h3.300'/>";
const SENT = "<path d='M13.500 2.500 2.500 7l4.200 1.800 1.800 4.700zM13.500 2.500 6.700 8.800'/>";
const CLIPBOARD = "<path d='M5.800 3H4.500c-.6 0-1 .4-1 1v8.500c0 .6.4 1 1 1h7c.6 0 1-.4 1-1V4c0-.6-.4-1-1-1h-1.300M6 2h4v2.200H6z'/>";
const DOC = "<path d='M4 2.500h5.300l3.200 3.200V13c0 .3-.2.5-.5.5H4c-.3 0-.5-.2-.5-.5V3c0-.3.2-.5.5-.5zM9.300 2.500v3.200h3.200'/>";
const RING = "<circle cx='8' cy='8' r='5.600'/>";
// Calendrier à bandeau plein : sert de masque sur l'image colorisée d'un calendrier.
const CALENDAR_SOLID = "<rect x='2.5' y='3' width='11' height='10.5' rx='1.5'/><path fill='black' d='M2.500 4.500c0-.8.7-1.500 1.500-1.500h8c.8 0 1.500.7 1.500 1.500v2.300h-11z'/><path d='M5.500 1.800v2.400M10.500 1.800v2.400'/>";
// Tag plein, percé de son œillet : même usage, pour l'image colorisée d'un tag.
const TAG_SOLID = "<path fill='black' fill-rule='evenodd' d='M2.500 3.600c0-.6.5-1.100 1.100-1.100h3.900l6 6c.4.4.4 1.100 0 1.500l-3.500 3.500c-.4.4-1.100.4-1.500 0l-6-6zM5.600 3.900a1.700 1.700 0 1 0 0 3.400 1.700 1.700 0 0 0 0-3.400z'/>";
const FUNNEL_SMALL = "<path d='M2 4.500h7.500L6.800 8v4l-2.100.8V8z'/>";
// Réglage qui ramène une image colorisée à sa teinte dominante.
const TINT = "blur(4px) saturate(4) brightness(.75) contrast(1.6)";
// Lettres des icônes de mise en forme. Un SVG servi en image n'a accès qu'aux polices
// du système : d'où une liste de linéales courantes plutôt que la police de l'interface.
const LETTER = "x='8' text-anchor='middle' font-family='Segoe UI,Helvetica Neue,Arial,Liberation Sans,sans-serif' font-size='13.500' fill='black' stroke='none'";
const ADDRESS_BOOK = "<path d='M4.500 2.500H12c.3 0 .5.2.5.5v10c0 .3-.2.5-.5.5H4.500c-.6 0-1-.4-1-1v-9c0-.6.4-1 1-1zM2.300 5.500h1.200M2.300 8h1.200M2.300 10.500h1.200M5.700 10.600c.3-1.200 1.200-1.800 2.300-1.800s2 .6 2.300 1.800'/><circle cx='8' cy='6.500' r='1.500'/>";

// classes : classes Zimbra remplacées ; svg : contenu du dessin ; box : cadre du dessin
// (16 x 16 par défaut, sinon la taille que Zimbra donne à l'icône) ; width : épaisseur
// du trait ; color : variable de couleur (icône neutre par défaut).
const ICONS = [
  // Applications
  { classes: ["ImgMailApp", "ImgMessage", "ImgReadMessage", "ImgUnreadMessage", "ImgNewMessage", "ImgMsgStatusUnread"], svg: "<rect x='2' y='3.500' width='12' height='9' rx='1.500'/><path d='M2.600 5.200 8 9l5.400-3.800'/>" },
  { classes: ["ImgMsgStatus"], svg: "<rect x='2' y='3.500' width='12' height='9' rx='1.500'/><path d='M6.600 6.900c0-.9.600-1.500 1.400-1.500s1.400.5 1.400 1.300c0 1-1.400 1.100-1.400 2.100M8 10.700h.01'/>" },
  { classes: ["ImgEnvelopeOpen", "ImgMsgStatusRead"], svg: "<path d='M2 6.500 8 2.500l6 4v6c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1zM2.300 6.800 8 10.200l5.700-3.400'/>" },
  { classes: ["ImgContactsApp", "ImgContact"], svg: "<circle cx='8' cy='5.400' r='2.600'/><path d='M3 13.500c0-2.700 2.200-4.300 5-4.300s5 1.600 5 4.300'/>" },
  { classes: ["ImgGroup"], svg: "<circle cx='6' cy='5.600' r='2.200'/><path d='M1.800 13c0-2.300 1.900-3.700 4.200-3.700s4.200 1.400 4.200 3.700M10.400 3.600a2.200 2.200 0 0 1 0 4.200M12 9.600c1.400.5 2.300 1.700 2.300 3.400'/>" },
  { classes: ["ImgNewGroup"], svg: "<circle cx='5' cy='6.200' r='2'/><path d='M1.500 13.200c0-2.100 1.600-3.400 3.500-3.400s3.500 1.300 3.500 3.400M9.400 4.250a2 2 0 0 1 0 3.900M10.300 10.100c1.300.5 2.100 1.600 2.100 3.100M12.800 2.100v3.400M11.100 3.800h3.400'/>" },
  { classes: ["ImgNewContact"], svg: "<circle cx='6.500' cy='5.600' r='2.400'/><path d='M2 13.500c0-2.500 2-4 4.500-4s4.500 1.500 4.500 4M12.500 3.500v4M10.500 5.500h4'/>" },
  { classes: ["ImgCalendarApp", "ImgAppointment", "ImgDate"], svg: CALENDAR },
  { classes: ["ImgNewAppointment"], svg: `${CALENDAR}<path d='M8 8.300v3.400M6.300 10h3.400'/>` },
  { classes: ["ImgTasksApp", "ImgTaskList"], svg: "<rect x='2.500' y='2.500' width='11' height='11' rx='2'/><path d='M5.200 8.200l2 2L10.800 6'/>" },
  { classes: ["ImgTask", "ImgNewTask"], svg: `${CLIPBOARD}<path d='M5.800 9.200l1.500 1.500 3-3.200'/>` },
  { classes: ["ImgTaskViewTodoList", "ImgTasksListView"], svg: `${CLIPBOARD}<path d='M5.800 7.500h4.400M5.800 10.300h4.400'/>` },
  { classes: ["ImgNewTaskList"], svg: `${CLIPBOARD}<path d='M8 6.800v4M6 8.800h4'/>` },
  { classes: ["ImgTaskViewNotStarted"], svg: RING },
  { classes: ["ImgTaskViewInProgress"], svg: `${RING}<path fill='black' stroke='none' d='M8 2.400a5.600 5.600 0 0 1 0 11.200z'/>` },
  { classes: ["ImgTaskViewCompleted"], svg: `${RING}<path d='M5.400 8.200l1.800 1.800 3.400-3.600'/>`, color: "var(--zm-success)" },
  { classes: ["ImgTaskViewWaiting"], svg: `${RING}<path d='M6.600 6v4M9.400 6v4'/>` },
  { classes: ["ImgTaskViewDeferred"], svg: `${RING}<path d='M5.400 8h5M8.700 6.200 10.500 8l-1.800 1.800'/>` },
  { classes: ["ImgTasksSplitView"], svg: `${FRAME}<path d='M2 8.500h12'/>` },
  { classes: ["ImgTasksDisplayView"], svg: `${FRAME}<path d='M4.500 6h7M4.500 8.500h7M4.500 11h4'/>` },

  // Vues du calendrier
  { classes: ["ImgDayView"], svg: `${FRAME}<path d='M2 5.500h12'/><rect x='5.500' y='7.700' width='5' height='3.600' rx='.5'/>` },
  { classes: ["ImgWorkWeekView"], width: 1.2, svg: `${FRAME}<path d='M2 5.500h12M6 5.500v8M10 5.500v8'/>` },
  { classes: ["ImgWeekView"], width: 1.2, svg: `${FRAME}<path d='M2 5.500h12M5 5.500v8M8 5.500v8M11 5.500v8'/>` },
  { classes: ["ImgMonthView"], width: 1.2, svg: `${FRAME}<path d='M2 6.200h12M2 9.800h12M6 2.500v11M10 2.500v11'/>` },
  { classes: ["ImgCalListView", "ImgListView"], svg: "<path d='M5.500 4h8M5.500 8h8M5.500 12h8M2.700 4h.01M2.700 8h.01M2.700 12h.01'/>" },
  { classes: ["ImgGroupSchedule"], svg: `${FRAME}<path d='M4.500 6h5M6.500 8.500h5M4.500 11h3'/>` },
  { classes: ["ImgBriefcase"], svg: "<rect x='2' y='5' width='12' height='8' rx='1.500'/><path d='M6 5V3.800c0-.4.4-.8.8-.8h2.400c.4 0 .8.4.8.8V5M2 8.600h12'/>" },
  { classes: ["ImgPreferences"], svg: "<circle cx='8' cy='8' r='2'/><circle cx='8' cy='8' r='4.600'/><path d='M8 1.800v1.600M8 12.600v1.600M1.800 8h1.600M12.600 8h1.600M3.600 3.600l1.150 1.150M11.250 11.250l1.150 1.150M3.600 12.400l1.150-1.150M11.250 4.750l1.150-1.150'/>" },

  // Actions
  { classes: ["ImgSendReceive"], svg: "<path d='M5.500 12.500v-9M3 6l2.500-2.500L8 6M10.500 3.500v9M8 10l2.500 2.500L13 10'/>" },
  { classes: ["ImgRefresh"], svg: "<path d='M14.600 3.200v3.600H11'/><path d='M13.100 9.800a5.400 5.400 0 1 1-1.270-5.620L14.600 6.800'/>" },
  { classes: ["ImgDelete", "ImgTrash", "ImgMsgStatusTrash"], svg: "<path d='M2.800 4.500h10.400M6.400 4.500V3.200c0-.4.3-.7.7-.7h1.800c.4 0 .7.3.7.7v1.300M4.200 4.500l.6 8c0 .6.5 1 1 1h4.400c.5 0 1-.4 1-1l.6-8M6.700 7v4M9.300 7v4'/>" },
  { classes: ["ImgFolder"], svg: FOLDER },
  { classes: ["ImgMoveToFolder"], svg: `${FOLDER}<path d='M6 9h4.200M8.700 7.400 10.300 9l-1.600 1.600'/>` },
  { classes: ["ImgNewFolder"], svg: `${FOLDER}<path d='M8 7.200v3.600M6.200 9h3.600'/>` },
  { classes: ["ImgPrint"], svg: "<path d='M4.500 6V2.500h7V6M4.500 11.500H3.200c-.7 0-1.200-.5-1.200-1.200V7.200C2 6.500 2.500 6 3.200 6h9.600c.7 0 1.200.5 1.200 1.200v3.100c0 .7-.5 1.200-1.200 1.200h-1.300'/><path d='M4.500 9.500h7v4h-7z'/>" },
  { classes: ["ImgReply", "ImgMsgStatusReply"], svg: "<path d='M6.500 4 2.500 8l4 4'/><path d='M3 8h6c2.600 0 4.500 1.800 4.500 4.500'/>" },
  { classes: ["ImgReplyAll"], svg: "<path d='M5 4.500 1.500 8 5 11.500M8.700 4 4.700 8l4 4'/><path d='M5.200 8h4.600c2.400 0 4.200 1.700 4.200 4.200'/>" },
  { classes: ["ImgForward", "ImgMsgStatusForward"], svg: "<path d='M9.500 4l4 4-4 4'/><path d='M13 8H7c-2.600 0-4.500 1.800-4.500 4.500'/>" },
  { classes: ["ImgJunkMail", "ImgSpamFolder"], svg: "<circle cx='8' cy='8' r='5.500'/><path d='M4.200 4.200l7.600 7.600'/>" },
  { classes: ["ImgTag", "ImgNewTag"], svg: TAG },
  { classes: ["ImgTagStack"], svg: `<g transform='translate(2.600 2.600) scale(.8)' stroke-width='1.600'>${TAG}</g><path d='M2 7.200V3.100C2 2.500 2.500 2 3.100 2h4.100'/>` },
  { classes: ["ImgDeleteTag"], svg: `<g transform='translate(-.5 -.5) scale(.8)' stroke-width='1.600'>${TAG}</g><path d='M11 11l3.500 3.500M14.500 11 11 14.500'/>` },
  { classes: ["ImgOpenInNewWindow"], svg: "<path d='M9 2.500h4.500V7M13.500 2.500 7.500 8.500M11.500 9.500v3c0 .6-.4 1-1 1h-7c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1h3'/>" },
  { classes: ["ImgEdit", "ImgCompose", "ImgMsgStatusDraft"], svg: "<path d='M10.600 2.800l2.600 2.600-7.400 7.400-3.200.6.6-3.200zM9 4.400 11.600 7'/>" },
  { classes: ["ImgSave"], svg: "<path d='M3.100 2.500h7.600l2.800 2.800v7.600c0 .3-.3.600-.6.600H3.100c-.3 0-.6-.3-.6-.6V3.100c0-.3.3-.6.6-.6zM5 2.500V6h5V2.500M5 13.500v-4h6v4'/>" },
  // Mise en forme (éditeur HTML). Gras, italique, souligné gardent leurs initiales
  // françaises, comme dans les images d'origine.
  { classes: ["ImgBold"], svg: `<text y='12.800' font-weight='bold' ${LETTER}>G</text>` },
  { classes: ["ImgItalics"], svg: `<text y='12.800' font-weight='600' font-style='italic' ${LETTER}>I</text>` },
  { classes: ["ImgUnderline"], svg: `<text y='11.400' font-weight='600' ${LETTER}>S</text><path d='M4 14h8'/>` },
  { classes: ["ImgFontColor"], svg: "<path d='M4.300 12.500 8 3.200l3.700 9.300M5.600 9.300h4.800'/>" },
  { classes: ["ImgFontBackground"], svg: "<path d='M9.800 2.800l3.400 3.400-5.500 5.500H4.300V8.300zM3 13.500h10'/>" },
  { classes: ["ImgLeftJustify"], svg: "<path d='M2.500 4h11M2.500 7h7M2.500 10h11M2.500 13h7'/>" },
  { classes: ["ImgCenterJustify"], svg: "<path d='M2.500 4h11M4.500 7h7M2.500 10h11M4.500 13h7'/>" },
  { classes: ["ImgRightJustify"], svg: "<path d='M2.500 4h11M6.500 7h7M2.500 10h11M6.500 13h7'/>" },
  { classes: ["ImgFullJustify"], svg: "<path d='M2.500 4h11M2.500 7h11M2.500 10h11M2.500 13h11'/>" },
  { classes: ["ImgBulletedList"], svg: "<path d='M6 4.500h7.500M6 8h7.500M6 11.500h7.500M3 4.500h.01M3 8h.01M3 11.500h.01'/>" },
  { classes: ["ImgNumberedList"], svg: "<path d='M6.500 4.500h7M6.500 8h7M6.500 11.500h7M2.500 3.300h1v2.700M2.500 9.700h1.500l-1.500 2.300h1.500'/>" },
  { classes: ["ImgOutdent"], svg: "<path d='M7 4h6.500M7 8h6.500M7 12h6.500M4.500 6l-2 2 2 2'/>" },
  { classes: ["ImgIndent"], svg: "<path d='M7 4h6.500M7 8h6.500M7 12h6.500M2.500 6l2 2-2 2'/>" },
  { classes: ["ImgHorizRule"], svg: "<path d='M2.500 8h11'/>" },
  { classes: ["ImgURL"], svg: "<path d='M6.800 9.200a2.800 2.800 0 0 0 4 0l2-2a2.800 2.800 0 0 0-4-4l-.7.7M9.200 6.800a2.800 2.800 0 0 0-4 0l-2 2a2.800 2.800 0 0 0 4 4l.7-.7'/>" },
  { classes: ["ImgTable", "ImgInsertTable"], width: 1.2, svg: `${FRAME}<path d='M2 6.200h12M2 9.800h12M6 2.500v11M10 2.500v11'/>` },
  { classes: ["ImgGlobe"], svg: "<circle cx='8' cy='8' r='5.600'/><path d='M2.400 8h11.200M8 2.400c-2.300 2-2.300 9.200 0 11.200M8 2.400c2.300 2 2.300 9.200 0 11.200'/>" },
  { classes: ["ImgSwitchFormat"], svg: "<path d='M3 5.500h9M9.500 3 12 5.500 9.500 8M13 10.500H4M6.500 8 4 10.500 6.500 13'/>" },

  // Porte-documents
  { classes: ["ImgUpload", "ImgUpArrow"], svg: "<path d='M8 10.500V3M5 5.800 8 2.800l3 3M3 10.500v2c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-2'/>" },
  { classes: ["ImgDownArrow"], svg: "<path d='M8 2.800v7.500M5 7.500l3 3 3-3M3 10.500v2c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-2'/>" },
  { classes: ["ImgPadLock"], svg: "<rect x='3.500' y='7' width='9' height='6.500' rx='1.200'/><path d='M5.500 7V5.200a2.500 2.500 0 0 1 5 0V7'/>" },
  { classes: ["ImgGenericDoc", "ImgUnknownDoc", "ImgDoc"], svg: DOC },
  { classes: ["ImgHtmlDoc"], svg: `${DOC}<path d='M7.100 8.200 5.700 9.600l1.400 1.400M8.900 8.200l1.400 1.400-1.400 1.400'/>` },
  { classes: ["ImgNewDoc"], svg: `${DOC}<path d='M8 7.800v3.400M6.300 9.500h3.400'/>` },

  // Préférences
  { classes: ["ImgAccounts"], svg: "<rect x='2' y='3.500' width='12' height='9' rx='1.500'/><circle cx='5.800' cy='7.200' r='1.400'/><path d='M3.800 10.800c.3-1 1-1.500 2-1.500s1.700.5 2 1.500M9.800 6.500h2.400M9.800 9h2.400'/>" },
  { classes: ["ImgMailRule"], svg: "<path d='M2.500 3.500h11L9.500 8.300v4.200l-3 1V8.300z'/>" },
  { classes: ["ImgTrustedAddresses"], svg: "<path d='M8 2.300 13 4v4c0 2.900-2 4.900-5 5.800C5 12.900 3 10.900 3 8V4zM5.900 8l1.500 1.500 2.800-3'/>" },
  { classes: ["ImgSharedContact"], svg: "<circle cx='4.300' cy='8' r='1.700'/><circle cx='11.500' cy='4' r='1.700'/><circle cx='11.500' cy='12' r='1.700'/><path d='M5.800 7.200 10 4.800M5.800 8.800l4.200 2.400'/>" },
  { classes: ["ImgShortcut"], svg: "<rect x='1.500' y='4' width='13' height='8' rx='1.500'/><path d='M4 6.800h.01M6.700 6.800h.01M9.300 6.800h.01M12 6.800h.01M4.500 9.500h7'/>" },
  { classes: ["ImgZimlet"], svg: "<path d='M6 2.500v3M10 2.500v3M4 5.500h8V8a4 4 0 0 1-8 0zM8 12v1.800'/>" },

  { classes: ["ImgDraftFolder"], svg: "<path d='M4 2.500h5.300l3.200 3.200V13c0 .3-.2.5-.5.5H4c-.3 0-.5-.2-.5-.5V3c0-.3.2-.5.5-.5zM9.300 2.500v3.200h3.200M5.600 9h4.800M5.600 11.200h3'/>" },
  { classes: ["ImgSpellCheck"], svg: "<path d='M2.500 9.500 5 3l2.500 6.500M3.300 7.400h3.400M8.300 11.500l1.900 1.900 3.500-4'/>" },
  { classes: ["ImgAddSignature"], svg: "<path d='M2.500 11c1.800-3.200 3-6 3.900-6 1 0 0 4.500 1.300 4.500 1 0 1.300-2 2.200-2 .8 0 .7 1.500 3.600 1.500M2.500 13.500h11'/>" },
  { classes: ["ImgInbox"], svg: INBOX },
  { classes: ["ImgSentFolder", "ImgMsgStatusSent"], svg: SENT },
  { classes: ["ImgContactsFolder", "ImgEmailedContacts", "ImgNewContactsFolder"], svg: ADDRESS_BOOK },
  { classes: ["ImgSearchFolder"], svg: `${FOLDER}<circle cx='7.600' cy='8.700' r='1.700'/><path d='M8.900 10l1.500 1.500'/>` },
  { classes: ["ImgDomain"], svg: "<circle cx='8' cy='8' r='2.400'/><path d='M10.400 5.600v3.200c0 1 .8 1.700 1.700 1.700s1.700-.8 1.700-2.100c0-3.300-2.600-5.900-5.800-5.900a5.800 5.800 0 1 0 3.300 10.600'/>" },
  { classes: ["ImgTime"], svg: "<circle cx='8' cy='8' r='5.600'/><path d='M8 4.800V8l2.200 1.400'/>" },

  // Liste de mails et affichage
  { classes: ["ImgAttachment"], svg: "<path d='M12 7.300 7.300 12c-1.100 1.100-2.800 1.100-3.800 0s-1.100-2.800 0-3.800l5-5c.7-.7 1.900-.7 2.600 0s.7 1.900 0 2.600l-4.900 4.900c-.4.4-.9.4-1.300 0s-.4-.9 0-1.300L9.300 5'/>" },
  { classes: ["ImgFlagRed"], svg: "<path d='M3.500 14V2.500'/><path fill='black' d='M3.500 3H12l-2 2.750 2 2.750H3.500z'/>", color: "var(--zm-danger)" },
  { classes: ["ImgFlagDis"], svg: "<path d='M3.500 14V2.500M3.500 3H12l-2 2.750 2 2.750H3.500'/>", color: "var(--zm-border-strong)" },
  { classes: ["ImgPriorityHigh_list"], box: "0 0 8 16", width: 1.8, svg: "<path d='M4 3v6.500'/><circle cx='4' cy='12.600' r='.4'/>", color: "var(--zm-danger)" },
  { classes: ["ImgPriorityLow_list"], box: "0 0 8 16", svg: "<path d='M4 3.500v9M1.500 10 4 12.500 6.500 10'/>" },
  { classes: ["ImgSplitPane"], svg: `${FRAME}<path d='M2 8.500h12'/>` },
  { classes: ["ImgSplitPaneVertical"], svg: `${FRAME}<path d='M8.500 2.500v11'/>` },
  { classes: ["ImgSplitPaneOff"], svg: `${FRAME}<path d='M4.500 6h7M4.500 8.500h7M4.500 11h4'/>` },
  { classes: ["ImgConversationView", "ImgConversation"], svg: "<path d='M2.500 3.500c0-.6.4-1 1-1h9c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1H7.500l-3 2.500v-2.500h-1c-.6 0-1-.4-1-1z'/>" },
  { classes: ["ImgMessageView"], svg: "<path d='M2.500 4h11M2.500 8h11M2.500 12h11'/>" },

  // Recherche, fermeture, ajout
  { classes: ["ImgSearch", "ImgSearch2", "ImgSearchBuilder"], svg: "<circle cx='7' cy='7' r='4.300'/><path d='M10.200 10.200l3.400 3.400'/>" },
  { classes: ["ImgClose", "ImgCancel"], svg: "<path d='M4 4l8 8M12 4l-8 8'/>" },
  { classes: ["ImgBubbleDelete"], box: "0 0 12 12", svg: "<path d='M3.500 3.500l5 5M8.500 3.500l-5 5'/>" },
  { classes: ["ImgAdd", "ImgPlus"], width: 1.6, svg: "<path d='M8 3.500v9M3.500 8h9'/>", color: "var(--zm-success)" },
  { classes: ["ImgRemove", "ImgMinus"], width: 1.6, svg: "<path d='M3.500 8h9'/>", color: "var(--zm-danger)" },
  { classes: ["ImgWarning"], svg: "<path d='M8 2.600 14 13H2zM8 6.600v3'/><circle cx='8' cy='11.300' r='.3'/>", color: "var(--zm-warning)" },
  { classes: ["ImgSuccess"], svg: "<circle cx='8' cy='8' r='5.600'/><path d='M5.400 8.200l1.800 1.800 3.400-3.600'/>", color: "var(--zm-success)" },

  // Chevrons et flèches
  { classes: ["ImgNodeExpanded"], svg: "<path d='M5 6.500l3 3 3-3'/>" },
  { classes: ["ImgNodeCollapsed"], svg: "<path d='M6.500 5l3 3-3 3'/>" },
  { classes: ["ImgCascade"], svg: "<path d='M6.500 4.500 10 8l-3.500 3.500'/>" },
  { classes: ["ImgHeaderExpanded"], box: "0 0 11 11", svg: "<path d='M2.500 4l3 3 3-3'/>" },
  { classes: ["ImgHeaderCollapsed"], box: "0 0 11 11", svg: "<path d='M4 2.500l3 3-3 3'/>" },
  { classes: ["ImgSelectPullDownArrow", "ImgSelectPullDownArrowHover", "ImgSelectPullDownArrowSel"], box: "0 0 12 16", svg: "<path d='M3 6.500l3 3 3-3'/>" },
  { classes: ["ImgHelpPullDownArrow", "ImgHelpPullDownArrowHover"], box: "0 0 12 16", svg: "<path d='M3 6.500l3 3 3-3'/>", color: "var(--zm-header-text)" },
  { classes: ["ImgColumnDownArrow"], box: "0 0 8 7", width: 1.2, svg: "<path d='M1.500 2 4 4.800 6.500 2'/>" },
  { classes: ["ImgColumnUpArrow"], box: "0 0 8 7", width: 1.2, svg: "<path d='M1.500 5 4 2.200 6.500 5'/>" },
  { classes: ["ImgFastRevArrowSmall"], box: "0 0 10 9", width: 1.2, svg: "<path d='M4.500 1.500l-3 3 3 3M8.500 1.500l-3 3 3 3'/>" },
  { classes: ["ImgRevArrowSmall"], box: "0 0 6 9", width: 1.2, svg: "<path d='M4.500 1.500l-3 3 3 3'/>" },
  { classes: ["ImgFwdArrowSmall"], box: "0 0 6 9", width: 1.2, svg: "<path d='M1.500 1.500l3 3-3 3'/>" },
  { classes: ["ImgFastFwdArrowSmall"], box: "0 0 10 9", width: 1.2, svg: "<path d='M1.500 1.500l3 3-3 3M5.500 1.500l3 3-3 3'/>" },
  { classes: ["ImgLeftArrow"], width: 1.6, svg: "<path d='M10 3.500 5.500 8l4.500 4.500'/>", color: "var(--zm-accent)" },
  { classes: ["ImgRightArrow"], width: 1.6, svg: "<path d='M6 3.500 10.500 8 6 12.500'/>", color: "var(--zm-accent)" },
  { classes: ["ImgUpArrowSmall"], box: "0 0 7 4", width: 1.1, svg: "<path d='M1 3.300 3.500 1 6 3.300'/>" },
  { classes: ["ImgDownArrowSmall"], box: "0 0 7 4", width: 1.1, svg: "<path d='M1 .7 3.500 3 6 .7'/>" },
];

function dataUri({ svg, box = "0 0 16 16", width = 1.3, stroke = "black" }) {
  const doc = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${box}' fill='none' stroke='${stroke}' stroke-width='${width}' stroke-linecap='round' stroke-linejoin='round'>${svg}</svg>`;
  return `url("data:image/svg+xml,${doc.replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E")}")`;
}

// Dossier ordinaire : seule icône à deux couleurs (contour gris, intérieur jaune très
// clair). Un masque ne porte qu'une couleur ; ce dessin-ci est donc posé tel quel, avec
// ses couleurs écrites en dur. Le contour doit rester égal à --zm-icon (tokens.css).
const ICON_STROKE = "#4d6177";
const FOLDER_FILL = "#fff3c4";
const FOLDER_PAINTED = dataUri({ svg: FOLDER.replace("<path ", `<path fill='${FOLDER_FILL}' `), stroke: ICON_STROKE });

const CALENDAR_MASK = `${dataUri({ svg: CALENDAR_SOLID, width: 1.5 })} center / contain no-repeat`;
const TAG_MASK = `${dataUri({ svg: TAG_SOLID, width: 1 })} center / contain no-repeat`;

const all = ICONS.flatMap((icon) => icon.classes);
const duplicates = all.filter((name, i) => all.indexOf(name) !== i);
if (duplicates.length) throw new Error(`Classes en double : ${duplicates.join(", ")}`);

const selector = (classes) => classes.map((c) => `.${c}`).join(",\n  ");
const shapes = ICONS.map((icon) => `  ${selector(icon.classes)} {\n    --zm-i: ${dataUri(icon)};\n  }`).join("\n\n");
const colors = ICONS.filter((icon) => icon.color)
  .map((icon) => `  ${selector(icon.classes)} {\n    background: ${icon.color};\n  }`)
  .join("\n\n");

const css = `/* Fichier généré par tools/icons.mjs : ne pas le modifier à la main.
   Icônes redessinées. Le dessin (--zm-i) sert de masque, la couleur est celle du fond. */
:root:not(#zm, [data-zm-off]) {
  ${selector(all)} {
    background: var(--zm-icon);
    mask: var(--zm-i) center / contain no-repeat;
  }

${shapes}

  /* Icônes qui portent un sens par leur couleur */
${colors}

  .ImgFolder {
    background: ${FOLDER_PAINTED} center / contain no-repeat;
    mask: none;
  }

  /* L'onglet de l'application en cours a son icône en couleur de marque. */
  .ZSelected .ZAppTabBorder .ZLeftIcon div {
    background: var(--zm-accent);
  }

  /* Boutons de la page des filtres : « + » et « Appliquer » y sont des icônes passe-partout. */
  .ZmFilterRulesView .ImgPlus {
    background: var(--zm-icon);
    --zm-i: ${dataUri({ svg: `${FUNNEL_SMALL}<path d='M12 2.500v4M10 4.500h4'/>` })};
  }

  .ZmFilterRulesView .ImgSwitchFormat {
    --zm-i: ${dataUri({ svg: `${FUNNEL_SMALL}<path d='M10.500 3 13.500 5l-3 2z'/>` })};
  }

  /* --- Images colorisées ---
     Pour un calendrier, un dossier ou un tag de couleur, Zimbra fabrique une image
     teintée, sans classe : rien n'indique ce qu'elle représente, et sa couleur n'existe
     que dans ses pixels. On la floute pour n'en garder que la teinte, puis on la
     découpe à la forme voulue.
     Par défaut (menus de choix de couleur, boutons) : une pastille de couleur. La
     couleur d'origine d'un objet donne une image sans identifiant, d'où les sélecteurs
     par emplacement. */
  img[id^="CANVAS_IMG"],
  .ZmColorMenu .ZLeftIcon img,
  td[id$="_colorSelect"] .ZLeftIcon img,
  .ZSelect .ZLeftIcon img,
  .ZSelectMenuItem .ZLeftIcon img {
    filter: ${TINT};
    mask: ${dataUri({ svg: "<rect x='2.500' y='2.500' width='11' height='11' rx='3' fill='black' stroke='none'/>" })} center / contain no-repeat;
  }

  /* Dans un arbre : un dossier, sauf indication contraire ci-dessous. L'image est
     poussée hors de son cadre et le dessin prend sa place. */
  td.imageCell > img {
    filter: none;
    object-fit: none;
    object-position: -99px -99px;
    background: ${FOLDER_PAINTED} center / contain no-repeat;
    mask: none;
  }

  /* Dossiers système du mail, reconnus à leur numéro, fixe dans Zimbra :
     2 = Réception, 5 = Envoyé. */
  td[id="zti__main_Mail__2_imageCell"].imageCell > img,
  td[id="zti__main_Mail__5_imageCell"].imageCell > img,
  td[id*="Contacts"].imageCell > img,
  td[id*="Tasks"].imageCell > img {
    background: var(--zm-icon);
    mask: var(--zm-i) center / contain no-repeat;
  }

  td[id="zti__main_Mail__2_imageCell"].imageCell > img {
    --zm-i: ${dataUri({ svg: INBOX })};
  }

  td[id="zti__main_Mail__5_imageCell"].imageCell > img {
    --zm-i: ${dataUri({ svg: SENT })};
  }

  td[id*="Contacts"].imageCell > img {
    --zm-i: ${dataUri({ svg: ADDRESS_BOOK })};
  }

  td[id*="Tasks"].imageCell > img {
    --zm-i: ${dataUri({ svg: `${CLIPBOARD}<path d='M5.800 7.500h4.400M5.800 10.300h4.400'/>` })};
  }

  /* Calendriers : le dessin d'un calendrier, à la couleur de chacun. */
  td[id*="Calendar"].imageCell > img {
    filter: ${TINT};
    object-fit: fill;
    object-position: 50% 50%;
    background: none;
    mask: ${CALENDAR_MASK};
  }

  /* De même là où l'image ne peut être qu'un calendrier : le choix du calendrier d'un
     rendez-vous, et le choix de la couleur dans « Créer un calendrier ». Ce dialogue se
     reconnaît à sa case « Exclure… », son menu à ce qu'il le suit dans la page. */
  .ZSelect .ZLeftIcon img,
  .ZSelectMenuItem .ZLeftIcon img,
  .DwtDialog:has([id$="_excludeFbCheckbox"]) td[id$="_colorSelect"] .ZLeftIcon img,
  .DwtDialog:has([id$="_excludeFbCheckbox"]) + .ZmColorMenu .ZLeftIcon img {
    mask: ${CALENDAR_MASK};
  }

  /* Tags : même principe, avec le dessin d'un tag. Dans l'arbre des tags, dans le menu
     « Tag » des barres d'outils, et dans « Créer un tag » (bouton de couleur et menu
     qui suit le dialogue). */
  .OverviewTree[id$="__TAG"] td.imageCell > img {
    filter: ${TINT};
    object-fit: fill;
    object-position: 50% 50%;
    background: none;
    mask: ${TAG_MASK};
  }

  /* Tag d'un message : dans la liste (colonne des tags), dans son en-tête, dans
     l'infobulle qui détaille une pile de tags, et dans les menus contextuels, où une
     image colorisée ne peut être qu'un tag. */
  img[id$="__tg"],
  img[id*="_tagCellTI"],
  .DwtToolTipBody img[src^="data:"],
  .ActionMenu .ZLeftIcon img,
  [id*="__TAG_MENU"] .ZLeftIcon img,
  td[id$="_tagColor"] .ZLeftIcon img,
  .DwtDialog:has(td[id$="_tagColor"]) + .ZmColorMenu .ZLeftIcon img {
    filter: ${TINT};
    mask: ${TAG_MASK};
  }
}
`;

await writeFile(OUT, css);
console.log(`${ICONS.length} dessins pour ${all.length} icônes -> extension/css/icons.css (${(css.length / 1024).toFixed(1)} Ko)`);
