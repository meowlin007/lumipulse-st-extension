"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { isEnabled: false };
let extension_settings = {};

// 1. รอให้ SillyTavern พร้อมจริงๆ
function checkSillyTavernReady() {
    return window.SillyTavern && 
           typeof window.SillyTavern.getContext === 'function';
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
    
    // บังคับเช็คสถานะปุ่มทันทีที่โหลด
    setTimeout(() => {
        toggleLumiFab(extension_settings[extensionName].isEnabled);
    }, 2000); // รอเพิ่มอีก 2 วิเพื่อให้หน้าจอแชทโหลดนิ่งๆ
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

// ฟังก์ชันสร้างปุ่ม FAB ที่จะใช้ jQuery แปะลงหน้าจอตรงๆ
function toggleLumiFab(isEnabled) {
    // ลบอันเก่าออกก่อนทุกครั้งกันเหนียว
    $('#lumi-main-fab').remove();

    if (isEnabled) {
        console.log("🌸 LumiPulse: Creating FAB...");
        
        // สร้าง HTML ปุ่มแบบใส่สไตล์ลงไปเลย (Inline Style)
        const fabHtml = `
            <div id="lumi-main-fab" style="
                position: fixed !important;
                bottom: 25px !important;
                right: 25px !important;
                width: 60px !important;
                height: 60px !important;
                background: linear-gradient(135deg, #FFD1DC 0%, #FFB6C1 100%) !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 2147483647 !important;
                cursor: pointer !important;
                color: white !important;
                font-size: 26px !important;
                border: 3px solid #FFFFFF !important;
                box-shadow: 0 4px 15px rgba(255, 182, 193, 0.8) !important;
                pointer-events: auto !important;
                -webkit-user-select: none !important;
            ">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
        `;

        // แปะลงใน Body โดยใช้ jQuery (วิธีเดียวกับที่เมนูติด)
        $('body').append(fabHtml);

        // ใส่ Event คลิก
        $('#lumi-main-fab').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toastr.info('🌸 LumiPulse Hub พร้อมรับใช้แล้วค่ะ!');
            $(this).css('transform', 'scale(0.9)');
            setTimeout(() => $(this).css('transform', 'scale(1)'), 100);
        });
        
        console.log("🌸 LumiPulse: FAB injected successfully!");
    }
}
