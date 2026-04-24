"use strict";

// ═══════════════════════════════════════════════
// 1. CONFIG & ASSETS
// ═══════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    _internal: { fabPos: null, lastView: 'dashboard' },
    diary: {
        worldMode: 'auto', // auto, solo, rpg
        display: { secretMode: 'ai' }, // ai, affection, time
        storage: { max: 50 }
    }
};

let extension_settings = {};

// Icon Links
const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// SVG Icons (Clean Vector)
const svgHeart    = `<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF69B4"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgClose    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgBack     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const svgSettings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgPlus     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const svgChart    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;

// ═══════════════════════════════════════════════
// 2. BOOT SYSTEM
// ═══════════════════════════════════════════════
jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext && document.body) {
            clearInterval(boot);
            initLumiPulse();
        }
    }, 500);
});

function initLumiPulse() {
    const ctx = SillyTavern.getContext();
    if (!ctx.extensionSettings[extensionName]) {
        ctx.extensionSettings[extensionName] = JSON.parse(JSON.stringify(defaultSettings));
        ctx.saveSettingsDebounced();
    }
    extension_settings = ctx.extensionSettings;

    injectStyles();
    createSettingsPanel();
    
    if (extension_settings[extensionName].isEnabled) {
        setTimeout(() => {
            spawnLumiButton();
            createModal();
        }, 500);
    }
}

// ═══════════════════════════════════════════════
// 3. UI RENDERING (Glassmorphism & Y2K)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const s = document.createElement('style');
    s.id = 'lumi-styles';
    s.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
        :root { --lumi-pink: #FFB6C1; --lumi-dark: #FF69B4; --lumi-bg: #FFF0F5; --lumi-glass: rgba(255, 255, 255, 0.85); }
        
        /* 🌸 Animations */
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes heartFloat { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); } }

        /* 🔘 FAB Button */
        #lumi-fab {
            position: fixed; z-index: 99999; width: 46px; height: 46px; border-radius: 50%;
            background: var(--lumi-glass) url('${btnUrl}') no-repeat center center;
            background-size: 24px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 4px 15px rgba(255,105,180,0.3);
            cursor: grab; touch-action: none; user-select: none; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #lumi-fab:active { transform: scale(0.9); cursor: grabbing; }

        /* 📋 Menu */
        .lumi-menu {
            position: fixed; z-index: 99998; display: none;
            background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px);
            border-radius: 20px; padding: 15px; border: 1px solid rgba(255,182,193,0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-family: 'Mitr', sans-serif; min-width: 200px;
        }
        .lumi-menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; opacity: 0.8; transition: 0.2s; }
        .lumi-menu-item:hover { opacity: 1; transform: translateY(-3px); }
        .lumi-menu-item img { width: 32px; height: 32px; object-fit: contain; }
        .lumi-menu-item span { font-size: 10px; color: #666; }

        /* 🖼️ Modal System */
        .lumi-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
            background: rgba(0,0,0,0.3); backdrop-filter: blur(5px);
            z-index: 100000; display: none; align-items: center; justify-content: center;
        }
        .lumi-modal {
            width: 92%; max-width: 460px; height: 85vh; background: #fff;
            border-radius: 24px; border: 1px solid #FFD1DC;
            box-shadow: 0 20px 50px rgba(255,105,180,0.2);
            display: flex; flex-direction: column; overflow: hidden;
            font-family: 'Mitr', sans-serif; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .lumi-head {
            padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #FFF0F5; background: #FFFBFC;
        }
        .lumi-head h3 { margin: 0; font-size: 16px; color: #ff69b4; font-weight: 400; }
        .lumi-btn {
            width: 32px; height: 32px; border-radius: 50%; background: #FFF0F5; border: none;
            display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff85a2;
            transition: 0.2s;
        }
        .lumi-btn:hover { background: #FFE0E6; color: #ff69b4; }
        .lumi-body { flex: 1; overflow-y: auto; padding: 15px; background: #fff; }

        /*  UI Elements */
        .lumi-tabs { display: flex; gap: 8px; margin-bottom: 15px; }
        .lumi-tab {
            flex: 1; padding: 8px; border: 1px solid #FFE8EE; background: #fff;
            border-radius: 12px; color: #ff85a2; font-family: 'Mitr'; font-size: 12px; cursor: pointer; transition: 0.2s; text-align: center;
        }
        .lumi-tab.active { background: linear-gradient(135deg, #FFB6C1, #FF69B4); color: white; border-color: transparent; box-shadow: 0 4px 10px rgba(255,105,180,0.2); }
        
        .lumi-card {
            background: #FFFBFC; border: 1px solid #FFE8EE; border-radius: 16px;
            padding: 14px; margin-bottom: 12px; position: relative; transition: 0.2s;
        }
        .lumi-card:hover { box-shadow: 0 5px 15px rgba(255,182,193,0.1); transform: translateY(-2px); }
        .lumi-card.pinned { border: 1px solid #FFD700; background: #FFFDF5; }
        .lumi-card.locked { background: #F8F9FA; opacity: 0.7; }
        
        .lumi-meta { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
        .lumi-badge {
            font-size: 10px; padding: 3px 8px; border-radius: 8px; background: #FFF0F5;
            color: #ff85a2; display: flex; align-items: center; gap: 3px;
        }
        .lumi-text { font-size: 13px; color: #555; line-height: 1.6; white-space: pre-wrap; margin: 8px 0; }
        .lumi-actions { display: flex; gap: 8px; justify-content: flex-end; border-top: 1px dashed #FFE8EE; padding-top: 8px; }
        .lumi-act { background: none; border: none; cursor: pointer; color: #ffb6c1; opacity: 0.6; transition: 0.2s; padding: 4px; }
        .lumi-act:hover { opacity: 1; color: #ff69b4; }
        .lumi-act.active { opacity: 1; color: #FFD700; }

        /* ⚙️ Settings UI */
        .lumi-set-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; color: #666; }
        .lumi-input { width: 100%; background: #FFF9FA; border: 1px solid #FFD1DC; border-radius: 10px; padding: 10px; color: #ff85a2; font-family: 'Mitr'; outline: none; }
        .lumi-input:focus { border-color: #ff85a2; box-shadow: 0 0 0 2px rgba(255,182,193,0.2); }
        .lumi-btn-gen {
            width: 100%; background: linear-gradient(135deg, #FFB6C1, #FF69B4); color: white; border: none;
            padding: 12px; border-radius: 12px; font-family: 'Mitr'; font-size: 14px; cursor: pointer;
            box-shadow: 0 4px 12px rgba(255,105,180,0.3); transition: 0.2s;
        }
        .lumi-btn-gen:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(255,105,180,0.4); }
        .lumi-btn-gen:active { transform: scale(0.98); }

        /* RPG Grid */
        .lumi-rpg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
        .lumi-col { background: #FFFBFC; border: 1px solid #FFE8EE; border-radius: 16px; padding: 10px; }
        .lumi-col-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #FFE8EE; }
        .lumi-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #FFB6C1, #FF69B4); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; }

        /* Toast */
        .lumi-toast {
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
            padding: 10px 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            z-index: 999999; font-family: 'Mitr'; font-size: 13px; color: #ff69b4;
            animation: popIn 0.3s ease; pointer-events: none; border: 1px solid #FFE8EE;
        }
        
        /* Extension Panel */
        #lumi-panel .inline-drawer-content { font-family: 'Mitr'; padding: 10px; }
        #lumi-panel .menu_button { width: 100%; margin-bottom: 5px; background: linear-gradient(135deg, #FFB6C1, #FF69B4); color: white; border: none; border-radius: 8px; padding: 8px; }

        @media (max-width: 768px) { .lumi-rpg-grid { grid-template-columns: 1fr; } .lumi-menu-grid { grid-template-columns: repeat(2, 1fr); } }
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// 4. FAB BUTTON (Drag & Tap Fix)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-fab, .lumi-menu').remove();
    if (!document.body) return;

    const fab = document.createElement('div');
    fab.id = 'lumi-fab';
    
    const pos = extension_settings[extensionName]._internal.fabPos;
    if (pos) { Object.assign(fab.style, pos); }
    else { fab.style.top = '50%'; fab.style.right = '20px'; fab.style.transform = 'translateY(-50%)'; }
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    // 🆕 Added Settings Button
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}"><span>Memories</span></div>
            <div class="lumi-menu-item" id="lumi-gen"><img src="${iconPhone}"><span>Generate</span></div>
            <div class="lumi-menu-item" id="lumi-settings"><img src="${iconForum}"><span>Settings</span></div>
            <div class="lumi-menu-item" id="lumi-stats"><img src="${iconPhone}"><span>Stats</span></div>
        </div>`;
    document.body.appendChild(menu);

    // 🖱️ Drag Logic
    let isDragging = false, startX, startY, initLeft, initTop, movedDist = 0;
    const THRESHOLD = 12;

    function startDrag(x, y) {
        isDragging = false; movedDist = 0;
        startX = x; startY = y;
        const rect = fab.getBoundingClientRect();
        initLeft = rect.left; initTop = rect.top;
        fab.style.transform = 'none';
    }

    function moveDrag(x, y) {
        const dx = x - startX, dy = y - startY;
        movedDist = Math.hypot(dx, dy);
        if (movedDist > THRESHOLD) isDragging = true;
        if (isDragging) {
            fab.style.left = (initLeft + dx) + 'px';
            fab.style.top = (initTop + dy) + 'px';
            fab.style.right = 'auto'; fab.style.bottom = 'auto';
            $(menu).fadeOut(100);
        }
    }

    function endDrag() {
        if (isDragging) {
            extension_settings[extensionName]._internal.fabPos = {
                top: fab.style.top, left: fab.style.left, right: 'auto', bottom: 'auto', transform: 'none'
            };
            SillyTavern.getContext().saveSettingsDebounced();
        } else if (movedDist < THRESHOLD) {
            const r = fab.getBoundingClientRect();
            const mW = $(menu).outerWidth();
            menu.style.left = Math.max(10, Math.min(r.left + r.width/2 - mW/2, window.innerWidth - mW - 10)) + 'px';
            menu.style.top = Math.max(10, r.top - $(menu).outerHeight() - 15) + 'px';
            $(menu).fadeToggle(200);
        }
        isDragging = false;
    }

    fab.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        e.preventDefault(); startDrag(e.clientX, e.clientY);
        const onMove = ev => moveDrag(ev.clientX, ev.clientY);
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); endDrag(); };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });

    fab.addEventListener('touchstart', e => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    fab.addEventListener('touchmove', e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    fab.addEventListener('touchend', e => { e.preventDefault(); endDrag(); }, { passive: false });

    // Menu Clicks
    $(document).off('click', '.lumi-menu-item').on('click', '.lumi-menu-item', function() {
        $(menu).fadeOut(200);
        const id = $(this).attr('id');
        if (id === 'lumi-diary') openModal('dashboard');
        if (id === 'lumi-gen') openModal('generate');
        if (id === 'lumi-settings') openModal('settings');
        if (id === 'lumi-stats') openModal('stats');
    });
}

// ═══════════════════════════════════════════════
// 5. MODAL SYSTEM
// ═══════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`
        <div id="lumi-overlay" class="lumi-overlay">
            <div class="lumi-modal">
                <div class="lumi-head">
                    <button class="lumi-btn" id="lumi-back">${svgBack}</button>
                    <h3 id="lumi-title">Memories</h3>
                    <button class="lumi-btn" id="lumi-close">${svgClose}</button>
                </div>
                <div id="lumi-body" class="lumi-body"></div>
            </div>
        </div>
    `);
    $('#lumi-close, #lumi-overlay').on('click', e => { if(e.target.id === 'lumi-overlay' || e.target.closest('#lumi-close')) $('#lumi-overlay').fadeOut(); });
    
    // 🆕 Back Button Logic: Goes back to Dashboard
    $('#lumi-back').on('click', () => {
        openModal('dashboard');
    });
}

function openModal(view) {
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    extension_settings[extensionName]._internal.lastView = view;
    SillyTavern.getContext().saveSettingsDebounced();
    
    const ctx = SillyTavern.getContext();
    const charName = ctx.name2 || "Character";
    
    if (view === 'dashboard') {
        $('#lumi-title').text(charName + "'s Memories");
        renderDashboard();
    } else if (view === 'generate') {
        $('#lumi-title').text("Generate Memory");
        renderGenerator();
    } else if (view === 'settings') {
        $('#lumi-title').text("Settings");
        renderSettings();
    } else if (view === 'stats') {
        $('#lumi-title').text("Stats");
        renderStats();
    }
}

// ═══════════════════════════════════════════════
// 6. CORE FEATURES
// ═══════════════════════════════════════════════

// 📊 Dashboard (Timeline / RPG)
function renderDashboard() {
    const chars = getRPGCharacters();
    let opts = '<option value="">All Characters</option>';
    chars.forEach(c => opts += `<option value="${c.name}">${c.name}</option>`);
    
    $('#lumi-body').html(`
        <div class="lumi-tabs">
            <button class="lumi-tab active" onclick="switchTab('timeline')">Timeline</button>
            <button class="lumi-tab" onclick="switchTab('rpg')">RPG View</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:15px;">
            <select id="lumi-filter" class="lumi-input" style="flex:1">${opts}</select>
            <input id="lumi-search" class="lumi-input" placeholder="Search..." style="flex:1">
        </div>
        <div id="lumi-content"></div>
    `);
    $('#lumi-filter, #lumi-search').on('change input', () => renderContent());
    renderContent();
}

function renderContent() {
    const char = $('#lumi-filter').val();
    const search = ($('#lumi-search').val()||'').toLowerCase();
    let mems = loadMemories({ character: char || null });
    if (search) mems = mems.filter(m => (m.content.diary||'').toLowerCase().includes(search));
    
    // Group by Date
    const grouped = {};
    mems.forEach(m => { const d = m.content.rp_date || 'Unknown'; if(!grouped[d]) grouped[d]=[]; grouped[d].push(m); });
    
    let html = '';
    for(const date in grouped) {
        html += `<div style="font-size:12px;color:#ff69b4;margin:15px 0 5px;font-weight:500">${date}</div>`;
        grouped[date].forEach(m => html += renderCard(m));
    }
    $('#lumi-content').html(html || '<div style="text-align:center;color:#ccc;padding:20px">No memories found</div>');
    bindEvents();
}

// 🏰 RPG View
function renderRPGView() {
    const mems = loadMemories({});
    const byChar = {};
    mems.forEach(m => { if(!byChar[m.character]) byChar[m.character]=[]; byChar[m.character].push(m); });
    
    let html = '<div class="lumi-rpg-grid">';
    for(const char in byChar) {
        const color = generateColor(char);
        html += `<div class="lumi-col">
            <div class="lumi-col-head">
                <div class="lumi-avatar" style="background:${color}">${char[0]}</div>
                <span style="font-weight:500;font-size:13px">${char}</span>
            </div>
            ${byChar[char].map(m => renderCard(m)).join('')}
        </div>`;
    }
    html += '</div>';
    $('#lumi-content').html(html);
    bindEvents();
}

//  Memory Card
function renderCard(m) {
    const isLocked = m.meta.isSecret;
    const color = generateColor(m.character);
    return `
        <div class="lumi-card ${m.meta.isPinned?'pinned':''} ${isLocked?'locked':''}" data-id="${m.id}">
            ${isLocked ? `<div style="position:absolute;inset:0;background:rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;border-radius:16px;z-index:1">${svgLock}</div>` : ''}
            <div class="lumi-meta">
                <span class="lumi-badge" style="background:${color};color:white">${m.character}</span>
                <span class="lumi-badge">📍 ${m.content.rp_location||'?'}</span>
                <span class="lumi-badge">☁️ ${m.content.rp_weather||'?'}</span>
            </div>
            <div class="lumi-text">${isLocked ? 'Locked Memory...' : m.content.diary}</div>
            <div class="lumi-actions">
                <button class="lumi-act ${m.meta.isPinned?'active':''}" data-act="pin">${svgPin}</button>
                <button class="lumi-act ${m.meta.isFavorite?'active':''}" data-act="fav">${svgStar}</button>
                <button class="lumi-act" data-act="del">${svgClose}</button>
            </div>
        </div>`;
}

// ✨ Generator UI
function renderGenerator() {
    const cfg = extension_settings[extensionName].diary;
    $('#lumi-body').html(`
        <div style="padding:10px;">
            <div class="lumi-set-row"><span>Range (Latest Messages)</span></div>
            <input type="range" id="gen-range" min="5" max="100" value="30" style="width:100%;margin-bottom:10px;accent-color:#ff69b4">
            <div style="text-align:center;font-size:12px;color:#ff85a2;margin-bottom:15px" id="range-val">30 msgs</div>
            
            <div class="lumi-set-row"><span>Start From Index</span></div>
            <input type="number" id="gen-start" class="lumi-input" value="0" placeholder="0 (Latest)">
            
            <div class="lumi-set-row" style="margin-top:10px"><label><input type="checkbox" id="gen-all"> Use All History</label></div>
            
            <button id="btn-gen-now" class="lumi-btn-gen">✨ Generate Memory</button>
            <div id="gen-loading" style="display:none;text-align:center;margin-top:20px;color:#ff69b4">Generating AI...</div>
        </div>
    `);
    
    $('#gen-range').on('input', function(){ $('#range-val').text(this.value + ' msgs'); });
    $('#btn-gen-now').on('click', generateMemory);
}

// ⚙️ Settings UI
function renderSettings() {
    const s = extension_settings[extensionName];
    $('#lumi-body').html(`
        <div style="padding:10px;">
            <div class="lumi-set-row"><span>World Mode</span>
                <select id="set-wm" class="lumi-input" style="width:120px">
                    <option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option>
                    <option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option>
                    <option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option>
                </select>
            </div>
            <div class="lumi-set-row"><span>Secret Mode</span>
                <select id="set-sec" class="lumi-input" style="width:120px">
                    <option value="ai" ${s.diary.display.secretMode==='ai'?'selected':''}>AI Decide</option>
                    <option value="time" ${s.diary.display.secretMode==='time'?'selected':''}>Time Lock (3 days)</option>
                    <option value="affection" ${s.diary.display.secretMode==='affection'?'selected':''}>Affection ≥ 80</option>
                </select>
            </div>
            <div class="lumi-set-row"><label><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''}> Extension Enabled</label></div>
            
            <div style="margin-top:20px;display:flex;gap:10px">
                <button id="btn-rst" class="lumi-input" style="background:#FFE0E0;color:#ff69b4;text-align:center;cursor:pointer">Reset FAB Pos</button>
                <button id="btn-clr" class="lumi-input" style="background:#FFE0E0;color:#ff69b4;text-align:center;cursor:pointer">Clear Memories</button>
            </div>
        </div>
    `);
    
    $('#set-wm').on('change', function(){ s.diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-sec').on('change', function(){ s.diary.display.secretMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-en').on('change', function(){ s.isEnabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); showToast(s.isEnabled?'Enabled':'Disabled'); });
    $('#btn-rst').on('click', ()=>{ s._internal.fabPos = null; SillyTavern.getContext().saveSettingsDebounced(); $('#lumi-fab').remove(); spawnLumiButton(); showToast('Position Reset'); });
    $('#btn-clr').on('click', ()=>{ if(confirm('Clear all?')) { s.memories=[]; SillyTavern.getContext().saveSettingsDebounced(); showToast('Cleared'); } });
}

// 📊 Stats UI
function renderStats() {
    const mems = loadMemories({});
    const chars = [...new Set(mems.map(m => m.character))];
    let html = '<div style="padding:10px">';
    chars.forEach(c => {
        const count = mems.filter(m => m.character === c).length;
        html += `<div class="lumi-set-row"><span>${c}</span><span style="color:#ff69b4">${count}</span></div>`;
    });
    html += '<div class="lumi-set-row" style="margin-top:20px;border-top:1px solid #eee;padding-top:10px"><span>Total Memories</span><span style="color:#ff69b4;font-weight:bold">' + mems.length + '</span></div>';
    html += '</div>';
    $('#lumi-body').html(html);
}

// ═══════════════════════════════════════════════
// 7. AI & LOGIC
// ═══════════════════════════════════════════════
async function generateMemory() {
    const range = parseInt($('#gen-range').val()) || 30;
    const start = parseInt($('#gen-start').val()) || 0;
    const useAll = $('#gen-all').prop('checked');
    
    $('#btn-gen-now').hide();
    $('#gen-loading').show();
    
    const res = await callAI(range, useAll, start);
    $('#gen-loading').hide();
    $('#btn-gen-now').show();
    
    if(res) {
        const ctx = SillyTavern.getContext();
        saveMemory({
            id: 'mem_'+Date.now(), timestamp: new Date().toISOString(),
            character: ctx.name2 || "Character", worldMode: detectWorldMode(),
            content: { ...res },
            meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, tags: extractTags(res.diary), refIndex: res.refIndex }
        });
        showToast('✨ Memory Created!');
        setTimeout(() => openModal('dashboard'), 1000);
    } else {
        showToast('❌ Failed to Generate');
    }
}

async function callAI(range, useAll, start) {
    const ctx = SillyTavern.getContext();
    const allChat = ctx.chat || [];
    const endIndex = useAll ? allChat.length : Math.min(start + range, allChat.length);
    const startIdx = useAll ? 0 : Math.max(0, endIndex - range);
    const chatSlice = allChat.slice(startIdx, endIndex);
    
    const chatLog = chatSlice.map((m, i) => `[${startIdx+i+1}] ${m.is_user?'User':m.name||'NPC'}: ${m.mes.slice(0,100)}`).join('\n');

    const prompt = `[System: You are the inner voice of ${ctx.name2}. Respond ONLY with JSON.]
