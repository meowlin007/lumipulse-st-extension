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
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;600&display=swap');
        
        @keyframes lumiPop {
            0% { opacity: 0; transform: scale(0.5) translateY(20px); }
            70% { transform: scale(1.1) translateY(-5px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes lumiFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        #lumi-main-fab {
            position: fixed !important; z-index: 2147483647 !important;
            width: 60px; height: 60px; cursor: move; touch-action: none;
            background: url('${btnUrl}') no-repeat center; background-size: contain;
            filter: drop-shadow(0 8px 20px rgba(255,182,193,0.6));
        }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }

        .lumi-menu-container {
            position: fixed; z-index: 2147483646; display: none;
            background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(15px);
            border-radius: 35px; padding: 20px; border: 2px solid #FFFFFF;
            box-shadow: 0 15px 35px rgba(255,182,193,0.4);
            font-family: 'Mitr', sans-serif; transition: all 0.3s ease;
        }

        .lumi-menu-grid {
            display: flex; gap: 20px; align-items: center; justify-content: center;
        }

        .lumi-menu-item {
            display: flex; flex-direction: column; align-items: center;
            gap: 8px; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: lumiPop 0.5s backwards;
        }

        .lumi-menu-item:hover { transform: translateY(-10px) scale(1.1); }
        .lumi-menu-item:active { transform: scale(0.9); }

        .lumi-menu-icon {
            width: 52px; height: 52px; object-fit: contain;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }

        .lumi-menu-text {
            font-size: 12px; font-weight: 600; color: #ff85a2;
            text-transform: uppercase; letter-spacing: 1px;
        }

        /* Staggered Delay */
        .lumi-menu-item:nth-child(1) { animation-delay: 0.1s; }
        .lumi-menu-item:nth-child(2) { animation-delay: 0.2s; }
        .lumi-menu-item:nth-child(3) { animation-delay: 0.3s; }
    `;
    document.head.appendChild(style);
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
    `;
    document.body.appendChild(menu);

    let isDragging = false, offset = { x: 0, y: 0 };
    const updateMenuPos = () => {
        const rect = fab.getBoundingClientRect();
        const menuEl = $(menu);
        let left = rect.left - (menuEl.outerWidth() / 2) + (rect.width / 2);
        let top = rect.top - menuEl.outerHeight() - 25; // โผล่ข้างบนปุ่มแบบลอยๆ

        if (left < 10) left = 10;
        if (left + menuEl.outerWidth() > window.innerWidth) left = window.innerWidth - menuEl.outerWidth() - 10;
        if (top < 10) top = rect.bottom + 25; // ถ้าข้างบนเต็ม ให้เด้งลงล่าง

        menuEl.css({ left: left + 'px', top: top + 'px' });
    };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true; $(menu).fadeOut(100);
        const t = e.touches[0];
        let x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth - 60));
        let y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight - 60));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        if (!isDragging) {
            updateMenuPos();
            $(menu).fadeToggle(300);
        }
        fab.classList.add('lumi-floating');
        isDragging = false;
    });

    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => toastr.success('🌸 Diary Open!'));
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => toastr.success('🌸 Phone Open!'));
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => toastr.success('🌸 Forum Open!'));
}

function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Mitr';">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><label class="checkbox_label" style="font-family: 'Mitr';"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) spawnLumiButton(); else $('#lumi-main-fab, .lumi-menu-container').remove();
    });
                                      }
