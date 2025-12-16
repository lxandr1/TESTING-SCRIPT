/* ==========================================================================
   MODULE 2: ALT+E PANEL & ALT+W HELPER
   ========================================================================== */
(() => {
    if (window.__ALT_E_PANEL__) return;
    window.__ALT_E_PANEL__ = 1;

    // Config
    const IDS_CONSTRUCTION = new Set([14, 403, 418, 419, 420, 421, 422, 423, 424, 437, 445, 450, 451]);
    const IDS_BASTION = new Set([472, 144, 357, 358]);

    // UI Creation
    function init() {
        if (document.getElementById("__alt_e_panel")) return;

        // CSS
        const s = document.createElement("style");
        s.textContent = `
            #__alt_e_backdrop { position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2147483647;display:none;align-items:center;justify-content:center }
            #__alt_e_panel { font:14px Arial,sans-serif; background:#0f172a; color:#e2e8f0; border-radius:12px; padding:16px; border:1px solid rgba(148,163,184,.2); position:relative; width:280px }
            #__alt_e_panel button { width:100%; padding:10px; margin-top:8px; border-radius:8px; border:1px solid rgba(148,163,184,.2); background:#1e293b; color:#fff; cursor:pointer; font-weight:bold }
            #__alt_e_panel button:hover { background:#334155 }
            #__alt_e_panel .close { position:absolute; top:8px; right:10px; width:auto; margin:0; background:transparent; border:none; color:#94a3b8; font-size:16px }
            #__alt_e_toast { position:fixed; left:50%; transform:translateX(-50%); bottom:20px; background:#1e293b; color:#fff; padding:8px 16px; border-radius:20px; border:1px solid #334155; display:none; z-index:2147483647 }
        `;
        document.head.appendChild(s);

        // Elements
        const bd = document.createElement("div"); bd.id = "__alt_e_backdrop";
        bd.innerHTML = `
            <div id="__alt_e_panel">
                <button class="close">✕</button>
                <div style="font-weight:bold;margin-bottom:8px">Building Saver</div>
                <button id="__btn_cons">Construction</button>
                <button id="__btn_bast">Bastion</button>
            </div>
        `;

        const toast = document.createElement("div"); toast.id = "__alt_e_toast";

        function mount() {
            const root = document.fullscreenElement || document.body;
            root.appendChild(bd);
            root.appendChild(toast);
        }
        mount();
        ["fullscreenchange", "webkitfullscreenchange"].forEach(e => document.addEventListener(e, mount));

        // Logic
        bd.querySelector(".close").onclick = () => bd.style.display = "none";
        bd.onclick = (e) => { if (e.target === bd) bd.style.display = "none"; };

        document.getElementById("__btn_cons").onclick = () => saveBuildings("Construction", IDS_CONSTRUCTION);
        document.getElementById("__btn_bast").onclick = () => saveBuildings("Bastion", IDS_BASTION);

        window.toggleAltEPanel = () => {
            bd.style.display = (bd.style.display === "flex") ? "none" : "flex";
        };
    }

    function showToast(msg) {
        const t = document.getElementById("__alt_e_toast");
        if (t) { t.innerHTML = msg; t.style.display = "block"; setTimeout(() => t.style.display = "none", 1500); }
    }

    async function saveBuildings(label, idSet) {
        if (!await window.__SHARED_VERIFIER__.verify()) return;

        try {
            const found = x.findBuildings(b => {
                try { return idSet.has(b.get_type()); } catch (e) { return false; }
            });

            const payload = found.map(b => ({
                get_id: (id => () => id)(b.get_id()),
                _pos: { x: b.get_x(), y: b.get_y() }
            }));

            if (payload.length) Fa.saveBulkAfterMove(payload);

            showToast(`${label} Saved: ${payload.length}`);
            document.getElementById("__alt_e_backdrop").style.display = "none";
        } catch (e) { }
    }

    // Alt+E Listener
    document.addEventListener("keydown", e => {
        if (e.altKey && (e.key === 'e' || e.keyCode === 69)) {
            init();
            window.toggleAltEPanel();
        }
    });

    // Alt+W Logic (Save Hovered)
    if (!window.__ALT_W__) {
        window.__ALT_W__ = 1;
        let mx = 0, my = 0;
        document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });

        document.addEventListener("keydown", async e => {
            if (e.altKey && (e.key === 'w' || e.keyCode === 87)) {
                e.preventDefault();
                if (!await window.__SHARED_VERIFIER__.verify()) return;

                // Find building under mouse using naive distance or game function
                // Simplified: Finding closest building to mouse
                try {
                    const cvs = document.querySelector("canvas");
                    if (!cvs) return;
                    const r = cvs.getBoundingClientRect();
                    const cx = (mx - r.left) * (cvs.width / r.width);
                    const cy = (my - r.top) * (cvs.height / r.height);

                    let target = null;
                    let minDist = 9999999;

                    // Try to use game internal mouse pos if available
                    let gmx = M?._GROUND?.get_mouseX?.();
                    let gmy = M?._GROUND?.get_mouseY?.();

                    const all = x.findBuildings(() => true);
                    all.forEach(b => {
                        const dx = b.get_x() - (gmx || cx);
                        const dy = b.get_y() - (gmy || cy);
                        const d = dx * dx + dy * dy;
                        if (d < minDist) { minDist = d; target = b; }
                    });

                    if (target && minDist < 4000) { // arbitrary close distance
                        Fa.saveBulkAfterMove([{
                            get_id: (id => () => id)(target.get_id()),
                            _pos: { x: target.get_x(), y: target.get_y() }
                        }]);
                        showToast("✓ Saved 1 Entity");
                    }
                } catch (e) { }
            }
        });
    }

})();
