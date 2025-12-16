/* ==========================================================================
   MODULE 6: BUFF PANEL PRO (ALT+0 / ALT+P)
   ========================================================================== */
(() => {
    if (window.__BUFF_PRO__) return;
    window.__BUFF_PRO__ = 1;

    const BUFFS = [
        { id: 2061, label: "TopShelf", store: "medalstore-bufftopshelf/1" },
        { id: 2026, label: "SlowMo", store: "medalstore-buffslowmo/1" },
        { id: 2057, label: "DoubleTrouble", store: "medalstore-buffdoubletrouble/1" },
        { id: 2070, label: "CarePackage", store: "medalstore-buffcarepackage/1" },
        { id: 2040, label: "Electric", store: "medalstore-buffitselectric/1" }
    ];

    function getController() {
        return Y?.get_controller?.().get_buffController?.()._buffController || null;
    }

    function hasActiveBuff(id) {
        const inst = zc?.get_instance?.();
        return inst?._playerActiveBuffs?.some(b => +b._buffID === +id) || false;
    }

    function hasInventoryBuff(id) {
        const inst = zc?.get_instance?.();
        return inst?._playerInventoryBuffs?.some(b => +b._buffID === +id) || false;
    }

    function activateBuff(id) {
        const ctl = getController();
        if (ctl) {
            // Try various method names from obfuscated versions
            if (ctl.activateBuff) ctl.activateBuff(id);
            else if (ctl.activateInventoryBuff) ctl.activateInventoryBuff(id, 1);
        }
    }

    function buyBuff(storePath) {
        if (window.ha?.openStore) ha.openStore("Medals");
        // ... Logic to click 'buy' buttons via DOM query (simulated) ...
    }

    // Logic: If Inventory has it, Activate. If not, Buy then Activate.
    function handleBuff(b) {
        if (hasInventoryBuff(b.id)) {
            activateBuff(b.id);
        } else {
            buyBuff(b.store);
            // Poll for inventory update then activate
            let tries = 0;
            const iv = setInterval(() => {
                if (hasInventoryBuff(b.id) || tries++ > 20) {
                    clearInterval(iv);
                    if (hasInventoryBuff(b.id)) activateBuff(b.id);
                }
            }, 500);
        }
    }

    // UI
    function createUI() {
        if (document.getElementById("buffPanelWrap")) return;
        const w = document.createElement("div"); w.id = "buffPanelWrap";
        w.style.cssText = "position:fixed;top:60px;left:50%;transform:translateX(-50%);display:none;z-index:999999";

        const p = document.createElement("div");
        p.style.cssText = "background:rgba(0,0,0,0.8);padding:10px;border-radius:10px;display:flex;gap:5px";

        BUFFS.forEach(b => {
            const btn = document.createElement("div");
            btn.innerText = b.label;
            btn.style.cssText = "padding:5px 10px;background:#333;color:#fff;cursor:pointer;border-radius:5px";
            btn.onclick = () => handleBuff(b);

            // Dynamic coloring if active
            setInterval(() => {
                btn.style.background = hasActiveBuff(b.id) ? "#0f0" : "#333";
                btn.style.color = hasActiveBuff(b.id) ? "#000" : "#fff";
            }, 1000);

            p.appendChild(btn);
        });
        w.appendChild(p);
        document.body.appendChild(w);

        // Events to keep it visible in fullscreen
        const keep = () => document.body.appendChild(w);
        document.addEventListener("fullscreenchange", keep);
    }

    // Key Listener
    window.addEventListener("keydown", e => {
        if (e.altKey && e.keyCode === 80) { // Alt+P
            e.preventDefault();
            createUI();
            const el = document.getElementById("buffPanelWrap");
            el.style.display = (el.style.display === 'none' ? 'block' : 'none');
        }
        if (e.altKey && e.key === '0') { // Alt+0 (Quick Buff top 3)
            e.preventDefault();
            [0, 1, 2].forEach(i => handleBuff(BUFFS[i]));
        }
    });

    createUI(); // Init hidden
})();

/* ==========================================================================
   MODULE 7: MULTI CORE (TARGET PINNER) & SPAM TAB
   ========================================================================== */
(() => {
    // 1. PINNER (Alt+Z or Alt+Q listener variant)
    let PINS = [];
    let active = false;
    let interval = null;

    function getHoveredEntity() {
        // Mock getting entity under mouse from game MapView
        const mv = Y?.get_MapView?.();
        const tile = mv?.get_mousedOverTile?.();
        return tile?.getCellOwnerEntity?.() || null;
    }

    function pinTarget() {
        const ent = getHoveredEntity();
        if (ent) {
            PINS.push(ent);
            console.log("Pinned:", ent);
            if (!active) start pinningLoop();
        }
    }

    function pinningLoop() {
        active = true;
        interval = setInterval(() => {
            if (!PINS.length) { stopPinningLoop(); return; }
            const ent = PINS.shift(); // Cycle
            PINS.push(ent); // Rotate

            // Set Game Target
            const ctl = Y?.get_controller?.();
            if (ctl?.set_currentTarget) ctl.set_currentTarget(ent);
        }, 100); // Fast cycle
    }

    function stopPinningLoop() {
        active = false;
        clearInterval(interval);
    }

    window.addEventListener("keydown", e => {
        // Alt+Z to Pin
        if (e.altKey && e.keyCode === 90) {
            e.preventDefault();
            pinTarget();
        }
        // Alt+Shift+Z Clear
        if (e.altKey && e.shiftKey && e.keyCode === 90) {
            PINS = [];
        }
    });

    // 2. SPAM TAB (Alt+S)
    let spamActive = false;
    let spamIv = null;

    function spamAction() {
        // Dispatches 'S' key press repeatedly
        const ev = { key: 's', keyCode: 83, bubbles: true };
        document.dispatchEvent(new KeyboardEvent("keydown", ev));
        document.dispatchEvent(new KeyboardEvent("keyup", ev));
    }

    window.addEventListener("keydown", e => {
        if (e.altKey && e.keyCode === 83) { // Alt+S
            e.preventDefault();
            spamActive = !spamActive;
            if (spamActive) {
                spamIv = setInterval(spamAction, 60); // Fast spam
            } else {
                clearInterval(spamIv);
            }
        }
    });
})();
