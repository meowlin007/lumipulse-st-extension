"use strict";
// ════════════════════════════════════════════════════════════
// LUMIPULSE v6  —  SillyTavern Extension
// ════════════════════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    forumPosts: {},
    _internal: {
        fabPos: null, theme: 'sakura', colorMode: 'dark',
        nameRegistry: {},
        filterChar: '', filterDate: '', filterLoc: '',
        forumMsgCounter: 0, lastForumGenTime: 0,
        diaryMsgCounter: 0,
        forumUnread: false
    },
    api: {
        enabled: false,
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4o-mini',
        maxTokens: 900
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
        autoGen: {
            enabled: true, triggerType: 'turn_count',
            turnInterval: 8, timeInterval: 5, randomChance: 0.15
        },
        storage: { max: 400 },
        posterTypes: { mainChars: true, npcs: true, citizens: true, news: true }
    }
};

let EXT = {};

const ASSETS = {
    fab:      "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png",
    diary:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png",
    forum:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png",
    settings: "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png"
};

const I = {
    close:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    back:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
    plus:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    heart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartF:  `<svg viewBox="0 0 24 24" fill="var(--lp)" stroke="var(--lp)" stroke-width="2" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    send:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    spark:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`,
    book:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    globe:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    link:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    pin:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`,
    trash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    tag:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    calendar:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    mappin:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    lock:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    mood:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    scroll:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    image:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    music:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    sun:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    dot:     `<svg viewBox="0 0 8 8" width="8" height="8"><circle cx="4" cy="4" r="4" fill="var(--lp)"/></svg>`,
    api:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    news:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>`,
    key:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`
};

// ════════════════════════════════════════════════════════════
// THEME SYSTEM — Accent + Light/Dark
// ════════════════════════════════════════════════════════════
const THEME_ACCENTS = {
    sakura: {
        lp:'#FF6B9D', ls:'#FF3D7F',
        la:'rgba(255,107,157,0.12)',
        ltag:'rgba(255,107,157,0.15)', ltagtext:'#FF9EC4',
        lglow:'0 0 20px rgba(255,107,157,0.25)',
        lgrad:'linear-gradient(135deg,#FF6B9D,#FF3D7F)',
        label:'🌸 Sakura'
    },
    sky: {
        lp:'#38BDF8', ls:'#0EA5E9',
        la:'rgba(56,189,248,0.12)',
        ltag:'rgba(56,189,248,0.15)', ltagtext:'#7DD3FC',
        lglow:'0 0 20px rgba(56,189,248,0.25)',
        lgrad:'linear-gradient(135deg,#38BDF8,#0EA5E9)',
        label:'🩵 Sky Blue'
    },
    mint: {
        lp:'#34D399', ls:'#10B981',
        la:'rgba(52,211,153,0.12)',
        ltag:'rgba(52,211,153,0.15)', ltagtext:'#6EE7B7',
        lglow:'0 0 20px rgba(52,211,153,0.25)',
        lgrad:'linear-gradient(135deg,#34D399,#10B981)',
        label:'🌿 Mint'
    },
    lavender: {
        lp:'#A78BFA', ls:'#7C3AED',
        la:'rgba(167,139,250,0.12)',
        ltag:'rgba(167,139,250,0.15)', ltagtext:'#C4B5FD',
        lglow:'0 0 20px rgba(167,139,250,0.25)',
        lgrad:'linear-gradient(135deg,#A78BFA,#7C3AED)',
        label:'💜 Lavender'
    }
};

function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '255,107,157';
}

function getThemeVars(colorMode, accentKey) {
    const accent = THEME_ACCENTS[accentKey] || THEME_ACCENTS.sakura;
    const borderAlpha = `rgba(${hexToRgb(accent.lp)},0.18)`;
    if (colorMode === 'light') {
        return {
            bg:'#F8F8FC', card:'#FFFFFF', border: borderAlpha,
            text:'#1E1B2E', sub:'#7A7090', inputBg:'#EFEFF7',
            navBg:'#FFFFFF', shadow:'0 2px 16px rgba(0,0,0,0.09)',
            postBg:'#FFFFFF', replyBg:'#F4F4FB', composeBg:'#EFEFF7',
            ...accent
        };
    }
    return {
        bg:'#0D0A12', card:'#16101F', border: borderAlpha,
        text:'#F0E6FF', sub:'#9B8BB0', inputBg:'#0D0A12',
        navBg:'#16101F', shadow:'0 8px 32px rgba(0,0,0,0.5)',
        postBg:'#1A1128', replyBg:'#130D1C', composeBg:'#130D1C',
        ...accent
    };
}

function applyColorMode(colorMode, accentKey) {
    accentKey = accentKey || (EXT._internal && EXT._internal.theme) || 'sakura';
    colorMode = colorMode || (EXT._internal && EXT._internal.colorMode) || 'dark';
    const v = getThemeVars(colorMode, accentKey);
    const r = document.documentElement;
    r.style.setProperty('--lbg',      v.bg);
    r.style.setProperty('--lcard',    v.card);
    r.style.setProperty('--lborder',  v.border);
    r.style.setProperty('--ltext',    v.text);
    r.style.setProperty('--lsub',     v.sub);
    r.style.setProperty('--linput',   v.inputBg);
    r.style.setProperty('--lnav',     v.navBg);
    r.style.setProperty('--lshadow',  v.shadow);
    r.style.setProperty('--lpost',    v.postBg);
    r.style.setProperty('--lreply',   v.replyBg);
    r.style.setProperty('--lcompose', v.composeBg);
    r.style.setProperty('--lp',       v.lp);
    r.style.setProperty('--ls',       v.ls);
    r.style.setProperty('--la',       v.la);
    r.style.setProperty('--ldanger',  '#FF4757');
    r.style.setProperty('--lgrad',    v.lgrad);
    r.style.setProperty('--ltag',     v.ltag);
    r.style.setProperty('--ltagtext', v.ltagtext);
    r.style.setProperty('--lglow',    v.lglow);
    r.style.setProperty('--lfont',    "'Mitr','Noto Sans Thai',sans-serif");
}

// ════════════════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════════════════
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
        if (!s.api)    s.api    = JSON.parse(JSON.stringify(defaultSettings.api));
        if (!s._internal) s._internal = {};
        if (Array.isArray(s.forumPosts)) s.forumPosts = {};
        if (!s.forumPosts) s.forumPosts = {};
        if (!s.forum.posterTypes) s.forum.posterTypes = defaultSettings.forum.posterTypes;
        if (!s._internal.colorMode) s._internal.colorMode = 'dark';
        if (!s._internal.theme) s._internal.theme = 'sakura';
        ['forumMsgCounter','lastForumGenTime','diaryMsgCounter','forumUnread'].forEach(k => {
            if (typeof s._internal[k] === 'undefined') s._internal[k] = k === 'forumUnread' ? false : 0;
        });
    }
    ctx.saveSettingsDebounced();
    EXT = ES[extensionName];
    applyColorMode(EXT._internal.colorMode || 'dark', EXT._internal.theme || 'sakura');
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

// ── Helpers ────────────────────────────────────────────────
const botId    = () => SillyTavern.getContext().characterId || '__default__';
const botPosts = () => { if (!EXT.forumPosts[botId()]) EXT.forumPosts[botId()] = []; return EXT.forumPosts[botId()]; };
const savePosts= (arr) => { EXT.forumPosts[botId()] = arr.slice(-(EXT.forum.storage.max||400)); SillyTavern.getContext().saveSettingsDebounced(); };
const save     = () => SillyTavern.getContext().saveSettingsDebounced();
const esc      = (s) => { if (typeof s !== 'string') return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); };
const colorOf  = (str) => { const c=['#FF6B9D','#A78BFA','#34D399','#38BDF8','#FB923C','#E879F9','#FBBF24','#60A5FA']; let h=0; for(let i=0;i<(str||'').length;i++) h=str.charCodeAt(i)+((h<<5)-h); return c[Math.abs(h)%c.length]; };
const timeAgo  = (d) => { const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60)return 'เมื่อกี้'; if(s<3600)return Math.floor(s/60)+'น.'; if(s<86400)return Math.floor(s/3600)+'ชม.'; return Math.floor(s/86400)+'วัน'; };
const toast    = (msg, type='ok') => { $('.lumi-toast').remove(); const el=$(`<div class="lumi-toast lumi-toast-${type}">${msg}</div>`); $('body').append(el); setTimeout(()=>el.fadeOut(300,()=>el.remove()),2500); };

function simScore(a,b){
    a=a.toLowerCase().trim();b=b.toLowerCase().trim();
    if(!a.length||!b.length)return 0;
    const dp=Array(a.length+1).fill(null).map((_,i)=>Array(b.length+1).fill(0).map((_,j)=>i||j));
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
        dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
    return ((Math.max(a.length,b.length)-dp[a.length][b.length])/Math.max(a.length,b.length))*100;
}

function extractJSON(raw, type='array') {
    if (!raw || typeof raw !== 'string') return null;
    let s = raw
        .replace(/<think>[\s\S]*?<\/think>/gi,'')
        .replace(/```json[\s\S]*?```/g, m=>m.replace(/```json/,'').replace(/```/,''))
        .replace(/```[\s\S]*?```/g, m=>m.replace(/```/g,''))
        .trim();
    const opener=type==='array'?'[':'{', closer=type==='array'?']':'}';
    const start=s.indexOf(opener); if(start===-1)return null;
    let depth=0,end=-1;
    for(let i=start;i<s.length;i++){if(s[i]===opener)depth++;else if(s[i]===closer){depth--;if(depth===0){end=i;break;}}}
    if(end===-1)return null;
    try{return JSON.parse(s.slice(start,end+1));}catch(e){return null;}
}

// ════════════════════════════════════════════════════════════
// CUSTOM API LAYER
// ════════════════════════════════════════════════════════════
async function callAI(prompt, systemPrompt='') {
    const ctx = SillyTavern.getContext();
    if (EXT.api.enabled && EXT.api.apiKey) {
        try { return await callCustomAPI(prompt, systemPrompt); }
        catch(e) { console.warn('[LumiPulse] Custom API failed, fallback to ST:', e.message); }
    }
    const full = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    let res;
    if (typeof ctx.generateQuietPrompt==='function') res = await ctx.generateQuietPrompt(full, false, false);
    else if (typeof ctx.generateRaw==='function') res = await ctx.generateRaw(full, true);
    return res || '';
}

async function callCustomAPI(prompt, systemPrompt) {
    const cfg = EXT.api;
    let url, headers, body;
    if (cfg.provider === 'anthropic') {
        url = (cfg.baseUrl||'https://api.anthropic.com') + '/v1/messages';
        headers = { 'Content-Type':'application/json','x-api-key':cfg.apiKey,'anthropic-version':'2023-06-01' };
        body = JSON.stringify({ model:cfg.model||'claude-3-haiku-20240307', max_tokens:cfg.maxTokens||900, system:systemPrompt||'You are a helpful assistant.', messages:[{role:'user',content:prompt}] });
    } else if (cfg.provider === 'google') {
        const model = cfg.model || 'gemini-1.5-flash';
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cfg.apiKey}`;
        headers = { 'Content-Type':'application/json' };
        const parts = [];
        if (systemPrompt) parts.push({ text: systemPrompt + '\n\n' });
        parts.push({ text: prompt });
        body = JSON.stringify({ contents:[{ parts }], generationConfig:{ maxOutputTokens:cfg.maxTokens||900 } });
    } else {
        url = (cfg.baseUrl||'https://api.openai.com/v1') + '/chat/completions';
        headers = { 'Content-Type':'application/json','Authorization':`Bearer ${cfg.apiKey}` };
        const msgs = [];
        if (systemPrompt) msgs.push({role:'system',content:systemPrompt});
        msgs.push({role:'user',content:prompt});
        body = JSON.stringify({ model:cfg.model||'gpt-4o-mini', max_tokens:cfg.maxTokens||900, messages:msgs });
    }
    const resp = await fetch(url, { method:'POST', headers, body });
    if (!resp.ok) { const e=await resp.text(); throw new Error(`API ${resp.status}: ${e.slice(0,120)}`); }
    const data = await resp.json();
    if (cfg.provider==='anthropic') return data.content?.[0]?.text||'';
    if (cfg.provider==='google') return data.candidates?.[0]?.content?.parts?.[0]?.text||'';
    return data.choices?.[0]?.message?.content||'';
}

async function fetchAvailableModels() {
    const cfg = EXT.api;
    if (!cfg.apiKey) throw new Error('No API key');
    if (cfg.provider === 'google') {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cfg.apiKey}`);
        if (!resp.ok) throw new Error(`${resp.status}`);
        const data = await resp.json();
        return (data.models||[]).filter(m=>m.supportedGenerationMethods?.includes('generateContent')).map(m=>m.name.replace('models/',''));
    }
    if (cfg.provider === 'anthropic') {
        return ['claude-3-5-sonnet-20241022','claude-3-5-haiku-20241022','claude-3-haiku-20240307','claude-3-opus-20240229'];
    }
    const resp = await fetch((cfg.baseUrl||'https://api.openai.com/v1')+'/models', { headers:{'Authorization':`Bearer ${cfg.apiKey}`} });
    if (!resp.ok) throw new Error(`${resp.status}`);
    const data = await resp.json();
    return (data.data||[]).map(m=>m.id).filter(id=>id.includes('gpt')||id.includes('gemini')||id.includes('claude')||id.includes('llama')||id.includes('mistral')||id.includes('qwen')).sort();
}

