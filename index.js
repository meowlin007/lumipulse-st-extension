"use strict";
// ═══════════════════════════════════════════════════════════
// LUMIPULSE v6.2 — Fixed JSON Parsing & Strict Mode
// ═══════════════════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    forumPosts: {},
    forumNotify: {},
    _internal: {
        fabPos: null,
        theme: 'pink',
        darkMode: false,
        nameRegistry: {},
        filterChar: '', filterDate: '', filterLoc: '',
        forumMsgCounter: 0, lastForumGenTime: 0,
        diaryMsgCounter: 0
    },
    api: {
        enabled: false,
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: '', // Will be auto-filled if possible
        maxTokens: 800
    },
    diary: {
        worldMode: 'auto',
        display: { secretMode: 'time', showSecretSystem: false },
        autoGen: {
            enabled: true, triggerType: 'turn_count',
            turnInterval: 20,
            emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','กลัว'],
            randomChance: 0.08
        },
        storage: { max: 150 }
    },
    forum: {
        enabled: true,
        autoReactOnRP: true,
        autoGen: {
            enabled: true, triggerType: 'turn_count',
            turnInterval: 8, timeInterval: 5, randomChance: 0.15
        },
        storage: { max: 300 },
        posterTypes: { mainChars: true, npcs: true, citizens: true, news: true }
    }
};

let EXT = {};

// ── Assets ──────────────────────────────────────────────────
const ASSETS = {
    fab:      "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png",
    diary:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png",
    forum:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png",
    settings: "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png"
};

// ── SVG Icons ────────────────────────────────────────────────
const I = {
    close:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    back:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
    plus:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    heart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartF:  `<svg viewBox="0 0 24 24" fill="var(--lp)" stroke="var(--lp)" stroke-width="2" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    send:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    spark:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`,
    book:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    globe:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    link:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    pin:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`,
    trash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    tag:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    cal:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    mappin:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    lock:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    mood:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    scroll:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    key:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
    img:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    music:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    news:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>`,
    edit:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    sun:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
};

// ── Color palettes ───────────────────────────────────────────
const PALETTES = {
    pink:   { p: '#D64FAB', s: '#B83D8F', grad: 'linear-gradient(135deg,#F9A8D4,#D64FAB)', tagBg: '#FCE7F3', tagText: '#9D174D' },
    purple: { p: '#7C3AED', s: '#6D28D9', grad: 'linear-gradient(135deg,#C4B5FD,#7C3AED)', tagBg: '#EDE9FE', tagText: '#4C1D95' },
    blue:   { p: '#2563EB', s: '#1D4ED8', grad: 'linear-gradient(135deg,#93C5FD,#2563EB)', tagBg: '#DBEAFE', tagText: '#1E3A8A' },
    green:  { p: '#059669', s: '#047857', grad: 'linear-gradient(135deg,#6EE7B7,#059669)', tagBg: '#D1FAE5', tagText: '#064E3B' },
    peach:  { p: '#EA580C', s: '#C2410C', grad: 'linear-gradient(135deg,#FED7AA,#EA580C)', tagBg: '#FFEDD5', tagText: '#7C2D12' }
};

function getThemeColors() {
    const pal = PALETTES[EXT._internal.theme || 'pink'] || PALETTES.pink;
    const dark = EXT._internal.darkMode;
    return {
        ...pal,
        bg:     dark ? '#0D0A12' : '#FAFAFA',
        card:   dark ? '#1A1428' : '#FFFFFF',
        border: dark ? 'rgba(255,255,255,0.08)' : '#F0E6FF',
        text:   dark ? '#EDE0FF' : '#1A1A2E',
        sub:    dark ? '#7C6B99' : '#6B7280',
        input:  dark ? '#110D1E' : '#F8F2FF',
        nav:    dark ? '#150F22' : '#FFFFFF',
        shadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : `0 4px 16px ${pal.p}22`,
    };
}

function applyTheme() {
    const c = getThemeColors();
    const r = document.documentElement;
    r.style.setProperty('--lp', c.p);
    r.style.setProperty('--ls', c.s);
    r.style.setProperty('--lgrad', c.grad);
    r.style.setProperty('--ltag', c.tagBg);
    r.style.setProperty('--ltagtext', c.tagText);
    r.style.setProperty('--lbg', c.bg);
    r.style.setProperty('--lcard', c.card);
    r.style.setProperty('--lborder', c.border);
    r.style.setProperty('--ltext', c.text);
    r.style.setProperty('--lsub', c.sub);
    r.style.setProperty('--linput', c.input);
    r.style.setProperty('--lnav', c.nav);
    r.style.setProperty('--lshadow', c.shadow);
}

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
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
    const ES = ctx.extensionSettings;

    if (!ES[extensionName]) {
        ES[extensionName] = JSON.parse(JSON.stringify(defaultSettings));
    } else {
        const s = ES[extensionName];
        if (!s.api) s.api = JSON.parse(JSON.stringify(defaultSettings.api));
        if (!s._internal) s._internal = {};
        if (!s._internal.theme) s._internal.theme = 'pink';
        if (typeof s._internal.darkMode === 'undefined') s._internal.darkMode = false;
        if (Array.isArray(s.forumPosts)) s.forumPosts = {};
        if (!s.forumPosts) s.forumPosts = {};
        if (!s.forumNotify) s.forumNotify = {};
        if (!s.forum) s.forum = JSON.parse(JSON.stringify(defaultSettings.forum));
        if (!s.forum.posterTypes) s.forum.posterTypes = { mainChars: true, npcs: true, citizens: true, news: true };
        if (typeof s.forum.autoReactOnRP === 'undefined') s.forum.autoReactOnRP = true;
        ['forumMsgCounter','lastForumGenTime','diaryMsgCounter'].forEach(k => {
            if (typeof s._internal[k] === 'undefined') s._internal[k] = 0;
        });
    }

    ctx.saveSettingsDebounced();
    EXT = ctx.extensionSettings[extensionName];
    applyTheme();
    injectStyles();
    createSettingsPanel();

    if (EXT.isEnabled) {
        setTimeout(() => {
            spawnFAB();
            createModal();
            setupDiaryAutoTrigger();
            setupForumAutoTrigger();
        }, 400);
    }
}

// ── Core helpers ─────────────────────────────────────────────
const getBotId   = () => SillyTavern.getContext().characterId || '__default__';
const getBotPosts = () => {
    const b = getBotId();
    if (!EXT.forumPosts[b]) EXT.forumPosts[b] = [];
    return EXT.forumPosts[b];
};
const savePosts = (arr) => {
    EXT.forumPosts[getBotId()] = arr.slice(-(EXT.forum.storage.max || 300));
    save();
};
const save = () => SillyTavern.getContext().saveSettingsDebounced();
const esc = (s) => {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
};
const colorOf = (str) => {
    const c = ['#F472B6','#A78BFA','#34D399','#60A5FA','#FB923C','#E879F9','#FBBF24','#4ADE80'];
    let h = 0;
    for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return c[Math.abs(h) % c.length];
};
const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
};
const toast = (msg, type = 'ok') => {
    $('.lumi-toast').remove();
    $('body').append(`<div class="lumi-toast lumi-toast-${type}">${msg}</div>`);
    setTimeout(() => $('.lumi-toast').fadeOut(300, () => $('.lumi-toast').remove()), 2500);
};

// ── Levenshtein similarity ───────────────────────────────────
function simScore(a, b) {
    a = (a || '').toLowerCase().trim();
    b = (b || '').toLowerCase().trim();
    if (!a.length || !b.length) return 0;
    const dp = Array(a.length + 1).fill(null).map((_, i) =>
        Array(b.length + 1).fill(0).map((_, j) => i || j));
    for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
            dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return ((Math.max(a.length, b.length) - dp[a.length][b.length]) / Math.max(a.length, b.length)) * 100;
}

// ═══════════════════════════════════════════════════════════
// ROBUST JSON EXTRACTOR (Improved)
// ═══════════════════════════════════════════════════════════
function extractJSON(raw, type = 'array') {
    if (!raw || typeof raw !== 'string') {
        console.warn('[LumiPulse] extractJSON: Input is not a string');
        return null;
    }

    // 1. Strip think/reasoning tags
    let s = raw.replace(/<think>[\s\S]*?<\/think>/gi, '');
    // 2. Strip HTML tags (common in some models)
    s = s.replace(/<[^>]{1,200}>/g, '');
    // 3. Strip markdown code fences
    s = s.replace(/
```(?:json)?/gi, '').replace(/
```/g, '');
    // 4. Remove common AI preamble/postamble text up to the first bracket
    // This regex finds the FIRST [ or { and cuts everything before it
    const firstBracket = s.search(/[\[{]/);
    if (firstBracket !== -1) {
        s = s.substring(firstBracket);
    }
    
    // Trim whitespace
    s = s.trim();

    const opener = type === 'array' ? '[' : '{';
    const closer = type === 'array' ? ']' : '}';
    
    if (!s.startsWith(opener)) {
        console.warn('[LumiPulse] extractJSON: Does not start with', opener, '. Start:', s.slice(0,20));
        return null;
    }

    let depth = 0, end = -1;
    let inStr = false, escape = false;
    
    // Find the matching closing bracket
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inStr) { escape = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        
        if (ch === opener) depth++;
        else if (ch === closer) { 
            depth--; 
            if (depth === 0) { end = i; break; } 
        }
    }

    if (end === -1) {
        console.warn('[LumiPulse] extractJSON: Could not find matching closing bracket.');
        return null;
    }

    const jsonStr = s.slice(0, end + 1);
    
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.warn('[LumiPulse] extractJSON: JSON Parse failed. Trying fixes...');
        // Try to fix common JSON errors
        try {
            const fixed = jsonStr
                .replace(/,\s*([}\]])/g, '$1')  // trailing commas
                .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":'); // unquoted keys
            return JSON.parse(fixed);
        } catch (e2) {
            console.error('[LumiPulse] extractJSON: All parsing attempts failed.', e2);
            return null;
        }
    }
}

// ═══════════════════════════════════════════════════════════
// AI CALL LAYER
// ═══════════════════════════════════════════════════════════

// For diary: tries custom API, falls back to ST
async function callAI(prompt, systemPrompt = '') {
    if (EXT.api.enabled && EXT.api.apiKey && EXT.api.model) {
        try {
            return await callCustomAPI(prompt, systemPrompt);
        } catch (e) {
            console.warn('[LumiPulse] Custom API failed, using ST fallback:', e.message);
        }
    }
    return await callST(systemPrompt ? systemPrompt + '\n\n' + prompt : prompt);
}

// For forum: ONLY custom API if configured, otherwise strict ST
async function callAIForForum(prompt) {
    const SYS = 'You are a JSON-only API. Your response must be ONLY a valid JSON array starting with [ and ending with ]. No other text, no explanation, no markdown, no code fences. Only output the JSON array.';

    if (EXT.api.enabled && EXT.api.apiKey && EXT.api.model) {
        try {
            const result = await callCustomAPI(prompt, SYS);
            return result;
        } catch (e) {
            console.error('[LumiPulse] Custom API error:', e.message);
            throw new Error('Custom API failed: ' + e.message);
        }
    }

    // ST fallback for forum — inject system constraint into prompt
    const strictPrompt = `IMPORTANT: Reply with ONLY a JSON array. Start your reply with [ and end with ]. No other text before or after.

${prompt}

Remember: Output ONLY the JSON array, nothing else.`;
    return await callST(strictPrompt);
}

async function callST(prompt) {
    const ctx = SillyTavern.getContext();
    let res = '';
    if (typeof ctx.generateQuietPrompt === 'function') {
        res = await ctx.generateQuietPrompt(prompt, false, false);
    } else if (typeof ctx.generateRaw === 'function') {
        res = await ctx.generateRaw(prompt, true);
    }
    return res || '';
}

