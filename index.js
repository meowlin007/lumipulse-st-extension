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
    if (extension_settings[extensionName].isEnabled) spawnLumiButton();
}

function createSettingsUI() {
    const html = `
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
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) spawnLumiButton(); else $('#lumi-main-fab').remove();
    });
}

function spawnLumiButton() {
    $('#lumi-main-fab').remove();

    // เพิ่ม CSS Animation ให้ขยับนุ่มๆ
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes lumiFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
    `;
    document.head.appendChild(style);

    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    
    fab.style.cssText = `
        position: fixed !important;
        top: 45% !important;
        right: 15px !important;
        width: 60px !important;
        height: 60px !important;
        background: url('${btnUrl}') no-repeat center !important;
        background-size: contain !important;
        z-index: 2147483647 !important;
        cursor: move !important;
        touch-action: none !important;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)) !important;
        transition: transform 0.2s ease;
    `;
    
    document.body.appendChild(fab);

    let isDragging = false;
    let offset = { x: 0, y: 0 };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false;
        fab.classList.remove('lumi-floating'); // หยุดขยับตอนกำลังลาก
        const touch = e.touches[0];
        offset.x = touch.clientX - fab.getBoundingClientRect().left;
        offset.y = touch.clientY - fab.getBoundingClientRect().top;
    }, { passive: true });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        let x = touch.clientX - offset.x;
        let y = touch.clientY - offset.y;

        x = Math.max(0, Math.min(x, window.innerWidth - 60));
        y = Math.max(0, Math.min(y, window.innerHeight - 60));

        fab.style.left = x + 'px';
        fab.style.top = y + 'px';
        fab.style.right = 'auto';
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        if (!isDragging) toastr.info("💖 LumiPulse Hub!");
        fab.classList.add('lumi-floating'); // กลับมาขยับเหมือนเดิม
        isDragging = false;
    });
}