// ════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const el = document.createElement('style');
    el.id = 'lumi-styles';
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500;600&family=Noto+Sans+Thai:wght@300;400;500;600&display=swap');

:root{
  --lp:#FF6B9D;--ls:#FF3D7F;--la:rgba(255,107,157,0.12);
  --lbg:#0D0A12;--lcard:#16101F;--lborder:rgba(255,107,157,0.18);
  --ltext:#F0E6FF;--lsub:#9B8BB0;--ldanger:#FF4757;--linput:#0D0A12;
  --lnav:#16101F;--lgrad:linear-gradient(135deg,#FF6B9D,#FF3D7F);
  --ltag:rgba(255,107,157,0.15);--ltagtext:#FF9EC4;
  --lglow:0 0 20px rgba(255,107,157,0.25);
  --lshadow:0 8px 32px rgba(0,0,0,0.5);
  --lpost:#1A1128;--lreply:#130D1C;--lcompose:#130D1C;
  --lfont:'Mitr','Noto Sans Thai',sans-serif;
}

@keyframes lumiIn{from{opacity:0;transform:scale(.95) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes newPost{0%{opacity:0;transform:translateX(-12px)}100%{opacity:1;transform:translateX(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.45)}70%{transform:scale(.9)}100%{transform:scale(1)}}
@keyframes dotPulse{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes badgePop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}

/* ── FAB ── */
#lumi-fab{
  position:fixed !important;
  z-index:99999 !important;
  width:42px;height:42px;border-radius:50%;
  background:var(--lcard) url("${ASSETS.fab}") no-repeat center/22px;
  border:1.5px solid var(--lborder);
  box-shadow:var(--lglow),0 6px 20px rgba(0,0,0,.45);
  cursor:grab;touch-action:none;user-select:none;
  transition:box-shadow .25s,transform .15s;
  display:flex !important;
  visibility:visible !important;
  opacity:1 !important;
  pointer-events:auto !important;
}
#lumi-fab:hover{box-shadow:var(--lglow),0 0 0 5px var(--la),0 6px 20px rgba(0,0,0,.45);}
#lumi-fab:active{transform:scale(.88) !important;cursor:grabbing;}
.lumi-fab-badge{
  position:absolute;top:-3px;right:-3px;
  width:10px;height:10px;border-radius:50%;
  background:#FF4757;border:2px solid var(--lbg);
  display:none;animation:badgePop .3s ease;
}
.lumi-fab-badge.show{display:block;}

/* ── Menu ── */
.lumi-menu{
  position:fixed;z-index:99998;display:none;
  background:var(--lcard);backdrop-filter:blur(20px);
  border-radius:18px;padding:12px;
  border:1px solid var(--lborder);
  box-shadow:0 14px 40px rgba(0,0,0,.55),var(--lglow);
  min-width:170px;font-family:var(--lfont);
}
.lumi-menu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.lumi-menu-item{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  cursor:pointer;padding:10px 5px;border-radius:12px;
  border:1px solid transparent;transition:.18s;position:relative;
}
.lumi-menu-item:hover{background:var(--la);border-color:var(--lborder);}
.lumi-menu-item img{width:30px;height:30px;object-fit:contain;}
.lumi-menu-item span{font-size:9px;color:var(--lsub);font-weight:500;}
.lumi-menu-notif{
  position:absolute;top:6px;right:6px;
  width:8px;height:8px;border-radius:50%;
  background:#FF4757;border:1.5px solid var(--lcard);
  display:none;
}
.lumi-menu-notif.show{display:block;}

/* ── Overlay & Modal ── */
.lumi-overlay{
  position:fixed;top:0;left:0;width:100vw;height:100dvh;
  background:rgba(0,0,0,.65);backdrop-filter:blur(8px);
  z-index:100000;display:none;align-items:center;justify-content:center;
}
.lumi-modal{
  width:94%;max-width:480px;height:91dvh;
  background:var(--lbg);border-radius:22px;
  border:1px solid var(--lborder);
  box-shadow:0 20px 70px rgba(0,0,0,.65),var(--lglow);
  display:flex;flex-direction:column;overflow:hidden;
  font-family:var(--lfont);animation:lumiIn .26s cubic-bezier(.34,1.5,.64,1);
  color:var(--ltext);
}
.lumi-head{
  padding:11px 14px;display:flex;justify-content:space-between;align-items:center;
  border-bottom:1px solid var(--lborder);background:var(--lnav);
  flex-shrink:0;gap:10px;
}
.lumi-head-title{font-size:13px;color:var(--lp);font-weight:600;flex:1;text-align:center;letter-spacing:.2px;}
.lumi-icon-btn{
  width:28px;height:28px;border-radius:50%;
  background:var(--la);border:1px solid var(--lborder);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--lsub);transition:.15s;flex-shrink:0;
}
.lumi-icon-btn:hover{background:var(--lborder);color:var(--ltext);}
.lumi-body{flex:1;overflow-y:auto;background:var(--lbg);color:var(--ltext);scrollbar-width:thin;scrollbar-color:var(--lborder) transparent;}
.lumi-body::-webkit-scrollbar{width:3px;}
.lumi-body::-webkit-scrollbar-thumb{background:var(--lborder);border-radius:2px;}

/* ── Nav ── */
.lumi-nav{
  display:flex;gap:4px;padding:9px 10px 0;
  border-bottom:1px solid var(--lborder);background:var(--lnav);flex-shrink:0;
}
.lumi-tab{
  flex:1;text-align:center;padding:8px 3px 9px;
  border-radius:8px 8px 0 0;color:var(--lsub);
  font-size:10px;font-weight:500;cursor:pointer;transition:.15s;
  display:flex;align-items:center;justify-content:center;gap:4px;
  position:relative;
}
.lumi-tab::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:transparent;transition:.2s;border-radius:2px 2px 0 0;}
.lumi-tab.active{color:var(--lp);}
.lumi-tab.active::after{background:var(--lp);}
.lumi-tab:hover:not(.active){color:var(--ltext);background:var(--la);}

/* ── Blocks ── */
.lumi-section{padding:10px 12px;}
.lumi-hero{
  background:var(--lgrad);padding:16px 14px 12px;
  position:relative;overflow:hidden;flex-shrink:0;
}
.lumi-hero::before{content:'';position:absolute;top:-35px;right:-25px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.07);}
.lumi-hero::after{content:'';position:absolute;bottom:-20px;left:-12px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.04);}
.lumi-hero-eyebrow{font-size:9px;color:rgba(255,255,255,.75);letter-spacing:.7px;text-transform:uppercase;margin-bottom:2px;display:flex;align-items:center;gap:4px;}
.lumi-hero-title{font-size:20px;font-weight:700;color:#fff;letter-spacing:-.3px;position:relative;}
.lumi-hero-sub{font-size:10px;color:rgba(255,255,255,.7);margin-top:3px;position:relative;}
.lumi-stats{display:flex;gap:7px;padding:9px 12px;}
.lumi-stat{flex:1;text-align:center;background:var(--lcard);border:1px solid var(--lborder);border-radius:12px;padding:9px 4px;}
.lumi-stat b{display:block;font-size:19px;color:var(--lp);font-weight:700;line-height:1;}
.lumi-stat span{font-size:9px;color:var(--lsub);text-transform:uppercase;letter-spacing:.4px;margin-top:2px;display:block;}
.lumi-form-card{background:var(--lcard);border:1px solid var(--lborder);border-radius:14px;padding:12px;margin-bottom:10px;}
.lumi-form-title{font-size:9px;font-weight:700;color:var(--lsub);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;}
.lumi-label{font-size:9px;color:var(--lsub);display:block;margin-bottom:4px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;}
.lumi-input{
  width:100%;background:var(--linput);border:1px solid var(--lborder);border-radius:9px;
  padding:8px 10px;color:var(--ltext);font-family:var(--lfont);font-size:12px;
  outline:none;box-sizing:border-box;transition:.15s;
}
.lumi-input:focus{border-color:var(--lp);box-shadow:0 0 0 2px var(--la);}
.lumi-textarea{min-height:60px;resize:none;max-height:140px;}
.lumi-set-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--lborder);font-size:12px;color:var(--lsub);}
.lumi-set-row:last-child{border-bottom:none;}
.lumi-set-row select,.lumi-set-row input[type=number],.lumi-set-row input[type=text]{
  background:var(--linput);border:1px solid var(--lborder);border-radius:7px;
  padding:4px 7px;color:var(--ltext);font-family:var(--lfont);outline:none;font-size:11px;
}
.lumi-select{
  background:var(--linput);border:1px solid var(--lborder);border-radius:9px;
  padding:7px 9px;color:var(--ltext);font-family:var(--lfont);font-size:11px;outline:none;
}
.lumi-btn{
  background:var(--lgrad);color:#fff;border:none;
  padding:9px 14px;border-radius:18px;font-family:var(--lfont);font-weight:600;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
  font-size:11px;width:100%;transition:.18s;box-shadow:0 3px 12px rgba(0,0,0,.25);
}
.lumi-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(0,0,0,.35),var(--lglow);}
.lumi-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.lumi-sm-btn{
  background:var(--la);color:var(--lp);border:1px solid var(--lborder);
  padding:6px 11px;border-radius:12px;font-family:var(--lfont);font-weight:600;
  cursor:pointer;font-size:10px;display:flex;align-items:center;gap:4px;
  transition:.14s;white-space:nowrap;
}
.lumi-sm-btn:hover{background:var(--lborder);}
.lumi-sm-btn:disabled{opacity:.5;cursor:not-allowed;}
.lumi-danger-btn{background:rgba(255,71,87,.12);color:var(--ldanger);border-color:rgba(255,71,87,.3);}
.lumi-danger-btn:hover{background:rgba(255,71,87,.2);}
.lumi-badge{
  font-size:9px;padding:2px 7px;border-radius:5px;
  background:var(--ltag);color:var(--ltagtext);
  display:inline-flex;align-items:center;gap:2px;font-weight:500;
}
.lumi-empty{text-align:center;padding:40px 16px;}
.lumi-empty-icon{font-size:38px;margin-bottom:10px;opacity:.3;}
.lumi-empty-text{font-size:12px;color:var(--lsub);line-height:1.6;}

/* ── Toast ── */
.lumi-toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  padding:9px 18px;border-radius:18px;z-index:999999;
  font-family:var(--lfont);font-size:11px;animation:lumiIn .22s;
  pointer-events:none;white-space:nowrap;
}
.lumi-toast-ok{background:rgba(20,15,30,.9);border:1px solid var(--lborder);color:var(--ltext);backdrop-filter:blur(10px);}
.lumi-toast-err{background:rgba(255,71,87,.15);border:1px solid rgba(255,71,87,.4);color:#FF8080;}

/* ── Spinner ── */
.lumi-spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.2);border-radius:50%;border-top-color:#fff;animation:spin .65s linear infinite;}
.lumi-spin-p{border-color:var(--la);border-top-color:var(--lp);}

/* ── Diary ── */
.lumi-diary-pad{padding:9px 12px 14px;}
.lumi-timeline-sep{display:flex;align-items:center;gap:7px;font-size:9px;color:var(--lsub);font-weight:600;letter-spacing:.7px;text-transform:uppercase;padding:9px 0 5px;}
.lumi-timeline-sep::after{content:'';flex:1;height:1px;background:var(--lborder);}
.lumi-card{background:var(--lcard);border:1px solid var(--lborder);border-radius:14px;padding:11px;margin-bottom:8px;position:relative;transition:box-shadow .18s,transform .18s;animation:fadeUp .28s ease;}
.lumi-card:hover{box-shadow:var(--lglow);transform:translateY(-1px);}
.lumi-card-header{display:flex;align-items:center;gap:8px;margin-bottom:7px;}
.lumi-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,.35);}
.lumi-avatar-sm{width:22px;height:22px;font-size:9px;}
.lumi-char-name{font-size:12px;font-weight:600;color:var(--ltext);flex:1;}
.lumi-card-meta{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;}
.lumi-card-body{font-size:12px;color:var(--ltext);line-height:1.65;white-space:pre-wrap;margin:0 0 8px;}
.lumi-card-footer{display:flex;gap:4px;justify-content:flex-end;padding-top:7px;border-top:1px solid var(--lborder);}
.lumi-act{background:none;border:1px solid transparent;border-radius:7px;cursor:pointer;color:var(--lsub);transition:.14s;padding:3px 8px;font-size:10px;display:flex;align-items:center;gap:3px;font-family:var(--lfont);}
.lumi-act:hover{background:var(--la);border-color:var(--lborder);color:var(--lp);}
.lumi-act.act-on{color:var(--lp);background:var(--la);}
.lumi-act.act-danger:hover{background:rgba(255,71,87,.12);color:var(--ldanger);}

