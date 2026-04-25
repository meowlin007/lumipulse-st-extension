"use strict";

// ═══════════════════════════════════════════════
// 1. CONFIG & ASSETS
// ═══════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    forumPosts: [],
    _internal: { 
        fabPos: null, theme: 'pink', 
        nameRegistry: {}, 
        filterChar: '', filterDate: '', filterLoc: '',
        forumMessageCounter: 0,
        lastForumGenTime: 0
    },
    diary: {
        worldMode: 'auto',
        display: { secretMode: 'ai', showSecretSystem: true },
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'], randomChance: 0.08 },
        storage: { max: 150 }
    },
    forum: {
        enabled: true,
        rpConnected: false,
        autoGen: { 
            enabled: true, 
            messageInterval: 10, 
            timeInterval: 5, 
            onImportantEvent: true 
        },
        mode: 'auto',
        storage: { max: 200 }
    },
    features: { storyWeaver: true, loreExtractor: true, memoryLinking: true }
};

let extension_settings = {};

const btnUrl       = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconSettings = "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png";
const iconForum    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart    = `<svg viewBox="0 0 24 24" fill="none" width="40" height="40"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF69B4"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;const svgClose    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgBack     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const svgPlus     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const svgChevron  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>`;
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgMapPin   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgUser     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const svgBook     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
const svgTag      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;
const svgMood     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
const svgLink     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const svgScroll   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const svgGlobe    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
const svgNetwork  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="9.5" y1="17" x2="14.5" y2="17"/><line x1="7" y1="7" x2="10" y2="14"/><line x1="17" y1="7" x2="14" y2="14"/></svg>`;
const svgComment  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const svgSettings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

const themes = {
    pink: { name: 'Pink Pastel', primary: '#FFB6C1', secondary: '#FF69B4', bg: '#FFF0F5', card: '#FFFBFC', text: '#2A2A2A', border: '#FFE8EE', danger: '#D32F2F' },
    purple: { name: 'Purple Dream', primary: '#E6D5F0', secondary: '#9B7ED9', bg: '#F5F0FA', card: '#FAF7FC', text: '#2A2A2A', border: '#E8D8F0', danger: '#C45A5A' },
    ocean: { name: 'Ocean Blue', primary: '#B6D7F0', secondary: '#4A9FD9', bg: '#F0F7FA', card: '#F7FBFC', text: '#2A2A2A', border: '#D8E8F0', danger: '#B85252' },
    mint: { name: 'Mint Fresh', primary: '#B6F0D7', secondary: '#4AD99A', bg: '#F0FAF5', card: '#F7FCFA', text: '#2A2A2A', border: '#D8F0E8', danger: '#C25858' }
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
    root.style.setProperty('--lumi-danger', theme.danger);
}

// ═══════════════════════════════════════════════
// 2. BOOT SYSTEM
// ═══════════════════════════════════════════════
jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext && document.body) {
            clearInterval(boot); initLumiPulse();
        }
    }, 500);
});

function initLumiPulse() {
    const ctx = SillyTavern.getContext();
    if (!ctx.extensionSettings[extensionName]) {        ctx.extensionSettings[extensionName] = JSON.parse(JSON.stringify(defaultSettings));
        ctx.saveSettingsDebounced();
    }
    extension_settings = ctx.extensionSettings;
    applyTheme(extension_settings[extensionName]._internal.theme || 'pink');
    injectStyles(); createSettingsPanel();
    if (extension_settings[extensionName].isEnabled) {
        setTimeout(() => { spawnLumiButton(); createModal(); setupAutoTriggerListener(); setupForumAutoTrigger(); }, 500);
    }
}

// ═══════════════════════════════════════════════
// 3. UI RENDERING
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const s = document.createElement('style'); s.id = 'lumi-styles';
    s.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
        :root { --lumi-primary: #FFB6C1; --lumi-secondary: #FF69B4; --lumi-bg: #FFF0F5; --lumi-card: #FFFBFC; --lumi-text: #2A2A2A; --lumi-border: #FFE8EE; --lumi-danger: #D32F2F; --lumi-glass: rgba(255, 255, 255, 0.9); }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes heartFloat { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes highlightPulse { 0% { background: rgba(255,182,193,0.4); } 100% { background: transparent; } }

        #lumi-fab { position: fixed; z-index: 99999; width: 46px; height: 46px; border-radius: 50%; background: var(--lumi-glass) url('${btnUrl}') no-repeat center center; background-size: 24px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 4px 15px rgba(255,105,180,0.3); cursor: grab; touch-action: none; user-select: none; transition: transform 0.2s; }
        #lumi-fab:active { transform: scale(0.9); cursor: grabbing; }

        .lumi-menu { position: fixed; z-index: 99998; display: none; background: rgba(255,255,255,0.98); backdrop-filter: blur(15px); border-radius: 20px; padding: 15px; border: 1px solid rgba(255,182,193,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-family: 'Mitr'; min-width: 200px; }
        .lumi-menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; opacity: 0.85; transition: 0.2s; padding: 10px; border-radius: 12px; }
        .lumi-menu-item:hover { opacity: 1; background: var(--lumi-bg); }
        .lumi-menu-item img, .lumi-menu-item svg { width: 40px; height: 40px; object-fit: contain; }
        .lumi-menu-item span { font-size: 11px; color: #666; }

        .lumi-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); z-index: 100000; display: none; align-items: center; justify-content: center; }
        .lumi-modal { width: 94%; max-width: 500px; height: 88vh; background: var(--lumi-card); border-radius: 24px; border: 1px solid var(--lumi-border); box-shadow: 0 20px 50px rgba(255,105,180,0.2); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr'; animation: popIn 0.3s; }
        .lumi-head { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--lumi-border); background: var(--lumi-bg); }
        .lumi-head h3 { margin: 0; font-size: 16px; color: var(--lumi-secondary); font-weight: 400; }
        .lumi-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--lumi-bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--lumi-primary); transition: 0.2s; }
        .lumi-btn:hover { background: var(--lumi-border); }
        .lumi-body { flex: 1; overflow-y: auto; padding: 15px; background: var(--lumi-card); color: var(--lumi-text); }

        .lumi-nav { display: flex; gap: 8px; margin-bottom: 15px; width: 100%; }
        .lumi-nav-tab { flex: 1; text-align: center; padding: 12px 8px; border-radius: 12px; background: var(--lumi-bg); border: 1px solid var(--lumi-border); color: var(--lumi-primary); font-size: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; min-width: 0; }
        .lumi-nav-tab.active { background: var(--lumi-primary); color: white; border-color: var(--lumi-primary); }
        .lumi-nav-tab:hover:not(.active) { background: var(--lumi-border); }
                .lumi-stats-bar { display: flex; gap: 10px; margin-bottom: 15px; background: var(--lumi-bg); padding: 12px; border-radius: 14px; border: 1px solid var(--lumi-border); }
        .lumi-stat { flex: 1; text-align: center; }
        .lumi-stat b { display: block; font-size: 18px; color: var(--lumi-secondary); font-weight: 500; }
        .lumi-stat span { font-size: 10px; color: #777; }
        
        .lumi-action-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .lumi-filters { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; }
        .lumi-filter-select { flex: 1; min-width: 80px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; padding: 8px 12px; color: var(--lumi-primary); font-family: 'Mitr'; font-size: 12px; outline: none; }
        
        .lumi-gen-btn { background: linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary)); color: white; border: none; padding: 10px 18px; border-radius: 20px; font-family: 'Mitr'; cursor: pointer; box-shadow: 0 4px 10px rgba(255,105,180,0.3); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; width: 100%; }
        .lumi-gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .lumi-form { background: var(--lumi-bg); border: 1px solid var(--lumi-border); border-radius: 16px; padding: 15px; margin-bottom: 15px; }
        .lumi-input { width: 100%; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; padding: 10px; color: var(--lumi-text); font-family: 'Mitr'; outline: none; box-sizing: border-box; }
        .lumi-label { font-size: 12px; color: #666; margin-bottom: 6px; display: block; font-weight: 400; }
        .lumi-radio-group { display: flex; gap: 8px; margin-bottom: 10px; }
        .lumi-radio-label { flex: 1; text-align: center; padding: 8px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; cursor: pointer; font-size: 12px; color: #666; transition: 0.2s; }
        .lumi-radio-label:has(input:checked) { background: var(--lumi-primary); color: white; border-color: var(--lumi-primary); }
        .lumi-radio-label input { display: none; }

        .lumi-group-banner { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: linear-gradient(135deg, var(--lumi-bg), var(--lumi-card)); border: 1px solid var(--lumi-border); border-radius: 14px; cursor: pointer; margin: 15px 0 8px; transition: 0.2s; }
        .lumi-group-banner:hover { background: var(--lumi-bg); }
        .lumi-group-banner .lumi-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 500; flex-shrink: 0; }
        .lumi-group-banner .lumi-group-name { flex: 1; font-size: 14px; color: var(--lumi-text); font-weight: 500; }
        .lumi-group-banner .lumi-group-count { font-size: 11px; color: var(--lumi-primary); background: var(--lumi-bg); padding: 3px 10px; border-radius: 10px; }
        .lumi-group-banner .lumi-chevron { color: var(--lumi-primary); transition: transform 0.3s; }
        .lumi-group-banner.collapsed .lumi-chevron { transform: rotate(-90deg); }
        .lumi-group-entries { transition: all 0.3s ease; overflow: hidden; }
        .lumi-group-entries.collapsed { max-height: 0; opacity: 0; }

        .lumi-card { background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 16px; padding: 14px; margin: 0 0 10px 38px; position: relative; transition: 0.2s; color: var(--lumi-text); }
        .lumi-card:hover { box-shadow: 0 5px 15px rgba(255,105,180,0.1); transform: translateY(-2px); }
        .lumi-card.pinned { border: 1px solid #FFD700; background: #FFFDF5; }
        .lumi-card.locked { background: #F8F9FA; opacity: 0.7; }
        .lumi-card.highlight { animation: highlightPulse 2s ease; }
        
        .lumi-meta { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; align-items: center; }
        .lumi-badge { font-size: 10px; padding: 3px 8px; border-radius: 8px; background: var(--lumi-bg); color: var(--lumi-primary); display: flex; align-items: center; gap: 3px; cursor: pointer; }
        .lumi-badge:hover { background: var(--lumi-border); }
        .lumi-char-badge { background: var(--lumi-primary); color: white; font-weight: 500; }
        .lumi-text { font-size: 13px; color: var(--lumi-text); line-height: 1.6; white-space: pre-wrap; margin: 8px 0; }
        .lumi-actions { display: flex; gap: 8px; justify-content: flex-end; border-top: 1px dashed var(--lumi-border); padding-top: 8px; }
        .lumi-act { background: none; border: none; cursor: pointer; color: var(--lumi-primary); opacity: 0.6; transition: 0.2s; padding: 4px; }
        .lumi-act:hover { opacity: 1; color: var(--lumi-secondary); }
        .lumi-act.active { opacity: 1; color: #FFD700; }
        .lumi-act.danger { color: var(--lumi-danger); }
        .lumi-act.danger:hover { color: #B84444; }

        .lumi-set-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; color: #666; }
        .lumi-set-row select, .lumi-set-row input[type="number"], .lumi-set-row input[type="text"] { background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 8px; padding: 5px 8px; color: var(--lumi-text); font-family: 'Mitr'; outline: none; }
        .lumi-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); z-index: 999999; font-family: 'Mitr'; font-size: 13px; color: var(--lumi-secondary); border: 1px solid var(--lumi-border); animation: popIn 0.3s; pointer-events: none; }
        
        #lumi-panel .inline-drawer-content { font-family: 'Mitr'; padding: 10px; }
        #lumi-panel .menu_button { width: 100%; margin-bottom: 5px; background: linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary)); color: white; border: none; border-radius: 8px; padding: 8px; font-family: 'Mitr'; }
        
        .lumi-weaver-output, .lumi-lore-output { background: var(--lumi-bg); border: 1px solid var(--lumi-border); border-radius: 12px; padding: 15px; margin: 15px 0; max-height: 300px; overflow-y: auto; font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
        .lumi-lore-table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 10px 0; }
        .lumi-lore-table th, .lumi-lore-table td { padding: 8px; border-bottom: 1px solid var(--lumi-border); text-align: left; }
        .lumi-lore-table th { color: var(--lumi-secondary); font-weight: 500; }

        .lumi-forum-container { display: flex; gap: 15px; height: calc(88vh - 250px); }
        .lumi-forum-main { flex: 1; overflow-y: auto; }
        .lumi-forum-sidebar { width: 250px; background: var(--lumi-bg); border-radius: 12px; padding: 15px; overflow-y: auto; border: 1px solid var(--lumi-border); }
        .lumi-forum-thread { background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 12px; padding: 15px; margin-bottom: 12px; }
        .lumi-forum-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed var(--lumi-border); }
        .lumi-forum-title { font-size: 14px; font-weight: 500; color: var(--lumi-secondary); }
        .lumi-forum-meta { font-size: 10px; color: #888; }
        .lumi-forum-post { margin: 10px 0; padding: 10px; background: var(--lumi-bg); border-radius: 8px; }
        .lumi-forum-author { font-size: 11px; font-weight: 500; color: var(--lumi-primary); margin-bottom: 5px; }
        .lumi-forum-content { font-size: 12px; color: var(--lumi-text); line-height: 1.5; }
        .lumi-forum-replies { margin-left: 20px; margin-top: 10px; padding-left: 15px; border-left: 2px solid var(--lumi-border); }
        .lumi-network-node { padding: 8px; margin: 5px 0; background: var(--lumi-card); border-radius: 8px; cursor: pointer; transition: 0.2s; border: 1px solid var(--lumi-border); }
        .lumi-network-node:hover { background: var(--lumi-border); transform: translateX(5px); }
        .lumi-network-node.active { background: var(--lumi-primary); color: white; }
        .lumi-post-input { width: 100%; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; padding: 10px; color: var(--lumi-text); font-family: 'Mitr'; font-size: 12px; resize: vertical; min-height: 80px; margin-bottom: 10px; box-sizing: border-box; }
        
        .lumi-loading { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; margin-right: 8px; }

        @media (max-width: 768px) { .lumi-menu-grid { grid-template-columns: repeat(2, 1fr); } .lumi-modal { width: 96%; height: 92vh; } .lumi-forum-container { flex-direction: column; } .lumi-forum-sidebar { width: 100%; height: 200px; } }
        .lumi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .lumi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(255,105,180,0.15); }
        .lumi-timeline-date { background: linear-gradient(135deg, var(--lumi-bg), var(--lumi-card)); border-left: 3px solid var(--lumi-primary); border-radius: 12px; padding: 10px 14px; margin: 20px 0 15px; animation: slideIn 0.4s ease; color: var(--lumi-text); }
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// 4. FAB BUTTON
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-fab, .lumi-menu').remove();
    if (!document.body) return;
    const fab = document.createElement('div'); fab.id = 'lumi-fab';
    const pos = extension_settings[extensionName]._internal.fabPos;
    if (pos) Object.assign(fab.style, pos); else { fab.style.top = '50%'; fab.style.right = '20px'; fab.style.transform = 'translateY(-50%)'; }
    document.body.appendChild(fab);
    setTimeout(() => { fab.style.display = 'flex'; fab.style.visibility = 'visible'; fab.style.opacity = '1'; }, 50);

    const menu = document.createElement('div'); menu.className = 'lumi-menu';    menu.innerHTML = `<div class="lumi-menu-grid"><div class="lumi-menu-item" id="lumi-open"><img src="${iconDiary}"><span>Diary</span></div><div class="lumi-menu-item" id="lumi-forum-btn"><img src="${iconForum}"><span>Forum</span></div><div class="lumi-menu-item" id="lumi-set"><img src="${iconSettings}"><span>Settings</span></div></div>`;
    document.body.appendChild(menu);

    let isDragging = false, startX, startY, initLeft, initTop, movedDist = 0;
    const THRESHOLD = 12;
    function startDrag(x, y) { isDragging = false; movedDist = 0; startX = x; startY = y; const rect = fab.getBoundingClientRect(); initLeft = rect.left; initTop = rect.top; fab.style.transform = 'none'; }
    function moveDrag(x, y) { const dx = x - startX, dy = y - startY; movedDist = Math.hypot(dx, dy); if (movedDist > THRESHOLD) isDragging = true; if (isDragging) { fab.style.left = (initLeft + dx) + 'px'; fab.style.top = (initTop + dy) + 'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto'; $(menu).fadeOut(100); } }
    function endDrag() { if (isDragging) { extension_settings[extensionName]._internal.fabPos = { top: fab.style.top, left: fab.style.left, right: 'auto', bottom: 'auto', transform: 'none' }; SillyTavern.getContext().saveSettingsDebounced(); } else if (movedDist < THRESHOLD) { const r = fab.getBoundingClientRect(); const mW = $(menu).outerWidth(); menu.style.left = Math.max(10, Math.min(r.left + r.width/2 - mW/2, window.innerWidth - mW - 10)) + 'px'; menu.style.top = Math.max(10, r.top - $(menu).outerHeight() - 15) + 'px'; $(menu).fadeToggle(200); } isDragging = false; }

    fab.addEventListener('mousedown', e => { if(e.button!==0)return; e.preventDefault(); startDrag(e.clientX, e.clientY); const onMove=ev=>moveDrag(ev.clientX, ev.clientY); const onUp=()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);endDrag();}; document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp); });
    fab.addEventListener('touchstart', e => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    fab.addEventListener('touchmove', e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    fab.addEventListener('touchend', e => { e.preventDefault(); endDrag(); }, { passive: false });
    $('#lumi-open').on('click', () => { $(menu).fadeOut(); openModal('diary'); });
    $('#lumi-forum-btn').on('click', () => { $(menu).fadeOut(); openModal('forum'); });
    $('#lumi-set').on('click', () => { $(menu).fadeOut(); openSettingsModal(); });
}

// ═══════════════════════════════════════════════
// 5. MODAL & UI LOGIC
// ═══════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`<div id="lumi-overlay" class="lumi-overlay"><div class="lumi-modal"><div class="lumi-head"><button class="lumi-btn" id="lumi-back">${svgBack}</button><h3 id="lumi-title">LumiPulse</h3><button class="lumi-btn" id="lumi-close">${svgClose}</button></div><div id="lumi-body" class="lumi-body"></div></div></div>`);
    $('#lumi-close, #lumi-overlay').on('click', e => { if(e.target.id==='lumi-overlay'||e.target.closest('#lumi-close')) $('#lumi-overlay').fadeOut(); });
    $('#lumi-back').on('click', () => { 
        const currentTab = $('#lumi-body').data('current-tab') || 'diary'; 
        if(currentTab === 'forum') renderForum(); 
        else if(currentTab === 'settings') renderSettings();
        else renderDashboard(); 
    });
}

function openModal(type = 'diary') {
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    if (type === 'forum') renderForum();
    else renderDashboard();
}

// ✅ แยก Settings Modal ออกมาชัดเจน
function openSettingsModal() {
    $('#lumi-body').data('current-tab', 'settings');
    $('#lumi-title').text('LumiPulse - Settings');
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    renderSettings();
}

// Diary Dashboard
function renderDashboard() {
    $('#lumi-body').data('current-tab', 'diary');    $('#lumi-title').text('LumiPulse - Diary');
    const ctx = SillyTavern.getContext(); const currentBotId = ctx.characterId; const currentBotName = ctx.name2 || "Unknown Bot";
    const mems = loadMemories({ botId: currentBotId });
    const filterChar = extension_settings[extensionName]._internal.filterChar || '';
    const filterDate = extension_settings[extensionName]._internal.filterDate || '';
    const filterLoc = extension_settings[extensionName]._internal.filterLoc || '';
    const chars = [...new Set(mems.map(m => m.character))].filter(c => c);
    const dates = [...new Set(mems.map(m => m.content.rp_date))].filter(d => d);
    const locs = [...new Set(mems.map(m => m.content.rp_location))].filter(l => l);
    let filteredMems = mems;
    if (filterChar) filteredMems = filteredMems.filter(m => m.character === filterChar);
    if (filterDate) filteredMems = filteredMems.filter(m => m.content.rp_date === filterDate);
    if (filterLoc) filteredMems = filteredMems.filter(m => m.content.rp_location === filterLoc);
    
    $('#lumi-body').html(`
        <div style="background:linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary));padding:20px;border-radius:16px;margin-bottom:15px;box-shadow:0 4px 15px rgba(255,105,180,0.2);animation:slideIn 0.3s ease;">
            <div style="font-size:11px;color:rgba(255,255,255,0.9);margin-bottom:4px;display:flex;align-items:center;gap:6px">${svgBook} Memories of</div>
            <div style="font-size:18px;color:white;font-weight:500">${currentBotName}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">${filteredMems.length} memories</div>
        </div>
        <div class="lumi-stats-bar" style="animation:fadeIn 0.4s ease 0.1s both;"><div class="lumi-stat"><b>${mems.length}</b><span>Total</span></div><div class="lumi-stat"><b>${chars.length}</b><span>Chars</span></div><div class="lumi-stat"><b>${mems.filter(m=>m.meta.isFavorite).length}</b><span>Favs</span></div></div>
        
        <div class="lumi-nav">
            <div class="lumi-nav-tab active" data-tab="diary">${svgBook} Diary</div>
            <div class="lumi-nav-tab" data-tab="story">${svgScroll} Story</div>
            <div class="lumi-nav-tab" data-tab="lore">${svgGlobe} Lore</div>
            <div class="lumi-nav-tab" data-tab="links">${svgLink} Links</div>
        </div>
        
        <div id="tab-content">
            <div class="lumi-filters">
                <select id="filter-char" class="lumi-filter-select"><option value="">All Chars</option>${chars.map(c => `<option value="${escapeHtml(c)}" ${c===filterChar?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select>
                <select id="filter-date" class="lumi-filter-select"><option value="">All Dates</option>${dates.map(d => `<option value="${escapeHtml(d)}" ${d===filterDate?'selected':''}>${escapeHtml(d)}</option>`).join('')}</select>
                <select id="filter-loc" class="lumi-filter-select"><option value="">All Locs</option>${locs.map(l => `<option value="${escapeHtml(l)}" ${l===filterLoc?'selected':''}>${escapeHtml(l)}</option>`).join('')}</select>
            </div>
            <div class="lumi-action-row" style="margin-top:10px;"><button class="lumi-gen-btn" id="btn-open-gen">${svgPlus} Generate</button></div>
            <div id="gen-form-container" style="display:none;margin-bottom:15px;"></div>
            <div id="lumi-content"></div>
        </div>
    `);
    
    $('#filter-char, #filter-date, #filter-loc').on('change', function() { extension_settings[extensionName]._internal.filterChar = $('#filter-char').val(); extension_settings[extensionName]._internal.filterDate = $('#filter-date').val(); extension_settings[extensionName]._internal.filterLoc = $('#filter-loc').val(); SillyTavern.getContext().saveSettingsDebounced(); renderDashboard(); });
    $('#btn-open-gen').on('click', function() { if($('#gen-form-container').is(':visible')) $('#gen-form-container').slideUp(200); else { renderGeneratorForm(); $('#gen-form-container').slideDown(200); } });
    
    $('.lumi-nav-tab').on('click', function() {
        $('.lumi-nav-tab').removeClass('active'); $(this).addClass('active');
        const tab = $(this).data('tab');
        if(tab === 'diary') renderDiaryTab();
        else if(tab === 'story') renderStoryWeaver();
        else if(tab === 'lore') renderLoreExtractor();        else if(tab === 'links') renderMemoryLinks();
    });
    renderDiaryTab();
}

