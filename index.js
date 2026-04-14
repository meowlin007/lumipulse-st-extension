"use strict";

const extensionName = "lumipulse-st-extension";
let extension_settings = {};

// 1. รอ ST โหลดเสร็จ
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
        context.extensionSettings[extensionName] = { isEnabled: false };
        context.saveSettingsDebounced();
    }
    extension_settings = context.extensionSettings;

    createSettingsUI();
    
    // 🔥 ท่าไม้ตาย: หมาเฝ้ายาม! เช็คทุกๆ 2 วินาทีว่าปุ่มหายไหม ถ้าเปิดอยู่แต่ปุ่มหาย ให้สร้างใหม่ทันที!
    setInterval(forceFabWatchdog, 2000);
}

function createSettingsUI() {
    const settingsHtml = `
    <div class="lumipulse-settings-panel">
        <div class="inline-drawer">
            <div class="inline-drawer-header inline-drawer-toggle">
                <b style="color: #ff85a2;">🌸 LumiPulse: Configuration</b>
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
    $('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);

    $('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        
        // แจ้งเตือนเพื่อให้รู้ว่าปุ่มโดนกดจริงๆ
        if (extension_settings[extensionName].isEnabled) {
            toastr.success("🌸 เปิดใช้งานแล้ว! กำลังเสกปุ่ม...");
        }
        
        forceFabWatchdog();
    });
}

// 🔥 ฟังก์ชันเสกปุ่มแบบโคตรดุดัน (ใช้ createElement แบบเดียวกับ Mobile Context เป๊ะๆ)
function forceFabWatchdog() {
    const isEnabled = extension_settings[extensionName].isEnabled;
    let fab = document.getElementById('lumi-main-fab');

    if (isEnabled) {
        // ถ้าเปิดใช้งานอยู่ แต่หาปุ่มไม่เจอ (โดนระบบลบทิ้ง) -> ให้สร้างใหม่!
        if (!fab) {
            fab = document.createElement('button'); // เปลี่ยนมาใช้ button แทน div
            fab.id = 'lumi-main-fab';
            fab.innerHTML = '💖'; // ใช้ Emoji ไปก่อนชัวร์สุด!
            
            // ยัด CSS แบบ Inline ดิบๆ
            fab.style.cssText = `
                position: fixed !important;
                bottom: 100px !important;
                right: 20px !important;
                width: 60px !important;
                height: 60px !important;
                background: #FFB6C1 !important;
                color: white !important;
                border: 3px solid white !important;
                border-radius: 50% !important;
                font-size: 30px !important;
                z-index: 2147483647 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
                padding: 0 !important;
                margin: 0 !important;
                cursor: pointer !important;
            `;
            
            // เวลากดให้เด้ง Alert เช็คว่าปุ่มทำงานได้ไหม
            fab.onclick = function() {
                alert("💖 LumiPulse Hub: ปุ่มกดได้แล้วววว!");
            };
            
            document.body.appendChild(fab);
            console.log("🌸 LumiPulse: Watchdog injected the button!");
        } else {
            // ถ้ามีปุ่มอยู่แล้ว บังคับให้มันโชว์
            fab.style.display = 'flex';
        }
    } else {
        // ถ้าปิดใช้งาน ให้ลบปุ่มทิ้ง
        if (fab) {
            fab.remove();
        }
    }
}
