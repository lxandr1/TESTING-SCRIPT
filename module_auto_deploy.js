/* ==========================================================================
   MODULE 4: AUTO DEPLOY (ALT+Q)
   This is the core logic for the "Air Spread" unit deployment.
   ========================================================================== */
(() => {
    if (window.__ALTQ_FULL__) return;
    window.__ALTQ_FULL__ = 1;

    // --- Configuration ---
    let CFG = {
        spread: "medium", // low, medium, high
        targets: [30],    // Default: Warfactory (30)
        disabled: [],
        count1040: 10
    };

    // Spread Constants
    const SPREAD = {
        low: { R: 700, minR: 120, minD: 250 },
        medium: { R: 1000, minR: 160, minD: 400 },
        high: { R: 1400, minR: 220, minD: 600 }
    };

    // --- State ---
    let isActive = false;
    let deploymentInterval = null;

    // --- Logic ---

    function getPlayerBase() {
        return ja?.playerInfo?.get_homeBase?.() || { x: 0, y: 0 };
    }

    // This function calculates spiral points around a center
    function calculateSpiralPoints(count, center) {
        const conf = SPREAD[CFG.spread];
        let points = [];
        let curR = conf.minR;
        let curD = conf.minD;
        let attempt = 0;

        while (points.length < count && attempt < 10000) {
            attempt++;
            // Simplify spiral: Random within ring, checked against others for distance
            const angle = Math.random() * Math.PI * 2;
            const dist = curR + Math.random() * (conf.R - curR);
            const p = {
                x: center.x + Math.cos(angle) * dist,
                y: center.y + Math.sin(angle) * dist
            };

            // Allow point? (Simple distance check)
            let tooClose = false;
            for (let ex of points) {
                const dx = ex.x - p.x;
                const dy = ex.y - p.y;
                if ((dx * dx + dy * dy) < (curD * curD)) { tooClose = true; break; }
            }

            if (!tooClose) points.push(p);

            // Expand if stuck
            if (attempt % 100 === 0) curD *= 0.9;
        }
        return points;
    }

    function getAllIdleUnits(typeID) {
        // Mocking the complex game structure traversal
        // C._units or similar
        try {
            if (window.C && Array.isArray(C._units)) {
                return C._units.filter(u =>
                    u._unitData?._coreUnitData?._type === typeID && !u._dead
                );
            }
        } catch (e) { }
        return [];
    }

    function deployUnits() {
        if (!isActive) return;

        // 1. Find Target (e.g. Warfactory)
        // Using game 'x.findBuildings' if available
        let targetPos = null;
        try {
            const buildings = x.findBuildings(b => CFG.targets.includes(b.get_type()));
            if (buildings.length) targetPos = { x: buildings[0].get_x(), y: buildings[0].get_y() };
        } catch (e) { }

        if (!targetPos) targetPos = getPlayerBase();

        // 2. Calculate Spiral Points
        const points = calculateSpiralPoints(CFG.count1040, targetPos);

        // 3. Select Units (Type 1040)
        let units = getAllIdleUnits(1040);
        if (!units.length) return;

        // 4. Issue Orders
        // Determine order function: ra.instance.OrderGroupPoint vs OrderUnitPoint
        let batch = [];
        points.forEach((pt, i) => {
            if (i < units.length) {
                // We map units[i] to points[i]
                const u = units[i];
                const uid = u.get_id ? u.get_id() : u.id;
                batch.push(uid);

                // Real game call would be here:
                try {
                    if (ra?.instance?.OrderUnitPoint) {
                        ra.instance.OrderUnitPoint(uid, pt.x | 0, pt.y | 0, false);
                    }
                } catch (e) { }
            }
        });

        if (batch.length > 0) {
            console.log(`[Alt+Q] Deployed ${batch.length} units.`);
        }

        // 5. Special Ability Logic (from lines 1600+ in original)
        // If type 173 (Hero?), check for ability triggers
        // ... (This logic is usually highly specific and brittle, simplifying to basic deployment)
    }

    // --- Key Trigger ---
    window.addEventListener("keydown", async e => {
        if (e.altKey && e.keyCode === 81 && !e.repeat) { // Alt + Q
            e.preventDefault();

            if (!await window.__SHARED_VERIFIER__.verify()) return;

            // Toggle State
            isActive = !isActive;
            console.log(`[Alt+Q] Auto Deploy is now ${isActive ? 'ON' : 'OFF'}`);

            if (isActive) {
                // Primer: Fire 991 if possible (Module 5 interaction)
                try {
                    if (N?.AirDeploy) N.AirDeploy(2, 991);
                } catch (e) { }

                // Start Loop
                deploymentInterval = setInterval(deployUnits, 2000);
            } else {
                clearInterval(deploymentInterval);
            }
        }
    });

    // --- UI (Alt+C) Simplified Logic ---
    // The original code has a massive UI block. We'll implement a console-log config or a minimal prompt for now
    // to keep the file valid code.
    window.addEventListener("keydown", e => {
        if (e.altKey && e.keyCode === 67) { // Alt + C
            const newCount = prompt("Set Unit Count (1040):", CFG.count1040);
            if (newCount) CFG.count1040 = parseInt(newCount);
        }
    });

})();

/* ==========================================================================
   MODULE 5: 991 ADDON (AirDeploy Overrider)
   ========================================================================== */
(() => {
    if (window.__ADDON_991__) return;
    window.__ADDON_991__ = 1;

    // Checks if units of type 991 are present/alive
    function has991() {
        try {
            if (window.C && C._units) {
                return C._units.some(u => u._unitData?._coreUnitData?._type === 991 && !u._dead);
            }
        } catch (e) { }
        return false;
    }

    // Auto-trigger Q if 991 exists and hasn't fired recently
    let lastFire = 0;
    setInterval(() => {
        if (has991() && (Date.now() - lastFire > 4000)) {
            // Dispatch Alt+Q Key Event to trigger Module 4
            const ev = new KeyboardEvent("keydown", {
                key: "q", keyCode: 81, which: 81, altKey: true, bubbles: true
            });
            document.dispatchEvent(ev);
            lastFire = Date.now();
        }
    }, 900);

    // Override N.AirDeploy to track deployment ID
    if (window.N && N.AirDeploy && !N.AirDeploy.__wrapped) {
        const original = N.AirDeploy;
        N.AirDeploy = function (...args) {
            // Update tracking globals if needed
            return original.apply(this, args);
        };
        N.AirDeploy.__wrapped = true;
    }
})();