function renderDiaryTab() {
    const ctx = SillyTavern.getContext(); const currentBotId = ctx.characterId;
    const mems = loadMemories({ botId: currentBotId });
    const filterChar = extension_settings[extensionName]._internal.filterChar || '';
    const filterDate = extension_settings[extensionName]._internal.filterDate || '';
    const filterLoc = extension_settings[extensionName]._internal.filterLoc || '';
    let filteredMems = mems;
    if (filterChar) filteredMems = filteredMems.filter(m => m.character === filterChar);
    if (filterDate) filteredMems = filteredMems.filter(m => m.content.rp_date === filterDate);
    if (filterLoc) filteredMems = filteredMems.filter(m => m.content.rp_location === filterLoc);
    const byDate = {}; filteredMems.forEach(m => { const date = m.content.rp_date || 'Unknown Date'; if (!byDate[date]) byDate[date] = []; byDate[date].push(m); });
    const sortedDates = Object.keys(byDate).sort();
    
    let html = sortedDates.length === 0 ? `<div style="text-align:center;padding:60px 20px;animation:fadeIn 0.5s ease;"><div style="font-size:64px;margin-bottom:16px;opacity:0.3;color:var(--lumi-primary)">${svgCalendar}</div><div style="font-size:16px;color:#999;margin-bottom:8px">No memories yet</div></div>` : '';
    sortedDates.forEach(date => { const entries = byDate[date]; if (entries.length === 0) return; html += `<div class="lumi-timeline-date"><div style="font-size:13px;color:var(--lumi-secondary);font-weight:500;display:flex;align-items:center;gap:6px">${svgCalendar} ${date}</div></div>`; entries.forEach((m, idx) => { html += renderCard(m, idx); }); });
    $('#lumi-content').html(html); bindEvents();
}

