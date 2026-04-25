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
        filterChar: '', filterDate: '', filterLoc: '',
        nameRegistry: {},
        forumAutoCounter: 0,
        lastForumAutoGen: 0
    },
    diary: {
        worldMode: 'auto',
        display: { secretMode: 'ai', showSecretSystem: true },
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'], randomChance: 0.08 },
        storage: { max: 150 }
    },
    forum: { 
        enabled: true,
        mode: 'separate', 
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 10, timeInterval: 5, eventChance: 0.3, randomChance: 0.1 },
        storage: { max: 200 }
    },
    features: { storyWeaver: true, loreExtractor: true, memoryLinking: true, forumMode: true }
};

let extension_settings = {};

const btnUrl       = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconSettings = "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png";
const iconForum    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png"; 

const svgHeart    = `<svg viewBox="0 0 24 24" fill="none" width="40" height="40"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF69B4"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgClose    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
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
const svgForum    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const svgNetwork  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="9.6" y1="7.4" x2="7.4" y2="16.6"/><line x1="14.4" y1="7.4" x2="16.6" y2="16.6"/><line x1="8" y1="19" x2="16" y2="19"/></svg>`;
const svgComment  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const svgRumor    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

const themes = {
    pink: { name: 'Pink Pastel', primary: '#FFB6C1', secondary: '#FF69B4', bg: '#FFF0F5', card: '#FFFBFC', text: '#2A2A2A', border: '#FFE8EE', danger: '#D32F2F' },
    purple: { name: 'Purple Dream', primary: '#E6D5F0', secondary: '#9B7ED9', bg: '#F5F0FA', card: '#FAF7FC', text: '#2A2A2A', border: '#E8D8F0', danger: '#C62828' },
    ocean: { name: 'Ocean Blue', primary: '#B6D7F0', secondary: '#4A9FD9', bg: '#F0F7FA', card: '#F7FBFC', text: '#2A2A2A', border: '#D8E8F0', danger: '#B71C1C' },
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
    if (!ctx.extensionSettings[extensionName]) {
        ctx.extensionSettings[extensionName] = JSON.parse(JSON.stringify(defaultSettings));
        ctx.saveSettingsDebounced();
    }
    extension_settings = ctx.extensionSettings;
    
    applyTheme(extension_settings[extensionName]._internal.theme || 'pink');
    
    // ✅ ใช้วิธี "ฉีด CSS เข้าไปตรงๆ" เหมือนโค้ดเก่า เพื่อความเสถียร
    injectStyles(); 
    
    // สร้าง Settings Panel ก่อนเสมอ
    createSettingsPanel();
    
    if (extension_settings[extensionName].isEnabled) {
        setTimeout(() => { 
            spawnLumiButton(); 
            createModal(); 
            setupAutoTriggerListener(); 
        }, 800);
    }
}

