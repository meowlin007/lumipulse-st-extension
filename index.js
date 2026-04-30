"use strict";
// ═══════════════════════════════════════════════════════════
// LUMIPULSE v6  —  SillyTavern Extension
// ═══════════════════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    forumPosts: {},          // { [botId]: Post[] }
    forumNotify: {},         // { [botId]: boolean } — unread flag
    _internal: {
        fabPos: null, theme: 'light',
        nameRegistry: {},
        filterChar: '', filterDate: '', filterLoc: '',
        forumMsgCounter: 0, lastForumGenTime: 0,
        diaryMsgCounter: 0
    },
    api: {
        enabled: false,
        provider: 'openai',   // 'openai' | 'anthropic' | 'google'
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: '',
        maxTokens: 900
    },
    diary: {
        worldMode: 'auto',
        display: { secretMode: 'time', showSecretSystem: false },
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','กลัว'], randomChance: 0.08 },
        storage: { max: 150 }
    },
    forum: {
        enabled: true,
        autoReactOnRP: true,   // react to player posts after each RP turn
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 8, timeInterval: 5, randomChance: 0.15 },
        storage: { max: 300 },
        posterTypes: { mainChars: true, npcs: true, citizens: true, news: true }
    }
};

let EXT = {};

// ── Assets ─────────────────────────────────────────────────
const ASSETS = {
    fab:      "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png",
    diary:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png",
    forum:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png",
    settings: "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png"
};

// ── SVG Icons ───────────────────────────────────────────────
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
    link:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    pin:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`,
    trash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    tag:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    cal:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    pin2:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    lock:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    mood:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    scroll:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    key:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
    img:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    music:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    news:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>`,
    bell:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    bellF:   `<svg viewBox="0 0 24 24" fill="#FF6B9D" stroke="#FF6B9D" stroke-width="2" width="13" height="13"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    edit:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    sun:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
};

// ── Themes: light / dark ────────────────────────────────────
const THEMES = {
    light: {
        bg:'#FDF7FF', card:'#FFFFFF', border:'#F0E6FF',
        text:'#2D2040', sub:'#8B7BA8', input:'#F8F2FF',
        p:'#D64FAB', s:'#B83D8F', a:'rgba(214,79,171,0.10)',
        grad:'linear-gradient(135deg,#F472B6,#D64FAB)',
        tag:'#FCE7F3', tagText:'#9D174D',
        shadow:'0 4px 20px rgba(214,79,171,0.12)',
        navBg:'#FFFFFF', heroBg:'linear-gradient(135deg,#F9A8D4,#D64FAB)',
    },
    dark: {
        bg:'#100C1A', card:'#1E1730', border:'rgba(214,79,171,0.2)',
        text:'#EDE0FF', sub:'#8B7BA8', input:'#160F26',
        p:'#F472B6', s:'#EC4899', a:'rgba(244,114,182,0.12)',
        grad:'linear-gradient(135deg,#F472B6,#EC4899)',
        tag:'rgba(244,114,182,0.15)', tagText:'#FBCFE8',
        shadow:'0 4px 20px rgba(0,0,0,0.4)',
        navBg:'#1E1730', heroBg:'linear-gradient(135deg,#BE185D,#9D174D)',
    }
};

function applyTheme(n) {
    const t = THEMES[n] || THEMES.light;
    const r = document.documentElement;
    Object.entries({
        '--lbg':t.bg,'--lcard':t.card,'--lborder':t.border,
        '--ltext':t.text,'--lsub':t.sub,'--linput':t.input,
        '--lp':t.p,'--ls':t.s,'--la':t.a,'--lgrad':t.grad,
        '--ltag':t.tag,'--ltagtext':t.tagText,'--lshadow':t.shadow,
        '--lnav':t.navBg,'--lhero':t.heroBg
    }).forEach(([k,v])=>r.style.setProperty(k,v));
}

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext && document.body) {
            clearInterval(boot); initLumiPulse();
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
        if (Array.isArray(s.forumPosts)) s.forumPosts = {};
        if (!s.forumPosts) s.forumPosts = {};
        if (!s.forumNotify) s.forumNotify = {};
        if (!s.forum.posterTypes) s.forum.posterTypes = { mainChars:true, npcs:true, citizens:true, news:true };
        if (typeof s.forum.autoReactOnRP === 'undefined') s.forum.autoReactOnRP = true;
        ['forumMsgCounter','lastForumGenTime','diaryMsgCounter'].forEach(k => {
            if (typeof s._internal[k] === 'undefined') s._internal[k] = 0;
        });
    }
    ctx.saveSettingsDebounced();
    EXT = ctx.extensionSettings[extensionName];
    applyTheme(EXT._internal.theme || 'light');
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

// ── Helpers ─────────────────────────────────────────────────
const getBotId = () => SillyTavern.getContext().characterId || '__default__';
const getBotPosts = () => { const b=getBotId(); if(!EXT.forumPosts[b]) EXT.forumPosts[b]=[]; return EXT.forumPosts[b]; };
const savePosts = (arr) => { EXT.forumPosts[getBotId()]=arr.slice(-(EXT.forum.storage.max||300)); save(); };
const save = () => SillyTavern.getContext().saveSettingsDebounced();
const esc = (s) => { if(typeof s!=='string') return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); };
const colorOf = (str) => {
    const c=['#F472B6','#A78BFA','#34D399','#60A5FA','#FB923C','#E879F9','#FBBF24','#4ADE80'];
    let h=0; for(let i=0;i<(str||'').length;i++) h=str.charCodeAt(i)+((h<<5)-h);
    return c[Math.abs(h)%c.length];
};
const timeAgo = (d) => {
    const s=Math.floor((Date.now()-new Date(d))/1000);
    if(s<60) return 'just now'; if(s<3600) return Math.floor(s/60)+'m ago';
    if(s<86400) return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago';
};
const toast = (msg, type='ok') => {
    $('.lumi-toast').remove();
    $('body').append(`<div class="lumi-toast lumi-toast-${type}">${msg}</div>`);
    setTimeout(()=>$('.lumi-toast').fadeOut(300,()=>$('.lumi-toast').remove()), 2500);
};

// ── Similarity ───────────────────────────────────────────────
function simScore(a,b){
    a=(a||'').toLowerCase().trim(); b=(b||'').toLowerCase().trim();
    if(!a.length||!b.length) return 0;
    const dp=Array(a.length+1).fill(null).map((_,i)=>Array(b.length+1).fill(0).map((_,j)=>i||j));
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
        dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
    return((Math.max(a.length,b.length)-dp[a.length][b.length])/Math.max(a.length,b.length))*100;
}

// ── Robust JSON extractor ────────────────────────────────────
function extractJSON(raw, type='array') {
    if (!raw || typeof raw !== 'string') return null;
    let s = raw
        .replace(/<think>[\s\S]*?<\/think>/gi,'')
        .replace(/```json\s*/g,'').replace(/```\s*/g,'')
        .trim();
    const o=type==='array'?'[':'{', c=type==='array'?']':'}';
    const start=s.indexOf(o); if(start===-1) return null;
    let depth=0, end=-1;
    for(let i=start;i<s.length;i++){
        if(s[i]===o) depth++; else if(s[i]===c){depth--;if(depth===0){end=i;break;}}
    }
    if(end===-1) return null;
    try { return JSON.parse(s.slice(start,end+1)); } catch(e){ return null; }
}

// ═══════════════════════════════════════════════════════════
// CUSTOM API LAYER
// ═══════════════════════════════════════════════════════════
async function callAI(prompt, systemPrompt='') {
    const ctx = SillyTavern.getContext();
    if (EXT.api.enabled && EXT.api.apiKey && EXT.api.model) {
        try { return await callCustomAPI(prompt, systemPrompt); }
        catch(e) { console.warn('[LumiPulse] Custom API failed, fallback:', e.message); }
    }
    // SillyTavern fallback
    const full = systemPrompt ? systemPrompt+'\n\n'+prompt : prompt;
    let res;
    if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(full, false, false);
    else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(full, true);
    return res || '';
}

async function callCustomAPI(prompt, systemPrompt) {
    const cfg = EXT.api;
    let url, headers, body;
    if (cfg.provider === 'anthropic') {
        url = (cfg.baseUrl||'https://api.anthropic.com') + '/v1/messages';
        headers = { 'Content-Type':'application/json','x-api-key':cfg.apiKey,'anthropic-version':'2023-06-01' };
        body = JSON.stringify({ model:cfg.model, max_tokens:cfg.maxTokens||900, system:systemPrompt||'You are a helpful assistant.', messages:[{role:'user',content:prompt}] });
    } else if (cfg.provider === 'google') {
        const model = cfg.model||'gemini-1.5-flash';
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cfg.apiKey}`;
        headers = { 'Content-Type':'application/json' };
        body = JSON.stringify({ contents:[{parts:[{text:(systemPrompt?systemPrompt+'\n\n':'')+prompt}]}], generationConfig:{maxOutputTokens:cfg.maxTokens||900} });
    } else {
        url = (cfg.baseUrl||'https://api.openai.com/v1') + '/chat/completions';
        headers = { 'Content-Type':'application/json','Authorization':`Bearer ${cfg.apiKey}` };
        const msgs = [];
        if (systemPrompt) msgs.push({role:'system',content:systemPrompt});
        msgs.push({role:'user',content:prompt});
        body = JSON.stringify({ model:cfg.model, max_tokens:cfg.maxTokens||900, messages:msgs });
    }
    const resp = await fetch(url, {method:'POST', headers, body});
    if (!resp.ok) { const err=await resp.text(); throw new Error(`${resp.status}: ${err.slice(0,120)}`); }
    const data = await resp.json();
    if (cfg.provider==='anthropic') return data.content?.[0]?.text||'';
    if (cfg.provider==='google') return data.candidates?.[0]?.content?.parts?.[0]?.text||'';
    return data.choices?.[0]?.message?.content||'';
}