function renderCard(m, index) {
    const showSecret = extension_settings[extensionName].diary.display.showSecretSystem;
    const isLocked = showSecret && checkUnlock(m) === false;
    const color = generateColor(m.character); const delay = index * 0.05;
    let lockOverlay = '';
    if(isLocked) lockOverlay = `<div style="position:absolute;inset:0;background:rgba(255,255,255,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;z-index:1;backdrop-filter:blur(5px);">${svgLock}<div style="font-size:11px;color:var(--lumi-secondary);margin-top:5px">Locked</div></div>`;
    
    const locHtml = m.content.rp_location ? `<span class="lumi-badge" style="cursor:default">${svgMapPin} ${escapeHtml(m.content.rp_location)}</span>` : '';
    const linkHtml = (m.meta.linkedIds && m.meta.linkedIds.length) ? `<span class="lumi-badge" data-links="${m.meta.linkedIds.join(',')}">${svgLink} ${m.meta.linkedIds.length}</span>` : '';
    const tagsHtml = (m.content.rp_tags && m.content.rp_tags.length) ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">${m.content.rp_tags.map(t=>`<span class="lumi-badge" style="font-size:10px;background:var(--lumi-bg);color:var(--lumi-primary)">${svgTag} ${t}</span>`).join('')}</div>` : '';
    const moodHtml = m.content.mood ? `<div style="font-size:11px;color:var(--lumi-secondary);margin-bottom:6px;font-style:italic;display:flex;align-items:center;gap:4px;">${svgMood} ${m.content.mood}</div>` : '';
    
    return `<div class="lumi-card" data-id="${m.id}" style="animation:fadeIn 0.4s ease ${delay}s both; ${isLocked?'opacity:0.7;':''}">${lockOverlay}<div class="lumi-meta"><span class="lumi-badge lumi-char-badge" style="background:${color};display:flex;align-items:center;gap:4px">${svgUser} ${m.character}</span>${locHtml}${linkHtml}</div>${moodHtml}${tagsHtml}<div class="lumi-text">${isLocked ? '...' : m.content.diary}</div><div class="lumi-actions"><button class="lumi-act ${m.meta.isPinned?'active':''}" data-act="pin">${svgPin}</button><button class="lumi-act ${m.meta.isFavorite?'active':''}" data-act="fav">${svgStar}</button><button class="lumi-act" data-act="edit-inline">${svgBook}</button><button class="lumi-act" data-act="edit-modal">${svgTag}</button><button class="lumi-act danger" data-act="del">${svgClose}</button></div></div>`;
}

