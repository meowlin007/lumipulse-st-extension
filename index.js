"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
};

// ตัวแปรเก็บการตั้งค่า
let extension_settings = {};

// 1. รอให้หน้าเว็บโหลดเสร็จสมบูรณ์ก่อน (สไตล์ Mobile Context)
jQuery(async () => {
    // รอให้ SillyTavern โหลดระบบหลักเสร็จ
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

// 2. ฟังก์ชันเริ่มการทำงานของระบบ
function initLumiPulse() {
    try {
        // ดึงค่า Context ตรงๆ โดยไม่ต้อง import ให้เกิด Error!
        const context = SillyTavern.getContext();
        
        // ถ้ายังไม่มีการตั้งค่าของเรา ให้สร้างข้อมูลเริ่มต้น
        if (!context.extensionSettings[extensionName]) {
            context.extensionSettings[extensionName] = { ...defaultSettings };
            context.saveSettingsDebounced();
        }
        
        // ผูกข้อมูลเข้ากับตัวแปรหลัก
        extension_settings = context.extensionSettings;

        // 3. สร้างหน้าจอเมนูตั้งค่า
        createSettingsUI();

        console.log("💖 LumiPulse: Registered Successfully (Mobile Context Pattern)!");
    } catch (error) {
        console.error("🌸 [LumiPulse] เกิดข้อผิดพลาดในการเริ่มต้น:", error);
    }
}

// 4. สร้าง UI เมนู (ยัด HTML ลงไปตรงๆ ไม่ต้องโหลดไฟล์ settings.html ให้วุ่นวาย)
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

    // ยัด HTML ลงในเมนู Extension ของ SillyTavern ตรงๆ (วิธีนี้ 100% ติดชัวร์)
    $('#extensions_settings').append(settingsHtml);

    // เชื่อมต่อปุ่ม Checkbox ให้บันทึกค่าได้
    $('#lumi-enable-toggle')
        .prop('checked', extension_settings[extensionName].isEnabled)
        .on('change', function () {
            extension_settings[extensionName].isEnabled = $(this).prop('checked');
            // บันทึกการตั้งค่า
            SillyTavern.getContext().saveSettingsDebounced();
            console.log("🌸 [LumiPulse] เปิดใช้งาน:", extension_settings[extensionName].isEnabled);
        });
}
