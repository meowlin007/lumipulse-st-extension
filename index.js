"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { isEnabled: false };
let extension_settings = {};

// 1. ยัด CSS เข้าไปใน Head ของหน้าเว็บตรงๆ (เพื่อให้ปุ่มสวยและคุมการเปิด/ปิดได้)
const style = document.createElement('style');
style.innerHTML = `
    .lumi-fab {
        position: fixed !important;
        bottom: 85px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: linear-gradient(135deg, #FFD1DC 0%, #FFB6C1 100%) !important;
        border-radius: 50% !important;
        display: none; /* ปิดไว้ก่อนเป็นค่าเริ่มต้น */
        align-items: center !important;
        justify-content: center !important;
        z-index: 999999 !important;
        cursor: pointer !important;
        color: white !important;
        font-size: 26px !important;
        border: 3px solid #FFFFFF !important;
        box-shadow: 0 4px 15px rgba(255, 182, 193, 0.8) !important;
        transition: transform 0.2s ease !important;
    }
    .lumi-fab.is-active { display: flex !important; }
    .lumi-fab:active { transform: scale(0.9) !important; }
`;
document.head.appendChild(style);

// 2. เริ่มการทำงาน
jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext) {
            clearInterval(boot);
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

    // สร้างปุ่มทิ้งไว้ใน Body เลย (แต่ยังไม่สั่งโชว์)
    createFabElement();
    // สร้างเมนูตั้งค่า
    createSettingsUI();
    // เช็คสถานะครั้งแรก
    updateVisibility();
}

function createFabElement() {
    if ($('#lumi-main-fab').length === 0) {
        const fabHtml = `<div id="lumi-main-fab" class="lumi-fab"><i class="fa-solid fa-wand-magic-sparkles"></i></div>`;
        $('body').append(fabHtml);
        
        $('#lumi-main-fab').on('click', () => {
            toastr.success('🌸 LumiPulse Hub!');
        });
    }
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
            extension_settings[extensionName].isEnabled = $(this).prop('checked');
            SillyTavern.getContext().saveSettingsDebounced();
            updateVisibility();
        });
}

function updateVisibility() {
    const isEnabled = extension_settings[extensionName].isEnabled;
    if (isEnabled) {
        $('#lumi-main-fab').addClass('is-active');
        console.log("🌸 LumiPulse: FAB Show");
    } else {
        $('#lumi-main-fab').removeClass('is-active');
        console.log("🌸 LumiPulse: FAB Hide");
    }
}
