/* ==========================================================================
   MODULE 3: CLICK PANEL (MACRO RECORDER) ALT+,
   ========================================================================== */
(() => {
    if (window.__MACRO_REC__) return;
    window.__MACRO_REC__ = 1;

    let pointsA = [], pointsR = [];
    let captureMode = null; // "A" or "R"

    function getCanvas() { return document.querySelector("#game canvas") || document.querySelector("canvas"); }

    function simulateClick(relX, relY) {
        const c = getCanvas(); if (!c) return;
        const r = c.getBoundingClientRect();
        const evts = ["mousemove", "mousedown", "mouseup", "click"];
        evts.forEach(et => {
            c.dispatchEvent(new MouseEvent(et, {
                bubbles: true, clientX: r.left + r.width * relX, clientY: r.top + r.height * relY
            }));
        });
    }

    function runSequence(pts) {
        pts.forEach(p => simulateClick(p[0], p[1]));
    }

    function pressEnter() {
        const ev = { key: "Enter", keyCode: 13, which: 13, bubbles: true };
        document.dispatchEvent(new KeyboardEvent("keydown", ev));
        document.dispatchEvent(new KeyboardEvent("keyup", ev));
    }

    // Capture Logic
    document.addEventListener("click", e => {
        if (!captureMode) return;
        const c = getCanvas();
        if (!c) return;
        const r = c.getBoundingClientRect();
        const rx = (e.clientX - r.left) / r.width;
        const ry = (e.clientY - r.top) / r.height;
        if (rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1) {
            if (captureMode === 'A') pointsA.push([rx, ry]);
            if (captureMode === 'R') pointsR.push([rx, ry]);
            updateUI();
        }
    }, true);

    // UI
    function initUI() {
        if (document.getElementById("__macro_ui")) return;
        const d = document.createElement("div"); d.id = "__macro_ui";
        d.style.cssText = "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#000;color:#0f0;border:1px solid #0f0;padding:10px;display:none;z-index:999999;font-family:monospace";
        d.innerHTML = `
            <div style="font-weight:bold;margin-bottom:5px">MACRO RECORDER <button id="m_close">X</button></div>
            <button id="m_rec_a">Rec A</button> <button id="m_play_a">Play A (Enter)</button> <button id="m_clear_a">Clear A</button><br>
            <textarea id="m_ta_a" style="width:200px;height:50px;background:#111;color:#0f0"></textarea><br>
            <button id="m_rec_r">Rec R</button> <button id="m_play_r">Play R</button> <button id="m_clear_r">Clear R</button><br>
            <textarea id="m_ta_r" style="width:200px;height:50px;background:#111;color:#0f0"></textarea><br>
            <div id="m_status" style="margin-top:5px;color:#ff0"></div>
        `;
        document.body.appendChild(d);

        d.querySelector("#m_close").onclick = () => d.style.display = "none";

        d.querySelector("#m_rec_a").onclick = () => { captureMode = (captureMode === 'A' ? null : 'A'); updateUI(); };
        d.querySelector("#m_clear_a").onclick = () => { pointsA = []; updateUI(); };
        d.querySelector("#m_play_a").onclick = () => runSequence(pointsA);

        d.querySelector("#m_rec_r").onclick = () => { captureMode = (captureMode === 'R' ? null : 'R'); updateUI(); };
        d.querySelector("#m_clear_r").onclick = () => { pointsR = []; updateUI(); };
        d.querySelector("#m_play_r").onclick = () => { runSequence(pointsR); setTimeout(pressEnter, 250); setTimeout(pressEnter, 500); };
    }

    function updateUI() {
        const st = document.getElementById("m_status");
        if (st) st.innerText = captureMode ? `RECORDING ${captureMode}... (Click map)` : "Idle";
        document.getElementById("m_ta_a").value = JSON.stringify(pointsA);
        document.getElementById("m_ta_r").value = JSON.stringify(pointsR);

        // Sync to global for restart loop
        window.__RESTART_POINTS__ = pointsR;
    }

    document.addEventListener("keydown", e => {
        if (e.altKey && e.key === ',') {
            initUI();
            const ui = document.getElementById("__macro_ui");
            ui.style.display = (ui.style.display === 'block' ? 'none' : 'block');
            updateUI();
        }
        if (!captureMode && e.keyCode === 13 && pointsA.length > 0 && e.target.tagName !== "TEXTAREA") {
            // Enter plays A
            runSequence(pointsA);
        }
    });

    // Validations & Restart Loop (from original)
    window.__DO_RESTART__ = function () {
        if (window.__RESTART_POINTS__ && window.__RESTART_POINTS__.length) {
            runSequence(window.__RESTART_POINTS__);
            setTimeout(pressEnter, 250);
            setTimeout(pressEnter, 550);
        }
    };
    // Note: The global restart interval caller is usually outside or in Module 4. 
})();
