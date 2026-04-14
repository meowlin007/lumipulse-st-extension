"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { isEnabled: false };
let extension_settings = {};

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
    toggleLumiFab(extension_settings[extensionName].isEnabled);
}

function createSettingsUI() {
    const settingsHtml = `
    <div class="lumipulse-settings-panel">
        <div class="inline-drawer">
            <div class="inline-drawer-header inline-drawer-toggle">
                <b style="color: #ff85a2;">🌸 LumiPulse: Configuration</b>
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
            toggleLumiFab(isChecked);
        });
}

function toggleLumiFab(isEnabled) {
    const existingFab = document.getElementById('lumi-main-fab');
    if (existingFab) existingFab.remove();

    if (isEnabled) {
        const fab = document.createElement('div');
        fab.id = 'lumi-main-fab';
        fab.title = 'LumiPulse Hub';
        
        // ยัด CSS ตรงๆ ลงใน JS! ไม่ง้อไฟล์ style.css แล้ว (ยกระดับ z-index และปรับ bottom หลบ UI)
        fab.style.cssText = `
            position: fixed !important;
            bottom: 85px !important;
            right: 20px !important;
            width: 55px !important;
            height: 55px !important;
            background: linear-gradient(135deg, #FFD1DC 0%, #FFB6C1 100%) !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999999 !important;
            cursor: pointer !important;
            color: white !important;
            font-size: 24px !important;
            border: 3px solid #FFFFFF !important;
            box-shadow: 0 4px 15px rgba(255, 182, 193, 0.8) !important;
            transition: transform 0.2s ease !important;
        `;
        
        // ใส่ Icon FontAwesome
        fab.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles" style="text-shadow: 0 0 5px rgba(255,255,255,0.8);"></i>';
        
        // เพิ่มลูกเล่นเวลากดแตะหน้าจอมือถือ
        fab.addEventListener('touchstart', () => { fab.style.transform = 'scale(0.9)'; }, {passive: true});
        fab.addEventListener('touchend', () => { fab.style.transform = 'scale(1)'; }, {passive: true});
        
        fab.addEventListener('click', () => {
            toastr.info('🌸 LumiPulse Hub!');
        });

        // แปะลง body โดยตรงแบบ Mobile Context
        document.body.appendChild(fab);
    }
}