/* ── Theme picker ── */
.lumi-theme-card{
  border:2px solid var(--lborder);border-radius:12px;padding:10px;
  cursor:pointer;transition:.18s;display:flex;align-items:center;gap:8px;
  background:var(--lbg);
}
.lumi-theme-card:hover{background:var(--la);}
.lumi-theme-card.selected{background:var(--la);}
.lumi-theme-dot{width:20px;height:20px;border-radius:50%;flex-shrink:0;}
.lumi-theme-label{font-size:11px;font-weight:600;color:var(--lsub);}
.lumi-theme-card.selected .lumi-theme-label{color:var(--lp);}

/* ── Color mode toggle ── */
.lumi-cm-toggle{display:flex;align-items:center;gap:7px;}
.lumi-cm-track{width:42px;height:22px;border-radius:11px;background:var(--la);border:1px solid var(--lborder);position:relative;cursor:pointer;transition:.25s;}
.lumi-cm-track.dark-mode{background:rgba(100,80,140,.4);}
.lumi-cm-thumb{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--lp);transition:.25s;display:flex;align-items:center;justify-content:center;}
.lumi-cm-track.dark-mode .lumi-cm-thumb{left:22px;}

/* ── FORUM ── */
.lumi-forum-outer{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.lumi-forum-feed{padding:10px 12px 20px;overflow-y:auto;flex:1;}
.lumi-post{
  background:var(--lpost);border:1px solid var(--lborder);border-radius:16px;
  padding:12px;margin-bottom:9px;position:relative;overflow:hidden;
  animation:newPost .3s cubic-bezier(.34,1.2,.64,1);
}
.lumi-post::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--lborder),transparent);}
.lumi-post.post-news{border-color:rgba(251,146,60,.3);}
.lumi-post.post-news::before{background:linear-gradient(90deg,transparent,rgba(251,146,60,.5),transparent);}
.lumi-post-head{display:flex;align-items:flex-start;gap:9px;margin-bottom:9px;}
.lumi-post-author{font-size:12px;font-weight:600;color:var(--ltext);}
.lumi-post-meta{font-size:10px;color:var(--lsub);margin-top:1px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.lumi-type-badge{font-size:8px;padding:1px 5px;border-radius:4px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;}
.badge-news{background:rgba(251,146,60,.15);color:#FB923C;}
.badge-main{background:var(--la);color:var(--lp);}
.badge-npc{background:rgba(167,139,250,.12);color:#A78BFA;}
.badge-citizen{background:rgba(52,211,153,.1);color:#34D399;}
.lumi-post-title{font-size:13px;font-weight:700;color:var(--ltext);margin-bottom:4px;line-height:1.3;}
.lumi-post-body{font-size:12px;color:var(--ltext);line-height:1.65;margin-bottom:8px;white-space:pre-wrap;}
.lumi-post-tag{display:inline-flex;align-items:center;gap:2px;font-size:9px;padding:2px 7px;border-radius:4px;background:var(--ltag);color:var(--ltagtext);font-weight:600;margin-bottom:7px;}

/* Post special cards */
.lumi-song-card{background:linear-gradient(135deg,var(--la),rgba(139,92,246,.08));border:1px solid rgba(255,107,157,.25);border-radius:12px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;}
.lumi-song-disc{width:40px;height:40px;border-radius:50%;background:var(--lgrad);display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:spin 4s linear infinite;color:#fff;}
.lumi-song-info{flex:1;}
.lumi-song-title{font-size:12px;font-weight:600;color:var(--ltext);}
.lumi-song-sub{font-size:10px;color:var(--lsub);}
.lumi-img-card{border-radius:12px;overflow:hidden;margin-bottom:8px;background:var(--lcard);border:1px solid var(--lborder);}
.lumi-img-card img{width:100%;max-height:200px;object-fit:cover;display:block;}
.lumi-img-caption{padding:8px 10px;font-size:11px;color:var(--lsub);}

/* Actions */
.lumi-post-actions{display:flex;gap:5px;padding-top:9px;border-top:1px solid var(--lborder);}
.lumi-post-btn{
  flex:1;background:none;border:1px solid var(--lborder);border-radius:9px;
  padding:6px 6px;cursor:pointer;font-size:10px;font-family:var(--lfont);
  color:var(--lsub);transition:.14s;display:flex;align-items:center;justify-content:center;gap:4px;font-weight:500;
}
.lumi-post-btn:hover{background:var(--la);color:var(--lp);border-color:var(--lborder);}
.lumi-post-btn.liked{background:rgba(255,107,157,.12);color:var(--lp);border-color:rgba(255,107,157,.3);}
.lumi-post-btn.liked svg{animation:heartPop .35s ease;}

/* Threaded replies */
.lumi-replies-wrap{display:none;margin-top:9px;}
.lumi-reply-thread{padding-left:10px;border-left:2px solid var(--lborder);}
.lumi-reply{padding:7px 0;border-bottom:1px solid rgba(255,255,255,.03);}
.lumi-reply:last-of-type{border-bottom:none;}
.lumi-reply-head{display:flex;align-items:center;gap:6px;margin-bottom:3px;}
.lumi-reply-name{font-size:10px;font-weight:600;color:var(--ltext);}
.lumi-reply-time{font-size:9px;color:var(--lsub);margin-left:auto;}
.lumi-reply-body{font-size:11px;color:var(--ltext);line-height:1.6;padding-left:28px;}
.lumi-reply-l2{margin-left:10px;padding-left:8px;border-left:1.5px solid var(--la);}
.lumi-compose-reply{display:flex;gap:6px;margin-top:8px;padding-left:2px;align-items:flex-end;}
.lumi-reply-input{flex:1;background:var(--la);border:1px solid var(--lborder);border-radius:14px;padding:6px 11px;font-size:11px;font-family:var(--lfont);color:var(--ltext);outline:none;resize:none;min-height:30px;max-height:70px;transition:.14s;}
.lumi-reply-input:focus{border-color:var(--lp);}
.lumi-send-btn{width:30px;height:30px;border-radius:50%;background:var(--lgrad);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.18s;}
.lumi-send-btn:hover{box-shadow:var(--lglow);}

/* Compose */
.lumi-compose{background:var(--lcompose);border:1px solid var(--lborder);border-radius:16px;padding:11px;}
.lumi-compose-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.lumi-compose-footer{display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap;}
.lumi-mode-toggle{
  display:flex;background:var(--linput);border:1px solid var(--lborder);
  border-radius:10px;overflow:hidden;flex-shrink:0;
}
.lumi-mode-btn{padding:5px 9px;font-size:10px;font-family:var(--lfont);font-weight:500;color:var(--lsub);cursor:pointer;transition:.14s;border:none;background:none;}
.lumi-mode-btn.active{background:var(--lp);color:#fff;}

/* ── Settings ── */
.lumi-api-key-row{display:flex;gap:5px;align-items:center;}
.lumi-api-key-row .lumi-input{flex:1;font-size:11px;font-family:'Courier New',monospace;letter-spacing:.3px;}
.lumi-api-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.dot-ok{background:#34D399;box-shadow:0 0 5px rgba(52,211,153,.5);}
.dot-err{background:#FF4757;}
.dot-idle{background:var(--lsub);}
.lumi-model-select-wrap{margin-top:6px;}
.lumi-model-dropdown{width:100%;background:var(--linput);border:1px solid var(--lborder);border-radius:9px;padding:7px 10px;color:var(--ltext);font-family:var(--lfont);font-size:11px;outline:none;box-sizing:border-box;}

@media(max-width:768px){.lumi-modal{width:97%;height:96dvh;border-radius:16px;}}
`;
    document.head.appendChild(el);
}

// ════════════════════════════════════════════════════════════
// FAB
// ════════════════════════════════════════════════════════════
function updateForumBadge() {
    const show = EXT._internal.forumUnread;
    $('#lumi-fab-badge').toggleClass('show', show);
    $('#lm-forum-notif').toggleClass('show', show);
}

function spawnFAB() {
    $('#lumi-fab,.lumi-menu').remove();
    if (!document.body) { setTimeout(spawnFAB, 500); return; }

    const fab = document.createElement('div');
    fab.id = 'lumi-fab';
    fab.innerHTML = `<div class="lumi-fab-badge" id="lumi-fab-badge"></div>`;

    const sz = EXT._internal.fabSize || 42;
    fab.style.cssText = `
        position: fixed !important;
        z-index: 99999 !important;
        width: ${sz}px !important;
        height: ${sz}px !important;
        border-radius: 50% !important;
        background: var(--lcard) url("${ASSETS.fab}") no-repeat center center !important;
        background-size: ${Math.round(sz*0.52)}px !important;
        border: 1.5px solid var(--lborder) !important;
        box-shadow: var(--lglow), 0 6px 20px rgba(0,0,0,.45) !important;
        cursor: grab !important;
        touch-action: none !important;
        user-select: none !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
    `;

    const pos = EXT._internal.fabPos;
    if (pos) {
        fab.style.top    = pos.top    || 'auto';
        fab.style.left   = pos.left   || 'auto';
        fab.style.right  = pos.right  || 'auto';
        fab.style.bottom = pos.bottom || 'auto';
        fab.style.transform = pos.transform || 'none';
    } else {
        fab.style.top       = '50%';
        fab.style.right     = '20px';
        fab.style.transform = 'translateY(-50%)';
    }

    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    menu.innerHTML = `<div class="lumi-menu-grid">
      <div class="lumi-menu-item" id="lm-diary"><img src="${ASSETS.diary}"><span>Diary</span></div>
      <div class="lumi-menu-item" id="lm-forum"><img src="${ASSETS.forum}"><span>Forum</span><div class="lumi-menu-notif" id="lm-forum-notif"></div></div>
      <div class="lumi-menu-item" id="lm-set"><img src="${ASSETS.settings}"><span>Settings</span></div>
    </div>`;
    document.body.appendChild(menu);

    let isDrag=false, sx, sy, il, it, dist=0;
    const TH = 10;
    const startDrag = (x,y) => {
        isDrag=false; dist=0; sx=x; sy=y;
        const r=fab.getBoundingClientRect();
        il=r.left; it=r.top;
        fab.style.transform='none';
    };
    const moveDrag = (x,y) => {
        const dx=x-sx, dy=y-sy;
        dist=Math.hypot(dx,dy);
        if(dist>TH) isDrag=true;
        if(isDrag){
            fab.style.left=(il+dx)+'px';
            fab.style.top=(it+dy)+'px';
            fab.style.right='auto';
            fab.style.bottom='auto';
            $(menu).fadeOut(80);
        }
    };
    const endDrag = () => {
        if(isDrag){
            EXT._internal.fabPos={
                top:fab.style.top, left:fab.style.left,
                right:'auto', bottom:'auto', transform:'none'
            };
            save();
        } else if(dist<TH){
            const r=fab.getBoundingClientRect();
            const mW=$(menu).outerWidth()||180;
            const mH=$(menu).outerHeight()||120;
            menu.style.left = Math.max(8, Math.min(r.left+r.width/2-mW/2, window.innerWidth-mW-8))+'px';
            menu.style.top  = Math.max(8, r.top-mH-10)+'px';
            $(menu).fadeToggle(160);
        }
        isDrag=false;
    };

    fab.addEventListener('mousedown', e=>{
        if(e.button!==0) return;
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
        const mv=ev=>moveDrag(ev.clientX,ev.clientY);
        const up=()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); endDrag(); };
        document.addEventListener('mousemove',mv);
        document.addEventListener('mouseup',up);
    });
    fab.addEventListener('touchstart', e=>{ e.preventDefault(); startDrag(e.touches[0].clientX,e.touches[0].clientY); }, {passive:false});
    fab.addEventListener('touchmove',  e=>{ e.preventDefault(); moveDrag(e.touches[0].clientX,e.touches[0].clientY); }, {passive:false});
    fab.addEventListener('touchend',   e=>{ e.preventDefault(); endDrag(); }, {passive:false});

    $(document).off('click','#lm-diary').on('click','#lm-diary',  ()=>{ $(menu).fadeOut(); openModal('diary'); });
    $(document).off('click','#lm-forum').on('click','#lm-forum',  ()=>{ $(menu).fadeOut(); EXT._internal.forumUnread=false; save(); updateForumBadge(); openModal('forum'); });
    $(document).off('click','#lm-set').on('click','#lm-set',      ()=>{ $(menu).fadeOut(); openModal('settings'); });

    updateForumBadge();
}

// ════════════════════════════════════════════════════════════
// MODAL SHELL
// ════════════════════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`
      <div id="lumi-overlay" class="lumi-overlay">
        <div class="lumi-modal">
          <div class="lumi-head">
            <button class="lumi-icon-btn" id="lumi-back">${I.back}</button>
            <div class="lumi-head-title" id="lumi-title">LumiPulse</div>
            <button class="lumi-icon-btn" id="lumi-close">${I.close}</button>
          </div>
          <div id="lumi-body" class="lumi-body"></div>
        </div>
      </div>`);
    $('#lumi-close').on('click',()=>$('#lumi-overlay').fadeOut(180));
    $('#lumi-overlay').on('click',e=>{if(e.target.id==='lumi-overlay')$('#lumi-overlay').fadeOut(180);});
    $('#lumi-back').on('click',()=>{
        const v=$('#lumi-body').data('view');
        if(v==='forum-profile') renderForum();
        else if(v==='diary-edit') openModal('diary');
        else $('#lumi-overlay').fadeOut(180);
    });
}

function openModal(type='diary') {
    if(!$('#lumi-overlay').length) createModal();
    $('#lumi-overlay').css('display','flex').hide().fadeIn(180);
    if(type==='diary') renderDiary();
    else if(type==='forum') renderForum();
    else if(type==='settings') renderSettings();
}

// ════════════════════════════════════════════════════════════
// DIARY MODULE
// ════════════════════════════════════════════════════════════
function renderDiary() {
    const ctx=SillyTavern.getContext(), bid=botId(), botName=ctx.name2||'Unknown';
    const mems=loadMems({botId:bid});
    const si=EXT._internal, fc=si.filterChar||'',fd=si.filterDate||'',fl=si.filterLoc||'';
    const chars=[...new Set(mems.map(m=>m.character))].filter(Boolean);
    const dates=[...new Set(mems.map(m=>m.content.rp_date))].filter(Boolean);
    const locs=[...new Set(mems.map(m=>m.content.rp_location))].filter(Boolean);
    let filtered=mems;
    if(fc)filtered=filtered.filter(m=>m.character===fc);
    if(fd)filtered=filtered.filter(m=>m.content.rp_date===fd);
    if(fl)filtered=filtered.filter(m=>m.content.rp_location===fl);

    $('#lumi-title').text('Diary');
    const body=$('#lumi-body');
    body.data('view','diary');
    body.html(`
      <div class="lumi-hero">
        <div class="lumi-hero-eyebrow">${I.book} Memories of</div>
        <div class="lumi-hero-title">${esc(botName)}</div>
        <div class="lumi-hero-sub">${filtered.length} entries</div>
      </div>
      <div class="lumi-stats">
        <div class="lumi-stat"><b>${mems.length}</b><span>Total</span></div>
        <div class="lumi-stat"><b>${chars.length}</b><span>Chars</span></div>
        <div class="lumi-stat"><b>${mems.filter(m=>m.meta.isFavorite).length}</b><span>Favs</span></div>
      </div>
      <div class="lumi-nav">
        <div class="lumi-tab active" data-dtab="entries">${I.book} Entries</div>
        <div class="lumi-tab" data-dtab="story">${I.scroll} Story</div>
        <div class="lumi-tab" data-dtab="lore">${I.globe} Lore</div>
        <div class="lumi-tab" data-dtab="links">${I.link} Links</div>
      </div>
      <div class="lumi-diary-pad">
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px;">
          <select id="fc" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All chars</option>${chars.map(c=>`<option value="${esc(c)}"${c===fc?' selected':''}>${esc(c)}</option>`).join('')}</select>
          <select id="fd" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All dates</option>${dates.map(d=>`<option value="${esc(d)}"${d===fd?' selected':''}>${esc(d)}</option>`).join('')}</select>
          <select id="fl" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All locs</option>${locs.map(l=>`<option value="${esc(l)}"${l===fl?' selected':''}>${esc(l)}</option>`).join('')}</select>
        </div>
        <button id="btn-open-gen" class="lumi-sm-btn" style="width:100%;justify-content:center;margin-bottom:9px;">${I.spark} Generate from Chat</button>
        <div id="gen-form" style="display:none;margin-bottom:10px;"></div>
        <div id="diary-content"></div>
      </div>`);

    $('#fc,#fd,#fl').on('change',()=>{EXT._internal.filterChar=$('#fc').val();EXT._internal.filterDate=$('#fd').val();EXT._internal.filterLoc=$('#fl').val();save();renderDiary();});
    $('#btn-open-gen').on('click',()=>{if($('#gen-form').is(':visible'))$('#gen-form').slideUp(180);else{renderGenForm();$('#gen-form').slideDown(180);}});
    $('.lumi-tab[data-dtab]').on('click',function(){
        $('.lumi-tab[data-dtab]').removeClass('active');$(this).addClass('active');
        const t=$(this).data('dtab');
        if(t==='entries')renderDiaryEntries();
        else if(t==='story')renderStoryWeaver();
        else if(t==='lore')renderLoreTab();
        else if(t==='links')renderLinksTab();
    });
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const bid=botId(),si=EXT._internal,fc=si.filterChar||'',fd=si.filterDate||'',fl=si.filterLoc||'';
    let mems=loadMems({botId:bid});
    if(fc)mems=mems.filter(m=>m.character===fc);
    if(fd)mems=mems.filter(m=>m.content.rp_date===fd);
    if(fl)mems=mems.filter(m=>m.content.rp_location===fl);
    const byDate={};
    mems.forEach(m=>{const d=m.content.rp_date||'ไม่ระบุวัน';if(!byDate[d])byDate[d]=[];byDate[d].push(m);});
    const sorted=Object.keys(byDate).sort();
    if(!sorted.length){$('#diary-content').html(`<div class="lumi-empty"><div class="lumi-empty-icon">📖</div><div class="lumi-empty-text">ยังไม่มีความทรงจำ<br>Generate จากแชทได้เลยค่ะ!</div></div>`);return;}
    let html='';
    sorted.forEach(d=>{
        html+=`<div class="lumi-timeline-sep">${I.calendar} ${esc(d)}</div>`;
        byDate[d].forEach((m,i)=>{html+=diaryCardHTML(m,i);});
    });
    $('#diary-content').html(html);
    bindDiaryEvents();
}

function diaryCardHTML(m,i) {
    const color=colorOf(m.character),init=(m.character||'?').charAt(0).toUpperCase();
    const locked=EXT.diary.display.showSecretSystem&&checkUnlock(m)===false;
    const locB=m.content.rp_location?`<span class="lumi-badge">${I.mappin} ${esc(m.content.rp_location)}</span>`:'';
    const moodB=m.content.mood?`<span class="lumi-badge">${I.mood} ${esc(m.content.mood)}</span>`:'';
    const tags=(m.content.rp_tags||[]).map(t=>`<span class="lumi-badge">${I.tag} ${esc(t)}</span>`).join('');
    if(locked)return`<div class="lumi-card" data-id="${m.id}"><div class="lumi-card-header"><div class="lumi-avatar" style="background:${color}">${init}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="text-align:center;padding:10px;color:var(--lsub);">${I.lock}<div style="margin-top:5px;font-size:11px;">ล็อกอยู่</div></div></div>`;
    return`<div class="lumi-card" data-id="${m.id}">
      <div class="lumi-card-header">
        <div class="lumi-avatar" style="background:${color}">${init}</div>
        <div class="lumi-char-name">${esc(m.character)}</div>
        ${m.meta.isFavorite?`<span style="color:var(--lp);">♥</span>`:''}
        ${m.meta.isPinned?`<span style="color:#FBBF24;">${I.pin}</span>`:''}
      </div>
      <div class="lumi-card-meta">${moodB}${locB}${tags}</div>
      <div class="lumi-card-body">${esc(m.content.diary||'')}</div>
      <div class="lumi-card-footer">
        <button class="lumi-act${m.meta.isPinned?' act-on':''}" data-act="pin">${I.pin}</button>
        <button class="lumi-act${m.meta.isFavorite?' act-on':''}" data-act="fav">${m.meta.isFavorite?I.heartF:I.heart}</button>
        <button class="lumi-act" data-act="edit">${I.tag} แก้</button>
        <button class="lumi-act act-danger" data-act="del">${I.trash}</button>
      </div>
    </div>`;
}

function bindDiaryEvents() {
    $('.lumi-act').off('click').on('click',function(e){
        e.stopPropagation();
        const id=$(this).closest('.lumi-card').data('id'),act=$(this).data('act');
        const mem=EXT.memories.find(m=>m.id===id);if(!mem)return;
        if(act==='pin'){mem.meta.isPinned=!mem.meta.isPinned;save();renderDiaryEntries();}
        if(act==='fav'){mem.meta.isFavorite=!mem.meta.isFavorite;save();renderDiaryEntries();}
        if(act==='edit')editMemInline(id);
        if(act==='del'){if(confirm('ลบความทรงจำนี้?')){EXT.memories=EXT.memories.filter(m=>m.id!==id);save();renderDiaryEntries();}}
    });
}

function editMemInline(id) {
    const mem=EXT.memories.find(m=>m.id===id);if(!mem)return;
    const card=$(`.lumi-card[data-id="${id}"]`);
    card.find('.lumi-card-body').html(`<textarea class="lumi-input lumi-textarea" style="font-size:12px;">${esc(mem.content.diary||'')}</textarea><div style="display:flex;gap:6px;margin-top:7px;"><button class="lumi-sm-btn" id="save-inline" style="flex:1;justify-content:center;">บันทึก</button><button class="lumi-sm-btn" id="cancel-inline" style="flex:1;justify-content:center;">ยกเลิก</button></div>`);
    card.find('#save-inline').on('click',()=>{mem.content.diary=card.find('textarea').val();save();renderDiaryEntries();toast('✓ บันทึกแล้ว');});
    card.find('#cancel-inline').on('click',()=>renderDiaryEntries());
}

function renderGenForm() {
    $('#gen-form').html(`<div class="lumi-form-card">
      <div class="lumi-form-title">Generate Settings</div>
      <div style="display:flex;gap:5px;margin-bottom:9px;">
        ${['latest','first','all'].map(v=>`<button class="lumi-sm-btn gen-mode${v==='latest'?' act-on':''}" data-v="${v}" style="flex:1;justify-content:center;">${v==='latest'?'ล่าสุด':v==='first'?'แรก':'ทั้งหมด'}</button>`).join('')}
      </div>
      <div id="gen-count-wrap" style="margin-bottom:9px;">
        <label class="lumi-label">จำนวนข้อความ</label>
        <input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input" style="font-size:12px;">
      </div>
      <button id="btn-run-gen" class="lumi-btn">${I.spark} วิเคราะห์ & สร้าง</button>
    </div>`);
    $(document).on('click','.gen-mode',function(){$('.gen-mode').removeClass('act-on');$(this).addClass('act-on');$('#gen-count-wrap').toggle($(this).data('v')!=='all');});
    $('#btn-run-gen').on('click',genDiaryBatch);
}

async function renderStoryWeaver() {
    const mems=loadMems({botId:botId()}).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Story Weaver</div><button id="btn-weave" class="lumi-btn">${I.scroll} ร้อยเรียงเรื่องราว</button></div><div id="sw-out" style="display:none;background:var(--lcard);border:1px solid var(--lborder);border-radius:12px;padding:12px;font-size:12px;line-height:1.65;white-space:pre-wrap;max-height:260px;overflow-y:auto;margin-top:9px;"></div><div id="sw-acts" style="display:none;margin-top:9px;"><button id="btn-exp-story" class="lumi-btn">${I.book} Export .md</button></div>`);
    $('#btn-weave').on('click',async function(){
        $(this).html(`<span class="lumi-spin"></span> กำลังร้อยเรียง...`).prop('disabled',true);
        const dt=mems.map(m=>`[${m.character}|${m.content.rp_date}] ${m.content.diary}`).join('\n\n');
        const story=await callAI(`ร้อยเรียงบันทึกไดอารี่เหล่านี้เป็นนิยายรูปแบบ Markdown มีบทๆ:\n\n${dt}`,'You are a literary chronicler. Output only the story in Thai Markdown format.');
        $(this).html(`${I.scroll} ร้อยเรียงเรื่องราว`).prop('disabled',false);
        if(story){$('#sw-out').text(story).show();$('#sw-acts').show();$('#btn-exp-story').off('click').on('click',()=>exportText(story,'LumiPulse_Story.md'));}
    });
}

async function renderLoreTab() {
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Lore Extractor</div><button id="btn-lore" class="lumi-btn">${I.globe} สกัด Lore</button></div><div id="lore-out" style="display:none;margin-top:9px;"></div>`);
    $('#btn-lore').on('click',async function(){
        $(this).html(`<span class="lumi-spin"></span> กำลังสกัด...`).prop('disabled',true);
        const mems=loadMems({botId:botId()});
        const text=mems.map(m=>`[${m.character}] ${m.content.diary}`).join('\n');
        const raw=await callAI(`สกัด World Info จากข้อความนี้ ส่งคืนเฉพาะ JSON array: [{"keyword":"ชื่อ/สถานที่/ไอเทม","type":"character|location|item|event","content":"คำอธิบาย"}]\n\nข้อความ:\n${text}`,'You are a JSON API. Output ONLY a raw JSON array. No explanation.');
        $(this).html(`${I.globe} สกัด Lore`).prop('disabled',false);
        const data=extractJSON(raw,'array');
        if(data&&data.length){
            let html=`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:10px;"><tr style="background:var(--la);"><th style="padding:6px;color:var(--lp);text-align:left;">Keyword</th><th style="padding:6px;color:var(--lp);text-align:left;">Type</th><th style="padding:6px;color:var(--lp);text-align:left;">Content</th></tr>`;
            data.forEach(l=>html+=`<tr style="border-bottom:1px solid var(--lborder);"><td style="padding:6px;font-weight:600;">${esc(l.keyword||'')}</td><td style="padding:6px;">${esc(l.type||'')}</td><td style="padding:6px;color:var(--lsub);">${esc((l.content||'').slice(0,55))}...</td></tr>`);
            html+=`</table></div><div style="margin-top:9px;"><button id="btn-exp-lore" class="lumi-btn">${I.book} Export JSON</button></div>`;
            const lb={name:'LumiPulse Lorebook',entries:{}};
            data.forEach((item,i)=>{lb.entries[i]={uid:i,key:[item.keyword],comment:item.type,content:item.content,selective:true,probability:100,useProbability:true,depth:4,group:'LumiPulse'};});
            $('#lore-out').html(html).show();
            $('#btn-exp-lore').off('click').on('click',()=>exportJSON(lb,'LumiPulse_Lorebook.json'));
        } else $('#lore-out').html(`<div class="lumi-empty"><div class="lumi-empty-text">ไม่พบข้อมูล Lore ลอง Generate ความทรงจำเพิ่มก่อนค่ะ</div></div>`).show();
    });
}

function renderLinksTab() {
    const mems=loadMems({botId:botId()});
    const linked=mems.filter(m=>m.meta.linkedIds&&m.meta.linkedIds.length>0);
    let html=linked.length===0?`<div class="lumi-empty"><div class="lumi-empty-icon">🔗</div><div class="lumi-empty-text">ยังไม่มีความทรงจำที่เชื่อมโยงกัน</div></div>`:'';
    linked.forEach(m=>{
        const links=m.meta.linkedIds.map(id=>{const lm=mems.find(x=>x.id===id);return lm?`<span class="lumi-badge" style="cursor:pointer;margin:2px;" data-lid="${lm.id}">${I.link} ${esc(lm.character)} · ${esc(lm.content.rp_date)}</span>`:''}).join('');
        html+=`<div class="lumi-card"><div class="lumi-card-header"><div class="lumi-avatar" style="background:${colorOf(m.character)}">${m.character.charAt(0)}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="font-size:10px;color:var(--lsub);margin-bottom:5px;">เชื่อมโยงกับ:</div>${links}</div>`;
    });
    $('#diary-content').html(html);
    $('[data-lid]').off('click').on('click',function(){
        const mem=mems.find(m=>m.id===$(this).data('lid'));
        if(mem){$('#diary-content').html(diaryCardHTML(mem,0)+`<button class="lumi-sm-btn" id="back-links" style="width:100%;justify-content:center;margin-top:9px;">${I.back} กลับ</button>`);bindDiaryEvents();$('#back-links').on('click',renderLinksTab);}
    });
}

// ── Diary AI ──────────────────────────────────────────────
async function genDiaryBatch() {
    const mode=$('.gen-mode.act-on').data('v')||'latest';
    const count=parseInt($('#gen-count').val())||30;
    $('#btn-run-gen').html(`<span class="lumi-spin"></span> กำลังวิเคราะห์...`).prop('disabled',true);
    const results=await callDiaryAI(mode,count);
    $('#btn-run-gen').html(`${I.spark} วิเคราะห์ & สร้าง`).prop('disabled',false);
    $('#gen-form').slideUp(180);
    if(results&&results.length>0){
        const ctx=SillyTavern.getContext(),bid=botId(),wm=EXT.diary.worldMode==='auto'?detectWorldMode():EXT.diary.worldMode;
        results.forEach(r=>saveMem({id:'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),timestamp:new Date().toISOString(),character:r.character||ctx.name2||'Character',botId:bid,worldMode:wm,content:{...r},meta:{isPinned:false,isFavorite:false,isSecret:r.isSecret||false,linkedIds:r.linkedIds||[],tags:extractTags(r.diary||'')}}));
        toast(`✓ สร้าง ${results.length} ความทรงจำ`);renderDiaryEntries();
    } else toast('ไม่พบเหตุการณ์ใหม่','err');
}

async function callDiaryAI(mode,count) {
    const ctx=SillyTavern.getContext(),allChat=ctx.chat||[];
    let slice,si=0,ei=0;
    if(mode==='latest'){slice=allChat.slice(-count);si=Math.max(0,allChat.length-count);ei=allChat.length;}
    else if(mode==='first'){slice=allChat.slice(0,count);si=0;ei=count;}
    else{slice=allChat.filter(m=>m.mes&&m.mes.length>15).slice(-120);si=Math.max(0,allChat.length-120);ei=allChat.length;}
    const log=slice.filter(m=>m.mes&&m.mes.length>8).map(m=>`[${m.is_user?'User':(m.name||'NPC')}]: ${(m.mes||'').replace(/<[^>]+>/g,'').slice(0,80)}`).join('\n');
    const prev=loadMems({botId:botId()}).slice(0,5).map(m=>`- [${m.character}] ${(m.content.diary||'').slice(0,45)}`).join('\n');
    const reg=Object.keys(EXT._internal.nameRegistry||{}).join(', ');

    const sys=`You are a creative fiction writer helping analyze roleplay chat logs to create in-universe diary entries.
This is entirely fictional creative writing. The characters and events are not real.
Output ONLY a raw JSON array. No markdown fences, no explanation, no thinking tags.`;

    const prompt=`[FICTION/CREATIVE WRITING CONTEXT]
Analyze this fictional roleplay chat and create diary entries as if written by the characters.
Known characters: ${reg||'none'}
Previous entries (do not repeat): ${prev||'none'}
Chat log (#${si+1}-${ei}):
${log}

Create diary entries from the perspective of the characters who had significant moments.
Keep entries in Thai language, personal and emotional tone.

Return JSON array:
[{"character":"ชื่อ","rp_date":"วันที่ไทย","rp_location":"สถานที่","rp_tags":["#แท็ก"],"mood":"อารมณ์","diary":"เนื้อหา 2-4 ประโยค","isSecret":false,"linkedIds":[]}]`;

    const raw=await callAI(prompt,sys);
    const data=extractJSON(raw,'array');
    return Array.isArray(data)?data:[];
}

// ── Memory helpers ─────────────────────────────────────────
function loadMems(filter={}) {
    let m=[...(EXT.memories||[])];
    if(filter.botId)m=m.filter(x=>x.botId===filter.botId||!x.botId);
    if(filter.character)m=m.filter(x=>x.character===filter.character);
    return m.sort((a,b)=>(b.meta.isPinned?1:0)-(a.meta.isPinned?1:0)||new Date(b.timestamp)-new Date(a.timestamp));
}
function saveMem(entry){
    if(!EXT._internal.nameRegistry)EXT._internal.nameRegistry={};
    let cn=entry.character.replace(/[()（）[\]]/g,'').trim(),canon=cn;
    for(let k in EXT._internal.nameRegistry){if(simScore(cn,k)>90){canon=k;break;}}
    EXT._internal.nameRegistry[canon]=true;entry.character=canon;
    const ex=EXT.memories.filter(m=>m.character===canon);
    if(ex.some(m=>simScore(m.content.diary||'',entry.content.diary||'')>85))return;
    EXT.memories.unshift(entry);
    if(EXT.memories.length>EXT.diary.storage.max)EXT.memories=EXT.memories.slice(0,EXT.diary.storage.max);
    save();
}
const checkUnlock=(m)=>{if(!m.meta.isSecret)return true;const mode=EXT.diary.display.secretMode;if(mode==='time')return(Date.now()-new Date(m.timestamp))>86400000*3;if(mode==='affection')return(m.content.affection_score||0)>=80;return false;};
const extractTags=(t)=>{const tags=[],kw={'#โรแมนติก':['รัก','หัวใจ'],'#ดราม่า':['เสียใจ','ร้องไห้'],'#ลึกลับ':['ลึกลับ','ความลับ']},l=t.toLowerCase();for(const[k,v]of Object.entries(kw))if(v.some(w=>l.includes(w)))tags.push(k);return tags;};
const detectWorldMode=()=>{const names=new Set();(SillyTavern.getContext().chat||[]).slice(-50).forEach(m=>{if(m.name&&!m.is_user&&!m.is_system)names.add(m.name);});return names.size>2?'rpg':'solo';};

// ════════════════════════════════════════════════════════════
// FORUM MODULE  (fixed)
// ════════════════════════════════════════════════════════════
function renderForum() {
    const ctx = SillyTavern.getContext();
    const threads = botPosts().filter(p => p.type === 'thread');

    $('#lumi-title').text('Forum');
    const body = $('#lumi-body');
    body.data('view', 'forum');

    // ✅ lumi-body ต้องไม่ overflow:auto เอง เพราะ inner wrap จะจัดการ scroll เอง
    body.css('overflow', 'hidden');

    body.html(`
      <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">

        <div class="lumi-hero" style="flex-shrink:0;">
          <div class="lumi-hero-eyebrow">${I.news} Community Board</div>
          <div class="lumi-hero-title">${esc(ctx.name2 || 'World')}</div>
          <div class="lumi-hero-sub" id="forum-post-count">${threads.length} posts</div>
        </div>

        <div style="display:flex;gap:7px;padding:9px 12px;flex-shrink:0;border-bottom:1px solid var(--lborder);background:var(--lnav);">
          <button class="lumi-sm-btn" id="btn-forum-reload" style="flex:1;justify-content:center;">${I.refresh} Refresh Feed</button>
          <button class="lumi-sm-btn lumi-danger-btn" id="btn-forum-clear">${I.trash}</button>
        </div>

        <div style="padding:10px 12px 0;flex-shrink:0;">
          <div class="lumi-compose">
            <div class="lumi-compose-head">
              <div class="lumi-avatar lumi-avatar-sm" style="background:${colorOf(ctx.name1 || 'Player')}">${(ctx.name1 || 'P').charAt(0)}</div>
              <div style="flex:1;font-size:11px;color:var(--lsub);">อยากพูดถึงอะไร?</div>
              <div class="lumi-mode-toggle">
                <button class="lumi-mode-btn active" data-mode="text">ข้อความ</button>
                <button class="lumi-mode-btn" data-mode="image">รูปภาพ</button>
              </div>
            </div>
            <div id="compose-text-area">
              <textarea id="compose-txt" class="lumi-input lumi-textarea" placeholder="เขียนโพสต์..."></textarea>
            </div>
            <div id="compose-image-area" style="display:none;">
              <input type="file" id="compose-img-file" accept="image/*" style="display:none;">
              <div id="compose-img-preview" style="border:2px dashed var(--lborder);border-radius:10px;padding:20px;text-align:center;cursor:pointer;margin-bottom:7px;font-size:11px;color:var(--lsub);">${I.image} คลิกเพื่อเลือกรูปภาพ</div>
              <input type="text" id="compose-img-caption" class="lumi-input" placeholder="แคปชั่น (ไม่บังคับ)" style="font-size:12px;">
            </div>
            <div class="lumi-compose-footer">
              <button id="btn-post" class="lumi-sm-btn">${I.send} โพสต์</button>
            </div>
          </div>
        </div>

        <div id="lumi-feed" style="flex:1;overflow-y:auto;padding:10px 12px 20px;scrollbar-width:thin;scrollbar-color:var(--lborder) transparent;"></div>

      </div>
    `);

    // ── Bind events (ทั้งหมดต้องมาหลัง .html()) ─────────────
    $('.lumi-mode-btn').on('click', function() {
        $('.lumi-mode-btn').removeClass('active');
        $(this).addClass('active');
        const mode = $(this).data('mode');
        $('#compose-text-area').toggle(mode === 'text');
        $('#compose-image-area').toggle(mode === 'image');
    });

    $('#compose-img-preview').on('click', () => $('#compose-img-file').trigger('click'));
    $('#compose-img-file').on('change', function() {
        const file = this.files[0]; if (!file) return;
        if (file.size > 1024 * 1024) { toast('รูปต้องเล็กกว่า 1MB', 'err'); return; }
        const reader = new FileReader();
        reader.onload = e => {
            const b64 = e.target.result;
            $('#compose-img-preview').html(`<img src="${b64}" style="max-width:100%;max-height:140px;border-radius:8px;object-fit:contain;">`);
            $('#compose-img-preview').data('b64', b64);
        };
        reader.readAsDataURL(file);
    });

    $('#btn-forum-reload').on('click', async function() {
        $(this).html(`<span class="lumi-spin lumi-spin-p"></span> โหลด...`).prop('disabled', true);
        await runForumRefresh();
        $(this).html(`${I.refresh} Refresh Feed`).prop('disabled', false);
    });

    $('#btn-forum-clear').on('click', () => {
        if (confirm('ลบโพสต์ทั้งหมดของตัวละครนี้?')) {
            savePosts([]);
            renderFeed();
            toast('✓ ล้างแล้ว');
        }
    });

    $('#btn-post').on('click', async () => {
        const mode = $('.lumi-mode-btn.active').data('mode');
        const ctx = SillyTavern.getContext();
        if (mode === 'image') {
            const b64 = $('#compose-img-preview').data('b64');
            if (!b64) { toast('เลือกรูปก่อนนะคะ', 'err'); return; }
            const caption = $('#compose-img-caption').val().trim();
            const newPost = {
                id: 'post_' + Date.now(), type: 'thread', posterType: 'player',
                author: ctx.name1 || 'Player', postStyle: 'image',
                imageData: b64, imageCaption: caption, content: caption || '📷',
                threadTag: 'Photo', timestamp: new Date().toISOString(),
                parentId: null, likes: 0, likedBy: [], replies: []
            };
            const arr = botPosts(); arr.push(newPost); savePosts(arr);
            $('#compose-img-preview').html(`${I.image} คลิกเพื่อเลือกรูปภาพ`).data('b64', '');
            $('#compose-img-caption').val('');
        } else {
            const txt = $('#compose-txt').val().trim();
            if (!txt) { toast('เขียนอะไรก่อนนะคะ', 'err'); return; }
            const newPost = {
                id: 'post_' + Date.now(), type: 'thread', posterType: 'player',
                author: ctx.name1 || 'Player', postStyle: 'text', content: txt,
                threadTag: 'Discussion', timestamp: new Date().toISOString(),
                parentId: null, likes: 0, likedBy: [], replies: []
            };
            const arr = botPosts(); arr.push(newPost); savePosts(arr);
            $('#compose-txt').val('');
        }
        renderFeed();
        const lastPlayerPost = botPosts().filter(p => p.posterType === 'player').slice(-1)[0];
        if (lastPlayerPost) setTimeout(() => aiReactToPost(lastPlayerPost.id), 1400);
    });

    // ✅ renderFeed() เรียกสุดท้าย หลัง DOM และ events พร้อมหมด
    renderFeed();
}

// ── Feed ──────────────────────────────────────────────────
function renderFeed() {
    const $feed = $('#lumi-feed');
    if (!$feed.length) return;

    const threads = botPosts().filter(p => p.type === 'thread')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // อัปเดต counter ใน hero
    $('#forum-post-count').text(threads.length + ' posts');

    if (!threads.length) {
        $feed.html(`<div class="lumi-empty"><div class="lumi-empty-icon">💬</div><div class="lumi-empty-text">ยังไม่มีโพสต์<br>กด Refresh Feed เพื่อดูว่ามีอะไรเกิดขึ้นบ้าง!</div></div>`);
        return;
    }
    let html = '';
    threads.forEach(th => {
        const allReplies = botPosts().filter(p => p.parentId === th.id);
        html += postCardHTML(th, allReplies);
    });
    $feed.html(html);
    bindFeedEvents();
}

function postCardHTML(thread, allReplies) {
    const color = colorOf(thread.author), init = (thread.author || '?').charAt(0).toUpperCase();
    const liked = thread.likedBy?.includes('__player__');
    const likeCount = thread.likes || 0;
    const typeClass = thread.posterType === 'news' ? 'post-news' : '';
    const typeBadge = thread.posterType === 'news'
        ? `<span class="lumi-type-badge badge-news">${I.news} ข่าว</span>`
        : thread.posterType === 'npc'
            ? `<span class="lumi-type-badge badge-npc">NPC</span>`
            : thread.posterType === 'citizen'
                ? `<span class="lumi-type-badge badge-citizen">ประชาชน</span>`
                : `<span class="lumi-type-badge badge-main">หลัก</span>`;

    let bodyHTML = '';
    if (thread.postStyle === 'image' && thread.imageData) {
        bodyHTML = `<div class="lumi-img-card"><img src="${thread.imageData}" alt="post image"><div class="lumi-img-caption">${esc(thread.imageCaption || '')}</div></div>`;
    } else if (thread.postStyle === 'song') {
        bodyHTML = `<div class="lumi-song-card"><div class="lumi-song-disc">${I.music}</div><div class="lumi-song-info"><div class="lumi-song-title">${esc(thread.songTitle || 'Unknown')}</div><div class="lumi-song-sub">${esc(thread.songArtist || '')}${thread.songMood ? ` · ${esc(thread.songMood)}` : ''}</div></div></div>${thread.content ? `<div class="lumi-post-body">${esc(thread.content)}</div>` : ''}`;
    } else if (thread.postStyle === 'image_desc') {
        bodyHTML = `<div class="lumi-img-card" style="background:var(--la);"><div class="lumi-img-caption" style="padding:14px 12px;font-size:11px;color:var(--lsub);">📷 ${esc(thread.imageDesc || '')}</div></div>${thread.content ? `<div class="lumi-post-body">${esc(thread.content)}</div>` : ''}`;
    } else {
        bodyHTML = `<div class="lumi-post-body">${esc(thread.content || '')}</div>`;
    }

    const rootReplies = allReplies.filter(r => r.parentId === thread.id);
    let repliesHTML = rootReplies.map(r => {
        const l2 = allReplies.filter(x => x.parentId === r.id);
        const rc = colorOf(r.author), ri = (r.author || '?').charAt(0).toUpperCase();
        const l2HTML = l2.map(r2 => {
            const r2c = colorOf(r2.author), r2i = (r2.author || '?').charAt(0).toUpperCase();
            return `<div class="lumi-reply lumi-reply-l2">
              <div class="lumi-reply-head">
                <div class="lumi-avatar lumi-avatar-sm" style="background:${r2c}">${r2i}</div>
                <div class="lumi-reply-name">${esc(r2.author)}</div>
                <div class="lumi-reply-time">${timeAgo(r2.timestamp)}</div>
              </div>
              <div class="lumi-reply-body">${esc(r2.content)}</div>
            </div>`;
        }).join('');
        return `<div class="lumi-reply">
          <div class="lumi-reply-head">
            <div class="lumi-avatar lumi-avatar-sm" style="background:${rc}">${ri}</div>
            <div class="lumi-reply-name">${esc(r.author)}</div>
            <div class="lumi-reply-time">${timeAgo(r.timestamp)}</div>
            <button class="lumi-sm-btn" data-act="reply-to-reply" data-rid="${r.id}" data-tid="${thread.id}" style="padding:2px 7px;font-size:9px;margin-left:4px;">ตอบ</button>
          </div>
          <div class="lumi-reply-body">${esc(r.content)}</div>
          ${l2HTML}
          <div class="lumi-compose-l2" id="l2-${r.id}" style="display:none;margin-top:6px;padding-left:28px;">
            <div class="lumi-compose-reply">
              <textarea class="lumi-reply-input" data-thread="${thread.id}" data-parent="${r.id}" placeholder="ตอบกลับ ${esc(r.author)}..." rows="1"></textarea>
              <button class="lumi-send-btn" data-act="send-reply" data-thread="${thread.id}" data-parent="${r.id}">${I.send}</button>
            </div>
          </div>
        </div>`;
    }).join('');

    const replyCount = allReplies.length;

    return `<div class="lumi-post ${typeClass}" data-id="${thread.id}">
      <div class="lumi-post-head">
        <div class="lumi-avatar" style="background:${color}">${init}</div>
        <div style="flex:1;">
          <div class="lumi-post-author">${esc(thread.author)} ${typeBadge}</div>
          <div class="lumi-post-meta">${timeAgo(thread.timestamp)}${thread.threadTag ? ` · <span class="lumi-post-tag">${esc(thread.threadTag)}</span>` : ''}</div>
        </div>
        <button class="lumi-act act-danger" data-act="del-post" data-id="${thread.id}" style="padding:2px 5px;">${I.trash}</button>
      </div>
      ${thread.title ? `<div class="lumi-post-title">${esc(thread.title)}</div>` : ''}
      ${bodyHTML}
      <div class="lumi-post-actions">
        <button class="lumi-post-btn${liked ? ' liked' : ''}" data-act="like" data-id="${thread.id}">${liked ? I.heartF : I.heart} ${likeCount || '0'}</button>
        <button class="lumi-post-btn" data-act="toggle-replies" data-id="${thread.id}">${I.comment} ${replyCount || '0'}</button>
        <button class="lumi-post-btn" data-act="ai-reply" data-id="${thread.id}">${I.spark} AI</button>
      </div>
      <div class="lumi-replies-wrap" id="rep-${thread.id}">
        <div class="lumi-reply-thread">${repliesHTML}</div>
        <div class="lumi-compose-reply" style="margin-top:8px;">
          <textarea class="lumi-reply-input" data-thread="${thread.id}" data-parent="${thread.id}" placeholder="เขียนความคิดเห็น..." rows="1"></textarea>
          <button class="lumi-send-btn" data-act="send-reply" data-thread="${thread.id}" data-parent="${thread.id}">${I.send}</button>
        </div>
      </div>
    </div>`;
}

function bindFeedEvents() {
    $('[data-act="like"]').off('click').on('click', function() {
        const id = $(this).data('id'), arr = botPosts(), post = arr.find(p => p.id === id);
        if (!post) return;
        if (!post.likedBy) post.likedBy = [];
        const idx = post.likedBy.indexOf('__player__');
        if (idx >= 0) { post.likedBy.splice(idx, 1); post.likes = Math.max(0, (post.likes || 0) - 1); }
        else { post.likedBy.push('__player__'); post.likes = (post.likes || 0) + 1; }
        savePosts(arr); renderFeed();
    });
    $('[data-act="toggle-replies"]').off('click').on('click', function() {
        const id = $(this).data('id');
        $(`#rep-${id}`).is(':visible') ? $(`#rep-${id}`).slideUp(160) : $(`#rep-${id}`).slideDown(180);
    });
    $('[data-act="reply-to-reply"]').off('click').on('click', function() {
        const rid = $(this).data('rid');
        $('[id^="l2-"]').not(`#l2-${rid}`).hide();
        $(`#l2-${rid}`).toggle();
    });
    $('[data-act="send-reply"]').off('click').on('click', async function() {
        const tid = $(this).data('thread'), pid = $(this).data('parent');
        const txt = $(`.lumi-reply-input[data-thread="${tid}"][data-parent="${pid}"]`).val().trim();
        if (!txt) return;
        const ctx = SillyTavern.getContext();
        const r = { id: 'rep_' + Date.now(), type: 'reply', posterType: 'player', author: ctx.name1 || 'Player', content: txt, timestamp: new Date().toISOString(), parentId: pid, likes: 0, likedBy: [] };
        const arr = botPosts(); arr.push(r); savePosts(arr);
        $(`.lumi-reply-input[data-thread="${tid}"][data-parent="${pid}"]`).val('');
        renderFeed();
        setTimeout(() => aiReactToPost(tid), 1000);
    });
    $('[data-act="ai-reply"]').off('click').on('click', async function() {
        const tid = $(this).data('id'), $btn = $(this);
        $btn.html(`<span class="lumi-spin lumi-spin-p" style="width:10px;height:10px;border-width:1.5px;"></span>`).prop('disabled', true);
        await aiReactToPost(tid);
        $btn.html(`${I.spark} AI`).prop('disabled', false);
    });
    $('[data-act="del-post"]').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).data('id');
        if (!confirm('ลบโพสต์และ reply ทั้งหมด?')) return;
        savePosts(botPosts().filter(p => p.id !== id && p.parentId !== id));
        renderFeed();
    });
    $('.lumi-reply-input').on('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 65) + 'px'; });
}

// ════════════════════════════════════════════════════════════
// FORUM AI ENGINE
// ════════════════════════════════════════════════════════════
async function runForumRefresh() {
    const ctx = SillyTavern.getContext();
    const existing = botPosts();
    const pt = EXT.forum.posterTypes;
    const chatCtx = (ctx.chat || []).slice(-20).filter(m => m.mes && m.mes.length > 5)
        .map(m => `${m.is_user ? 'User' : m.name}: ${(m.mes || '').replace(/\n/g, ' ').replace(/<[^>]+>/g, '').slice(0, 90)}`).join('\n') || 'ยังไม่มีบทสนทนา';
    const existingTitles = existing.slice(-8).filter(p => p.type === 'thread').map(p => (p.title || p.content).slice(0, 35)).join('; ');

    const sys = `You are a JSON API for a fictional social media platform in a roleplay world.
Output ONLY a raw JSON array. No markdown, no explanation, no thinking tags.
This is entirely fictional creative writing.`;

    const prompt = `Create realistic social media posts for a fictional roleplay world's community forum.

Recent story events:
${chatCtx}

Already posted (avoid repeating): ${existingTitles || 'none'}

Poster types enabled: ${[pt.mainChars ? 'main characters' : '', pt.npcs ? 'NPCs' : '', pt.citizens ? 'citizens/public' : '', pt.news ? 'news/announcements' : ''].filter(Boolean).join(', ')}

Generate 4-6 posts. Mix these natural social media behaviors:
- Sharing personal feelings/moods
- Posting about something funny or silly that happened
- Sharing a song they're listening to (use postStyle:"song" with songTitle,songArtist,songMood)
- Venting about something frustrating
- Sharing news or rumors
- Reacting to story events
- Posting a photo description (use postStyle:"image_desc" with imageDesc field)
- Casual conversations and jokes

Each post can have 2-5 replies with natural back-and-forth conversations.

Return JSON:
[
  {
    "author": "Character/NPC name",
    "posterType": "main|npc|citizen|news",
    "postStyle": "text|song|image_desc",
    "title": null,
    "content": "Post text (casual social media tone)",
    "songTitle": "ชื่อเพลง (if song)",
    "songArtist": "ศิลปิน (if song)",
    "songMood": "mood (if song)",
    "imageDesc": "description of what the photo shows (if image_desc)",
    "threadTag": "Mood|Gossip|Song|Photo|Funny|Rant|News|Update|Question",
    "replies": [
      {
        "author": "Character name",
        "posterType": "main|npc|citizen",
        "content": "Reply text",
        "replies": [
          {"author": "Name", "posterType": "main|npc|citizen", "content": "Nested reply"}
        ]
      }
    ]
  }
]`;

    try {
        const raw = await callAI(prompt, sys);
        const data = extractJSON(raw, 'array');
        if (!data || !Array.isArray(data) || !data.length) { toast('AI ไม่ส่งโพสต์กลับมา', 'err'); return; }
        const now = Date.now();
        const toAdd = [];

        data.filter(p => p && (p.content || p.songTitle || p.imageDesc)).forEach((p, i) => {
            const threadId = 'post_' + (now + i * 200) + '_' + Math.random().toString(36).substr(2, 4);
            let postStyle = p.postStyle || 'text';
            let extraFields = {};
            if (postStyle === 'song') { extraFields = { songTitle: p.songTitle || 'Unknown Track', songArtist: p.songArtist || '', songMood: p.songMood || '' }; }
            if (postStyle === 'image_desc') { extraFields = { imageDesc: p.imageDesc || '' }; }
            toAdd.push({
                id: threadId, type: 'thread', posterType: p.posterType || 'npc',
                author: (p.author || 'Unknown').trim(), postStyle,
                title: p.title && p.title.trim() ? p.title.trim() : null,
                content: (p.content || '').trim(),
                threadTag: p.threadTag || 'Update',
                timestamp: new Date(now + i * 2000).toISOString(),
                parentId: null, likes: Math.floor(Math.random() * 15), likedBy: [],
                ...extraFields
            });
            if (Array.isArray(p.replies)) {
                addRepliesRecursive(p.replies, threadId, toAdd, now + i * 200);
            }
        });

        if (!toAdd.length) { toast('ไม่มีโพสต์ที่ถูกต้อง', 'err'); return; }
        savePosts([...existing, ...toAdd]);
        renderFeed();
        toast(`✓ เพิ่ม ${toAdd.filter(p => p.type === 'thread').length} โพสต์`);

        if (!$('#lumi-overlay').is(':visible') || $('#lumi-body').data('view') !== 'forum') {
            EXT._internal.forumUnread = true; save(); updateForumBadge();
        }
    } catch (e) { console.error('[LumiPulse] runForumRefresh:', e); toast('เกิดข้อผิดพลาด: ' + e.message, 'err'); }
}

function addRepliesRecursive(replies, parentId, toAdd, baseTime, depth = 0) {
    if (depth > 2 || !Array.isArray(replies)) return;
    replies.filter(r => r && r.content).forEach((r, j) => {
        const rid = 'rep_' + (baseTime + depth * 1000 + j * 300) + '_' + Math.random().toString(36).substr(2, 4);
        toAdd.push({
            id: rid, type: 'reply', posterType: r.posterType || 'npc',
            author: (r.author || 'Someone').trim(),
            content: r.content.trim(), postStyle: 'text',
            timestamp: new Date(baseTime + depth * 1000 + j * 500).toISOString(),
            parentId, likes: 0, likedBy: []
        });
        if (Array.isArray(r.replies)) addRepliesRecursive(r.replies, rid, toAdd, baseTime + depth * 1000 + j * 300, depth + 1);
    });
}

async function aiReactToPost(threadId) {
    const all = botPosts();
    const thread = all.find(p => p.id === threadId); if (!thread) return;
    const existingReps = all.filter(p => p.parentId === threadId);
    const ctx = SillyTavern.getContext();
    const chars = new Set();
    (ctx.chat || []).slice(-60).forEach(m => { if (m.name && !m.is_user) chars.add(m.name); });
    if (ctx.name2) chars.add(ctx.name2);
    const pool = Array.from(chars).filter(c => c !== thread.author);
    if (!pool.length) return;
    const recent = existingReps.slice(-5).map(r => r.author);
    const eligible = pool.filter(c => !recent.includes(c));
    if (!eligible.length) return;

    if (Math.random() > 0.45) {
        const liker = eligible[Math.floor(Math.random() * eligible.length)];
        if (!thread.likedBy) thread.likedBy = [];
        if (!thread.likedBy.includes(liker)) { thread.likedBy.push(liker); thread.likes = (thread.likes || 0) + 1; }
    }

    const numRep = Math.min(3, 1 + Math.floor(Math.random() * 3));
    const repliers = eligible.slice(0, numRep);
    const sys = 'You are a JSON API. Output ONLY a raw JSON array. No markdown, no explanation.';
    const postCtx = `Post by ${thread.author}: "${(thread.title ? thread.title + ' — ' : '')}${thread.content.slice(0, 120)}"`;
    const prevCtx = existingReps.length ? `Previous replies:\n${existingReps.slice(-3).map(r => `${r.author}: ${r.content}`).join('\n')}` : '';
    const prompt = `Generate ${numRep} natural social-media replies for this forum post.
${postCtx}
${prevCtx}
Reply from: ${repliers.join(', ')}
Rules: 1-3 sentences each, casual natural tone, mix emotions (sympathetic/teasing/funny/supportive), in Thai.
Output: [{"author":"Name","content":"Reply text"}]`;

    try {
        const raw = await callAI(prompt, sys);
        const data = extractJSON(raw, 'array');
        if (!data || !Array.isArray(data)) { savePosts(all); if ($('#lumi-feed').length) renderFeed(); return; }
        const now = Date.now();
        const newReps = data.filter(r => r && r.content).map((r, i) => ({
            id: 'rep_' + (now + i * 400) + '_' + Math.random().toString(36).substr(2, 4),
            type: 'reply', posterType: 'npc',
            author: (r.author || repliers[0] || 'Someone').trim(),
            content: r.content.trim(), postStyle: 'text',
            timestamp: new Date(now + i * 700).toISOString(),
            parentId: threadId, likes: 0, likedBy: []
        }));
        savePosts([...all, ...newReps]);
        if ($('#lumi-feed').length) renderFeed();

        if (!$('#lumi-overlay').is(':visible') || $('#lumi-body').data('view') !== 'forum') {
            EXT._internal.forumUnread = true; save(); updateForumBadge();
        }
    } catch (e) { savePosts(all); console.error('[LumiPulse] aiReactToPost:', e); }
}

// ════════════════════════════════════════════════════════════
// AUTO TRIGGERS
// ════════════════════════════════════════════════════════════
function setupDiaryAutoTrigger() {
    $(document).off('messageReceived.lumi-diary').on('messageReceived.lumi-diary', async () => {
        const d = EXT.diary, cfg = d.autoGen; if (!cfg.enabled) return;
        EXT._internal.diaryMsgCounter = (EXT._internal.diaryMsgCounter || 0) + 1;
        const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
        let gen = false;
        if (cfg.triggerType === 'turn_count' && EXT._internal.diaryMsgCounter >= cfg.turnInterval) { gen = true; EXT._internal.diaryMsgCounter = 0; }
        else if (cfg.triggerType === 'emotion' && cfg.emotionKeywords.some(k => lastMsg.includes(k))) gen = true;
        else if (cfg.triggerType === 'random' && Math.random() < cfg.randomChance) gen = true;
        if (gen) {
            const results = await callDiaryAI('latest', cfg.turnInterval || 20);
            if (results && results.length) {
                const ctx = SillyTavern.getContext(), bid = botId(), wm = d.worldMode === 'auto' ? detectWorldMode() : d.worldMode;
                results.forEach(r => saveMem({ id: 'mem_auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), timestamp: new Date().toISOString(), character: r.character || ctx.name2 || 'Character', botId: bid, worldMode: wm, content: { ...r }, meta: { isPinned: false, isFavorite: false, isSecret: r.isSecret || false, linkedIds: r.linkedIds || [], tags: extractTags(r.diary || '') } }));
            }
        }
    });
}

function setupForumAutoTrigger() {
    $(document).off('messageReceived.lumi-forum').on('messageReceived.lumi-forum', async () => {
        const f = EXT.forum; if (!f.enabled || !f.autoGen.enabled) return;
        EXT._internal.forumMsgCounter = (EXT._internal.forumMsgCounter || 0) + 1;
        const now = Date.now(); let gen = false;
        if (f.autoGen.triggerType === 'turn_count' && EXT._internal.forumMsgCounter >= f.autoGen.turnInterval) { gen = true; EXT._internal.forumMsgCounter = 0; }
        if (f.autoGen.triggerType === 'time_interval' && (now - EXT._internal.lastForumGenTime) / 60000 >= f.autoGen.timeInterval) { gen = true; EXT._internal.lastForumGenTime = now; }
        if (f.autoGen.triggerType === 'random' && Math.random() < f.autoGen.randomChance) gen = true;

        const recentPlayerPosts = botPosts().filter(p => p.posterType === 'player' && (Date.now() - new Date(p.timestamp)) < 300000);
        if (recentPlayerPosts.length && Math.random() < 0.6) {
            const target = recentPlayerPosts[Math.floor(Math.random() * recentPlayerPosts.length)];
            await aiReactToPost(target.id);
        }
        if (gen) await runForumRefresh();
    });
}

// ════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════
function renderSettings() {
    $('#lumi-title').text('Settings');
    const body = $('#lumi-body');
    body.data('view', 'settings');
    body.css('overflow', 'auto');
    const s = EXT, ag = s.diary.autoGen, fg = s.forum.autoGen, api = s.api;
    const cm = s._internal.colorMode || 'dark';
    const currentTheme = s._internal.theme || 'sakura';
    const pt = s.forum.posterTypes || defaultSettings.forum.posterTypes;

    const themeCards = Object.entries(THEME_ACCENTS).map(([key, acc]) => `
      <div class="lumi-theme-card${currentTheme === key ? ' selected' : ''}" data-accent="${key}"
           style="border-color:${currentTheme === key ? acc.lp : 'var(--lborder)'};">
        <div class="lumi-theme-dot" style="background:${acc.lgrad};box-shadow:0 0 8px ${acc.lp}55;"></div>
        <span class="lumi-theme-label">${acc.label}</span>
      </div>`).join('');

    body.html(`<div style="padding:10px 12px 24px;">

    <div class="lumi-form-card">
      <div class="lumi-form-title">Appearance</div>
      <div class="lumi-label" style="margin-bottom:7px;">สี Accent</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:12px;">
        ${themeCards}
      </div>
      <div class="lumi-set-row">
        <span>พื้นหลัง</span>
        <div class="lumi-cm-toggle">
          <span style="font-size:10px;color:var(--lsub);">${I.sun}</span>
          <div class="lumi-cm-track${cm === 'dark' ? ' dark-mode' : ''}" id="cm-track" style="margin:0 5px;">
            <div class="lumi-cm-thumb">${cm === 'dark' ? I.moon : I.sun}</div>
          </div>
          <span style="font-size:10px;color:var(--lsub);">${I.moon}</span>
        </div>
      </div>
      <div class="lumi-set-row"><span>ขนาดปุ่มลอย</span>
        <select id="fab-size" style="background:var(--linput);border:1px solid var(--lborder);border-radius:7px;padding:4px 7px;color:var(--ltext);font-family:var(--lfont);outline:none;font-size:11px;">
          <option value="36" ${(s._internal.fabSize || 42) === 36 ? 'selected' : ''}>เล็ก (36px)</option>
          <option value="42" ${(s._internal.fabSize || 42) === 42 ? 'selected' : ''}>กลาง (42px)</option>
          <option value="50" ${(s._internal.fabSize || 42) === 50 ? 'selected' : ''}>ใหญ่ (50px)</option>
        </select>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">${I.api} Custom API</div>
      <div class="lumi-set-row"><span>ใช้ Custom API</span><input type="checkbox" id="api-en" ${api.enabled ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div id="api-cfg" style="display:${api.enabled ? 'block' : 'none'};">
        <div style="margin:7px 0 5px;">
          <label class="lumi-label">Provider</label>
          <select id="api-provider" class="lumi-select" style="width:100%;box-sizing:border-box;">
            <option value="openai" ${api.provider === 'openai' ? 'selected' : ''}>OpenAI / Compatible</option>
            <option value="anthropic" ${api.provider === 'anthropic' ? 'selected' : ''}>Anthropic Claude</option>
            <option value="google" ${api.provider === 'google' ? 'selected' : ''}>Google Gemini</option>
          </select>
        </div>
        <div id="url-row" style="margin-bottom:5px;display:${api.provider === 'google' || api.provider === 'anthropic' ? 'none' : 'block'};">
          <label class="lumi-label">Base URL</label>
          <input type="text" id="api-url" value="${esc(api.baseUrl || '')}" class="lumi-input" placeholder="https://api.openai.com/v1">
        </div>
        <div style="margin-bottom:5px;">
          <label class="lumi-label">API Key</label>
          <div class="lumi-api-key-row">
            <input type="password" id="api-key" value="${esc(api.apiKey || '')}" class="lumi-input" placeholder="sk-... / AIza... / sk-ant-...">
            <div class="lumi-api-dot ${api.apiKey ? 'dot-ok' : 'dot-idle'}" id="api-dot"></div>
          </div>
        </div>
        <div style="margin-bottom:5px;">
          <label class="lumi-label">Model</label>
          <div style="display:flex;gap:5px;">
            <input type="text" id="api-model" value="${esc(api.model || '')}" class="lumi-input" style="flex:1;font-size:11px;" placeholder="gpt-4o-mini">
            <button id="btn-fetch-models" class="lumi-sm-btn" title="โหลดรายการ Models">${I.refresh}</button>
          </div>
          <div id="model-dropdown-wrap" class="lumi-model-select-wrap" style="display:none;margin-top:5px;">
            <select id="model-dropdown" class="lumi-model-dropdown"><option>กำลังโหลด...</option></select>
          </div>
        </div>
        <div style="margin-bottom:8px;">
          <label class="lumi-label">Max Tokens</label>
          <input type="number" id="api-tokens" value="${api.maxTokens || 900}" min="100" max="4000" class="lumi-input" style="font-size:12px;">
        </div>
        <button id="btn-test-api" class="lumi-btn">${I.api} ทดสอบการเชื่อมต่อ</button>
        <div id="api-test-result" style="margin-top:5px;font-size:10px;color:var(--lsub);"></div>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">ทั่วไป</div>
      <div class="lumi-set-row"><span>เปิดใช้งาน</span><input type="checkbox" id="set-en" ${s.isEnabled ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>World Mode</span><select id="set-wm"><option value="auto" ${s.diary.worldMode === 'auto' ? 'selected' : ''}>Auto</option><option value="solo" ${s.diary.worldMode === 'solo' ? 'selected' : ''}>Solo</option><option value="rpg" ${s.diary.worldMode === 'rpg' ? 'selected' : ''}>RPG</option></select></div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Diary Auto-Gen</div>
      <div class="lumi-set-row"><span>เปิดใช้</span><input type="checkbox" id="ag-en" ${ag.enabled ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="ag-tr"><option value="turn_count" ${ag.triggerType === 'turn_count' ? 'selected' : ''}>ทุก X ข้อความ</option><option value="emotion" ${ag.triggerType === 'emotion' ? 'selected' : ''}>คำอารมณ์</option><option value="random" ${ag.triggerType === 'random' ? 'selected' : ''}>สุ่ม</option></select></div>
      ${ag.triggerType === 'turn_count' ? `<div class="lumi-set-row"><span>ทุกกี่ข้อความ</span><input type="number" id="ag-int" value="${ag.turnInterval}" min="5" max="100" style="width:55px;"></div>` : ''}
      ${ag.triggerType === 'random' ? `<div class="lumi-set-row"><span>โอกาส %</span><input type="number" id="ag-chance" value="${Math.round(ag.randomChance * 100)}" min="1" max="50" style="width:55px;"></div>` : ''}
      ${ag.triggerType === 'emotion' ? `<div class="lumi-set-row" style="flex-direction:column;align-items:flex-start;gap:4px;"><span>คีย์เวิร์ด (คั่นด้วยจุลภาค)</span><input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" style="width:100%;box-sizing:border-box;font-size:11px;background:var(--linput);border:1px solid var(--lborder);border-radius:7px;padding:4px 7px;color:var(--ltext);outline:none;"></div>` : ''}
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Forum Auto-Gen</div>
      <div class="lumi-set-row"><span>Forum เปิดใช้</span><input type="checkbox" id="forum-en" ${s.forum.enabled ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Auto-gen เปิดใช้</span><input type="checkbox" id="forum-ag-en" ${fg.enabled ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="forum-tr"><option value="turn_count" ${fg.triggerType === 'turn_count' ? 'selected' : ''}>ทุก X ข้อความ</option><option value="time_interval" ${fg.triggerType === 'time_interval' ? 'selected' : ''}>ทุก X นาที</option><option value="random" ${fg.triggerType === 'random' ? 'selected' : ''}>สุ่ม</option></select></div>
      ${fg.triggerType === 'turn_count' ? `<div class="lumi-set-row"><span>ทุกกี่ข้อความ</span><input type="number" id="forum-int" value="${fg.turnInterval}" min="3" max="100" style="width:55px;"></div>` : ''}
      ${fg.triggerType === 'time_interval' ? `<div class="lumi-set-row"><span>ทุกกี่นาที</span><input type="number" id="forum-time" value="${fg.timeInterval}" min="1" max="60" style="width:55px;"></div>` : ''}
      ${fg.triggerType === 'random' ? `<div class="lumi-set-row"><span>โอกาส %</span><input type="number" id="forum-chance" value="${Math.round(fg.randomChance * 100)}" min="1" max="50" style="width:55px;"></div>` : ''}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--lborder);">
        <div class="lumi-form-title" style="margin-bottom:6px;">ใครโพสต์ได้บ้าง</div>
        <div class="lumi-set-row"><span>ตัวละครหลัก</span><input type="checkbox" id="pt-main" ${pt.mainChars ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>NPC (AI สร้างชื่อ)</span><input type="checkbox" id="pt-npc" ${pt.npcs ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>ประชาชน (สาธารณะ)</span><input type="checkbox" id="pt-cit" ${pt.citizens ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>ข่าว/ประกาศ</span><input type="checkbox" id="pt-news" ${pt.news ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--lp);"></div>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">ข้อมูล</div>
      <div style="display:flex;gap:7px;">
        <button id="btn-rst" class="lumi-sm-btn" style="flex:1;justify-content:center;">${I.refresh} รีเซ็ตปุ่ม</button>
        <button id="btn-clr" class="lumi-sm-btn lumi-danger-btn" style="flex:1;justify-content:center;">${I.trash} ล้างทั้งหมด</button>
      </div>
    </div>
    </div>`);

    // ── Appearance events ──────────────────────────────────────
    $('[data-accent]').on('click', function() {
        const key = $(this).data('accent');
        const acc = THEME_ACCENTS[key];
        EXT._internal.theme = key;
        save();
        applyColorMode(EXT._internal.colorMode || 'dark', key);
        // อัปเดต UI card ทันที ไม่ต้อง re-render ทั้งหน้า
        $('[data-accent]').each(function() {
            const k = $(this).data('accent');
            const a = THEME_ACCENTS[k];
            $(this).toggleClass('selected', k === key);
            $(this).css('border-color', k === key ? a.lp : 'var(--lborder)');
            $(this).find('.lumi-theme-label').css('color', k === key ? a.lp : '');
        });
    });

    $('#cm-track').on('click', function() {
        const newMode = EXT._internal.colorMode === 'dark' ? 'light' : 'dark';
        EXT._internal.colorMode = newMode;
        save();
        applyColorMode(newMode, EXT._internal.theme || 'sakura');
        $(this).toggleClass('dark-mode', newMode === 'dark');
        $(this).find('.lumi-cm-thumb').html(newMode === 'dark' ? I.moon : I.sun);
    });

    $('#fab-size').on('change', function() {
        const sz = parseInt($(this).val()) || 42;
        EXT._internal.fabSize = sz; save();
        $('#lumi-fab').css({ width: sz + 'px', height: sz + 'px' });
    });

    // ── API events ─────────────────────────────────────────────
    $('#api-en').on('change', function() { EXT.api.enabled = $(this).prop('checked'); save(); $('#api-cfg').toggle(EXT.api.enabled); });
    $('#api-provider').on('change', function() { EXT.api.provider = $(this).val(); save(); $('#url-row').toggle(EXT.api.provider !== 'google' && EXT.api.provider !== 'anthropic'); $('#model-dropdown-wrap').hide(); });
    $('#api-url').on('change', function() { EXT.api.baseUrl = $(this).val(); save(); });
    $('#api-key').on('change', function() { EXT.api.apiKey = $(this).val(); save(); $('#api-dot').attr('class', 'lumi-api-dot ' + (EXT.api.apiKey ? 'dot-ok' : 'dot-idle')); });
    $('#api-model').on('change', function() { EXT.api.model = $(this).val(); save(); });
    $('#api-tokens').on('change', function() { EXT.api.maxTokens = parseInt($(this).val()) || 900; save(); });

    $('#btn-fetch-models').on('click', async function() {
        const $btn = $(this);
        $btn.html(`<span class="lumi-spin lumi-spin-p"></span>`).prop('disabled', true);
        try {
            const models = await fetchAvailableModels();
            if (models && models.length) {
                const opts = models.map(m => `<option value="${esc(m)}"${m === EXT.api.model ? ' selected' : ''}>${esc(m)}</option>`).join('');
                $('#model-dropdown').html(opts);
                $('#model-dropdown-wrap').show();
                $('#model-dropdown').on('change', function() { $('#api-model').val($(this).val()); EXT.api.model = $(this).val(); save(); });
                toast(`✓ โหลด ${models.length} models`);
            }
        } catch (e) { toast('โหลด models ไม่ได้: ' + e.message, 'err'); }
        $btn.html(I.refresh).prop('disabled', false);
    });

    $('#btn-test-api').on('click', async function() {
        const $btn = $(this); $btn.html(`<span class="lumi-spin"></span> ทดสอบ...`).prop('disabled', true);
        try {
            const res = await callCustomAPI('Reply with only the word "OK".', 'Reply with one word only.');
            if (res) { $('#api-test-result').html(`<span style="color:#34D399;">✓ เชื่อมต่อสำเร็จ: "${esc(res.trim().slice(0, 40))}"</span>`); $('#api-dot').attr('class', 'lumi-api-dot dot-ok'); }
            else { $('#api-test-result').html(`<span style="color:var(--ldanger);">✗ ไม่มีข้อมูลตอบกลับ</span>`); $('#api-dot').attr('class', 'lumi-api-dot dot-err'); }
        } catch (e) { $('#api-test-result').html(`<span style="color:var(--ldanger);">✗ ${esc(e.message.slice(0, 80))}</span>`); $('#api-dot').attr('class', 'lumi-api-dot dot-err'); }
        $btn.html(`${I.api} ทดสอบการเชื่อมต่อ`).prop('disabled', false);
    });

    // ── General events ─────────────────────────────────────────
    $('#set-en').on('change', function() { EXT.isEnabled = $(this).prop('checked'); save(); });
    $('#set-wm').on('change', function() { EXT.diary.worldMode = $(this).val(); save(); });
    $('#ag-en').on('change', function() { EXT.diary.autoGen.enabled = $(this).prop('checked'); save(); });
    $('#ag-tr').on('change', function() { EXT.diary.autoGen.triggerType = $(this).val(); save(); renderSettings(); });
    $('#ag-int').on('change', function() { EXT.diary.autoGen.turnInterval = parseInt($(this).val()) || 20; save(); });
    $('#ag-chance').on('change', function() { EXT.diary.autoGen.randomChance = (parseInt($(this).val()) || 10) / 100; save(); });
    $('#ag-kw').on('change', function() { EXT.diary.autoGen.emotionKeywords = $(this).val().split(',').map(k => k.trim()).filter(Boolean); save(); });
    $('#forum-en').on('change', function() { EXT.forum.enabled = $(this).prop('checked'); save(); });
    $('#forum-ag-en').on('change', function() { EXT.forum.autoGen.enabled = $(this).prop('checked'); save(); });
    $('#forum-tr').on('change', function() { EXT.forum.autoGen.triggerType = $(this).val(); save(); renderSettings(); });
    $('#forum-int').on('change', function() { EXT.forum.autoGen.turnInterval = parseInt($(this).val()) || 8; save(); });
    $('#forum-time').on('change', function() { EXT.forum.autoGen.timeInterval = parseInt($(this).val()) || 5; save(); });
    $('#forum-chance').on('change', function() { EXT.forum.autoGen.randomChance = (parseInt($(this).val()) || 15) / 100; save(); });
    $('#pt-main').on('change', function() { EXT.forum.posterTypes.mainChars = $(this).prop('checked'); save(); });
    $('#pt-npc').on('change', function() { EXT.forum.posterTypes.npcs = $(this).prop('checked'); save(); });
    $('#pt-cit').on('change', function() { EXT.forum.posterTypes.citizens = $(this).prop('checked'); save(); });
    $('#pt-news').on('change', function() { EXT.forum.posterTypes.news = $(this).prop('checked'); save(); });
    $('#btn-rst').on('click', () => { EXT._internal.fabPos = null; save(); $('#lumi-fab').remove(); spawnFAB(); toast('✓ รีเซ็ตปุ่มแล้ว'); });
    $('#btn-clr').on('click', () => { if (confirm('ล้างความทรงจำและโพสต์ทั้งหมด?')) { EXT.memories = []; EXT.forumPosts = {}; EXT._internal.nameRegistry = {}; save(); toast('✓ ล้างข้อมูลแล้ว'); } });
}

// ════════════════════════════════════════════════════════════
// SETTINGS PANEL (ST Sidebar)
// ════════════════════════════════════════════════════════════
function createSettingsPanel() {
    if ($('#lumi-panel').length) return;
    $('#extensions_settings').append(`<div id="lumi-panel" class="inline-drawer">
      <div class="inline-drawer-toggle inline-drawer-header">
        <b style="font-family:var(--lfont);color:var(--lp);font-weight:600;">LumiPulse v6</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content" style="display:none;padding:10px;font-family:var(--lfont);"></div>
    </div>`);
}

// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════
const exportText = (c, f) => { const b = new Blob([c], { type: 'text/markdown' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = f; a.click(); URL.revokeObjectURL(u); toast('✓ Export แล้ว'); };
const exportJSON = (d, f) => { const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = f; a.click(); URL.revokeObjectURL(u); toast('✓ Export แล้ว'); };