function renderGeneratorForm() {
    $('#gen-form-container').html(`<div class="lumi-form"><label class="lumi-label">Scan Mode</label><div class="lumi-radio-group"><label class="lumi-radio-label"><input type="radio" name="gen-mode" value="latest" checked> Latest X</label><label class="lumi-radio-label"><input type="radio" name="gen-mode" value="first"> First X</label><label class="lumi-radio-label"><input type="radio" name="gen-mode" value="all"> All History</label></div><div id="gen-count-wrap" style="margin-bottom:10px;"><label class="lumi-label">Message Count</label><input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input"></div><button id="btn-run-gen" class="lumi-gen-btn" style="width:100%;justify-content:center">${svgPlus} Analyze & Generate</button></div>`);
    $('input[name="gen-mode"]').on('change', function() { $('#gen-count-wrap').toggle($(this).val() !== 'all'); });
    $('#btn-run-gen').on('click', generateBatchMemories);
}

// 📖 Story Weaver UI
function renderStoryWeaver() {
    const ctx = SillyTavern.getContext(); const mems = loadMemories({ botId: ctx.characterId }).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
    $('#lumi-content').html(`
        <div class="lumi-form">
            <label class="lumi-label">Story Settings</label>            <div class="lumi-set-row"><span>Include All Characters</span><input type="checkbox" id="sw-all-chars" checked style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
            <div class="lumi-set-row"><span>Chapter Length</span><select id="sw-chapters" class="lumi-input" style="width:100px"><option value="auto">Auto</option><option value="3">3 Chapters</option><option value="5">5 Chapters</option></select></div>
            <button id="btn-weave" class="lumi-gen-btn" style="width:100%;justify-content:center">${svgScroll} Weave Story</button>
        </div>
        <div id="sw-output" class="lumi-weaver-output" style="display:none;"></div>
        <div id="sw-actions" style="display:none;text-align:center;margin-top:10px;">
            <button id="btn-export-story" class="lumi-gen-btn" style="width:100%;justify-content:center">${svgBook} Export .md</button>
        </div>
    `);
    $('#btn-weave').on('click', async function() {
        $(this).html('<span class="lumi-loading"></span>Weaving...').prop('disabled', true);
        const story = await weaveStory(mems);
        $(this).html(`${svgScroll} Weave Story`).prop('disabled', false);
        if(story) {
            $('#sw-output').text(story).show();
            $('#sw-actions').show();
            $('#btn-export-story').off('click').on('click', () => exportText(story, 'LumiPulse_Story.md'));
        }
    });
}

async function weaveStory(mems) {
    const ctx = SillyTavern.getContext();
    const diaryText = mems.map(m => `[${m.character} | ${m.content.rp_date}] ${m.content.diary}`).join('\n\n');
    const prompt = `[System: You are a master chronicler. Weave these diary entries into a cohesive narrative story.]
Diaries:
${diaryText}

Rules:
1. Maintain chronological order.
2. Smooth transitions between entries.
3. Group into logical chapters.
4. Output as Markdown.
5. Keep original character voices but enhance flow.`;
    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        return res || "Failed to weave story.";
    } catch(e) { return "Error weaving story."; }
}

// 🌐 World Info Extractor UI
function renderLoreExtractor() {
    $('#lumi-content').html(`
        <div class="lumi-form">
            <label class="lumi-label">Lore Extraction</label>
            <p style="font-size:12px;color:#666;margin-bottom:10px;">Scan memories to generate SillyTavern-compatible World Info JSON.</p>
            <button id="btn-extract-lore" class="lumi-gen-btn" style="width:100%;justify-content:center">${svgGlobe} Extract Lore</button>
        </div>        <div id="lore-output" style="display:none;"></div>
    `);
    $('#btn-extract-lore').on('click', async function() {
        $(this).html('<span class="lumi-loading"></span>Extracting...').prop('disabled', true);
        const ctx = SillyTavern.getContext(); const mems = loadMemories({ botId: ctx.characterId });
        const lore = await extractLore(mems);
        $(this).html(`${svgGlobe} Extract Lore`).prop('disabled', false);
        if(lore && lore.entries && Object.keys(lore.entries).length) {
            let html = `<table class="lumi-lore-table"><tr><th>Keyword</th><th>Type</th><th>Content</th></tr>`;
            Object.values(lore.entries).forEach(l => html += `<tr><td><b>${escapeHtml(l.key[0])}</b></td><td>${l.comment}</td><td>${escapeHtml(l.content).slice(0,100)}...</td></tr>`);
            html += `</table><div style="text-align:center;margin-top:15px;"><button id="btn-export-lore" class="lumi-gen-btn" style="width:100%;justify-content:center">${svgBook} Export JSON</button></div>`;
            $('#lore-output').html(html).show();
            $('#btn-export-lore').off('click').on('click', () => exportJSON(lore, 'LumiPulse_Lorebook.json'));
        } else {
            $('#lore-output').html('<div style="text-align:center;padding:20px;color:#999;">No extractable lore found.</div>').show();
        }
    });
}

async function extractLore(mems) {
    const ctx = SillyTavern.getContext();
    const text = mems.map(m => `[${m.character}] ${m.content.diary}`).join('\n');
    const prompt = `[System: Extract World Info for SillyTavern Lorebook.]
Text:
${text}

Return ONLY JSON array of objects:
[{"keyword":"Name/Place/Item","type":"character|location|item|event|rule","content":"Brief description/context"}]`;
    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        const match = res?.match(/\[[\s\S]*\]/);
        if(!match) return { entries: {} };
        
        const aiData = JSON.parse(match[0]);
        const entries = {};
        aiData.forEach((item, index) => {
            entries[index] = {
                uid: index, key: [item.keyword], keysecondary: [], comment: item.type, content: item.content,
                constant: false, vectorized: false, selective: true, selectiveLogic: 0, addMemo: true,
                order: 10, position: 0, disable: false, ignoreBudget: false, excludeRecursion: false,
                preventRecursion: false, probability: 100, useProbability: true, depth: 4,
                group: "LumiPulse Extracted", groupWeight: 100, scanDepth: null, caseSensitive: null,
                matchWholeWords: null, displayIndex: index, matchPersonaDescription: false,
                matchCharacterDescription: false, matchCharacterPersonality: false,
                matchCharacterDepthPrompt: false, matchScenario: false, matchCreatorNotes: false,
                delayUntilRecursion: false, outletName: "", groupOverride: false, useGroupScoring: null,
                automationId: "", role: null, sticky: 0, cooldown: 0, delay: 0, triggers: [],
                characterFilter: { isExclude: false, names: [], tags: [] }            };
        });
        return { entries: entries };
    } catch(e) { return { entries: {} }; }
}

// 🔗 Memory Linking UI
function renderMemoryLinks() {
    const ctx = SillyTavern.getContext(); const mems = loadMemories({ botId: ctx.characterId });
    const linkedMems = mems.filter(m => m.meta.linkedIds && m.meta.linkedIds.length > 0);
    let html = linkedMems.length === 0 ? `<div style="text-align:center;padding:40px;color:#999;">No linked memories yet. Generate more to build connections.</div>` : '';
    linkedMems.forEach(m => {
        const links = m.meta.linkedIds.map(id => {
            const linked = mems.find(x => x.id === id);
            return linked ? `<div class="lumi-badge" style="margin:4px 0;cursor:pointer" data-id="${linked.id}">${svgLink} ${linked.character} | ${linked.content.rp_date}</div>` : '';
        }).join('');
        html += `<div class="lumi-card" style="margin-bottom:15px;"><div class="lumi-meta"><span class="lumi-badge lumi-char-badge">${m.character}</span><span class="lumi-badge">${m.content.rp_date}</span></div><div style="font-size:12px;color:#666;margin-bottom:8px;">Linked Memories:</div>${links}</div>`;
    });
    $('#lumi-content').html(html);
    $('.lumi-badge[data-id]').off('click').on('click', function() {
        const id = $(this).data('id');
        const mem = mems.find(m => m.id === id);
        if(mem) {
            $('#lumi-content').html(renderCard(mem, 0) + `<div style="text-align:center;margin-top:15px;"><button id="back-links" class="lumi-gen-btn" style="width:100%;justify-content:center">${svgBack} Back to Links</button></div>`);
            $('#back-links').off('click').on('click', () => renderMemoryLinks());
        }
    });
}

