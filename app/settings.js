    const installBtn = document.getElementById("install");
    const help = document.getElementById("help");
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    let installEvent = null;

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }

    // Skjules kun når siden allerede kører som app
    if (standalone) installBtn.hidden = true;

    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e; });
    window.addEventListener("appinstalled", () => { installBtn.hidden = true; });

    installBtn.addEventListener("click", async () => {
      // I rammen (index.html) er det det øverste dokument, der får "installér"-hændelsen
      let framedEvent = null;
      try { framedEvent = window.top !== window ? window.top.__bip : null; } catch { /* ingen adgang */ }
      const ev = installEvent || framedEvent;
      if (ev) {
        ev.prompt();
        await ev.userChoice;
        installEvent = null;
        try { window.top.__bip = null; } catch { /* ingen adgang */ }
        return;
      }
      const text = !location.protocol.startsWith("http")
        ? "Knappen virker, når spillene ligger på din hjemmeside. Upload mappen med FTP, åbn adressen på telefonen eller tabletten, og tryk på knappen igen."
        : isIOS
        ? "Tryk på Del-knappen (firkanten med pil op) i Safari, og vælg “Føj til hjemmeskærm”."
        : "Åbn browserens menu (⋮) og vælg “Installer app” eller “Føj til startskærm”.";
      document.getElementById("help-text").textContent = text;
      help.showModal();
    });
    const statusEl = document.getElementById("offline-status");
    async function showOfflineStatus() {
      if (!location.protocol.startsWith("http")) {
        statusEl.textContent = "Offline kræver, at spillene åbnes fra din hjemmeside.";
      } else if (!("serviceWorker" in navigator)) {
        statusEl.textContent = "Offline virker kun over https. Åbn siden med https://.";
      } else {
        try {
          const registration = await navigator.serviceWorker.ready;
          const keys = (await caches.keys()).sort();
          const cached = keys.length ? (await (await caches.open(keys[keys.length - 1])).keys()).length : 0;
          const total = await new Promise((resolve) => {
            const reply = new MessageChannel();
            reply.port1.onmessage = (event) => resolve(event.data);
            setTimeout(() => resolve(15), 1500);
            (registration.active || navigator.serviceWorker.controller).postMessage("antal", [reply.port2]);
          });
          statusEl.textContent = cached >= total
            ? "✅ Klar til at spille uden net."
            : `⚠️ Kun ${cached} af ${total} filer er gemt. Tjek, at alle filer er uploadet, og genindlæs siden.`;
        } catch {
          statusEl.textContent = "⚠️ Kunne ikke gøre klar til offline.";
        }
      }
    }
    showOfflineStatus().then(() => {
      if (sessionStorage.getItem("upgraded")) {
        sessionStorage.removeItem("upgraded");
        statusEl.textContent = `🔄 Opdateret til ${document.getElementById("version").textContent}. ${statusEl.textContent}`;
      }
    });

    const upgradeBtn = document.getElementById("upgrade");
    upgradeBtn.addEventListener("click", async () => {
      if (!location.protocol.startsWith("http") || !("serviceWorker" in navigator)) {
        statusEl.textContent = "Opgradering virker kun, når spillene åbnes fra hjemmesiden.";
        return;
      }
      if (!navigator.onLine) {
        statusEl.textContent = "Du skal have net for at opgradere.";
        return;
      }
      upgradeBtn.disabled = true;
      statusEl.textContent = "Leder efter ny version…";
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg.update();
        // Den nye version læses direkte fra nettet (springer cachen over)
        const html = await (await fetch("menu.html", { cache: "no-store" })).text();
        const live = (html.match(/id="version">Version ([^<]+)</) || [])[1];
        const shown = document.getElementById("version").textContent.replace("Version ", "");
        if (!live || live === shown) {
          statusEl.textContent = "✅ Du har allerede den nyeste version.";
        } else {
          statusEl.textContent = `Henter version ${live}…`;
          // Vent til den nye version er gemt til offline (cache hedder regnespil-v<version>)
          let ready = false;
          for (let i = 0; i < 40 && !ready; i++) {
            const settled = !reg.installing && !reg.waiting;
            ready = settled && await caches.has(`regnespil-v${live}`);
            if (!ready) await new Promise((r) => setTimeout(r, 500));
          }
          if (!ready) throw new Error("timeout");
          await new Promise((r) => setTimeout(r, 500));
          sessionStorage.setItem("upgraded", "1");
          sessionStorage.setItem("upgraded-open", "1");
          // Hele appen (også rammen) genindlæses, så ny kode i rammen også bruges
          try { window.top.location.reload(); } catch { location.reload(); }
        }
      } catch {
        statusEl.textContent = "⚠️ Kunne ikke opgradere. Tjek nettet og prøv igen.";
      } finally {
        upgradeBtn.disabled = false;
      }
    });

    document.getElementById("help-close").addEventListener("click", () => help.close());

    // Indstillinger (dropdown øverst til højre)
    const settingsBtn = document.getElementById("settings-btn");
    const settingsMenu = document.getElementById("settings-menu");
    function setMenu(open) {
      settingsMenu.hidden = !open;
      settingsBtn.setAttribute("aria-expanded", String(open));
    }
    settingsBtn.addEventListener("click", () => setMenu(settingsMenu.hidden));
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".settings, dialog")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    if (sessionStorage.getItem("upgraded-open")) {
      sessionStorage.removeItem("upgraded-open");
      setMenu(true);
    }

    // Nulstil stjerner og fremskridt. Nye spil skal bruge et præfiks herfra til deres nøgler i localStorage.
    const GAME_KEY_PREFIXES = ["talbasket-", "maal-", "leo-", "prinsesse-", "tabbi-", "dino-", "farvehave-", "urundai-", "haj-", "banan-", "tamil-"];
    const resetDialog = document.getElementById("reset-dialog");
    document.getElementById("reset").addEventListener("click", () => resetDialog.showModal());
    document.getElementById("reset-cancel").addEventListener("click", () => resetDialog.close());
    document.getElementById("reset-ok").addEventListener("click", () => {
      try {
        for (const key of Object.keys(localStorage)) {
          if (GAME_KEY_PREFIXES.some((p) => key.startsWith(p))) localStorage.removeItem(key);
        }
      } catch { /* ingen lagring */ }
      resetDialog.close();
      refreshStars();
      refreshTotals();
      setMenu(true);
      statusEl.textContent = "🗑️ Stjernerne er nulstillet.";
    });
