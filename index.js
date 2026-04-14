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
    if (extension_settings[extensionName].isEnabled) spawnLumiButton();
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mali:wght@400;700&display=swap');
        
        @keyframes lumiFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
        }

        #lumi-main-fab {
            position: fixed !important; z-index: 2147483647 !important;
            width: 65px; height: 65px; cursor: move; touch-action: none;
            background: url('${btnUrl}') no-repeat center; background-size: contain;
            filter: drop-shadow(0 6px 12px rgba(255,182,193,0.5));
        }
        
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }

        .lumi-menu-wrapper {
            position: fixed; z-index: 2147483646; display: flex; flex-direction: column;
            gap: 12px; pointer-events: none; align-items: center; font-family: 'Mali', cursive;
        }

        .lumi-menu-item {
            width: 140px; 
            background: rgba(255, 255, 255, 0.9); /* พื้นหลังขาวนวลคล้ายในรูป */
            backdrop-filter: blur(8px);
            border: 2.5px solid #FFD1DC;
            border-radius: 18px; padding: 10px 15px; color: #ff85a2;
            font-weight: bold; text-align: center; font-size: 14px;
            opacity: 0; transform: translateY(-20px) scale(0.8);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 6px 15px rgba(255,182,193,0.25);
            display: flex; align-items: center; gap: 10px; justify-content: center;
        }

        .lumi-menu-wrapper.is-open .lumi-menu-item {
            opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
        }

        .lumi-menu-item:hover {
            background: #FFFFFF;
            border-color: #ff85a2;
            transform: scale(1.05) !important;
        }

        .lumi-menu-item:active {
            transform: scale(0.9) !important;
        }

        .lumi-menu-item i {
            font-size: 18px;
            filter: drop-shadow(0 2px 4px rgba(255,133,162,0.3));
        }

        .lumi-menu-item:nth-child(1) { transition-delay: 0.05s; }
        .lumi-menu-item:nth-child(2) { transition-delay: 0.1s; }
        .lumi-menu-item:nth-child(3) { transition-delay: 0.15s; }
    `;
    document.head.appendChild(style);
}

function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-wrapper').remove();
    
    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    fab.style.top = '45%'; fab.style.right = '15px';
    document.body.appendChild(fab);

    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'lumi-menu-wrapper';
    menuWrapper.innerHTML = `
        <div class="lumi-menu-item" id="lumi-diary"><i class="fa-solid fa-book-heart"></i> Diary</div>
        <div class="lumi-menu-item" id="lumi-phone"><i class="fa-solid fa-mobile-retro"></i> Phone</div>
        <div class="lumi-menu-item" id="lumi-forum"><i class="fa-solid fa-users-rectangle"></i> Forum</div>
    `;
    document.body.appendChild(menuWrapper);

    let isDragging = false, offset = { x: 0, y: 0 };

    const updatePos = () => {
        const rect = fab.getBoundingClientRect();
        menuWrapper.style.left = (rect.left + (rect.width / 2) - 70) + 'px';
        menuWrapper.style.top = (rect.bottom + 15) + 'px';
    };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false;
        fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true;
        menuWrapper.classList.remove('is-open');
        const t = e.touches[0];
        let x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth - 65));
        let y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight - 65));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
        updatePos();
    });

    fab.addEventListener('touchend', () => {
        if (!isDragging) {
            updatePos();
            menuWrapper.classList.toggle('is-open');
        }
        fab.classList.add('lumi-floating');
        isDragging = false;
    });

    // ดักจับการคลิกเมนูย่อย
    $(document).on('click', '#lumi-diary', () => toastr.info('🌸 Diary Module Coming Soon!'));
    $(document).on('click', '#lumi-phone', () => toastr.info('🌸 Character Phone Coming Soon!'));
    $(document).on('click', '#lumi-forum', () => toastr.info('🌸 University Forum Coming Soon!'));

    updatePos();
}

function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Mali';">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><label class="checkbox_label" style="font-family: 'Mali';"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) spawnLumiButton(); else $('#lumi-main-fab, .lumi-menu-wrapper').remove();
    });
}
