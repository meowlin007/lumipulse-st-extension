"use strict";

const extensionName = "lumipulse-st-extension";
let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

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
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500;700&display=swap');
        
        @keyframes lumiFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        #lumi-main-fab {
            position: fixed !important; z-index: 2147483647 !important;
            width: 60px; height: 60px; cursor: move; touch-action: none;
            background: url('${btnUrl}') no-repeat center; background-size: contain;
            filter: drop-shadow(0 6px 15px rgba(255,182,193,0.6));
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #lumi-main-fab:active { transform: scale(0.9); }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }

        .lumi-menu-wrapper {
            position: fixed; z-index: 2147483646; display: flex; flex-direction: column;
            gap: 12px; pointer-events: none; align-items: center; font-family: 'Mitr', sans-serif;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            width: 150px;
        }

        .lumi-menu-item {
            width: 100%; 
            background: rgba(255, 255, 255, 0.85); /* Glassmorphism background */
            backdrop-filter: blur(12px); border: 2px solid rgba(255, 209, 220, 0.8);
            border-radius: 25px; padding: 12px; color: #ff85a2;
            font-weight: 500; text-align: left; font-size: 14px;
            opacity: 0; transform: translateY(-20px) scale(0.7);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 6px 15px rgba(255,182,193,0.3);
            display: flex; align-items: center; gap: 15px; justify-content: flex-start;
            pointer-events: auto;
        }

        .lumi-menu-wrapper.is-open .lumi-menu-item {
            opacity: 1; transform: translateY(0) scale(1);
        }

        .lumi-menu-item:hover {
            background: rgba(255, 255, 255, 1);
            border-color: rgba(255, 133, 162, 1);
            transform: scale(1.08) !important;
            box-shadow: 0 8px 20px rgba(255,133,162,0.4);
        }

        .lumi-menu-item:active { transform: scale(0.95) !important; }

        .lumi-menu-icon {
            width: 38px; height: 38px; /* 🔥 ใหญ่กว่าเดิมสะใจ */
            object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
        }
        
        .lumi-menu-text {
            font-size: 15px;
            font-weight: 700;
        }

        /* Staggered Animation Delay for Flow Down */
        .lumi-menu-item:nth-child(1) { transition-delay: 0.05s; }
        .lumi-menu-item:nth-child(2) { transition-delay: 0.12s; }
        .lumi-menu-item:nth-child(3) { transition-delay: 0.19s; }
    `;
    document.head.appendChild(style);
}

function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-wrapper').remove();
    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab'; fab.className = 'lumi-floating';
    fab.style.top = '45%'; fab.style.right = '15px';
    document.body.appendChild(fab);

    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'lumi-menu-wrapper';
    menuWrapper.innerHTML = `
        <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon"><span class="lumi-menu-text">Diary</span></div>
        <div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}" class="lumi-menu-icon"><span class="lumi-menu-text">Phone</span></div>
        <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon"><span class="lumi-menu-text">Forum</span></div>
    `;
    document.body.appendChild(menuWrapper);

    let isDragging = false, offset = { x: 0, y: 0 };
    const updatePos = () => {
        const rect = fab.getBoundingClientRect();
        // คำนวณให้ wrapper ของเมนูไหลลงมาจากกึ่งกลางปุ่มอย่างสวยงาม
        menuWrapper.style.left = (rect.left + (rect.width / 2) - 75) + 'px';
        menuWrapper.style.top = (rect.bottom + 15) + 'px';
    };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true; menuWrapper.classList.remove('is-open');
        const t = e.touches[0];
        let x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth - 60));
        let y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight - 60));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
        updatePos();
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        if (!isDragging) { updatePos(); menuWrapper.classList.toggle('is-open'); }
        fab.classList.add('lumi-floating');
        isDragging = false;
    });

    // ดักจับการคลิกเมนู
    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => toastr.success('🌸 Diary Modules Accessing...'));
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => toastr.success('🌸 Character Phone Opening...'));
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => toastr.success('🌸 University Forum Entering...'));

    updatePos();
}

function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Mitr';">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><label class="checkbox_label" style="font-family: 'Mitr';"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) spawnLumiButton(); else $('#lumi-main-fab, .lumi-menu-wrapper').remove();
    });
            }