// ═══════════════════════════════════════════════
// FORUM MODE - ADVANCED FEATURES
// ═══════════════════════════════════════════════

function renderForum() {
    $('#lumi-body').data('current-tab', 'forum');
    $('#lumi-title').text('LumiPulse - Forum');
    const ctx = SillyTavern.getContext();
    const posts = extension_settings[extensionName].forumPosts || [];
    const chars = [...new Set(posts.map(p => p.author))].filter(c => c);
    
    $('#lumi-body').html(`
        <div style="background:linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary));padding:20px;border-radius:16px;margin-bottom:15px;box-shadow:0 4px 15px rgba(255,105,180,0.2);animation:slideIn 0.3s ease;">
            <div style="font-size:11px;color:rgba(255,255,255,0.9);margin-bottom:4px;display:flex;align-items:center;gap:6px">${svgComment} Forum</div>
            <div style="font-size:18px;color:white;font-weight:500">Community Discussions</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px">${posts.length} posts</div>
        </div>
        
        <div class="lumi-nav">
            <div class="lumi-nav-tab active" data-forum-tab="threads">${svgComment} Threads</div>
            <div class="lumi-nav-tab" data-forum-tab="network">${svgNetwork} Network</div>            <div class="lumi-nav-tab" data-forum-tab="analytics">${svgMood} Analytics</div>
        </div>
        
        <div class="lumi-action-row" style="margin-bottom:15px;">
            <div class="lumi-filters">
                <select id="forum-filter-char" class="lumi-filter-select"><option value="">All Characters</option>${chars.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
                <select id="forum-filter-type" class="lumi-filter-select"><option value="all">All Types</option><option value="public">Public</option><option value="private">Private</option><option value="faction">Faction</option></select>
            </div>
            <button class="lumi-gen-btn" id="btn-generate-forum" style="width:auto;padding:10px 20px;">${svgPlus} Generate</button>
        </div>
        
        <div class="lumi-form" style="margin-bottom:15px;">
            <label class="lumi-label">New Post</label>
            <textarea id="forum-post-input" class="lumi-post-input" placeholder="Share your thoughts..."></textarea>
            <div style="display:flex;gap:8px;">
                <select id="forum-post-type" class="lumi-filter-select" style="flex:1"><option value="public">Public</option><option value="private">Private</option></select>
                <button id="btn-submit-post" class="lumi-gen-btn" style="flex:2;width:auto;padding:10px 20px;">${svgPlus} Post</button>
            </div>
        </div>
        
        <div class="lumi-forum-container">
            <div class="lumi-forum-main" id="forum-main-content"></div>
            <div class="lumi-forum-sidebar" id="forum-sidebar">
                <div style="font-size:12px;font-weight:500;color:var(--lumi-secondary);margin-bottom:10px;">${svgNetwork} Character Network</div>
                <div id="network-nodes"></div>
            </div>
        </div>
    `);
    
    // ✅ Bind Events อย่างถูกต้อง
    $('#forum-filter-char, #forum-filter-type').on('change', function() { renderForumThreads(); });
    
    $('#btn-generate-forum').on('click', async function() {
        const $btn = $(this);
        $btn.html('<span class="lumi-loading"></span>Generating...').prop('disabled', true);
        await generateForumPosts();
        $btn.html(`${svgPlus} Generate`).prop('disabled', false);
    });
    
    $('#btn-submit-post').on('click', async function() {
        const $btn = $(this);
        $btn.html('<span class="lumi-loading"></span>Posting...').prop('disabled', true);
        await submitForumPost();
        $btn.html(`${svgPlus} Post`).prop('disabled', false);
    });
    
    $('.lumi-nav-tab').on('click', function() {
        $('.lumi-nav-tab').removeClass('active'); $(this).addClass('active');
        const tab = $(this).data('forum-tab');
        if(tab === 'threads') renderForumThreads();        else if(tab === 'network') renderForumNetwork();
        else if(tab === 'analytics') renderForumAnalytics();
    });
    
    renderForumThreads();
    renderForumNetwork();
}

function renderForumThreads() {
    const posts = extension_settings[extensionName].forumPosts || [];
    const filterChar = $('#forum-filter-char').val();
    const filterType = $('#forum-filter-type').val();
    let filtered = posts;
    if(filterChar) filtered = filtered.filter(p => p.author === filterChar);
    if(filterType !== 'all') filtered = filtered.filter(p => p.type === filterType);
    
    let html = '';
    const threads = groupPostsByThread(filtered);
    threads.forEach(thread => {
        html += `
            <div class="lumi-forum-thread">
                <div class="lumi-forum-header">
                    <div class="lumi-forum-title">${escapeHtml(thread.title)}</div>
                    <div class="lumi-forum-meta">${thread.posts.length} posts</div>
                </div>
                ${thread.posts.map(post => renderForumPost(post)).join('')}
            </div>
        `;
    });
    $('#forum-main-content').html(html || '<div style="text-align:center;padding:40px;color:#999;">No posts yet. Generate or create one!</div>');
}

function renderForumPost(post) {
    const isPlayer = post.author === 'Player';
    return `
        <div class="lumi-forum-post" style="${isPlayer ? 'border-left:3px solid var(--lumi-primary);' : ''}">
            <div class="lumi-forum-author">${isPlayer ? '👤 You' : escapeHtml(post.author)}</div>
            <div class="lumi-forum-content">${escapeHtml(post.content)}</div>
            <div style="font-size:10px;color:#888;margin-top:5px;">${new Date(post.timestamp).toLocaleString()}</div>
        </div>
    `;
}

function renderForumNetwork() {
    const posts = extension_settings[extensionName].forumPosts || [];
    const chars = [...new Set(posts.map(p => p.author))].filter(c => c && c !== 'Player');
    const connections = analyzeCharacterConnections(posts);
    
    let html = '<div style="font-size:12px;font-weight:500;color:var(--lumi-secondary);margin-bottom:10px;">Active Characters</div>';
    chars.forEach(char => {        const postCount = posts.filter(p => p.author === char).length;
        const affinity = connections[char] || 0;
        html += `
            <div class="lumi-network-node" data-char="${escapeHtml(char)}">
                <div style="font-size:11px;font-weight:500;">${escapeHtml(char)}</div>
                <div style="font-size:10px;color:#888;">${postCount} posts • Affinity: ${affinity}</div>
            </div>
        `;
    });
    $('#network-nodes').html(html);
    
    $('.lumi-network-node').off('click').on('click', function() {
        const char = $(this).data('char');
        showCharacterDetails(char);
    });
}

function renderForumAnalytics() {
    const posts = extension_settings[extensionName].forumPosts || [];
    const moodData = analyzeForumMoods(posts);
    
    let html = `
        <div style="padding:15px;">
            <div style="font-size:14px;font-weight:500;color:var(--lumi-secondary);margin-bottom:15px;">${svgMood} Forum Mood Analytics</div>
            <div class="lumi-stats-bar">
                <div class="lumi-stat"><b>${posts.length}</b><span>Total Posts</span></div>
                <div class="lumi-stat"><b>${Object.keys(moodData).length}</b><span>Moods</span></div>
            </div>
            <div style="margin-top:15px;">
                ${Object.entries(moodData).map(([mood, count]) => `
                    <div style="margin:8px 0;padding:10px;background:var(--lumi-bg);border-radius:8px;">
                        <div style="display:flex;justify-content:space-between;font-size:12px;">
                            <span>${mood}</span>
                            <span style="color:var(--lumi-primary);font-weight:500;">${count} posts</span>
                        </div>
                        <div style="height:6px;background:var(--lumi-border);border-radius:3px;margin-top:5px;overflow:hidden;">
                            <div style="height:100%;background:var(--lumi-primary);width:${(count/posts.length)*100}%;transition:width 0.3s;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    $('#forum-main-content').html(html);
}

function groupPostsByThread(posts) {
    const threads = {};
    posts.forEach(post => {
        if(!threads[post.threadId]) threads[post.threadId] = { title: post.threadTitle, posts: [] };        threads[post.threadId].posts.push(post);
    });
    return Object.values(threads).sort((a,b) => b.posts.length - a.posts.length);
}

