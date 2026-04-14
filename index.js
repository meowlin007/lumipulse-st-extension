"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
};

let extension_settings = {};

jQuery(async () => {
    if (!window.SillyTavern) {
        console.log("🌸 [LumiPulse] กำลังรอ SillyTavern เริ่มต้น...");
        const waitForST = setInterval(() => {
            if (window.SillyTavern) {
                clearInterval(waitForST);
                initLumiPulse();
            }
        }, 1000);
    } else {
        initLumiPulse();
    }
});

function initLumiPulse() {
    try {
        const context = SillyTavern.getContext();
        
        if (!context.extensionSettings[extensionName]) {
            context.extensionSettings[extensionName] = { ...defaultSettings };
            context.saveSettingsDebounced();
        }
        
        extension_settings = context.extensionSettings;

        createSettingsUI();

        // **เวทมนตร์บรรทัดนี้!**: ตรวจสอบสถานะตอนเปิดแอป ถ้า Enable อยู่ ให้เสกปุ่ม FAB ขึ้นมาทันที
        toggleLumiFab(extension_settings[extensionName].isEnabled);

        console.log("💖 LumiPulse: Registered Successfully!");
    } catch (error) {
        console.error("🌸 [LumiPulse] เกิดข้อผิดพลาด:", error);
    }
}

function createSettingsUI() {
    const settingsHtml = `
    <div class="lumipulse-settings-panel" id="lumipulse-settings-container">
        <div class="inline-drawer">
            <div class="inline-drawer-header inline-drawer-toggle">
                <b>🌸 LumiPulse: Configuration</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="flex-container">
                    <label class="checkbox_label">
                        <input type="checkbox" id="lumi-enable-toggle">
                        Enable LumiPulse Hub
                    </label>
                </div>
                <p style="font-size: 0.85em; opacity: 0.8; color: #ff85a2; margin-top: 5px;">
                    ระบบจังหวะแสงแห่งความทรงจำ และโลกจำลองของตัวละคร
                </p>
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
            
            // **เวทมนตร์บรรทัดนี้!**: เรียกใช้ฟังก์ชันเสก/ลบปุ่ม เมื่อติ๊กเปิด-ปิด
            toggleLumiFab(isChecked);
            
            console.log("🌸 [LumiPulse] สถานะถูกเปลี่ยนเป็น:", isChecked);
        });
}

// -------------------------------------------------------------------------
// 🎀 ส่วนสร้างและจัดการปุ่ม FAB (หัวใจดวงใหม่ของเรา!)
// -------------------------------------------------------------------------

function toggleLumiFab(isEnabled) {
    const existingFab = document.getElementById('lumi-main-fab');

    if (isEnabled) {
        // ถ้าเปิด Enable และยังไม่มีปุ่ม ให้สร้างขึ้นมา
        if (!existingFab) {
            const fabHtml = `
                <div id="lumi-main-fab" class="lumi-fab" title="Open LumiPulse Hub">
                    <i class="fa-solid fa-heart-pulse"></i> 
                </div>
            `;
            // ใช้ไอคอน FontAwesome รูปหัวใจมีชีพจร (Heart Pulse)
            $('body').append(fabHtml);

            // ใส่ลูกเล่นตอนคลิกปุ่ม (เดี๋ยวเราค่อยมาทำเมนูเด้งทีหลัง ตอนนี้เอาให้กดได้ก่อน)
            $('#lumi-main-fab').on('click', function() {
                console.log("💖 LumiPulse FAB Clicked!");
                // ใส่ Animation เล็กๆ เวลากด
                $(this).addClass('clicked');
                setTimeout(() => { $(this).removeClass('clicked'); }, 200);
            });
        }
    } else {
        // ถ้าปิด Enable ให้ลบปุ่มทิ้งไป
        if (existingFab) {
            existingFab.remove();
        }
    }
}