Context: World Mode: ${detectWorldMode()}
Chat Log (Indices ${startIdx}-${endIndex}):
${chatLog}

Create a diary entry. Infer fictional date, location, and weather from context.
Decide if this is a 'Secret' (isSecret: true) if it contains deep vulnerabilities.
Return ONLY JSON in Thai:
{
  "rp_date": "Date in game (e.g. 15th day of 3rd moon)",
  "rp_location": "Location",
  "rp_weather": "Weather",
  "affection_score": 0-100,
  "mood": "Short mood",
  "diary": "Content 3-5 sentences",
  "isSecret": true/false,
  "refIndex": ${startIdx}
}`;

    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        else if (typeof window.generateQuietPrompt === 'function') res = await window.generateQuietPrompt(prompt, false, false);
        
        if (!res) return null;
        const match = res.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// ═══════════════════════════════════════════════
// 8. HELPERS & UTILS
// ═══════════════════════════════════════════════
function loadMemories(filter = {}) {
    let mem = [...(extension_settings[extensionName].memories || [])];
    if (filter.character) mem = mem.filter(m => m.character === filter.character);
    return mem.sort((a,b) => (b.meta.isPinned?1:0) - (a.meta.isPinned?1:0) || new Date(b.timestamp) - new Date(a.timestamp));
}

function saveMemory(entry) {
    const s = extension_settings[extensionName];
    s.memories.unshift(entry);
    if (s.memories.length > s.diary.storage.max) s.memories = s.memories.slice(0, s.diary.storage.max);
    SillyTavern.getContext().saveSettingsDebounced();
}

function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set();
    chat.slice(-50).forEach(m => { if (m.name && !m.is_user && !m.is_system) names.add(m.name); });
    return names.size > 2 ? 'rpg' : 'solo';
}

function getRPGCharacters(limit = 10) {
    const ctx = SillyTavern.getContext();
    const characters = [];
    const currentChar = ctx.characters?.[ctx.characterId];
    if (currentChar) characters.push({ name: currentChar.name, color: generateColor(currentChar.name) });
    if (ctx.characters) {
        Object.values(ctx.characters).forEach(c => {
            if (c.name && !characters.find(x => x.name === c.name)) characters.push({ name: c.name, color: generateColor(c.name) });
        });
    }
    return characters.slice(0, limit);
}

function generateColor(str) {
    const colors = ['#FFB6C1', '#E6D5F0', '#B6D7F0', '#B6F0D7', '#F0E6B6', '#F0B6D7'];
    let hash = 0; for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function extractTags(text) {
    const tags = [], kw = { '#Romantic':['รัก','หัวใจ'],'#Drama':['เสียใจ','ร้องไห้'] }, l = text.toLowerCase();
    for(const[k,v]of Object.entries(kw)) if(v.some(w=>l.includes(w))) tags.push(k);
    return tags;
}

function showToast(msg) {
    const t = document.createElement('div'); t.className = 'lumi-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(()=>t.remove(), 2000);
}

// Global Click Handler
window.switchTab = function(v) {
    $('.lumi-tab').removeClass('active');
    event.target.classList.add('active');
    if(v==='timeline') renderContent();
    else if(v==='rpg') renderRPGView();
};

function bindEvents() {
    $('.lumi-act').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        const act = $(this).data('act');
        const mem = extension_settings[extensionName].memories.find(m => m.id === id);
        if(!mem) return;
        
        if(act === 'pin') { mem.meta.isPinned = !mem.meta.isPinned; }
        if(act === 'fav') { mem.meta.isFavorite = !mem.meta.isFavorite; }
        if(act === 'del') { 
            if(confirm('Delete?')) { extension_settings[extensionName].memories = extension_settings[extensionName].memories.filter(m => m.id !== id); }
        }
        SillyTavern.getContext().saveSettingsDebounced();
        renderContent();
    });
}

// ═══════════════════════════════════════════════
// 9. EXTENSION PANEL
// ═══════════════════════════════════════════════
function createSettingsPanel() {
    if ($('#lumi-panel').length) return;
    $('#extensions_settings').append(`
        <div id="lumi-panel" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b style="color:#ff85a2;font-family:'Mitr';font-weight:300;">🌸 LumiPulse</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="display:none;"></div>
        </div>
    `);
}