// ═══════════════════════════════════════════════
// 3. UI RENDERING (คืนชีพ: CSS ในตัว)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const s = document.createElement('style');
    s.id = 'lumi-styles';
    // ✅ นำ CSS ทั้งหมดกลับมาใส่ในไฟล์นี้ เพื่อความชัวร์ 100%
    s.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
        :root { --lumi-primary: #FFB6C1; --lumi-secondary: #FF69B4; --lumi-bg: #FFF0F5; --lumi-card: #FFFBFC; --lumi-text: #2A2A2A; --lumi-border: #FFE8EE; --lumi-danger: #D32F2F; --lumi-glass: rgba(255, 255, 255, 0.9); }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes heartFloat { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes highlightPulse { 0% { background: rgba(255,182,193,0.4); } 100% { background: transparent; } }

        /* === FAB BUTTON === */
        #lumi-fab {
            position: fixed !important;
            top: 50% !important;
            right: 20px !important;
            transform: translateY(-50%) !important;
            z-index: 2147483647 !important;
            width: 48px !important;
            height: 48px !important;
            border-radius: 50% !important;
            background: var(--lumi-glass) url('https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png') no-repeat center center !important;
            background-size: 26px !important;
            border: 2px solid #FFB6C1 !important;
            box-shadow: 0 4px 15px rgba(255,105,180,0.4) !important;
            cursor: grab !important;
            touch-action: none !important;
            user-select: none !important;
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transition: transform 0.2s ease !important;
        }
        #lumi-fab:active { cursor: grabbing !important; transform: translateY(-50%) scale(0.95) !important; }

        /* === MENU === */
        .lumi-menu { position: fixed; z-index: 2147483646; display: none; background: rgba(255,255,255,0.98); backdrop-filter: blur(15px); border-radius: 20px; padding: 15px; border: 1px solid rgba(255,182,193,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-family: 'Mitr'; min-width: 200px; }
        .lumi-menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; opacity: 0.85; transition: 0.2s; padding: 10px; border-radius: 12px; }
        .lumi-menu-item:hover { opacity: 1; background: var(--lumi-bg); }
        .lumi-menu-item img, .lumi-menu-item svg { width: 40px; height: 40px; object-fit: contain; }
        .lumi-menu-item span { font-size: 11px; color: #666; }

        /* === MODAL === */
        .lumi-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal { width: 94%; max-width: 500px; height: 88vh; background: var(--lumi-card); border-radius: 24px; border: 1px solid var(--lumi-border); box-shadow: 0 20px 50px rgba(255,105,180,0.2); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr'; animation: popIn 0.3s; }
        .lumi-head { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--lumi-border); background: var(--lumi-bg); }
        .lumi-head h3 { margin: 0; font-size: 16px; color: var(--lumi-secondary); font-weight: 400; }
        .lumi-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--lumi-bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--lumi-primary); transition: 0.2s; }
        .lumi-btn:hover { background: var(--lumi-border); }
        .lumi-body { flex: 1; overflow-y: auto; padding: 15px; background: var(--lumi-card); color: var(--lumi-text); }

        /* === TABS & NAV === */
        .lumi-nav { display: flex; gap: 8px; margin-bottom: 15px; width: 100%; }
        .lumi-nav-tab { flex: 1; text-align: center; padding: 10px 5px; border-radius: 12px; background: var(--lumi-bg); border: 1px solid var(--lumi-border); color: var(--lumi-primary); font-size: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .lumi-nav-tab.active { background: var(--lumi-primary); color: white; border-color: var(--lumi-primary); }
        .lumi-nav-tab:hover { background: var(--lumi-border); }

        /* === STATS & FILTERS === */
        .lumi-stats-bar { display: flex; gap: 10px; margin-bottom: 15px; background: var(--lumi-bg); padding: 12px; border-radius: 14px; border: 1px solid var(--lumi-border); }
        .lumi-stat { flex: 1; text-align: center; }
        .lumi-stat b { display: block; font-size: 18px; color: var(--lumi-secondary); font-weight: 500; }
        .lumi-stat span { font-size: 10px; color: #777; }

        .lumi-action-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .lumi-filters { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; }
        .lumi-filter-select { flex: 1; min-width: 80px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; padding: 8px 12px; color: var(--lumi-primary); font-family: 'Mitr'; font-size: 12px; outline: none; }

        /* === BUTTONS & INPUTS === */
        .lumi-gen-btn { background: linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary)); color: white; border: none; padding: 10px 18px; border-radius: 20px; font-family: 'Mitr'; cursor: pointer; box-shadow: 0 4px 10px rgba(255,105,180,0.3); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; width: 100%; }
        .lumi-gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .lumi-form { background: var(--lumi-bg); border: 1px solid var(--lumi-border); border-radius: 16px; padding: 15px; margin-bottom: 15px; }
        .lumi-input { width: 100%; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; padding: 10px; color: var(--lumi-text); font-family: 'Mitr'; outline: none; box-sizing: border-box; }
        .lumi-label { font-size: 12px; color: #666; margin-bottom: 6px; display: block; font-weight: 400; }
        .lumi-radio-group { display: flex; gap: 8px; margin-bottom: 10px; }
        .lumi-radio-label { flex: 1; text-align: center; padding: 8px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 10px; cursor: pointer; font-size: 12px; color: #666; transition: 0.2s; }
        .lumi-radio-label:has(input:checked) { background: var(--lumi-primary); color: white; border-color: var(--lumi-primary); }
        .lumi-radio-label input { display: none; }

        /* === CARDS & THREADS === */
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

        /* === FORUM SPECIFIC === */
        .lumi-forum-sidebar { position: absolute; right: 0; top: 60px; bottom: 0; width: 200px; background: var(--lumi-bg); border-left: 1px solid var(--lumi-border); padding: 15px; overflow-y: auto; }
        .lumi-forum-content { margin-right: 210px; }
        .lumi-network-node { padding: 8px; margin: 5px 0; background: var(--lumi-card); border-radius: 8px; cursor: pointer; transition: 0.2s; }
        .lumi-network-node:hover { background: var(--lumi-border); }
        .lumi-network-node.active { background: var(--lumi-primary); color: white; }
        .lumi-forum-thread { background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 12px; padding: 15px; margin-bottom: 15px; }
        .lumi-forum-post { background: var(--lumi-bg); border-left: 3px solid var(--lumi-primary); padding: 12px; margin: 10px 0; border-radius: 8px; }
        .lumi-forum-post.player { border-left-color: var(--lumi-secondary); background: #FFF9FA; }
        .lumi-forum-post-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .lumi-forum-author { font-weight: 500; color: var(--lumi-secondary); display: flex; align-items: center; gap: 6px; }
        .lumi-forum-time { font-size: 11px; color: #999; }
        .lumi-forum-replies { margin-left: 20px; margin-top: 10px; padding-left: 15px; border-left: 2px dashed var(--lumi-border); }
        .lumi-forum-topic { font-size: 14px; font-weight: 500; color: var(--lumi-text); margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--lumi-border); }
        .lumi-forum-tag { font-size: 10px; padding: 2px 8px; background: var(--lumi-bg); border-radius: 10px; margin-right: 5px; }
        .lumi-forum-input { width: 100%; padding: 10px; border: 1px solid var(--lumi-border); border-radius: 10px; background: var(--lumi-card); color: var(--lumi-text); font-family: 'Mitr'; resize: vertical; min-height: 80px; margin-bottom: 10px; }
        .lumi-rumor-badge { background: #FFE0E0; color: #D32F2F; }

        /* === TIMELINE DATE === */
        .lumi-timeline-date { background: linear-gradient(135deg, var(--lumi-bg), var(--lumi-card)); border-left: 3px solid var(--lumi-primary); border-radius: 12px; padding: 10px 14px; margin: 20px 0 15px; animation: slideIn 0.4s ease; color: var(--lumi-text); }

        /* === UTILS & TOAST === */
        .lumi-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); z-index: 999999; font-family: 'Mitr'; font-size: 13px; color: var(--lumi-secondary); border: 1px solid var(--lumi-border); animation: popIn 0.3s; pointer-events: none; }

        #lumi-panel .inline-drawer-content { font-family: 'Mitr'; padding: 10px; }
        #lumi-panel .menu_button { width: 100%; margin-bottom: 5px; background: linear-gradient(135deg, var(--lumi-primary), var(--lumi-secondary)); color: white; border: none; border-radius: 8px; padding: 8px; font-family: 'Mitr'; }

        .lumi-weaver-output, .lumi-lore-output { background: var(--lumi-bg); border: 1px solid var(--lumi-border); border-radius: 12px; padding: 15px; margin: 15px 0; max-height: 300px; overflow-y: auto; font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
        .lumi-lore-table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 10px 0; }
        .lumi-lore-table th, .lumi-lore-table td { padding: 8px; border-bottom: 1px solid var(--lumi-border); text-align: left; }
        .lumi-lore-table th { color: var(--lumi-secondary); font-weight: 500; }

        /* === RESPONSIVE === */
        @media (max-width: 768px) { 
            .lumi-menu-grid { grid-template-columns: repeat(2, 1fr); } 
            .lumi-modal { width: 96%; height: 92vh; } 
            .lumi-forum-sidebar { position: relative; width: 100%; height: auto; border-left: none; border-top: 1px solid var(--lumi-border); margin-top: 15px; } 
            .lumi-forum-content { margin-right: 0; } 
        }

        /* Card Hover Effect */
        .lumi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .lumi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(255,105,180,0.15); }
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// 4. FAB BUTTON (คืนชีพ: วิธีเก่าที่มั่นคง)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    // ล้างปุ่มเก่า
    $('#lumi-fab, .lumi-menu').remove();
    
    // รอจนกว่า body จะพร้อมจริง
    if (!document.body) {
        setTimeout(spawnLumiButton, 500);
        return;
    }

    const fab = document.createElement('div');
    fab.id = 'lumi-fab';
    fab.title = 'LumiPulse Menu';
    
    // โหลดตำแหน่ง
    const savedPos = extension_settings[extensionName]._internal?.fabPosition;
    if (savedPos) {
        fab.style.left = savedPos.left || 'auto';
        fab.style.top = savedPos.top || 'auto';
        fab.style.right = savedPos.right || '20px';
        fab.style.bottom = savedPos.bottom || 'auto';
        fab.style.transform = savedPos.transform || 'none';
    } else {
        fab.style.top = '50%';
        fab.style.right = '20px';
        fab.style.transform = 'translateY(-50%)';
    }
    
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}"><span>Diary</span></div>
            <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}"><span>Forum</span></div>
            <div class="lumi-menu-item" id="lumi-set"><img src="${iconSettings}"><span>Settings</span></div>
        </div>
        <div class="lumi-branding">LumiPulse</div>
    `;
    document.body.appendChild(menu);

    function updateMenuPos() {
        const r = fab.getBoundingClientRect();
        const m = $(menu);
        let l = r.left - (m.outerWidth() / 2) + (r.width / 2);
        let t = r.top - m.outerHeight() - 15;
        if (l < 10) l = 10;
        if (l + m.outerWidth() > window.innerWidth - 10) l = window.innerWidth - m.outerWidth() - 10;
        if (t < 10) t = r.bottom + 15;
        m.css({ left: l + 'px', top: t + 'px' });
    }

    // ✅ Drag Logic แบบเก่าที่ลื่น
    let isDragging = false, hasMoved = false;
    let dragStart = { x: 0, y: 0 }, offset = { x: 0, y: 0 }, currentPos = { x: 0, y: 0 };
    const TH = 12;

    fab.addEventListener('mousedown', e => {
        if (e.button === 2) return;
        e.preventDefault();
        isDragging = false; hasMoved = false;
        fab.classList.add('dragging');
        const rect = fab.getBoundingClientRect();
        offset.x = e.clientX - rect.left; offset.y = e.clientY - rect.top;
        dragStart.x = e.clientX; dragStart.y = e.clientY;
        currentPos.x = rect.left; currentPos.y = rect.top;
        
        const onMove = ev => {
            const dist = Math.hypot(ev.clientX - dragStart.x, ev.clientY - dragStart.y);
            if (dist > TH && !hasMoved) {
                hasMoved = true; isDragging = true;
                $(menu).fadeOut(50);
                fab.style.transform = 'none'; fab.style.top = 'auto'; fab.style.right = 'auto';
            }
            if (!isDragging) return;
            currentPos.x = Math.max(0, Math.min(ev.clientX - offset.x, window.innerWidth - 48));
            currentPos.y = Math.max(0, Math.min(ev.clientY - offset.y, window.innerHeight - 48));
            fab.style.left = currentPos.x + 'px'; fab.style.top = currentPos.y + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            fab.classList.remove('dragging');
            if (!hasMoved) { updateMenuPos(); $(menu).fadeToggle(150); }
            else {
                extension_settings[extensionName]._internal.fabPosition = { 
                    left: fab.style.left, top: fab.style.top, right: 'auto', bottom: 'auto', transform: 'none' 
                };
                SillyTavern.getContext().saveSettingsDebounced();
            }
            isDragging = false;
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, { passive: false });

    // Touch
    fab.addEventListener('touchstart', e => {
        e.preventDefault();
        isDragging = false; hasMoved = false;
        fab.classList.add('dragging');
        const t = e.touches[0], rect = fab.getBoundingClientRect();
        offset.x = t.clientX - rect.left; offset.y = t.clientY - rect.top;
        dragStart.x = t.clientX; dragStart.y = t.clientY;
        currentPos.x = rect.left; currentPos.y = rect.top;
    }, { passive: false });

    fab.addEventListener('touchmove', e => {
        e.preventDefault();
        const t = e.touches[0];
        const dist = Math.hypot(t.clientX - dragStart.x, t.clientY - dragStart.y);
        if (dist > TH && !hasMoved) {
            hasMoved = true; isDragging = true;
            $(menu).fadeOut(50);
            fab.style.transform = 'none'; fab.style.top = 'auto'; fab.style.right = 'auto';
        }
        if (!isDragging) return;
        currentPos.x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth - 48));
        currentPos.y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight - 48));
        fab.style.left = currentPos.x + 'px'; fab.style.top = currentPos.y + 'px';
    }, { passive: false });

    fab.addEventListener('touchend', e => {
        fab.classList.remove('dragging');
        if (!hasMoved) { updateMenuPos(); $(menu).fadeToggle(150); }
        else {
            extension_settings[extensionName]._internal.fabPosition = { 
                left: fab.style.left, top: fab.style.top, right: 'auto', bottom: 'auto', transform: 'none' 
            };
            SillyTavern.getContext().saveSettingsDebounced();
        }
        isDragging = false;
    }, { passive: false });

    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => { $(menu).fadeOut(); openModal('diary'); });
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => { $(menu).fadeOut(); openModal('forum'); });
    $(document).off('click', '#lumi-set').on('click', '#lumi-set', () => { $(menu).fadeOut(); openSettingsModal(); });
}

// ═══════════════════════════════════════════════
// 5. MODAL & UI LOGIC
// ═══════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`<div id="lumi-overlay" class="lumi-overlay"><div class="lumi-modal"><div class="lumi-head"><button class="lumi-btn" id="lumi-back">${svgBack}</button><h3 id="lumi-title">LumiPulse</h3><button class="lumi-btn" id="lumi-close">${svgClose}</button></div><div id="lumi-body" class="lumi-body"></div></div></div>`);
    $('#lumi-close, #lumi-overlay').on('click', e => { if(e.target.id==='lumi-overlay'||e.target.closest('#lumi-close')) $('#lumi-overlay').fadeOut(); });
    $('#lumi-back').on('click', () => { const activeTab = $('.lumi-nav-tab.active').data('tab'); if(activeTab === 'diary') renderDiaryTab(); else if(activeTab === 'forum') renderForumTab(); });
}

function openModal(type = 'diary') {
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    if(type === 'diary') renderDashboard();
    else if(type === 'forum') renderForumModal();
}

function openSettingsModal() { $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200); renderSettings(); }

// 📊 Dashboard
function renderDashboard() {
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
                <select id="filter-char" class="lumi-filter-select" style="flex:1;min-width:80px"><option value="">All Chars</option>${chars.map(c => `<option value="${escapeHtml(c)}" ${c===filterChar?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select>
                <select id="filter-date" class="lumi-filter-select" style="flex:1;min-width:80px"><option value="">All Dates</option>${dates.map(d => `<option value="${escapeHtml(d)}" ${d===filterDate?'selected':''}>${escapeHtml(d)}</option>`).join('')}</select>
                <select id="filter-loc" class="lumi-filter-select" style="flex:1;min-width:80px"><option value="">All Locs</option>${locs.map(l => `<option value="${escapeHtml(l)}" ${l===filterLoc?'selected':''}>${escapeHtml(l)}</option>`).join('')}</select>
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
        else if(tab === 'lore') renderLoreExtractor();
        else if(tab === 'links') renderMemoryLinks();
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

// 📖 Story Weaver
function renderStoryWeaver() {
    const ctx = SillyTavern.getContext(); const mems = loadMemories({ botId: ctx.characterId }).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
    $('#lumi-content').html(`
        <div class="lumi-form">
            <label class="lumi-label">Story Settings</label>
            <div class="lumi-set-row"><span>Include All Characters</span><input type="checkbox" id="sw-all-chars" checked style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div>
            <div class="lumi-set-row"><span>Chapter Length</span><select id="sw-chapters" class="lumi-input" style="width:100px"><option value="auto">Auto</option><option value="3">3 Chapters</option><option value="5">5 Chapters</option></select></div>
            <button id="btn-weave" class="lumi-gen-btn">${svgScroll} Weave Story</button>
        </div>
        <div id="sw-output" class="lumi-weaver-output" style="display:none;"></div>
        <div id="sw-actions" style="display:none;text-align:center;margin-top:10px;">
            <button id="btn-export-story" class="lumi-gen-btn">${svgBook} Export .md</button>
        </div>
    `);
    $('#btn-weave').on('click', async function() {
        $(this).html(`${svgScroll} Weaving...`).prop('disabled', true);
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

// 🌐 Lore Extractor
function renderLoreExtractor() {
    $('#lumi-content').html(`
        <div class="lumi-form">
            <label class="lumi-label">Lore Extraction</label>
            <p style="font-size:12px;color:#666;margin-bottom:10px;">Scan memories to generate SillyTavern-compatible World Info JSON.</p>
            <button id="btn-extract-lore" class="lumi-gen-btn">${svgGlobe} Extract Lore</button>
        </div>
        <div id="lore-output" style="display:none;"></div>
    `);
    $('#btn-extract-lore').on('click', async function() {
        $(this).html(`${svgGlobe} Extracting...`).prop('disabled', true);
        const ctx = SillyTavern.getContext(); const mems = loadMemories({ botId: ctx.characterId });
        const lore = await extractLore(mems);
        $(this).html(`${svgGlobe} Extract Lore`).prop('disabled', false);
        if(lore && lore.entries && Object.keys(lore.entries).length) {
            let html = `<table class="lumi-lore-table"><tr><th>Keyword</th><th>Type</th><th>Content</th></tr>`;
            Object.values(lore.entries).forEach(l => html += `<tr><td><b>${escapeHtml(l.key[0])}</b></td><td>${l.comment}</td><td>${escapeHtml(l.content).slice(0,100)}...</td></tr>`);
            html += `</table><div style="text-align:center;margin-top:15px;"><button id="btn-export-lore" class="lumi-gen-btn">${svgBook} Export JSON</button></div>`;
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

Return ONLY JSON array:
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
                characterFilter: { isExclude: false, names: [], tags: [] }
            };
        });
        return { entries: entries };
    } catch(e) { return { entries: {} }; }
}

// 🔗 Memory Linking
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
            $('#lumi-content').html(renderCard(mem, 0) + `<div style="text-align:center;margin-top:15px;"><button id="back-links" class="lumi-gen-btn">${svgBack} Back to Links</button></div>`);
            $('#back-links').off('click').on('click', () => renderMemoryLinks());
        }
    });
}