async function callCustomAPI(prompt, systemPrompt) {
    const cfg = EXT.api;
    
    // ✅ Check if model is selected
    if (!cfg.model) {
        throw new Error('No model selected. Please fetch models in Settings.');
    }

    let url, headers, body;

    if (cfg.provider === 'anthropic') {
        url = (cfg.baseUrl || 'https://api.anthropic.com') + '/v1/messages';
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': cfg.apiKey,
            'anthropic-version': '2023-06-01'
        };
        body = JSON.stringify({
            model: cfg.model,
            max_tokens: cfg.maxTokens || 800,
            system: systemPrompt || 'You are a helpful assistant.',
            messages: [{ role: 'user', content: prompt }]
        });
    } else if (cfg.provider === 'google') {
        const model = cfg.model; // e.g., gemini-1.5-flash
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cfg.apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        const text = (systemPrompt ? systemPrompt + '\n\n' : '') + prompt;
        body = JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: { maxOutputTokens: cfg.maxTokens || 800 }
        });
    } else {
        // OpenAI-compatible
        url = (cfg.baseUrl || 'https://api.openai.com/v1') + '/chat/completions';
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cfg.apiKey}`
        };
        const msgs = [];
        if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
        msgs.push({ role: 'user', content: prompt });
        body = JSON.stringify({
            model: cfg.model,
            max_tokens: cfg.maxTokens || 800,
            messages: msgs
        });
    }

    const resp = await fetch(url, { method: 'POST', headers, body });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`${resp.status}: ${err.slice(0, 150)}`);
    }
    const data = await resp.json();

    if (cfg.provider === 'anthropic') return data.content?.[0]?.text || '';
    if (cfg.provider === 'google') return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return data.choices?.[0]?.message?.content || '';
}

async function fetchAvailableModels() {
    const cfg = EXT.api;
    if (!cfg.apiKey) throw new Error('No API key set');
    let url, headers;
    if (cfg.provider === 'anthropic') {
        url = (cfg.baseUrl || 'https://api.anthropic.com') + '/v1/models';
        headers = { 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01' };
    } else if (cfg.provider === 'google') {
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cfg.apiKey}`;
        headers = {};
    } else {
        url = (cfg.baseUrl || 'https://api.openai.com/v1') + '/models';
        headers = { 'Authorization': `Bearer ${cfg.apiKey}` };
    }
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (cfg.provider === 'anthropic') return (data.data || []).map(m => m.id).sort();
    if (cfg.provider === 'google') return (data.models || []).filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name.replace('models/', '')).sort();
    return (data.data || []).map(m => m.id).filter(id => /gpt|claude|gemini|llama|mistral|qwen|deepseek|phi/i.test(id)).sort();
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const el = document.createElement('style');
    el.id = 'lumi-styles';
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
:root{
  --lp:#D64FAB;--ls:#B83D8F;--lgrad:linear-gradient(135deg,#F9A8D4,#D64FAB);
  --ltag:#FCE7F3;--ltagtext:#9D174D;
  --lbg:#FAFAFA;--lcard:#fff;--lborder:#F0E6FF;--ltext:#1A1A2E;--lsub:#6B7280;
  --linput:#F8F2FF;--lnav:#fff;--lshadow:0 4px 16px rgba(214,79,171,.13);
  --ff:'DM Sans','Noto Sans Thai',sans-serif;
}
@keyframes lumiIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes postSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes dotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes notifyPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}

/* FAB */
#lumi-fab{position:fixed;z-index:99999;width:40px;height:40px;border-radius:50%;background:var(--lcard) url("${ASSETS.fab}") no-repeat center/20px;border:1.5px solid var(--lborder);box-shadow:var(--lshadow);cursor:grab;touch-action:none;user-select:none;transition:transform .18s,box-shadow .2s;display:flex;align-items:center;justify-content:center;}
#lumi-fab:hover{box-shadow:0 6px 22px rgba(0,0,0,.18);transform:scale(1.07);}
#lumi-fab:active{transform:scale(.91);cursor:grabbing;}
.lumi-fab-dot{position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:#FF4757;border:2px solid var(--lcard);display:none;animation:notifyPulse 1.5s infinite;}
.lumi-fab-dot.show{display:block;}

/* Menu */
.lumi-menu{position:fixed;z-index:99998;display:none;background:var(--lcard);border-radius:18px;padding:13px;border:1px solid var(--lborder);box-shadow:var(--lshadow);font-family:var(--ff);min-width:175px;}
.lumi-menu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.lumi-menu-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px 5px;border-radius:12px;border:1px solid transparent;transition:.15s;position:relative;}
.lumi-menu-item:hover{background:var(--ltag);border-color:var(--lborder);}
.lumi-menu-item img{width:33px;height:33px;object-fit:contain;}
.lumi-menu-item span{font-size:10px;color:var(--lsub);font-weight:600;}
.lumi-menu-item.has-notify::after{content:'';position:absolute;top:7px;right:8px;width:7px;height:7px;border-radius:50%;background:#FF4757;border:1.5px solid var(--lcard);}

/* Overlay & Modal */
.lumi-overlay{position:fixed;top:0;left:0;width:100vw;height:100dvh;background:rgba(0,0,0,.4);backdrop-filter:blur(8px);z-index:100000;display:none;align-items:center;justify-content:center;}
.lumi-modal{width:94%;max-width:480px;height:91dvh;background:var(--lbg);border-radius:24px;border:1px solid var(--lborder);box-shadow:var(--lshadow);display:flex;flex-direction:column;overflow:hidden;font-family:var(--ff);animation:lumiIn .26s cubic-bezier(.34,1.46,.64,1);color:var(--ltext);}
.lumi-head{padding:12px 15px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--lborder);background:var(--lnav);flex-shrink:0;}
.lumi-head-title{font-size:14px;color:var(--lp);font-weight:700;flex:1;text-align:center;letter-spacing:-.2px;}
.lumi-icon-btn{width:29px;height:29px;border-radius:50%;background:var(--ltag);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--lsub);transition:.15s;flex-shrink:0;}
.lumi-icon-btn:hover{background:var(--lborder);color:var(--ltext);}
.lumi-body{flex:1;overflow-y:auto;background:var(--lbg);scrollbar-width:thin;scrollbar-color:var(--lborder) transparent;}
.lumi-body::-webkit-scrollbar{width:3px;}
.lumi-body::-webkit-scrollbar-thumb{background:var(--lborder);border-radius:2px;}

/* Nav */
.lumi-nav{display:flex;gap:3px;padding:8px 12px 0;background:var(--lnav);flex-shrink:0;border-bottom:1px solid var(--lborder);}
.lumi-tab{flex:1;text-align:center;padding:8px 3px 10px;border-radius:10px 10px 0 0;color:var(--lsub);font-size:11px;font-weight:600;cursor:pointer;transition:.15s;display:flex;align-items:center;justify-content:center;gap:4px;position:relative;}
.lumi-tab::after{content:'';position:absolute;bottom:-1px;left:15%;right:15%;height:2px;background:transparent;border-radius:2px;transition:.2s;}
.lumi-tab.active{color:var(--lp);}
.lumi-tab.active::after{background:var(--lp);}
.lumi-tab:hover:not(.active){background:var(--ltag);}

/* Hero */
.lumi-hero{background:var(--lgrad);padding:17px 15px 13px;position:relative;overflow:hidden;}
.lumi-hero::before{content:'';position:absolute;top:-30px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.1);}
.lumi-hero-eye{font-size:10px;color:rgba(255,255,255,.8);letter-spacing:.7px;text-transform:uppercase;margin-bottom:3px;}
.lumi-hero-title{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.3px;position:relative;}
.lumi-hero-sub{font-size:11px;color:rgba(255,255,255,.75);margin-top:3px;}

/* Stats */
.lumi-stats{display:flex;gap:8px;padding:10px 13px;}
.lumi-stat{flex:1;text-align:center;background:var(--lcard);border:1px solid var(--lborder);border-radius:13px;padding:9px 4px;}
.lumi-stat b{display:block;font-size:18px;color:var(--lp);font-weight:800;line-height:1.1;}
.lumi-stat span{font-size:9px;color:var(--lsub);text-transform:uppercase;letter-spacing:.4px;}

