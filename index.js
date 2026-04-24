"use strict";

// ═══════════════════════════════════════════════
// 1. CONFIG & ASSETS
// ═══════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    _internal: { fabPos: null },
    diary: {
        worldMode: 'auto',
        display: { 
            secretMode: 'ai', // ai, time, affection, off
            showSecretSystem: true // Toggle to disable secret system entirely
        },
        storage: { max: 100 }
    }
};

let extension_settings = {};

// Icon Links (สำหรับเมนูหลัก)
const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// SVG Vectors (สำหรับปุ่มภายในระบบ)
const svgHeart    = `<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF69B4"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgClose    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgBack     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const svgSettings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgPlus     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

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
// 3. UI RENDERING (Y2K Premium)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const s = document.createElement('style');
    s.id = 'lumi-styles';
    s.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
        :root { --lumi-pink: #FFB6C1; --lumi-dark: #FF69B4; --lumi-bg: #FFF0F5; --lumi-glass: rgba(255, 255, 255, 0.9); }
        
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes heartFloat { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); } }

        /* FAB */
        #lumi-fab { position: fixed; z-index: 99999; width: 46px; height: 46px; border-radius: 50%;
            background: var(--lumi-glass) url('${btnUrl}') no-repeat center center;
            background-size: 24px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.8);
            box-shadow: 0 4px 15px rgba(255,105,180,0.3); cursor: grab; touch-action: none; user-select: none;
            transition: transform 0.2s; }
        #lumi-fab:active { transform: scale(0.9); cursor: grabbing; }

        /* Menu */
        .lumi-menu { position: fixed; z-index: 99998; display: none; background: rgba(255,255,255,0.98);
            backdrop-filter: blur(15px); border-radius: 20px; padding: 15px; border: 1px solid rgba(255,182,193,0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-family: 'Mitr'; min-width: 200px; }
        .lumi-menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; opacity: 0.8; transition: 0.2s; padding: 8px; border-radius: 12px; }
        .lumi-menu-item:hover { opacity: 1; background: #FFF0F5; }
        .lumi-menu-item svg { width: 24px; height: 24px; color: #ff85a2; }
        .lumi-menu-item img { width: 28px; height: 28px; object-fit: contain; }
        .lumi-menu-item span { font-size: 10px; color: #666; }

        /* Modal */
        .lumi-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); z-index: 100000; display: none; align-items: center; justify-content: center; }
        .lumi-modal { width: 92%; max-width: 460px; height: 85vh; background: #fff; border-radius: 24px; border: 1px solid #FFD1DC;
            box-shadow: 0 20px 50px rgba(255,105,180,0.2); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr'; animation: popIn 0.3s; }
        .lumi-head { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #FFF0F5; background: #FFFBFC; }
        .lumi-head h3 { margin: 0; font-size: 16px; color: #ff69b4; font-weight: 400; }
        .lumi-btn { width: 32px; height: 32px; border-radius: 50%; background: #FFF0F5; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff85a2; transition: 0.2s; }
        .lumi-btn:hover { background: #FFE0E6; }
        .lumi-body { flex: 1; overflow-y: auto; padding: 15px; background: #fff; }

        /* Dashboard & Stats */
        .lumi-stats-bar { display: flex; gap: 10px; margin-bottom: 15px; background: #FFF9FA; padding: 10px; border-radius: 14px; border: 1px solid #FFE8EE; }
        .lumi-stat { flex: 1; text-align: center; }
        .lumi-stat b { display: block; font-size: 16px; color: #ff69b4; }
        .lumi-stat span { font-size: 10px; color: #999; }
        
        .lumi-action-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .lumi-gen-btn { background: linear-gradient(135deg, #FFB6C1, #FF69B4); color: white; border: none; padding: 10px 20px; border-radius: 20px; font-family: 'Mitr'; cursor: pointer; box-shadow: 0 4px 10px rgba(255,105,180,0.3); display: flex; align-items: center; gap: 6px; }

        /* Cards */
        .lumi-card { background: #FFFBFC; border: 1px solid #FFE8EE; border-radius: 16px; padding: 14px; margin-bottom: 12px; position: relative; transition: 0.2s; }
        .lumi-card:hover { box-shadow: 0 5px 15px rgba(255,182,193,0.1); transform: translateY(-2px); }
        .lumi-card.pinned { border: 1px solid #FFD700; background: #FFFDF5; }
        .lumi-card.locked { background: #F8F9FA; opacity: 0.7; }
        
        .lumi-meta { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; align-items: center; }
        .lumi-badge { font-size: 10px; padding: 3px 8px; border-radius: 8px; background: #FFF0F5; color: #ff85a2; display: flex; align-items: center; gap: 3px; }
        .lumi-char-badge { background: #FFB6C1; color: white; font-weight: 500; }
        .lumi-text { font-size: 13px; color: #555; line-height: 1.6; white-space: pre-wrap; margin: 8px 0; }
        .lumi-actions { display: flex; gap: 8px; justify-content: flex-end; border-top: 1px dashed #FFE8EE; padding-top: 8px; }
        .lumi-act { background: none; border: none; cursor: pointer; color: #ffb6c1; opacity: 0.6; transition: 0.2s; padding: 4px; }
        .lumi-act:hover { opacity: 1; color: #ff69b4; }
        .lumi-act.active { opacity: 1; color: #FFD700; }

        /* Generator Form */
        .lumi-form { background: #FFF9FA; border: 1px solid #FFE8EE; border-radius: 16px; padding: 15px; margin-bottom: 20px; }
        .lumi-input { width: 100%; background: #fff; border: 1px solid #FFD1DC; border-radius: 10px; padding: 10px; color: #ff85a2; font-family: 'Mitr'; outline: none; box-sizing: border-box; }
        .lumi-label { font-size: 12px; color: #666; margin-bottom: 6px; display: block; }

        /* RPG Grouping */
        .lumi-group-head { font-size: 14px; color: #ff69b4; margin: 20px 0 10px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
        .lumi-group-line { flex: 1; height: 1px; background: #FFE8EE; }

        /* Toast */
        .lumi-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); z-index: 999999; font-family: 'Mitr'; font-size: 13px; color: #ff69b4; border: 1px solid #FFE8EE; animation: popIn 0.3s; pointer-events: none; }
        
        /* Extension Panel */
        #lumi-panel .inline-drawer-content { font-family: 'Mitr'; padding: 10px; }
        #lumi-panel .menu_button { width: 100%; margin-bottom: 5px; background: linear-gradient(135deg, #FFB6C1, #FF69B4); color: white; border: none; border-radius: 8px; padding: 8px; font-family: 'Mitr'; }

        @media (max-width: 768px) { .lumi-menu-grid { grid-template-columns: repeat(2, 1fr); } }
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// 4. FAB BUTTON
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-fab, .lumi-menu').remove();
    if (!document.body) return;

    const fab = document.createElement('div');
    fab.id = 'lumi-fab';
    const pos = extension_settings[extensionName]._internal.fabPos;
    if (pos) Object.assign(fab.style, pos);
    else { fab.style.top = '50%'; fab.style.right = '20px'; fab.style.transform = 'translateY(-50%)'; }
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-open"><img src="${iconDiary}"><span>Diary</span></div>
            <div class="lumi-menu-item" id="lumi-set">${svgSettings}<span>Settings</span></div>
        </div>`;
    document.body.appendChild(menu);

    let isDragging = false, startX, startY, initLeft, initTop, movedDist = 0;
    const THRESHOLD = 12;

    function startDrag(x, y) {
        isDragging = false; movedDist = 0; startX = x; startY = y;
        const rect = fab.getBoundingClientRect();
        initLeft = rect.left; initTop = rect.top; fab.style.transform = 'none';
    }
    function moveDrag(x, y) {
        const dx = x - startX, dy = y - startY; movedDist = Math.hypot(dx, dy);
        if (movedDist > THRESHOLD) isDragging = true;
        if (isDragging) {
            fab.style.left = (initLeft + dx) + 'px'; fab.style.top = (initTop + dy) + 'px';
            fab.style.right = 'auto'; fab.style.bottom = 'auto'; $(menu).fadeOut(100);
        }
    }
    function endDrag() {
        if (isDragging) {
            extension_settings[extensionName]._internal.fabPos = { top: fab.style.top, left: fab.style.left, right: 'auto', bottom: 'auto', transform: 'none' };
            SillyTavern.getContext().saveSettingsDebounced();
        } else if (movedDist < THRESHOLD) {
            const r = fab.getBoundingClientRect(); const mW = $(menu).outerWidth();
            menu.style.left = Math.max(10, Math.min(r.left + r.width/2 - mW/2, window.innerWidth - mW - 10)) + 'px';
            menu.style.top = Math.max(10, r.top - $(menu).outerHeight() - 15) + 'px';
            $(menu).fadeToggle(200);
        }
        isDragging = false;
    }

    fab.addEventListener('mousedown', e => { if(e.button!==0)return; e.preventDefault(); startDrag(e.clientX, e.clientY); const onMove=ev=>moveDrag(ev.clientX, ev.clientY); const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);endDrag();}; document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp); });
    fab.addEventListener('touchstart', e => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    fab.addEventListener('touchmove', e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    fab.addEventListener('touchend', e => { e.preventDefault(); endDrag(); }, { passive: false });

    $('#lumi-open').on('click', () => { $(menu).fadeOut(); openModal(); });
    $('#lumi-set').on('click', () => { $(menu).fadeOut(); openSettingsModal(); });
}

// ═══════════════════════════════════════════════
// 5. MODAL & UI LOGIC
// ═══════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`
        <div id="lumi-overlay" class="lumi-overlay">
            <div class="lumi-modal">
                <div class="lumi-head">
                    <button class="lumi-btn" id="lumi-back">${svgBack}</button>
                    <h3 id="lumi-title">LumiPulse</h3>
                    <button class="lumi-btn" id="lumi-close">${svgClose}</button>
                </div>
                <div id="lumi-body" class="lumi-body"></div>
            </div>
        </div>
    `);
    $('#lumi-close, #lumi-overlay').on('click', e => { if(e.target.id==='lumi-overlay'||e.target.closest('#lumi-close')) $('#lumi-overlay').fadeOut(); });
    $('#lumi-back').on('click', () => renderDashboard());
}

function openModal() {
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    renderDashboard();
}

function openSettingsModal() {
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    renderSettings();
}

// 📊 Dashboard (Stats + Diary + Gen Button)
function renderDashboard() {
    $('#lumi-title').text("Memories");
    const mems = loadMemories();
    const chars = [...new Set(mems.map(m => m.character))];
    
    $('#lumi-body').html(`
        <div class="lumi-stats-bar">
            <div class="lumi-stat"><b>${mems.length}</b><span>Total</span></div>
            <div class="lumi-stat"><b>${chars.length}</b><span>Chars</span></div>
            <div class="lumi-stat"><b>${mems.filter(m=>m.meta.isFavorite).length}</b><span>Favs</span></div>
        </div>
        <div class="lumi-action-row">
            <span style="font-size:13px;color:#666">Recent Memories</span>
            <button class="lumi-gen-btn" id="btn-open-gen">${svgPlus} Generate</button>
        </div>
        <div id="gen-form-container" style="display:none;margin-bottom:15px;"></div>
        <div id="lumi-content"></div>
    `);
    
    // Toggle Generator Form
    $('#btn-open-gen').on('click', function() {
        if($('#gen-form-container').is(':visible')) {
            $('#gen-form-container').slideUp(200);
        } else {
            renderGeneratorForm();
            $('#gen-form-container').slideDown(200);
        }
    });
    
    renderDashboardContent();
}

function renderGeneratorForm() {
    $('#gen-form-container').html(`
        <div class="lumi-form">
            <label class="lumi-label">Scan Range (Latest Messages)</label>
            <input type="range" id="gen-range" min="10" max="100" value="30" style="width:100%;margin-bottom:10px;accent-color:#ff69b4">
            <div style="text-align:center;font-size:12px;color:#ff85a2;margin-bottom:10px" id="range-val">30 msgs</div>
            
            <button id="btn-run-gen" class="lumi-gen-btn" style="width:100%;justify-content:center">✨ Analyze & Generate</button>
        </div>
    `);
    $('#gen-range').on('input', function(){ $('#range-val').text(this.value + ' msgs'); });
    $('#btn-run-gen').on('click', generateBatchMemories);
}

// 📖 Diary Content Rendering (Grouped by Character)
function renderDashboardContent() {
    const mems = loadMemories();
    if(!mems.length) { $('#lumi-content').html('<div style="text-align:center;color:#ccc;padding:30px">No memories yet. Click Generate to start!</div>'); return; }

    // Group by Character
    const byChar = {};
    mems.forEach(m => { 
        const char = m.character || "Unknown";
        if(!byChar[char]) byChar[char] = []; 
        byChar[char].push(m); 
    });

    let html = '';
    for(const char in byChar) {
        const color = generateColor(char);
        html += `<div class="lumi-group-head"><div class="lumi-avatar" style="background:${color}">${char[0]}</div> ${char} <div class="lumi-group-line"></div></div>`;
        byChar[char].forEach(m => html += renderCard(m));
    }
    $('#lumi-content').html(html);
    bindEvents();
}

function renderCard(m) {
    const showSecret = extension_settings[extensionName].diary.display.showSecretSystem;
    const isLocked = showSecret && checkUnlock(m) === false;
    const color = generateColor(m.character);
    
    let lockOverlay = '';
    if(isLocked) {
        lockOverlay = `<div style="position:absolute;inset:0;background:rgba(255,255,255,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;z-index:1">
            ${svgLock} <div style="font-size:11px;color:#ff85a2;margin-top:5px">Locked</div>
        </div>`;
    }

    return `
        <div class="lumi-card ${m.meta.isPinned?'pinned':''}" data-id="${m.id}">
            ${lockOverlay}
            <div class="lumi-meta">
                <span class="lumi-badge" style="background:${color};color:white;font-weight:500">${m.character}</span>
                <span class="lumi-badge">📅 ${m.content.rp_date||'?'}</span>
                <span class="lumi-badge">📍 ${m.content.rp_location||'?'}</span>
            </div>
            <div class="lumi-text">${isLocked ? '...' : m.content.diary}</div>
            <div class="lumi-actions">
                <button class="lumi-act ${m.meta.isPinned?'active':''}" data-act="pin">${svgPin}</button>
                <button class="lumi-act ${m.meta.isFavorite?'active':''}" data-act="fav">${svgStar}</button>
                <button class="lumi-act" data-act="del">${svgClose}</button>
            </div>
        </div>`;
}

// ⚙️ Settings
function renderSettings() {
    $('#lumi-title').text("Settings");
    const s = extension_settings[extensionName];
    $('#lumi-body').html(`
        <div style="padding:10px;">
            <div class="lumi-form">
                <label class="lumi-label">World Mode</label>
                <select id="set-wm" class="lumi-input">
                    <option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option>
                    <option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option>
                    <option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option>
                </select>
            </div>
            
            <div class="lumi-form">
                <label class="lumi-label">Secret System</label>
                <div class="lumi-set-row" style="justify-content:space-between">
                    <span style="font-size:12px;color:#666">Enable Secret Mode</span>
                    <input type="checkbox" id="set-secret-en" ${s.diary.display.showSecretSystem?'checked':''} style="width:20px;height:20px;accent-color:#ff69b4">
                </div>
                <div class="lumi-set-row" style="margin-top:10px">
                    <span style="font-size:12px;color:#666">Unlock Rule</span>
                    <select id="set-sec-mode" class="lumi-input" style="width:120px">
                        <option value="ai" ${s.diary.display.secretMode==='ai'?'selected':''}>AI Decide</option>
                        <option value="time" ${s.diary.display.secretMode==='time'?'selected':''}>Time (3 days)</option>
                        <option value="affection" ${s.diary.display.secretMode==='affection'?'selected':''}>Affection ≥ 80</option>
                    </select>
                </div>
            </div>
            
            <div style="margin-top:15px;display:flex;gap:10px">
                <button id="btn-rst" class="lumi-input" style="background:#FFE0E0;color:#ff69b4;text-align:center;cursor:pointer">Reset FAB</button>
                <button id="btn-clr" class="lumi-input" style="background:#FFE0E0;color:#ff69b4;text-align:center;cursor:pointer">Clear Data</button>
            </div>
        </div>
    `);
    
    $('#set-wm').on('change', function(){ s.diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-secret-en').on('change', function(){ s.diary.display.showSecretSystem = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); showToast($(this).prop('checked')?'Secret System On':'Secret System Off'); });
    $('#set-sec-mode').on('change', function(){ s.diary.display.secretMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#btn-rst').on('click', ()=>{ s._internal.fabPos = null; SillyTavern.getContext().saveSettingsDebounced(); $('#lumi-fab').remove(); spawnLumiButton(); showToast('Reset FAB'); });
    $('#btn-clr').on('click', ()=>{ if(confirm('Clear all?')) { s.memories=[]; SillyTavern.getContext().saveSettingsDebounced(); showToast('Cleared'); renderDashboard(); } });
}

// ═══════════════════════════════════════════════
// 6. AI BATCH GENERATION
// ═══════════════════════════════════════════════
async function generateBatchMemories() {
    const range = parseInt($('#gen-range').val()) || 30;
    $('#btn-run-gen').text('Thinking...').prop('disabled', true);
    
    const results = await callAIBatch(range);
    
    $('#btn-run-gen').text('✨ Analyze & Generate').prop('disabled', false);
    $('#gen-form-container').slideUp(200);
    
    if(results && results.length > 0) {
        const ctx = SillyTavern.getContext();
        const wm = extension_settings[extensionName].diary.worldMode === 'auto' ? detectWorldMode() : extension_settings[extensionName].diary.worldMode;
        
        results.forEach(res => {
            // Determine character based on AI response or fallback to current char
            let charName = res.character || ctx.name2 || "Character";
            
            saveMemory({
                id: 'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),
                timestamp: new Date().toISOString(),
                character: charName,
                worldMode: wm,
                content: { ...res },
                meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, tags: extractTags(res.diary) }
            });
        });
        
        showToast(`✨ Created ${results.length} memories!`);
        renderDashboard();
    } else {
        showToast('❌ No new memories found');
    }
}

async function callAIBatch(range) {
    const ctx = SillyTavern.getContext();
    const allChat = ctx.chat || [];
    const chatSlice = allChat.slice(-range);
    
    // สแกนหาตัวละครหลักในแชทช่วงนี้
    const charsInChat = [...new Set(chatSlice.filter(m=>m.name && !m.is_user).map(m=>m.name))];
    const charContext = charsInChat.length > 0 ? `Main Characters in context: ${charsInChat.join(', ')}` : `Main Character: ${ctx.name2}`;

    const chatLog = chatSlice.map((m, i) => `[${m.is_user?'User':m.name||'NPC'}]: ${m.mes.slice(0,80)}`).join('\n');

    const prompt = `[System: You are the collective inner voice of the characters in this roleplay. Analyze the chat logs below.]
${charContext}
Chat Log (Last ${range} msgs):
${chatLog}

Identify up to 3 significant events or emotional moments. For EACH moment, generate a diary entry for the specific character involved.
Return ONLY a JSON ARRAY of objects like this:
[
  {
    "character": "Name of character (e.g. Alice)",
    "rp_date": "Fictional date (e.g. Day 5 of 3rd Moon)",
    "rp_location": "Location inferred from chat",
    "diary": "First-person diary entry in Thai. 2-4 sentences.",
    "isSecret": true/false
  }
]
If nothing significant happened, return empty array [].`;

    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        else if (typeof window.generateQuietPrompt === 'function') res = await window.generateQuietPrompt(prompt, false, false);
        
        if (!res) return [];
        // Extract JSON Array
        const match = res.match(/\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

// ═══════════════════════════════════════════════
// 7. HELPERS & UTILS
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

function checkUnlock(m) {
    if(!m.meta.isSecret) return true;
    if(!extension_settings[extensionName].diary.display.showSecretSystem) return true; // Secret system disabled
    
    const mode = extension_settings[extensionName].diary.display.secretMode;
    if(mode === 'time') return (Date.now() - new Date(m.timestamp)) > 86400000 * 3;
    if(mode === 'affection') return m.content.affection_score >= 80; // ถ้า AI ไม่ส่ง score มา จะถือว่า lock (ต้องแก้ prompt ให้ส่ง score ถ้าจะใช้ mode นี้)
    return false; // Default AI decides -> treat as locked until user intervention or just visual lock
}

function bindEvents() {
    $('.lumi-act').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        const act = $(this).data('act');
        const mem = extension_settings[extensionName].memories.find(m => m.id === id);
        if(!mem) return;
        
        if(act === 'pin') { mem.meta.isPinned = !mem.meta.isPinned; }
        if(act === 'fav') { mem.meta.isFavorite = !mem.meta.isFavorite; }
        if(act === 'del') { if(confirm('Delete?')) { extension_settings[extensionName].memories = extension_settings[extensionName].memories.filter(m => m.id !== id); } }
        
        SillyTavern.getContext().saveSettingsDebounced();
        renderDashboardContent();
    });
}

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

