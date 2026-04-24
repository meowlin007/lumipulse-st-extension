"use strict";

// ═══════════════════════════════════════════════
// 1. CONFIG & ASSETS
// ═══════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    _internal: { fabPos: null, theme: 'pink' },
    diary: {
        worldMode: 'auto',
        display: { 
            secretMode: 'ai', 
            showSecretSystem: true 
        },
        autoGen: {
            enabled: true,
            triggerType: 'turn_count',
            turnInterval: 20,
            emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'],
            randomChance: 0.08
        },
        storage: { max: 100 }
    }
};

let extension_settings = {};

// Icon Links (สำหรับเมนูหลัก)
const btnUrl       = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconSettings = "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png";

// ✅ SVG Vectors ทั้งหมด (แทนอิโมจิ)
const svgHeart    = `<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF69B4"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgClose    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgBack     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const svgPlus     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const svgChevron  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>`;
const svgFilter   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`;
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgMapPin   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgUser     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

// ═══════════════════════════════════════════════
// THEME SYSTEM (✅ ย้ายมาไว้บนสุด)
// ═══════════════════════════════════════════════
const themes = {
    pink: { name: 'Pink Pastel', primary: '#FFB6C1', secondary: '#FF69B4', bg: '#FFF0F5', card: '#FFFBFC', text: '#555', border: '#FFE8EE' },
    purple: { name: 'Purple Dream', primary: '#E6D5F0', secondary: '#9B7ED9', bg: '#F5F0FA', card: '#FAF7FC', text: '#555', border: '#E8D8F0' },
    ocean: { name: 'Ocean Blue', primary: '#B6D7F0', secondary: '#4A9FD9', bg: '#F0F7FA', card: '#F7FBFC', text: '#555', border: '#D8E8F0' },
    mint: { name: 'Mint Fresh', primary: '#B6F0D7', secondary: '#4AD99A', bg: '#F0FAF5', card: '#F7FCFA', text: '#555', border: '#D8F0E8' }
};

function applyTheme(themeName) {
    const theme = themes[themeName] || themes.pink;
    const root = document.documentElement;
    root.style.setProperty('--lumi-primary', theme.primary);
    root.style.setProperty('--lumi-secondary', theme.secondary);
    root.style.setProperty('--lumi-bg', theme.bg);
    root.style.setProperty('--lumi-card', theme.card);
    root.style.setProperty('--lumi-text', theme.text);
    root.style.setProperty('--lumi-border', theme.border);
}

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
    
    // ✅ Apply theme on init
    applyTheme(extension_settings[extensionName]._internal.theme || 'pink');
    
    injectStyles();
    createSettingsPanel();
    
    if (extension_settings[extensionName].isEnabled) {
        setTimeout(() => {
            spawnLumiButton();
            createModal();
            setupAutoTriggerListener();
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
        :root { --lumi-primary: #FFB6C1; --lumi-secondary: #FF69B4; --lumi-bg: #FFF0F5; --lumi-card: #FFFBFC; --lumi-text: #555; --lumi-border: #FFE8EE; --lumi-glass: rgba(255, 255, 255, 0.9); }
        
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes heartFloat { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }

        /* FAB & Menu */
        #lumi-fab { position: fixed; z-index: 99999; width: 46px; height: 46px; border-radius: 50%;
            background: var(--lumi-glass) url('${btnUrl}') no-repeat center center;
            background-size: 24px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.8);
            box-shadow: 0 4px 15px rgba(255,105,180,0.3); cursor: grab; touch-action: none; user-select: none;
            transition: transform 0.2s; }
        #lumi-fab:active { transform: scale(0.9); cursor: grabbing; }

        .lumi-menu { position: fixed; z-index: 99998; display: none; background: rgba(255,255,255,0.98);
            backdrop-filter: blur(15px); border-radius: 20px; padding: 15px; border: 1px solid rgba(255,182,193,0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-family: 'Mitr'; min-width: 200px; }
        .lumi-menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; opacity: 0.85; transition: 0.2s; padding: 10px; border-radius: 12px; }
        .lumi-menu-item:hover { opacity: 1; background: var(--lumi-bg); }
        .lumi-menu-item img { width: 32px; height: 32px; object-fit: contain; }
        .lumi-menu-item svg { width: 32px; height: 32px; color: var(--lumi-primary); }
        .lumi-menu-item span { font-size: 11px; color: #666; }

        /* Modal */
        .lumi-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); z-index: 100000; display: none; align-items: center; justify-content: center; }
        .lumi-modal { width: 92%; max-width: 460px; height: 85vh; background: var(--lumi-card); border-radius: 24px; border: 1px solid var(--lumi-border);
            box-shadow: 0 20px 50px rgba(255,105,180,0.2); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr'; animation: popIn 0.3s; }
        .lumi-head { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--lumi-border); background: var(--lumi-bg); }
        .lumi-head h3 { margin: 0; font-size: 16px; color: var(--lumi-secondary); font-weight: 400; }
        .lumi-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--lumi-bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--lumi-primary); transition: 0.2s; }
        .lumi-btn:hover { background: var(--lumi-border); }
        .lumi-body { flex: 1; overflow-y: auto; padding: 15px; background: var(--lumi-card); }

        /* Dashboard & Stats */
        .lumi-stats-bar { display: flex; gap: 10px; margin-bottom: 15px; background: var(--lumi-bg); padding: 12px; border-radius: 14px; border: 1px solid var(--lumi-border); }
        .lumi-stat { flex: 1; text-align: center; }
        .lumi-stat b { display: block; font-size: 18px; color: var(--lumi-secondary); font-weight: 500; }
        .lumi-stat span { font-size: 10px; color: #999; }
        
        .lumi-action-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .lumi-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .lumi-filter-select { background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; padding: 8px 12px; color: var(--lumi-primary); font-family: 'Mitr'; font-size: 12px; outline: none; min-width: 120px; }
        
        .lumi-gen-btn { background: linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary)); color: white; border: none; padding: 10px 18px; border-radius: 20px; font-family: 'Mitr'; cursor: pointer; box-shadow: 0 4px 10px rgba(255,105,180,0.3); display: flex; align-items: center; gap: 6px; font-size: 13px; }
        .lumi-gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Generator Form */
        .lumi-form { background: var(--lumi-bg); border: 1px solid var(--lumi-border); border-radius: 16px; padding: 15px; margin-bottom: 15px; }
        .lumi-input { width: 100%; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; padding: 10px; color: var(--lumi-primary); font-family: 'Mitr'; outline: none; box-sizing: border-box; }
        .lumi-label { font-size: 12px; color: #666; margin-bottom: 6px; display: block; font-weight: 400; }
        .lumi-radio-group { display: flex; gap: 8px; margin-bottom: 10px; }
        .lumi-radio-label { flex: 1; text-align: center; padding: 8px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; cursor: pointer; font-size: 12px; color: #666; transition: 0.2s; }
        .lumi-radio-label:has(input:checked) { background: var(--lumi-primary); color: white; border-color: var(--lumi-primary); }
        .lumi-radio-label input { display: none; }

        /* Character/Date/Location Group Banner */
        .lumi-group-banner {
            display: flex; align-items: center; gap: 10px; padding: 12px 14px;
            background: linear-gradient(135deg, var(--lumi-bg), var(--lumi-card));
            border: 1px solid var(--lumi-border); border-radius: 14px;
            cursor: pointer; margin: 15px 0 8px; transition: 0.2s;
        }
        .lumi-group-banner:hover { background: var(--lumi-bg); }
        .lumi-group-banner .lumi-avatar { 
            width: 28px; height: 28px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            color: white; font-size: 13px; font-weight: 500; flex-shrink: 0; 
        }
        .lumi-group-banner .lumi-group-name { 
            flex: 1; font-size: 14px; color: var(--lumi-text); font-weight: 500; 
        }
        .lumi-group-banner .lumi-group-count { 
            font-size: 11px; color: var(--lumi-primary); background: var(--lumi-bg); 
            padding: 3px 10px; border-radius: 10px; 
        }
        .lumi-group-banner .lumi-chevron { 
            color: var(--lumi-primary); transition: transform 0.3s; 
        }
        .lumi-group-banner.collapsed .lumi-chevron { transform: rotate(-90deg); }
        .lumi-group-entries { transition: all 0.3s ease; overflow: hidden; }
        .lumi-group-entries.collapsed { max-height: 0; opacity: 0; }

        /* Cards */
        .lumi-card { background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 16px; padding: 14px; margin: 0 0 10px 38px; position: relative; transition: 0.2s; }
        .lumi-card:hover { box-shadow: 0 5px 15px rgba(255,105,180,0.1); transform: translateY(-2px); }
        .lumi-card.pinned { border: 1px solid #FFD700; background: #FFFDF5; }
        .lumi-card.locked { background: #F8F9FA; opacity: 0.7; }
        
        .lumi-meta { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; align-items: center; }
        .lumi-badge { font-size: 10px; padding: 3px 8px; border-radius: 8px; background: var(--lumi-bg); color: var(--lumi-primary); display: flex; align-items: center; gap: 3px; }
        .lumi-char-badge { background: var(--lumi-primary); color: white; font-weight: 500; }
        .lumi-text { font-size: 13px; color: var(--lumi-text); line-height: 1.6; white-space: pre-wrap; margin: 8px 0; }
        .lumi-actions { display: flex; gap: 8px; justify-content: flex-end; border-top: 1px dashed var(--lumi-border); padding-top: 8px; }
        .lumi-act { background: none; border: none; cursor: pointer; color: var(--lumi-primary); opacity: 0.6; transition: 0.2s; padding: 4px; }
        .lumi-act:hover { opacity: 1; color: var(--lumi-secondary); }
        .lumi-act.active { opacity: 1; color: #FFD700; }

        /* Settings */
        .lumi-set-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; color: #666; }
        .lumi-set-row select, .lumi-set-row input[type="number"] { background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 8px; padding: 5px 8px; color: var(--lumi-primary); font-family: 'Mitr'; outline: none; }

        /* Toast */
        .lumi-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); z-index: 999999; font-family: 'Mitr'; font-size: 13px; color: var(--lumi-secondary); border: 1px solid var(--lumi-border); animation: popIn 0.3s; pointer-events: none; }
        
        /* Extension Panel */
        #lumi-panel .inline-drawer-content { font-family: 'Mitr'; padding: 10px; }
        #lumi-panel .menu_button { width: 100%; margin-bottom: 5px; background: linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary)); color: white; border: none; border-radius: 8px; padding: 8px; font-family: 'Mitr'; }

        @media (max-width: 768px) { .lumi-menu-grid { grid-template-columns: repeat(2, 1fr); } }
        
        /* Card Hover Effects */
        .lumi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .lumi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(255,105,180,0.15); }

        /* Timeline Date Header */
        .lumi-timeline-date {
            background: linear-gradient(135deg, var(--lumi-bg), var(--lumi-card));
            border-left: 3px solid var(--lumi-primary);
            border-radius: 12px;
            padding: 10px 14px;
            margin: 20px 0 15px;
            animation: slideIn 0.4s ease;
        }
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// 4. FAB BUTTON (✅ ไอคอนใหญ่ 32px)
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
    
    setTimeout(() => {
        fab.style.display = 'flex';
        fab.style.visibility = 'visible';
        fab.style.opacity = '1';
    }, 50);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    // ✅ ใช้ SVG แทนรูปภาพ + ขนาด 32px
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-open">${svgCalendar}<span>Diary</span></div>
            <div class="lumi-menu-item" id="lumi-set">${svgLock}<span>Settings</span></div>
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

// 📊 Dashboard (✅ เพิ่มฟิลเตอร์: ตัวละคร/วันที่/สถานที่)
function renderDashboard() {
    const ctx = SillyTavern.getContext();
    const currentBotId = ctx.characterId;
    const currentBotName = ctx.name2 || "Unknown Bot";
    
    const mems = loadMemories({ botId: currentBotId });
    
    // ✅ ดึงค่าฟิลเตอร์จากหน่วยความจำ
    const filterChar = extension_settings[extensionName]._internal.filterChar || '';
    const filterDate = extension_settings[extensionName]._internal.filterDate || '';
    const filterLoc = extension_settings[extensionName]._internal.filterLoc || '';
    
    // ✅ ดึงค่าที่ไม่ซ้ำสำหรับฟิลเตอร์
    const chars = [...new Set(mems.map(m => m.character))].filter(c => c);
    const dates = [...new Set(mems.map(m => m.content.rp_date))].filter(d => d);
    const locs = [...new Set(mems.map(m => m.content.rp_location))].filter(l => l);
    
    // ✅ กรองตามฟิลเตอร์
    let filteredMems = mems;
    if (filterChar) filteredMems = filteredMems.filter(m => m.character === filterChar);
    if (filterDate) filteredMems = filteredMems.filter(m => m.content.rp_date === filterDate);
    if (filterLoc) filteredMems = filteredMems.filter(m => m.content.rp_location === filterLoc);
    
    // ✅ จัดกลุ่มตามวันที่ (สำหรับแสดงผล)
    const byDate = {};
    filteredMems.forEach(m => {
        const date = m.content.rp_date || 'Unknown Date';
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(m);
    });
    
    const sortedDates = Object.keys(byDate).sort();
    
    $('#lumi-body').html(`
        <div style="background:linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary));padding:20px;border-radius:16px;margin-bottom:15px;box-shadow:0 4px 15px rgba(255,105,180,0.2);animation:slideIn 0.3s ease;">
            <div style="font-size:11px;color:rgba(255,255,255,0.9);margin-bottom:4px">📖 Memories of</div>
            <div style="font-size:18px;color:white;font-weight:500">${currentBotName}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">${filteredMems.length} memories</div>
        </div>
        
        <div class="lumi-stats-bar" style="animation:fadeIn 0.4s ease 0.1s both;">
            <div class="lumi-stat"><b>${mems.length}</b><span>Total</span></div>
            <div class="lumi-stat"><b>${chars.length}</b><span>Chars</span></div>
            <div class="lumi-stat"><b>${mems.filter(m=>m.meta.isFavorite).length}</b><span>Favs</span></div>
        </div>
        
        <!-- ✅ ฟิลเตอร์: ตัวละคร / วันที่ / สถานที่ -->
        <div style="display:flex;gap:8px;margin-bottom:15px;animation:fadeIn 0.4s ease 0.2s both;flex-wrap:wrap;">
            <select id="filter-char" class="lumi-filter-select" style="flex:1;min-width:100px">
                <option value="">All Characters</option>
                ${chars.map(c => `<option value="${escapeHtml(c)}" ${c===filterChar?'selected':''}>${escapeHtml(c)}</option>`).join('')}
            </select>
            <select id="filter-date" class="lumi-filter-select" style="flex:1;min-width:100px">
                <option value="">All Dates</option>
                ${dates.map(d => `<option value="${escapeHtml(d)}" ${d===filterDate?'selected':''}>${escapeHtml(d)}</option>`).join('')}
            </select>
            <select id="filter-loc" class="lumi-filter-select" style="flex:1;min-width:100px">
                <option value="">All Locations</option>
                ${locs.map(l => `<option value="${escapeHtml(l)}" ${l===filterLoc?'selected':''}>${escapeHtml(l)}</option>`).join('')}
            </select>
        </div>
        
        <div class="lumi-action-row" style="animation:fadeIn 0.4s ease 0.3s both;">
            <button class="lumi-gen-btn" id="btn-open-gen">${svgPlus} Generate</button>
        </div>
        
        <div id="gen-form-container" style="display:none;margin-bottom:15px;"></div>
        
        <div id="lumi-content">
            ${sortedDates.length === 0 ? `
                <div style="text-align:center;padding:60px 20px;animation:fadeIn 0.5s ease;">
                    <div style="font-size:64px;margin-bottom:16px;opacity:0.3">${svgCalendar}</div>
                    <div style="font-size:16px;color:#999;margin-bottom:8px">No memories yet</div>
                    <div style="font-size:13px;color:#ccc;margin-bottom:24px">Start creating memories with ${currentBotName}!</div>
                    <button class="lumi-gen-btn" onclick="$('#btn-open-gen').click()" style="margin:0 auto;display:inline-flex">
                        ${svgPlus} Create First Memory
                    </button>
                </div>
            ` : ''}
        </div>
    `);
    
    // ✅ Bind ฟิลเตอร์
    $('#filter-char, #filter-date, #filter-loc').on('change', function() {
        extension_settings[extensionName]._internal.filterChar = $('#filter-char').val();
        extension_settings[extensionName]._internal.filterDate = $('#filter-date').val();
        extension_settings[extensionName]._internal.filterLoc = $('#filter-loc').val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderDashboard();
    });
    
    $('#btn-open-gen').on('click', function() {
        if($('#gen-form-container').is(':visible')) {
            $('#gen-form-container').slideUp(200);
        } else {
            renderGeneratorForm();
            $('#gen-form-container').slideDown(200);
        }
    });
    
    if (sortedDates.length > 0) {
        renderTimelineContent(byDate, sortedDates);
    }
}

function renderTimelineContent(byDate, sortedDates) {
    let html = '';
    
    sortedDates.forEach(date => {
        const entries = byDate[date];
        if (entries.length === 0) return;
        
        html += `<div class="lumi-timeline-date">
            <div style="font-size:13px;color:var(--lumi-secondary);font-weight:500;display:flex;align-items:center;gap:6px">${svgCalendar} ${date}</div>
        </div>`;
        
        entries.forEach((m, idx) => {
            html += renderCard(m, idx);
        });
    });
    
    $('#lumi-content').html(html);
    bindEvents();
}

function renderCard(m, index) {
    const showSecret = extension_settings[extensionName].diary.display.showSecretSystem;
    const isLocked = showSecret && checkUnlock(m) === false;
    const color = generateColor(m.character);
    const delay = index * 0.05;
    
    let lockOverlay = '';
    if(isLocked) {
        lockOverlay = `<div style="position:absolute;inset:0;background:rgba(255,255,255,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;z-index:1;backdrop-filter:blur(5px);">
            ${svgLock} <div style="font-size:11px;color:var(--lumi-secondary);margin-top:5px">Locked</div>
        </div>`;
    }

    return `
        <div class="lumi-card" data-id="${m.id}" style="animation:fadeIn 0.4s ease ${delay}s both; ${isLocked?'opacity:0.7;':''}">
            ${lockOverlay}
            <div class="lumi-meta">
                <span class="lumi-badge lumi-char-badge" style="background:${color};display:flex;align-items:center;gap:4px">${svgUser} ${m.character}</span>
                <span class="lumi-badge" style="display:flex;align-items:center;gap:4px">${svgMapPin} ${m.content.rp_location||'Unknown'}</span>
            </div>
            <div class="lumi-text">${isLocked ? '...' : m.content.diary}</div>
            <div class="lumi-actions">
                <button class="lumi-act ${m.meta.isPinned?'active':''}" data-act="pin" title="Pin">${svgPin}</button>
                <button class="lumi-act ${m.meta.isFavorite?'active':''}" data-act="fav" title="Favorite">${svgStar}</button>
                <button class="lumi-act" data-act="edit-inline" title="Edit (Inline)">✏️</button>
                <button class="lumi-act" data-act="edit-modal" title="Edit (Modal)">📝</button>
                <button class="lumi-act" data-act="link" title="Link to Chat">🔗</button>
                <button class="lumi-act danger" data-act="del" title="Delete">${svgClose}</button>
            </div>
        </div>`;
}

function renderGeneratorForm() {
    $('#gen-form-container').html(`
        <div class="lumi-form">
            <label class="lumi-label">Scan Mode</label>
            <div class="lumi-radio-group">
                <label class="lumi-radio-label"><input type="radio" name="gen-mode" value="latest" checked> Latest X</label>
                <label class="lumi-radio-label"><input type="radio" name="gen-mode" value="first"> First X</label>
                <label class="lumi-radio-label"><input type="radio" name="gen-mode" value="all"> All History</label>
            </div>
            <div id="gen-count-wrap" style="margin-bottom:10px;">
                <label class="lumi-label">Message Count</label>
                <input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input">
            </div>
            <button id="btn-run-gen" class="lumi-gen-btn" style="width:100%;justify-content:center">✨ Analyze & Generate</button>
        </div>
    `);
    $('input[name="gen-mode"]').on('change', function() {
        $('#gen-count-wrap').toggle($(this).val() !== 'all');
    });
    $('#btn-run-gen').on('click', generateBatchMemories);
}

// ⚙️ Settings (✅ เพิ่ม Theme Selector)
function renderSettings() {
    $('#lumi-title').text("Settings");
    const s = extension_settings[extensionName];
    const ag = s.diary.autoGen;
    const savedTheme = s._internal.theme || 'pink';
    
    $('#lumi-body').html(`
        <div style="padding:10px;">
            <!-- ✅ Theme Selector -->
            <div class="lumi-form">
                <label class="lumi-label">Theme</label>
                <select id="set-theme" class="lumi-input">
                    ${Object.entries(themes).map(([k,v]) => `<option value="${k}" ${k===savedTheme?'selected':''}>${v.name}</option>`).join('')}
                </select>
            </div>
            
            <div class="lumi-form">
                <label class="lumi-label">General</label>
                <div class="lumi-set-row"><span>Extension Enabled</span><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>World Mode</span>
                    <select id="set-wm" class="lumi-input" style="width:100px">
                        <option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option>
                        <option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option>
                        <option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option>
                    </select>
                </div>
            </div>
            
            <div class="lumi-form">
                <label class="lumi-label">Auto-Generation</label>
                <div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="ag-en" ${ag.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>Trigger</span>
                    <select id="ag-tr" class="lumi-input" style="width:110px">
                        <option value="turn_count" ${ag.triggerType==='turn_count'?'selected':''}>Every X Msgs</option>
                        <option value="emotion" ${ag.triggerType==='emotion'?'selected':''}>Emotion Keywords</option>
                        <option value="random" ${ag.triggerType==='random'?'selected':''}>Random</option>
                    </select>
                </div>
                <div id="ag-val-wrap" style="margin-top:8px">
                    ${ag.triggerType==='turn_count' ? `<span style="font-size:12px;color:#666">Interval:</span> <input type="number" id="ag-int" value="${ag.turnInterval}" min="5" max="100" style="width:50px;background:var(--lumi-card);border:1px solid var(--lumi-border);border-radius:6px;padding:4px;color:var(--lumi-primary);font-family:'Mitr'">` : ''}
                    ${ag.triggerType==='random' ? `<span style="font-size:12px;color:#666">Chance %:</span> <input type="number" id="ag-chance" value="${Math.round(ag.randomChance*100)}" min="1" max="50" style="width:50px;background:var(--lumi-card);border:1px solid var(--lumi-border);border-radius:6px;padding:4px;color:var(--lumi-primary);font-family:'Mitr'">` : ''}
                    ${ag.triggerType==='emotion' ? `<input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" placeholder="Keywords..." class="lumi-input">` : ''}
                </div>
            </div>
            
            <div class="lumi-form">
                <label class="lumi-label">Secret System</label>
                <div class="lumi-set-row"><span>Enable Secret Mode</span><input type="checkbox" id="set-sec-en" ${s.diary.display.showSecretSystem?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>Unlock Rule</span>
                    <select id="set-sec-mode" class="lumi-input" style="width:110px">
                        <option value="ai" ${s.diary.display.secretMode==='ai'?'selected':''}>AI Decide</option>
                        <option value="time" ${s.diary.display.secretMode==='time'?'selected':''}>Time (3 days)</option>
                        <option value="affection" ${s.diary.display.secretMode==='affection'?'selected':''}>Affection ≥ 80</option>
                    </select>
                </div>
            </div>
            
            <div style="margin-top:15px;display:flex;gap:10px">
                <button id="btn-rst" class="lumi-input" style="background:#FFE0E0;color:var(--lumi-secondary);text-align:center;cursor:pointer">Reset FAB</button>
                <button id="btn-clr" class="lumi-input" style="background:#FFE0E0;color:var(--lumi-secondary);text-align:center;cursor:pointer">Clear Data</button>
            </div>
        </div>
    `);
    
    // ✅ Bind Theme Change
    $('#set-theme').on('change', function() {
        s._internal.theme = $(this).val();
        applyTheme($(this).val());
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    $('#set-en').on('change', function(){ s.isEnabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); showToast($(this).prop('checked')?'Enabled':'Disabled'); });
    $('#set-wm').on('change', function(){ s.diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#ag-en').on('change', function(){ s.diary.autoGen.enabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#ag-tr').on('change', function() {
        s.diary.autoGen.triggerType = $(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderSettings();
    });
    $('#ag-int').on('change', function(){ s.diary.autoGen.turnInterval = parseInt($(this).val()) || 20; SillyTavern.getContext().saveSettingsDebounced(); });
    $('#ag-chance').on('change', function(){ s.diary.autoGen.randomChance = (parseInt($(this).val()) || 10) / 100; SillyTavern.getContext().saveSettingsDebounced(); });
    $('#ag-kw').on('change', function(){ s.diary.autoGen.emotionKeywords = $(this).val().split(',').map(k=>k.trim()).filter(k=>k); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#set-sec-en').on('change', function(){ s.diary.display.showSecretSystem = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); showToast($(this).prop('checked')?'Secret System On':'Secret System Off'); });
    $('#set-sec-mode').on('change', function(){ s.diary.display.secretMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#btn-rst').on('click', ()=>{ s._internal.fabPos = null; SillyTavern.getContext().saveSettingsDebounced(); $('#lumi-fab').remove(); spawnLumiButton(); showToast('Reset FAB'); });
    $('#btn-clr').on('click', ()=>{ if(confirm('Clear all memories & settings?')) { s.memories=[]; s._internal.fabPos=null; SillyTavern.getContext().saveSettingsDebounced(); showToast('Cleared'); $('#lumi-fab').remove(); spawnLumiButton(); } });
}

// ═══════════════════════════════════════════════
// 6. AI BATCH GENERATION
// ═══════════════════════════════════════════════
async function generateBatchMemories() {
    const mode = $('input[name="gen-mode"]:checked').val();
    const count = parseInt($('#gen-count').val()) || 30;
    
    $('#btn-run-gen').text('Thinking...').prop('disabled', true);
    
    const results = await callAIBatch(mode, count);
    
    $('#btn-run-gen').text('✨ Analyze & Generate').prop('disabled', false);
    $('#gen-form-container').slideUp(200);
    
    if(results && results.length > 0) {
        const ctx = SillyTavern.getContext();
        const wm = extension_settings[extensionName].diary.worldMode === 'auto' ? detectWorldMode() : extension_settings[extensionName].diary.worldMode;
        const botId = ctx.characterId;
        
        results.forEach(res => {
            let charName = res.character || ctx.name2 || "Character";
            saveMemory({
                id: 'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),
                timestamp: new Date().toISOString(),
                character: charName,
                botId: botId,
                worldMode: wm,
                content: { ...res },
                meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, tags: extractTags(res.diary) }
            });
        });
        
        showToast(`✨ Created ${results.length} memories!`);
        renderDashboard();
    } else {
        showToast('❌ No significant memories found - try expanding the message range');
    }
}

async function callAIBatch(mode, count) {
    const ctx = SillyTavern.getContext();
    const allChat = ctx.chat || [];
    let chatSlice;
    
    if(mode === 'latest') chatSlice = allChat.slice(-count);
    else if(mode === 'first') chatSlice = allChat.slice(0, count);
    else chatSlice = allChat;
    
    const charsInChat = [...new Set(chatSlice.filter(m=>m.name && !m.is_user).map(m=>m.name))];
    const charContext = charsInChat.length > 0 ? `Characters present: ${charsInChat.join(', ')}` : `Character: ${ctx.name2}`;
    
    const chatLog = chatSlice.map((m, i) => {
        const speaker = m.is_user ? 'User' : (m.name || 'NPC');
        const text = m.mes.slice(0, 50);
        return `[${speaker}]: ${text}`;
    }).join('\n');

    const prompt = `[System: You are analyzing a roleplay chat to create meaningful diary entries. Be generous in identifying memorable moments.]
${charContext}

Chat Log (${mode==='all'?'Full History':mode==='first'?`First ${count} Messages`:`Last ${count} Messages`}):
${chatLog}

Look for ANY of these moments to create diary entries:
- Emotional reactions (happy, sad, angry, surprised, touched)
- Character development or realization
- Important conversations or decisions
- Funny or awkward moments
- Romantic or intimate exchanges
- Plot developments or world-building details

For EACH moment you identify, generate a SEPARATE diary entry. A character can have multiple entries, but each entry must be UNIQUE in content.
Return ONLY a JSON ARRAY of objects like this:
[
  {
    "character": "Exact character name from chat",
    "rp_date": "Fictional date (be creative: 'Day 3 of Moonfall', 'After the banquet', etc.)",
    "rp_location": "Location from context (be specific: 'garden at dusk', 'throne room', etc.)",
    "diary": "First-person diary in Thai. 2-4 sentences showing personality and emotion. MUST BE UNIQUE - do not repeat previous entries.",
    "isSecret": true if deeply personal/vulnerable, false otherwise
  }
]
If you truly find nothing noteworthy, return []. But try to find at least 1-3 entries if possible.`;

    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        else if (typeof window.generateQuietPrompt === 'function') res = await window.generateQuietPrompt(prompt, false, false);
        
        if (!res) return [];
        const match = res.match(/\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

// ═══════════════════════════════════════════════
// 7. AUTO-TRIGGER SYSTEM
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).off('messageReceived', onNewChat).on('messageReceived', onNewChat);
}

async function onNewChat() {
    const s = extension_settings[extensionName];
    const cfg = s.diary.autoGen;
    if (!cfg.enabled) return;
    s._internal.messageCounter++;
    
    const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
    let gen = false;
    
    if (cfg.triggerType === 'turn_count' && s._internal.messageCounter >= cfg.turnInterval) { gen=true; s._internal.messageCounter=0; }
    else if (cfg.triggerType === 'emotion' && cfg.emotionKeywords.some(k => lastMsg.includes(k))) { gen=true; }
    else if (cfg.triggerType === 'random' && Math.random() < cfg.randomChance) { gen=true; }
    
    if (gen) {
        const results = await callAIBatch('latest', cfg.turnInterval || 20);
        if(results && results.length > 0) {
            const ctx = SillyTavern.getContext();
            const wm = s.diary.worldMode === 'auto' ? detectWorldMode() : s.diary.worldMode;
            const botId = ctx.characterId;
            results.forEach(res => {
                saveMemory({
                    id: 'mem_auto_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),
                    timestamp: new Date().toISOString(),
                    character: res.character || ctx.name2 || "Character",
                    botId: botId,
                    worldMode: wm,
                    content: { ...res },
                    meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, tags: extractTags(res.diary) }
                });
            });
            showToast(`🌸 Auto-generated ${results.length} memory!`);
        }
    }
}

// ═══════════════════════════════════════════════
// 8. HELPERS & UTILS
// ═══════════════════════════════════════════════
function loadMemories(filter = {}) {
    let mem = [...(extension_settings[extensionName].memories || [])];
    
    if (filter.botId) {
        mem = mem.filter(m => {
            return m.botId === filter.botId || !m.botId;
        });
    }
    
    if (filter.character) {
        mem = mem.filter(m => m.character === filter.character);
    }
    
    return mem.sort((a,b) => (b.meta.isPinned?1:0) - (a.meta.isPinned?1:0) || new Date(b.timestamp) - new Date(a.timestamp));
}

// ✅ ตรวจสอบไดอารี่ซ้ำก่อนบันทึก
function saveMemory(entry) {
    const s = extension_settings[extensionName];
    
    // ✅ Fuzzy Matching ชื่อตัวละคร
    const existingChars = [...new Set(s.memories.map(m => m.character))];
    const matchedName = findMatchingCharName(entry.character, existingChars);
    entry.character = matchedName;
    
    // ✅ ตรวจสอบไดอารี่ซ้ำ: ตัวละครเดียวกัน + เนื้อหาเหมือนกัน (>90% similar)
    const isDuplicate = s.memories.some(m => 
        m.character === entry.character && 
        similarityScore(m.content.diary, entry.content.diary) > 90
    );
    
    if (isDuplicate) {
        console.log('[LumiPulse] Duplicate memory skipped:', entry.content.diary.slice(0, 50));
        return; // ไม่บันทึกถ้าซ้ำ
    }
    
    s.memories.unshift(entry);
    if (s.memories.length > s.diary.storage.max) {
        s.memories = s.memories.slice(0, s.diary.storage.max);
    }
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

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
    if(!extension_settings[extensionName].diary.display.showSecretSystem) return true;
    
    const mode = extension_settings[extensionName].diary.display.secretMode;
    if(mode === 'time') return (Date.now() - new Date(m.timestamp)) > 86400000 * 3;
    if(mode === 'affection') return (m.content.affection_score || 0) >= 80;
    return false;
}

function bindEvents() {
    $('.lumi-act').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        const act = $(this).data('act');
        const mem = extension_settings[extensionName].memories.find(m => m.id === id);
        if(!mem) return;
        
        if(act === 'pin') { 
            mem.meta.isPinned = !mem.meta.isPinned; 
            SillyTavern.getContext().saveSettingsDebounced();
            renderDashboardContent();
        }
        if(act === 'fav') { 
            mem.meta.isFavorite = !mem.meta.isFavorite; 
            SillyTavern.getContext().saveSettingsDebounced();
            renderDashboardContent();
        }
        if(act === 'edit-inline') { 
            editMemoryInline(id); 
        }
        if(act === 'edit-modal') { 
            editMemoryModal(id); 
        }
        if(act === 'link') { 
            linkToChat(id); 
        }
        if(act === 'del') { 
            if(confirm('Delete this memory?')) { 
                extension_settings[extensionName].memories = extension_settings[extensionName].memories.filter(m => m.id !== id); 
                SillyTavern.getContext().saveSettingsDebounced();
                renderDashboardContent();
            } 
        }
    });
}

function createSettingsPanel() {
    if ($('#lumi-panel').length) return;
    $('#extensions_settings').append(`
        <div id="lumi-panel" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b style="color:var(--lumi-primary);font-family:'Mitr';font-weight:300;">🌸 LumiPulse</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="display:none;"></div>
        </div>
    `);
}

// ═══════════════════════════════════════════════
// FUZZY MATCHING & UTILS
// ═══════════════════════════════════════════════
function levenshteinDistance(str1, str2) {
    const m = str1.length, n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i-1] === str2[j-1]) dp[i][j] = dp[i-1][j-1];
            else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        }
    }
    return dp[m][n];
}

function similarityScore(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    const distance = levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return maxLen === 0 ? 100 : ((maxLen - distance) / maxLen) * 100;
}

function findMatchingCharName(newName, existingNames) {
    for (const name of existingNames) {
        if (similarityScore(newName, name) > 80) {
            return name;
        }
    }
    return newName;
}

// ═══════════════════════════════════════════════
// EDIT MEMORY FUNCTIONS
// ═══════════════════════════════════════════════
function editMemoryInline(id) {
    const mem = extension_settings[extensionName].memories.find(m => m.id === id);
    if (!mem) return;
    
    const card = $(`.lumi-card[data-id="${id}"]`);
    const currentText = mem.content.diary;
    
    card.find('.lumi-text').html(`
        <textarea class="lumi-edit-textarea" style="width:100%;min-height:80px;padding:10px;border:1px solid var(--lumi-border);border-radius:10px;font-family:'Mitr';font-size:13px;resize:vertical;color:var(--lumi-text);background:var(--lumi-card)">${currentText}</textarea>
        <div style="margin-top:8px;display:flex;gap:8px">
            <button class="lumi-btn-save" style="flex:1;background:var(--lumi-primary);color:white;border:none;padding:8px;border-radius:8px;cursor:pointer">Save</button>
            <button class="lumi-btn-cancel" style="flex:1;background:#FFE0E0;color:var(--lumi-secondary);border:none;padding:8px;border-radius:8px;cursor:pointer">Cancel</button>
        </div>
    `);
    
    card.find('.lumi-btn-save').on('click', function() {
        const newText = card.find('.lumi-edit-textarea').val();
        mem.content.diary = newText;
        SillyTavern.getContext().saveSettingsDebounced();
        renderDashboardContent();
        showToast('Memory updated!');
    });
    
    card.find('.lumi-btn-cancel').on('click', function() {
        renderDashboardContent();
    });
}

function editMemoryModal(id) {
    const mem = extension_settings[extensionName].memories.find(m => m.id === id);
    if (!mem) return;
    
    $('#lumi-title').text('Edit Memory');
    $('#lumi-body').html(`
        <div style="padding:15px;">
            <div class="lumi-form">
                <label class="lumi-label">Character</label>
                <input type="text" id="edit-char" value="${mem.character}" class="lumi-input">
            </div>
            <div class="lumi-form">
                <label class="lumi-label">Date (RP)</label>
                <input type="text" id="edit-date" value="${mem.content.rp_date||''}" class="lumi-input">
            </div>
            <div class="lumi-form">
                <label class="lumi-label">Location</label>
                <input type="text" id="edit-loc" value="${mem.content.rp_location||''}" class="lumi-input">
            </div>
            <div class="lumi-form">
                <label class="lumi-label">Diary Content</label>
                <textarea id="edit-diary" class="lumi-input" style="min-height:150px;resize:vertical">${mem.content.diary}</textarea>
            </div>
            <div style="display:flex;gap:10px">
                <button id="btn-save-edit" class="lumi-gen-btn" style="flex:2">💾 Save Changes</button>
                <button id="btn-cancel-edit" class="lumi-input" style="flex:1;background:#FFE0E0;color:var(--lumi-secondary);text-align:center;cursor:pointer">Cancel</button>
            </div>
        </div>
    `);
    
    $('#btn-save-edit').on('click', function() {
        mem.character = $('#edit-char').val();
        mem.content.rp_date = $('#edit-date').val();
        mem.content.rp_location = $('#edit-loc').val();
        mem.content.diary = $('#edit-diary').val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderDashboard();
        showToast('Memory updated!');
    });
    
    $('#btn-cancel-edit').on('click', function() {
        renderDashboard();
    });
}

// ═══════════════════════════════════════════════
// LINK TO CHAT
// ═══════════════════════════════════════════════
function linkToChat(memoryId) {
    const mem = extension_settings[extensionName].memories.find(m => m.id === memoryId);
    if (!mem || mem.meta.refIndex === undefined) {
        showToast('No chat reference found');
        return;
    }
    
    $('#lumi-overlay').fadeOut();
    
    setTimeout(() => {
        const msgElement = $(`#chat [data-message-index="${mem.meta.refIndex}"]`);
        if (msgElement.length) {
            msgElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            msgElement.css('background', 'rgba(255,182,193,0.4)');
            msgElement.css('transition', 'background 0.3s');
            setTimeout(() => msgElement.css('background', ''), 3000);
            showToast('Jumped to message #' + (mem.meta.refIndex + 1));
        }
    }, 300);
}