/* Form */
.lumi-section{padding:11px 13px 2px;}
.lumi-form-card{background:var(--lcard);border:1px solid var(--lborder);border-radius:15px;padding:13px;margin-bottom:11px;}
.lumi-form-title{font-size:10px;font-weight:700;color:var(--lsub);text-transform:uppercase;letter-spacing:.6px;margin-bottom:9px;}
.lumi-label{font-size:10px;color:var(--lsub);display:block;margin-bottom:4px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;}
.lumi-input{width:100%;background:var(--linput);border:1px solid var(--lborder);border-radius:10px;padding:8px 11px;color:var(--ltext);font-family:var(--ff);font-size:13px;outline:none;box-sizing:border-box;transition:.15s;}
.lumi-input:focus{border-color:var(--lp);box-shadow:0 0 0 3px var(--ltag);}
.lumi-textarea{min-height:62px;resize:none;max-height:130px;}
.lumi-select{background:var(--linput);border:1px solid var(--lborder);border-radius:10px;padding:7px 10px;color:var(--ltext);font-family:var(--ff);font-size:12px;outline:none;cursor:pointer;}
.lumi-set-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--lborder);font-size:12px;color:var(--lsub);}
.lumi-set-row:last-child{border-bottom:none;}
.lumi-set-row select,.lumi-set-row input[type=number]{background:var(--linput);border:1px solid var(--lborder);border-radius:8px;padding:5px 7px;color:var(--ltext);font-family:var(--ff);outline:none;font-size:12px;}
.lumi-btn{background:var(--lgrad);color:#fff;border:none;padding:10px 15px;border-radius:20px;font-family:var(--ff);font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;width:100%;transition:.2s;box-shadow:0 3px 12px rgba(0,0,0,.15);}
.lumi-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(0,0,0,.2);}
.lumi-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.lumi-sm-btn{background:var(--ltag);color:var(--lp);border:1px solid var(--lborder);padding:6px 12px;border-radius:13px;font-family:var(--ff);font-weight:600;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:5px;transition:.15s;white-space:nowrap;}
.lumi-sm-btn:hover{background:var(--lborder);}
.lumi-sm-btn:disabled{opacity:.5;cursor:not-allowed;}
.lumi-danger-btn{background:rgba(255,71,87,.08);color:#FF4757;border-color:rgba(255,71,87,.2);}
.lumi-danger-btn:hover{background:rgba(255,71,87,.14);}
.lumi-badge{font-size:10px;padding:2px 7px;border-radius:6px;background:var(--ltag);color:var(--ltagtext);display:inline-flex;align-items:center;gap:3px;font-weight:500;}
.lumi-empty{text-align:center;padding:42px 18px;}
.lumi-empty-icon{font-size:40px;margin-bottom:11px;opacity:.28;}
.lumi-empty-text{font-size:13px;color:var(--lsub);line-height:1.65;}

/* Toast */
.lumi-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:9px 17px;border-radius:17px;z-index:999999;font-family:var(--ff);font-size:12px;font-weight:600;animation:lumiIn .22s;pointer-events:none;white-space:nowrap;}
.lumi-toast-ok{background:var(--lcard);border:1px solid var(--lborder);color:var(--ltext);box-shadow:var(--lshadow);}
.lumi-toast-err{background:#FFF0F1;border:1px solid #FFB3B8;color:#FF4757;}

/* Spinner */
.lumi-spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-radius:50%;border-top-color:#fff;animation:spin .7s linear infinite;}
.lumi-spin-c{border-color:var(--ltag);border-top-color:var(--lp);}

/* Diary */
.lumi-diary-pad{padding:10px 13px 14px;}
.lumi-tl-sep{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--lsub);font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:7px 0 5px;}
.lumi-tl-sep::after{content:'';flex:1;height:1px;background:var(--lborder);}
.lumi-card{background:var(--lcard);border:1px solid var(--lborder);border-radius:15px;padding:12px;margin-bottom:8px;animation:fadeUp .28s ease;}
.lumi-card:hover{box-shadow:var(--lshadow);}
.lumi-card-hd{display:flex;align-items:center;gap:8px;margin-bottom:7px;}
.lumi-av{width:29px;height:29px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0;}
.lumi-av-sm{width:23px;height:23px;font-size:10px;}
.lumi-av-xs{width:19px;height:19px;font-size:9px;}
.lumi-char-name{font-size:13px;font-weight:700;color:var(--ltext);flex:1;}
.lumi-card-meta{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;}
.lumi-card-body{font-size:13px;color:var(--ltext);line-height:1.65;white-space:pre-wrap;margin:0 0 9px;}
.lumi-card-foot{display:flex;gap:4px;justify-content:flex-end;padding-top:7px;border-top:1px solid var(--lborder);}
.lumi-act{background:none;border:1px solid transparent;border-radius:8px;cursor:pointer;color:var(--lsub);transition:.15s;padding:4px 8px;font-size:11px;display:flex;align-items:center;gap:3px;font-family:var(--ff);}
.lumi-act:hover{background:var(--ltag);border-color:var(--lborder);color:var(--lp);}
.lumi-act.act-on{color:var(--lp);background:var(--ltag);}
.lumi-act.act-del:hover{background:rgba(255,71,87,.08);color:#FF4757;}

/* FORUM */
.lumi-forum-bar{display:flex;gap:6px;align-items:center;padding:7px 12px;border-bottom:1px solid var(--lborder);background:var(--lnav);flex-shrink:0;}
.lumi-reload-btn{flex:1;background:var(--ltag);border:1px solid var(--lborder);border-radius:11px;padding:7px 10px;cursor:pointer;font-size:11px;font-family:var(--ff);color:var(--lp);transition:.18s;display:flex;align-items:center;justify-content:center;gap:5px;font-weight:700;}
.lumi-reload-btn:hover{background:var(--lborder);}
.lumi-reload-btn:disabled{opacity:.5;cursor:not-allowed;}

.lumi-compose{margin:9px 12px 5px;background:var(--lcard);border:1px solid var(--lborder);border-radius:17px;padding:12px;}
.lumi-compose-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.lumi-compose-footer{display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap;}
.lumi-img-preview-wrap{position:relative;margin-top:7px;}
.lumi-img-preview{width:100%;border-radius:10px;max-height:180px;object-fit:cover;border:1px solid var(--lborder);}
.lumi-img-rm{position:absolute;top:5px;right:5px;background:rgba(0,0,0,.5);border:none;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:10px;}

.lumi-feed{padding:8px 12px 14px;}

/* Post card */
.lumi-post{background:var(--lcard);border:1px solid var(--lborder);border-radius:17px;padding:13px;margin-bottom:9px;animation:postSlide .3s ease;position:relative;}
.lumi-post.post-news{border-left:3px solid #FB923C;}
.lumi-post.post-player{border-left:3px solid var(--lp);}
.lumi-post-hd{display:flex;align-items:flex-start;gap:9px;margin-bottom:9px;}
.lumi-post-aw{flex:1;min-width:0;}
.lumi-post-author{font-size:13px;font-weight:700;color:var(--ltext);display:flex;align-items:center;gap:4px;flex-wrap:wrap;}
.lumi-post-time{font-size:10px;color:var(--lsub);margin-top:1px;}
.lumi-ptype{font-size:9px;padding:1px 6px;border-radius:4px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;}
.pt-news{background:#FFF3E0;color:#E65100;}
.pt-main{background:var(--ltag);color:var(--lp);}
.pt-npc{background:#EDE9FE;color:#6D28D9;}
.pt-citizen{background:#DCFCE7;color:#166534;}
.lumi-post-title{font-size:14px;font-weight:800;color:var(--ltext);margin-bottom:4px;line-height:1.3;}
.lumi-post-body{font-size:13px;color:var(--ltext);line-height:1.65;margin-bottom:9px;}
.lumi-post-acts{display:flex;gap:5px;padding-top:9px;border-top:1px solid var(--lborder);}
.lumi-pact{flex:1;background:none;border:1px solid var(--lborder);border-radius:9px;padding:6px 5px;cursor:pointer;font-size:11px;font-family:var(--ff);color:var(--lsub);transition:.15s;display:flex;align-items:center;justify-content:center;gap:4px;font-weight:600;}
.lumi-pact:hover{background:var(--ltag);color:var(--lp);border-color:var(--lborder);}
.lumi-pact.liked{background:var(--ltag);color:var(--lp);border-color:rgba(214,79,171,.2);}

/* Music card */
.lumi-music-card{background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:13px;padding:13px;display:flex;align-items:center;gap:11px;margin-bottom:9px;}
.lumi-music-cover{width:46px;height:46px;border-radius:9px;background:var(--lgrad);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:19px;}
.lumi-music-title{font-size:13px;font-weight:700;color:#fff;}
.lumi-music-artist{font-size:11px;color:rgba(255,255,255,.6);}
.lumi-music-bar{display:flex;gap:2px;margin-top:5px;}
.lumi-music-bar span{display:inline-block;width:3px;border-radius:2px;background:var(--lp);animation:dotBounce 1.2s ease-in-out infinite both;}
.lumi-music-bar span:nth-child(1){height:7px;animation-delay:.1s;}
.lumi-music-bar span:nth-child(2){height:13px;animation-delay:.2s;}
.lumi-music-bar span:nth-child(3){height:9px;animation-delay:.3s;}
.lumi-music-bar span:nth-child(4){height:15px;animation-delay:.15s;}
.lumi-music-bar span:nth-child(5){height:8px;animation-delay:.25s;}

/* Image mockup */
.lumi-img-card{border-radius:13px;overflow:hidden;margin-bottom:9px;}
.lumi-img-card img{width:100%;max-height:220px;object-fit:cover;display:block;}
.lumi-img-card-cap{padding:7px 10px;background:var(--linput);font-size:12px;color:var(--lsub);font-style:italic;}
.lumi-img-mock{width:100%;height:140px;background:var(--linput);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--lsub);font-size:12px;}

/* Replies */
.lumi-replies-wrap{display:none;margin-top:9px;}
.lumi-reply-thread{padding-left:9px;border-left:2px solid var(--lborder);}
.lumi-reply{padding:7px 0;border-bottom:1px solid var(--lborder);}
.lumi-reply:last-of-type{border-bottom:none;}
.lumi-reply-hd{display:flex;align-items:center;gap:6px;margin-bottom:3px;}
.lumi-reply-name{font-size:11px;font-weight:700;color:var(--ltext);}
.lumi-reply-time{font-size:10px;color:var(--lsub);margin-left:auto;}
.lumi-reply-body{font-size:12px;color:var(--ltext);line-height:1.6;padding-left:29px;}
.lumi-nested{margin-left:14px;margin-top:5px;padding-left:9px;border-left:2px dashed var(--lborder);}
.lumi-compose-rep{display:flex;gap:6px;margin-top:8px;}
.lumi-rep-input{flex:1;background:var(--linput);border:1px solid var(--lborder);border-radius:15px;padding:6px 11px;font-size:12px;font-family:var(--ff);color:var(--ltext);outline:none;resize:none;min-height:30px;max-height:70px;transition:.15s;}
.lumi-rep-input:focus{border-color:var(--lp);}
.lumi-rep-send{width:30px;height:30px;border-radius:50%;background:var(--lgrad);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

/* Theme palette grid */
.lumi-palette-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;}
.lumi-palette-btn{width:30px;height:30px;border-radius:50%;border:3px solid transparent;cursor:pointer;transition:.15s;flex-shrink:0;}
.lumi-palette-btn.selected{border-color:var(--ltext);transform:scale(1.15);}

/* Dark/Light toggle */
.lumi-mode-toggle{display:flex;background:var(--linput);border-radius:10px;padding:3px;border:1px solid var(--lborder);}
.lumi-mode-btn{flex:1;padding:5px 9px;border-radius:8px;border:none;background:none;cursor:pointer;font-size:11px;font-family:var(--ff);font-weight:600;color:var(--lsub);display:flex;align-items:center;justify-content:center;gap:4px;transition:.15s;}
.lumi-mode-btn.active{background:var(--lcard);color:var(--lp);box-shadow:0 1px 6px rgba(0,0,0,.1);}

/* API status */
.api-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.dot-ok{background:#34D399;}.dot-err{background:#FF4757;}.dot-idle{background:var(--lsub);}

@media(max-width:768px){.lumi-modal{width:97%;height:96dvh;border-radius:18px;}}
`;
    document.head.appendChild(el);
}

// ═══════════════════════════════════════════════════════════
// FAB
// ═══════════════════════════════════════════════════════════
function spawnFAB() {
    $('#lumi-fab,.lumi-menu').remove();
    const fab = document.createElement('div');
    fab.id = 'lumi-fab';
    fab.innerHTML = '<div class="lumi-fab-dot" id="lumi-fab-dot"></div>';
    const pos = EXT._internal.fabPos;
    if (pos) Object.assign(fab.style, pos);
    else { fab.style.top = '50%'; fab.style.right = '16px'; fab.style.transform = 'translateY(-50%)'; }
    document.body.appendChild(fab);

    const bid = getBotId();
    const hasNotify = !!(EXT.forumNotify && EXT.forumNotify[bid]);
    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    menu.innerHTML = `<div class="lumi-menu-grid">
      <div class="lumi-menu-item" id="lm-diary"><img src="${ASSETS.diary}"><span>Diary</span></div>
      <div class="lumi-menu-item${hasNotify ? ' has-notify' : ''}" id="lm-forum"><img src="${ASSETS.forum}"><span>Forum</span></div>
      <div class="lumi-menu-item" id="lm-set"><img src="${ASSETS.settings}"><span>Settings</span></div>
    </div>`;
    document.body.appendChild(menu);
    updateFabDot();

    // Drag logic
    let isDrag = false, sx, sy, il, it, dist = 0;
    const THRESH = 10;
    const startD = (x, y) => { isDrag = false; dist = 0; sx = x; sy = y; const r = fab.getBoundingClientRect(); il = r.left; it = r.top; fab.style.transform = 'none'; };
    const moveD  = (x, y) => { const dx = x-sx, dy = y-sy; dist = Math.hypot(dx, dy); if (dist > THRESH) isDrag = true; if (isDrag) { fab.style.left = (il+dx)+'px'; fab.style.top = (it+dy)+'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto'; $(menu).fadeOut(100); } };
    const endD   = () => {
        if (isDrag) { EXT._internal.fabPos = { top: fab.style.top, left: fab.style.left, right: 'auto', bottom: 'auto', transform: 'none' }; save(); }
        else if (dist < THRESH) {
            const r = fab.getBoundingClientRect(), mW = $(menu).outerWidth() || 190, mH = $(menu).outerHeight() || 130;
            menu.style.left = Math.max(8, Math.min(r.left + r.width/2 - mW/2, window.innerWidth - mW - 8)) + 'px';
            menu.style.top  = Math.max(8, r.top - mH - 10) + 'px';
            $(menu).fadeToggle(180);
        }
        isDrag = false;
    };
    fab.addEventListener('mousedown', e => { if (e.button !== 0) return; e.preventDefault(); startD(e.clientX, e.clientY); const mv = ev => moveD(ev.clientX, ev.clientY); const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); endD(); }; document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); });
    fab.addEventListener('touchstart', e => { e.preventDefault(); startD(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    fab.addEventListener('touchmove',  e => { e.preventDefault(); moveD(e.touches[0].clientX,  e.touches[0].clientY);  }, { passive: false });
    fab.addEventListener('touchend',   e => { e.preventDefault(); endD(); }, { passive: false });

    $('#lm-diary').on('click', () => { $(menu).fadeOut(); openModal('diary'); });
    $('#lm-forum').on('click', () => { $(menu).fadeOut(); clearForumNotify(); openModal('forum'); });
    $('#lm-set').on('click',   () => { $(menu).fadeOut(); openModal('settings'); });
}

function updateFabDot() {
    const has = !!(EXT.forumNotify && EXT.forumNotify[getBotId()]);
    $('#lumi-fab-dot').toggleClass('show', has);
    if (has) $('#lm-forum').addClass('has-notify'); else $('#lm-forum').removeClass('has-notify');
}
function setForumNotify()   { EXT.forumNotify[getBotId()] = true;  save(); updateFabDot(); }
function clearForumNotify() { EXT.forumNotify[getBotId()] = false; save(); updateFabDot(); }

// ═══════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`<div id="lumi-overlay" class="lumi-overlay"><div class="lumi-modal"><div class="lumi-head"><button class="lumi-icon-btn" id="lumi-back">${I.back}</button><div class="lumi-head-title" id="lumi-title">LumiPulse</div><button class="lumi-icon-btn" id="lumi-close">${I.close}</button></div><div id="lumi-body" class="lumi-body"></div></div></div>`);
    $('#lumi-close').on('click', () => $('#lumi-overlay').fadeOut(200));
    $('#lumi-overlay').on('click', e => { if (e.target.id === 'lumi-overlay') $('#lumi-overlay').fadeOut(200); });
    $('#lumi-back').on('click', () => $('#lumi-overlay').fadeOut(200));
}

function openModal(type = 'diary') {
    if (!$('#lumi-overlay').length) createModal();
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    if      (type === 'diary')   renderDiary();
    else if (type === 'forum')   { clearForumNotify(); renderForum(); }
    else if (type === 'settings') renderSettings();
}

// ═══════════════════════════════════════════════════════════
// DIARY MODULE
// ═══════════════════════════════════════════════════════════
function renderDiary() {
    const ctx     = SillyTavern.getContext();
    const bid     = getBotId();
    const botName = ctx.name2 || 'Unknown';
    const mems    = loadMems({ botId: bid });
    const si      = EXT._internal;
    const fc = si.filterChar || '', fd = si.filterDate || '', fl = si.filterLoc || '';
    const chars = [...new Set(mems.map(m => m.character))].filter(Boolean);
    const dates = [...new Set(mems.map(m => m.content.rp_date))].filter(Boolean);
    const locs  = [...new Set(mems.map(m => m.content.rp_location))].filter(Boolean);
    let filtered = mems;
    if (fc) filtered = filtered.filter(m => m.character === fc);
    if (fd) filtered = filtered.filter(m => m.content.rp_date === fd);
    if (fl) filtered = filtered.filter(m => m.content.rp_location === fl);

    $('#lumi-title').text('Diary');
    const body = $('#lumi-body');
    body.data('view', 'diary');
    body.html(`
      <div class="lumi-hero">
        <div class="lumi-hero-eye">${I.book} Memories of</div>
        <div class="lumi-hero-title">${esc(botName)}</div>
        <div class="lumi-hero-sub">${filtered.length} entries</div>
      </div>
      <div class="lumi-stats">
        <div class="lumi-stat"><b>${mems.length}</b><span>Total</span></div>
        <div class="lumi-stat"><b>${chars.length}</b><span>Chars</span></div>
        <div class="lumi-stat"><b>${mems.filter(m => m.meta.isFavorite).length}</b><span>Favs</span></div>
      </div>
      <div class="lumi-nav">
        <div class="lumi-tab active" data-dtab="entries">${I.book} Entries</div>
        <div class="lumi-tab" data-dtab="story">${I.scroll} Story</div>
        <div class="lumi-tab" data-dtab="lore">${I.globe} Lore</div>
        <div class="lumi-tab" data-dtab="links">${I.link} Links</div>
      </div>
      <div class="lumi-diary-pad">
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px;">
          <select id="fc" class="lumi-select" style="flex:1;min-width:78px;"><option value="">All chars</option>${chars.map(c => `<option value="${esc(c)}"${c===fc?' selected':''}>${esc(c)}</option>`).join('')}</select>
          <select id="fd" class="lumi-select" style="flex:1;min-width:78px;"><option value="">All dates</option>${dates.map(d => `<option value="${esc(d)}"${d===fd?' selected':''}>${esc(d)}</option>`).join('')}</select>
          <select id="fl" class="lumi-select" style="flex:1;min-width:78px;"><option value="">All locs</option>${locs.map(l => `<option value="${esc(l)}"${l===fl?' selected':''}>${esc(l)}</option>`).join('')}</select>
        </div>
        <button id="btn-open-gen" class="lumi-sm-btn" style="width:100%;justify-content:center;margin-bottom:9px;">${I.spark} Generate from Chat</button>
        <div id="gen-form" style="display:none;margin-bottom:11px;"></div>
        <div id="diary-content"></div>
      </div>`);

    $('#fc,#fd,#fl').on('change', () => {
        EXT._internal.filterChar = $('#fc').val();
        EXT._internal.filterDate = $('#fd').val();
        EXT._internal.filterLoc  = $('#fl').val();
        save(); renderDiary();
    });
    $('#btn-open-gen').on('click', () => {
        if ($('#gen-form').is(':visible')) $('#gen-form').slideUp(200);
        else { renderGenForm(); $('#gen-form').slideDown(200); }
    });
    $('.lumi-tab[data-dtab]').on('click', function() {
        $('.lumi-tab[data-dtab]').removeClass('active'); $(this).addClass('active');
        const t = $(this).data('dtab');
        if      (t === 'entries') renderDiaryEntries();
        else if (t === 'story')   renderStoryWeaver();
        else if (t === 'lore')    renderLoreTab();
        else if (t === 'links')   renderLinksTab();
    });
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const si = EXT._internal, fc = si.filterChar||'', fd = si.filterDate||'', fl = si.filterLoc||'';
    let mems = loadMems({ botId: getBotId() });
    if (fc) mems = mems.filter(m => m.character === fc);
    if (fd) mems = mems.filter(m => m.content.rp_date === fd);
    if (fl) mems = mems.filter(m => m.content.rp_location === fl);

    const byDate = {};
    mems.forEach(m => { const d = m.content.rp_date || 'Unknown'; if (!byDate[d]) byDate[d] = []; byDate[d].push(m); });
    const sorted = Object.keys(byDate).sort();

    if (!sorted.length) { $('#diary-content').html(`<div class="lumi-empty"><div class="lumi-empty-icon">📖</div><div class="lumi-empty-text">No memories yet.<br>Generate some from your chat!</div></div>`); return; }
    let html = '';
    sorted.forEach(d => {
        html += `<div class="lumi-tl-sep">${I.cal} ${esc(d)}</div>`;
        byDate[d].forEach((m, i) => { html += diaryCardHTML(m, i); });
    });
    $('#diary-content').html(html);
    bindDiaryEvents();
}

function diaryCardHTML(m, i) {
    const color = colorOf(m.character), init = (m.character||'?').charAt(0).toUpperCase();
    const locked = EXT.diary.display.showSecretSystem && checkUnlock(m) === false;
    const locB  = m.content.rp_location ? `<span class="lumi-badge">${I.mappin} ${esc(m.content.rp_location)}</span>` : '';
    const moodB = m.content.mood        ? `<span class="lumi-badge">${I.mood} ${esc(m.content.mood)}</span>` : '';
    const tags  = (m.content.rp_tags || []).map(t => `<span class="lumi-badge">${I.tag} ${esc(t)}</span>`).join('');
    if (locked) return `<div class="lumi-card" data-id="${m.id}"><div class="lumi-card-hd"><div class="lumi-av" style="background:${color}">${init}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="text-align:center;padding:11px;color:var(--lsub);">${I.lock}<div style="margin-top:5px;font-size:12px;">Locked</div></div></div>`;
    return `<div class="lumi-card" data-id="${m.id}">
      <div class="lumi-card-hd">
        <div class="lumi-av" style="background:${color}">${init}</div>
        <div class="lumi-char-name">${esc(m.character)}</div>
        ${m.meta.isFavorite ? `<span style="color:var(--lp);">♥</span>` : ''}
        ${m.meta.isPinned   ? `<span style="color:#F59E0B;">${I.pin}</span>` : ''}
      </div>
      <div class="lumi-card-meta">${moodB}${locB}${tags}</div>
      <div class="lumi-card-body">${esc(m.content.diary || '')}</div>
      <div class="lumi-card-foot">
        <button class="lumi-act${m.meta.isPinned ? ' act-on' : ''}" data-act="pin">${I.pin}</button>
        <button class="lumi-act${m.meta.isFavorite ? ' act-on' : ''}" data-act="fav">${m.meta.isFavorite ? I.heartF : I.heart}</button>
        <button class="lumi-act" data-act="edit">${I.edit}</button>
        <button class="lumi-act act-del" data-act="del">${I.trash}</button>
      </div>
    </div>`;
}

function bindDiaryEvents() {
    $('.lumi-act').off('click').on('click', function(e) {
        e.stopPropagation();
        const id  = $(this).closest('.lumi-card').data('id');
        const act = $(this).data('act');
        const mem = EXT.memories.find(m => m.id === id);
        if (!mem) return;
        if (act === 'pin') { mem.meta.isPinned = !mem.meta.isPinned; save(); renderDiaryEntries(); }
        if (act === 'fav') { mem.meta.isFavorite = !mem.meta.isFavorite; save(); renderDiaryEntries(); }
        if (act === 'edit') editMemInline(id);
        if (act === 'del')  { if (confirm('Delete?')) { EXT.memories = EXT.memories.filter(m => m.id !== id); save(); renderDiaryEntries(); } }
    });
}

function editMemInline(id) {
    const mem = EXT.memories.find(m => m.id === id); if (!mem) return;
    const card = $(`.lumi-card[data-id="${id}"]`);
    card.find('.lumi-card-body').html(`<textarea class="lumi-input lumi-textarea" style="font-size:13px;">${esc(mem.content.diary||'')}</textarea><div style="display:flex;gap:6px;margin-top:7px;"><button class="lumi-sm-btn" id="sv" style="flex:1;justify-content:center;">Save</button><button class="lumi-sm-btn" id="cv" style="flex:1;justify-content:center;">Cancel</button></div>`);
    card.find('#sv').on('click', () => { mem.content.diary = card.find('textarea').val(); save(); renderDiaryEntries(); toast('✓ Updated'); });
    card.find('#cv').on('click', () => renderDiaryEntries());
}

function renderGenForm() {
    $('#gen-form').html(`<div class="lumi-form-card">
      <div class="lumi-form-title">Generate Settings</div>
      <label class="lumi-label" style="margin-bottom:6px;">Scan Mode</label>
      <div style="display:flex;gap:5px;margin-bottom:9px;" id="gm">
        ${['latest','first','all'].map(v => `<button class="lumi-sm-btn gmo${v==='latest'?' act-on':''}" data-v="${v}" style="flex:1;justify-content:center;">${v.charAt(0).toUpperCase()+v.slice(1)}</button>`).join('')}
      </div>
      <div id="gc-wrap" style="margin-bottom:9px;"><label class="lumi-label">Message Count</label><input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input" style="font-size:13px;"></div>
      <button id="btn-run-gen" class="lumi-btn">${I.spark} Analyze & Generate</button>
    </div>`);
    $('#gm').on('click', '.gmo', function() { $('.gmo').removeClass('act-on'); $(this).addClass('act-on'); $('#gc-wrap').toggle($(this).data('v') !== 'all'); });
    $('#btn-run-gen').on('click', genDiaryBatch);
}

async function renderStoryWeaver() {
    const mems = loadMems({ botId: getBotId() }).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Story Weaver</div><p style="font-size:12px;color:var(--lsub);margin:0 0 11px;">Weave all diary entries into a cohesive narrative.</p><button id="btn-weave" class="lumi-btn">${I.scroll} Weave Story</button></div><div id="sw-out" style="display:none;background:var(--lcard);border:1px solid var(--lborder);border-radius:13px;padding:13px;font-size:13px;line-height:1.65;white-space:pre-wrap;max-height:260px;overflow-y:auto;margin-top:9px;"></div><div id="sw-acts" style="display:none;margin-top:9px;"><button id="btn-es" class="lumi-btn">${I.book} Export .md</button></div>`);
    $('#btn-weave').on('click', async function() {
        $(this).html(`<span class="lumi-spin"></span> Weaving...`).prop('disabled', true);
        const dt = mems.map(m => `[${m.character}|${m.content.rp_date}] ${m.content.diary}`).join('\n\n');
        const story = await callAI(`Weave into a Markdown story with chapters:\n\n${dt}`, 'You are a literary chronicler. Output only the story in Markdown format.');
        $(this).html(`${I.scroll} Weave Story`).prop('disabled', false);
        if (story) { $('#sw-out').text(story).show(); $('#sw-acts').show(); $('#btn-es').off('click').on('click', () => exportText(story, 'Story.md')); }
    });
}

async function renderLoreTab() {
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Lore Extractor</div><p style="font-size:12px;color:var(--lsub);margin:0 0 11px;">Generate SillyTavern World Info JSON.</p><button id="btn-lore" class="lumi-btn">${I.globe} Extract Lore</button></div><div id="lore-out" style="display:none;margin-top:9px;"></div>`);
    $('#btn-lore').on('click', async function() {
        $(this).html(`<span class="lumi-spin"></span> Extracting...`).prop('disabled', true);
        const mems = loadMems({ botId: getBotId() });
        const text = mems.map(m => `[${m.character}] ${m.content.diary}`).join('\n');
        const raw  = await callAI(
            `Extract World Info entries from this text. Return ONLY a JSON array:\n[{"keyword":"Name","type":"character|location|item|event","content":"description"}]\n\nText:\n${text}`,
            'You are a JSON API. Output ONLY a raw JSON array. No markdown, no explanation.'
        );
        $(this).html(`${I.globe} Extract Lore`).prop('disabled', false);
        const data = extractJSON(raw, 'array');
        if (data && data.length) {
            let html = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><tr style="background:var(--ltag);"><th style="padding:6px;text-align:left;color:var(--lp);">Keyword</th><th style="padding:6px;text-align:left;color:var(--lp);">Type</th><th style="padding:6px;text-align:left;color:var(--lp);">Content</th></tr>`;
            data.forEach(l => html += `<tr style="border-bottom:1px solid var(--lborder);"><td style="padding:6px;font-weight:700;">${esc(l.keyword||'')}</td><td style="padding:6px;">${esc(l.type||'')}</td><td style="padding:6px;color:var(--lsub);">${esc((l.content||'').slice(0,55))}...</td></tr>`);
            html += `</table></div><div style="margin-top:9px;"><button id="btn-el" class="lumi-btn">${I.book} Export JSON</button></div>`;
            const lb = { name:'LumiPulse Lorebook', entries:{} };
            data.forEach((item, i) => { lb.entries[i] = { uid:i, key:[item.keyword], comment:item.type, content:item.content, selective:true, probability:100, depth:4, group:'LumiPulse' }; });
            $('#lore-out').html(html).show();
            $('#btn-el').off('click').on('click', () => exportJSON(lb, 'Lorebook.json'));
        } else { $('#lore-out').html(`<div class="lumi-empty"><div class="lumi-empty-text">No lore found.</div></div>`).show(); }
    });
}

function renderLinksTab() {
    const mems   = loadMems({ botId: getBotId() });
    const linked = mems.filter(m => m.meta.linkedIds && m.meta.linkedIds.length > 0);
    let html = linked.length === 0 ? `<div class="lumi-empty"><div class="lumi-empty-icon">🔗</div><div class="lumi-empty-text">No linked memories.</div></div>` : '';
    linked.forEach(m => {
        const links = m.meta.linkedIds.map(id => {
            const lm = mems.find(x => x.id === id);
            return lm ? `<span class="lumi-badge" style="cursor:pointer;margin:3px 2px;" data-lid="${lm.id}">${I.link} ${esc(lm.character)} · ${esc(lm.content.rp_date)}</span>` : '';
        }).join('');
        html += `<div class="lumi-card"><div class="lumi-card-hd"><div class="lumi-av" style="background:${colorOf(m.character)}">${m.character.charAt(0)}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="font-size:11px;color:var(--lsub);margin-bottom:5px;">Linked:</div>${links}</div>`;
    });
    $('#diary-content').html(html);
    $('[data-lid]').off('click').on('click', function() {
        const mem = mems.find(m => m.id === $(this).data('lid'));
        if (mem) { $('#diary-content').html(diaryCardHTML(mem, 0) + `<button class="lumi-sm-btn" id="blk" style="width:100%;justify-content:center;margin-top:9px;">${I.back} Back</button>`); bindDiaryEvents(); $('#blk').on('click', renderLinksTab); }
    });
}

// ── Diary AI ─────────────────────────────────────────────────
async function genDiaryBatch() {
    const mode  = $('.gmo.act-on').data('v') || 'latest';
    const count = parseInt($('#gen-count').val()) || 30;
    $('#btn-run-gen').html(`<span class="lumi-spin"></span> Analyzing...`).prop('disabled', true);
    const results = await callDiaryAI(mode, count);
    $('#btn-run-gen').html(`${I.spark} Analyze & Generate`).prop('disabled', false);
    $('#gen-form').slideUp(200);
    if (results && results.length > 0) {
        const ctx = SillyTavern.getContext(), bid = getBotId();
        const wm  = EXT.diary.worldMode === 'auto' ? detectWorldMode() : EXT.diary.worldMode;
        results.forEach(r => saveMem({ id:'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), timestamp:new Date().toISOString(), character:r.character||ctx.name2||'Character', botId:bid, worldMode:wm, content:{...r}, meta:{ isPinned:false, isFavorite:false, isSecret:r.isSecret||false, linkedIds:r.linkedIds||[], tags:extractTags(r.diary||'') } }));
        toast(`✓ Created ${results.length} memories`); renderDiaryEntries();
    } else { toast('No new memories found', 'err'); }
}

async function callDiaryAI(mode, count) {
    const ctx     = SillyTavern.getContext(), allChat = ctx.chat || [];
    let slice, si = 0, ei = 0;
    if (mode === 'latest') { slice = allChat.slice(-count); si = Math.max(0, allChat.length-count); ei = allChat.length; }
    else if (mode === 'first') { slice = allChat.slice(0, count); si = 0; ei = count; }
    else { slice = allChat.filter(m => m.mes && m.mes.length > 15).slice(-120); si = Math.max(0, allChat.length-120); ei = allChat.length; }

    const log  = slice.filter(m => m.mes && m.mes.length > 8).map(m => `${m.is_user?'User':(m.name||'NPC')}: ${(m.mes||'').replace(/<[^>]*>/g,'').slice(0,70)}`).join('\n');
    const prev = loadMems({ botId: getBotId() }).slice(0, 6).map(m => `[${m.character}] ${(m.content.diary||'').slice(0,40)}`).join('\n');
    const reg  = Object.keys(EXT._internal.nameRegistry || {}).join(', ');

    // ✅ Neutral framing — avoids content policy refusals
    const sys    = 'You are a creative writing assistant documenting fictional story events as diary entries. This is fictional creative writing. Output ONLY a raw JSON array. Do not add any text before or after the JSON array.';
    const prompt = `Document these fictional roleplay events as personal diary entries.
Known characters: ${reg||'various'}
Previously written (skip these): ${prev||'none'}
Story log:
${log}

Output a JSON array ONLY (no other text):
[{"character":"Name","rp_date":"Thai date e.g. 15 มีนาคม 2567","rp_location":"Location","rp_tags":["#Tag"],"mood":"Mood","diary":"2-4 sentences in character's voice","isSecret":false,"linkedIds":[]}]`;

    const raw  = await callAI(prompt, sys);
    const data = extractJSON(raw, 'array');
    return Array.isArray(data) ? data : [];
}

// ── Memory helpers ────────────────────────────────────────────
function loadMems(filter = {}) {
    let m = [...(EXT.memories || [])];
    if (filter.botId)    m = m.filter(x => x.botId === filter.botId || !x.botId);
    if (filter.character) m = m.filter(x => x.character === filter.character);
    return m.sort((a, b) => (b.meta.isPinned?1:0) - (a.meta.isPinned?1:0) || new Date(b.timestamp) - new Date(a.timestamp));
}
function saveMem(entry) {
    if (!EXT._internal.nameRegistry) EXT._internal.nameRegistry = {};
    let cn = entry.character.replace(/[()（）[\]]/g, '').trim(), canon = cn;
    for (let k in EXT._internal.nameRegistry) { if (simScore(cn, k) > 90) { canon = k; break; } }
    EXT._internal.nameRegistry[canon] = true;
    entry.character = canon;
    const ex = EXT.memories.filter(m => m.character === canon);
    if (ex.some(m => simScore(m.content.diary||'', entry.content.diary||'') > 85)) return;
    EXT.memories.unshift(entry);
    if (EXT.memories.length > EXT.diary.storage.max) EXT.memories = EXT.memories.slice(0, EXT.diary.storage.max);
    save();
}
const checkUnlock   = m => { if (!m.meta.isSecret) return true; const mode = EXT.diary.display.secretMode; if (mode==='time') return (Date.now()-new Date(m.timestamp)) > 86400000*3; if (mode==='affection') return (m.content.affection_score||0) >= 80; return false; };
const extractTags   = t => { const tags=[], kw={'#Romantic':['รัก','หัวใจ'],'#Drama':['เสียใจ','ร้องไห้'],'#Mystery':['ลึกลับ','ความลับ']}, l=t.toLowerCase(); for (const[k,v] of Object.entries(kw)) if (v.some(w=>l.includes(w))) tags.push(k); return tags; };
const detectWorldMode = () => { const names=new Set(); (SillyTavern.getContext().chat||[]).slice(-50).forEach(m=>{if(m.name&&!m.is_user&&!m.is_system)names.add(m.name);}); return names.size>2?'rpg':'solo'; };

// ═══════════════════════════════════════════════════════════
// FORUM MODULE
// ═══════════════════════════════════════════════════════════
function renderForum() {
    const ctx     = SillyTavern.getContext();
    const botName = ctx.name2 || 'World';
    const posts   = getBotPosts();
    const threads = posts.filter(p => p.type === 'thread');

    $('#lumi-title').text('Forum');
    const body = $('#lumi-body');
    body.data('view', 'forum');
    body.html(`
      <div class="lumi-hero">
        <div class="lumi-hero-eye">${I.news} Community Board</div>
        <div class="lumi-hero-title">${esc(botName)}</div>
        <div class="lumi-hero-sub">${threads.length} posts</div>
      </div>
      <div class="lumi-forum-bar">
        <button class="lumi-reload-btn" id="btn-gen-refresh" title="Generate new AI posts">${I.spark} AI Generate</button>
        <button class="lumi-reload-btn" id="btn-ui-refresh" title="Refresh display" style="max-width:46px;padding:7px;">${I.refresh}</button>
        <button class="lumi-sm-btn lumi-danger-btn" id="btn-clr-forum" title="Clear all posts" style="padding:6px 9px;">${I.trash}</button>
      </div>
      <div class="lumi-compose">
        <div class="lumi-compose-row">
          <div class="lumi-av lumi-av-sm" style="background:${colorOf(ctx.name1||'Player')}">${(ctx.name1||'P').charAt(0)}</div>
          <span style="font-size:12px;color:var(--lsub);">What's on your mind?</span>
        </div>
        <textarea id="compose-txt" class="lumi-input lumi-textarea" placeholder="Write a post..."></textarea>
        <div id="img-preview-wrap"></div>
        <div class="lumi-compose-footer">
          <button id="btn-post" class="lumi-sm-btn">${I.send} Post</button>
          <label class="lumi-sm-btn" style="cursor:pointer;">${I.img} Photo<input type="file" id="img-upload" accept="image/*" style="display:none;"></label>
        </div>
      </div>
      <div class="lumi-feed" id="lumi-feed"></div>`);

    // State for image
    let pendingImg = null;
    $('#img-upload').on('change', function() {
        const file = this.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            pendingImg = e.target.result;
            $('#img-preview-wrap').html(`<div class="lumi-img-preview-wrap"><img src="${pendingImg}" class="lumi-img-preview"><button class="lumi-img-rm" id="rm-img">${I.close}</button></div>`);
            $('#rm-img').on('click', () => { pendingImg = null; $('#img-preview-wrap').html(''); });
        };
        reader.readAsDataURL(file);
    });

    // Post button
    $('#btn-post').on('click', async () => {
        const txt = $('#compose-txt').val().trim();
        if (!txt && !pendingImg) { toast('Write something first', 'err'); return; }
        const ctx2 = SillyTavern.getContext();
        const np = { id:'post_'+Date.now(), type:'thread', posterType:'player', author:ctx2.name1||'Player', title:null, content:txt||'📸', threadTag:'Post', postMedia: pendingImg ? {type:'image',data:pendingImg,caption:txt} : null, timestamp:new Date().toISOString(), parentId:null, likes:0, likedBy:[] };
        const arr = getBotPosts(); arr.push(np); savePosts(arr);
        $('#compose-txt').val(''); pendingImg = null; $('#img-preview-wrap').html('');
        renderFeed(); toast('✓ Posted');
        if (EXT.forum.autoReactOnRP) setTimeout(() => aiReactToPost(np.id), 1200);
    });

    // AI Generate button
    $('#btn-gen-refresh').on('click', async function() {
        $(this).html(`<span class="lumi-spin lumi-spin-c"></span> Generating...`).prop('disabled', true);
        await runForumRefresh();
        $(this).html(`${I.spark} AI Generate`).prop('disabled', false);
    });

    // ✅ UI-only refresh button — just re-renders existing posts
    $('#btn-ui-refresh').on('click', function() {
        renderFeed();
        toast('✓ Feed refreshed');
    });

    $('#btn-clr-forum').on('click', () => {
        if (confirm('Clear all forum posts for this character?')) { savePosts([]); renderFeed(); toast('✓ Cleared'); }
    });

    renderFeed();
}

// ── Feed render ───────────────────────────────────────────────
function renderFeed() {
    const threads = getBotPosts().filter(p => p.type === 'thread').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (!threads.length) {
        $('#lumi-feed').html(`<div class="lumi-empty"><div class="lumi-empty-icon">💬</div><div class="lumi-empty-text">Nothing here yet.<br>Hit <b>AI Generate</b> to see what's happening!</div></div>`);
        return;
    }
    const allPosts = getBotPosts();
    let html = '';
    threads.forEach(th => {
        const replies = allPosts.filter(p => p.parentId === th.id);
        html += postCardHTML(th, replies, allPosts);
    });
    $('#lumi-feed').html(html);
    bindFeedEvents();
}

function postCardHTML(th, replies, allPosts) {
    const color    = colorOf(th.author), init = (th.author||'?').charAt(0).toUpperCase();
    const liked    = th.likedBy && th.likedBy.includes('__player__');
    const likeCount= th.likes || 0;
    const typeClass= th.posterType === 'news' ? 'post-news' : th.posterType === 'player' ? 'post-player' : '';
    const typeBadge= th.posterType === 'news'    ? `<span class="lumi-ptype pt-news">${I.news} News</span>`
                   : th.posterType === 'npc'     ? `<span class="lumi-ptype pt-npc">NPC</span>`
                   : th.posterType === 'citizen' ? `<span class="lumi-ptype pt-citizen">Citizen</span>`
                   :                               `<span class="lumi-ptype pt-main">Main</span>`;

    // Media mockup
    let mediaMock = '';
    if (th.postMedia) {
        if (th.postMedia.type === 'image') {
            mediaMock = `<div class="lumi-img-card"><img src="${th.postMedia.data}" alt="post image" onerror="this.parentElement.innerHTML='<div class=\\'lumi-img-mock\\'>${I.img}<span>Image</span></div>'"><div class="lumi-img-card-cap">${esc(th.postMedia.caption||'')}</div></div>`;
        } else if (th.postMedia.type === 'music') {
            mediaMock = `<div class="lumi-music-card"><div class="lumi-music-cover">🎵</div><div><div class="lumi-music-title">${esc(th.postMedia.title||'Unknown Track')}</div><div class="lumi-music-artist">${esc(th.postMedia.artist||'')}</div><div class="lumi-music-bar"><span></span><span></span><span></span><span></span><span></span></div></div></div>`;
        } else if (th.postMedia.type === 'photo_desc') {
            mediaMock = `<div class="lumi-img-card"><div class="lumi-img-mock">${I.img}<span>${esc(th.postMedia.caption||'Photo')}</span></div></div>`;
        }
    }

    const replyHTML = buildReplyHTML(replies, allPosts, 0);

    return `<div class="lumi-post ${typeClass}" data-id="${th.id}">
      <div class="lumi-post-hd">
        <div class="lumi-av" style="background:${color}">${init}</div>
        <div class="lumi-post-aw">
          <div class="lumi-post-author">${esc(th.author)} ${typeBadge}</div>
          <div class="lumi-post-time">${timeAgo(th.timestamp)}${th.threadTag?` · <span class="lumi-badge" style="font-size:9px;">${esc(th.threadTag)}</span>`:''}</div>
        </div>
        <button class="lumi-act act-del" data-act="del-post" data-id="${th.id}" style="padding:3px 5px;">${I.trash}</button>
      </div>
      ${th.title ? `<div class="lumi-post-title">${esc(th.title)}</div>` : ''}
      ${mediaMock}
      ${th.content && th.content !== '📸' ? `<div class="lumi-post-body">${esc(th.content)}</div>` : ''}
      <div class="lumi-post-acts">
        <button class="lumi-pact${liked?' liked':''}" data-act="like" data-id="${th.id}">${liked?I.heartF:I.heart} ${likeCount||''} Like</button>
        <button class="lumi-pact" data-act="toggle-rep" data-id="${th.id}">${I.comment} ${replies.length||''} Reply</button>
        <button class="lumi-pact" data-act="ai-reply" data-id="${th.id}">${I.spark} AI</button>
      </div>
      <div class="lumi-replies-wrap" id="rep-${th.id}">
        <div class="lumi-reply-thread">${replyHTML}</div>
        <div class="lumi-compose-rep">
          <textarea class="lumi-rep-input" placeholder="Reply..." data-thread="${th.id}" rows="1"></textarea>
          <button class="lumi-rep-send" data-act="send-rep" data-thread="${th.id}">${I.send}</button>
        </div>
      </div>
    </div>`;
}

// Recursive reply renderer
function buildReplyHTML(replies, allPosts, depth) {
    if (depth > 4 || !replies.length) return '';
    return replies.map(r => {
        const color = colorOf(r.author), init = (r.author||'?').charAt(0).toUpperCase();
        const avCls = depth > 0 ? 'lumi-av-xs' : 'lumi-av-sm';
        const nested = allPosts.filter(p => p.parentId === r.id);
        const nestedHTML = nested.length ? `<div class="lumi-nested">${buildReplyHTML(nested, allPosts, depth+1)}</div>` : '';
        return `<div class="lumi-reply">
          <div class="lumi-reply-hd">
            <div class="lumi-av ${avCls}" style="background:${color}">${init}</div>
            <div class="lumi-reply-name">${esc(r.author)}</div>
            <div class="lumi-reply-time">${timeAgo(r.timestamp)}</div>
          </div>
          <div class="lumi-reply-body">${esc(r.content)}</div>
          ${nestedHTML}
        </div>`;
    }).join('');
}

function bindFeedEvents() {
    $('[data-act="like"]').off('click').on('click', function() {
        const id = $(this).data('id'), arr = getBotPosts(), post = arr.find(p => p.id === id);
        if (!post) return;
        if (!post.likedBy) post.likedBy = [];
        const idx = post.likedBy.indexOf('__player__');
        if (idx >= 0) { post.likedBy.splice(idx, 1); post.likes = Math.max(0, (post.likes||0)-1); }
        else          { post.likedBy.push('__player__'); post.likes = (post.likes||0)+1; }
        savePosts(arr); renderFeed();
    });

    $('[data-act="toggle-rep"]').off('click').on('click', function() {
        const id = $(this).data('id');
        $(`#rep-${id}`).is(':visible') ? $(`#rep-${id}`).slideUp(180) : $(`#rep-${id}`).slideDown(200);
    });

    $('[data-act="send-rep"]').off('click').on('click', async function() {
        const tid = $(this).data('thread');
        const txt = $(`.lumi-rep-input[data-thread="${tid}"]`).val().trim();
        if (!txt) return;
        const ctx2 = SillyTavern.getContext();
        const r = { id:'rep_'+Date.now(), type:'reply', posterType:'player', author:ctx2.name1||'Player', content:txt, timestamp:new Date().toISOString(), parentId:tid, likes:0, likedBy:[] };
        const arr = getBotPosts(); arr.push(r); savePosts(arr);
        $(`.lumi-rep-input[data-thread="${tid}"]`).val('');
        renderFeed();
        if (EXT.forum.autoReactOnRP) setTimeout(() => aiReactToPost(tid), 900);
    });

    $('[data-act="ai-reply"]').off('click').on('click', async function() {
        const tid  = $(this).data('id');
        const $btn = $(this);
        $btn.html(`<span class="lumi-spin lumi-spin-c" style="width:10px;height:10px;border-width:2px;"></span>`).prop('disabled', true);
        await aiReactToPost(tid);
        $btn.html(`${I.spark} AI`).prop('disabled', false);
    });

    $('[data-act="del-post"]').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).data('id');
        if (!confirm('Delete post and its replies?')) return;
        savePosts(getBotPosts().filter(p => p.id !== id && p.parentId !== id));
        renderFeed();
    });

    $('.lumi-rep-input').on('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 75) + 'px';
    });
}

