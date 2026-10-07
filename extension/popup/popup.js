const DEFAULTS = { enabled: true, hideAds: true };

browser.storage.local.get(DEFAULTS).then((settings) => {
  for (const key of Object.keys(DEFAULTS)) {
    const box = document.getElementById(key);
    box.checked = settings[key];
    box.addEventListener("change", () => {
      browser.storage.local.set({ [key]: box.checked });
    });
  }
});
