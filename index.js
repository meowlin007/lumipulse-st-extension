"use strict";

// ═══════════════════════════════════════════════
// LUMIPULSE v4 - Full Rewrite with Bug Fixes
// ═══════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    forumPosts: {},       // ✅ keyed by botId: { [botId]: [...posts] }
    _internal: {
        fabPos: null, theme: 'pink',
        nameRegistry: {},
        filterChar: '', filterDate: '', filterLoc: '',
        forumMessageCounter: 0,
        lastForumGenTime: 0,
        messageCounter: 0
    },
    diary: {
        worldMode: 'auto',
        display: { secretMode: 'ai', showSecretSystem: true },
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'], randomChance: 0.08 },
        storage: { max: 150 }
    },
    forum: {
        enabled: true,
        autoGen: {
            enabled: true,
            triggerType: 'turn_count',
            turnInterval: 10,
            timeInterval: 5,
            randomChance: 0.15
        },
        storage: { max: 200 }
    },
    features: { storyWeaver: true, loreExtractor: true, memoryLinking: true }
};

let extension_settings = {};

const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";
const iconSettings = "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png";

// SVG Icons
const svgClose    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgBack     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const svgPlus     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgStarFill = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgHeart    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const svgHeartFill= `<svg viewBox="0 0 24 24" fill="#FF69B4" stroke="#FF69B4" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgMapPin   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgUser     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const svgBook     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
const svgTag      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;
const svgMood     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
const svgLink     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const svgScroll   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const svgGlobe    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
const svgForum    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const svgNetwork  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="9.5" y1="7.5" x2="7" y2="16"/><line x1="14.5" y1="7.5" x2="17" y2="16"/><line x1="8" y1="19" x2="16" y2="19"/></svg>`;
const svgTrash    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const svgEdit     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const svgComment  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const svgSend     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" width="24" height="24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgSpark    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`;

const themes = {
    pink:   { name: 'Sakura', primary: '#F472B6', secondary: '#EC4899', accent: '#FDE7F3', bg: '#FFF1F8', card: '#FFFFFF', text: '#1a1a2e', subtext: '#6b7280', border: '#FBD0E8', danger: '#e53e3e', tag: '#FCE7F3', tagText: '#BE185D' },
    purple: { name: 'Lavender', primary: '#A78BFA', secondary: '#7C3AED', accent: '#EDE9FE', bg: '#F5F3FF', card: '#FFFFFF', text: '#1a1a2e', subtext: '#6b7280', border: '#DDD6FE', danger: '#C45A5A', tag: '#EDE9FE', tagText: '#5B21B6' },
    ocean:  { name: 'Ocean', primary: '#38BDF8', secondary: '#0284C7', accent: '#E0F2FE', bg: '#F0F9FF', card: '#FFFFFF', text: '#1a1a2e', subtext: '#6b7280', border: '#BAE6FD', danger: '#B85252', tag: '#E0F2FE', tagText: '#0369A1' },
    mint:   { name: 'Matcha', primary: '#34D399', secondary: '#059669', accent: '#D1FAE5', bg: '#F0FDF4', card: '#FFFFFF', text: '#1a1a2e', subtext: '#6b7280', border: '#A7F3D0', danger: '#C25858', tag: '#D1FAE5', tagText: '#065F46' }
};

function applyTheme(n) {
    const t = themes[n] || themes.pink;
    const r = document.documentElement;
    Object.entries({ '--lp': t.primary, '--ls': t.secondary, '--la': t.accent, '--lb': t.bg, '--lc': t.card, '--lt': t.text, '--lsub': t.subtext, '--lborder': t.border, '--ldanger': t.danger, '--ltag': t.tag, '--ltagtext': t.tagText }).forEach(([k,v]) => r.style.setProperty(k, v));
}

// ═══════════════════════════════════════════════
// BOOT
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
    } else {
        // Deep merge to add missing keys
        const saved = ctx.extensionSettings[extensionName];
        if (!saved._internal) saved._internal = {};
        if (!saved.forum) saved.forum = {};
        if (!saved.forum.autoGen) saved.forum.autoGen = {};
        if (Array.isArray(saved.forumPosts)) {
            // ✅ Migrate old array format to new botId-keyed format
            saved.forumPosts = {};
        }
        if (!saved.forumPosts) saved.forumPosts = {};
        if (typeof saved._internal.messageCounter === 'undefined') saved._internal.messageCounter = 0;
        if (typeof saved._internal.forumMessageCounter === 'undefined') saved._internal.forumMessageCounter = 0;
        if (typeof saved._internal.lastForumGenTime === 'undefined') saved._internal.lastForumGenTime = 0;
    }
    ctx.saveSettingsDebounced();
    extension_settings = ctx.extensionSettings;
    applyTheme(extension_settings[extensionName]._internal.theme || 'pink');
    injectStyles();
    createSettingsPanel();
    if (extension_settings[extensionName].isEnabled) {
        setTimeout(() => { spawnLumiButton(); createModal(); setupAutoTriggerListener(); setupForumAutoTrigger(); }, 300);
    }
}

// ─── Helper: get current botId ───
function getCurrentBotId() {
    return SillyTavern.getContext().characterId || '__default__';
}

// ─── Helper: get forum posts for current bot ───
function getBotForumPosts() {
    const botId = getCurrentBotId();
    const s = extension_settings[extensionName];
    if (!s.forumPosts[botId]) s.forumPosts[botId] = [];
    return s.forumPosts[botId];
}

function saveBotForumPosts(posts) {
    const botId = getCurrentBotId();
    const s = extension_settings[extensionName];
    const max = s.forum.storage?.max || 200;
    s.forumPosts[botId] = posts.slice(-max);
    SillyTavern.getContext().saveSettingsDebounced();
}

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const el = document.createElement('style'); el.id = 'lumi-styles';
    el.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
    :root { --lp:#F472B6;--ls:#EC4899;--la:#FDE7F3;--lb:#FFF1F8;--lc:#fff;--lt:#1a1a2e;--lsub:#6b7280;--lborder:#FBD0E8;--ldanger:#e53e3e;--ltag:#FCE7F3;--ltagtext:#BE185D; }

    @keyframes lumiIn { from { opacity:0; transform:scale(0.94) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
    @keyframes lumiSlide { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
    @keyframes lumiPop { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
    @keyframes lumiFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    /* FAB */
    #lumi-fab { position:fixed; z-index:99999; width:48px; height:48px; border-radius:50%; background:var(--lc) url('${btnUrl}') no-repeat center/26px; backdrop-filter:blur(12px); border:2px solid rgba(255,255,255,0.9); box-shadow:0 4px 20px rgba(0,0,0,0.15),0 0 0 0 var(--lp); cursor:grab; touch-action:none; user-select:none; transition:box-shadow .3s,transform .2s; display:flex; align-items:center; justify-content:center; }
    #lumi-fab:hover { box-shadow:0 6px 25px rgba(0,0,0,0.2),0 0 0 6px color-mix(in srgb,var(--lp) 20%,transparent); }
    #lumi-fab:active { transform:scale(0.92); cursor:grabbing; }

    /* Menu */
    .lumi-menu { position:fixed; z-index:99998; display:none; background:rgba(255,255,255,0.97); backdrop-filter:blur(20px); border-radius:20px; padding:16px; border:1px solid rgba(255,255,255,0.9); box-shadow:0 12px 40px rgba(0,0,0,0.12); font-family:'DM Sans','Noto Sans Thai',sans-serif; min-width:200px; }
    .lumi-menu-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
    .lumi-menu-item { display:flex; flex-direction:column; align-items:center; gap:7px; cursor:pointer; padding:12px 8px; border-radius:14px; transition:.18s; }
    .lumi-menu-item:hover { background:var(--la); }
    .lumi-menu-item img { width:38px; height:38px; object-fit:contain; }
    .lumi-menu-item span { font-size:11px; color:var(--lsub); font-weight:500; }

    /* Overlay & Modal */
    .lumi-overlay { position:fixed; top:0; left:0; width:100vw; height:100dvh; background:rgba(15,15,30,0.45); backdrop-filter:blur(8px); z-index:100000; display:none; align-items:center; justify-content:center; }
    .lumi-modal { width:94%; max-width:480px; height:90vh; background:var(--lb); border-radius:26px; border:1px solid var(--lborder); box-shadow:0 24px 60px rgba(0,0,0,0.18); display:flex; flex-direction:column; overflow:hidden; font-family:'DM Sans','Noto Sans Thai',sans-serif; animation:lumiIn .28s cubic-bezier(.34,1.56,.64,1); }
    .lumi-head { padding:14px 18px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--lborder); background:var(--lc); flex-shrink:0; }
    .lumi-head h3 { margin:0; font-size:15px; color:var(--ls); font-weight:600; letter-spacing:-.3px; }
    .lumi-icon-btn { width:32px; height:32px; border-radius:50%; background:var(--la); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ls); transition:.15s; flex-shrink:0; }
    .lumi-icon-btn:hover { background:var(--lborder); }
    .lumi-body { flex:1; overflow-y:auto; background:var(--lb); color:var(--lt); scrollbar-width:thin; scrollbar-color:var(--lborder) transparent; }
    .lumi-body::-webkit-scrollbar { width:4px; }
    .lumi-body::-webkit-scrollbar-thumb { background:var(--lborder); border-radius:2px; }

    /* Nav Tabs */
    .lumi-nav { display:flex; gap:6px; padding:12px 14px 0; flex-shrink:0; overflow-x:auto; }
    .lumi-nav-tab { flex:1; text-align:center; padding:8px 6px; border-radius:12px; background:var(--lc); border:1px solid var(--lborder); color:var(--lsub); font-size:11px; font-weight:500; cursor:pointer; transition:.18s; display:flex; align-items:center; justify-content:center; gap:5px; white-space:nowrap; min-width:70px; }
    .lumi-nav-tab.active { background:var(--lp); color:#fff; border-color:var(--lp); }
    .lumi-nav-tab:hover:not(.active) { background:var(--la); color:var(--ls); border-color:var(--lborder); }

    /* Stats */
    .lumi-stats-bar { display:flex; gap:10px; padding:10px 14px; }
    .lumi-stat { flex:1; text-align:center; background:var(--lc); border:1px solid var(--lborder); border-radius:14px; padding:10px 6px; }
    .lumi-stat b { display:block; font-size:20px; color:var(--ls); font-weight:700; line-height:1.1; }
    .lumi-stat span { font-size:10px; color:var(--lsub); font-weight:500; }

    /* Diary Cards */
    .lumi-diary-pad { padding:12px 14px; }
    .lumi-timeline-date { display:flex; align-items:center; gap:7px; font-size:11px; color:var(--lsub); font-weight:600; letter-spacing:.5px; text-transform:uppercase; padding:8px 0 6px; }
    .lumi-timeline-date::after { content:''; flex:1; height:1px; background:var(--lborder); }
    .lumi-card { background:var(--lc); border:1px solid var(--lborder); border-radius:16px; padding:13px; margin-bottom:10px; position:relative; overflow:hidden; animation:lumiFade .3s ease; transition:box-shadow .2s,transform .2s; }
    .lumi-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.07); transform:translateY(-2px); }
    .lumi-card.pinned { border-color:#F59E0B; }
    .lumi-card.pinned::before { content:'📌'; position:absolute; top:8px; right:10px; font-size:12px; }
    .lumi-char-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .lumi-avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:700; flex-shrink:0; }
    .lumi-char-name { font-size:13px; font-weight:600; color:var(--lt); flex:1; }
    .lumi-card-meta { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:6px; }
    .lumi-badge { font-size:10px; padding:2px 7px; border-radius:6px; background:var(--ltag); color:var(--ltagtext); display:inline-flex; align-items:center; gap:3px; font-weight:500; }
    .lumi-text { font-size:13px; color:var(--lt); line-height:1.65; white-space:pre-wrap; margin:6px 0 10px; }
    .lumi-card-actions { display:flex; gap:4px; justify-content:flex-end; padding-top:8px; border-top:1px solid var(--lborder); }
    .lumi-act { background:none; border:1px solid transparent; border-radius:8px; cursor:pointer; color:var(--lsub); transition:.15s; padding:4px 8px; font-size:11px; display:flex; align-items:center; gap:4px; }
    .lumi-act:hover { background:var(--la); color:var(--ls); border-color:var(--lborder); }
    .lumi-act.active { color:var(--lp); background:var(--la); }
    .lumi-act.danger:hover { background:#FFF0F0; color:var(--ldanger); }

    /* Forum - Social Feed */
    .lumi-forum-pad { padding:12px 14px; }
    .lumi-post-card { background:var(--lc); border:1px solid var(--lborder); border-radius:18px; padding:14px; margin-bottom:12px; animation:lumiFade .3s ease; }
    .lumi-post-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .lumi-post-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:15px; font-weight:700; flex-shrink:0; }
    .lumi-post-author { flex:1; }
    .lumi-post-author-name { font-size:13px; font-weight:600; color:var(--lt); }
    .lumi-post-time { font-size:11px; color:var(--lsub); }
    .lumi-post-thread-tag { font-size:10px; background:var(--ltag); color:var(--ltagtext); padding:2px 8px; border-radius:20px; font-weight:600; }
    .lumi-post-body { font-size:13px; color:var(--lt); line-height:1.65; margin-bottom:12px; }
    .lumi-post-actions { display:flex; gap:6px; padding-top:10px; border-top:1px solid var(--lborder); }
    .lumi-post-btn { flex:1; background:none; border:1px solid var(--lborder); border-radius:10px; padding:7px 10px; cursor:pointer; font-size:11px; font-family:'DM Sans','Noto Sans Thai',sans-serif; color:var(--lsub); transition:.15s; display:flex; align-items:center; justify-content:center; gap:5px; font-weight:500; }
    .lumi-post-btn:hover { background:var(--la); color:var(--ls); border-color:var(--lborder); }
    .lumi-post-btn.liked { background:color-mix(in srgb,var(--lp) 12%,transparent); color:var(--lp); border-color:color-mix(in srgb,var(--lp) 30%,transparent); }
    .lumi-post-btn.liked svg path { fill:var(--lp); stroke:var(--lp); }
    .lumi-replies-container { margin-top:10px; padding-left:10px; border-left:2px solid var(--lborder); display:none; }
    .lumi-reply-card { padding:10px 0; border-bottom:1px dashed var(--lborder); }
    .lumi-reply-card:last-child { border-bottom:none; }
    .lumi-reply-header { display:flex; align-items:center; gap:8px; margin-bottom:5px; }
    .lumi-reply-avatar { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700; flex-shrink:0; }
    .lumi-reply-name { font-size:12px; font-weight:600; color:var(--lt); }
    .lumi-reply-time { font-size:10px; color:var(--lsub); }
    .lumi-reply-body { font-size:12px; color:var(--lt); line-height:1.6; padding-left:34px; }
    .lumi-reply-input-row { display:flex; gap:8px; margin-top:10px; padding-left:10px; }
    .lumi-reply-input { flex:1; background:var(--la); border:1px solid var(--lborder); border-radius:20px; padding:8px 14px; font-size:12px; font-family:'DM Sans','Noto Sans Thai',sans-serif; color:var(--lt); outline:none; resize:none; min-height:36px; max-height:80px; overflow:hidden; }
    .lumi-reply-send { width:36px; height:36px; border-radius:50%; background:var(--lp); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:.15s; }
    .lumi-reply-send:hover { background:var(--ls); }

    /* Compose Box */
    .lumi-compose-box { margin:12px 14px; background:var(--lc); border:1px solid var(--lborder); border-radius:18px; padding:14px; }
    .lumi-compose-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .lumi-compose-textarea { width:100%; background:var(--lb); border:1px solid var(--lborder); border-radius:12px; padding:10px 12px; font-family:'DM Sans','Noto Sans Thai',sans-serif; font-size:13px; color:var(--lt); resize:none; outline:none; min-height:70px; max-height:150px; box-sizing:border-box; }
    .lumi-compose-footer { display:flex; gap:8px; margin-top:10px; align-items:center; }

    /* Sidebar */
    .lumi-sidebar-card { background:var(--lc); border:1px solid var(--lborder); border-radius:14px; padding:13px; margin-bottom:10px; cursor:pointer; transition:.15s; }
    .lumi-sidebar-card:hover { background:var(--la); border-color:var(--lborder); }
    .lumi-sidebar-card.active { border-color:var(--lp); background:color-mix(in srgb,var(--lp) 8%,transparent); }
    .lumi-member-name { font-size:13px; font-weight:600; color:var(--lt); }
    .lumi-member-sub { font-size:11px; color:var(--lsub); margin-top:2px; }

    /* Input & Form */
    .lumi-form-section { padding:12px 14px; }
    .lumi-input { width:100%; background:var(--lc); border:1px solid var(--lborder); border-radius:12px; padding:10px 12px; color:var(--lt); font-family:'DM Sans','Noto Sans Thai',sans-serif; font-size:13px; outline:none; box-sizing:border-box; transition:.15s; }
    .lumi-input:focus { border-color:var(--lp); box-shadow:0 0 0 3px color-mix(in srgb,var(--lp) 15%,transparent); }
    .lumi-label { font-size:11px; color:var(--lsub); margin-bottom:5px; display:block; font-weight:600; letter-spacing:.3px; text-transform:uppercase; }
    .lumi-gen-btn { background:linear-gradient(135deg,var(--lp),var(--ls)); color:#fff; border:none; padding:10px 18px; border-radius:20px; font-family:'DM Sans','Noto Sans Thai',sans-serif; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; font-size:13px; width:100%; transition:.2s; box-shadow:0 3px 12px color-mix(in srgb,var(--lp) 35%,transparent); }
    .lumi-gen-btn:hover { box-shadow:0 5px 18px color-mix(in srgb,var(--lp) 45%,transparent); transform:translateY(-1px); }
    .lumi-gen-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
    .lumi-sm-btn { background:var(--la); color:var(--ls); border:1px solid var(--lborder); padding:8px 14px; border-radius:14px; font-family:'DM Sans','Noto Sans Thai',sans-serif; font-weight:600; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:5px; transition:.15s; }
    .lumi-sm-btn:hover { background:var(--lborder); }
    .lumi-sm-btn:disabled { opacity:.5; cursor:not-allowed; }
    .lumi-set-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px dashed var(--lborder); font-size:13px; color:var(--lt); }
    .lumi-set-row:last-child { border-bottom:none; }
    .lumi-set-row select, .lumi-set-row input[type="number"], .lumi-set-row input[type="text"] { background:var(--lc); border:1px solid var(--lborder); border-radius:8px; padding:5px 8px; color:var(--lt); font-family:'DM Sans','Noto Sans Thai',sans-serif; outline:none; font-size:12px; }
    .lumi-form-block { background:var(--lc); border:1px solid var(--lborder); border-radius:16px; padding:14px; margin-bottom:12px; }
    .lumi-form-block-title { font-size:12px; font-weight:700; color:var(--lsub); text-transform:uppercase; letter-spacing:.5px; margin-bottom:12px; }

    /* Toast */
    .lumi-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(30,30,50,.92); backdrop-filter:blur(12px); padding:10px 20px; border-radius:20px; box-shadow:0 5px 20px rgba(0,0,0,0.2); z-index:999999; font-family:'DM Sans','Noto Sans Thai',sans-serif; font-size:13px; color:#fff; animation:lumiIn .3s; pointer-events:none; white-space:nowrap; }

    /* Loading */
    .lumi-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-radius:50%; border-top-color:#fff; animation:spin .7s linear infinite; }

    /* Hero Banner */
    .lumi-hero { background:linear-gradient(135deg,var(--lp),var(--ls)); padding:18px 16px; color:#fff; position:relative; overflow:hidden; }
    .lumi-hero::before { content:''; position:absolute; top:-30px; right:-30px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,.08); }
    .lumi-hero::after { content:''; position:absolute; bottom:-20px; left:-10px; width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,.05); }
    .lumi-hero-label { font-size:11px; color:rgba(255,255,255,.8); font-weight:600; letter-spacing:.5px; text-transform:uppercase; margin-bottom:4px; display:flex; align-items:center; gap:5px; }
    .lumi-hero-title { font-size:20px; font-weight:700; letter-spacing:-.5px; }
    .lumi-hero-sub { font-size:12px; color:rgba(255,255,255,.75); margin-top:3px; }

    /* Empty State */
    .lumi-empty { text-align:center; padding:50px 20px; }
    .lumi-empty-icon { font-size:48px; margin-bottom:12px; opacity:.35; }
    .lumi-empty-text { font-size:14px; color:var(--lsub); }

    /* Thread layout */
    .lumi-forum-layout { display:flex; gap:12px; padding:12px 14px; min-height:0; }
    .lumi-forum-main { flex:1; overflow-y:auto; min-width:0; max-height:calc(90vh - 220px); padding-right:4px; }
    .lumi-forum-sidebar { width:170px; overflow-y:auto; max-height:calc(90vh - 220px); flex-shrink:0; }
    .lumi-sidebar-title { font-size:11px; font-weight:700; color:var(--lsub); text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; display:flex; align-items:center; gap:5px; }

    /* Rumor Badge */
    .lumi-rumor-badge { font-size:10px; padding:2px 8px; border-radius:20px; font-weight:600; display:inline-flex; align-items:center; gap:3px; }
    .lumi-rumor-unverified { background:#FFF7ED; color:#C2410C; }
    .lumi-rumor-verified { background:#F0FDF4; color:#15803D; }

    @media (max-width:768px) { .lumi-modal{width:97%;height:94dvh;border-radius:20px;} .lumi-forum-layout{flex-direction:column;} .lumi-forum-sidebar{width:100%;max-height:150px;} .lumi-forum-main{max-height:calc(90dvh - 300px);} }
    `;
    document.head.appendChild(el);
}

