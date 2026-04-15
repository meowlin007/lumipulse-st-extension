"use strict";

const extensionName = "lumipulse-st-extension";

const defaultSettings = { 
    isEnabled: false,
    diaryData: [],
    phoneData: {},
    forumData: []
};

let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart = `<svg viewBox="0 0 32 32" fill="#ffb6c1" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.5L14.1 26.75C7.2 20.5 2.7 16.45 2.7 11.5C2.7 7.45 5.85 4.3 9.9 4.3C12.15 4.3 14.35 5.35 15.8 7C17.25 5.35 19.45 4.3 21.7 4.3C25.75 4.3 28.9 7.45 28.9 11.5C28.9 16.45 24.4 20.5 17.5 26.75L16 28.5Z"/></svg>`;
const svgDiary = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M12 8s-2-2-3-1-1 2.5 0 3.5l3 3 3-3c1-1 1-2.5 0-3.5s-3-1-3-1z" fill="#ffb6c1" stroke="none"></path></svg>`;
const svgPhone = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
const svgForum = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;

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
        context.extensionSettings[extensionName] = { ...defaultSettings };
        context.saveSettingsDebounced();
    }
    extension_settings = context.extensionSettings;
    injectStyles();
    createSettingsUI();
    
    if (extension_settings[extensionName].isEnabled) {
        spawnLumiButton();
        createContentModal();
    }
    document.addEventListener('mousedown', (e) => {
        if(e.target.closest('#lumi-main-fab') || e.target.closest('.lumi-menu-item') || e.target.closest('.lumi-modal-close')) {
            spawnHeartEffect(e);
        }
    });
}

