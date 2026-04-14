"use strict";

const extensionName = "lumipulse-st-extension";
let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";

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
            if (enabled) { spawnLumiButton(); } else { $('#lumi-main-fab').remove(); }
        });
}

function spawnLumiButton() {
    $('#lumi-main-fab').remove();

    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    
    // ตั้งค่า Style: ใช้รูปภาพ, ไม่มีพื้นหลัง, อยู่ริมจอตรงกลาง
    fab.style.cssText = `
        position: fixed !important;
        top: 45% !important;
        right: 10px !important;
        width: 70px !important;
        height: 70px !important;
        background: url('${btnUrl}') no-repeat center !important;
        background-size: contain !important;
        z-index: 2147483647 !important;
        cursor: move !important;
        user-select: none !important;
        touch-action: none !important;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)) !important;
    `;
    
    document.body.appendChild(fab);

    // --- ระบบลากปุ่ม (Draggable) สำหรับมือถือ ---
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; // รีเซ็ตสถานะการลาก
        const touch = e.touches[0];
        offset.x = touch.clientX - fab.getBoundingClientRect().left;
        offset.y = touch.clientY - fab.getBoundingClientRect().top;
    }, { passive: true });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        
        let newX = touch.clientX - offset.x;
        let newY = touch.clientY - offset.y;

        // ป้องกันไม่ให้ลากทะลุขอบจอ
        newX = Math.max(0, Math.min(newX, window.innerWidth - 70));
        newY = Math.max(0, Math.min(newY, window.innerHeight - 70));

        fab.style.left = newX + 'px';
        fab.style.top = newY + 'px';
        fab.style.right = 'auto'; // ยกเลิกการยึดขอบขวาเดิม
    }, { passive: false });

    fab.addEventListener('touchend', (e) => {
        // ถ้าแค่แตะเฉยๆ (ไม่ได้ลาก) ให้ทำงานเหมือนการคลิก
        if (!isDragging) {
            toastr.info("💖 LumiPulse: Hub Opening...");
        }
        isDragging = false;
    });
}