// ═══════════════════════════════════════════════
// FAB
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-fab,.lumi-menu').remove();
    if (!document.body) return;
    const fab = document.createElement('div'); fab.id = 'lumi-fab';
    const pos = extension_settings[extensionName]._internal.fabPos;
    if (pos) Object.assign(fab.style, pos);
    else { fab.style.top = '50%'; fab.style.right = '20px'; fab.style.transform = 'translateY(-50%)'; }
    document.body.appendChild(fab);

    const menu = document.createElement('div'); menu.className = 'lumi-menu';
    menu.innerHTML = `<div class="lumi-menu-grid">
        <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}"><span>Diary</span></div>
        <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}"><span>Forum</span></div>
        <div class="lumi-menu-item" id="lumi-set"><img src="${iconSettings}"><span>Settings</span></div>
    </div>`;
    document.body.appendChild(menu);

    let isDragging = false, startX, startY, initLeft, initTop, movedDist = 0;
    const THRESHOLD = 10;
    function startDrag(x, y) { isDragging = false; movedDist = 0; startX = x; startY = y; const r = fab.getBoundingClientRect(); initLeft = r.left; initTop = r.top; fab.style.transform = 'none'; }
    function moveDrag(x, y) { const dx = x-startX, dy = y-startY; movedDist = Math.hypot(dx,dy); if(movedDist>THRESHOLD) isDragging=true; if(isDragging) { fab.style.left=(initLeft+dx)+'px'; fab.style.top=(initTop+dy)+'px'; fab.style.right='auto'; fab.style.bottom='auto'; $(menu).fadeOut(100); } }
    function endDrag() { if(isDragging) { extension_settings[extensionName]._internal.fabPos={top:fab.style.top,left:fab.style.left,right:'auto',bottom:'auto',transform:'none'}; SillyTavern.getContext().saveSettingsDebounced(); } else if(movedDist<THRESHOLD) { const r=fab.getBoundingClientRect(); const mW=$(menu).outerWidth()||200; const mH=$(menu).outerHeight()||120; const left=Math.max(10,Math.min(r.left+r.width/2-mW/2,window.innerWidth-mW-10)); const top=Math.max(10,r.top-mH-12); menu.style.left=left+'px'; menu.style.top=top+'px'; $(menu).fadeToggle(180); } isDragging=false; }

    fab.addEventListener('mousedown', e => { if(e.button!==0)return; e.preventDefault(); startDrag(e.clientX,e.clientY); const mv=ev=>moveDrag(ev.clientX,ev.clientY); const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);endDrag();}; document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up); });
    fab.addEventListener('touchstart', e=>{e.preventDefault();startDrag(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    fab.addEventListener('touchmove', e=>{e.preventDefault();moveDrag(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    fab.addEventListener('touchend', e=>{e.preventDefault();endDrag();},{passive:false});

    $('#lumi-diary').on('click',()=>{$(menu).fadeOut();openModal('diary');});
    $('#lumi-forum').on('click',()=>{$(menu).fadeOut();openModal('forum');});
    $('#lumi-set').on('click',()=>{$(menu).fadeOut();openSettingsModal();});
}

// ═══════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`<div id="lumi-overlay" class="lumi-overlay"><div class="lumi-modal"><div class="lumi-head"><button class="lumi-icon-btn" id="lumi-back">${svgBack}</button><h3 id="lumi-title">LumiPulse</h3><button class="lumi-icon-btn" id="lumi-close">${svgClose}</button></div><div id="lumi-body" class="lumi-body"></div></div></div>`);
    $('#lumi-close').on('click', ()=>$('#lumi-overlay').fadeOut(200));
    $('#lumi-overlay').on('click', e=>{ if(e.target.id==='lumi-overlay') $('#lumi-overlay').fadeOut(200); });
    $('#lumi-back').on('click', ()=>{
        const v = $('#lumi-body').data('view');
        if(v==='forum-detail'||v==='forum') renderForumView();
        else renderDashboard();
    });
}

function openModal(type='diary') {
    if (!$('#lumi-overlay').length) createModal();
    $('#lumi-overlay').css('display','flex').hide().fadeIn(200);
    if(type==='forum') renderForumView();
    else renderDashboard();
}

function openSettingsModal() {
    if (!$('#lumi-overlay').length) createModal();
    $('#lumi-overlay').css('display','flex').hide().fadeIn(200);
    renderSettings();
}

// ═══════════════════════════════════════════════
// DIARY
// ═══════════════════════════════════════════════
function renderDashboard() {
    const ctx = SillyTavern.getContext();
    const botId = ctx.characterId;
    const botName = ctx.name2 || 'Unknown';
    const mems = loadMemories({ botId });
    const s = extension_settings[extensionName];
    const filterChar = s._internal.filterChar||'';
    const filterDate = s._internal.filterDate||'';
    const filterLoc  = s._internal.filterLoc||'';
    const chars = [...new Set(mems.map(m=>m.character))].filter(c=>c);
    const dates = [...new Set(mems.map(m=>m.content.rp_date))].filter(d=>d);
    const locs  = [...new Set(mems.map(m=>m.content.rp_location))].filter(l=>l);
    let filtered = mems;
    if(filterChar) filtered = filtered.filter(m=>m.character===filterChar);
    if(filterDate) filtered = filtered.filter(m=>m.content.rp_date===filterDate);
    if(filterLoc)  filtered = filtered.filter(m=>m.content.rp_location===filterLoc);

    $('#lumi-title').text('LumiPulse · Diary');
    const body = $('#lumi-body');
    body.data('view','diary');
    body.html(`
        <div class="lumi-hero">
            <div class="lumi-hero-label">${svgBook} Memories of</div>
            <div class="lumi-hero-title">${escapeHtml(botName)}</div>
            <div class="lumi-hero-sub">${filtered.length} entries</div>
        </div>
        <div class="lumi-stats-bar">
            <div class="lumi-stat"><b>${mems.length}</b><span>Total</span></div>
            <div class="lumi-stat"><b>${chars.length}</b><span>Chars</span></div>
            <div class="lumi-stat"><b>${mems.filter(m=>m.meta.isFavorite).length}</b><span>Favs</span></div>
        </div>
        <div class="lumi-nav">
            <div class="lumi-nav-tab active" data-tab="diary">${svgBook} Diary</div>
            <div class="lumi-nav-tab" data-tab="story">${svgScroll} Story</div>
            <div class="lumi-nav-tab" data-tab="lore">${svgGlobe} Lore</div>
            <div class="lumi-nav-tab" data-tab="links">${svgLink} Links</div>
        </div>
        <div class="lumi-diary-pad">
            <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px;">
                <select id="fc" class="lumi-input" style="flex:1;min-width:90px;font-size:12px;padding:7px 10px;"><option value="">All Chars</option>${chars.map(c=>`<option value="${escapeHtml(c)}"${c===filterChar?' selected':''}>${escapeHtml(c)}</option>`).join('')}</select>
                <select id="fd" class="lumi-input" style="flex:1;min-width:90px;font-size:12px;padding:7px 10px;"><option value="">All Dates</option>${dates.map(d=>`<option value="${escapeHtml(d)}"${d===filterDate?' selected':''}>${escapeHtml(d)}</option>`).join('')}</select>
                <select id="fl" class="lumi-input" style="flex:1;min-width:90px;font-size:12px;padding:7px 10px;"><option value="">All Locs</option>${locs.map(l=>`<option value="${escapeHtml(l)}"${l===filterLoc?' selected':''}>${escapeHtml(l)}</option>`).join('')}</select>
            </div>
            <button id="btn-open-gen" class="lumi-sm-btn" style="width:100%;justify-content:center;margin-bottom:12px;">${svgPlus} Generate Memories</button>
            <div id="gen-form-container" style="display:none;margin-bottom:12px;"></div>
            <div id="lumi-content"></div>
        </div>
    `);

    $('#fc,#fd,#fl').on('change',()=>{
        s._internal.filterChar=$('#fc').val();
        s._internal.filterDate=$('#fd').val();
        s._internal.filterLoc=$('#fl').val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderDashboard();
    });
    $('#btn-open-gen').on('click',()=>{
        if($('#gen-form-container').is(':visible')) $('#gen-form-container').slideUp(200);
        else { renderGeneratorForm(); $('#gen-form-container').slideDown(200); }
    });
    $('.lumi-nav-tab').on('click',function(){
        $('.lumi-nav-tab').removeClass('active'); $(this).addClass('active');
        const t=$(this).data('tab');
        if(t==='diary') renderDiaryTab();
        else if(t==='story') renderStoryWeaver();
        else if(t==='lore') renderLoreExtractor();
        else if(t==='links') renderMemoryLinks();
    });
    renderDiaryTab();
}

function renderDiaryTab() {
    const ctx = SillyTavern.getContext();
    const s = extension_settings[extensionName];
    const mems = loadMemories({ botId: ctx.characterId });
    const filterChar = s._internal.filterChar||'';
    const filterDate = s._internal.filterDate||'';
    const filterLoc  = s._internal.filterLoc||'';
    let filtered = mems;
    if(filterChar) filtered = filtered.filter(m=>m.character===filterChar);
    if(filterDate) filtered = filtered.filter(m=>m.content.rp_date===filterDate);
    if(filterLoc)  filtered = filtered.filter(m=>m.content.rp_location===filterLoc);

    const byDate = {};
    filtered.forEach(m=>{ const d=m.content.rp_date||'Unknown'; if(!byDate[d])byDate[d]=[]; byDate[d].push(m); });
    const sortedDates = Object.keys(byDate).sort();

    if(sortedDates.length===0){
        $('#lumi-content').html(`<div class="lumi-empty"><div class="lumi-empty-icon">📖</div><div class="lumi-empty-text">No memories yet.<br>Generate some from your chat!</div></div>`);
        return;
    }

    let html='';
    sortedDates.forEach(date=>{
        html += `<div class="lumi-timeline-date">${svgCalendar} ${escapeHtml(date)}</div>`;
        byDate[date].forEach((m,i)=>{ html += renderCard(m,i); });
    });
    $('#lumi-content').html(html);
    bindDiaryEvents();
}

function renderCard(m, index) {
    const showSecret = extension_settings[extensionName].diary.display.showSecretSystem;
    const isLocked = showSecret && checkUnlock(m)===false;
    const color = generateColor(m.character);
    const initial = m.character ? m.character.charAt(0).toUpperCase() : '?';
    const locHtml = m.content.rp_location ? `<span class="lumi-badge">${svgMapPin} ${escapeHtml(m.content.rp_location)}</span>`:'';
    const tagsHtml = (m.content.rp_tags&&m.content.rp_tags.length) ? m.content.rp_tags.map(t=>`<span class="lumi-badge">${svgTag} ${t}</span>`).join(''):'';
    const moodHtml = m.content.mood ? `<span class="lumi-badge">${svgMood} ${escapeHtml(m.content.mood)}</span>`:'';

    if(isLocked) return `<div class="lumi-card" data-id="${m.id}"><div class="lumi-char-row"><div class="lumi-avatar" style="background:${color}">${initial}</div><div class="lumi-char-name">${escapeHtml(m.character)}</div></div><div style="text-align:center;padding:16px 0;color:var(--lsub);">${svgLock}<div style="font-size:12px;margin-top:6px;">Locked memory</div></div></div>`;

    return `<div class="lumi-card" data-id="${m.id}">
        <div class="lumi-char-row">
            <div class="lumi-avatar" style="background:${color}">${initial}</div>
            <div class="lumi-char-name">${escapeHtml(m.character)}</div>
            ${m.meta.isFavorite?`<span style="color:var(--lp);font-size:14px;">♥</span>`:''}
        </div>
        <div class="lumi-card-meta">${moodHtml}${locHtml}${tagsHtml}</div>
        <div class="lumi-text">${escapeHtml(m.content.diary)}</div>
        <div class="lumi-card-actions">
            <button class="lumi-act${m.meta.isPinned?' active':''}" data-act="pin">${svgPin} Pin</button>
            <button class="lumi-act${m.meta.isFavorite?' active':''}" data-act="fav">${m.meta.isFavorite?svgHeartFill:svgHeart} Like</button>
            <button class="lumi-act" data-act="edit-inline">${svgEdit} Edit</button>
            <button class="lumi-act danger" data-act="del">${svgTrash}</button>
        </div>
    </div>`;
}

function renderGeneratorForm() {
    $('#gen-form-container').html(`<div class="lumi-form-block">
        <div class="lumi-form-block-title">Generate Memories</div>
        <label class="lumi-label" style="margin-bottom:8px;">Scan Mode</label>
        <div style="display:flex;gap:7px;margin-bottom:10px;">
            <label style="flex:1;text-align:center;padding:8px;background:var(--lc);border:1px solid var(--lborder);border-radius:10px;cursor:pointer;font-size:12px;transition:.15s;" class="gen-mode-label">
                <input type="radio" name="gen-mode" value="latest" checked style="display:none;"> Latest
            </label>
            <label style="flex:1;text-align:center;padding:8px;background:var(--lc);border:1px solid var(--lborder);border-radius:10px;cursor:pointer;font-size:12px;transition:.15s;" class="gen-mode-label">
                <input type="radio" name="gen-mode" value="first" style="display:none;"> First
            </label>
            <label style="flex:1;text-align:center;padding:8px;background:var(--lc);border:1px solid var(--lborder);border-radius:10px;cursor:pointer;font-size:12px;transition:.15s;" class="gen-mode-label">
                <input type="radio" name="gen-mode" value="all" style="display:none;"> All
            </label>
        </div>
        <div id="gen-count-wrap" style="margin-bottom:10px;">
            <label class="lumi-label">Message Count</label>
            <input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input" style="font-size:13px;">
        </div>
        <button id="btn-run-gen" class="lumi-gen-btn">${svgPlus} Analyze & Generate</button>
    </div>`);
    // Style the radio labels on change
    $('input[name="gen-mode"]').on('change',function(){
        $('.gen-mode-label').css({background:'var(--lc)',color:'var(--lt)',borderColor:'var(--lborder)'});
        $(this).closest('.gen-mode-label').css({background:'var(--lp)',color:'#fff',borderColor:'var(--lp)'});
        $('#gen-count-wrap').toggle($(this).val()!=='all');
    }).first().trigger('change');
    $('#btn-run-gen').on('click', generateBatchMemories);
}

function renderStoryWeaver() {
    const ctx = SillyTavern.getContext();
    const mems = loadMemories({botId:ctx.characterId}).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    $('#lumi-content').html(`<div class="lumi-form-block">
        <div class="lumi-form-block-title">Story Weaver</div>
        <p style="font-size:12px;color:var(--lsub);margin:0 0 12px;">Weave all diary entries into a cohesive narrative story.</p>
        <button id="btn-weave" class="lumi-gen-btn">${svgScroll} Weave Story</button>
    </div>
    <div id="sw-output" style="display:none;background:var(--lc);border:1px solid var(--lborder);border-radius:14px;padding:14px;font-size:13px;line-height:1.65;white-space:pre-wrap;max-height:300px;overflow-y:auto;"></div>
    <div id="sw-actions" style="display:none;padding:10px 0;">
        <button id="btn-export-story" class="lumi-gen-btn">${svgBook} Export .md</button>
    </div>`);
    $('#btn-weave').on('click',async function(){
        $(this).html(`<span class="lumi-spinner"></span> Weaving...`).prop('disabled',true);
        const story = await weaveStory(mems);
        $(this).html(`${svgScroll} Weave Story`).prop('disabled',false);
        if(story){$('#sw-output').text(story).show();$('#sw-actions').show();$('#btn-export-story').off('click').on('click',()=>exportText(story,'LumiPulse_Story.md'));}
    });
}

async function weaveStory(mems) {
    const ctx = SillyTavern.getContext();
    const diaryText = mems.map(m=>`[${m.character} | ${m.content.rp_date}] ${m.content.diary}`).join('\n\n');
    const prompt = `[System: Weave diary entries into cohesive narrative.]
Diaries:
${diaryText}
Rules: Chronological order, smooth transitions, Markdown chapters, keep character voices.`;
    try {
        let res;
        if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(prompt,false,false);
        else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(prompt,true);
        return res||"Failed.";
    } catch(e){return "Error weaving story.";}
}

function renderLoreExtractor() {
    $('#lumi-content').html(`<div class="lumi-form-block">
        <div class="lumi-form-block-title">Lore Extractor</div>
        <p style="font-size:12px;color:var(--lsub);margin:0 0 12px;">Generate SillyTavern-compatible World Info JSON from memories.</p>
        <button id="btn-extract-lore" class="lumi-gen-btn">${svgGlobe} Extract Lore</button>
    </div>
    <div id="lore-output" style="display:none;"></div>`);
    $('#btn-extract-lore').on('click',async function(){
        $(this).html(`<span class="lumi-spinner"></span> Extracting...`).prop('disabled',true);
        const ctx=SillyTavern.getContext();const mems=loadMemories({botId:ctx.characterId});
        const lore=await extractLore(mems);
        $(this).html(`${svgGlobe} Extract Lore`).prop('disabled',false);
        if(lore&&lore.entries&&Object.keys(lore.entries).length){
            let html=`<table style="width:100%;border-collapse:collapse;font-size:12px;"><tr style="background:var(--la);"><th style="padding:8px;text-align:left;color:var(--ls);">Keyword</th><th style="padding:8px;text-align:left;color:var(--ls);">Type</th><th style="padding:8px;text-align:left;color:var(--ls);">Preview</th></tr>`;
            Object.values(lore.entries).forEach(l=>html+=`<tr style="border-bottom:1px solid var(--lborder);"><td style="padding:8px;font-weight:600;">${escapeHtml(l.key[0])}</td><td style="padding:8px;">${l.comment}</td><td style="padding:8px;color:var(--lsub);">${escapeHtml(l.content).slice(0,60)}...</td></tr>`);
            html+=`</table><div style="padding:12px 0;"><button id="btn-export-lore" class="lumi-gen-btn">${svgBook} Export JSON</button></div>`;
            $('#lore-output').html(html).show();
            $('#btn-export-lore').off('click').on('click',()=>exportJSON(lore,'LumiPulse_Lorebook.json'));
        } else { $('#lore-output').html('<div style="text-align:center;padding:20px;color:var(--lsub);">No lore found.</div>').show(); }
    });
}

async function extractLore(mems) {
    const ctx=SillyTavern.getContext();
    const text=mems.map(m=>`[${m.character}] ${m.content.diary}`).join('\n');
    const prompt=`[System: Extract World Info for SillyTavern Lorebook.]
Text:
${text}
Return ONLY JSON array: [{"keyword":"Name/Place/Item","type":"character|location|item|event|rule","content":"Brief description"}]`;
    try{
        let res;
        if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(prompt,false,false);
        else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(prompt,true);
        const match=res?.match(/\[[\s\S]*\]/);
        if(!match) return {entries:{}};
        const data=JSON.parse(match[0]);
        const entries={};
        data.forEach((item,i)=>{entries[i]={uid:i,key:[item.keyword],keysecondary:[],comment:item.type,content:item.content,constant:false,selective:true,selectiveLogic:0,addMemo:true,order:10,position:0,disable:false,probability:100,useProbability:true,depth:4,group:"LumiPulse",displayIndex:i};});
        return {entries};
    } catch(e){return {entries:{}};}
}

function renderMemoryLinks() {
    const ctx=SillyTavern.getContext();const mems=loadMemories({botId:ctx.characterId});
    const linkedMems=mems.filter(m=>m.meta.linkedIds&&m.meta.linkedIds.length>0);
    let html=linkedMems.length===0?`<div class="lumi-empty"><div class="lumi-empty-icon">🔗</div><div class="lumi-empty-text">No linked memories yet.</div></div>`:'';
    linkedMems.forEach(m=>{
        const links=m.meta.linkedIds.map(id=>{const linked=mems.find(x=>x.id===id);return linked?`<div class="lumi-badge" style="cursor:pointer;margin:3px 0;" data-id="${linked.id}">${svgLink} ${linked.character} · ${linked.content.rp_date}</div>`:''}).join('');
        html+=`<div class="lumi-card"><div class="lumi-char-row"><div class="lumi-avatar" style="background:${generateColor(m.character)}">${m.character.charAt(0)}</div><div class="lumi-char-name">${m.character}</div></div><div style="font-size:11px;color:var(--lsub);margin-bottom:6px;">Linked Memories:</div>${links}</div>`;
    });
    $('#lumi-content').html(html);
    $('[data-id]').off('click').on('click',function(){
        const mem=mems.find(m=>m.id===$(this).data('id'));
        if(mem){$('#lumi-content').html(renderCard(mem,0)+`<button id="back-links" class="lumi-sm-btn" style="margin-top:12px;width:100%;justify-content:center;">${svgBack} Back</button>`);$('#back-links').on('click',()=>renderMemoryLinks());}
    });
}

function bindDiaryEvents() {
    $('.lumi-act').off('click').on('click',function(e){
        e.stopPropagation();
        const id=$(this).closest('.lumi-card').data('id');
        const act=$(this).data('act');
        const mem=extension_settings[extensionName].memories.find(m=>m.id===id);
        if(!mem) return;
        if(act==='pin'){mem.meta.isPinned=!mem.meta.isPinned;SillyTavern.getContext().saveSettingsDebounced();renderDiaryTab();}
        if(act==='fav'){mem.meta.isFavorite=!mem.meta.isFavorite;SillyTavern.getContext().saveSettingsDebounced();renderDiaryTab();}
        if(act==='edit-inline') editMemoryInline(id);
        if(act==='del'){if(confirm('Delete this memory?')){extension_settings[extensionName].memories=extension_settings[extensionName].memories.filter(m=>m.id!==id);SillyTavern.getContext().saveSettingsDebounced();renderDiaryTab();}}
    });
}

// ═══════════════════════════════════════════════
// FORUM VIEW
// ═══════════════════════════════════════════════
function renderForumView() {
    const ctx = SillyTavern.getContext();
    const botId = getCurrentBotId();
    const botName = ctx.name2 || 'Unknown';
    const posts = getBotForumPosts();
    const threads = posts.filter(p=>p.type==='thread');
    const members = getForumCharacters();

    $('#lumi-title').text('LumiPulse · Forum');
    const body = $('#lumi-body');
    body.data('view','forum');
    body.html(`
        <div class="lumi-hero">
            <div class="lumi-hero-label">${svgForum} Community Forum</div>
            <div class="lumi-hero-title">${escapeHtml(botName)}</div>
            <div class="lumi-hero-sub">${threads.length} threads · ${members.length} members</div>
        </div>
        <div class="lumi-nav">
            <div class="lumi-nav-tab active" data-ftab="feed">${svgForum} Feed</div>
            <div class="lumi-nav-tab" data-ftab="members">${svgNetwork} Members</div>
        </div>
        <div class="lumi-compose-box">
            <div class="lumi-compose-header">
                <div class="lumi-post-avatar" style="background:${generateColor(ctx.name1||'Player')}">${(ctx.name1||'P').charAt(0)}</div>
                <span style="font-size:13px;color:var(--lsub);font-weight:500;">What's on your mind?</span>
            </div>
            <textarea id="compose-text" class="lumi-compose-textarea" placeholder="Write a post..."></textarea>
            <div class="lumi-compose-footer">
                <button id="btn-submit-post" class="lumi-sm-btn">${svgSend} Post</button>
                <button id="btn-gen-ai" class="lumi-sm-btn" style="margin-left:auto;">${svgSpark} AI Generate</button>
            </div>
        </div>
        <div class="lumi-forum-layout">
            <div class="lumi-forum-main" id="forum-main-content"></div>
            <div class="lumi-forum-sidebar">
                <div class="lumi-sidebar-title">${svgNetwork} Members</div>
                <div id="sidebar-members"></div>
            </div>
        </div>
    `);

    // Bind tab
    $('.lumi-nav-tab[data-ftab]').on('click',function(){
        $('.lumi-nav-tab[data-ftab]').removeClass('active'); $(this).addClass('active');
        if($(this).data('ftab')==='feed') renderForumFeed();
        else renderForumMembers();
    });

    // Submit post
    $('#btn-submit-post').on('click', async function(){
        const content = $('#compose-text').val().trim();
        if(!content){showToast('Please write something first');return;}
        const $btn = $(this);
        $btn.html(`<span class="lumi-spinner" style="border-top-color:var(--ls);border-color:var(--lborder);"></span>`).prop('disabled',true);
        await submitUserPost(content);
        $btn.html(`${svgSend} Post`).prop('disabled',false);
    });

    // AI Generate
    $('#btn-gen-ai').on('click', async function(){
        const $btn = $(this);
        $btn.html(`<span class="lumi-spinner" style="border-top-color:var(--ls);border-color:var(--lborder);"></span>`).prop('disabled',true);
        await generateForumPosts();
        $btn.html(`${svgSpark} AI Generate`).prop('disabled',false);
    });

    renderForumFeed();
    renderSidebarMembers();
}

// ─── FEED ───
function renderForumFeed() {
    const posts = getBotForumPosts();
    const threads = posts.filter(p=>p.type==='thread').sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));

    if(threads.length===0){
        $('#forum-main-content').html(`<div class="lumi-empty"><div class="lumi-empty-icon">💬</div><div class="lumi-empty-text">No posts yet.<br>Be the first to post or use AI Generate!</div></div>`);
        return;
    }

    let html = '';
    threads.forEach(thread => {
        const replies = posts.filter(p=>p.parentId===thread.id);
        const color = generateColor(thread.author);
        const initial = thread.author ? thread.author.charAt(0).toUpperCase() : '?';
        const likeCount = thread.likes || 0;
        const userLiked = thread.likedBy && thread.likedBy.includes('__player__');

        html += `<div class="lumi-post-card" data-id="${thread.id}">
            <div class="lumi-post-header">
                <div class="lumi-post-avatar" style="background:${color}">${initial}</div>
                <div class="lumi-post-author">
                    <div class="lumi-post-author-name">${escapeHtml(thread.author)}</div>
                    <div class="lumi-post-time">${timeAgo(thread.timestamp)}</div>
                </div>
                ${thread.threadTag?`<span class="lumi-post-thread-tag">${escapeHtml(thread.threadTag)}</span>`:''}
                <button class="lumi-act danger" data-act="del-post" data-id="${thread.id}" style="margin-left:auto;padding:4px;font-size:11px;">${svgTrash}</button>
            </div>
            ${thread.title?`<div style="font-size:14px;font-weight:700;color:var(--lt);margin-bottom:6px;">${escapeHtml(thread.title)}</div>`:''}
            <div class="lumi-post-body">${escapeHtml(thread.content)}</div>
            <div class="lumi-post-actions">
                <button class="lumi-post-btn${userLiked?' liked':''}" data-act="like" data-id="${thread.id}">
                    ${userLiked?svgHeartFill:svgHeart} ${likeCount>0?likeCount:''} Like
                </button>
                <button class="lumi-post-btn" data-act="reply-toggle" data-id="${thread.id}">
                    ${svgComment} ${replies.length>0?replies.length+' ':''} Reply
                </button>
                <button class="lumi-post-btn" data-act="ai-reply" data-id="${thread.id}">
                    ${svgSpark} AI Reply
                </button>
            </div>
            <div class="lumi-replies-container" id="replies-${thread.id}">
                ${replies.map(r=>renderReplyHTML(r)).join('')}
                <div class="lumi-reply-input-row">
                    <textarea class="lumi-reply-input" placeholder="Write a reply..." data-thread="${thread.id}" rows="1"></textarea>
                    <button class="lumi-reply-send" data-act="send-reply" data-thread="${thread.id}">${svgSend}</button>
                </div>
            </div>
        </div>`;
    });
    $('#forum-main-content').html(html);
    bindForumFeedEvents();
}

function renderReplyHTML(reply) {
    const color = generateColor(reply.author);
    const initial = reply.author ? reply.author.charAt(0).toUpperCase() : '?';
    const isPlayer = reply.author === (SillyTavern.getContext().name1||'Player');
    return `<div class="lumi-reply-card">
        <div class="lumi-reply-header">
            <div class="lumi-reply-avatar" style="background:${color}">${initial}</div>
            <div class="lumi-reply-name">${escapeHtml(reply.author)}${isPlayer?' (You)':''}</div>
            <div class="lumi-reply-time" style="margin-left:auto;">${timeAgo(reply.timestamp)}</div>
        </div>
        <div class="lumi-reply-body">${escapeHtml(reply.content)}</div>
    </div>`;
}

function bindForumFeedEvents() {
    // Like
    $('[data-act="like"]').off('click').on('click',function(){
        const id = $(this).data('id');
        const posts = getBotForumPosts();
        const post = posts.find(p=>p.id===id);
        if(!post) return;
        if(!post.likedBy) post.likedBy = [];
        const idx = post.likedBy.indexOf('__player__');
        if(idx>=0){ post.likedBy.splice(idx,1); post.likes=Math.max(0,(post.likes||0)-1); }
        else { post.likedBy.push('__player__'); post.likes=(post.likes||0)+1; }
        saveBotForumPosts(posts);
        // Animate
        $(this).addClass('liked').css('animation','lumiPop .3s');
        setTimeout(()=>$(this).css('animation',''),300);
        renderForumFeed();
    });

    // Reply toggle
    $('[data-act="reply-toggle"]').off('click').on('click',function(){
        const id = $(this).data('id');
        const $box = $(`#replies-${id}`);
        $box.is(':visible') ? $box.slideUp(180) : $box.slideDown(180);
    });

    // Send reply (player)
    $('[data-act="send-reply"]').off('click').on('click', async function(){
        const threadId = $(this).data('thread');
        const $textarea = $(`.lumi-reply-input[data-thread="${threadId}"]`);
        const content = $textarea.val().trim();
        if(!content) return;
        const ctx = SillyTavern.getContext();
        const newReply = {
            id: 'reply_'+Date.now(),
            type: 'reply',
            author: ctx.name1 || 'Player',
            content,
            timestamp: new Date().toISOString(),
            parentId: threadId,
            likes: 0,
            likedBy: []
        };
        const posts = getBotForumPosts();
        posts.push(newReply);
        saveBotForumPosts(posts);
        $textarea.val('');
        renderForumFeed();
        // After player posts, AI characters might respond
        setTimeout(()=>generateAIReplyToPost(threadId), 800);
    });

    // AI Reply
    $('[data-act="ai-reply"]').off('click').on('click', async function(){
        const threadId = $(this).data('id');
        const $btn = $(this);
        $btn.html(`<span class="lumi-spinner" style="border-top-color:var(--ls);border-color:var(--lborder);width:12px;height:12px;"></span>`).prop('disabled',true);
        await generateAIReplyToPost(threadId);
        $btn.html(`${svgSpark} AI Reply`).prop('disabled',false);
    });

    // Delete post
    $('[data-act="del-post"]').off('click').on('click',function(e){
        e.stopPropagation();
        const id = $(this).data('id');
        if(!confirm('Delete this post and its replies?')) return;
        const posts = getBotForumPosts();
        saveBotForumPosts(posts.filter(p=>p.id!==id && p.parentId!==id));
        renderForumFeed();
    });

    // Auto-resize textareas
    $('.lumi-reply-input').on('input',function(){
        this.style.height='auto';
        this.style.height=Math.min(this.scrollHeight,80)+'px';
    });
}

// ─── Members Sidebar ───
function renderSidebarMembers() {
    const members = getForumCharacters();
    if(members.length===0){$('#sidebar-members').html(`<div style="font-size:12px;color:var(--lsub);text-align:center;padding:10px;">No members yet</div>`);return;}
    let html='';
    members.forEach(char=>{
        const posts = getBotForumPosts().filter(p=>p.author===char&&p.type==='thread');
        const color = generateColor(char);
        html+=`<div class="lumi-sidebar-card" data-char="${escapeHtml(char)}">
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:28px;height:28px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;flex-shrink:0;">${char.charAt(0)}</div>
                <div>
                    <div class="lumi-member-name">${escapeHtml(char)}</div>
                    <div class="lumi-member-sub">${posts.length} posts</div>
                </div>
            </div>
        </div>`;
    });
    $('#sidebar-members').html(html);
    $('.lumi-sidebar-card').on('click',function(){
        const char=$(this).data('char');
        showMemberProfile(char);
    });
}

function renderForumMembers() {
    const members = getForumCharacters();
    const posts = getBotForumPosts();
    let html='';
    if(members.length===0){ html=`<div class="lumi-empty"><div class="lumi-empty-icon">👥</div><div class="lumi-empty-text">No members yet.</div></div>`; }
    else {
        members.forEach(char=>{
            const charPosts = posts.filter(p=>p.author===char&&p.type==='thread');
            const charReplies = posts.filter(p=>p.author===char&&p.type==='reply');
            const totalLikes = charPosts.reduce((s,p)=>s+(p.likes||0),0);
            const color = generateColor(char);
            html+=`<div class="lumi-post-card" style="cursor:pointer;" data-char="${escapeHtml(char)}">
                <div class="lumi-post-header">
                    <div class="lumi-post-avatar" style="background:${color}">${char.charAt(0)}</div>
                    <div class="lumi-post-author">
                        <div class="lumi-post-author-name">${escapeHtml(char)}</div>
                        <div class="lumi-post-time">${charPosts.length} posts · ${charReplies.length} replies · ${totalLikes} likes</div>
                    </div>
                </div>
            </div>`;
        });
    }
    $('#forum-main-content').html(html);
    $('[data-char]').off('click').on('click',function(){ showMemberProfile($(this).data('char')); });
}

function showMemberProfile(char) {
    const posts = getBotForumPosts().filter(p=>p.author===char&&p.type==='thread');
    const color = generateColor(char);
    let html=`<div style="text-align:center;padding:16px;">
        <div style="width:56px;height:56px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:700;margin:0 auto 10px;">${char.charAt(0)}</div>
        <div style="font-size:16px;font-weight:700;color:var(--lt);">${escapeHtml(char)}</div>
        <div style="font-size:12px;color:var(--lsub);margin-top:4px;">${posts.length} posts</div>
    </div>
    <div style="padding:0 14px;"><div style="font-size:12px;font-weight:700;color:var(--lsub);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;">Recent Posts</div>`;
    if(posts.length===0){ html+=`<div class="lumi-empty" style="padding:20px;"><div class="lumi-empty-text">No posts yet</div></div>`; }
    else {
        posts.slice(-5).reverse().forEach(p=>{
            html+=`<div style="background:var(--lc);border:1px solid var(--lborder);border-radius:12px;padding:10px;margin-bottom:8px;">
                ${p.title?`<div style="font-size:13px;font-weight:600;margin-bottom:4px;">${escapeHtml(p.title)}</div>`:''}
                <div style="font-size:12px;color:var(--lsub);">${escapeHtml(p.content).slice(0,80)}${p.content.length>80?'...':''}</div>
                <div style="font-size:10px;color:var(--lsub);margin-top:5px;">${timeAgo(p.timestamp)}</div>
            </div>`;
        });
    }
    html+=`</div><div style="padding:12px 14px;"><button id="back-to-feed" class="lumi-sm-btn" style="width:100%;justify-content:center;">${svgBack} Back to Feed</button></div>`;
    $('#forum-main-content').html(html);
    $('#back-to-feed').on('click',()=>renderForumFeed());
}

// ═══════════════════════════════════════════════
// FORUM ACTIONS
// ═══════════════════════════════════════════════

// ✅ Submit player post
async function submitUserPost(content) {
    const ctx = SillyTavern.getContext();
    const newPost = {
        id: 'post_'+Date.now(),
        type: 'thread',
        author: ctx.name1 || 'Player',
        title: null,
        content,
        timestamp: new Date().toISOString(),
        parentId: null,
        likes: 0,
        likedBy: [],
        threadTag: 'Discussion'
    };
    const posts = getBotForumPosts();
    posts.push(newPost);
    saveBotForumPosts(posts);
    $('#compose-text').val('');
    renderForumFeed();
    renderSidebarMembers();
    showToast('✅ Posted!');
    // AI characters may respond
    setTimeout(()=>generateAIReplyToPost(newPost.id), 1200);
}

// ✅ AI Generate forum posts - FIXED: no renderForum() inside, returns bool
async function generateForumPosts() {
    const ctx = SillyTavern.getContext();
    const chat = ctx.chat || [];
    const recentChat = chat.slice(-25);
    const characters = getForumCharacters();

    if(characters.length===0){showToast('No characters found in chat');return false;}

    const prompt = `[System: You are generating social forum posts for characters in a roleplay.]
Recent chat:
${recentChat.map(m=>`[${m.is_user?'User':m.name}]: ${(m.mes||'').slice(0,100)}`).join('\n')}

Active characters: ${characters.join(', ')}

Generate 2-4 forum posts from different characters reacting to recent events.
Each post should feel authentic to the character's personality and voice.
Vary post types: some are new topics, some are reactions.

Return ONLY a valid JSON array (no markdown, no extra text):
[{"author":"Character Name","title":"Optional thread title or null","content":"Post content (1-3 sentences, natural voice)","threadTag":"Gossip|Event|Question|Rant|Update"}]`;

    try {
        let res;
        if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(prompt,false,false);
        else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(prompt,true);

        if(!res){showToast('No AI response');return false;}

        // Clean up response
        const cleaned = res.replace(/```json/g,'').replace(/```/g,'').trim();
        const match = cleaned.match(/\[[\s\S]*\]/);
        if(!match){showToast('AI returned unexpected format');return false;}

        const newPosts = JSON.parse(match[0]);
        if(!Array.isArray(newPosts)||newPosts.length===0){showToast('No posts in response');return false;}

        const existing = getBotForumPosts();
        const toAdd = newPosts.map(p=>({
            id: 'post_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),
            type: 'thread',
            author: p.author||characters[0],
            title: p.title||null,
            content: p.content||'...',
            threadTag: p.threadTag||'Update',
            timestamp: new Date().toISOString(),
            parentId: null,
            likes: 0,
            likedBy: []
        }));
        saveBotForumPosts([...existing, ...toAdd]);

        showToast(`✅ Generated ${toAdd.length} posts!`);
        renderForumFeed();     // ✅ Only refresh content, not full page
        renderSidebarMembers();
        return true;
    } catch(e) {
        console.error('[LumiPulse] generateForumPosts error:', e);
        showToast('Error: '+e.message);
        return false;
    }
}

// ✅ AI Reply to specific post
async function generateAIReplyToPost(threadId) {
    const ctx = SillyTavern.getContext();
    const posts = getBotForumPosts();
    const thread = posts.find(p=>p.id===threadId);
    if(!thread) return;

    const existingReplies = posts.filter(p=>p.parentId===threadId);
    const characters = getForumCharacters().filter(c=>c!==thread.author);
    if(characters.length===0) return;

    // Pick 1-2 characters who haven't replied recently
    const recentRepliers = existingReplies.slice(-3).map(r=>r.author);
    const eligible = characters.filter(c=>!recentRepliers.includes(c));
    if(eligible.length===0) return;

    const replier = eligible[Math.floor(Math.random()*eligible.length)];
    const numReplies = Math.random()>0.6?2:1;

    const prompt = `[System: Generate authentic forum replies for characters in a roleplay.]
Original post by ${thread.author}:
${thread.title?`"${thread.title}" - `:''}${thread.content}

${existingReplies.length>0?`Previous replies:\n${existingReplies.slice(-3).map(r=>`[${r.author}]: ${r.content}`).join('\n')}`:''}

Generate ${numReplies} reply(ies) from: ${numReplies===1?replier:eligible.slice(0,2).join(', ')}

Rules:
- Feel natural, like real social media replies
- Can agree, disagree, tease, ask questions, add info
- Keep each reply to 1-2 sentences
- Stay in character

Return ONLY valid JSON array:
[{"author":"Character Name","content":"Reply content"}]`;

    try {
        let res;
        if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(prompt,false,false);
        else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(prompt,true);
        if(!res) return;

        const cleaned = res.replace(/```json/g,'').replace(/```/g,'').trim();
        const match = cleaned.match(/\[[\s\S]*\]/);
        if(!match) return;

        const replies = JSON.parse(match[0]);
        const existing = getBotForumPosts();
        const newReplies = replies.map((r,i)=>({
            id: 'reply_'+Date.now()+'_'+i,
            type: 'reply',
            author: r.author||replier,
            content: r.content||'...',
            timestamp: new Date(Date.now()+i*1000).toISOString(),
            parentId: threadId,
            likes: 0,
            likedBy: []
        }));

        saveBotForumPosts([...existing, ...newReplies]);
        // Only refresh if forum feed is currently visible
        if($('#forum-main-content').length) renderForumFeed();
    } catch(e) {
        console.error('[LumiPulse] generateAIReplyToPost error:', e);
    }
}

function getForumCharacters() {
    const ctx = SillyTavern.getContext();
    const chars = new Set();
    if(ctx.chat){ctx.chat.slice(-50).forEach(m=>{ if(m.name&&!m.is_user) chars.add(m.name); });}
    if(ctx.name2) chars.add(ctx.name2);
    return Array.from(chars);
}

// ═══════════════════════════════════════════════
// SETTINGS - FIXED: no blank white page
// ═══════════════════════════════════════════════
function renderSettings() {
    if(!$('#lumi-overlay').length) createModal();
    $('#lumi-title').text('LumiPulse · Settings');

    const s = extension_settings[extensionName];
    const ag = s.diary.autoGen;
    const fg = s.forum.autoGen;
    const savedTheme = s._internal.theme || 'pink';

    // ✅ Build HTML string, then assign — no blank page
    const html = `<div style="padding:12px 14px 20px;">

        <div class="lumi-form-block">
            <div class="lumi-form-block-title">Appearance</div>
            <label class="lumi-label">Theme</label>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:0;">
                ${Object.entries(themes).map(([k,v])=>`<label style="display:flex;align-items:center;gap:8px;padding:10px;border:2px solid ${k===savedTheme?v.secondary:'var(--lborder)'};border-radius:12px;cursor:pointer;background:${k===savedTheme?v.accent:'var(--lc)'};transition:.15s;">
                    <input type="radio" name="lumi-theme" value="${k}" ${k===savedTheme?'checked':''} style="display:none;">
                    <div style="width:18px;height:18px;border-radius:50%;background:${v.secondary};flex-shrink:0;"></div>
                    <span style="font-size:12px;font-weight:600;color:${k===savedTheme?v.secondary:'var(--lt)'};">${v.name}</span>
                </label>`).join('')}
            </div>
        </div>

        <div class="lumi-form-block">
            <div class="lumi-form-block-title">General</div>
            <div class="lumi-set-row"><span>Extension Enabled</span><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lp);"></div>
            <div class="lumi-set-row"><span>World Mode</span><select id="set-wm"><option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option><option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option><option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option></select></div>
        </div>

        <div class="lumi-form-block">
            <div class="lumi-form-block-title">Diary Auto-Generation</div>
            <div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="ag-en" ${ag.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lp);"></div>
            <div class="lumi-set-row"><span>Trigger</span><select id="ag-tr"><option value="turn_count" ${ag.triggerType==='turn_count'?'selected':''}>Every X Msgs</option><option value="emotion" ${ag.triggerType==='emotion'?'selected':''}>Keywords</option><option value="random" ${ag.triggerType==='random'?'selected':''}>Random</option></select></div>
            ${ag.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Interval (msgs)</span><input type="number" id="ag-int" value="${ag.turnInterval}" min="5" max="100" style="width:65px;"></div>`:''}
            ${ag.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="ag-chance" value="${Math.round(ag.randomChance*100)}" min="1" max="50" style="width:65px;"></div>`:''}
            ${ag.triggerType==='emotion'?`<div class="lumi-set-row" style="flex-direction:column;align-items:flex-start;gap:6px;"><span>Keywords (comma-separated)</span><input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" style="width:100%;box-sizing:border-box;"></div>`:''}
        </div>

        <div class="lumi-form-block">
            <div class="lumi-form-block-title">Forum Auto-Generation</div>
            <div class="lumi-set-row"><span>Forum Enabled</span><input type="checkbox" id="forum-en" ${s.forum.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lp);"></div>
            <div class="lumi-set-row"><span>Auto-Gen Enabled</span><input type="checkbox" id="forum-ag-en" ${fg.enabled?'checked':''} style="width:20px;height:20px;accent-color:var(--lp);"></div>
            <div class="lumi-set-row"><span>Trigger</span><select id="forum-ag-tr"><option value="turn_count" ${fg.triggerType==='turn_count'?'selected':''}>Every X Msgs</option><option value="time_interval" ${fg.triggerType==='time_interval'?'selected':''}>Every X Min</option><option value="random" ${fg.triggerType==='random'?'selected':''}>Random</option></select></div>
            ${fg.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Messages</span><input type="number" id="forum-ag-int" value="${fg.turnInterval}" min="5" max="100" style="width:65px;"></div>`:''}
            ${fg.triggerType==='time_interval'?`<div class="lumi-set-row"><span>Minutes</span><input type="number" id="forum-time-int" value="${fg.timeInterval}" min="1" max="60" style="width:65px;"></div>`:''}
            ${fg.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="forum-ag-chance" value="${Math.round(fg.randomChance*100)}" min="1" max="50" style="width:65px;"></div>`:''}
        </div>

        <div class="lumi-form-block">
            <div class="lumi-form-block-title">Data Management</div>
            <div style="display:flex;gap:8px;">
                <button id="btn-rst" class="lumi-sm-btn" style="flex:1;justify-content:center;">${svgBack} Reset FAB</button>
                <button id="btn-clr" class="lumi-sm-btn" style="flex:1;justify-content:center;background:#FFF0F0;color:var(--ldanger);border-color:#FFD0D0;">${svgTrash} Clear All Data</button>
            </div>
        </div>
    </div>`;

    // ✅ Set html THEN bind events — prevents blank page
    $('#lumi-body').html(html);

    // Bind all settings events
    $('input[name="lumi-theme"]').on('change',function(){
        s._internal.theme=$(this).val();
        applyTheme(s._internal.theme);
        SillyTavern.getContext().saveSettingsDebounced();
        renderSettings(); // re-render to update selected state
    });
    $('#set-en').on('change',function(){s.isEnabled=$(this).prop('checked');SillyTavern.getContext().saveSettingsDebounced();});
    $('#set-wm').on('change',function(){s.diary.worldMode=$(this).val();SillyTavern.getContext().saveSettingsDebounced();});
    $('#ag-en').on('change',function(){s.diary.autoGen.enabled=$(this).prop('checked');SillyTavern.getContext().saveSettingsDebounced();});
    $('#ag-tr').on('change',function(){s.diary.autoGen.triggerType=$(this).val();SillyTavern.getContext().saveSettingsDebounced();renderSettings();});
    $('#ag-int').on('change',function(){s.diary.autoGen.turnInterval=parseInt($(this).val())||20;SillyTavern.getContext().saveSettingsDebounced();});
    $('#ag-chance').on('change',function(){s.diary.autoGen.randomChance=(parseInt($(this).val())||10)/100;SillyTavern.getContext().saveSettingsDebounced();});
    $('#ag-kw').on('change',function(){s.diary.autoGen.emotionKeywords=$(this).val().split(',').map(k=>k.trim()).filter(k=>k);SillyTavern.getContext().saveSettingsDebounced();});
    $('#forum-en').on('change',function(){s.forum.enabled=$(this).prop('checked');SillyTavern.getContext().saveSettingsDebounced();});
    $('#forum-ag-en').on('change',function(){s.forum.autoGen.enabled=$(this).prop('checked');SillyTavern.getContext().saveSettingsDebounced();});
    $('#forum-ag-tr').on('change',function(){s.forum.autoGen.triggerType=$(this).val();SillyTavern.getContext().saveSettingsDebounced();renderSettings();});
    $('#forum-ag-int').on('change',function(){s.forum.autoGen.turnInterval=parseInt($(this).val())||10;SillyTavern.getContext().saveSettingsDebounced();});
    $('#forum-time-int').on('change',function(){s.forum.autoGen.timeInterval=parseInt($(this).val())||5;SillyTavern.getContext().saveSettingsDebounced();});
    $('#forum-ag-chance').on('change',function(){s.forum.autoGen.randomChance=(parseInt($(this).val())||15)/100;SillyTavern.getContext().saveSettingsDebounced();});
    $('#btn-rst').on('click',()=>{s._internal.fabPos=null;SillyTavern.getContext().saveSettingsDebounced();$('#lumi-fab').remove();spawnLumiButton();showToast('FAB reset!');});
    $('#btn-clr').on('click',()=>{if(confirm('Clear ALL memories, forum posts, and reset settings?')){s.memories=[];s.forumPosts={};s._internal.fabPos=null;s._internal.nameRegistry={};SillyTavern.getContext().saveSettingsDebounced();$('#lumi-fab').remove();spawnLumiButton();showToast('All data cleared.');renderSettings();}});
}

// ═══════════════════════════════════════════════
// AUTO TRIGGERS
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).off('messageReceived.lumi-diary').on('messageReceived.lumi-diary', async function(){
        const s=extension_settings[extensionName], cfg=s.diary.autoGen;
        if(!cfg.enabled) return;
        s._internal.messageCounter=(s._internal.messageCounter||0)+1;
        const lastMsg=(SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'').toLowerCase();
        let gen=false;
        if(cfg.triggerType==='turn_count'&&s._internal.messageCounter>=cfg.turnInterval){gen=true;s._internal.messageCounter=0;}
        else if(cfg.triggerType==='emotion'&&cfg.emotionKeywords.some(k=>lastMsg.includes(k))){gen=true;}
        else if(cfg.triggerType==='random'&&Math.random()<cfg.randomChance){gen=true;}
        if(gen){
            const results=await callAIBatch('latest',cfg.turnInterval||20);
            if(results&&results.length>0){
                const ctx=SillyTavern.getContext();
                const wm=s.diary.worldMode==='auto'?detectWorldMode():s.diary.worldMode;
                const botId=ctx.characterId;
                results.forEach(res=>saveMemory({id:'mem_auto_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),timestamp:new Date().toISOString(),character:res.character||ctx.name2||"Character",botId,worldMode:wm,content:{...res},meta:{isPinned:false,isFavorite:false,isSecret:res.isSecret,linkedIds:res.linkedIds||[],tags:extractTags(res.diary||'')}}));
            }
        }
    });
}

function setupForumAutoTrigger() {
    $(document).off('messageReceived.lumi-forum').on('messageReceived.lumi-forum', async function(){
        const s=extension_settings[extensionName];
        const forum=s.forum;
        if(!forum.enabled||!forum.autoGen.enabled) return;
        s._internal.forumMessageCounter=(s._internal.forumMessageCounter||0)+1;
        const now=Date.now();
        let shouldGen=false;
        if(forum.autoGen.triggerType==='turn_count'&&s._internal.forumMessageCounter>=forum.autoGen.turnInterval){shouldGen=true;s._internal.forumMessageCounter=0;}
        if(forum.autoGen.triggerType==='time_interval'){const mins=(now-s._internal.lastForumGenTime)/60000;if(mins>=forum.autoGen.timeInterval){shouldGen=true;s._internal.lastForumGenTime=now;}}
        if(forum.autoGen.triggerType==='random'&&Math.random()<forum.autoGen.randomChance){shouldGen=true;}
        if(shouldGen) await generateForumPosts();
    });
}

// ═══════════════════════════════════════════════
// DIARY CORE
// ═══════════════════════════════════════════════
function loadMemories(filter={}) {
    let mem=[...(extension_settings[extensionName].memories||[])];
    if(filter.botId) mem=mem.filter(m=>m.botId===filter.botId||!m.botId);
    if(filter.character) mem=mem.filter(m=>m.character===filter.character);
    return mem.sort((a,b)=>(b.meta.isPinned?1:0)-(a.meta.isPinned?1:0)||new Date(b.timestamp)-new Date(a.timestamp));
}

function saveMemory(entry) {
    const s=extension_settings[extensionName];
    if(!s._internal.nameRegistry) s._internal.nameRegistry={};
    let cleanName=entry.character.replace(/[()（）\[\]]/g,'').trim();
    let canonName=cleanName;
    for(let rn in s._internal.nameRegistry){if(similarityScore(cleanName,rn)>90){canonName=rn;break;}}
    s._internal.nameRegistry[canonName]=true;
    entry.character=canonName;
    const charMems=s.memories.filter(m=>m.character===canonName);
    if(charMems.some(m=>similarityScore(m.content.diary||'',entry.content.diary||'')>85)) return;
    s.memories.unshift(entry);
    if(s.memories.length>s.diary.storage.max) s.memories=s.memories.slice(0,s.diary.storage.max);
    SillyTavern.getContext().saveSettingsDebounced();
}

async function generateBatchMemories() {
    const mode=$('input[name="gen-mode"]:checked').val();
    const count=parseInt($('#gen-count').val())||30;
    const btn=$('#btn-run-gen');
    btn.html(`<span class="lumi-spinner"></span> Thinking...`).prop('disabled',true);
    const results=await callAIBatch(mode,count);
    btn.html(`${svgPlus} Analyze & Generate`).prop('disabled',false);
    $('#gen-form-container').slideUp(200);
    if(results&&results.length>0){
        const ctx=SillyTavern.getContext();
        const wm=extension_settings[extensionName].diary.worldMode==='auto'?detectWorldMode():extension_settings[extensionName].diary.worldMode;
        const botId=ctx.characterId;
        results.forEach(res=>saveMemory({id:'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),timestamp:new Date().toISOString(),character:res.character||ctx.name2||"Character",botId,worldMode:wm,content:{...res},meta:{isPinned:false,isFavorite:false,isSecret:res.isSecret,linkedIds:res.linkedIds||[],tags:extractTags(res.diary||'')}}));
        showToast(`✅ Created ${results.length} memories!`);
        renderDiaryTab();
    } else {showToast('No memories found');}
}

async function callAIBatch(mode,count) {
    const ctx=SillyTavern.getContext();const allChat=ctx.chat||[];
    let chatSlice,startIndex=0,endIndex=0;
    if(mode==='latest'){chatSlice=allChat.slice(-count);startIndex=Math.max(0,allChat.length-count);endIndex=allChat.length;}
    else if(mode==='first'){chatSlice=allChat.slice(0,count);startIndex=0;endIndex=count;}
    else{chatSlice=allChat.filter(m=>m.mes&&m.mes.length>15).slice(-120);startIndex=Math.max(0,allChat.length-120);endIndex=allChat.length;}
    const cleanChat=chatSlice.filter(m=>m.mes&&m.mes.length>10);
    const chatLog=cleanChat.map(m=>`[${m.is_user?'User':(m.name||'NPC')}]: ${(m.mes||'').slice(0,60)}`).join('\n');
    const botMems=loadMemories({botId:ctx.characterId});
    const prevTopics=botMems.slice(0,8).map(m=>`- [${m.character}] ${m.content.rp_date}: ${(m.content.diary||'').slice(0,40)}...`).join('\n');
    const registryList=Object.keys(extension_settings[extensionName]._internal.nameRegistry||{}).join(', ');
    const prompt=`[System: Create UNIQUE diary entries from chat log. Do NOT repeat previous topics.]
Chat log (#${startIndex+1}-${endIndex}):
${chatLog}
Known names: ${registryList||'None'}
Previous (skip these): ${prevTopics||'None'}
Rules:
- 1-3 entries, unique events only
- Thai date format (e.g. "15 กันยายน 2567")
- Return ONLY JSON array, no markdown:
[{"character":"Name","rp_date":"Date","rp_location":"Loc","rp_tags":["#Tag"],"mood":"Mood","diary":"Thai 2-4 sentences.","isSecret":false,"linkedIds":[]}]`;
    try{
        let res;
        if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(prompt,false,false);
        else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(prompt,true);
        if(!res) return [];
        const cleaned=res.replace(/```json/g,'').replace(/```/g,'').trim();
        const match=cleaned.match(/\[[\s\S]*\]/);
        return match?JSON.parse(match[0]):[];
    } catch(e){console.error(e);return [];}
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function detectWorldMode(){const chat=SillyTavern.getContext().chat||[];const names=new Set();chat.slice(-50).forEach(m=>{if(m.name&&!m.is_user&&!m.is_system)names.add(m.name);});return names.size>2?'rpg':'solo';}
function generateColor(str){if(!str)return '#FFB6C1';const colors=['#F472B6','#A78BFA','#34D399','#38BDF8','#FB923C','#E879F9','#4ADE80','#60A5FA'];let h=0;for(let i=0;i<str.length;i++)h=str.charCodeAt(i)+((h<<5)-h);return colors[Math.abs(h)%colors.length];}
function escapeHtml(str){if(typeof str!=='string')return '';return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function extractTags(text){const tags=[],kw={'#Romantic':['รัก','หัวใจ'],'#Drama':['เสียใจ','ร้องไห้'],'#Mystery':['ลึกลับ','ความลับ']},l=text.toLowerCase();for(const[k,v]of Object.entries(kw))if(v.some(w=>l.includes(w)))tags.push(k);return tags;}
function showToast(msg){$('.lumi-toast').remove();const t=document.createElement('div');t.className='lumi-toast';t.innerHTML=msg;document.body.appendChild(t);setTimeout(()=>$(t).fadeOut(300,()=>t.remove()),2200);}
function checkUnlock(m){if(!m.meta.isSecret)return true;if(!extension_settings[extensionName].diary.display.showSecretSystem)return true;const mode=extension_settings[extensionName].diary.display.secretMode;if(mode==='time')return(Date.now()-new Date(m.timestamp))>86400000*3;if(mode==='affection')return(m.content.affection_score||0)>=80;return false;}
function exportText(content,filename){const blob=new Blob([content],{type:'text/markdown'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);showToast('Exported!');}
function exportJSON(data,filename){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);showToast('Exported!');}
function timeAgo(date){const s=Math.floor((new Date()-new Date(date))/1000);if(s<60)return 'Just now';const m=Math.floor(s/60);if(m<60)return `${m}m ago`;const h=Math.floor(m/60);if(h<24)return `${h}h ago`;return `${Math.floor(h/24)}d ago`;}
function createSettingsPanel(){if($('#lumi-panel').length)return;$('#extensions_settings').append(`<div id="lumi-panel" class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color:var(--lp);font-family:'DM Sans',sans-serif;font-weight:600;">LumiPulse</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="display:none;"></div></div>`);}
function levenshteinDistance(s1,s2){const m=s1.length,n=s2.length;const dp=Array(m+1).fill(null).map(()=>Array(n+1).fill(0));for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(s1[i-1]===s2[j-1])dp[i][j]=dp[i-1][j-1];else dp[i][j]=1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);}return dp[m][n];}
function similarityScore(s1,s2){const a=s1.toLowerCase().trim(),b=s2.toLowerCase().trim();const dist=levenshteinDistance(a,b);const maxLen=Math.max(a.length,b.length);return maxLen===0?100:((maxLen-dist)/maxLen)*100;}

function editMemoryInline(id){
    const mem=extension_settings[extensionName].memories.find(m=>m.id===id);
    if(!mem) return;
    const card=$(`.lumi-card[data-id="${id}"]`);
    card.find('.lumi-text').html(`<textarea class="lumi-input" style="min-height:80px;resize:vertical;font-size:13px;">${escapeHtml(mem.content.diary)}</textarea><div style="display:flex;gap:8px;margin-top:8px;"><button class="lumi-sm-btn lumi-btn-save-inline" style="flex:1;justify-content:center;background:var(--lp);color:#fff;border-color:var(--lp);">Save</button><button class="lumi-sm-btn lumi-btn-cancel-inline" style="flex:1;justify-content:center;">Cancel</button></div>`);
    card.find('.lumi-btn-save-inline').on('click',()=>{mem.content.diary=card.find('textarea').val();SillyTavern.getContext().saveSettingsDebounced();renderDiaryTab();showToast('Updated!');});
    card.find('.lumi-btn-cancel-inline').on('click',()=>renderDiaryTab());
}
