/**
 * REFACTORED GAME SCRIPT
 * 
 * Modules:
 * 1. Shared Verification (Anti-Cheat Bypass/Check)
 * 2. Alt+E Panel: Construction & Bastion Saver
 * 3. Click Panel (Alt+,): Macro Recorder
 * 4. Auto Deploy (Alt+Q): Air Spread & Unit Logic
 * 5. 991 Addon: Unit 991 Special Handler
 * 6. Buff Panel Pro (Alt+0/P): Store & Inventory Buffs
 * 7. Multi Core Z/Q: Target Pinner
 * 8. Spam Tab (Alt+S): Key Spammer
 */

/* ==========================================================================
   MODULE 1: SHARED VERIFICATION
   Used by other modules to ensure the user is "authorized" via a remote check.
   ========================================================================== */
window.__SHARED_VERIFIER__ = (() => {
    const VERIFY_URL = "https://v3-h5hfd4egh7ewbrfp.germanywestcentral-01.azurewebsites.net/Cetjag/Fxrosg";
    const EXPECTED = "ContrarytopopularbeliefLoremIpsumisnotsimplyrandomtextIthasrootsinapieceofclassicalLatinliteraturefrom45BCmakingitover2000yearsoldRichardMcClintockaLatinprofessoratHampdenSydneyCollegeinVirginialookeduponeofthemoreobscureLatinwordsconsecteturfromaLoremIpsumpassageandgoingthroughthecitesofthewordinclassicalliteraturediscoveredtheundoubtablesourceLoremIpsumcomesfromsections11032and11033ofdeFinibusBonorummetMalorumTheExtremesofGoodandEvilbyCicerowrittenin45BCThisbookisatreatiseonthetheoryofethicsverypopularduringtheRenaissanceThefirstlineofLoremIpsumLoremipsumdolorsitametcomesfromalineinsection11032ThestandardchunkofLoremIpsumusedsincethe1500sisreproducedbelowforthoseinterestedSections11032and11033fromdeFinibusBonorummetMalorumbyCiceroarealsoreproducedintheirexactoriginalformaccompaniedbyEnglishversionsfromthe1914translationbyHRackhamTherearemanyvariationsofpassagesofLoremIpsumavailablebutthemajorityhavesufferedalterationinsomeformbyinjectedhumourorrandomisedwordswhichdontlookevenslightlybelievableIfyouaregoingtouseapassageofLoremIpsumyouneedtobesurethereisntanythingembarrassinghiddeninthemiddleoftextAlltheLoremIpsumgeneratorsontheInternettendtorepeatpredefinedchunksasnecessarymakingthisthefirsttruegeneratorontheInternetItusesadictionaryofover200LatinwordscombinedwithahandfulofmodelsentencestructurestogenerateLoremIpsumwhichlooksreasonableThegeneratedLoremIpsumisthereforealwaysfreefromrepetitioninjectedhumourornoncharacteristicwordsetc";
    const SESSION_KEY = "__fx_access_ok";

    // Initial load check
    try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
            // Already verified
        } else {
            // Start background verification
            runVerificationLoop();
        }
    } catch (e) { }

    async function check() {
        // If already passed in session, return true immediately
        if (sessionStorage.getItem(SESSION_KEY) === "1") return true;

        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 1500);
        try {
            const res = await fetch(VERIFY_URL, {
                method: "GET", mode: "cors", cache: "no-store",
                credentials: "omit", headers: { Accept: "text/plain" },
                signal: controller.signal
            });
            clearTimeout(tid);
            if (!res || !res.ok) return false;
            const txt = (await res.text()).trim();
            if (txt === EXPECTED) {
                try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) { }
                return true;
            }
        } catch (e) { }
        return false;
    }

    function runVerificationLoop() {
        let fails = 0;
        const iv = setInterval(async () => {
            const ok = await check();
            if (ok) {
                clearInterval(iv);
            } else {
                fails++;
                if (fails > 2) location.reload();
            }
        }, 10000);
        check(); // run once immediately
    }

    return {
        verify: check
    };
})();