function analyzeCharacterConnections(posts) {
    const connections = {};
    posts.forEach(post => {
        if(post.author && post.author !== 'Player') {
            connections[post.author] = (connections[post.author] || 0) + 1;
        }
    });
    return connections;
}

function analyzeForumMoods(posts) {
    const moods = {};
    posts.forEach(post => {
        const mood = detectMood(post.content);
        moods[mood] = (moods[mood] || 0) + 1;
    });
    return moods;
}

function detectMood(text) {
    const lower = text.toLowerCase();
    if(lower.match(/(รัก|ชอบ|สุข|ดีใจ|happy|love)/)) return 'Happy';
    if(lower.match(/(โกรธ|ไม่พอใจ|angry|hate)/)) return 'Angry';
    if(lower.match(/(เศร้า|เสียใจ|sad|cry)/)) return 'Sad';
    if(lower.match(/(กลัว|worried|fear)/)) return 'Anxious';
    return 'Neutral';
}

function showCharacterDetails(char) {
    const posts = extension_settings[extensionName].forumPosts || [];
    const charPosts = posts.filter(p => p.author === char);
    const affinity = calculateAffinity(char);
    
    $('#forum-main-content').html(`
        <div style="padding:15px;">
            <button id="back-to-network" class="lumi-btn" style="margin-bottom:15px;">${svgBack} Back</button>
            <div style="font-size:16px;font-weight:500;color:var(--lumi-secondary);margin-bottom:10px;">${escapeHtml(char)}</div>
            <div class="lumi-stats-bar" style="margin-bottom:15px;">
                <div class="lumi-stat"><b>${charPosts.length}</b><span>Posts</span></div>
                <div class="lumi-stat"><b>${affinity}</b><span>Affinity</span></div>
            </div>
            <div style="font-size:12px;color:#666;margin-bottom:10px;">Recent Posts:</div>
            ${charPosts.slice(-5).map(post => renderForumPost(post)).join('')}
        </div>
    `);    
    $('#back-to-network').on('click', () => renderForumNetwork());
}

function calculateAffinity(char) {
    const posts = extension_settings[extensionName].forumPosts || [];
    const charPosts = posts.filter(p => p.author === char);
    return Math.min(100, charPosts.length * 5);
}

// ✅ Generate Forum Posts - ทำงานจริง
async function generateForumPosts() {
    const ctx = SillyTavern.getContext();
    const chat = ctx.chat || [];
    const recentChat = chat.slice(-20);
    const characters = [...new Set(recentChat.filter(m => m.name && !m.is_user).map(m => m.name))];
    
    if(characters.length === 0) {
        showToast('No characters in recent chat to generate forum posts');
        return false;
    }
    
    const prompt = `[System: Generate forum discussions based on recent chat events.]
Recent Chat:
${recentChat.map(m => `[${m.is_user ? 'User' : m.name}]: ${m.mes.slice(0,100)}`).join('\n')}

Characters: ${characters.join(', ')}

Generate 2-3 forum posts from different characters discussing recent events. Each post should:
1. Reflect the character's personality
2. React to events in the chat
3. Show their perspective and emotions

Return JSON array:
[{"author":"Character Name","threadId":"1","threadTitle":"Topic Title","content":"Post content","type":"public|private","mood":"Happy|Angry|Sad|Neutral","timestamp":"${new Date().toISOString()}"}]`;

    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        
        if(!res) { showToast('Failed to generate forum posts'); return false; }
        const match = res.match(/\[[\s\S]*\]/);
        if(!match) { showToast('Invalid response format'); return false; }
        
        const newPosts = JSON.parse(match[0]);
        const s = extension_settings[extensionName];
        s.forumPosts = [...(s.forumPosts || []), ...newPosts].slice(-s.forum.storage.max);
        SillyTavern.getContext().saveSettingsDebounced();
                showToast(`Generated ${newPosts.length} forum posts!`);
        renderForum();
        return true;
    } catch(e) {
        console.error(e);
        showToast('Error generating forum posts');
        return false;
    }
}

// ✅ Submit Forum Post - ทำงานจริง
async function submitForumPost() {
    const content = $('#forum-post-input').val().trim();
    const type = $('#forum-post-type').val();
    if(!content) { showToast('Please enter post content'); return false; }
    
    const s = extension_settings[extensionName];
    const newPost = {
        id: 'post_' + Date.now(),
        author: 'Player',
        threadId: 'player_' + Date.now(),
        threadTitle: 'Player Discussion',
        content: content,
        type: type,
        mood: 'Neutral',
        timestamp: new Date().toISOString(),
        replies: []
    };
    
    s.forumPosts = [...(s.forumPosts || []), newPost].slice(-s.forum.storage.max);
    SillyTavern.getContext().saveSettingsDebounced();
    
    $('#forum-post-input').val('');
    showToast('Post submitted!');
    renderForum();
    return true;
}

function setupForumAutoTrigger() {
    $(document).on('messageReceived', async function() {
        const s = extension_settings[extensionName];
        const cfg = s.forum.autoGen;
        if(!cfg.enabled) return;
        
        s._internal.forumMessageCounter = (s._internal.forumMessageCounter || 0) + 1;
        const now = Date.now();
        const timeSinceLastGen = now - (s._internal.lastForumGenTime || 0);
        
        let shouldGenerate = false;
                if(cfg.messageInterval && s._internal.forumMessageCounter >= cfg.messageInterval) {
            shouldGenerate = true;
            s._internal.forumMessageCounter = 0;
        }
        
        if(cfg.timeInterval && timeSinceLastGen >= (cfg.timeInterval * 60 * 1000)) {
            shouldGenerate = true;
            s._internal.lastForumGenTime = now;
        }
        
        if(cfg.onImportantEvent) {
            const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
            const importantKeywords = ['รัก', 'แต่งงาน', 'ตาย', 'เจ็บ', 'สำคัญ', 'ความลับ', 'งานเลี้ยง'];
            if(importantKeywords.some(k => lastMsg.includes(k))) {
                shouldGenerate = true;
            }
        }
        
        if(shouldGenerate && s.forum.mode === 'auto') {
            await generateForumPosts();
        }
    });
}

