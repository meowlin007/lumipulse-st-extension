"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { isEnabled: false };
let extension_settings = {};

jQuery(async () => {
    if (!window.SillyTavern) {
        const waitForST = setInterval(() => {
            if (window.SillyTavern) {
                clearInterval(waitForST);
                initLumiPulsePlugin();
            }
        }, 1000);
    } else {
        initLumiPulsePlugin();
    }
});

async function initLumiPulsePlugin() {
    try {
        const context = SillyTavern.getContext();
        if (!context.extensionSettings[extensionName]) {
            context.extensionSettings[extensionName] = { ...defaultSettings };
            context.saveSettingsDebounced();
        }
        extension_settings = context.extensionSettings;

        createSettingsUI();

        if (extension_settings[extensionName].isEnabled) {
            addLumiFabToBody();
        }
        
        console.log("🌸 LumiPulse: Plugin Loaded Successfully");
    } catch (error) {
        console.error("🌸 LumiPulse: Init failed", error);
    }
}

function createSettingsUI() {
    const settingsHtml = `
    <div id="lumi_context_settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🌸 LumiPulse Hub</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="flex-container">
                    <label class="checkbox_label">
                        <input id="lumi_enable_toggle" type="checkbox" />
                        <span>เปิดใช้งาน LumiPulse</span>
                    </label>
                </div>
            </div>
        </div>
    </div>`;

    $('#extensions_settings').append(settingsHtml);

    $('#lumi_enable_toggle')
        .prop('checked', extension_settings[extensionName].isEnabled)
        .on('change', function () {
            const enabled = $(this).prop('checked');
            extension_settings[extensionName].isEnabled = enabled;
            SillyTavern.getContext().saveSettingsDebounced();
            
            if (enabled) {
                toastr.success("🌸 กำลังเสกปุ่ม LumiPulse...");
                addLumiFabToBody();
            } else {
                $('#lumi-main-fab').remove();
            }
        });
}

function addLumiFabToBody() {
    // หน่วงเวลานิดนึงเพื่อให้ ST พร้อม แบบที่ Mobile Context ทำ
    setTimeout(() => {
        if ($('#lumi-main-fab').length > 0) return;

        const fab = document.createElement('button');
        fab.id = 'lumi-main-fab';
        fab.innerHTML = '💖';
        
        // ใช้สไตล์แบบ Fixed ที่ Mobile Context ใช้ได้จริง
        fab.style.cssText = `
            position: fixed !important;
            bottom: 120px !important;
            right: 20px !important;
            width: 55px !important;
            height: 55px !important;
            background: linear-gradient(135deg, #FFB6C1, #FF69B4) !important;
            color: white !important;
            border: 3px solid white !important;
            border-radius: 50% !important;
            font-size: 24px !important;
            cursor: pointer !important;
            z-index: 9998 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s ease !important;
        `;

        fab.onclick = () => {
            toastr.info("🌸 LumiPulse Hub เร็วๆ นี้ค่ะ!");
        };

        document.body.appendChild(fab);
        console.log("🌸 LumiPulse: FAB Added to Body");
    }, 500);
}