// 🆕 FORUM MODE FUNCTIONS
function renderForumModal() {
    $('#lumi-title').text('Forum');
    renderForumTab();
}

function renderForumTab() {
    const ctx = SillyTavern.getContext();
    const forumData = extension_settings[extensionName].forumPosts || [];
    const topics = [...new Set(forumData.map(p => p.topic))];
    
    $('#lumi-body').html(`
        <div class="lumi-nav">
            <div class="lumi-nav-tab active" data-forum="threads">${svgForum} Threads</div>
            <div class="lumi-nav-tab" data-forum="network">${svgNetwork} Network</div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
            <select id="forum-mode-select" class="lumi-filter-select" style="flex:1;min-width:120px">
                <option value="separate" ${extension_settings[extensionName].forum.mode==='separate'?'selected':''}>Separate Mode</option>
                <option value="linked" ${extension_settings[extensionName].forum.mode==='linked'?'selected':''}>Linked to RP</option>
            </select>
            <select id="forum-topic-filter" class="lumi-filter-select" style="flex:1;min-width:100px">
                <option value="">All Topics</option>
                ${topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
            </select>
        </div>
        <div class="lumi-action-row" style="margin-top:10px;">
            <button class="lumi-gen-btn" id="btn-generate-forum" style="flex:1">${svgPlus} Generate Post</button>
            <button class="lumi-gen-btn" id="btn-new-topic" style="flex:1;background:linear-gradient(135deg, #9B7ED9, #4A9FD9)">${svgPlus} New Topic</button>
        </div>
        <div style="display:flex;margin-top:15px;">
            <div id="forum-content" class="lumi-forum-content" style="flex:1;padding-right:15px;"></div>
            <div id="forum-sidebar" class="lumi-forum-sidebar" style="display:none;"></div>
        </div>
    `);
    
    $('#forum-mode-select').on('change', function() {
        extension_settings[extensionName].forum.mode = $(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderForumTab();
    });
    
    $('#forum-topic-filter').on('change', function() {
        renderForumThreads($(this).val());
    });
    
    $('#btn-generate-forum').on('click', () => generateForumPost());
    $('#btn-new-topic').on('click', () => createNewTopic());
    
    $('.lumi-nav-tab[data-forum]').on('click', function() {
        $('.lumi-nav-tab[data-forum]').removeClass('active');
        $(this).addClass('active');
        const view = $(this).data('forum');
        if(view === 'threads') renderForumThreads();
        else if(view === 'network') renderNetworkSidebar();
    });
    
    renderForumThreads();
}

function renderForumThreads(topicFilter = '') {
    const forumData = extension_settings[extensionName].forumPosts || [];
    let filtered = topicFilter ? forumData.filter(p => p.topic === topicFilter) : forumData;
    const groupedByTopic = {};
    filtered.forEach(post => {
        if(!groupedByTopic[post.topic]) groupedByTopic[post.topic] = [];
        groupedByTopic[post.topic].push(post);
    });
    
    let html = '';
    for(const [topic, posts] of Object.entries(groupedByTopic)) {
        const sortedPosts = posts.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        const mainPost = sortedPosts[0];
        const replies = sortedPosts.slice(1);
        const isRumor = mainPost.tags && mainPost.tags.includes('#rumor');
        
        html += `<div class="lumi-forum-thread">
            <div class="lumi-forum-topic ${isRumor?'lumi-rumor-badge':''}">${svgForum} ${escapeHtml(topic)}</div>
            <div class="lumi-forum-post ${mainPost.isPlayer?'player':''}">
                <div class="lumi-forum-post-header">
                    <div class="lumi-forum-author">${svgUser} ${escapeHtml(mainPost.author)} ${mainPost.isPlayer?'<span style="font-size:10px;color:var(--lumi-secondary)">(You)</span>':''}</div>
                    <div class="lumi-forum-time">${formatForumTime(mainPost.timestamp)}</div>
                </div>
                <div class="lumi-text">${escapeHtml(mainPost.content)}</div>
                ${mainPost.tags && mainPost.tags.length ? `<div style="margin-top:8px;">${mainPost.tags.map(t=>`<span class="lumi-forum-tag">${t}</span>`).join('')}</div>`:''}
            </div>
            ${replies.length ? `<div class="lumi-forum-replies">
                ${replies.map(reply => `
                    <div class="lumi-forum-post ${reply.isPlayer?'player':''}" style="margin:8px 0;">
                        <div class="lumi-forum-post-header">
                            <div class="lumi-forum-author">${svgUser} ${escapeHtml(reply.author)} ${reply.isPlayer?'<span style="font-size:10px;color:var(--lumi-secondary)">(You)</span>':''}</div>
                            <div class="lumi-forum-time">${formatForumTime(reply.timestamp)}</div>
                        </div>
                        <div class="lumi-text" style="font-size:12px;">${escapeHtml(reply.content)}</div>
                    </div>
                `).join('')}
            </div>`:''}
            <div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--lumi-border);">
                <textarea class="lumi-forum-input" data-topic="${escapeHtml(topic)}" placeholder="Reply to this thread..."></textarea>
                <button class="lumi-gen-btn" onclick="submitForumReply('${escapeHtml(topic)}')" style="width:auto;padding:6px 12px;font-size:11px;">${svgComment} Reply</button>
            </div>
        </div>`;
    }
    
    if(!html) html = `<div style="text-align:center;padding:60px 20px;color:#999;"><div style="font-size:48px;margin-bottom:16px;opacity:0.3">${svgForum}</div><div>No forum posts yet. Generate some discussions!</div></div>`;
    
    $('#forum-content').html(html);
}

function renderNetworkSidebar() {
    const relationships = buildForumRelationshipNetwork();
    const chars = Object.keys(relationships);
    
    let html = `<h4 style="margin:0 0 15px;color:var(--lumi-secondary);font-size:14px;">${svgNetwork} Character Network</h4>`;
    chars.forEach(char => {
        const connections = relationships[char];
        const connectionCount = connections ? Object.keys(connections).length : 0;
        html += `<div class="lumi-network-node" data-char="${escapeHtml(char)}">
            <div style="font-weight:500;font-size:12px;">${escapeHtml(char)}</div>
            <div style="font-size:10px;color:#999;">${connectionCount} connections</div>
        </div>`;
    });
    
    $('#forum-sidebar').html(html).show();
    
    $('.lumi-network-node').on('click', function() {
        const char = $(this).data('char');
        showCharacterNetworkDetail(char, relationships[char]);
    });
}

function showCharacterNetworkDetail(character, connections) {
    let html = `<div style="padding:15px;">
        <h4 style="margin:0 0 15px;color:var(--lumi-secondary);">${svgUser} ${escapeHtml(character)}</h4>
        <div style="margin-bottom:15px;">
            <div style="font-size:11px;color:#666;margin-bottom:8px;">Connections:</div>`;
    
    if(connections && Object.keys(connections).length) {
        for(const [targetChar, data] of Object.entries(connections)) {
            html += `<div style="background:var(--lumi-bg);padding:8px;margin:5px 0;border-radius:6px;">
                <div style="font-size:11px;"><b>${escapeHtml(targetChar)}</b></div>
                <div style="font-size:10px;color:#999;">Interactions: ${data.count}</div>
                <div style="font-size:10px;color:var(--lumi-primary);margin-top:4px;">${data.lastInteraction || 'No recent interaction'}</div>
            </div>`;
        }
    } else {
        html += `<div style="font-size:11px;color:#999;text-align:center;padding:10px;">No connections yet</div>`;
    }
    
    html += `</div><button class="lumi-btn" onclick="renderNetworkSidebar()" style="width:100%;">${svgBack} Back</button></div>`;
    $('#forum-sidebar').html(html);
}

function buildForumRelationshipNetwork() {
    const forumData = extension_settings[extensionName].forumPosts || [];
    const relationships = {};
    
    forumData.forEach(post => {
        if(!post.isPlayer) {
            if(!relationships[post.author]) relationships[post.author] = {};
            const sameTopicPosts = forumData.filter(p => p.topic === post.topic && !p.isPlayer);
            sameTopicPosts.forEach(otherPost => {
                if(otherPost.author !== post.author) {
                    if(!relationships[post.author][otherPost.author]) {
                        relationships[post.author][otherPost.author] = { count: 0, lastInteraction: null };
                    }
                    relationships[post.author][otherPost.author].count++;
                    relationships[post.author][otherPost.author].lastInteraction = formatForumTime(post.timestamp);
                }
            });
        }
    });
    
    return relationships;
}

async function generateForumPost() {
    const ctx = SillyTavern.getContext();
    const mode = extension_settings[extensionName].forum.mode;
    $('#btn-generate-forum').text('Generating...').prop('disabled', true);
    const result = await generateForumContent(mode);
    $('#btn-generate-forum').text('Generate Post').prop('disabled', false);
    if(result) {
        saveForumPost(result);
        showToast('Forum post generated!');
        renderForumTab();
    } else {
        showToast('Failed to generate');
    }
}

async function generateForumContent(mode) {
    const ctx = SillyTavern.getContext();
    const chat = ctx.chat || [];
    const recentChat = chat.slice(-30);
    const chatLog = recentChat.map(m => `[${m.is_user?'User':m.name||'NPC'}]: ${m.mes.slice(0,100)}`).join('\n');
    const characters = [...new Set(recentChat.filter(m => m.name && !m.is_user).map(m => m.name))];
    
    const prompt = mode === 'linked' 
        ? `[System: Generate forum discussion based on recent RP events.]
Recent Chat:
${chatLog}
Characters present: ${characters.join(', ')}
Generate a forum post that reflects these events. Return JSON:
{"topic":"Topic title","author":"Character name","content":"Post content in Thai","isPlayer":false,"tags":["#gossip"]}`
        : `[System: Generate independent forum discussion.]
Characters: ${characters.join(', ')}
Generate a forum post. Return JSON:
{"topic":"Topic title","author":"Character name","content":"Post content in Thai","isPlayer":false,"tags":["#rumor"]}`;
    
    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        const match = res?.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    } catch(e) { return null; }
}