// Fetch available models from base URL
async function fetchAvailableModels() {
    const cfg = EXT.api;
    if (!cfg.apiKey) throw new Error('No API key');
    let url, headers;
    if (cfg.provider === 'anthropic') {
        url = (cfg.baseUrl||'https://api.anthropic.com') + '/v1/models';
        headers = { 'x-api-key':cfg.apiKey, 'anthropic-version':'2023-06-01' };
    } else if (cfg.provider === 'google') {
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cfg.apiKey}`;
        headers = {};
    } else {
        url = (cfg.baseUrl||'https://api.openai.com/v1') + '/models';
        headers = { 'Authorization':`Bearer ${cfg.apiKey}` };
    }
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`${resp.status}`);
    const data = await resp.json();
    if (cfg.provider === 'anthropic') return (data.data||[]).map(m=>m.id);
    if (cfg.provider === 'google') return (data.models||[]).filter(m=>m.supportedGenerationMethods?.includes('generateContent')).map(m=>m.name.replace('models/',''));
    return (data.data||[]).map(m=>m.id).filter(id=>id.includes('gpt')||id.includes('claude')||id.includes('gemini')||id.includes('llama')||id.includes('mistral'));
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const el = document.createElement('style'); el.id='lumi-styles';
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
:root{
  --lbg:#FDF7FF;--lcard:#FFF;--lborder:#F0E6FF;--ltext:#2D2040;--lsub:#8B7BA8;--linput:#F8F2FF;
  --lp:#D64FAB;--ls:#B83D8F;--la:rgba(214,79,171,0.10);--lgrad:linear-gradient(135deg,#F472B6,#D64FAB);
  --ltag:#FCE7F3;--ltagtext:#9D174D;--lshadow:0 4px 20px rgba(214,79,171,0.12);
  --lnav:#fff;--lhero:linear-gradient(135deg,#F9A8D4,#D64FAB);
  --ff:'DM Sans','Noto Sans Thai',sans-serif;
}
@keyframes lumiIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.45)}100%{transform:scale(1)}}
@keyframes dotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes postSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes notifyPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}

/* FAB */
#lumi-fab{
  position:fixed;z-index:99999;width:42px;height:42px;border-radius:50%;
  background:var(--lcard) url("${ASSETS.fab}") no-repeat center/22px;
  border:1.5px solid var(--lborder);box-shadow:var(--lshadow);
  cursor:grab;touch-action:none;user-select:none;transition:transform .18s,box-shadow .2s;
}
#lumi-fab:hover{box-shadow:0 6px 24px rgba(214,79,171,0.25);transform:scale(1.06);}
#lumi-fab:active{transform:scale(.91);cursor:grabbing;}
.lumi-fab-dot{
  position:absolute;top:0px;right:0px;width:10px;height:10px;border-radius:50%;
  background:#FF4757;border:2px solid var(--lcard);display:none;
  animation:notifyPulse 1.5s infinite;
}
.lumi-fab-dot.show{display:block;}

/* Menu */
.lumi-menu{
  position:fixed;z-index:99998;display:none;
  background:var(--lcard);border-radius:18px;padding:14px;
  border:1px solid var(--lborder);box-shadow:var(--lshadow);
  font-family:var(--ff);min-width:180px;
}
.lumi-menu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.lumi-menu-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:10px 6px;border-radius:12px;border:1px solid transparent;transition:.15s;}
.lumi-menu-item:hover{background:var(--la);border-color:var(--lborder);}
.lumi-menu-item img{width:34px;height:34px;object-fit:contain;}
.lumi-menu-item span{font-size:10px;color:var(--lsub);font-weight:500;}
.lumi-menu-item.has-notify{position:relative;}
.lumi-menu-item.has-notify::after{content:'';position:absolute;top:6px;right:12px;width:8px;height:8px;border-radius:50%;background:#FF4757;border:1.5px solid var(--lcard);}

/* Overlay & Modal */
.lumi-overlay{position:fixed;top:0;left:0;width:100vw;height:100dvh;background:rgba(0,0,0,0.35);backdrop-filter:blur(8px);z-index:100000;display:none;align-items:center;justify-content:center;}
.lumi-modal{width:94%;max-width:480px;height:91dvh;background:var(--lbg);border-radius:24px;border:1px solid var(--lborder);box-shadow:var(--lshadow);display:flex;flex-direction:column;overflow:hidden;font-family:var(--ff);animation:lumiIn .26s cubic-bezier(.34,1.46,.64,1);color:var(--ltext);}
.lumi-head{padding:13px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--lborder);background:var(--lnav);flex-shrink:0;}
.lumi-head-title{font-size:15px;color:var(--lp);font-weight:700;flex:1;text-align:center;letter-spacing:-.2px;}
.lumi-icon-btn{width:30px;height:30px;border-radius:50%;background:var(--la);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--lsub);transition:.15s;flex-shrink:0;}
.lumi-icon-btn:hover{background:var(--lborder);color:var(--ltext);}
.lumi-body{flex:1;overflow-y:auto;background:var(--lbg);scrollbar-width:thin;scrollbar-color:var(--lborder) transparent;}
.lumi-body::-webkit-scrollbar{width:3px;}
.lumi-body::-webkit-scrollbar-thumb{background:var(--lborder);border-radius:2px;}

/* Nav Tabs */
.lumi-nav{display:flex;gap:4px;padding:8px 12px 0;background:var(--lnav);flex-shrink:0;}
.lumi-tab{flex:1;text-align:center;padding:9px 4px 10px;border-radius:10px 10px 0 0;color:var(--lsub);font-size:11px;font-weight:600;cursor:pointer;transition:.15s;display:flex;align-items:center;justify-content:center;gap:4px;position:relative;}
.lumi-tab::after{content:'';position:absolute;bottom:-1px;left:10%;right:10%;height:2px;background:transparent;border-radius:2px;transition:.2s;}
.lumi-tab.active{color:var(--lp);}
.lumi-tab.active::after{background:var(--lp);}
.lumi-tab:hover:not(.active){background:var(--la);}

/* Hero */
.lumi-hero{background:var(--lhero);padding:18px 16px 14px;position:relative;overflow:hidden;}
.lumi-hero::before{content:'';position:absolute;top:-30px;right:-25px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.1);}
.lumi-hero-eye{font-size:10px;color:rgba(255,255,255,.8);letter-spacing:.8px;text-transform:uppercase;margin-bottom:3px;}
.lumi-hero-title{font-size:21px;font-weight:800;color:#fff;letter-spacing:-.4px;position:relative;}
.lumi-hero-sub{font-size:11px;color:rgba(255,255,255,.75);margin-top:3px;}

/* Stats */
.lumi-stats{display:flex;gap:8px;padding:10px 14px;}
.lumi-stat{flex:1;text-align:center;background:var(--lcard);border:1px solid var(--lborder);border-radius:14px;padding:10px 5px;box-shadow:var(--lshadow);}
.lumi-stat b{display:block;font-size:19px;color:var(--lp);font-weight:800;line-height:1.1;}
.lumi-stat span{font-size:9px;color:var(--lsub);text-transform:uppercase;letter-spacing:.4px;}

/* Form components */
.lumi-section{padding:12px 14px 2px;}
.lumi-form-card{background:var(--lcard);border:1px solid var(--lborder);border-radius:16px;padding:14px;margin-bottom:12px;box-shadow:var(--lshadow);}
.lumi-form-title{font-size:10px;font-weight:700;color:var(--lsub);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;}
.lumi-label{font-size:10px;color:var(--lsub);display:block;margin-bottom:5px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;}
.lumi-input{width:100%;background:var(--linput);border:1px solid var(--lborder);border-radius:10px;padding:9px 12px;color:var(--ltext);font-family:var(--ff);font-size:13px;outline:none;box-sizing:border-box;transition:.15s;}
.lumi-input:focus{border-color:var(--lp);box-shadow:0 0 0 3px var(--la);}
.lumi-textarea{min-height:65px;resize:none;max-height:140px;}
.lumi-select{background:var(--linput);border:1px solid var(--lborder);border-radius:10px;padding:8px 10px;color:var(--ltext);font-family:var(--ff);font-size:12px;outline:none;cursor:pointer;}
.lumi-set-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--lborder);font-size:12px;color:var(--lsub);}
.lumi-set-row:last-child{border-bottom:none;}
.lumi-set-row select,.lumi-set-row input[type=number]{background:var(--linput);border:1px solid var(--lborder);border-radius:8px;padding:5px 8px;color:var(--ltext);font-family:var(--ff);outline:none;font-size:12px;}
.lumi-btn{background:var(--lgrad);color:#fff;border:none;padding:10px 16px;border-radius:20px;font-family:var(--ff);font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;width:100%;transition:.2s;box-shadow:0 4px 12px rgba(214,79,171,0.25);}
.lumi-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(214,79,171,0.35);}
.lumi-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.lumi-sm-btn{background:var(--la);color:var(--lp);border:1px solid var(--lborder);padding:7px 13px;border-radius:14px;font-family:var(--ff);font-weight:600;cursor:pointer;font-size:11px;display:flex;align-items:center;gap:5px;transition:.15s;white-space:nowrap;}
.lumi-sm-btn:hover{background:var(--lborder);}
.lumi-sm-btn:disabled{opacity:.5;cursor:not-allowed;}
.lumi-danger-btn{background:rgba(255,71,87,.08);color:#FF4757;border-color:rgba(255,71,87,.25);}
.lumi-danger-btn:hover{background:rgba(255,71,87,.14);}
.lumi-badge{font-size:10px;padding:2px 8px;border-radius:6px;background:var(--ltag);color:var(--ltagtext);display:inline-flex;align-items:center;gap:3px;font-weight:500;}
.lumi-empty{text-align:center;padding:44px 20px;}
.lumi-empty-icon{font-size:42px;margin-bottom:12px;opacity:.3;}
.lumi-empty-text{font-size:13px;color:var(--lsub);line-height:1.65;}

/* Toast */
.lumi-toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);padding:9px 18px;border-radius:18px;z-index:999999;font-family:var(--ff);font-size:12px;font-weight:600;animation:lumiIn .22s;pointer-events:none;white-space:nowrap;}
.lumi-toast-ok{background:var(--lcard);border:1px solid var(--lborder);color:var(--ltext);box-shadow:var(--lshadow);}
.lumi-toast-err{background:#FFF0F1;border:1px solid #FFB3B8;color:#FF4757;}

/* Spinner */
.lumi-spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-radius:50%;border-top-color:#fff;animation:spin .7s linear infinite;}
.lumi-spin-c{border-color:var(--la);border-top-color:var(--lp);}

/* Diary cards */
.lumi-diary-pad{padding:10px 14px 16px;}
.lumi-tl-sep{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--lsub);font-weight:700;letter-spacing:.7px;text-transform:uppercase;padding:8px 0 5px;}
.lumi-tl-sep::after{content:'';flex:1;height:1px;background:var(--lborder);}
.lumi-card{background:var(--lcard);border:1px solid var(--lborder);border-radius:16px;padding:13px;margin-bottom:9px;box-shadow:var(--lshadow);animation:fadeUp .28s ease;}
.lumi-card:hover{box-shadow:0 8px 24px rgba(214,79,171,0.15);}
.lumi-card-hd{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.lumi-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0;}
.lumi-av-sm{width:24px;height:24px;font-size:10px;}
.lumi-av-xs{width:20px;height:20px;font-size:9px;}
.lumi-char-name{font-size:13px;font-weight:700;color:var(--ltext);flex:1;}
.lumi-card-meta{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:7px;}
.lumi-card-body{font-size:13px;color:var(--ltext);line-height:1.65;white-space:pre-wrap;margin:0 0 10px;}
.lumi-card-foot{display:flex;gap:5px;justify-content:flex-end;padding-top:8px;border-top:1px solid var(--lborder);}
.lumi-act{background:none;border:1px solid transparent;border-radius:8px;cursor:pointer;color:var(--lsub);transition:.15s;padding:4px 8px;font-size:11px;display:flex;align-items:center;gap:4px;font-family:var(--ff);}
.lumi-act:hover{background:var(--la);border-color:var(--lborder);color:var(--lp);}
.lumi-act.act-on{color:var(--lp);background:var(--la);}
.lumi-act.act-del:hover{background:rgba(255,71,87,.08);color:#FF4757;}

/* ── FORUM STYLES ────────────────────────────────────── */
.lumi-reload-bar{display:flex;gap:7px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--lborder);background:var(--lnav);flex-shrink:0;}
.lumi-reload-btn{flex:1;background:var(--la);border:1px solid var(--lborder);border-radius:12px;padding:8px 10px;cursor:pointer;font-size:11px;font-family:var(--ff);color:var(--lp);transition:.18s;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:700;}
.lumi-reload-btn:hover{background:var(--lborder);}
.lumi-reload-btn:disabled{opacity:.5;cursor:not-allowed;}

.lumi-compose{margin:10px 12px 6px;background:var(--lcard);border:1px solid var(--lborder);border-radius:18px;padding:13px;box-shadow:var(--lshadow);}
.lumi-compose-row{display:flex;align-items:center;gap:9px;margin-bottom:8px;}
.lumi-compose-footer{display:flex;gap:7px;align-items:center;margin-top:8px;flex-wrap:wrap;}
.lumi-img-preview{width:100%;border-radius:12px;max-height:200px;object-fit:cover;margin-top:8px;border:1px solid var(--lborder);}
.lumi-img-preview-wrap{position:relative;margin-top:8px;}
.lumi-img-rm{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.5);border:none;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;}

.lumi-feed{padding:8px 12px 16px;}

/* Post card */
.lumi-post{background:var(--lcard);border:1px solid var(--lborder);border-radius:18px;padding:14px;margin-bottom:10px;box-shadow:var(--lshadow);animation:postSlide .3s ease;position:relative;}
.lumi-post.post-news{border-left:3px solid #FB923C;}
.lumi-post.post-player{border-left:3px solid var(--lp);}
.lumi-post-hd{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
.lumi-post-author-wrap{flex:1;min-width:0;}
.lumi-post-author{font-size:13px;font-weight:700;color:var(--ltext);display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.lumi-post-time{font-size:10px;color:var(--lsub);margin-top:2px;}
.lumi-ptype{font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;}
.ptype-news{background:#FFF3E0;color:#E65100;}
.ptype-main{background:var(--la);color:var(--lp);}
.ptype-npc{background:#EDE9FE;color:#6D28D9;}
.ptype-citizen{background:#DCFCE7;color:#166534;}
.lumi-post-title{font-size:14px;font-weight:800;color:var(--ltext);margin-bottom:5px;line-height:1.3;}
.lumi-post-body{font-size:13px;color:var(--ltext);line-height:1.65;margin-bottom:10px;}

/* Mockups */
.lumi-music-card{background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.lumi-music-cover{width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,var(--lp),var(--ls));display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;}
.lumi-music-title{font-size:13px;font-weight:700;color:#fff;}
.lumi-music-artist{font-size:11px;color:rgba(255,255,255,.6);}
.lumi-music-bar{display:flex;gap:2px;margin-top:6px;}
.lumi-music-bar span{display:inline-block;width:3px;border-radius:2px;background:var(--lp);animation:dotBounce 1.2s ease-in-out infinite both;}
.lumi-music-bar span:nth-child(1){height:8px;animation-delay:.1s;}
.lumi-music-bar span:nth-child(2){height:14px;animation-delay:.2s;}
.lumi-music-bar span:nth-child(3){height:10px;animation-delay:.3s;}
.lumi-music-bar span:nth-child(4){height:16px;animation-delay:.15s;}
.lumi-music-bar span:nth-child(5){height:8px;animation-delay:.25s;}

.lumi-img-card{border-radius:14px;overflow:hidden;margin-bottom:10px;position:relative;}
.lumi-img-card img{width:100%;max-height:240px;object-fit:cover;display:block;}
.lumi-img-card-cap{padding:8px 10px;background:var(--linput);font-size:12px;color:var(--lsub);font-style:italic;}
.lumi-img-card-mock{width:100%;height:180px;background:linear-gradient(135deg,var(--lborder),var(--linput));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--lsub);font-size:12px;}

/* Post actions */
.lumi-post-acts{display:flex;gap:5px;padding-top:10px;border-top:1px solid var(--lborder);}
.lumi-pact{flex:1;background:none;border:1px solid var(--lborder);border-radius:10px;padding:7px 6px;cursor:pointer;font-size:11px;font-family:var(--ff);color:var(--lsub);transition:.15s;display:flex;align-items:center;justify-content:center;gap:4px;font-weight:600;}
.lumi-pact:hover{background:var(--la);color:var(--lp);border-color:var(--lborder);}
.lumi-pact.liked{background:var(--la);color:var(--lp);border-color:rgba(214,79,171,.25);}

/* Replies */
.lumi-replies-wrap{display:none;margin-top:10px;}
.lumi-reply-thread{padding-left:10px;border-left:2px solid var(--lborder);}
.lumi-reply{padding:8px 0;border-bottom:1px solid var(--lborder);}
.lumi-reply:last-of-type{border-bottom:none;}
.lumi-reply-hd{display:flex;align-items:center;gap:7px;margin-bottom:4px;}
.lumi-reply-name{font-size:11px;font-weight:700;color:var(--ltext);}
.lumi-reply-time{font-size:10px;color:var(--lsub);margin-left:auto;}
.lumi-reply-body{font-size:12px;color:var(--ltext);line-height:1.6;padding-left:27px;}
/* Nested replies */
.lumi-nested{margin-left:16px;margin-top:6px;padding-left:10px;border-left:2px dashed var(--lborder);}
.lumi-compose-rep{display:flex;gap:7px;margin-top:9px;}
.lumi-rep-input{flex:1;background:var(--linput);border:1px solid var(--lborder);border-radius:16px;padding:7px 12px;font-size:12px;font-family:var(--ff);color:var(--ltext);outline:none;resize:none;min-height:32px;max-height:80px;transition:.15s;}
.lumi-rep-input:focus{border-color:var(--lp);}
.lumi-rep-send{width:32px;height:32px;border-radius:50%;background:var(--lgrad);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(214,79,171,.25);}

/* Theme toggle */
.lumi-theme-toggle{display:flex;gap:0;background:var(--linput);border-radius:10px;padding:3px;border:1px solid var(--lborder);}
.lumi-theme-btn{flex:1;padding:6px 10px;border-radius:8px;border:none;background:none;cursor:pointer;font-size:11px;font-family:var(--ff);font-weight:600;color:var(--lsub);display:flex;align-items:center;justify-content:center;gap:5px;transition:.15s;}
.lumi-theme-btn.active{background:var(--lcard);color:var(--lp);box-shadow:0 2px 8px rgba(0,0,0,.1);}

/* API status */
.api-status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.dot-ok{background:#34D399;}
.dot-err{background:#FF4757;}
.dot-idle{background:var(--lsub);}

@media(max-width:768px){
  .lumi-modal{width:97%;height:96dvh;border-radius:18px;}
}
`;
    document.head.appendChild(el);
}