// ═══════════════════════════════════════════════════════════
// FORUM AI ENGINE
// ✅ Uses callAIForForum — strict JSON mode
// ═══════════════════════════════════════════════════════════
function buildPosterPool() {
    const ctx = SillyTavern.getContext(), pt = EXT.forum.posterTypes, pool = [];
    if (pt.mainChars) {
        const mains = new Set();
        (ctx.chat || []).slice(-60).forEach(m => { if (m.name && !m.is_user) mains.add(m.name); });
        if (ctx.name2) mains.add(ctx.name2);
        mains.forEach(c => pool.push({ name: c, type: 'main' }));
    }
    if (pt.npcs)     pool.push({ name: '__npc__',     type: 'npc',     placeholder: true });
    if (pt.citizens) pool.push({ name: '__citizen__', type: 'citizen', placeholder: true });
    if (pt.news)     pool.push({ name: '__news__',    type: 'news',    placeholder: true });
    return pool;
}

async function runForumRefresh() {
    const ctx      = SillyTavern.getContext();
    const existing = getBotPosts();
    const pool     = buildPosterPool();
    if (!pool.length) { toast('No character pool configured', 'err'); return; }

    const chatCtx = (ctx.chat || []).slice(-20)
        .filter(m => m.mes && m.mes.length > 5)
        .map(m => `${m.is_user?'User':m.name}: ${(m.mes||'').replace(/<[^>]*>/g,'').replace(/\n/g,' ').slice(0,80)}`)
        .join('\n') || 'No recent events.';

    const existingTitles = existing.slice(-8).filter(p => p.type === 'thread')
        .map(p => p.title || p.content.slice(0, 35)).join('; ');

    const mainNames = pool.filter(p => !p.placeholder).map(p => p.name);
    const hasCitizen = EXT.forum.posterTypes.citizens;
    const hasNPC     = EXT.forum.posterTypes.npcs;
    const hasNews    = EXT.forum.posterTypes.news;

    const prompt = `Generate a realistic social media feed for a fictional roleplay world.

Recent story events:
${chatCtx}

Main characters: ${mainNames.join(', ') || 'various'}
Avoid topics already posted: ${existingTitles || 'none'}

Generate 3-6 posts. Mix types:
${mainNames.length ? '- Main character posts: feelings, reactions, slice-of-life\n' : ''}\
${hasNPC     ? '- NPC posts: invent believable side-character names fitting the world\n' : ''}\
${hasCitizen ? '- Citizen posts: public opinions, gossip (invent realistic public names)\n' : ''}\
${hasNews    ? '- News posts: formal announcements fitting the world setting\n' : ''}\

Vary the content style: feelings/emotions, sharing a song (use postMedia music), describing a photo (use postMedia photo_desc), venting, asking questions, gossip, announcements.

Each post MUST have 2-5 replies from different characters (can be nested).

Output ONLY this JSON array (nothing else before or after):
[{"author":"Name","posterType":"main|npc|citizen|news","title":"Title or null","content":"Post body 1-3 sentences","threadTag":"Gossip|Event|Question|Update|News|Warning|Rant|Music|Memory","postMedia":null,"replies":[{"author":"Name","posterType":"main|npc|citizen","content":"Reply 1-2 sentences","nestedReplies":[{"author":"Name","posterType":"main|npc|citizen","content":"Nested reply"}]}]}]`;

    try {
        console.log('[LumiPulse] Sending Forum Prompt...');
        const raw  = await callAIForForum(prompt);
        console.log('[LumiPulse] Raw Response Length:', raw ? raw.length : 0);
        
        const data = extractJSON(raw, 'array');

        if (!data || !Array.isArray(data) || !data.length) {
            toast('AI did not return valid posts. Check console.', 'err');
            console.error('[LumiPulse] Raw response:', raw ? raw.slice(0, 300) : 'EMPTY');
            return;
        }

        const now  = Date.now(), toAdd = [];
        data.filter(p => p && typeof p.content === 'string' && p.content.length > 0).forEach((p, i) => {
            const tid = 'post_' + (now + i*100) + '_' + Math.random().toString(36).substr(2, 4);
            toAdd.push({
                id: tid, type: 'thread',
                posterType: p.posterType || 'npc',
                author: (p.author || 'Unknown').trim(),
                title:  p.title && p.title.trim() ? p.title.trim() : null,
                content: p.content.trim(),
                threadTag: p.threadTag || 'Update',
                postMedia: p.postMedia || null,
                timestamp: new Date(now + i*2000).toISOString(),
                parentId: null, likes: Math.floor(Math.random()*6), likedBy: []
            });
            if (Array.isArray(p.replies)) {
                addRepliesRecursive(p.replies, tid, toAdd, now + i*100 + 50, 0);
            }
        });

        if (!toAdd.length) { toast('No valid posts in response', 'err'); return; }
        savePosts([...existing, ...toAdd]);
        renderFeed();
        toast(`✓ Added ${toAdd.filter(p => p.type==='thread').length} posts`);
    } catch (e) {
        console.error('[LumiPulse] runForumRefresh error:', e);
        toast('Error: ' + e.message, 'err');
    }
}