function createNewTopic() {
    const topic = prompt('Enter topic title:');
    if(!topic) return;
    const content = prompt('Enter your post:');
    if(!content) return;
    saveForumPost({ id: 'forum_' + Date.now(), topic, author: 'Player', content, isPlayer: true, timestamp: new Date().toISOString(), tags: [] });
    renderForumTab();
}

function submitForumReply(topic) {
    const textarea = $(`.lumi-forum-input[data-topic="${CSS.escape(topic)}"]`);
    const content = textarea.val().trim();
    if(!content) return;
    saveForumPost({ id: 'forum_' + Date.now(), topic, author: 'Player', content, isPlayer: true, timestamp: new Date().toISOString(), tags: [] });
    renderForumTab();
}

function saveForumPost(post) {
    const s = extension_settings[extensionName];
    if(!s.forumPosts) s.forumPosts = [];
    s.forumPosts.push(post);
    if(s.forumPosts.length > s.forum.storage.max) s.forumPosts = s.forumPosts.slice(-s.forum.storage.max);
    SillyTavern.getContext().saveSettingsDebounced();
}

async function autoGenerateForum() {
    const s = extension_settings[extensionName];
    const cfg = s.forum.autoGen;
    if(!cfg.enabled) return;
    let shouldGenerate = false;
    if(cfg.triggerType === 'turn_count') {
        s._internal.forumAutoCounter++;
        if(s._internal.forumAutoCounter >= cfg.turnInterval) { shouldGenerate = true; s._internal.forumAutoCounter = 0; }
    } else if(cfg.triggerType === 'time') {
        if(Date.now() - s._internal.lastForumAutoGen >= cfg.timeInterval * 60000) { shouldGenerate = true; s._internal.lastForumAutoGen = Date.now(); }
    } else if(cfg.triggerType === 'random' && Math.random() < cfg.randomChance) {
        shouldGenerate = true;
    } else if(cfg.triggerType === 'event' && Math.random() < cfg.eventChance) {
        shouldGenerate = true;
    }
    if(shouldGenerate) {
        const result = await generateForumContent(s.forum.mode);
        if(result) saveForumPost(result);
    }
}