// ═══════════════════════════════════════════════
// ✅ createMemoryEntry - เพิ่ม botId
// ═══════════════════════════════════════════════
function createMemoryEntry(res, type, ctx, wm, refText, messageIndex) {
    const entry = {
        id: "mem_" + Date.now(),
        timestamp: new Date().toISOString(),
        trigger: type,
        character: getRPGCharacters(1)[0]?.name || getCharacterName(),
        characterId: ctx.characterId,
        worldMode: wm,
        botId: ctx.characterId,
        content: {
            rp_date: res.rp_date || "วันไม่ทราบแน่ชัด",
            rp_location: res.rp_location || "สถานที่ปัจจุบัน",
            rp_weather: res.rp_weather || "บรรยากาศเงียบสงบ",
            affection_score: res.affection_score || 50,
            mood: res.mood || "สงบ",
            diary: res.diary || ""
        },
        meta: {
            isPinned: false, isFavorite: false, isHidden: false,
            isSecret: res.isSecret || false,
            unlockCondition: res.isSecret ? { type: 'affection', value: 80 } : null,
            tags: extractTags(res.diary || ''),
            referenceText: refText?.slice(0, 100) || "",
            referencedMessageIndex: res.referencedMessageIndex || messageIndex - 30
        }
    };
    saveMemory(entry);
    showToast(`บันทึกแล้ว: ${res.rp_date}`);
}

