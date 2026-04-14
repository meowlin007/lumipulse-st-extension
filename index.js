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

    injectStyles(); // ยัด CSS สำหรับ Hub เข้าไป
    createSettingsUI();
    createHubUI(); // สร้างหน้าต่าง Hub รอไว้
    
    if (extension_settings[extensionName].isEnabled) spawnLumiButton();
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        
        /* สไตล์ของหน้าต่าง Hub */
        #lumi-hub-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 192, 203, 0.2); backdrop-filter: blur(8px);
            z-index: 2147483646; display: none; align-items: center; justify-content: center;
        }
        .lumi-hub-window {
            width: 320px; background: #FFF5F7; border: 3px solid #FFB6C1;
            border-radius: 25px; padding: 20px; box-shadow: 0 10px 30px rgba(255, 105, 180, 0.3);
            position: relative; font-family: sans-serif; text-align: center;
        }
        .lumi-hub-header { color: #ff85a2; font-weight: bold; font-size: 20px; margin-bottom: 15px; }
        .lumi-menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .lumi-menu-item {
            background: white; border: 2px solid #FFD1DC; padding: 15px 10px;
            border-radius: 15px; cursor: pointer; transition: 0.2s; color: #ff85a2;
        }
        .lumi-menu-item:hover { background: #FFD1DC; transform: scale(1.05); }
        .lumi-menu-item i { font-size: 24px; display: block; margin-bottom: 5px; }
        .lumi-close-btn { 
            position: absolute; top: -10px; right: -10px; width: 35px; height: 35px;
            background: #FF85A2; color: white; border-radius: 50%; display: flex;
            align-items: center; justify-content: center; cursor: pointer; border: 2px solid white;
        }
    `;
    document.head.appendChild(style);
}

function createHubUI() {
    if ($('#lumi-hub-overlay').length > 0) return;
    const hubHtml = `
        <div id="lumi-hub-overlay">
            <div class="lumi-hub-window">
                <div class="lumi-close-btn" onclick="$('#lumi-hub-overlay').fadeOut()">×</div>
                <div class="lumi-hub-header">🌸 LumiPulse Hub 🌸</div>
                <div class="lumi-menu-grid">
                    <div class="lumi-menu-item" onclick="toastr.info('Diary Coming Soon!')">
                        <i class="fa-solid fa-book-heart"></i><span>Diary</span>
                    </div>
                    <div class="lumi-menu-item" onclick="toastr.info('Phone Coming Soon!')">
                        <i class="fa-solid fa-mobile-retro"></i><span>Phone</span>
                    </div>
                    <div class="lumi-menu-item" onclick="toastr.info('Forum Coming Soon!')">
                        <i class="fa-solid fa-users-rectangle"></i><span>Forum</span>
                    </div>
                    <div class="lumi-menu-item" onclick="$('#lumi-hub-overlay').fadeOut()">
                        <i class="fa-solid fa-circle-xmark"></i><span>Close</span>
                    </div>
                </div>
            </div>
        </div>`;
    $('body').append(hubHtml);
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
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)) !important; transition: transform 0.2s ease;
    `;
    document.body.appendChild(fab);

    let isDragging = false, offset = { x: 0, y: 0 };
    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        const touch = e.touches[0];
        offset.x = touch.clientX - fab.getBoundingClientRect().left;
        offset.y = touch.clientY - fab.getBoundingClientRect().top;
    }, { passive: true });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true; const touch = e.touches[0];
        let x = touch.clientX - offset.x, y = touch.clientY - offset.y;
        x = Math.max(0, Math.min(x, window.innerWidth - 60));
        y = Math.max(0, Math.min(y, window.innerHeight - 60));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        if (!isDragging) $('#lumi-hub-overlay').css('display', 'flex').hide().fadeIn();
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