function addRepliesRecursive(replies, parentId, toAdd, baseTime, depth) {
    if (depth > 3 || !Array.isArray(replies)) return;
    replies.filter(r => r && typeof r.content === 'string' && r.content.length > 0).forEach((r, j) => {
        const rid = 'rep_' + (baseTime + j*300 + depth*10) + '_' + Math.random().toString(36).substr(2, 4);
        toAdd.push({
            id: rid, type: 'reply',
            posterType: r.posterType || 'npc',
            author:  (r.author || 'Someone').trim(),
            content: r.content.trim(),
            timestamp: new Date(baseTime + (j+1)*700 + depth*200).toISOString(),
            parentId, likes: Math.floor(Math.random()*3), likedBy: []
        });
        if (Array.isArray(r.nestedReplies) && r.nestedReplies.length) {
            addRepliesRecursive(r.nestedReplies, rid, toAdd, baseTime + j*300 + depth*10 + 50, depth+1);
        }
    });
}

async function aiReactToPost(threadId) {
    const all    = getBotPosts();
    const thread = all.find(p => p.id === threadId);
    if (!thread) return;

    const existingReps = all.filter(p => p.parentId === threadId);
    const mainChars    = buildPosterPool().filter(p => !p.placeholder && p.name !== thread.author);
    if (!mainChars.length) return;

    const recentR  = existingReps.slice(-4).map(r => r.author);
    const eligible = mainChars.filter(p => !recentR.includes(p.name));
    if (!eligible.length) return;

    // Maybe like
    if (Math.random() > 0.45) {
        const liker = eligible[Math.floor(Math.random() * eligible.length)];
        if (!thread.likedBy) thread.likedBy = [];
        if (!thread.likedBy.includes(liker.name)) { thread.likedBy.push(liker.name); thread.likes = (thread.likes||0)+1; }
    }

    const numRep   = Math.min(eligible.length, Math.floor(Math.random()*3)+1);
    const repliers = eligible.slice(0, numRep);
    const prevCtx  = existingReps.length ? `Previous replies:\n${existingReps.slice(-4).map(r=>`${r.author}: ${r.content}`).join('\n')}` : '';

    const prompt = `Generate ${numRep} natural social media reply(ies) for this post.
Post by ${thread.author}: "${(thread.title?thread.title+' — ':'')+thread.content}"
${prevCtx}
Replying characters: ${repliers.map(r=>r.name).join(', ')}
Rules: casual 1-2 sentences, authentic tone, react naturally (agree/disagree/tease/ask).

Output ONLY this JSON array:
[{"author":"Character name","posterType":"main","content":"Reply text","nestedReplies":[]}]`;

    try {
        const raw  = await callAIForForum(prompt);
        const data = extractJSON(raw, 'array');
        if (!data || !Array.isArray(data)) { savePosts(all); if ($('#lumi-feed').length) renderFeed(); return; }

        const now     = Date.now(), newReps = [];
        data.filter(r => r && typeof r.content === 'string' && r.content.length > 0).forEach((r, i) => {
            const rid = 'rep_' + (now + i*400) + '_' + Math.random().toString(36).substr(2, 4);
            newReps.push({
                id: rid, type: 'reply',
                posterType: r.posterType || 'main',
                author: (r.author || repliers[0]?.name || 'Someone').trim(),
                content: r.content.trim(),
                timestamp: new Date(now + i*500).toISOString(),
                parentId: threadId, likes: 0, likedBy: []
            });
            if (Array.isArray(r.nestedReplies) && r.nestedReplies.length) {
                addRepliesRecursive(r.nestedReplies, rid, newReps, now + i*400 + 50, 1);
            }
        });

        if (!newReps.length) { savePosts(all); if ($('#lumi-feed').length) renderFeed(); return; }
        savePosts([...all, ...newReps]);
        if ($('#lumi-feed').length) renderFeed();
        if (!$('#lumi-overlay').is(':visible')) setForumNotify();
    } catch (e) {
        console.error('[LumiPulse] aiReactToPost:', e);
        savePosts(all);
    }
}