// ═══════════════════════════════════════════════════════════
// FAB
// ═══════════════════════════════════════════════════════════
function spawnFAB() {
    $('#lumi-fab,.lumi-menu').remove();
    const fab = document.createElement('div'); fab.id='lumi-fab';
    fab.innerHTML='<div class="lumi-fab-dot" id="lumi-fab-dot"></div>';
    const pos = EXT._internal.fabPos;
    if (pos) Object.assign(fab.style, pos);
    else { fab.style.top='50%'; fab.style.right='16px'; fab.style.transform='translateY(-50%)'; }
    document.body.appendChild(fab);

    const menu = document.createElement('div'); menu.className='lumi-menu';
    const bid = getBotId();
    const hasNotify = EXT.forumNotify && EXT.forumNotify[bid];
    menu.innerHTML = `<div class="lumi-menu-grid">
      <div class="lumi-menu-item" id="lm-diary"><img src="${ASSETS.diary}"><span>Diary</span></div>
      <div class="lumi-menu-item${hasNotify?' has-notify':''}" id="lm-forum"><img src="${ASSETS.forum}"><span>Forum</span></div>
      <div class="lumi-menu-item" id="lm-set"><img src="${ASSETS.settings}"><span>Settings</span></div>
    </div>`;
    document.body.appendChild(menu);
    updateFabDot();

    // Drag
    let isDrag=false,sx,sy,il,it,dist=0;
    const THRESH=10;
    const startD=(x,y)=>{isDrag=false;dist=0;sx=x;sy=y;const r=fab.getBoundingClientRect();il=r.left;it=r.top;fab.style.transform='none';};
    const moveD=(x,y)=>{const dx=x-sx,dy=y-sy;dist=Math.hypot(dx,dy);if(dist>THRESH)isDrag=true;if(isDrag){fab.style.left=(il+dx)+'px';fab.style.top=(it+dy)+'px';fab.style.right='auto';fab.style.bottom='auto';$(menu).fadeOut(100);}};
    const endD=()=>{
        if(isDrag){EXT._internal.fabPos={top:fab.style.top,left:fab.style.left,right:'auto',bottom:'auto',transform:'none'};save();}
        else if(dist<THRESH){
            const r=fab.getBoundingClientRect(),mW=$(menu).outerWidth()||190,mH=$(menu).outerHeight()||130;
            menu.style.left=Math.max(8,Math.min(r.left+r.width/2-mW/2,window.innerWidth-mW-8))+'px';
            menu.style.top=Math.max(8,r.top-mH-10)+'px';
            $(menu).fadeToggle(180);
        }
        isDrag=false;
    };
    fab.addEventListener('mousedown',e=>{if(e.button!==0)return;e.preventDefault();startD(e.clientX,e.clientY);const mv=ev=>moveD(ev.clientX,ev.clientY);const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);endD();};document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);});
    fab.addEventListener('touchstart',e=>{e.preventDefault();startD(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    fab.addEventListener('touchmove',e=>{e.preventDefault();moveD(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    fab.addEventListener('touchend',e=>{e.preventDefault();endD();},{passive:false});
    $('#lm-diary').on('click',()=>{$(menu).fadeOut();openModal('diary');});
    $('#lm-forum').on('click',()=>{$(menu).fadeOut();clearForumNotify();openModal('forum');});
    $('#lm-set').on('click',()=>{$(menu).fadeOut();openModal('settings');});
}

function updateFabDot(){
    const bid=getBotId();
    const has=EXT.forumNotify&&EXT.forumNotify[bid];
    $('#lumi-fab-dot').toggleClass('show',!!has);
    if(has) $('#lm-forum').addClass('has-notify'); else $('#lm-forum').removeClass('has-notify');
}
function setForumNotify(){EXT.forumNotify[getBotId()]=true;save();updateFabDot();}
function clearForumNotify(){EXT.forumNotify[getBotId()]=false;save();updateFabDot();}

// ═══════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════
function createModal() {
    if ($('#lumi-overlay').length) return;
    $('body').append(`<div id="lumi-overlay" class="lumi-overlay"><div class="lumi-modal"><div class="lumi-head"><button class="lumi-icon-btn" id="lumi-back">${I.back}</button><div class="lumi-head-title" id="lumi-title">LumiPulse</div><button class="lumi-icon-btn" id="lumi-close">${I.close}</button></div><div id="lumi-body" class="lumi-body"></div></div></div>`);
    $('#lumi-close').on('click',()=>$('#lumi-overlay').fadeOut(200));
    $('#lumi-overlay').on('click',e=>{if(e.target.id==='lumi-overlay')$('#lumi-overlay').fadeOut(200);});
    $('#lumi-back').on('click',()=>{const v=$('#lumi-body').data('view');if(v==='forum-profile')openModal('forum');else $( '#lumi-overlay').fadeOut(200);});
}
function openModal(type='diary') {
    if(!$('#lumi-overlay').length) createModal();
    $('#lumi-overlay').css('display','flex').hide().fadeIn(200);
    if(type==='diary') renderDiary();
    else if(type==='forum'){clearForumNotify();renderForum();}
    else if(type==='settings') renderSettings();
}

// ═══════════════════════════════════════════════════════════
// DIARY
// ═══════════════════════════════════════════════════════════
function renderDiary() {
    const ctx=SillyTavern.getContext(),bid=getBotId(),botName=ctx.name2||'Unknown';
    const mems=loadMems({botId:bid});
    const si=EXT._internal,fc=si.filterChar||'',fd=si.filterDate||'',fl=si.filterLoc||'';
    const chars=[...new Set(mems.map(m=>m.character))].filter(Boolean);
    const dates=[...new Set(mems.map(m=>m.content.rp_date))].filter(Boolean);
    const locs=[...new Set(mems.map(m=>m.content.rp_location))].filter(Boolean);
    let filtered=mems;
    if(fc) filtered=filtered.filter(m=>m.character===fc);
    if(fd) filtered=filtered.filter(m=>m.content.rp_date===fd);
    if(fl) filtered=filtered.filter(m=>m.content.rp_location===fl);
    $('#lumi-title').text('Diary');
    const body=$('#lumi-body');body.data('view','diary');
    body.html(`
      <div class="lumi-hero"><div class="lumi-hero-eye">${I.book} Memories of</div><div class="lumi-hero-title">${esc(botName)}</div><div class="lumi-hero-sub">${filtered.length} entries</div></div>
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
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
          <select id="fc" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All chars</option>${chars.map(c=>`<option value="${esc(c)}"${c===fc?' selected':''}>${esc(c)}</option>`).join('')}</select>
          <select id="fd" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All dates</option>${dates.map(d=>`<option value="${esc(d)}"${d===fd?' selected':''}>${esc(d)}</option>`).join('')}</select>
          <select id="fl" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All locs</option>${locs.map(l=>`<option value="${esc(l)}"${l===fl?' selected':''}>${esc(l)}</option>`).join('')}</select>
        </div>
        <button id="btn-open-gen" class="lumi-sm-btn" style="width:100%;justify-content:center;margin-bottom:10px;">${I.spark} Generate from Chat</button>
        <div id="gen-form" style="display:none;margin-bottom:12px;"></div>
        <div id="diary-content"></div>
      </div>`);
    $('#fc,#fd,#fl').on('change',()=>{EXT._internal.filterChar=$('#fc').val();EXT._internal.filterDate=$('#fd').val();EXT._internal.filterLoc=$('#fl').val();save();renderDiary();});
    $('#btn-open-gen').on('click',()=>{if($('#gen-form').is(':visible'))$('#gen-form').slideUp(200);else{renderGenForm();$('#gen-form').slideDown(200);}});
    $('.lumi-tab[data-dtab]').on('click',function(){$('.lumi-tab[data-dtab]').removeClass('active');$(this).addClass('active');const t=$(this).data('dtab');if(t==='entries')renderDiaryEntries();else if(t==='story')renderStoryWeaver();else if(t==='lore')renderLoreTab();else if(t==='links')renderLinksTab();});
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const bid=getBotId(),si=EXT._internal,fc=si.filterChar||'',fd=si.filterDate||'',fl=si.filterLoc||'';
    let mems=loadMems({botId:bid});
    if(fc)mems=mems.filter(m=>m.character===fc);if(fd)mems=mems.filter(m=>m.content.rp_date===fd);if(fl)mems=mems.filter(m=>m.content.rp_location===fl);
    const byDate={};mems.forEach(m=>{const d=m.content.rp_date||'Unknown';if(!byDate[d])byDate[d]=[];byDate[d].push(m);});
    const sorted=Object.keys(byDate).sort();
    if(!sorted.length){$('#diary-content').html(`<div class="lumi-empty"><div class="lumi-empty-icon">📖</div><div class="lumi-empty-text">No memories yet.<br>Generate some from your chat!</div></div>`);return;}
    let html='';
    sorted.forEach(d=>{
        html+=`<div class="lumi-tl-sep">${I.cal} ${esc(d)}</div>`;
        byDate[d].forEach((m,i)=>{html+=diaryCardHTML(m,i);});
    });
    $('#diary-content').html(html);bindDiaryEvents();
}

function diaryCardHTML(m,i) {
    const color=colorOf(m.character),init=(m.character||'?').charAt(0).toUpperCase();
    const locked=EXT.diary.display.showSecretSystem&&checkUnlock(m)===false;
    const locB=m.content.rp_location?`<span class="lumi-badge">${I.pin2} ${esc(m.content.rp_location)}</span>`:'';
    const moodB=m.content.mood?`<span class="lumi-badge">${I.mood} ${esc(m.content.mood)}</span>`:'';
    const tags=(m.content.rp_tags||[]).map(t=>`<span class="lumi-badge">${I.tag} ${esc(t)}</span>`).join('');
    if(locked) return `<div class="lumi-card" data-id="${m.id}"><div class="lumi-card-hd"><div class="lumi-av" style="background:${color}">${init}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="text-align:center;padding:12px;color:var(--lsub);">${I.lock}<div style="margin-top:6px;font-size:12px;">Locked</div></div></div>`;
    return `<div class="lumi-card" data-id="${m.id}">
      <div class="lumi-card-hd">
        <div class="lumi-av" style="background:${color}">${init}</div>
        <div class="lumi-char-name">${esc(m.character)}</div>
        ${m.meta.isFavorite?`<span style="color:var(--lp);">♥</span>`:''}
        ${m.meta.isPinned?`<span style="color:#F59E0B;">${I.pin}</span>`:''}
      </div>
      <div class="lumi-card-meta">${moodB}${locB}${tags}</div>
      <div class="lumi-card-body">${esc(m.content.diary||'')}</div>
      <div class="lumi-card-foot">
        <button class="lumi-act${m.meta.isPinned?' act-on':''}" data-act="pin">${I.pin}</button>
        <button class="lumi-act${m.meta.isFavorite?' act-on':''}" data-act="fav">${m.meta.isFavorite?I.heartF:I.heart}</button>
        <button class="lumi-act" data-act="edit">${I.edit}</button>
        <button class="lumi-act act-del" data-act="del">${I.trash}</button>
      </div>
    </div>`;
}

function bindDiaryEvents(){
    $('.lumi-act').off('click').on('click',function(e){
        e.stopPropagation();const id=$(this).closest('.lumi-card').data('id');const act=$(this).data('act');
        const mem=EXT.memories.find(m=>m.id===id);if(!mem)return;
        if(act==='pin'){mem.meta.isPinned=!mem.meta.isPinned;save();renderDiaryEntries();}
        if(act==='fav'){mem.meta.isFavorite=!mem.meta.isFavorite;save();renderDiaryEntries();}
        if(act==='edit') editMemInline(id);
        if(act==='del'){if(confirm('Delete?')){EXT.memories=EXT.memories.filter(m=>m.id!==id);save();renderDiaryEntries();}}
    });
}

function editMemInline(id){
    const mem=EXT.memories.find(m=>m.id===id);if(!mem)return;
    const card=$(`.lumi-card[data-id="${id}"]`);
    card.find('.lumi-card-body').html(`<textarea class="lumi-input lumi-textarea" style="font-size:13px;">${esc(mem.content.diary||'')}</textarea><div style="display:flex;gap:7px;margin-top:7px;"><button class="lumi-sm-btn" id="si" style="flex:1;justify-content:center;background:var(--la);color:var(--lp);">Save</button><button class="lumi-sm-btn" id="ci" style="flex:1;justify-content:center;">Cancel</button></div>`);
    card.find('#si').on('click',()=>{mem.content.diary=card.find('textarea').val();save();renderDiaryEntries();toast('✓ Updated');});
    card.find('#ci').on('click',()=>renderDiaryEntries());
}

function renderGenForm(){
    $('#gen-form').html(`<div class="lumi-form-card"><div class="lumi-form-title">Generate Settings</div><label class="lumi-label" style="margin-bottom:7px;">Scan Mode</label><div style="display:flex;gap:6px;margin-bottom:10px;" id="gm">${['latest','first','all'].map(v=>`<button class="lumi-sm-btn gm${v==='latest'?' act-on':''}" data-v="${v}" style="flex:1;justify-content:center;">${v.charAt(0).toUpperCase()+v.slice(1)}</button>`).join('')}</div><div id="gc-wrap" style="margin-bottom:10px;"><label class="lumi-label">Message Count</label><input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input" style="font-size:13px;"></div><button id="btn-run-gen" class="lumi-btn">${I.spark} Analyze & Generate</button></div>`);
    $('#gm').on('click','.gm',function(){$('.gm').removeClass('act-on');$(this).addClass('act-on');$('#gc-wrap').toggle($(this).data('v')!=='all');});
    $('#btn-run-gen').on('click',genDiaryBatch);
}

async function renderStoryWeaver(){
    const mems=loadMems({botId:getBotId()}).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Story Weaver</div><p style="font-size:12px;color:var(--lsub);margin:0 0 12px;">Weave all diary entries into a cohesive narrative.</p><button id="btn-weave" class="lumi-btn">${I.scroll} Weave Story</button></div><div id="sw-out" style="display:none;background:var(--lcard);border:1px solid var(--lborder);border-radius:14px;padding:14px;font-size:13px;line-height:1.65;white-space:pre-wrap;max-height:280px;overflow-y:auto;margin-top:10px;"></div><div id="sw-acts" style="display:none;margin-top:10px;"><button id="btn-es" class="lumi-btn">${I.book} Export .md</button></div>`);
    $('#btn-weave').on('click',async function(){$(this).html(`<span class="lumi-spin"></span> Weaving...`).prop('disabled',true);const dt=mems.map(m=>`[${m.character}|${m.content.rp_date}] ${m.content.diary}`).join('\n\n');const story=await callAI(`Weave into Markdown story with chapters:\n\n${dt}`,'You are a literary chronicler. Output only the story in Markdown.');$(this).html(`${I.scroll} Weave Story`).prop('disabled',false);if(story){$('#sw-out').text(story).show();$('#sw-acts').show();$('#btn-es').off('click').on('click',()=>exportText(story,'Story.md'));}});
}

async function renderLoreTab(){
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Lore Extractor</div><p style="font-size:12px;color:var(--lsub);margin:0 0 12px;">Generate SillyTavern World Info JSON.</p><button id="btn-lore" class="lumi-btn">${I.globe} Extract Lore</button></div><div id="lore-out" style="display:none;margin-top:10px;"></div>`);
    $('#btn-lore').on('click',async function(){
        $(this).html(`<span class="lumi-spin"></span> Extracting...`).prop('disabled',true);
        const mems=loadMems({botId:getBotId()});const text=mems.map(m=>`[${m.character}] ${m.content.diary}`).join('\n');
        const sys='You are a JSON API. Output ONLY a raw JSON array. No markdown, no explanation.';
        const raw=await callAI(`Extract World Info: [{"keyword":"Name","type":"character|location|item|event","content":"desc"}]\n\nText:\n${text}`,sys);
        $(this).html(`${I.globe} Extract Lore`).prop('disabled',false);
        const data=extractJSON(raw,'array');
        if(data&&data.length){
            let html=`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><tr style="background:var(--la);"><th style="padding:7px;text-align:left;color:var(--lp);">Keyword</th><th style="padding:7px;text-align:left;color:var(--lp);">Type</th><th style="padding:7px;text-align:left;color:var(--lp);">Content</th></tr>`;
            data.forEach(l=>html+=`<tr style="border-bottom:1px solid var(--lborder);"><td style="padding:7px;font-weight:700;">${esc(l.keyword||'')}</td><td style="padding:7px;">${esc(l.type||'')}</td><td style="padding:7px;color:var(--lsub);">${esc((l.content||'').slice(0,60))}...</td></tr>`);
            html+=`</table></div><div style="margin-top:10px;"><button id="btn-el" class="lumi-btn">${I.book} Export JSON</button></div>`;
            const lb={name:'LumiPulse Lorebook',entries:{}};data.forEach((item,i)=>{lb.entries[i]={uid:i,key:[item.keyword],comment:item.type,content:item.content,selective:true,probability:100,depth:4,group:'LumiPulse'};});
            $('#lore-out').html(html).show();$('#btn-el').off('click').on('click',()=>exportJSON(lb,'Lorebook.json'));
        }else{$('#lore-out').html(`<div class="lumi-empty"><div class="lumi-empty-text">No lore found.</div></div>`).show();}
    });
}

function renderLinksTab(){
    const mems=loadMems({botId:getBotId()});const linked=mems.filter(m=>m.meta.linkedIds&&m.meta.linkedIds.length>0);
    let html=linked.length===0?`<div class="lumi-empty"><div class="lumi-empty-icon">🔗</div><div class="lumi-empty-text">No linked memories.</div></div>`:'';
    linked.forEach(m=>{const links=m.meta.linkedIds.map(id=>{const lm=mems.find(x=>x.id===id);return lm?`<span class="lumi-badge" style="cursor:pointer;margin:3px 2px;" data-lid="${lm.id}">${I.link} ${esc(lm.character)} · ${esc(lm.content.rp_date)}</span>`:''}).join('');html+=`<div class="lumi-card"><div class="lumi-card-hd"><div class="lumi-av" style="background:${colorOf(m.character)}">${m.character.charAt(0)}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="font-size:11px;color:var(--lsub);margin-bottom:6px;">Linked:</div>${links}</div>`;});
    $('#diary-content').html(html);
    $('[data-lid]').off('click').on('click',function(){const mem=mems.find(m=>m.id===$(this).data('lid'));if(mem){$('#diary-content').html(diaryCardHTML(mem,0)+`<button class="lumi-sm-btn" id="blk" style="width:100%;justify-content:center;margin-top:10px;">${I.back} Back</button>`);bindDiaryEvents();$('#blk').on('click',renderLinksTab);}});
}

// ── Diary AI (no prohibited content — neutral framing) ──────
async function genDiaryBatch(){
    const mode=$('.gm.act-on').data('v')||'latest';const count=parseInt($('#gen-count').val())||30;
    $('#btn-run-gen').html(`<span class="lumi-spin"></span> Analyzing...`).prop('disabled',true);
    const results=await callDiaryAI(mode,count);
    $('#btn-run-gen').html(`${I.spark} Analyze & Generate`).prop('disabled',false);$('#gen-form').slideUp(200);
    if(results&&results.length>0){
        const ctx=SillyTavern.getContext(),bid=getBotId(),wm=EXT.diary.worldMode==='auto'?detectWorldMode():EXT.diary.worldMode;
        results.forEach(r=>saveMem({id:'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),timestamp:new Date().toISOString(),character:r.character||ctx.name2||'Character',botId:bid,worldMode:wm,content:{...r},meta:{isPinned:false,isFavorite:false,isSecret:r.isSecret||false,linkedIds:r.linkedIds||[],tags:extractTags(r.diary||'')}}));
        toast(`✓ Created ${results.length} memories`);renderDiaryEntries();
    }else toast('No new memories found','err');
}

async function callDiaryAI(mode,count){
    const ctx=SillyTavern.getContext(),allChat=ctx.chat||[];
    let slice,si=0,ei=0;
    if(mode==='latest'){slice=allChat.slice(-count);si=Math.max(0,allChat.length-count);ei=allChat.length;}
    else if(mode==='first'){slice=allChat.slice(0,count);si=0;ei=count;}
    else{slice=allChat.filter(m=>m.mes&&m.mes.length>15).slice(-120);si=Math.max(0,allChat.length-120);ei=allChat.length;}
    const log=slice.filter(m=>m.mes&&m.mes.length>8).map(m=>`${m.is_user?'User':(m.name||'NPC')}: ${(m.mes||'').replace(/<[^>]*>/g,'').slice(0,70)}`).join('\n');
    const prev=loadMems({botId:getBotId()}).slice(0,6).map(m=>`[${m.character}] ${(m.content.diary||'').slice(0,40)}`).join('\n');
    const reg=Object.keys(EXT._internal.nameRegistry||{}).join(', ');
    // ✅ Neutral system prompt — avoids "prohibited content" refusals
    const sys='You are a creative writing assistant helping document roleplay story events as diary entries. This is fictional storytelling. Output ONLY a raw JSON array with no markdown fences.';
    const prompt=`Summarize these roleplay events as diary entries written by the characters.
Known characters: ${reg||'various'}
Previously written (skip repeats): ${prev||'none'}
Roleplay log: ${log}
Output format (raw JSON array only, no extra text):
[{"character":"Name","rp_date":"Thai date e.g. 15 มีนาคม 2567","rp_location":"Location","rp_tags":["#Tag"],"mood":"Mood","diary":"2-4 sentences from character's perspective","isSecret":false,"linkedIds":[]}]`;
    const raw=await callAI(prompt,sys);
    const data=extractJSON(raw,'array');return Array.isArray(data)?data:[];
}

// ── Memory helpers ───────────────────────────────────────────
function loadMems(filter={}){let m=[...(EXT.memories||[])];if(filter.botId)m=m.filter(x=>x.botId===filter.botId||!x.botId);if(filter.character)m=m.filter(x=>x.character===filter.character);return m.sort((a,b)=>(b.meta.isPinned?1:0)-(a.meta.isPinned?1:0)||new Date(b.timestamp)-new Date(a.timestamp));}
function saveMem(entry){if(!EXT._internal.nameRegistry)EXT._internal.nameRegistry={};let cn=entry.character.replace(/[()（）[\]]/g,'').trim(),canon=cn;for(let k in EXT._internal.nameRegistry){if(simScore(cn,k)>90){canon=k;break;}}EXT._internal.nameRegistry[canon]=true;entry.character=canon;const ex=EXT.memories.filter(m=>m.character===canon);if(ex.some(m=>simScore(m.content.diary||'',entry.content.diary||'')>85))return;EXT.memories.unshift(entry);if(EXT.memories.length>EXT.diary.storage.max)EXT.memories=EXT.memories.slice(0,EXT.diary.storage.max);save();}
const checkUnlock=(m)=>{if(!m.meta.isSecret)return true;const mode=EXT.diary.display.secretMode;if(mode==='time')return(Date.now()-new Date(m.timestamp))>86400000*3;if(mode==='affection')return(m.content.affection_score||0)>=80;return false;};
const extractTags=(t)=>{const tags=[],kw={'#Romantic':['รัก','หัวใจ'],'#Drama':['เสียใจ','ร้องไห้'],'#Mystery':['ลึกลับ','ความลับ']},l=t.toLowerCase();for(const[k,v]of Object.entries(kw))if(v.some(w=>l.includes(w)))tags.push(k);return tags;};
const detectWorldMode=()=>{const names=new Set();(SillyTavern.getContext().chat||[]).slice(-50).forEach(m=>{if(m.name&&!m.is_user&&!m.is_system)names.add(m.name);});return names.size>2?'rpg':'solo';};

// ═══════════════════════════════════════════════════════════
// FORUM
// ═══════════════════════════════════════════════════════════
function renderForum(){
    const ctx=SillyTavern.getContext();const botName=ctx.name2||'World';
    const posts=getBotPosts();const threads=posts.filter(p=>p.type==='thread');
    $('#lumi-title').text('Forum');
    const body=$('#lumi-body');body.data('view','forum');
    body.html(`
      <div class="lumi-hero"><div class="lumi-hero-eye">${I.news} Community Board</div><div class="lumi-hero-title">${esc(botName)}</div><div class="lumi-hero-sub">${threads.length} posts</div></div>
      <div class="lumi-reload-bar">
        <button class="lumi-reload-btn" id="btn-reload">${I.refresh} Refresh Feed</button>
        <button class="lumi-sm-btn lumi-danger-btn" id="btn-clr-forum" title="Clear all" style="padding:7px 10px;">${I.trash}</button>
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
          <label class="lumi-sm-btn" style="cursor:pointer;">${I.img} Photo <input type="file" id="img-upload" accept="image/*" style="display:none;"></label>
        </div>
      </div>
      <div class="lumi-feed" id="lumi-feed"></div>`);

    // Bind compose
    let pendingImageData=null;
    $('#img-upload').on('change',function(){
        const file=this.files[0];if(!file)return;
        const reader=new FileReader();
        reader.onload=e=>{
            pendingImageData=e.target.result;
            $('#img-preview-wrap').html(`<div class="lumi-img-preview-wrap"><img src="${pendingImageData}" class="lumi-img-preview"><button class="lumi-img-rm" id="rm-img">${I.close}</button></div>`);
            $('#rm-img').on('click',()=>{pendingImageData=null;$('#img-preview-wrap').html('');});
        };
        reader.readAsDataURL(file);
    });

    $('#btn-post').on('click',async()=>{
        const txt=$('#compose-txt').val().trim();
        if(!txt&&!pendingImageData){toast('Write something first','err');return;}
        const ctx=SillyTavern.getContext();
        const np={id:'post_'+Date.now(),type:'thread',posterType:'player',author:ctx.name1||'Player',title:null,content:txt||'📸',threadTag:'Post',postMedia:pendingImageData?{type:'image',data:pendingImageData,caption:txt}:null,timestamp:new Date().toISOString(),parentId:null,likes:0,likedBy:[],replies:[]};
        const arr=getBotPosts();arr.push(np);savePosts(arr);
        $('#compose-txt').val('');pendingImageData=null;$('#img-preview-wrap').html('');
        renderFeed();toast('✓ Posted');
        if(EXT.forum.autoReactOnRP) setTimeout(()=>aiReactToPost(np.id),1000);
    });

    $('#btn-reload').on('click',async function(){
        $(this).html(`<span class="lumi-spin lumi-spin-c"></span> Loading...`).prop('disabled',true);
        await runForumRefresh();
        $(this).html(`${I.refresh} Refresh Feed`).prop('disabled',false);
    });

    $('#btn-clr-forum').on('click',()=>{if(confirm('Clear all forum posts for this character?')){savePosts([]);renderFeed();toast('✓ Cleared');}});
    renderFeed();
}

// ── Feed render ──────────────────────────────────────────────
function renderFeed(){
    const threads=getBotPosts().filter(p=>p.type==='thread').sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    if(!threads.length){$('#lumi-feed').html(`<div class="lumi-empty"><div class="lumi-empty-icon">💬</div><div class="lumi-empty-text">Nothing here yet.<br>Hit Refresh Feed to see what's happening!</div></div>`);return;}
    let html='';
    threads.forEach(th=>{
        const replies=getBotPosts().filter(p=>p.parentId===th.id);
        html+=postCardHTML(th,replies);
    });
    $('#lumi-feed').html(html);
    bindFeedEvents();
}

function postCardHTML(th,replies){
    const color=colorOf(th.author),init=(th.author||'?').charAt(0).toUpperCase();
    const liked=th.likedBy&&th.likedBy.includes('__player__');
    const likeCount=th.likes||0;
    const typeClass=th.posterType==='news'?'post-news':th.posterType==='player'?'post-player':'';
    const typeBadge=th.posterType==='news'?`<span class="lumi-ptype ptype-news">${I.news} News</span>`:th.posterType==='npc'?`<span class="lumi-ptype ptype-npc">NPC</span>`:th.posterType==='citizen'?`<span class="lumi-ptype ptype-citizen">Citizen</span>`:`<span class="lumi-ptype ptype-main">Main</span>`;

    // Media mockup
    let mediaMock='';
    if(th.postMedia){
        if(th.postMedia.type==='image'){
            mediaMock=`<div class="lumi-img-card"><img src="${th.postMedia.data}" onerror="this.parentElement.innerHTML='<div class=\\'lumi-img-card-mock\\'>${I.img}<span>Image</span></div>'"><div class="lumi-img-card-cap">${esc(th.postMedia.caption||'')}</div></div>`;
        }else if(th.postMedia.type==='music'){
            mediaMock=`<div class="lumi-music-card"><div class="lumi-music-cover">🎵</div><div><div class="lumi-music-title">${esc(th.postMedia.title||'Unknown Track')}</div><div class="lumi-music-artist">${esc(th.postMedia.artist||'')}</div><div class="lumi-music-bar"><span></span><span></span><span></span><span></span><span></span></div></div></div>`;
        }else if(th.postMedia.type==='photo_desc'){
            mediaMock=`<div class="lumi-img-card"><div class="lumi-img-card-mock">${I.img}<span>${esc(th.postMedia.caption||'Photo')}</span></div></div>`;
        }
    }

    const replyHTML=replies.map(r=>replyItemHTML(r,getBotPosts())).join('');

    return `<div class="lumi-post ${typeClass}" data-id="${th.id}">
      <div class="lumi-post-hd">
        <div class="lumi-av" style="background:${color}">${init}</div>
        <div class="lumi-post-author-wrap">
          <div class="lumi-post-author">${esc(th.author)} ${typeBadge}</div>
          <div class="lumi-post-time">${timeAgo(th.timestamp)}${th.threadTag?` · <span class="lumi-badge" style="font-size:9px;">${esc(th.threadTag)}</span>`:''}</div>
        </div>
        <button class="lumi-act act-del" data-act="del-post" data-id="${th.id}" style="padding:3px 5px;">${I.trash}</button>
      </div>
      ${th.title?`<div class="lumi-post-title">${esc(th.title)}</div>`:''}
      ${mediaMock}
      ${th.content&&th.content!=='📸'?`<div class="lumi-post-body">${esc(th.content)}</div>`:''}
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

// Recursive reply renderer (nested)
function replyItemHTML(r, allPosts, depth=0){
    const color=colorOf(r.author),init=(r.author||'?').charAt(0).toUpperCase();
    const nested=allPosts.filter(p=>p.parentId===r.id);
    const nestedHTML=nested.map(n=>replyItemHTML(n,allPosts,depth+1)).join('');
    const avSize=depth>0?'lumi-av-xs':'lumi-av-sm';
    return `<div class="lumi-reply">
      <div class="lumi-reply-hd">
        <div class="lumi-av ${avSize}" style="background:${color}">${init}</div>
        <div class="lumi-reply-name">${esc(r.author)}</div>
        <div class="lumi-reply-time">${timeAgo(r.timestamp)}</div>
      </div>
      <div class="lumi-reply-body">${esc(r.content)}</div>
      ${nestedHTML?`<div class="lumi-nested">${nestedHTML}</div>`:''}
    </div>`;
}

function bindFeedEvents(){
    $('[data-act="like"]').off('click').on('click',function(){
        const id=$(this).data('id');const arr=getBotPosts();const post=arr.find(p=>p.id===id);if(!post)return;
        if(!post.likedBy)post.likedBy=[];const idx=post.likedBy.indexOf('__player__');
        if(idx>=0){post.likedBy.splice(idx,1);post.likes=Math.max(0,(post.likes||0)-1);}else{post.likedBy.push('__player__');post.likes=(post.likes||0)+1;}
        savePosts(arr);renderFeed();
    });
    $('[data-act="toggle-rep"]').off('click').on('click',function(){const id=$(this).data('id');$(`#rep-${id}`).is(':visible')?$(`#rep-${id}`).slideUp(180):$(`#rep-${id}`).slideDown(200);});
    $('[data-act="send-rep"]').off('click').on('click',async function(){
        const tid=$(this).data('thread');const txt=$(`.lumi-rep-input[data-thread="${tid}"]`).val().trim();if(!txt)return;
        const ctx=SillyTavern.getContext();
        const r={id:'rep_'+Date.now(),type:'reply',posterType:'player',author:ctx.name1||'Player',content:txt,timestamp:new Date().toISOString(),parentId:tid,likes:0,likedBy:[]};
        const arr=getBotPosts();arr.push(r);savePosts(arr);
        $(`.lumi-rep-input[data-thread="${tid}"]`).val('');
        renderFeed();
        if(EXT.forum.autoReactOnRP) setTimeout(()=>aiReactToPost(tid),900);
    });
    $('[data-act="ai-reply"]').off('click').on('click',async function(){
        const tid=$(this).data('id');const $btn=$(this);
        $btn.html(`<span class="lumi-spin lumi-spin-c" style="width:10px;height:10px;border-width:2px;"></span>`).prop('disabled',true);
        await aiReactToPost(tid);
        $btn.html(`${I.spark} AI`).prop('disabled',false);
    });
    $('[data-act="del-post"]').off('click').on('click',function(e){
        e.stopPropagation();const id=$(this).data('id');if(!confirm('Delete?'))return;
        savePosts(getBotPosts().filter(p=>p.id!==id&&p.parentId!==id));renderFeed();
    });
    $('.lumi-rep-input').on('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px';});
}

// ═══════════════════════════════════════════════════════════
// FORUM AI ENGINE
// ═══════════════════════════════════════════════════════════
function buildPosterPool(){
    const ctx=SillyTavern.getContext();const pt=EXT.forum.posterTypes;const pool=[];
    if(pt.mainChars){const mains=new Set();(ctx.chat||[]).slice(-60).forEach(m=>{if(m.name&&!m.is_user)mains.add(m.name);});if(ctx.name2)mains.add(ctx.name2);mains.forEach(c=>pool.push({name:c,type:'main'}));}
    if(pt.npcs) pool.push({name:'__npc__',type:'npc',placeholder:true});
    if(pt.citizens) pool.push({name:'__citizen__',type:'citizen',placeholder:true});
    if(pt.news) pool.push({name:'__news__',type:'news',placeholder:true});
    return pool;
}

const SYS_FORUM='You are a JSON API for a social media roleplay world. Output ONLY a valid raw JSON array. No markdown code fences, no explanation, no thinking. Start directly with [';

async function runForumRefresh(){
    const ctx=SillyTavern.getContext();const existing=getBotPosts();const pool=buildPosterPool();if(!pool.length){toast('No character pool','err');return;}
    const chatCtx=(ctx.chat||[]).slice(-20).filter(m=>m.mes&&m.mes.length>5).map(m=>`${m.is_user?'User':m.name}: ${(m.mes||'').replace(/<[^>]*>/g,'').replace(/\n/g,' ').slice(0,80)}`).join('\n')||'No recent events.';
    const existingTitles=existing.slice(-8).filter(p=>p.type==='thread').map(p=>p.title||p.content.slice(0,35)).join('; ');
    const mainChars=pool.filter(p=>!p.placeholder).map(p=>p.name);
    const hasCitizen=EXT.forum.posterTypes.citizens;const hasNPC=EXT.forum.posterTypes.npcs;const hasNews=EXT.forum.posterTypes.news;
    const prompt=`Generate a realistic social media feed for a roleplay world.

Recent story events:
${chatCtx}

Main characters: ${mainChars.join(', ')||'various'}
Avoid repeating these topics: ${existingTitles||'none'}

Generate 3-6 posts. Mix these types naturally:
${mainChars.length?'- Main character posts: personal reactions, emotions, thoughts, slice-of-life moments\n':''}\
${hasNPC?'- NPC posts: invent believable side character names fitting the world setting\n':''}\
${hasCitizen?'- Citizen/public posts: common people, gossip, opinions (invent realistic names)\n':''}\
${hasNews?'- News/announcements: formal news fitting the world setting\n':''}\

Post variety ideas: expressing feelings, sharing songs/music (add postMedia music), describing what they saw (add postMedia photo_desc), venting frustration, telling a story, asking a question, making an announcement, sharing gossip.

For music posts use: "postMedia": {"type": "music", "title": "Song Title", "artist": "Artist Name"}
For photo description posts use: "postMedia": {"type": "photo_desc", "caption": "What is in the photo"}
For regular posts: "postMedia": null

Each post can have 2-5 replies from DIFFERENT characters (can be nested, each reply can be replied to).

Output ONLY this JSON structure:
[
  {
    "author": "Character name (invent realistic names for NPC/citizen/news)",
    "posterType": "main|npc|citizen|news",
    "title": "Title or null",
    "content": "Post body (1-4 sentences, authentic social media voice)",
    "threadTag": "Gossip|Event|Question|Update|News|Warning|Rant|Music|Memory",
    "postMedia": null,
    "replies": [
      {
        "author": "Replier name",
        "posterType": "main|npc|citizen",
        "content": "Reply (1-3 sentences)",
        "nestedReplies": [
          {"author": "Name", "posterType": "main|npc|citizen", "content": "Nested reply"}
        ]
      }
    ]
  }
]`;

    try{
        const raw=await callAI(prompt,SYS_FORUM);
        const data=extractJSON(raw,'array');
        if(!data||!Array.isArray(data)||!data.length){toast('AI returned no valid posts — try again','err');return;}
        const now=Date.now();const toAdd=[];
        data.filter(p=>p&&typeof p.content==='string'&&p.content.length>0).forEach((p,i)=>{
            const tid='post_'+(now+i*100)+'_'+Math.random().toString(36).substr(2,4);
            toAdd.push({id:tid,type:'thread',posterType:p.posterType||'npc',author:(p.author||'Unknown').trim(),title:p.title&&p.title.trim()?p.title.trim():null,content:p.content.trim(),threadTag:p.threadTag||'Update',postMedia:p.postMedia||null,timestamp:new Date(now+i*2000).toISOString(),parentId:null,likes:Math.floor(Math.random()*8),likedBy:[]});
            // Add replies (possibly nested)
            if(Array.isArray(p.replies)){
                addRepliesRecursive(p.replies, tid, toAdd, now+i*100+50);
            }
        });
        if(!toAdd.length){toast('No valid posts generated','err');return;}
        savePosts([...existing,...toAdd]);renderFeed();
        toast(`✓ Added ${toAdd.filter(p=>p.type==='thread').length} posts`);
    }catch(e){console.error('[LumiPulse]',e);toast('Error: '+e.message,'err');}
}

function addRepliesRecursive(replies, parentId, toAdd, baseTime, depth=0){
    if(depth>3) return; // max nesting
    replies.filter(r=>r&&typeof r.content==='string'&&r.content.length>0).forEach((r,j)=>{
        const rid='rep_'+(baseTime+j*300+depth*10)+'_'+Math.random().toString(36).substr(2,4);
        toAdd.push({id:rid,type:'reply',posterType:r.posterType||'npc',author:(r.author||'Someone').trim(),content:r.content.trim(),timestamp:new Date(baseTime+(j+1)*800).toISOString(),parentId,likes:Math.floor(Math.random()*4),likedBy:[]});
        if(Array.isArray(r.nestedReplies)&&r.nestedReplies.length){
            addRepliesRecursive(r.nestedReplies, rid, toAdd, baseTime+j*300+depth*10+50, depth+1);
        }
    });
}

// AI react to a specific post
async function aiReactToPost(threadId){
    const all=getBotPosts();const thread=all.find(p=>p.id===threadId);if(!thread)return;
    const existingReps=all.filter(p=>p.parentId===threadId);
    const mainChars=buildPosterPool().filter(p=>!p.placeholder&&p.name!==thread.author);if(!mainChars.length)return;
    const recentR=existingReps.slice(-4).map(r=>r.author);
    const eligible=mainChars.filter(p=>!recentR.includes(p.name));if(!eligible.length)return;

    // Maybe like the post
    if(Math.random()>0.45){
        const liker=eligible[Math.floor(Math.random()*eligible.length)];
        if(!thread.likedBy)thread.likedBy=[];if(!thread.likedBy.includes(liker.name)){thread.likedBy.push(liker.name);thread.likes=(thread.likes||0)+1;}
    }

    const numRep=Math.min(eligible.length,Math.random()>0.4?Math.floor(Math.random()*3)+1:1);
    const repliers=eligible.slice(0,numRep);
    const prevCtx=existingReps.length?`Previous replies:\n${existingReps.slice(-4).map(r=>`${r.author}: ${r.content}`).join('\n')}`:'';

    const prompt=`Generate ${numRep} natural social media reply(ies) for this forum post.
Post by ${thread.author}: "${(thread.title?thread.title+' — ':'') + thread.content}"
${prevCtx}
Reply from: ${repliers.map(r=>r.name).join(', ')}
Rules: casual 1-3 sentences, authentic to character personality, can agree/disagree/tease/ask/react.
Output: [{"author":"Name","posterType":"main","content":"Reply text","nestedReplies":[]}]`;

    try{
        const raw=await callAI(prompt,SYS_FORUM);
        const data=extractJSON(raw,'array');if(!data||!Array.isArray(data))return;
        const existing2=getBotPosts();const now=Date.now();const newReps=[];
        data.filter(r=>r&&typeof r.content==='string'&&r.content.length>0).forEach((r,i)=>{
            const rid='rep_'+(now+i*500)+'_'+Math.random().toString(36).substr(2,4);
            newReps.push({id:rid,type:'reply',posterType:r.posterType||'main',author:(r.author||repliers[0]?.name||'Someone').trim(),content:r.content.trim(),timestamp:new Date(now+i*600).toISOString(),parentId:threadId,likes:0,likedBy:[]});
            if(Array.isArray(r.nestedReplies)&&r.nestedReplies.length){
                addRepliesRecursive(r.nestedReplies,rid,newReps,now+i*500+50,1);
            }
        });
        if(!newReps.length)return;
        savePosts([...existing2,...newReps]);
        if($('#lumi-feed').length)renderFeed();
        // Notify if modal is closed
        if(!$('#lumi-overlay').is(':visible')) setForumNotify();
    }catch(e){console.error('[LumiPulse] aiReactToPost:',e);}
}

// ── Auto triggers ─────────────────────────────────────────────
function setupForumAutoTrigger(){
    $(document).off('messageReceived.lumi-forum').on('messageReceived.lumi-forum',async()=>{
        const f=EXT.forum;if(!f.enabled||!f.autoGen.enabled)return;
        EXT._internal.forumMsgCounter=(EXT._internal.forumMsgCounter||0)+1;const now=Date.now();let gen=false;
        if(f.autoGen.triggerType==='turn_count'&&EXT._internal.forumMsgCounter>=f.autoGen.turnInterval){gen=true;EXT._internal.forumMsgCounter=0;}
        if(f.autoGen.triggerType==='time_interval'&&(now-EXT._internal.lastForumGenTime)/60000>=f.autoGen.timeInterval){gen=true;EXT._internal.lastForumGenTime=now;}
        if(f.autoGen.triggerType==='random'&&Math.random()<f.autoGen.randomChance) gen=true;
        if(gen) await runForumRefresh();

        // Auto-react to player's most recent post/reply after each RP turn
        if(f.autoReactOnRP){
            const playerPosts=getBotPosts().filter(p=>p.posterType==='player').slice(-3);
            if(playerPosts.length){
                const target=playerPosts[playerPosts.length-1];
                const threadId=target.type==='thread'?target.id:target.parentId;
                if(threadId) setTimeout(()=>aiReactToPost(threadId),1500);
            }
        }
    });
}

function setupDiaryAutoTrigger(){
    $(document).off('messageReceived.lumi-diary').on('messageReceived.lumi-diary',async()=>{
        const cfg=EXT.diary.autoGen;if(!cfg.enabled)return;
        EXT._internal.diaryMsgCounter=(EXT._internal.diaryMsgCounter||0)+1;
        const lastMsg=(SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'').toLowerCase();let gen=false;
        if(cfg.triggerType==='turn_count'&&EXT._internal.diaryMsgCounter>=cfg.turnInterval){gen=true;EXT._internal.diaryMsgCounter=0;}
        else if(cfg.triggerType==='emotion'&&cfg.emotionKeywords.some(k=>lastMsg.includes(k)))gen=true;
        else if(cfg.triggerType==='random'&&Math.random()<cfg.randomChance)gen=true;
        if(gen){
            const results=await callDiaryAI('latest',cfg.turnInterval||20);
            if(results&&results.length){const ctx=SillyTavern.getContext(),bid=getBotId(),wm=EXT.diary.worldMode==='auto'?detectWorldMode():EXT.diary.worldMode;results.forEach(r=>saveMem({id:'mem_auto_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),timestamp:new Date().toISOString(),character:r.character||ctx.name2||'Character',botId:bid,worldMode:wm,content:{...r},meta:{isPinned:false,isFavorite:false,isSecret:r.isSecret||false,linkedIds:r.linkedIds||[],tags:extractTags(r.diary||'')}}));}
        }
    });
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
function renderSettings(){
    $('#lumi-title').text('Settings');
    const body=$('#lumi-body');body.data('view','settings');
    const s=EXT,ag=s.diary.autoGen,fg=s.forum.autoGen,api=s.api;
    const theme=s._internal.theme||'light';
    const pt=s.forum.posterTypes||{mainChars:true,npcs:true,citizens:true,news:true};

    body.html(`<div style="padding:12px 14px 24px;">

    <div class="lumi-form-card">
      <div class="lumi-form-title">Appearance</div>
      <label class="lumi-label">Theme</label>
      <div class="lumi-theme-toggle">
        <button class="lumi-theme-btn${theme==='light'?' active':''}" data-t="light">${I.sun} Light</button>
        <button class="lumi-theme-btn${theme==='dark'?' active':''}" data-t="dark">${I.moon} Dark</button>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">${I.key} Custom API (LumiPulse only)</div>
      <div class="lumi-set-row"><span>Use Custom API</span><input type="checkbox" id="api-en" ${api.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div id="api-cfg" style="display:${api.enabled?'block':'none'};">
        <div style="margin:8px 0 6px;"><label class="lumi-label">Provider</label>
          <select id="api-provider" class="lumi-select" style="width:100%;box-sizing:border-box;">
            <option value="openai" ${api.provider==='openai'?'selected':''}>OpenAI / Compatible</option>
            <option value="anthropic" ${api.provider==='anthropic'?'selected':''}>Anthropic Claude</option>
            <option value="google" ${api.provider==='google'?'selected':''}>Google Gemini</option>
          </select>
        </div>
        <div id="base-url-row" style="margin-bottom:6px;display:${api.provider==='google'?'none':'block'};">
          <label class="lumi-label">Base URL</label>
          <input type="text" id="api-url" value="${esc(api.baseUrl||'')}" class="lumi-input" placeholder="https://api.openai.com/v1">
        </div>
        <div style="margin-bottom:6px;"><label class="lumi-label">API Key</label>
          <div style="display:flex;gap:7px;align-items:center;">
            <input type="password" id="api-key" value="${esc(api.apiKey||'')}" class="lumi-input" style="flex:1;font-family:monospace;font-size:11px;" placeholder="sk-... or AIza...">
            <div class="api-status-dot ${api.apiKey?'dot-ok':'dot-idle'}" id="api-dot"></div>
          </div>
        </div>
        <div style="margin-bottom:10px;"><label class="lumi-label">Model <span style="font-weight:400;text-transform:none;font-size:10px;">(fetch after saving key)</span></label>
          <div style="display:flex;gap:6px;">
            <select id="api-model-sel" class="lumi-select" style="flex:1;"></select>
            <button id="btn-fetch-models" class="lumi-sm-btn" title="Fetch available models">${I.refresh}</button>
          </div>
          <div id="model-status" style="font-size:11px;color:var(--lsub);margin-top:4px;"></div>
        </div>
        <button id="btn-test-api" class="lumi-sm-btn" style="width:100%;justify-content:center;">${I.key} Test Connection</button>
        <div id="api-test-res" style="margin-top:6px;font-size:11px;color:var(--lsub);"></div>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">General</div>
      <div class="lumi-set-row"><span>Extension Enabled</span><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>World Mode</span><select id="set-wm"><option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option><option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option><option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option></select></div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Diary Auto-Gen</div>
      <div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="ag-en" ${ag.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="ag-tr"><option value="turn_count" ${ag.triggerType==='turn_count'?'selected':''}>Every X Messages</option><option value="emotion" ${ag.triggerType==='emotion'?'selected':''}>Emotion Keywords</option><option value="random" ${ag.triggerType==='random'?'selected':''}>Random</option></select></div>
      ${ag.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Messages per gen</span><input type="number" id="ag-int" value="${ag.turnInterval}" min="5" max="100" style="width:58px;"></div>`:''}
      ${ag.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="ag-chance" value="${Math.round(ag.randomChance*100)}" min="1" max="50" style="width:58px;"></div>`:''}
      ${ag.triggerType==='emotion'?`<div class="lumi-set-row" style="flex-direction:column;align-items:flex-start;gap:5px;"><span>Keywords (comma-sep)</span><input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" style="width:100%;box-sizing:border-box;background:var(--linput);border:1px solid var(--lborder);border-radius:8px;padding:5px 8px;color:var(--ltext);font-family:var(--ff);outline:none;"></div>`:''}
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Forum Auto-Gen</div>
      <div class="lumi-set-row"><span>Forum Enabled</span><input type="checkbox" id="forum-en" ${s.forum.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Auto-react to my RP</span><input type="checkbox" id="forum-react" ${s.forum.autoReactOnRP?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Auto-gen Enabled</span><input type="checkbox" id="forum-ag-en" ${fg.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="forum-tr"><option value="turn_count" ${fg.triggerType==='turn_count'?'selected':''}>Every X Msgs</option><option value="time_interval" ${fg.triggerType==='time_interval'?'selected':''}>Every X Min</option><option value="random" ${fg.triggerType==='random'?'selected':''}>Random</option></select></div>
      ${fg.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Messages</span><input type="number" id="forum-int" value="${fg.turnInterval}" min="3" max="100" style="width:58px;"></div>`:''}
      ${fg.triggerType==='time_interval'?`<div class="lumi-set-row"><span>Minutes</span><input type="number" id="forum-time" value="${fg.timeInterval}" min="1" max="60" style="width:58px;"></div>`:''}
      ${fg.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="forum-chance" value="${Math.round(fg.randomChance*100)}" min="1" max="50" style="width:58px;"></div>`:''}
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--lborder);">
        <div class="lumi-form-title" style="margin-bottom:8px;">Who can post?</div>
        <div class="lumi-set-row"><span>Main Characters</span><input type="checkbox" id="pt-main" ${pt.mainChars?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>NPCs (AI-named)</span><input type="checkbox" id="pt-npc" ${pt.npcs?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>Citizens (public)</span><input type="checkbox" id="pt-cit" ${pt.citizens?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
        <div class="lumi-set-row"><span>News Board</span><input type="checkbox" id="pt-news" ${pt.news?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Data</div>
      <div style="display:flex;gap:8px;">
        <button id="btn-rst" class="lumi-sm-btn" style="flex:1;justify-content:center;">${I.refresh} Reset FAB</button>
        <button id="btn-clr-all" class="lumi-sm-btn lumi-danger-btn" style="flex:1;justify-content:center;">${I.trash} Clear All</button>
      </div>
    </div>
    </div>`);

    // Populate model dropdown
    const populateModels=(models,selected)=>{
        const sel=$('#api-model-sel');sel.empty();
        models.forEach(m=>sel.append(`<option value="${esc(m)}"${m===selected?' selected':''}>${esc(m)}</option>`));
        if(selected&&!models.includes(selected)) sel.prepend(`<option value="${esc(selected)}" selected>${esc(selected)}</option>`);
        if(!models.length) sel.append(`<option value="">-- fetch models first --</option>`);
    };
    populateModels(api.model?[api.model]:[], api.model||'');

    // Theme toggle
    $('.lumi-theme-btn').on('click',function(){EXT._internal.theme=$(this).data('t');applyTheme(EXT._internal.theme);save();renderSettings();});

    // API events
    $('#api-en').on('change',function(){EXT.api.enabled=$(this).prop('checked');save();$('#api-cfg').toggle(EXT.api.enabled);});
    $('#api-provider').on('change',function(){EXT.api.provider=$(this).val();save();$('#base-url-row').toggle(EXT.api.provider!=='google');});
    $('#api-url').on('change',function(){EXT.api.baseUrl=$(this).val().trim();save();});
    $('#api-key').on('change',function(){EXT.api.apiKey=$(this).val().trim();save();$('#api-dot').attr('class','api-status-dot '+(EXT.api.apiKey?'dot-ok':'dot-idle'));});

    $('#btn-fetch-models').on('click',async function(){
        const $btn=$(this);$btn.html(`<span class="lumi-spin lumi-spin-c"></span>`).prop('disabled',true);
        $('#model-status').text('Fetching models...');
        try{
            const models=await fetchAvailableModels();
            EXT.api.model=models[0]||EXT.api.model||'';save();
            populateModels(models,EXT.api.model);
            $('#model-status').html(`<span style="color:#34D399;">✓ Found ${models.length} models</span>`);
        }catch(e){$('#model-status').html(`<span style="color:#FF4757;">✗ ${esc(e.message.slice(0,60))}</span>`);}
        $btn.html(I.refresh).prop('disabled',false);
    });

    $('#api-model-sel').on('change',function(){EXT.api.model=$(this).val();save();});

    $('#btn-test-api').on('click',async function(){
        const $btn=$(this);$btn.html(`<span class="lumi-spin lumi-spin-c"></span> Testing...`).prop('disabled',true);
        // Save current values first
        EXT.api.baseUrl=$('#api-url').val().trim();EXT.api.apiKey=$('#api-key').val().trim();EXT.api.model=$('#api-model-sel').val();save();
        try{
            const res=await callCustomAPI('Reply with only the word "OK".','You are a test assistant. Reply with exactly one word: OK');
            if(res){$('#api-test-res').html(`<span style="color:#34D399;">✓ Connected: "${esc(res.trim().slice(0,40))}"</span>`);$('#api-dot').attr('class','api-status-dot dot-ok');}
            else{$('#api-test-res').html(`<span style="color:#FF4757;">✗ Empty response</span>`);$('#api-dot').attr('class','api-status-dot dot-err');}
        }catch(e){$('#api-test-res').html(`<span style="color:#FF4757;">✗ ${esc(e.message.slice(0,80))}</span>`);$('#api-dot').attr('class','api-status-dot dot-err');}
        $btn.html(`${I.key} Test Connection`).prop('disabled',false);
    });

    // General
    $('#set-en').on('change',function(){EXT.isEnabled=$(this).prop('checked');save();});
    $('#set-wm').on('change',function(){EXT.diary.worldMode=$(this).val();save();});
    $('#ag-en').on('change',function(){EXT.diary.autoGen.enabled=$(this).prop('checked');save();});
    $('#ag-tr').on('change',function(){EXT.diary.autoGen.triggerType=$(this).val();save();renderSettings();});
    $('#ag-int').on('change',function(){EXT.diary.autoGen.turnInterval=parseInt($(this).val())||20;save();});
    $('#ag-chance').on('change',function(){EXT.diary.autoGen.randomChance=(parseInt($(this).val())||10)/100;save();});
    $('#ag-kw').on('change',function(){EXT.diary.autoGen.emotionKeywords=$(this).val().split(',').map(k=>k.trim()).filter(Boolean);save();});
    $('#forum-en').on('change',function(){EXT.forum.enabled=$(this).prop('checked');save();});
    $('#forum-react').on('change',function(){EXT.forum.autoReactOnRP=$(this).prop('checked');save();});
    $('#forum-ag-en').on('change',function(){EXT.forum.autoGen.enabled=$(this).prop('checked');save();});
    $('#forum-tr').on('change',function(){EXT.forum.autoGen.triggerType=$(this).val();save();renderSettings();});
    $('#forum-int').on('change',function(){EXT.forum.autoGen.turnInterval=parseInt($(this).val())||8;save();});
    $('#forum-time').on('change',function(){EXT.forum.autoGen.timeInterval=parseInt($(this).val())||5;save();});
    $('#forum-chance').on('change',function(){EXT.forum.autoGen.randomChance=(parseInt($(this).val())||15)/100;save();});
    $('#pt-main').on('change',function(){EXT.forum.posterTypes.mainChars=$(this).prop('checked');save();});
    $('#pt-npc').on('change',function(){EXT.forum.posterTypes.npcs=$(this).prop('checked');save();});
    $('#pt-cit').on('change',function(){EXT.forum.posterTypes.citizens=$(this).prop('checked');save();});
    $('#pt-news').on('change',function(){EXT.forum.posterTypes.news=$(this).prop('checked');save();});
    $('#btn-rst').on('click',()=>{EXT._internal.fabPos=null;save();$('#lumi-fab').remove();spawnFAB();toast('✓ FAB reset');});
    $('#btn-clr-all').on('click',()=>{if(confirm('Clear ALL memories and forum posts?')){EXT.memories=[];EXT.forumPosts={};EXT.forumNotify={};EXT._internal.nameRegistry={};save();updateFabDot();toast('✓ Cleared');}});
}

// ═══════════════════════════════════════════════════════════
// ST SETTINGS PANEL
// ═══════════════════════════════════════════════════════════
function createSettingsPanel(){
    if($('#lumi-panel').length)return;
    $('#extensions_settings').append(`<div id="lumi-panel" class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="font-family:var(--ff);color:var(--lp);font-weight:700;">LumiPulse v6</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="display:none;padding:10px;"></div></div>`);
}

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
const exportText=(c,f)=>{const b=new Blob([c],{type:'text/markdown'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=f;a.click();URL.revokeObjectURL(u);toast('✓ Exported');};
const exportJSON=(d,f)=>{const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=f;a.click();URL.revokeObjectURL(u);toast('✓ Exported');};
