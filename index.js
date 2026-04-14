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
    injectStyles();
    createSettingsUI();
    createHubUI();
    if (extension_settings[extensionName].isEnabled) spawnLumiButton();
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        #lumi-hub-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 192, 203, 0.1); backdrop-filter: blur(4px);
            z-index: 2147483646; display: none;
        }
        .lumi-hub-window {
            position: fixed; width: 300px; background: #FFF5F7; 
            border: 3px solid #FFB6C1; border-radius: 20px; padding: 15px;
            box-shadow: 0 10px 30px rgba(255, 105, 180, 0.3);
            text-align: center; z-index: 2147483647;
        }
        .lumi-hub-header { color: #ff85a2; font-weight: bold; font-size: 18px; margin-bottom: 12px; }
        .lumi-menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .lumi-menu-item {
            background: white; border: 2px solid #FFD1DC; padding: 12px 5px;
            border-radius: 12px; cursor: pointer; transition: 0.2s; color: #ff85a2; font-size: 14px;
        }
        .lumi-menu-item:hover { background: #FFD1DC; transform: scale(1.05); }
        .lumi-menu-item i { font-size: 20px; display: block; margin-bottom: 4px; }
        .lumi-close-btn { 
            position: absolute; top: -8px; right: -8px; width: 30px; height: 30px;
            background: #FF85A2; color: white; border-radius: 50%; display: flex;
            align-items: center; justify-content: center; cursor: pointer; border: 2px solid white;
        }
    `;
    document.head.appendChild(style);
}

function createHubUI() {
    if ($('#lumi-hub-overlay').length > 0) return;
    const html = `
        <div id="lumi-hub-overlay" onclick="if(event.target.id === 'lumi-hub-overlay') $('#lumi-hub-overlay').fadeOut()">
            <div id="lumi-hub-window" class="lumi-hub-window">
                <div class="lumi-close-btn" onclick="$('#lumi-hub-overlay').fadeOut()">×</div>
                <div class="lumi-hub-header">🌸 LumiPulse Hub</div>
                <div class="lumi-menu-grid">
                    <div class="lumi-menu-item" onclick="toastr.info('Diary Soon!')"><i class="fa-solid fa-book-heart"></i>Diary</div>
                    <div class="lumi-menu-item" onclick="toastr.info('Phone Soon!')"><i class="fa-solid fa-mobile-retro"></i>Phone</div>
                    <div class="lumi-menu-item" onclick="toastr.info('Forum Soon!')"><i class="fa-solid fa-users-rectangle"></i>Forum</div>
                    <div class="lumi-menu-item" onclick="$('#lumi-hub-overlay').fadeOut()"><i class="fa-solid fa-circle-xmark"></i>Close</div>
                </div>
            </div>
        </div>`;
    $('body').append(html);
}

function spawnLumiButton() {
    $('#lumi-main-fab').remove();
    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    fab.style.cssText = `
        position: fixed !important; top: 45% !important; right: 15px !important;
        width: 60px !important; height: 60px !important;
        background: url('${btnUrl}') no-repeat center !important;
        background-size: contain !important; z-index: 2147483647 !important;
        cursor: move !important; touch-action: none !important;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)) !important;
    `;
    document.body.appendChild(fab);

    let isDragging = false, offset = { x: 0, y: 0 };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    }, { passive: true });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true; const t = e.touches[0];
        let x = t.clientX - offset.x, y = t.clientY - offset.y;
        x = Math.max(0, Math.min(x, window.innerWidth - 60));
        y = Math.max(0, Math.min(y, window.innerHeight - 60));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        if (!isDragging) {
            // คำนวณตำแหน่ง Hub ให้เด้งออกมาใกล้ๆ ปุ่ม
            const rect = fab.getBoundingClientRect();
            const hub = $('#lumi-hub-window');
            let hubX = rect.left - 120; // ให้เมนูอยู่กลางๆ ปุ่มในแนวนอน
            let hubY = rect.top - 220;  // ให้เมนูเด้งขึ้นด้านบนปุ่ม

            // ป้องกันไม่ให้เมนูทะลุขอบจอ
            if (hubX < 10) hubX = 10;
            if (hubX + 300 > window.innerWidth) hubX = window.innerWidth - 310;
            if (hubY < 10) hubY = rect.bottom + 10; // ถ้าข้างบนไม่มีที่ ให้เด้งลงข้างล่างแทน

            hub.css({ left: hubX + 'px', top: hubY + 'px' });
            $('#lumi-hub-overlay').fadeIn(200);
        }
        fab.classList.add('lumi-floating');
        isDragging = false;
    });
}

function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><label class="checkbox_label"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) spawnLumiButton(); else { $('#lumi-main-fab').remove(); $('#lumi-hub-overlay').hide(); }
    });
}