// ── Auto triggers ─────────────────────────────────────────────
function setupForumAutoTrigger() {
    $(document).off('messageReceived.lumi-forum').on('messageReceived.lumi-forum', async () => {
        const f = EXT.forum;
        if (!f.enabled || !f.autoGen.enabled) return;
        EXT._internal.forumMsgCounter = (EXT._internal.forumMsgCounter || 0) + 1;
        const now = Date.now();
        let gen = false;
        if (f.autoGen.triggerType === 'turn_count'    && EXT._internal.forumMsgCounter >= f.autoGen.turnInterval) { gen = true; EXT._internal.forumMsgCounter = 0; }
        if (f.autoGen.triggerType === 'time_interval' && (now - EXT._internal.lastForumGenTime)/60000 >= f.autoGen.timeInterval) { gen = true; EXT._internal.lastForumGenTime = now; }
        if (f.autoGen.triggerType === 'random'        && Math.random() < f.autoGen.randomChance) gen = true;
        if (gen) await runForumRefresh();

        // Auto-react to player's last post after each RP turn
        if (f.autoReactOnRP) {
            const playerPosts = getBotPosts().filter(p => p.posterType === 'player').slice(-2);
            for (const pp of playerPosts) {
                const tid = pp.type === 'thread' ? pp.id : pp.parentId;
                if (tid) setTimeout(() => aiReactToPost(tid), 1500 + Math.random()*1000);
            }
        }
    });
}

