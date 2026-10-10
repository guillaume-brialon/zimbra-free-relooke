const DEFAULTS = { enabled: true, hideAds: true };
const SUPPORTED_SKIN = "bare";

// Thème relevé par content.js au dernier chargement du webmail.
browser.storage.local.get({ skin: SUPPORTED_SKIN }).then(({ skin }) => {
  if (skin === SUPPORTED_SKIN) return;
  document.getElementById("skin-name").textContent = skin;
  document.getElementById("skin-notice").hidden = false;
});

browser.storage.local.get(DEFAULTS).then((settings) => {
  for (const key of Object.keys(DEFAULTS)) {
    const box = document.getElementById(key);
    box.checked = settings[key];
    box.addEventListener("change", () => {
      browser.storage.local.set({ [key]: box.checked });
    });
  }
});