function getCurrentCharacterName() {
    const context = SillyTavern.getContext();
    if (context && context.name2) return context.name2;
    const domName = $('.ch_name').text().trim();
    return domName || 'Unknown Character';
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500&display=swap');
        
        @keyframes lumiPop { 0% { opacity: 0; transform: scale(0.6) translateY(30px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes heartRise { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); } 20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.8) rotate(15deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

        .lumi-vector-heart { position: fixed; z-index: 2147483647; pointer-events: none; width: 25px; height: 25px; animation: heartRise 0.9s ease-out forwards; filter: drop-shadow(0 0 5px rgba(255,182,193,0.8)); }
        #lumi-main-fab { position: fixed !important; z-index: 2147483647 !important; width: 50px; height: 50px; cursor: move; touch-action: none; background: url('${btnUrl}') no-repeat center; background-size: contain; filter: drop-shadow(0 5px 15px rgba(255,182,193,0.6)); }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        
        .lumi-menu-container { position: fixed; z-index: 2147483646; display: none; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(25px); border-radius: 45px; padding: 30px; border: 2px solid rgba(255, 182, 193, 0.5); box-shadow: 0 25px 60px rgba(255, 182, 193, 0.4); font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-menu-grid { display: flex; gap: 30px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); animation: lumiPop 0.5s backwards; }
        .lumi-menu-item:hover { transform: translateY(-10px) scale(1.05); }
        .lumi-menu-icon { width: 60px; height: 60px; object-fit: contain; }
        .lumi-menu-text { font-size: 14px; color: #ff85a2; letter-spacing: 0.5px; opacity: 0.9; }
        .lumi-branding { margin-top: 25px; font-size: 12px; color: #ffb6c1; text-transform: uppercase; letter-spacing: 4px; text-align: center; font-weight: 300; }
        .lumi-menu-item:nth-child(1) { animation-delay: 0.05s; } .lumi-menu-item:nth-child(2) { animation-delay: 0.12s; } .lumi-menu-item:nth-child(3) { animation-delay: 0.19s; }

        .lumi-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal-box { width: 92%; max-width: 450px; height: 85vh; max-height: 700px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(25px); border-radius: 35px; border: 2px solid #FFD1DC; box-shadow: 0 20px 50px rgba(255, 182, 193, 0.4); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr', sans-serif; animation: lumiPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .lumi-modal-header { padding: 22px; text-align: center; font-size: 18px; font-weight: 500; color: #ff85a2; border-bottom: 2px dashed #FFD1DC; position: relative; background: rgba(255,245,247,0.8); }
        .lumi-modal-title-wrap { display: flex; align-items: center; justify-content: center; gap: 12px; }
        .lumi-modal-close { position: absolute; right: 20px; top: 22px; width: 32px; height: 32px; background: #FFD1DC; color: #ff85a2; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .lumi-modal-close:hover { background: #ff85a2; color: white; }
        .lumi-modal-close:active { transform: scale(0.8); }
        .lumi-modal-body { flex: 1; padding: 20px; overflow-y: auto; background: linear-gradient(180deg, #FFFFFF 0%, #FFF5F7 100%); }
        
        .lumi-loading-container { text-align: center; margin-top: 80px; animation: lumiPop 0.5s ease-out; }
        .lumi-spinner { width: 45px; height: 45px; border: 4px solid rgba(255, 182, 193, 0.3); border-top: 4px solid #ff85a2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
        .lumi-loading-text { margin-top: 20px; color: #ff85a2; font-weight: 500; font-size: 16px; }
        .lumi-loading-subtext { font-size: 13px; color: #ffb6c1; margin-top: 8px; animation: pulseGlow 2s infinite; }
        
        .lumi-active-char-badge { display: inline-flex; align-items: center; gap: 6px; background: #FFF0F3; border: 1px solid #FFD1DC; padding: 5px 12px; border-radius: 20px; font-size: 12px; color: #ff85a2; margin-top: 10px; font-weight: 400; }
    `;
    document.head.appendChild(style);
}

function createContentModal() {
    if ($('#lumi-modal-overlay').length > 0) return;
    const modalHtml = `
        <div id="lumi-modal-overlay" class="lumi-modal-overlay">
            <div class="lumi-modal-box">
                <div class="lumi-modal-header">
                    <div id="lumi-modal-title" class="lumi-modal-title-wrap"></div>
                    <div class="lumi-modal-close" onclick="$('#lumi-modal-overlay').fadeOut(250)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                </div>
                <div id="lumi-modal-body" class="lumi-modal-body"></div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
}

function openLumiModal(type) {
    const charName = getCurrentCharacterName();
    let title = '', svgIcon = '', subtext = '';
    
    if (type === 'diary') {
        title = `${charName}'s Diary`;
        svgIcon = svgDiary;
        subtext = 'Analyzing internal memory logs...';
    } else if (type === 'phone') {
        title = `${charName}'s Phone`;
        svgIcon = svgPhone;
        subtext = 'Connecting to mobile network...';
    } else if (type === 'forum') {
        title = `University Forum`;
        svgIcon = svgForum;
        subtext = 'Fetching latest campus threads...';
    }

    $('#lumi-modal-title').html(`${svgIcon} <span>${title}</span>`);
    
    $('#lumi-modal-body').html(`
        <div class="lumi-loading-container">
            <div class="lumi-spinner"></div>
            <div class="lumi-loading-text">Scanning connection with ${charName}...</div>
            <div class="lumi-loading-subtext">${subtext}</div>
            <div class="lumi-active-char-badge">
                <span style="display:inline-block; width:8px; height:8px; background:#4ade80; border-radius:50%;"></span>
                Active Target: ${charName}
            </div>
        </div>
    `);
    
    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);
}

function spawnHeartEffect(e) {
    const heart = document.createElement('div');
    heart.className = 'lumi-vector-heart';
    heart.innerHTML = svgHeart;
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 900);
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
        let top = rect.top - menuEl.outerHeight() - 35;
        if (left < 15) left = 15;
        if (left + menuEl.outerWidth() > window.innerWidth) left = window.innerWidth - menuEl.outerWidth() - 15;
        if (top < 15) top = rect.bottom + 35;
        menuEl.css({ left: left + 'px', top: top + 'px' });
    };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    }, { passive: true });

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

    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => openLumiModal('diary'));
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => openLumiModal('phone'));
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => openLumiModal('forum'));
}

function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Mitr'; font-weight: 300;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><label class="checkbox_label" style="font-family: 'Mitr'; font-weight: 300;"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) { spawnLumiButton(); createContentModal(); } else { $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove(); }
    });
        }