// ═══════════════════════════════════════════════
// 6. AI BATCH GENERATION (Diary)
// ═══════════════════════════════════════════════
async function generateBatchMemories() {
    const mode = $('input[name="gen-mode"]:checked').val(); const count = parseInt($('#gen-count').val()) || 30;
    $('#btn-run-gen').html('<span class="lumi-loading"></span>Thinking...').prop('disabled', true);
    const results = await callAIBatch(mode, count);
    $('#btn-run-gen').html(`${svgPlus} Analyze & Generate`).prop('disabled', false); $('#gen-form-container').slideUp(200);
    if(results && results.length > 0) {
        const ctx = SillyTavern.getContext(); const wm = extension_settings[extensionName].diary.worldMode === 'auto' ? detectWorldMode() : extension_settings[extensionName].diary.worldMode; const botId = ctx.characterId;
        results.forEach(res => saveMemory({ id: 'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), timestamp: new Date().toISOString(), character: res.character || ctx.name2 || "Character", botId: botId, worldMode: wm, content: { ...res }, meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, refRange: res.refRange, linkedIds: res.linkedIds || [], tags: extractTags(res.diary) } }));
        showToast(`${svgStar} Created ${results.length} memories!`); renderDiaryTab();
    } else { showToast(`${svgClose} No significant memories found`); }
}

async function callAIBatch(mode, count) {
    const ctx = SillyTavern.getContext(); const allChat = ctx.chat || [];
    let chatSlice, startIndex = 0, endIndex = 0;
    if(mode === 'latest') { chatSlice = allChat.slice(-count); startIndex = Math.max(0, allChat.length - count); endIndex = allChat.length; }
    else if(mode === 'first') { chatSlice = allChat.slice(0, count); startIndex = 0; endIndex = count; }
    else { chatSlice = allChat.filter(m => m.mes && m.mes.length > 15).slice(-120); startIndex = Math.max(0, allChat.length - 120); endIndex = allChat.length; }

    const cleanChat = chatSlice.filter(m => m.mes && m.mes.length > 10);
    const chatLog = cleanChat.map((m, i) => `[${m.is_user ? 'User' : (m.name || 'NPC')}]: ${m.mes.slice(0, 60)}`).join('\n');
    
    const botMems = loadMemories({ botId: ctx.characterId });    const prevTopics = botMems.slice(0, 10).map(m => `- [${m.character}] ${m.content.rp_date} @ ${m.content.rp_location}: ${m.content.diary.slice(0, 50)}...`).join('\n');
    const registryList = Object.keys(extension_settings[extensionName]._internal.nameRegistry || {}).join(', ');

    const prompt = `[System: Analyze chat to create UNIQUE diary entries.]
[Scanning Range: Message #${startIndex+1}-#${endIndex}]
[Registered Names: ${registryList || "None"}]
[PREVIOUSLY WRITTEN (DO NOT REPEAT):
${prevTopics || "None"}]

Chat Log:
${chatLog}

Rules:
1. Focus ONLY on events within #${startIndex+1}-#${endIndex}.
2. Return refRange: {start: ${startIndex+1}, end: ${endIndex}}.
3. Link to related existing memory IDs if applicable.
4. Date MUST be numeric Thai format.
5. Include context tags.
6. Return ONLY JSON ARRAY:
[{"character":"Name","rp_date":"Date","rp_location":"Loc","rp_tags":["#Tag"],"mood":"Mood","diary":"Thai text 2-4 sentences.","isSecret":false,"refRange":{"start":0,"end":0},"linkedIds":[]}]`;

    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        if (!res) return [];
        const match = res.match(/\[[\s\S]*\]/); return match ? JSON.parse(match[0]) : [];
    } catch (e) { console.error(e); return []; }
}

// ═══════════════════════════════════════════════
// 7. AUTO-TRIGGER (Diary)
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() { $(document).off('messageReceived', onNewChat).on('messageReceived', onNewChat); }
async function onNewChat() {
    const s = extension_settings[extensionName], cfg = s.diary.autoGen; if (!cfg.enabled) return;
    s._internal.messageCounter++; const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
    let gen = false;
    if (cfg.triggerType === 'turn_count' && s._internal.messageCounter >= cfg.turnInterval) { gen=true; s._internal.messageCounter=0; }
    else if (cfg.triggerType === 'emotion' && cfg.emotionKeywords.some(k => lastMsg.includes(k))) { gen=true; }
    else if (cfg.triggerType === 'random' && Math.random() < cfg.randomChance) { gen=true; }
    if (gen) {
        const results = await callAIBatch('latest', cfg.turnInterval || 20);
        if(results && results.length > 0) {
            const ctx = SillyTavern.getContext(); const wm = s.diary.worldMode === 'auto' ? detectWorldMode() : s.diary.worldMode; const botId = ctx.characterId;
            results.forEach(res => saveMemory({ id: 'mem_auto_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), timestamp: new Date().toISOString(), character: res.character || ctx.name2 || "Character", botId: botId, worldMode: wm, content: { ...res }, meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, refRange: res.refRange, linkedIds: res.linkedIds || [], tags: extractTags(res.diary) } }));
        }
    }
}
// ═══════════════════════════════════════════════
// 8. HELPERS & UTILS
// ═══════════════════════════════════════════════
function loadMemories(filter = {}) {
    let mem = [...(extension_settings[extensionName].memories || [])];
    if (filter.botId) mem = mem.filter(m => m.botId === filter.botId || !m.botId);
    if (filter.character) mem = mem.filter(m => m.character === filter.character);
    return mem.sort((a,b) => (b.meta.isPinned?1:0) - (a.meta.isPinned?1:0) || new Date(b.timestamp) - new Date(a.timestamp));
}

function saveMemory(entry) {
    const s = extension_settings[extensionName];
    if(!s._internal.nameRegistry) s._internal.nameRegistry = {};
    let cleanName = entry.character.replace(/[()（）\[\]]/g, '').trim();
    let canonName = cleanName;
    for(let regName in s._internal.nameRegistry) { if(similarityScore(cleanName, regName) > 90) { canonName = regName; break; } }
    s._internal.nameRegistry[canonName] = true;
    entry.character = canonName;
    const charMems = s.memories.filter(m => m.character === canonName);
    const isDuplicate = charMems.some(m => similarityScore(m.content.diary, entry.content.diary) > 85);
    if (isDuplicate) return;
    s.memories.unshift(entry);
    if (s.memories.length > s.diary.storage.max) s.memories = s.memories.slice(0, s.diary.storage.max);
    SillyTavern.getContext().saveSettingsDebounced();
}

function detectWorldMode() { const chat = SillyTavern.getContext().chat || []; const names = new Set(); chat.slice(-50).forEach(m => { if (m.name && !m.is_user && !m.is_system) names.add(m.name); }); return names.size > 2 ? 'rpg' : 'solo'; }
function generateColor(str) { const colors = ['#FFB6C1', '#E6D5F0', '#B6D7F0', '#B6F0D7', '#F0E6B6', '#F0B6D7']; let hash = 0; for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash); return colors[Math.abs(hash) % colors.length]; }
function escapeHtml(str) { if (typeof str !== 'string') return ''; return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function extractTags(text) { const tags = [], kw = { '#Romantic':['รัก','หัวใจ'],'#Drama':['เสียใจ','ร้องไห้'] }, l = text.toLowerCase(); for(const[k,v]of Object.entries(kw)) if(v.some(w=>l.includes(w))) tags.push(k); return tags; }
function showToast(msg) { const t = document.createElement('div'); t.className = 'lumi-toast'; t.innerHTML = msg; document.body.appendChild(t); setTimeout(()=>t.remove(), 2000); }
function checkUnlock(m) { if(!m.meta.isSecret) return true; if(!extension_settings[extensionName].diary.display.showSecretSystem) return true; const mode = extension_settings[extensionName].diary.display.secretMode; if(mode === 'time') return (Date.now() - new Date(m.timestamp)) > 86400000 * 3; if(mode === 'affection') return (m.content.affection_score || 0) >= 80; return false; }
function exportText(content, filename) { const blob = new Blob([content], {type: 'text/markdown'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); showToast('Exported!'); }
function exportJSON(data, filename) { const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); showToast('Exported!'); }

function bindEvents() {
    $('.lumi-act').off('click').on('click', function(e) {
        e.stopPropagation(); const id = $(this).closest('.lumi-card').data('id'); const act = $(this).data('act'); const mem = extension_settings[extensionName].memories.find(m => m.id === id); if(!mem) return;
        if(act === 'pin') { mem.meta.isPinned = !mem.meta.isPinned; SillyTavern.getContext().saveSettingsDebounced(); renderDiaryTab(); }
        if(act === 'fav') { mem.meta.isFavorite = !mem.meta.isFavorite; SillyTavern.getContext().saveSettingsDebounced(); renderDiaryTab(); }
        if(act === 'edit-inline') { editMemoryInline(id); }
        if(act === 'edit-modal') { editMemoryModal(id); }
        if(act === 'del') { if(confirm('Delete?')) { extension_settings[extensionName].memories = extension_settings[extensionName].memories.filter(m => m.id !== id); SillyTavern.getContext().saveSettingsDebounced(); renderDiaryTab(); } }
    });
}

function createSettingsPanel() { if ($('#lumi-panel').length) return; $('#extensions_settings').append(`<div id="lumi-panel" class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color:var(--lumi-primary);font-family:'Mitr';font-weight:300;">LumiPulse</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="display:none;"></div></div>`); }

function levenshteinDistance(str1, str2) { const m = str1.length, n = str2.length; const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0)); for (let i = 0; i <= m; i++) dp[i][0] = i; for (let j = 0; j <= n; j++) dp[0][j] = j; for (let i = 1; i <= m; i++) { for (let j = 1; j <= n; j++) { if (str1[i-1] === str2[j-1]) dp[i][j] = dp[i-1][j-1]; else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]); } } return dp[m][n]; }
function similarityScore(str1, str2) { const s1 = str1.toLowerCase().trim(); const s2 = str2.toLowerCase().trim(); const distance = levenshteinDistance(s1, s2); const maxLen = Math.max(s1.length, s2.length); return maxLen === 0 ? 100 : ((maxLen - distance) / maxLen) * 100; }
function editMemoryInline(id) { const mem = extension_settings[extensionName].memories.find(m => m.id === id); if (!mem) return; const card = $(`.lumi-card[data-id="${id}"]`); card.find('.lumi-text').html(`<textarea class="lumi-edit-textarea" style="width:100%;min-height:80px;padding:10px;border:1px solid var(--lumi-border);border-radius:10px;font-family:'Mitr';font-size:13px;resize:vertical;color:var(--lumi-text);background:var(--lumi-card)">${mem.content.diary}</textarea><div style="margin-top:8px;display:flex;gap:8px"><button class="lumi-btn-save" style="flex:1;background:var(--lumi-primary);color:white;border:none;padding:8px;border-radius:8px;cursor:pointer">Save</button><button class="lumi-btn-cancel" style="flex:1;background:#FFE0E0;color:var(--lumi-danger);border:none;padding:8px;border-radius:8px;cursor:pointer">Cancel</button></div>`); card.find('.lumi-btn-save').on('click', function() { mem.content.diary = card.find('.lumi-edit-textarea').val(); SillyTavern.getContext().saveSettingsDebounced(); renderDiaryTab(); showToast('Updated!'); }); card.find('.lumi-btn-cancel').on('click', function() { renderDiaryTab(); }); }
function editMemoryModal(id) { const mem = extension_settings[extensionName].memories.find(m => m.id === id); if (!mem) return; $('#lumi-title').text('Edit Memory'); $('#lumi-body').html(`<div style="padding:15px;"><div class="lumi-form"><label class="lumi-label">Character</label><input type="text" id="edit-char" value="${mem.character}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Date (RP)</label><input type="text" id="edit-date" value="${mem.content.rp_date||''}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Location</label><input type="text" id="edit-loc" value="${mem.content.rp_location||''}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Tags</label><input type="text" id="edit-tags" value="${(mem.content.rp_tags||[]).join(', ')}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Diary</label><textarea id="edit-diary" class="lumi-input" style="min-height:150px;resize:vertical">${mem.content.diary}</textarea></div><div style="display:flex;gap:10px"><button id="btn-save-edit" class="lumi-gen-btn" style="flex:2">Save</button><button id="btn-cancel-edit" class="lumi-input" style="flex:1;background:#FFE0E0;color:var(--lumi-danger);text-align:center;cursor:pointer">Cancel</button></div></div>`); $('#btn-save-edit').on('click', function() { mem.character = $('#edit-char').val(); mem.content.rp_date = $('#edit-date').val(); mem.content.rp_location = $('#edit-loc').val(); mem.content.rp_tags = $('#edit-tags').val().split(',').map(t=>t.trim()).filter(t=>t); mem.content.diary = $('#edit-diary').val(); SillyTavern.getContext().saveSettingsDebounced(); renderDashboard(); showToast('Updated!'); }); $('#btn-cancel-edit').on('click', function() { renderDashboard(); }); }

// ═══════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════
function renderSettings() {
    $('#lumi-title').text('LumiPulse - Settings');
    $('#lumi-body').data('current-tab', 'settings');
    const s = extension_settings[extensionName]; 
    const ag = s.diary.autoGen; 
    const fg = s.forum.autoGen;
    const savedTheme = s._internal.theme || 'pink';
    
    $('#lumi-body').html(`
        <div style="padding:10px;">
            <div class="lumi-form"><label class="lumi-label">Theme</label><select id="set-theme" class="lumi-input">${Object.entries(themes).map(([k,v]) => `<option value="${k}" ${k===savedTheme?'selected':''}>${v.name}</option>`).join('')}</select></div>
            
            <div class="lumi-form">
                <label class="lumi-label">General</label>
                <div class="lumi-set-row"><span>Extension Enabled</span><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>World Mode</span><select id="set-wm" class="lumi-input" style="width:100px"><option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option><option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option><option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option></select></div>
            </div>

            <div class="lumi-form">
                <label class="lumi-label">Diary Auto-Generation</label>
                <div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="ag-en" ${ag.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>Trigger</span><select id="ag-tr" class="lumi-input" style="width:110px"><option value="turn_count" ${ag.triggerType==='turn_count'?'selected':''}>Every X Msgs</option><option value="emotion" ${ag.triggerType==='emotion'?'selected':''}>Emotion Keywords</option><option value="random" ${ag.triggerType==='random'?'selected':''}>Random</option></select></div>
                <div id="ag-val-wrap" style="margin-top:8px">
                    ${ag.triggerType==='turn_count' ? `<span style="font-size:12px;color:#666">Interval:</span> <input type="number" id="ag-int" value="${ag.turnInterval}" min="5" max="100" style="width:60px;background:var(--lumi-card);border:1px solid var(--lumi-border);border-radius:6px;padding:4px;color:var(--lumi-text);font-family:'Mitr'">` : ''}
                    ${ag.triggerType==='random' ? `<span style="font-size:12px;color:#666">Chance %:</span> <input type="number" id="ag-chance" value="${Math.round(ag.randomChance*100)}" min="1" max="50" style="width:60px;background:var(--lumi-card);border:1px solid var(--lumi-border);border-radius:6px;padding:4px;color:var(--lumi-text);font-family:'Mitr'">` : ''}
                    ${ag.triggerType==='emotion' ? `<label style="font-size:12px;color:#666">Keywords:</label><input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" placeholder="รัก,โกรธ..." style="width:100%;margin-top:4px;background:var(--lumi-card);border:1px solid var(--lumi-border);border-radius:6px;padding:6px;color:var(--lumi-text);font-family:'Mitr'">` : ''}
                </div>
            </div>

            <div class="lumi-form">
                <label class="lumi-label">Forum Settings</label>
                <div class="lumi-set-row"><span>Forum Enabled</span><input type="checkbox" id="forum-en" ${s.forum.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>Connect to RP</span><input type="checkbox" id="forum-rp" ${s.forum.rpConnected?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>Mode</span><select id="forum-mode" class="lumi-input" style="width:110px"><option value="auto" ${s.forum.mode==='auto'?'selected':''}>Auto</option><option value="realtime" ${s.forum.mode==='realtime'?'selected':''}>Real-time</option><option value="turnbased" ${s.forum.mode==='turnbased'?'selected':''}>Turn-based</option></select></div>
                <div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--lumi-border);">
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:6px;">Auto-Generate Triggers:</label>
                    <div class="lumi-set-row"><span>Every X Messages</span><input type="number" id="forum-msg-int" value="${fg.messageInterval}" min="1" max="50" style="width:60px;background:var(--lumi-card);border:1px solid var(--lumi-border);border-radius:6px;padding:4px;color:var(--lumi-text);font-family:'Mitr'"></div>
                    <div class="lumi-set-row"><span>Every X Minutes</span><input type="number" id="forum-time-int" value="${fg.timeInterval}" min="1" max="60" style="width:60px;background:var(--lumi-card);border:1px solid var(--lumi-border);border-radius:6px;padding:4px;color:var(--lumi-text);font-family:'Mitr'"></div>
                    <div class="lumi-set-row"><span>On Important Event</span><input type="checkbox" id="forum-event" ${fg.onImportantEvent?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                </div>
            </div>

            <div class="lumi-form">                <label class="lumi-label">Secret System</label>
                <div class="lumi-set-row"><span>Enable Secret Mode</span><input type="checkbox" id="set-sec-en" ${s.diary.display.showSecretSystem?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
                <div class="lumi-set-row"><span>Unlock Rule</span><select id="set-sec-mode" class="lumi-input" style="width:110px"><option value="ai" ${s.diary.display.secretMode==='ai'?'selected':''}>AI Decide</option><option value="time" ${s.diary.display.secretMode==='time'?'selected':''}>Time (3 days)</option><option value="affection" ${s.diary.display.secretMode==='affection'?'selected':''}>Affection ≥ 80</option></select></div>
            </div>

            <div style="margin-top:15px;display:flex;gap:10px">
                <button id="btn-rst" class="lumi-input" style="background:#FFE0E0;color:var(--lumi-secondary);text-align:center;cursor:pointer">${svgBack} Reset FAB</button>
                <button id="btn-clr" class="lumi-input" style="background:var(--lumi-danger) !important; color:white !important; text-align:center; cursor:pointer; border:none;">${svgClose} Clear Data</button>
            </div>
        </div>
    `);
    
    $('#set-theme').on('change', function() { s._internal.theme = $(this).val(); applyTheme($(this).val()); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-en').on('change', function(){ s.isEnabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-wm').on('change', function(){ s.diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#ag-en').on('change', function(){ s.diary.autoGen.enabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#ag-tr').on('change', function() { s.diary.autoGen.triggerType = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); renderSettings(); });
    $('#ag-int').on('change', function(){ s.diary.autoGen.turnInterval = parseInt($(this).val()) || 20; SillyTavern.getContext().saveSettingsDebounced(); });
    $('#ag-chance').on('change', function(){ s.diary.autoGen.randomChance = (parseInt($(this).val()) || 10) / 100; SillyTavern.getContext().saveSettingsDebounced(); });
    $('#ag-kw').on('change', function(){ s.diary.autoGen.emotionKeywords = $(this).val().split(',').map(k=>k.trim()).filter(k=>k); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#forum-en').on('change', function(){ s.forum.enabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#forum-rp').on('change', function(){ s.forum.rpConnected = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#forum-mode').on('change', function(){ s.forum.mode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#forum-msg-int').on('change', function(){ s.forum.autoGen.messageInterval = parseInt($(this).val()) || 10; SillyTavern.getContext().saveSettingsDebounced(); });
    $('#forum-time-int').on('change', function(){ s.forum.autoGen.timeInterval = parseInt($(this).val()) || 5; SillyTavern.getContext().saveSettingsDebounced(); });
    $('#forum-event').on('change', function(){ s.forum.autoGen.onImportantEvent = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#set-sec-en').on('change', function(){ s.diary.display.showSecretSystem = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-sec-mode').on('change', function(){ s.diary.display.secretMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#btn-rst').on('click', ()=>{ s._internal.fabPos = null; SillyTavern.getContext().saveSettingsDebounced(); $('#lumi-fab').remove(); spawnLumiButton(); });
    $('#btn-clr').on('click', ()=>{ if(confirm('Clear all memories, forum posts & settings?')) { s.memories=[]; s.forumPosts=[]; s._internal.fabPos=null; s._internal.nameRegistry={}; SillyTavern.getContext().saveSettingsDebounced(); $('#lumi-fab').remove(); spawnLumiButton(); } });
}