function setupDiaryAutoTrigger() {
    $(document).off('messageReceived.lumi-diary').on('messageReceived.lumi-diary', async () => {
        const cfg = EXT.diary.autoGen;
        if (!cfg.enabled) return;
        EXT._internal.diaryMsgCounter = (EXT._internal.diaryMsgCounter || 0) + 1;
        const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
        let gen = false;
        if      (cfg.triggerType === 'turn_count' && EXT._internal.diaryMsgCounter >= cfg.turnInterval) { gen = true; EXT._internal.diaryMsgCounter = 0; }
        else if (cfg.triggerType === 'emotion'    && cfg.emotionKeywords.some(k => lastMsg.includes(k))) gen = true;
        else if (cfg.triggerType === 'random'     && Math.random() < cfg.randomChance) gen = true;
        if (!gen) return;

        const results = await callDiaryAI('latest', cfg.turnInterval || 20);
        if (results && results.length) {
            const ctx = SillyTavern.getContext(), bid = getBotId();
            const wm  = EXT.diary.worldMode === 'auto' ? detectWorldMode() : EXT.diary.worldMode;
            results.forEach(r => saveMem({ id:'mem_auto_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), timestamp:new Date().toISOString(), character:r.character||ctx.name2||'Character', botId:bid, worldMode:wm, content:{...r}, meta:{ isPinned:false, isFavorite:false, isSecret:r.isSecret||false, linkedIds:r.linkedIds||[], tags:extractTags(r.diary||'') } }));
        }
    });
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
function renderSettings() {
    $('#lumi-title').text('Settings');
    const body = $('#lumi-body');
    body.data('view', 'settings');
    const s  = EXT, ag = s.diary.autoGen, fg = s.forum.autoGen, api = s.api;
    const pt = s.forum.posterTypes || { mainChars:true, npcs:true, citizens:true, news:true };
    const curTheme = s._internal.theme   || 'pink';
    const darkMode = s._internal.darkMode|| false;

    body.html(`<div style="padding:11px 13px 22px;">

    <div class="lumi-form-card">
      <div class="lumi-form-title">Appearance</div>
      <label class="lumi-label" style="margin-bottom:6px;">Background</label>
      <div class="lumi-mode-toggle" style="margin-bottom:10px;">
        <button class="lumi-mode-btn${!darkMode?' active':''}" data-dm="false">${I.sun} Light</button>
        <button class="lumi-mode-btn${darkMode?' active':''}" data-dm="true">${I.moon} Dark</button>
      </div>
      <label class="lumi-label" style="margin-bottom:6px;">Color Theme</label>
      <div class="lumi-palette-grid">
        ${Object.entries(PALETTES).map(([k,v])=>`<button class="lumi-palette-btn${k===curTheme?' selected':''}" data-pal="${k}" style="background:${v.grad};border-color:${k===curTheme?'var(--ltext)':'transparent'};" title="${k}"></button>`).join('')}
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">${I.key} Custom API (LumiPulse only)</div>
      <div class="lumi-set-row"><span>Use Custom API</span><input type="checkbox" id="api-en" ${api.enabled?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div id="api-cfg" style="display:${api.enabled?'block':'none'};">
        <div style="margin:7px 0 5px;"><label class="lumi-label">Provider</label>
          <select id="api-provider" class="lumi-select" style="width:100%;box-sizing:border-box;">
            <option value="openai" ${api.provider==='openai'?'selected':''}>OpenAI / Compatible</option>
            <option value="anthropic" ${api.provider==='anthropic'?'selected':''}>Anthropic Claude</option>
            <option value="google" ${api.provider==='google'?'selected':''}>Google Gemini</option>
          </select>
        </div>
        <div id="base-url-row" style="margin-bottom:5px;display:${api.provider==='google'?'none':'block'};">
          <label class="lumi-label">Base URL</label>
          <input type="text" id="api-url" value="${esc(api.baseUrl||'')}" class="lumi-input" placeholder="https://api.openai.com/v1">
        </div>
        <div style="margin-bottom:5px;"><label class="lumi-label">API Key</label>
          <div style="display:flex;gap:6px;align-items:center;">
            <input type="password" id="api-key" value="${esc(api.apiKey||'')}" class="lumi-input" style="flex:1;font-family:monospace;font-size:11px;" placeholder="sk-... or AIza...">
            <div class="api-dot ${api.apiKey?'dot-ok':'dot-idle'}" id="api-dot"></div>
          </div>
        </div>
        <div style="margin-bottom:9px;"><label class="lumi-label">Model <small style="font-weight:400;text-transform:none;">(save key then fetch)</small></label>
          <div style="display:flex;gap:5px;">
            <select id="api-model-sel" class="lumi-select" style="flex:1;min-width:0;"></select>
            <button id="btn-fetch-models" class="lumi-sm-btn" style="padding:6px 9px;" title="Fetch models">${I.refresh}</button>
          </div>
          <div id="model-status" style="font-size:11px;color:var(--lsub);margin-top:3px;"></div>
        </div>
        <button id="btn-test-api" class="lumi-sm-btn" style="width:100%;justify-content:center;">${I.key} Test Connection</button>
        <div id="api-test-res" style="margin-top:5px;font-size:11px;color:var(--lsub);"></div>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">General</div>
      <div class="lumi-set-row"><span>Extension Enabled</span><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>World Mode</span><select id="set-wm"><option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option><option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option><option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option></select></div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Diary Auto-Gen</div>
      <div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="ag-en" ${ag.enabled?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="ag-tr"><option value="turn_count" ${ag.triggerType==='turn_count'?'selected':''}>Every X Messages</option><option value="emotion" ${ag.triggerType==='emotion'?'selected':''}>Emotion Keywords</option><option value="random" ${ag.triggerType==='random'?'selected':''}>Random</option></select></div>
      ${ag.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Messages per gen</span><input type="number" id="ag-int" value="${ag.turnInterval}" min="5" max="100" style="width:55px;"></div>`:''}
      ${ag.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="ag-chance" value="${Math.round(ag.randomChance*100)}" min="1" max="50" style="width:55px;"></div>`:''}
      ${ag.triggerType==='emotion'?`<div class="lumi-set-row" style="flex-direction:column;align-items:flex-start;gap:4px;"><span>Keywords (comma-separated)</span><input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" style="width:100%;box-sizing:border-box;background:var(--linput);border:1px solid var(--lborder);border-radius:8px;padding:5px 7px;color:var(--ltext);font-family:var(--ff);outline:none;font-size:12px;"></div>`:''}
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Forum Auto-Gen</div>
      <div class="lumi-set-row"><span>Forum Enabled</span><input type="checkbox" id="forum-en" ${s.forum.enabled?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Auto-react to my RP posts</span><input type="checkbox" id="forum-react" ${s.forum.autoReactOnRP?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Auto-gen Enabled</span><input type="checkbox" id="forum-ag-en" ${fg.enabled?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="forum-tr"><option value="turn_count" ${fg.triggerType==='turn_count'?'selected':''}>Every X Msgs</option><option value="time_interval" ${fg.triggerType==='time_interval'?'selected':''}>Every X Min</option><option value="random" ${fg.triggerType==='random'?'selected':''}>Random</option></select></div>
      ${fg.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Messages</span><input type="number" id="forum-int" value="${fg.turnInterval}" min="3" max="100" style="width:55px;"></div>`:''}
      ${fg.triggerType==='time_interval'?`<div class="lumi-set-row"><span>Minutes</span><input type="number" id="forum-time" value="${fg.timeInterval}" min="1" max="60" style="width:55px;"></div>`:''}
      ${fg.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="forum-chance" value="${Math.round(fg.randomChance*100)}" min="1" max="50" style="width:55px;"></div>`:''}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--lborder);">
        <div class="lumi-form-title" style="margin-bottom:7px;">Who can post?</div>
        <div class="lumi-set-row"><span>Main Characters</span><input type="checkbox" id="pt-main" ${pt.mainChars?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>NPCs (AI-named)</span><input type="checkbox" id="pt-npc" ${pt.npcs?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>Citizens (public)</span><input type="checkbox" id="pt-cit" ${pt.citizens?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>News Board</span><input type="checkbox" id="pt-news" ${pt.news?'checked':''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Data</div>
      <div style="display:flex;gap:7px;">
        <button id="btn-rst" class="lumi-sm-btn" style="flex:1;justify-content:center;">${I.refresh} Reset FAB</button>
        <button id="btn-clr-all" class="lumi-sm-btn lumi-danger-btn" style="flex:1;justify-content:center;">${I.trash} Clear All</button>
      </div>
    </div>
    </div>`);

    // Populate model dropdown from saved model
    const populateModels = (models, selected) => {
        const sel = $('#api-model-sel'); sel.empty();
        if (!models.length) { sel.append(`<option value="">-- fetch models first --</option>`); return; }
        models.forEach(m => sel.append(`<option value="${esc(m)}"${m===selected?' selected':''}>${esc(m)}</option>`));
        if (selected && !models.includes(selected)) sel.prepend(`<option value="${esc(selected)}" selected>${esc(selected)} (saved)</option>`);
    };
    populateModels(api.model ? [api.model] : [], api.model || '');

    // ── Appearance ──
    $('.lumi-mode-btn').on('click', function() {
        EXT._internal.darkMode = $(this).data('dm') === true || $(this).data('dm') === 'true';
        save(); applyTheme(); renderSettings();
    });
    $('.lumi-palette-btn').on('click', function() {
        EXT._internal.theme = $(this).data('pal');
        save(); applyTheme(); renderSettings();
    });

    // ── API ──
    $('#api-en').on('change', function() { EXT.api.enabled = $(this).prop('checked'); save(); $('#api-cfg').toggle(EXT.api.enabled); });
    $('#api-provider').on('change', function() { EXT.api.provider = $(this).val(); save(); $('#base-url-row').toggle(EXT.api.provider !== 'google'); });
    $('#api-url').on('change', function() { EXT.api.baseUrl = $(this).val().trim(); save(); });
    $('#api-key').on('change', function() { EXT.api.apiKey = $(this).val().trim(); save(); $('#api-dot').attr('class', 'api-dot ' + (EXT.api.apiKey ? 'dot-ok' : 'dot-idle')); });

    $('#btn-fetch-models').on('click', async function() {
        const $btn = $(this);
        // Save current key/url/provider first
        EXT.api.baseUrl  = $('#api-url').val().trim();
        EXT.api.apiKey   = $('#api-key').val().trim();
        EXT.api.provider = $('#api-provider').val();
        save();
        $btn.html(`<span class="lumi-spin lumi-spin-c"></span>`).prop('disabled', true);
        $('#model-status').text('Fetching models...');
        try {
            const models = await fetchAvailableModels();
            if (!EXT.api.model || !models.includes(EXT.api.model)) { EXT.api.model = models[0] || ''; save(); }
            populateModels(models, EXT.api.model);
            $('#model-status').html(`<span style="color:#34D399;">✓ Found ${models.length} models</span>`);
            $('#api-dot').attr('class', 'api-dot dot-ok');
        } catch (e) {
            $('#model-status').html(`<span style="color:#FF4757;">✗ ${esc(e.message.slice(0, 70))}</span>`);
            $('#api-dot').attr('class', 'api-dot dot-err');
        }
        $btn.html(I.refresh).prop('disabled', false);
    });

    $('#api-model-sel').on('change', function() { EXT.api.model = $(this).val(); save(); });

    $('#btn-test-api').on('click', async function() {
        const $btn = $(this);
        EXT.api.baseUrl  = $('#api-url').val().trim();
        EXT.api.apiKey   = $('#api-key').val().trim();
        EXT.api.provider = $('#api-provider').val();
        EXT.api.model    = $('#api-model-sel').val();
        save();
        $btn.html(`<span class="lumi-spin lumi-spin-c"></span> Testing...`).prop('disabled', true);
        try {
            const res = await callCustomAPI('Reply with only the word OK.', 'Reply with exactly one word: OK');
            if (res && res.trim().length > 0) {
                $('#api-test-res').html(`<span style="color:#34D399;">✓ Connected: "${esc(res.trim().slice(0,40))}"</span>`);
                $('#api-dot').attr('class', 'api-dot dot-ok');
            } else {
                $('#api-test-res').html(`<span style="color:#FF4757;">✗ Empty response</span>`);
                $('#api-dot').attr('class', 'api-dot dot-err');
            }
        } catch (e) {
            $('#api-test-res').html(`<span style="color:#FF4757;">✗ ${esc(e.message.slice(0, 90))}</span>`);
            $('#api-dot').attr('class', 'api-dot dot-err');
        }
        $btn.html(`${I.key} Test Connection`).prop('disabled', false);
    });

    // ── General ──
    $('#set-en').on('change', function() { EXT.isEnabled = $(this).prop('checked'); save(); });
    $('#set-wm').on('change', function() { EXT.diary.worldMode = $(this).val(); save(); });

    // ── Diary auto-gen ──
    $('#ag-en').on('change',     function() { EXT.diary.autoGen.enabled     = $(this).prop('checked'); save(); });
    $('#ag-tr').on('change',     function() { EXT.diary.autoGen.triggerType = $(this).val(); save(); renderSettings(); });
    $('#ag-int').on('change',    function() { EXT.diary.autoGen.turnInterval  = parseInt($(this).val()) || 20; save(); });
    $('#ag-chance').on('change', function() { EXT.diary.autoGen.randomChance  = (parseInt($(this).val()) || 10) / 100; save(); });
    $('#ag-kw').on('change',     function() { EXT.diary.autoGen.emotionKeywords = $(this).val().split(',').map(k => k.trim()).filter(Boolean); save(); });

    // ── Forum ──
    $('#forum-en').on('change',     function() { EXT.forum.enabled       = $(this).prop('checked'); save(); });
    $('#forum-react').on('change',  function() { EXT.forum.autoReactOnRP = $(this).prop('checked'); save(); });
    $('#forum-ag-en').on('change',  function() { EXT.forum.autoGen.enabled = $(this).prop('checked'); save(); });
    $('#forum-tr').on('change',     function() { EXT.forum.autoGen.triggerType = $(this).val(); save(); renderSettings(); });
    $('#forum-int').on('change',    function() { EXT.forum.autoGen.turnInterval  = parseInt($(this).val()) || 8;  save(); });
    $('#forum-time').on('change',   function() { EXT.forum.autoGen.timeInterval  = parseInt($(this).val()) || 5;  save(); });
    $('#forum-chance').on('change', function() { EXT.forum.autoGen.randomChance  = (parseInt($(this).val()) || 15) / 100; save(); });
    $('#pt-main').on('change',      function() { EXT.forum.posterTypes.mainChars = $(this).prop('checked'); save(); });
    $('#pt-npc').on('change',       function() { EXT.forum.posterTypes.npcs      = $(this).prop('checked'); save(); });
    $('#pt-cit').on('change',       function() { EXT.forum.posterTypes.citizens  = $(this).prop('checked'); save(); });
    $('#pt-news').on('change',      function() { EXT.forum.posterTypes.news      = $(this).prop('checked'); save(); });

    // ── Data ──
    $('#btn-rst').on('click', () => { EXT._internal.fabPos = null; save(); $('#lumi-fab').remove(); spawnFAB(); toast('✓ FAB reset'); });
    $('#btn-clr-all').on('click', () => { if (confirm('Clear ALL memories and forum posts?')) { EXT.memories = []; EXT.forumPosts = {}; EXT.forumNotify = {}; EXT._internal.nameRegistry = {}; save(); updateFabDot(); toast('✓ Cleared'); } });
}

// ═══════════════════════════════════════════════════════════
// ST SETTINGS PANEL (sidebar)
// ═══════════════════════════════════════════════════════════
function createSettingsPanel() {
    if ($('#lumi-panel').length) return;
    $('#extensions_settings').append(`
      <div id="lumi-panel" class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
          <b style="font-family:var(--ff);color:var(--lp);font-weight:700;">LumiPulse</b>
          <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content" style="display:none;padding:10px;font-family:var(--ff);font-size:13px;color:var(--lsub);line-height:1.6;">
          A social diary &amp; forum extension for your roleplay world. Automatically documents story events as diary entries and generates a living community forum with AI characters posting, replying, and reacting — all tied to your current bot.
        </div>
      </div>`);
}

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
const exportText = (c, f) => { const b=new Blob([c],{type:'text/markdown'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=f;a.click();URL.revokeObjectURL(u);toast('✓ Exported'); };
const exportJSON = (d, f) => { const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=f;a.click();URL.revokeObjectURL(u);toast('✓ Exported'); };

