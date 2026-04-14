"use strict";

const extensionName = "lumipulse-st-extension";
let extension_settings = {};

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

    // ถ้าเคยเปิดไว้แล้ว ให้เสกปุ่มตอนเข้าเว็บเลย
    if (extension_settings[extensionName].isEnabled) {
        spawnLumiButton();
    }
}

function createSettingsUI() {
    const settingsHtml = `
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b style="color: #ff85a2;">🌸 LumiPulse Hub</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
        </div>
        <div class="inline-drawer-content">
            <label class="checkbox_label">
                <input id="lumi_enable_toggle" type="checkbox" />
                <span>เปิดใช้งาน LumiPulse</span>
            </label>
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
                toastr.success("🌸 กำลังเสกปุ่ม...");
                spawnLumiButton();
            } else {
                $('#lumi-main-fab').remove();
            }
        });
}

// 🪄 ฟังก์ชันเสกปุ่ม (รอบนี้เอาไว้ "กลางจอ" หนีขอบล่างมือถือ)
function spawnLumiButton() {
    // ลบของเก่าออกก่อน
    $('#lumi-main-fab').remove();

    // สร้างปุ่มใหม่ โดยให้ลอยอยู่กลางจอ (top: 40%) 
    const btnHtml = `
        <div id="lumi-main-fab" style="
            position: fixed !important;
            top: 40% !important;   /* <--- จุดเปลี่ยน! ให้ลอยตรงกลางจอค่อนไปข้างบนนิดๆ */
            right: 20px !important;
            width: 60px !important;
            height: 60px !important;
            background: linear-gradient(135deg, #FFB6C1, #FF69B4) !important;
            border: 3px solid white !important;
            border-radius: 50% !important;
            color: white !important;
            font-size: 30px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important; /* ทะลุทุกเลเยอร์ */
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            cursor: pointer !important;
            user-select: none !important;
        ">💖</div>
    `;
    
    // แปะลงหน้าจอด้วย jQuery แบบเดียวกับที่สร้างเมนู
    $('body').append(btnHtml);

    // ดักจับการกดปุ่ม
    $('#lumi-main-fab').on('click', function() {
        toastr.info("💖 เย้! คุณมายด์กดปุ่มได้แล้วววว!");
        
        // ลูกเล่นปุ่มเด้งดึ๋งเวลากด
        $(this).css('transform', 'scale(0.8)');
        setTimeout(() => {
            $(this).css('transform', 'scale(1)');
        }, 150);
    });
}
