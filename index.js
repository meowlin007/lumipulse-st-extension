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
    
    // ระบบ Click Heart Effect ทั่วทั้งหน้าจอ
    document.addEventListener('click', (e) => spawnHeartEffect(e));
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400&display=swap');
        
        @keyframes lumiPop {
            0% { opacity: 0; transform: scale(0.5) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lumiFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        @keyframes heartUp {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-50px) scale(1.5) rotate(20deg); }
        }

        /* หัวใจเวลากด */
        .lumi-click-heart {
            position: fixed; z-index: 2147483647; pointer-events: none;
            color: #ffb6c1; font-size: 20px; animation: heartUp 0.8s ease-out forwards;
        }

        #lumi-main-fab {
            position: fixed !important; z-index: 2147483647 !important;
            width: 50px; height: 50px; cursor: move; touch-action: none;
            background: url('${btnUrl}') no-repeat center; background-size: contain;
            filter: drop-shadow(0 5px 15px rgba(255,182,193,0.5));
        }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }

        /* เมนูทรงแคปซูลนุ่มๆ */
        .lumi-menu-container {
            position: fixed; z-index: 2147483646; display: none;
            background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(20px);
            border-radius: 40px; padding: 25px 30px; border: 1.5px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 20px 50px rgba(255,182,193,0.3);
            font-family: 'Mitr', sans-serif; font-weight: 300;
        }

        .lumi-menu-grid { display: flex; gap: 25px; align-items: center; justify-content: center; }

        .lumi-menu-item {
            display: flex; flex-direction: column; align-items: center;
            gap: 10px; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: lumiPop 0.5s backwards;
        }
        .lumi-menu-item:hover { transform: translateY(-8px); }

        .lumi-menu-icon { width: 55px; height: 55px; object-fit: contain; }

        .lumi-menu-text { font-size: 13px; color: #ff85a2; letter-spacing: 0.5px; }

        /* ตัวอักษร Lumipulse ด้านล่าง */
        .lumi-branding {
            margin-top: 20px; font-size: 11px; color: #ffb6c1;
            text-transform: uppercase; letter-spacing: 3px; text-align: center;
            opacity: 0.8; font-weight: 400;
        }

        .lumi-menu-item:nth-child(1) { animation-delay: 0.1s; }
        .lumi-menu-item:nth-child(2) { animation-delay: 0.2s; }
        .lumi-menu-item:nth-child(3) { animation-delay: 0.3s; }
    `;
    document.head.appendChild(style);
}

function spawnHeartEffect(e) {
    const heart = document.createElement('div');
    heart.className = 'lumi-click-heart';
    heart.innerHTML = '❤️';
    heart.style.left = (e.clientX - 10) + 'px';
    heart.style.top = (e.clientY - 10) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 800);
}

function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab'; fab.className = 'lumi-floating';
    fab.style.top = '45%'; fab.style.right = '20px';
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon"><span class="lumi-menu-text">Diary</span></div>
            <div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}" class="lumi-menu-icon"><span class="lumi-menu-text">Phone</span></div>
            <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon"><span class="lumi-menu-text">Forum</span></div>
        </div>
        <div class="lumi-branding">Lumipulse</div>
    `;
    document.body.appendChild(menu);

    let isDragging = false, offset = { x: 0, y: 0 };
    const updateMenuPos = () => {
        const rect = fab.getBoundingClientRect();
        const menuEl = $(menu);
        let left = rect.left - (menuEl.outerWidth() / 2) + (rect.width / 2);
        let top = rect.top - menuEl.outerHeight() - 30;
        if (left < 15) left = 15;
        if (left + menuEl.outerWidth() > window.innerWidth) left = window.innerWidth - menuEl.outerWidth() - 15;
        if (top < 15) top = rect.bottom + 30;
        menuEl.css({ left: left + 'px', top: top + 'px' });
    };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true; $(menu).fadeOut(200);
        const t = e.touches[0];
        let x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth - 50));
        let y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight - 50));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        if (!isDragging) { updateMenuPos(); $(menu).fadeToggle(400); }
        fab.classList.add('lumi-floating');
        isDragging = false;
    });

    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => toastr.success('🌸 Diary Modules Accessing...'));
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => toastr.success('🌸 Character Phone Opening...'));
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => toastr.success('🌸 University Forum Entering...'));
}

function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Mitr'; font-weight: 300;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><label class="checkbox_label" style="font-family: 'Mitr'; font-weight: 300;"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) spawnLumiButton(); else $('#lumi-main-fab, .lumi-menu-container').remove();
    });
}