function formatForumTime(timestamp) {
    const date = new Date(timestamp);
    const diff = Date.now() - date;
    const minutes = Math.floor(diff / 60000);
    if(minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
}

// ⚙️ SETTINGS (คืนชีพ: วิธีเก่าที่มั่นคง)
function renderSettings() {
    $('#lumi-title').text("Settings"); const s = extension_settings[extensionName]; const ag = s.diary.autoGen; const fg = s.forum.autoGen; const savedTheme = s._internal.theme || 'pink';
    $('#lumi-body').html(`<div style="padding:10px;"><div class="lumi-form"><label class="lumi-label">Theme</label><select id="set-theme" class="lumi-input">${Object.entries(themes).map(([k,v]) => `<option value="${k}" ${k===savedTheme?'selected':''}>${v.name}</option>`).join('')}</select></div><div class="lumi-form"><label class="lumi-label">General</label><div class="lumi-set-row"><span>Extension Enabled</span><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div><div class="lumi-set-row"><span>World Mode</span><select id="set-wm" class="lumi-input" style="width:100px"><option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option><option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option><option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option></select></div></div><div class="lumi-form"><label class="lumi-label">Diary Auto-Gen</label><div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="ag-en" ${ag.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div></div><div class="lumi-form"><label class="lumi-label">Forum Auto-Gen</label><div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="fg-en" ${fg.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lumi-primary)"></div><div class="lumi-set-row"><span>Trigger</span><select id="fg-tr" class="lumi-input" style="width:110px"><option value="turn_count" ${fg.triggerType==='turn_count'?'selected':''}>Every X Msgs</option><option value="time" ${fg.triggerType==='time'?'selected':''}>Every X Min</option><option value="random" ${fg.triggerType==='random'?'selected':''}>Random</option></select></div></div><div style="margin-top:15px;display:flex;gap:10px"><button id="btn-rst" class="lumi-input" style="background:#FFE0E0;color:var(--lumi-secondary);text-align:center;cursor:pointer">${svgBack} Reset FAB</button><button id="btn-clr" class="lumi-input" style="background:var(--lumi-danger) !important; color:white !important; text-align:center; cursor:pointer; border:none;">${svgClose} Clear Data</button></div></div>`);
    
    $('#set-theme').on('change', function() { s._internal.theme = $(this).val(); applyTheme($(this).val()); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-en').on('change', function(){ s.isEnabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#set-wm').on('change', function(){ s.diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    
    $('#ag-en').on('change', function(){ s.diary.autoGen.enabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#fg-en').on('change', function(){ s.forum.autoGen.enabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#fg-tr').on('change', function() { s.forum.autoGen.triggerType = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); renderSettings(); });
    
    $('#btn-rst').on('click', ()=>{ s._internal.fabPos = null; SillyTavern.getContext().saveSettingsDebounced(); spawnLumiButton(); });
    $('#btn-clr').on('click', ()=>{ if(confirm('Clear all data?')) { s.memories=[]; s.forumPosts=[]; s._internal.fabPos=null; s._internal.nameRegistry={}; SillyTavern.getContext().saveSettingsDebounced(); spawnLumiButton(); } });
}

// ═══════════════════════════════════════════════
// 6. AUTO-TRIGGER
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() { $(document).off('messageReceived', onNewChat).on('messageReceived', onNewChat); }
async function onNewChat() {
    const s = extension_settings[extensionName], cfg = s.diary.autoGen; 
    if (cfg.enabled) {
        s._internal.messageCounter++; 
        const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
        let gen = false;
        if (cfg.triggerType === 'turn_count' && s._internal.messageCounter >= cfg.turnInterval) { gen=true; s._internal.messageCounter=0; }
        else if (cfg.triggerType === 'emotion' && cfg.emotionKeywords.some(k => lastMsg.includes(k))) { gen=true; }
        else if (cfg.triggerType === 'random' && Math.random() < cfg.randomChance) { gen=true; }
        if (gen) {
            const results = await callAIBatch('latest', cfg.turnInterval || 20);
            if(results && results.length > 0) {
                const ctx = SillyTavern.getContext(); const wm = s.diary.worldMode === 'auto' ? detectWorldMode() : s.diary.worldMode; const botId = ctx.characterId;
                results.forEach(res => saveMemory({ id: 'mem_auto_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), timestamp: new Date().toISOString(), character: res.character || ctx.name2 || "Character", botId: botId, worldMode: wm, content: { ...res }, meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, linkedIds: res.linkedIds || [], tags: extractTags(res.diary) } }));
            }
        }
    }
    await autoGenerateForum();
}

// ═══════════════════════════════════════════════
// 7. HELPERS & UTILS (คืนชีพ: วิธีเก่าที่มั่นคง)
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

// ✅ คืนชีพ: สร้าง Panel ในหน้า Extension Settings
function createSettingsPanel() {
    if ($('#lumi-panel').length) return;
    $('#extensions_settings').append(`
        <div id="lumi-panel" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b style="color:var(--lumi-primary);font-family:'Mitr';font-weight:300;">LumiPulse</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="display:none;"></div>
        </div>
    `);
}

function levenshteinDistance(str1, str2) { const m = str1.length, n = str2.length; const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0)); for (let i = 0; i <= m; i++) dp[i][0] = i; for (let j = 0; j <= n; j++) dp[0][j] = j; for (let i = 1; i <= m; i++) { for (let j = 1; j <= n; j++) { if (str1[i-1] === str2[j-1]) dp[i][j] = dp[i-1][j-1]; else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]); } } return dp[m][n]; }
function similarityScore(str1, str2) { const s1 = str1.toLowerCase().trim(); const s2 = str2.toLowerCase().trim(); const distance = levenshteinDistance(s1, s2); const maxLen = Math.max(s1.length, s2.length); return maxLen === 0 ? 100 : ((maxLen - distance) / maxLen) * 100; }

function editMemoryInline(id) { const mem = extension_settings[extensionName].memories.find(m => m.id === id); if (!mem) return; const card = $(`.lumi-card[data-id="${id}"]`); card.find('.lumi-text').html(`<textarea class="lumi-edit-textarea" style="width:100%;min-height:80px;padding:10px;border:1px solid var(--lumi-border);border-radius:10px;font-family:'Mitr';font-size:13px;resize:vertical;color:var(--lumi-text);background:var(--lumi-card)">${mem.content.diary}</textarea><div style="margin-top:8px;display:flex;gap:8px"><button class="lumi-btn-save" style="flex:1;background:var(--lumi-primary);color:white;border:none;padding:8px;border-radius:8px;cursor:pointer">Save</button><button class="lumi-btn-cancel" style="flex:1;background:#FFE0E0;color:var(--lumi-danger);border:none;padding:8px;border-radius:8px;cursor:pointer">Cancel</button></div>`); card.find('.lumi-btn-save').on('click', function() { mem.content.diary = card.find('.lumi-edit-textarea').val(); SillyTavern.getContext().saveSettingsDebounced(); renderDiaryTab(); showToast('Updated!'); }); card.find('.lumi-btn-cancel').on('click', function() { renderDiaryTab(); }); }
function editMemoryModal(id) { const mem = extension_settings[extensionName].memories.find(m => m.id === id); if (!mem) return; $('#lumi-title').text('Edit Memory'); $('#lumi-body').html(`<div style="padding:15px;"><div class="lumi-form"><label class="lumi-label">Character</label><input type="text" id="edit-char" value="${mem.character}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Date (RP)</label><input type="text" id="edit-date" value="${mem.content.rp_date||''}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Location</label><input type="text" id="edit-loc" value="${mem.content.rp_location||''}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Tags</label><input type="text" id="edit-tags" value="${(mem.content.rp_tags||[]).join(', ')}" class="lumi-input"></div><div class="lumi-form"><label class="lumi-label">Diary</label><textarea id="edit-diary" class="lumi-input" style="min-height:150px;resize:vertical">${mem.content.diary}</textarea></div><div style="display:flex;gap:10px"><button id="btn-save-edit" class="lumi-gen-btn" style="flex:2">Save</button><button id="btn-cancel-edit" class="lumi-input" style="flex:1;background:#FFE0E0;color:var(--lumi-danger);text-align:center;cursor:pointer">Cancel</button></div></div>`); $('#btn-save-edit').on('click', function() { mem.character = $('#edit-char').val(); mem.content.rp_date = $('#edit-date').val(); mem.content.rp_location = $('#edit-loc').val(); mem.content.rp_tags = $('#edit-tags').val().split(',').map(t=>t.trim()).filter(t=>t); mem.content.diary = $('#edit-diary').val(); SillyTavern.getContext().saveSettingsDebounced(); renderDashboard(); showToast('Updated!'); }); $('#btn-cancel-edit').on('click', function() { renderDashboard(); }); }

async function callAIBatch(mode, count) {
    const ctx = SillyTavern.getContext(); const allChat = ctx.chat || [];
    let chatSlice, startIndex = 0, endIndex = 0;
    if(mode === 'latest') { chatSlice = allChat.slice(-count); startIndex = Math.max(0, allChat.length - count); endIndex = allChat.length; }
    else if(mode === 'first') { chatSlice = allChat.slice(0, count); startIndex = 0; endIndex = count; }
    else { chatSlice = allChat.filter(m => m.mes && m.mes.length > 15).slice(-120); startIndex = Math.max(0, allChat.length - 120); endIndex = allChat.length; }

    const cleanChat = chatSlice.filter(m => m.mes && m.mes.length > 10);
    const chatLog = cleanChat.map((m, i) => `[${m.is_user ? 'User' : (m.name || 'NPC')}]: ${m.mes.slice(0, 60)}`).join('\n');
    const botMems = loadMemories({ botId: ctx.characterId });
    const prevTopics = botMems.slice(0, 10).map(m => `- [${m.character}] ${m.content.rp_date} @ ${m.content.rp_location}: ${m.content.diary.slice(0, 50)}...`).join('\n');
    const registryList = Object.keys(extension_settings[extensionName]._internal.nameRegistry || {}).join(', ');

    const prompt = `[System: Analyze chat to create UNIQUE diary entries.]
[Scanning Range: Message #${startIndex+1} to #${endIndex}]
[Registered Names (USE EXACTLY THESE): ${registryList || "None"}]
[PREVIOUSLY WRITTEN (DO NOT REPEAT CONTENT/DATES/LOCATIONS):
${prevTopics || "None"}]

Chat Log:
${chatLog}

Rules:
1. Focus ONLY on events within #${startIndex+1}-#${endIndex}.
2. Return rp_location accurately from context.
3. Link to related existing memory IDs if applicable (return linkedIds array).
4. Date MUST be numeric Thai format (e.g. "15 กันยายน 2567").
5. Include context tags.
6. Return ONLY JSON ARRAY:
[{"character":"Name","rp_date":"Date","rp_location":"Loc","rp_tags":["#Tag"],"mood":"Mood","diary":"Thai text 2-4 sentences.","isSecret":false,"linkedIds":[]}]`;

    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        if (!res) return [];
        const match = res.match(/\[[\s\S]*\]/); return match ? JSON.parse(match[0]) : [];
    } catch (e) { console.error(e); return []; }
}

function generateBatchMemories() {
    const mode = $('input[name="gen-mode"]:checked').val(); const count = parseInt($('#gen-count').val()) || 30;
    $('#btn-run-gen').html(`${svgPlus} Thinking...`).prop('disabled', true);
    const results = await callAIBatch(mode, count);
    $('#btn-run-gen').html(`${svgPlus} Analyze & Generate`).prop('disabled', false); $('#gen-form-container').slideUp(200);
    if(results && results.length > 0) {
        const ctx = SillyTavern.getContext(); const wm = extension_settings[extensionName].diary.worldMode === 'auto' ? detectWorldMode() : extension_settings[extensionName].diary.worldMode; const botId = ctx.characterId;
        results.forEach(res => saveMemory({ id: 'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), timestamp: new Date().toISOString(), character: res.character || ctx.name2 || "Character", botId: botId, worldMode: wm, content: { ...res }, meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, linkedIds: res.linkedIds || [], tags: extractTags(res.diary) } }));
        showToast(`Created ${results.length} memories!`); renderDiaryTab();
    } else { showToast(`No significant memories found`); }
}

