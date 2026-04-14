"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { isEnabled: false };
let extension_settings = {};

// ตรวจสอบความพร้อมของระบบ SillyTavern
function checkSillyTavernReady() {
    return window.SillyTavern && 
           typeof window.SillyTavern.getContext === 'function' && 
           window.SillyTavern.getContext().extensionSettings;
}

jQuery(async () => {
    const bootInterval = setInterval(() => {
        if (checkSillyTavernReady()) {
            clearInterval(bootInterval);
            initLumiPulse();
        }
    }, 1000);
});

function initLumiPulse() {
    const context = SillyTavern.getContext();
    if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = { ...defaultSettings };
        context.saveSettingsDebounced();
    }
    extension_settings = context.extensionSettings;

    createSettingsUI();
    // รันครั้งแรกเพื่อเช็คว่าต้องโชว์ปุ่มไหม
    refreshFabDisplay();
}

function createSettingsUI() {
    const settingsHtml = `
    <div class="lumipulse-settings-panel">
        <div class="inline-drawer">
            <div class="inline-drawer-header inline-drawer-toggle">
                <b>🌸 LumiPulse: Configuration</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="lumi-enable-toggle">
                    <span>Enable LumiPulse Hub</span>
                </label>
            </div>
        </div>
    </div>`;

    $('#extensions_settings').append(settingsHtml);

    $('#lumi-enable-toggle')
        .prop('checked', extension_settings[extensionName].isEnabled)
        .on('change', function () {
            const isChecked = $(this).prop('checked');
            extension_settings[extensionName].isEnabled = isChecked;
            SillyTavern.getContext().saveSettingsDebounced();
            refreshFabDisplay();
        });
}

function refreshFabDisplay() {
    const isEnabled = extension_settings[extensionName].isEnabled;
    $('#lumi-main-fab').remove(); // เคลียร์ของเก่า

    if (isEnabled) {
        // ใช้ไอคอน fa-wand-magic-sparkles (ไม้คฑามีประกาย)
        const fabHtml = `
            <div id="lumi-main-fab" class="lumi-fab">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>`;
        $('body').append(fabHtml);
        
        $('#lumi-main-fab').off('click').on('click', () => {
            toastr.info('🌸 LumiPulse Hub กําลังเตรียมเปิดให้บริการเร็วๆ นี้!');
        });
    }
}
