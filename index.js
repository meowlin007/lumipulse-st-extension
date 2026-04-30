"use strict";
// ════════════════════════════════════════════════════════════
// LUMIPULSE v5  —  SillyTavern Extension
// ════════════════════════════════════════════════════════════
const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    forumPosts: {},          // { [botId]: Post[] }
    _internal: {
        fabPos: null, theme: 'sakura',
        nameRegistry: {},
        filterChar: '', filterDate: '', filterLoc: '',
        forumMsgCounter: 0, lastForumGenTime: 0,
        diaryMsgCounter: 0
    },
    api: {
        enabled: false,       // use custom API for extension
        provider: 'openai',   // 'openai' | 'anthropic' | 'custom'
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4o-mini',
        maxTokens: 800
    },
    diary: {
        worldMode: 'auto',
        display: { secretMode: 'time', showSecretSystem: false },
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','กลัว'], randomChance: 0.08 },
        storage: { max: 150 }
    },
    forum: {
        enabled: true,
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 8, timeInterval: 5, randomChance: 0.15 },
        storage: { max: 300 },
        // Types of posters that can appear
        posterTypes: { mainChars: true, npcs: true, citizens: true, news: true }
    }
};

let EXT = {};   // shortcut to extension_settings[extensionName]

// ── Asset URLs ─────────────────────────────────────────────
const ASSETS = {
    fab:      "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png",
    diary:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png",
    forum:    "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png",
    settings: "https://file.garden/ad59q6JMmVnp7v1-/setting-icon.png"
};

// ── SVG Icons ──────────────────────────────────────────────
const I = {
    close:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    back:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
    plus:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    heart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartF:   `<svg viewBox="0 0 24 24" fill="#FF6B9D" stroke="#FF6B9D" stroke-width="2" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    send:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    refresh:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    spark:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`,
    book:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    link:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    pin:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`,
    trash:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    tag:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    mappin:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    lock:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    mood:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    scroll:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    key:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
    api:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    news:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>`,
};

// ── Themes ─────────────────────────────────────────────────
const THEMES = {
    sakura: {
        name:'Sakura Night', font:"'Kaisei Decol', serif",
        p:'#FF6B9D', s:'#FF3D7F', a:'rgba(255,107,157,0.12)',
        bg:'#0D0A12', card:'#16101F', border:'rgba(255,107,157,0.18)',
        text:'#F0E6FF', sub:'#9B8BB0', danger:'#FF4757',
        grad:'linear-gradient(135deg,#FF6B9D,#FF3D7F)',
        tag:'rgba(255,107,157,0.15)', tagText:'#FF9EC4',
        glow:'0 0 20px rgba(255,107,157,0.25)'
    },
    cyber: {
        name:'Cyber Void', font:"'Share Tech Mono', monospace",
        p:'#00F5D4', s:'#00C4A7', a:'rgba(0,245,212,0.10)',
        bg:'#050A0F', card:'#0A1520', border:'rgba(0,245,212,0.2)',
        text:'#C8FFF8', sub:'#5A8A82', danger:'#FF2052',
        grad:'linear-gradient(135deg,#00F5D4,#0093FF)',
        tag:'rgba(0,245,212,0.12)', tagText:'#00F5D4',
        glow:'0 0 20px rgba(0,245,212,0.2)'
    },
    violet: {
        name:'Violet Dusk', font:"'Cinzel', serif",
        p:'#B07FFF', s:'#8B5CF6', a:'rgba(176,127,255,0.12)',
        bg:'#08060F', card:'#100E1E', border:'rgba(176,127,255,0.18)',
        text:'#EAE0FF', sub:'#7B6B99', danger:'#FF4455',
        grad:'linear-gradient(135deg,#B07FFF,#5B21B6)',
        tag:'rgba(176,127,255,0.15)', tagText:'#C9A7FF',
        glow:'0 0 20px rgba(176,127,255,0.2)'
    },
    gold: {
        name:'Golden Era', font:"'Cormorant Garamond', serif",
        p:'#D4A843', s:'#B8860B', a:'rgba(212,168,67,0.12)',
        bg:'#0A0800', card:'#140F03', border:'rgba(212,168,67,0.2)',
        text:'#FFF4CC', sub:'#8A7A4A', danger:'#FF4444',
        grad:'linear-gradient(135deg,#D4A843,#8B6914)',
        tag:'rgba(212,168,67,0.15)', tagText:'#FFD77A',
        glow:'0 0 20px rgba(212,168,67,0.2)'
    }
};

function applyTheme(name) {
    const t = THEMES[name] || THEMES.sakura;
    const r = document.documentElement;
    const vars = {
        '--lp':t.p,'--ls':t.s,'--la':t.a,'--lbg':t.bg,
        '--lcard':t.card,'--lborder':t.border,'--ltext':t.text,
        '--lsub':t.sub,'--ldanger':t.danger,'--lgrad':t.grad,
        '--ltag':t.tag,'--ltagtext':t.tagText,'--lglow':t.glow,
        '--lfont':t.font
    };
    Object.entries(vars).forEach(([k,v])=>r.style.setProperty(k,v));
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
        // Deep merge missing keys
        const s = ES[extensionName];
        if (!s.api) s.api = JSON.parse(JSON.stringify(defaultSettings.api));
        if (!s._internal) s._internal = {};
        if (Array.isArray(s.forumPosts)) s.forumPosts = {};
        if (!s.forumPosts) s.forumPosts = {};
        if (!s.forum.posterTypes) s.forum.posterTypes = { mainChars:true, npcs:true, citizens:true, news:true };
        ['forumMsgCounter','lastForumGenTime','diaryMsgCounter'].forEach(k => {
            if (typeof s._internal[k] === 'undefined') s._internal[k] = 0;
        });
    }

    ctx.saveSettingsDebounced();
    EXT = ctx.extensionSettings[extensionName];
    applyTheme(EXT._internal.theme || 'sakura');
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
const botId = () => SillyTavern.getContext().characterId || '__default__';
const botPosts = () => { if (!EXT.forumPosts[botId()]) EXT.forumPosts[botId()] = []; return EXT.forumPosts[botId()]; };
const savePosts = (arr) => {
    EXT.forumPosts[botId()] = arr.slice(-(EXT.forum.storage.max || 300));
    SillyTavern.getContext().saveSettingsDebounced();
};
const save = () => SillyTavern.getContext().saveSettingsDebounced();
const esc  = (s) => { if (typeof s !== 'string') return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); };
const colorOf = (str) => {
    const c=['#FF6B9D','#A78BFA','#34D399','#38BDF8','#FB923C','#E879F9','#FBBF24','#60A5FA'];
    let h=0; for(let i=0;i<(str||'').length;i++) h=str.charCodeAt(i)+((h<<5)-h);
    return c[Math.abs(h)%c.length];
};
const timeAgo = (d) => {
    const s=Math.floor((Date.now()-new Date(d))/1000);
    if(s<60) return 'just now'; if(s<3600) return Math.floor(s/60)+'m'; if(s<86400) return Math.floor(s/3600)+'h'; return Math.floor(s/86400)+'d';
};
const toast = (msg, type='ok') => {
    $('.lumi-toast').remove();
    const el = $(`<div class="lumi-toast lumi-toast-${type}">${msg}</div>`);
    $('body').append(el);
    setTimeout(()=>el.fadeOut(300,()=>el.remove()), 2500);
};

// ── Levenshtein similarity ─────────────────────────────────
function simScore(a,b){
    a=a.toLowerCase().trim(); b=b.toLowerCase().trim();
    if(!a.length||!b.length) return 0;
    const dp=Array(a.length+1).fill(null).map((_,i)=>Array(b.length+1).fill(0).map((_,j)=>i||j));
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
        dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
    return ((Math.max(a.length,b.length)-dp[a.length][b.length])/Math.max(a.length,b.length))*100;
}

// ── JSON extractor (robust) ────────────────────────────────
function extractJSON(raw, type='array') {
    if (!raw || typeof raw !== 'string') return null;
    // strip think tags, code fences
    let s = raw.replace(/<think>[\s\S]*?<\/think>/gi,'')
               .replace(/```json[\s\S]*?```/g, m=>m.replace(/```json/,'').replace(/```/,''))
               .replace(/```[\s\S]*?```/g, m=>m.replace(/```/g,''))
               .trim();
    const opener = type==='array'?'[':'{', closer = type==='array'?']':'}';
    const start = s.indexOf(opener);
    if (start===-1) return null;
    let depth=0, end=-1;
    for(let i=start;i<s.length;i++){
        if(s[i]===opener) depth++;
        else if(s[i]===closer){depth--;if(depth===0){end=i;break;}}
    }
    if(end===-1) return null;
    try { return JSON.parse(s.slice(start,end+1)); } catch(e){ return null; }
}

// ════════════════════════════════════════════════════════════
// CUSTOM API LAYER
// ════════════════════════════════════════════════════════════
async function callAI(prompt, systemPrompt='') {
    const ctx = SillyTavern.getContext();

    // Try custom API first if configured
    if (EXT.api.enabled && EXT.api.apiKey) {
        try {
            return await callCustomAPI(prompt, systemPrompt);
        } catch(e) {
            console.warn('[LumiPulse] Custom API failed, falling back to ST:', e.message);
        }
    }

    // Fallback: SillyTavern built-in
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    let res;
    if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(fullPrompt, false, false);
    else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(fullPrompt, true);
    return res || '';
}

async function callCustomAPI(prompt, systemPrompt) {
    const cfg = EXT.api;
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    let url, headers, body;

    if (cfg.provider === 'anthropic') {
        url = (cfg.baseUrl || 'https://api.anthropic.com') + '/v1/messages';
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': cfg.apiKey,
            'anthropic-version': '2023-06-01'
        };
        body = JSON.stringify({
            model: cfg.model || 'claude-3-haiku-20240307',
            max_tokens: cfg.maxTokens || 800,
            system: systemPrompt || 'You are a helpful assistant.',
            messages: [{ role:'user', content: prompt }]
        });
    } else {
        // OpenAI-compatible
        url = (cfg.baseUrl || 'https://api.openai.com/v1') + '/chat/completions';
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cfg.apiKey}`
        };
        body = JSON.stringify({
            model: cfg.model || 'gpt-4o-mini',
            max_tokens: cfg.maxTokens || 800,
            messages
        });
    }

    const resp = await fetch(url, { method:'POST', headers, body });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`API ${resp.status}: ${err.slice(0,100)}`);
    }
    const data = await resp.json();

    // Parse response
    if (cfg.provider === 'anthropic') {
        return data.content?.[0]?.text || '';
    } else {
        return data.choices?.[0]?.message?.content || '';
    }
}

// ════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const el = document.createElement('style');
    el.id = 'lumi-styles';
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;500;700&family=Noto+Sans+Thai:wght@300;400;500;600&family=Share+Tech+Mono&family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

:root{
  --lp:#FF6B9D;--ls:#FF3D7F;--la:rgba(255,107,157,0.12);
  --lbg:#0D0A12;--lcard:#16101F;--lborder:rgba(255,107,157,0.18);
  --ltext:#F0E6FF;--lsub:#9B8BB0;--ldanger:#FF4757;
  --lgrad:linear-gradient(135deg,#FF6B9D,#FF3D7F);
  --ltag:rgba(255,107,157,0.15);--ltagtext:#FF9EC4;
  --lglow:0 0 20px rgba(255,107,157,0.25);
  --lfont:'Kaisei Decol',serif;
}

@keyframes lumiIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideLeft{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:var(--lglow)}50%{box-shadow:0 0 35px rgba(255,107,157,.45)}}
@keyframes ripple{0%{transform:scale(0);opacity:.6}100%{transform:scale(2.5);opacity:0}}
@keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.5)}70%{transform:scale(.9)}100%{transform:scale(1)}}
@keyframes newPost{0%{opacity:0;transform:translateX(-16px) scale(.97)}100%{opacity:1;transform:translateX(0) scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes dot-bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}

/* ── FAB ─────────────── */
#lumi-fab{
  position:fixed;z-index:99999;width:50px;height:50px;border-radius:50%;
  background:var(--lcard) url("${ASSETS.fab}") no-repeat center/26px;
  border:1.5px solid var(--lborder);
  box-shadow:var(--lglow),0 8px 24px rgba(0,0,0,.5);
  cursor:grab;touch-action:none;user-select:none;
  transition:box-shadow .3s,transform .18s;
}
#lumi-fab:hover{box-shadow:var(--lglow),0 0 0 6px var(--la),0 8px 24px rgba(0,0,0,.5);animation:glow 2s infinite;}
#lumi-fab:active{transform:scale(.9);cursor:grabbing;}

/* ── Menu ─────────────── */
.lumi-menu{
  position:fixed;z-index:99998;display:none;
  background:rgba(10,8,18,.92);backdrop-filter:blur(24px) saturate(180%);
  border-radius:20px;padding:16px;
  border:1px solid var(--lborder);
  box-shadow:0 16px 48px rgba(0,0,0,.6),var(--lglow);
  font-family:var(--lfont),'Noto Sans Thai',sans-serif;min-width:190px;
}
.lumi-menu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.lumi-menu-item{
  display:flex;flex-direction:column;align-items:center;gap:7px;
  cursor:pointer;padding:12px 6px;border-radius:14px;
  border:1px solid transparent;transition:.2s;
}
.lumi-menu-item:hover{background:var(--la);border-color:var(--lborder);}
.lumi-menu-item img{width:36px;height:36px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));}
.lumi-menu-item span{font-size:10px;color:var(--lsub);font-weight:500;letter-spacing:.3px;}

/* ── Overlay & Modal ─── */
.lumi-overlay{
  position:fixed;top:0;left:0;width:100vw;height:100dvh;
  background:rgba(0,0,0,.7);backdrop-filter:blur(10px);
  z-index:100000;display:none;align-items:center;justify-content:center;
}
.lumi-modal{
  width:94%;max-width:490px;height:91dvh;
  background:var(--lbg);
  border-radius:24px;border:1px solid var(--lborder);
  box-shadow:0 24px 80px rgba(0,0,0,.7),var(--lglow);
  display:flex;flex-direction:column;overflow:hidden;
  font-family:var(--lfont),'Noto Sans Thai',sans-serif;
  animation:lumiIn .28s cubic-bezier(.34,1.56,.64,1);
  color:var(--ltext);
}
.lumi-head{
  padding:13px 16px;display:flex;justify-content:space-between;align-items:center;
  border-bottom:1px solid var(--lborder);
  background:linear-gradient(180deg,var(--lcard),var(--lbg));
  flex-shrink:0;gap:12px;
}
.lumi-head-title{font-size:14px;color:var(--lp);font-weight:600;letter-spacing:.3px;flex:1;text-align:center;}
.lumi-icon-btn{
  width:30px;height:30px;border-radius:50%;
  background:var(--la);border:1px solid var(--lborder);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--lsub);transition:.15s;flex-shrink:0;
}
.lumi-icon-btn:hover{background:var(--lborder);color:var(--ltext);}
.lumi-body{flex:1;overflow-y:auto;background:var(--lbg);color:var(--ltext);scrollbar-width:thin;scrollbar-color:var(--lborder) transparent;}
.lumi-body::-webkit-scrollbar{width:3px;}
.lumi-body::-webkit-scrollbar-thumb{background:var(--lborder);border-radius:2px;}

/* ── Nav Tabs ─────────── */
.lumi-nav{
  display:flex;gap:5px;padding:10px 12px 0;
  border-bottom:1px solid var(--lborder);background:var(--lcard);flex-shrink:0;
}
.lumi-tab{
  flex:1;text-align:center;padding:9px 4px 10px;
  border-radius:10px 10px 0 0;
  color:var(--lsub);font-size:11px;font-weight:500;cursor:pointer;
  transition:.18s;display:flex;align-items:center;justify-content:center;gap:5px;
  position:relative;
}
.lumi-tab::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:transparent;transition:.2s;}
.lumi-tab.active{color:var(--lp);}
.lumi-tab.active::after{background:var(--lp);}
.lumi-tab:hover:not(.active){color:var(--ltext);background:var(--la);}

/* ── Generic Blocks ──── */
.lumi-section{padding:12px 14px;}
.lumi-hero{
  background:var(--lgrad);padding:18px 16px 14px;position:relative;overflow:hidden;
}
.lumi-hero::before{content:'';position:absolute;top:-40px;right:-30px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.07);}
.lumi-hero::after{content:'';position:absolute;bottom:-25px;left:-15px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.04);}
.lumi-hero-eyebrow{font-size:10px;color:rgba(255,255,255,.75);letter-spacing:.8px;text-transform:uppercase;margin-bottom:3px;display:flex;align-items:center;gap:5px;}
.lumi-hero-title{font-size:22px;font-weight:700;color:#fff;letter-spacing:-.5px;position:relative;}
.lumi-hero-sub{font-size:11px;color:rgba(255,255,255,.7);margin-top:4px;position:relative;}
.lumi-stats{display:flex;gap:8px;padding:10px 14px;}
.lumi-stat{
  flex:1;text-align:center;background:var(--lcard);border:1px solid var(--lborder);
  border-radius:14px;padding:10px 5px;
}
.lumi-stat b{display:block;font-size:20px;color:var(--lp);font-weight:700;line-height:1;}
.lumi-stat span{font-size:9px;color:var(--lsub);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;display:block;}
.lumi-form-card{background:var(--lcard);border:1px solid var(--lborder);border-radius:16px;padding:14px;margin-bottom:12px;}
.lumi-form-title{font-size:10px;font-weight:700;color:var(--lsub);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;}
.lumi-label{font-size:10px;color:var(--lsub);display:block;margin-bottom:5px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;}
.lumi-input{
  width:100%;background:var(--lbg);border:1px solid var(--lborder);border-radius:10px;
  padding:9px 12px;color:var(--ltext);font-family:var(--lfont),'Noto Sans Thai',sans-serif;
  font-size:13px;outline:none;box-sizing:border-box;transition:.15s;
}
.lumi-input:focus{border-color:var(--lp);box-shadow:0 0 0 3px var(--la);}
.lumi-textarea{min-height:70px;resize:none;max-height:160px;}
.lumi-set-row{
  display:flex;justify-content:space-between;align-items:center;
  padding:9px 0;border-bottom:1px solid var(--lborder);font-size:13px;color:var(--lsub);
}
.lumi-set-row:last-child{border-bottom:none;}
.lumi-set-row span{font-size:12px;}
.lumi-set-row select,.lumi-set-row input[type=number],.lumi-set-row input[type=text]{
  background:var(--lbg);border:1px solid var(--lborder);border-radius:8px;
  padding:5px 8px;color:var(--ltext);font-family:var(--lfont),'Noto Sans Thai',sans-serif;
  outline:none;font-size:12px;
}
.lumi-select{
  background:var(--lbg);border:1px solid var(--lborder);border-radius:10px;
  padding:8px 10px;color:var(--ltext);font-family:var(--lfont),'Noto Sans Thai',sans-serif;
  font-size:12px;outline:none;
}
.lumi-btn{
  background:var(--lgrad);color:#fff;border:none;
  padding:10px 16px;border-radius:20px;
  font-family:var(--lfont),'Noto Sans Thai',sans-serif;font-weight:600;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
  font-size:12px;width:100%;transition:.2s;
  box-shadow:0 4px 14px rgba(0,0,0,.3);
}
.lumi-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.4),var(--lglow);}
.lumi-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.lumi-sm-btn{
  background:var(--la);color:var(--lp);border:1px solid var(--lborder);
  padding:7px 13px;border-radius:14px;
  font-family:var(--lfont),'Noto Sans Thai',sans-serif;font-weight:600;
  cursor:pointer;font-size:11px;display:flex;align-items:center;gap:5px;
  transition:.15s;white-space:nowrap;
}
.lumi-sm-btn:hover{background:var(--lborder);}
.lumi-sm-btn:disabled{opacity:.5;cursor:not-allowed;}
.lumi-danger-btn{background:rgba(255,71,87,.12);color:var(--ldanger);border-color:rgba(255,71,87,.3);}
.lumi-danger-btn:hover{background:rgba(255,71,87,.2);}
.lumi-badge{
  font-size:10px;padding:2px 8px;border-radius:6px;
  background:var(--ltag);color:var(--ltagtext);
  display:inline-flex;align-items:center;gap:3px;font-weight:500;
}
.lumi-empty{text-align:center;padding:48px 20px;}
.lumi-empty-icon{font-size:44px;margin-bottom:12px;opacity:.3;}
.lumi-empty-text{font-size:13px;color:var(--lsub);line-height:1.6;}

/* ── Toast ────────────── */
.lumi-toast{
  position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
  padding:10px 20px;border-radius:20px;z-index:999999;
  font-family:var(--lfont),'Noto Sans Thai',sans-serif;font-size:12px;
  animation:lumiIn .25s;pointer-events:none;white-space:nowrap;
}
.lumi-toast-ok{background:rgba(0,0,0,.85);border:1px solid var(--lborder);color:var(--ltext);backdrop-filter:blur(12px);}
.lumi-toast-err{background:rgba(255,71,87,.15);border:1px solid rgba(255,71,87,.4);color:#FF6B6B;}

/* ── Spinner ──────────── */
.lumi-spin{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.2);border-radius:50%;border-top-color:#fff;animation:spin .7s linear infinite;}
.lumi-spin-dark{border-color:var(--la);border-top-color:var(--lp);}

/* ── Typing indicator ─── */
.typing-dots span{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--lsub);margin:0 2px;animation:dot-bounce 1.4s ease-in-out infinite both;}
.typing-dots span:nth-child(1){animation-delay:-.32s;}
.typing-dots span:nth-child(2){animation-delay:-.16s;}

/* ── Diary Cards ─────── */
.lumi-diary-pad{padding:10px 14px 14px;}
.lumi-timeline-sep{
  display:flex;align-items:center;gap:8px;font-size:10px;
  color:var(--lsub);font-weight:600;letter-spacing:.8px;text-transform:uppercase;
  padding:10px 0 6px;
}
.lumi-timeline-sep::after{content:'';flex:1;height:1px;background:var(--lborder);}
.lumi-card{
  background:var(--lcard);border:1px solid var(--lborder);border-radius:16px;
  padding:13px;margin-bottom:9px;position:relative;
  transition:box-shadow .2s,transform .2s;animation:fadeUp .3s ease;
}
.lumi-card:hover{box-shadow:var(--lglow);transform:translateY(-2px);}
.lumi-card-header{display:flex;align-items:center;gap:9px;margin-bottom:8px;}
.lumi-avatar{
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:13px;font-weight:700;flex-shrink:0;
  box-shadow:0 2px 8px rgba(0,0,0,.4);
}
.lumi-avatar-sm{width:24px;height:24px;font-size:10px;}
.lumi-char-name{font-size:13px;font-weight:600;color:var(--ltext);flex:1;}
.lumi-card-meta{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:7px;}
.lumi-card-body{font-size:13px;color:var(--ltext);line-height:1.65;white-space:pre-wrap;margin:0 0 10px;}
.lumi-card-footer{display:flex;gap:5px;justify-content:flex-end;padding-top:8px;border-top:1px solid var(--lborder);}
.lumi-act{
  background:none;border:1px solid transparent;border-radius:8px;cursor:pointer;
  color:var(--lsub);transition:.15s;padding:4px 9px;font-size:11px;
  display:flex;align-items:center;gap:4px;font-family:var(--lfont),'Noto Sans Thai',sans-serif;
}
.lumi-act:hover{background:var(--la);border-color:var(--lborder);color:var(--lp);}
.lumi-act.act-on{color:var(--lp);background:var(--la);}
.lumi-act.act-danger:hover{background:rgba(255,71,87,.12);color:var(--ldanger);}

/* ── FORUM ──────────────────────────────────────────── */
.lumi-forum-layout{display:flex;gap:10px;padding:10px 12px 14px;}
.lumi-feed{flex:1;overflow-y:auto;min-width:0;max-height:calc(91dvh - 200px);}
.lumi-sidebar{width:155px;flex-shrink:0;overflow-y:auto;max-height:calc(91dvh - 200px);}

.lumi-post{
  background:var(--lcard);border:1px solid var(--lborder);border-radius:18px;
  padding:14px;margin-bottom:10px;
  animation:newPost .35s cubic-bezier(.34,1.2,.64,1);
  position:relative;overflow:hidden;
}
.lumi-post::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--lborder),transparent);
}
.lumi-post.post-news{border-color:rgba(251,146,60,.3);}
.lumi-post.post-news::before{background:linear-gradient(90deg,transparent,rgba(251,146,60,.5),transparent);}
.lumi-post.post-citizen{opacity:.9;}
.lumi-post-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
.lumi-post-author-wrap{flex:1;}
.lumi-post-author{font-size:13px;font-weight:600;color:var(--ltext);}
.lumi-post-meta{font-size:10px;color:var(--lsub);margin-top:1px;display:flex;align-items:center;gap:6px;}
.lumi-post-type-badge{
  font-size:9px;padding:1px 6px;border-radius:4px;font-weight:700;
  letter-spacing:.4px;text-transform:uppercase;
}
.badge-news{background:rgba(251,146,60,.15);color:#FB923C;}
.badge-main{background:var(--la);color:var(--lp);}
.badge-npc{background:rgba(139,92,246,.12);color:#A78BFA;}
.badge-citizen{background:rgba(52,211,153,.1);color:#34D399;}
.lumi-post-title{font-size:14px;font-weight:700;color:var(--ltext);margin-bottom:5px;line-height:1.3;}
.lumi-post-body{font-size:13px;color:var(--ltext);line-height:1.65;margin-bottom:11px;}
.lumi-post-tag{
  display:inline-flex;align-items:center;gap:3px;
  font-size:10px;padding:2px 8px;border-radius:5px;
  background:var(--ltag);color:var(--ltagtext);margin-bottom:8px;font-weight:600;
}
.lumi-post-actions{display:flex;gap:6px;padding-top:10px;border-top:1px solid var(--lborder);}
.lumi-post-btn{
  flex:1;background:none;border:1px solid var(--lborder);border-radius:10px;
  padding:7px 8px;cursor:pointer;font-size:11px;
  font-family:var(--lfont),'Noto Sans Thai',sans-serif;
  color:var(--lsub);transition:.15s;display:flex;align-items:center;
  justify-content:center;gap:5px;font-weight:500;
}
.lumi-post-btn:hover{background:var(--la);color:var(--lp);border-color:var(--lborder);}
.lumi-post-btn.liked{
  background:rgba(255,107,157,.12);color:var(--lp);
  border-color:rgba(255,107,157,.3);
}
.lumi-post-btn.liked svg{animation:heartPop .4s ease;}
.lumi-replies-wrap{display:none;margin-top:10px;padding-left:10px;border-left:2px solid var(--lborder);}
.lumi-reply{padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);}
.lumi-reply:last-of-type{border-bottom:none;}
.lumi-reply-head{display:flex;align-items:center;gap:7px;margin-bottom:4px;}
.lumi-reply-name{font-size:11px;font-weight:600;color:var(--ltext);}
.lumi-reply-time{font-size:10px;color:var(--lsub);margin-left:auto;}
.lumi-reply-body{font-size:12px;color:var(--ltext);line-height:1.6;padding-left:31px;}
.lumi-compose-reply{display:flex;gap:7px;margin-top:9px;padding-left:2px;}
.lumi-reply-input{
  flex:1;background:var(--la);border:1px solid var(--lborder);border-radius:16px;
  padding:7px 13px;font-size:12px;font-family:var(--lfont),'Noto Sans Thai',sans-serif;
  color:var(--ltext);outline:none;resize:none;min-height:34px;max-height:80px;
  transition:.15s;
}
.lumi-reply-input:focus{border-color:var(--lp);}
.lumi-reply-send-btn{
  width:34px;height:34px;border-radius:50%;background:var(--lgrad);border:none;
  color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:.2s;
}
.lumi-reply-send-btn:hover{box-shadow:var(--lglow);}

/* ── Compose Box ──────── */
.lumi-compose{
  margin:10px 12px 0;
  background:var(--lcard);border:1px solid var(--lborder);border-radius:18px;padding:13px;
}
.lumi-compose-row{display:flex;align-items:center;gap:9px;margin-bottom:9px;}
.lumi-compose-footer{display:flex;gap:7px;align-items:center;margin-top:9px;}

/* ── Sidebar ─────────── */
.lumi-sidebar-section{margin-bottom:14px;}
.lumi-sidebar-title{font-size:9px;font-weight:700;color:var(--lsub);letter-spacing:.8px;text-transform:uppercase;margin-bottom:8px;}
.lumi-member-card{
  display:flex;align-items:center;gap:7px;padding:8px 9px;
  background:var(--lcard);border:1px solid var(--lborder);border-radius:11px;
  margin-bottom:6px;cursor:pointer;transition:.15s;
}
.lumi-member-card:hover{border-color:var(--lp);background:var(--la);}
.lumi-member-name{font-size:11px;font-weight:600;color:var(--ltext);}
.lumi-member-posts{font-size:9px;color:var(--lsub);margin-top:1px;}

/* ── Reload Btn ──────── */
.lumi-reload-bar{
  display:flex;gap:7px;align-items:center;padding:8px 12px;
  border-bottom:1px solid var(--lborder);background:var(--lcard);flex-shrink:0;
}
.lumi-reload-btn{
  flex:1;background:var(--la);border:1px solid var(--lborder);border-radius:12px;
  padding:8px 10px;cursor:pointer;font-size:11px;
  font-family:var(--lfont),'Noto Sans Thai',sans-serif;
  color:var(--lp);transition:.18s;display:flex;align-items:center;
  justify-content:center;gap:6px;font-weight:600;
}
.lumi-reload-btn:hover{background:var(--lborder);box-shadow:var(--lglow);}
.lumi-reload-btn:disabled{opacity:.5;cursor:not-allowed;}

/* ── Theme cards ──────── */
.lumi-theme-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:2px;}
.lumi-theme-card{
  border:2px solid var(--lborder);border-radius:12px;padding:10px;
  cursor:pointer;transition:.2s;display:flex;align-items:center;gap:8px;
  background:var(--lbg);
}
.lumi-theme-card.selected{border-color:var(--lp);background:var(--la);}
.lumi-theme-dot{width:20px;height:20px;border-radius:50%;flex-shrink:0;}
.lumi-theme-label{font-size:11px;font-weight:600;color:var(--lsub);}
.lumi-theme-card.selected .lumi-theme-label{color:var(--lp);}

/* API Key field */
.lumi-api-key-row{display:flex;gap:6px;align-items:center;}
.lumi-api-key-row .lumi-input{flex:1;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.5px;}
.lumi-api-status{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.status-ok{background:#34D399;box-shadow:0 0 6px rgba(52,211,153,.5);}
.status-err{background:#FF4757;}
.status-idle{background:var(--lsub);}

@media(max-width:768px){
  .lumi-modal{width:97%;height:96dvh;border-radius:18px;}
  .lumi-forum-layout{flex-direction:column;}
  .lumi-sidebar{width:100%;max-height:160px;overflow-x:auto;display:flex;flex-direction:row;gap:6px;}
  .lumi-sidebar-section{margin-bottom:0;min-width:140px;}
  .lumi-feed{max-height:calc(96dvh - 280px);}
}
`;
    document.head.appendChild(el);
}

// ════════════════════════════════════════════════════════════
// FAB
// ════════════════════════════════════════════════════════════
function spawnFAB() {
    $('#lumi-fab,.lumi-menu').remove();
    const fab = document.createElement('div');
    fab.id = 'lumi-fab';
    const pos = EXT._internal.fabPos;
    if (pos) Object.assign(fab.style, pos);
    else { fab.style.top='50%'; fab.style.right='20px'; fab.style.transform='translateY(-50%)'; }
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    menu.innerHTML = `<div class="lumi-menu-grid">
      <div class="lumi-menu-item" id="lm-diary"><img src="${ASSETS.diary}"><span>Diary</span></div>
      <div class="lumi-menu-item" id="lm-forum"><img src="${ASSETS.forum}"><span>Forum</span></div>
      <div class="lumi-menu-item" id="lm-set"><img src="${ASSETS.settings}"><span>Settings</span></div>
    </div>`;
    document.body.appendChild(menu);

    // Drag logic
    let isDrag=false, sx,sy, il,it, dist=0;
    const THRESH=10;
    const startDrag=(x,y)=>{isDrag=false;dist=0;sx=x;sy=y;const r=fab.getBoundingClientRect();il=r.left;it=r.top;fab.style.transform='none';};
    const moveDrag=(x,y)=>{const dx=x-sx,dy=y-sy;dist=Math.hypot(dx,dy);if(dist>THRESH)isDrag=true;if(isDrag){fab.style.left=(il+dx)+'px';fab.style.top=(it+dy)+'px';fab.style.right='auto';fab.style.bottom='auto';$(menu).fadeOut(100);}};
    const endDrag=()=>{
        if(isDrag){EXT._internal.fabPos={top:fab.style.top,left:fab.style.left,right:'auto',bottom:'auto',transform:'none'};save();}
        else if(dist<THRESH){
            const r=fab.getBoundingClientRect(),mW=$(menu).outerWidth()||200,mH=$(menu).outerHeight()||130;
            menu.style.left=Math.max(8,Math.min(r.left+r.width/2-mW/2,window.innerWidth-mW-8))+'px';
            menu.style.top=Math.max(8,r.top-mH-12)+'px';
            $(menu).fadeToggle(180);
        }
        isDrag=false;
    };
    fab.addEventListener('mousedown',e=>{if(e.button!==0)return;e.preventDefault();startDrag(e.clientX,e.clientY);const mv=ev=>moveDrag(ev.clientX,ev.clientY);const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);endDrag();};document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);});
    fab.addEventListener('touchstart',e=>{e.preventDefault();startDrag(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    fab.addEventListener('touchmove',e=>{e.preventDefault();moveDrag(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    fab.addEventListener('touchend',e=>{e.preventDefault();endDrag();},{passive:false});
    $('#lm-diary').on('click',()=>{$(menu).fadeOut();openModal('diary');});
    $('#lm-forum').on('click',()=>{$(menu).fadeOut();openModal('forum');});
    $('#lm-set').on('click',()=>{$(menu).fadeOut();openModal('settings');});
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
    $('#lumi-close').on('click', ()=>$('#lumi-overlay').fadeOut(200));
    $('#lumi-overlay').on('click', e=>{ if(e.target.id==='lumi-overlay') $('#lumi-overlay').fadeOut(200); });
    $('#lumi-back').on('click', ()=>{
        const v = $('#lumi-body').data('view');
        if (v==='forum-detail') openModal('forum');
        else if (v==='diary-edit') openModal('diary');
        else { $('#lumi-overlay').fadeOut(200); }
    });
}

function openModal(type='diary') {
    if (!$('#lumi-overlay').length) createModal();
    $('#lumi-overlay').css('display','flex').hide().fadeIn(200);
    if (type==='diary') renderDiary();
    else if (type==='forum') renderForum();
    else if (type==='settings') renderSettings();
}

// ════════════════════════════════════════════════════════════
// DIARY MODULE
// ════════════════════════════════════════════════════════════
function renderDiary() {
    const ctx = SillyTavern.getContext();
    const bid = botId();
    const botName = ctx.name2 || 'Unknown';
    const mems = loadMems({ botId: bid });
    const si = EXT._internal;
    const fc=si.filterChar||'', fd=si.filterDate||'', fl=si.filterLoc||'';
    const chars=[...new Set(mems.map(m=>m.character))].filter(Boolean);
    const dates=[...new Set(mems.map(m=>m.content.rp_date))].filter(Boolean);
    const locs=[...new Set(mems.map(m=>m.content.rp_location))].filter(Boolean);
    let filtered=mems;
    if(fc) filtered=filtered.filter(m=>m.character===fc);
    if(fd) filtered=filtered.filter(m=>m.content.rp_date===fd);
    if(fl) filtered=filtered.filter(m=>m.content.rp_location===fl);

    $('#lumi-title').text('Diary');
    const body=$('#lumi-body');
    body.data('view','diary');
    body.html(`
      <div class="lumi-hero">
        <div class="lumi-hero-eyebrow">${I.book} Memories of</div>
        <div class="lumi-hero-title">${esc(botName)}</div>
        <div class="lumi-hero-sub">${filtered.length} entries recorded</div>
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
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
          <select id="fc" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All chars</option>${chars.map(c=>`<option value="${esc(c)}"${c===fc?' selected':''}>${esc(c)}</option>`).join('')}</select>
          <select id="fd" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All dates</option>${dates.map(d=>`<option value="${esc(d)}"${d===fd?' selected':''}>${esc(d)}</option>`).join('')}</select>
          <select id="fl" class="lumi-select" style="flex:1;min-width:80px;"><option value="">All locs</option>${locs.map(l=>`<option value="${esc(l)}"${l===fl?' selected':''}>${esc(l)}</option>`).join('')}</select>
        </div>
        <button id="btn-open-gen" class="lumi-sm-btn" style="width:100%;justify-content:center;margin-bottom:10px;">${I.spark} Generate from Chat</button>
        <div id="gen-form" style="display:none;margin-bottom:12px;"></div>
        <div id="diary-content"></div>
      </div>`);

    $('#fc,#fd,#fl').on('change',()=>{
        EXT._internal.filterChar=$('#fc').val();
        EXT._internal.filterDate=$('#fd').val();
        EXT._internal.filterLoc=$('#fl').val();
        save(); renderDiary();
    });
    $('#btn-open-gen').on('click',()=>{
        if($('#gen-form').is(':visible')) $('#gen-form').slideUp(200);
        else { renderGenForm(); $('#gen-form').slideDown(200); }
    });
    $('.lumi-tab[data-dtab]').on('click',function(){
        $('.lumi-tab[data-dtab]').removeClass('active'); $(this).addClass('active');
        const t=$(this).data('dtab');
        if(t==='entries') renderDiaryEntries();
        else if(t==='story') renderStoryWeaver();
        else if(t==='lore') renderLoreTab();
        else if(t==='links') renderLinksTab();
    });
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const bid=botId(); const si=EXT._internal;
    const fc=si.filterChar||'', fd=si.filterDate||'', fl=si.filterLoc||'';
    let mems=loadMems({botId:bid});
    if(fc) mems=mems.filter(m=>m.character===fc);
    if(fd) mems=mems.filter(m=>m.content.rp_date===fd);
    if(fl) mems=mems.filter(m=>m.content.rp_location===fl);
    const byDate={};
    mems.forEach(m=>{const d=m.content.rp_date||'Unknown';if(!byDate[d])byDate[d]=[];byDate[d].push(m);});
    const sorted=Object.keys(byDate).sort();
    if(!sorted.length){$('#diary-content').html(`<div class="lumi-empty"><div class="lumi-empty-icon">📖</div><div class="lumi-empty-text">No memories yet.<br>Generate some from your chat!</div></div>`);return;}
    let html='';
    sorted.forEach(d=>{
        html+=`<div class="lumi-timeline-sep">${I.calendar} ${esc(d)}</div>`;
        byDate[d].forEach((m,i)=>{html+=diaryCardHTML(m,i);});
    });
    $('#diary-content').html(html);
    bindDiaryEvents();
}

function diaryCardHTML(m,i) {
    const color=colorOf(m.character), init=(m.character||'?').charAt(0).toUpperCase();
    const locked=EXT.diary.display.showSecretSystem && checkUnlock(m)===false;
    const locBadge=m.content.rp_location?`<span class="lumi-badge">${I.mappin} ${esc(m.content.rp_location)}</span>`:'';
    const moodBadge=m.content.mood?`<span class="lumi-badge">${I.mood} ${esc(m.content.mood)}</span>`:'';
    const tags=(m.content.rp_tags||[]).map(t=>`<span class="lumi-badge">${I.tag} ${esc(t)}</span>`).join('');
    if(locked) return `<div class="lumi-card" data-id="${m.id}"><div class="lumi-card-header"><div class="lumi-avatar" style="background:${color}">${init}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="text-align:center;padding:12px;color:var(--lsub);">${I.lock}<div style="margin-top:6px;font-size:12px;">Locked</div></div></div>`;
    return `<div class="lumi-card" data-id="${m.id}">
      <div class="lumi-card-header">
        <div class="lumi-avatar" style="background:${color}">${init}</div>
        <div class="lumi-char-name">${esc(m.character)}</div>
        ${m.meta.isFavorite?`<span style="color:var(--lp);font-size:16px;">♥</span>`:''}
        ${m.meta.isPinned?`<span style="color:#FBBF24;font-size:14px;">${I.pin}</span>`:''}
      </div>
      <div class="lumi-card-meta">${moodBadge}${locBadge}${tags}</div>
      <div class="lumi-card-body">${esc(m.content.diary||'')}</div>
      <div class="lumi-card-footer">
        <button class="lumi-act${m.meta.isPinned?' act-on':''}" data-act="pin">${I.pin}</button>
        <button class="lumi-act${m.meta.isFavorite?' act-on':''}" data-act="fav">${m.meta.isFavorite?I.heartF:I.heart}</button>
        <button class="lumi-act" data-act="edit">${I.tag} Edit</button>
        <button class="lumi-act act-danger" data-act="del">${I.trash}</button>
      </div>
    </div>`;
}

function bindDiaryEvents() {
    $('.lumi-act').off('click').on('click',function(e){
        e.stopPropagation();
        const id=$(this).closest('.lumi-card').data('id');
        const act=$(this).data('act');
        const mem=EXT.memories.find(m=>m.id===id);
        if(!mem) return;
        if(act==='pin'){mem.meta.isPinned=!mem.meta.isPinned;save();renderDiaryEntries();}
        if(act==='fav'){mem.meta.isFavorite=!mem.meta.isFavorite;save();renderDiaryEntries();}
        if(act==='edit') editMemInline(id);
        if(act==='del'){if(confirm('Delete?')){EXT.memories=EXT.memories.filter(m=>m.id!==id);save();renderDiaryEntries();}}
    });
}

function editMemInline(id) {
    const mem=EXT.memories.find(m=>m.id===id);
    if(!mem) return;
    const card=$(`.lumi-card[data-id="${id}"]`);
    card.find('.lumi-card-body').html(`<textarea class="lumi-input lumi-textarea" style="font-size:13px;">${esc(mem.content.diary||'')}</textarea><div style="display:flex;gap:7px;margin-top:8px;"><button class="lumi-sm-btn" id="save-inline" style="flex:1;justify-content:center;background:var(--la);color:var(--lp);">Save</button><button class="lumi-sm-btn" id="cancel-inline" style="flex:1;justify-content:center;">Cancel</button></div>`);
    card.find('#save-inline').on('click',()=>{mem.content.diary=card.find('textarea').val();save();renderDiaryEntries();toast('✓ Updated');});
    card.find('#cancel-inline').on('click',()=>renderDiaryEntries());
}

function renderGenForm() {
    $('#gen-form').html(`<div class="lumi-form-card">
      <div class="lumi-form-title">Generate Settings</div>
      <label class="lumi-label">Scan Mode</label>
      <div style="display:flex;gap:6px;margin-bottom:10px;" id="gen-mode-btns">
        ${['latest','first','all'].map(v=>`<button class="lumi-sm-btn gen-mode-opt${v==='latest'?' act-on':''}" data-v="${v}" style="flex:1;justify-content:center;">${v.charAt(0).toUpperCase()+v.slice(1)}</button>`).join('')}
      </div>
      <div id="gen-count-wrap" style="margin-bottom:10px;">
        <label class="lumi-label">Message Count</label>
        <input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input" style="font-size:13px;">
      </div>
      <button id="btn-run-gen" class="lumi-btn">${I.spark} Analyze & Generate</button>
    </div>`);
    $(document).on('click','.gen-mode-opt',function(){
        $('.gen-mode-opt').removeClass('act-on');$(this).addClass('act-on');
        $('#gen-count-wrap').toggle($(this).data('v')!=='all');
    });
    $('#btn-run-gen').on('click',genDiaryBatch);
}

async function renderStoryWeaver() {
    const mems=loadMems({botId:botId()}).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Story Weaver</div><p style="font-size:12px;color:var(--lsub);margin:0 0 12px;">Weave all diary entries into a cohesive narrative.</p><button id="btn-weave" class="lumi-btn">${I.scroll} Weave Story</button></div><div id="sw-out" style="display:none;background:var(--lcard);border:1px solid var(--lborder);border-radius:14px;padding:14px;font-size:13px;line-height:1.65;white-space:pre-wrap;max-height:280px;overflow-y:auto;margin-top:10px;"></div><div id="sw-acts" style="display:none;margin-top:10px;"><button id="btn-exp-story" class="lumi-btn">${I.book} Export .md</button></div>`);
    $('#btn-weave').on('click',async function(){
        $(this).html(`<span class="lumi-spin"></span> Weaving...`).prop('disabled',true);
        const diaryText=mems.map(m=>`[${m.character}|${m.content.rp_date}] ${m.content.diary}`).join('\n\n');
        const story=await callAI(`Weave these diary entries into a cohesive Markdown story with chapters:\n\n${diaryText}`, 'You are a literary chronicler. Output only the story in Markdown.');
        $(this).html(`${I.scroll} Weave Story`).prop('disabled',false);
        if(story){$('#sw-out').text(story).show();$('#sw-acts').show();$('#btn-exp-story').off('click').on('click',()=>exportText(story,'LumiPulse_Story.md'));}
    });
}

async function renderLoreTab() {
    $('#diary-content').html(`<div class="lumi-form-card"><div class="lumi-form-title">Lore Extractor</div><p style="font-size:12px;color:var(--lsub);margin:0 0 12px;">Extract SillyTavern World Info JSON from memories.</p><button id="btn-lore" class="lumi-btn">${I.globe} Extract Lore</button></div><div id="lore-out" style="display:none;margin-top:10px;"></div>`);
    $('#btn-lore').on('click',async function(){
        $(this).html(`<span class="lumi-spin"></span> Extracting...`).prop('disabled',true);
        const mems=loadMems({botId:botId()});
        const text=mems.map(m=>`[${m.character}] ${m.content.diary}`).join('\n');
        const sys='You are a JSON API. Output ONLY a raw JSON array. No markdown, no explanation.';
        const raw=await callAI(`Extract World Info entries from this text. Return array: [{"keyword":"Name","type":"character|location|item|event","content":"description"}]\n\nText:\n${text}`, sys);
        $(this).html(`${I.globe} Extract Lore`).prop('disabled',false);
        const data=extractJSON(raw,'array');
        if(data&&data.length){
            let html=`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><tr style="background:var(--la);"><th style="padding:7px;text-align:left;color:var(--lp);">Keyword</th><th style="padding:7px;text-align:left;color:var(--lp);">Type</th><th style="padding:7px;text-align:left;color:var(--lp);">Content</th></tr>`;
            data.forEach(l=>html+=`<tr style="border-bottom:1px solid var(--lborder);"><td style="padding:7px;font-weight:600;">${esc(l.keyword||'')}</td><td style="padding:7px;">${esc(l.type||'')}</td><td style="padding:7px;color:var(--lsub);">${esc((l.content||'').slice(0,60))}...</td></tr>`);
            html+=`</table></div><div style="margin-top:10px;"><button id="btn-exp-lore" class="lumi-btn">${I.book} Export JSON</button></div>`;
            const lorebook={name:'LumiPulse Lorebook',entries:{}};
            data.forEach((item,i)=>{lorebook.entries[i]={uid:i,key:[item.keyword],comment:item.type,content:item.content,selective:true,probability:100,useProbability:true,depth:4,group:'LumiPulse'};});
            $('#lore-out').html(html).show();
            $('#btn-exp-lore').off('click').on('click',()=>exportJSON(lorebook,'LumiPulse_Lorebook.json'));
        } else {$('#lore-out').html(`<div class="lumi-empty"><div class="lumi-empty-text">No lore found. Generate more memories first.</div></div>`).show();}
    });
}

function renderLinksTab() {
    const mems=loadMems({botId:botId()});
    const linked=mems.filter(m=>m.meta.linkedIds&&m.meta.linkedIds.length>0);
    let html=linked.length===0?`<div class="lumi-empty"><div class="lumi-empty-icon">🔗</div><div class="lumi-empty-text">No linked memories yet.</div></div>`:'';
    linked.forEach(m=>{
        const links=m.meta.linkedIds.map(id=>{const lm=mems.find(x=>x.id===id);return lm?`<span class="lumi-badge" style="cursor:pointer;margin:3px 2px;" data-lid="${lm.id}">${I.link} ${esc(lm.character)} · ${esc(lm.content.rp_date)}</span>`:''}).join('');
        html+=`<div class="lumi-card"><div class="lumi-card-header"><div class="lumi-avatar" style="background:${colorOf(m.character)}">${m.character.charAt(0)}</div><div class="lumi-char-name">${esc(m.character)}</div></div><div style="font-size:11px;color:var(--lsub);margin-bottom:6px;">Linked with:</div>${links}</div>`;
    });
    $('#diary-content').html(html);
    $('[data-lid]').off('click').on('click',function(){
        const mem=mems.find(m=>m.id===$(this).data('lid'));
        if(mem){$('#diary-content').html(diaryCardHTML(mem,0)+`<button class="lumi-sm-btn" id="back-links" style="width:100%;justify-content:center;margin-top:10px;">${I.back} Back</button>`);bindDiaryEvents();$('#back-links').on('click',renderLinksTab);}
    });
}

// ── Diary AI ──────────────────────────────────────────────
async function genDiaryBatch() {
    const mode=$('.gen-mode-opt.act-on').data('v')||'latest';
    const count=parseInt($('#gen-count').val())||30;
    $('#btn-run-gen').html(`<span class="lumi-spin"></span> Analyzing...`).prop('disabled',true);
    const results=await callDiaryAI(mode,count);
    $('#btn-run-gen').html(`${I.spark} Analyze & Generate`).prop('disabled',false);
    $('#gen-form').slideUp(200);
    if(results&&results.length>0){
        const ctx=SillyTavern.getContext();
        const bid=botId();
        const wm=EXT.diary.worldMode==='auto'?detectWorldMode():EXT.diary.worldMode;
        results.forEach(r=>saveMem({id:'mem_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),timestamp:new Date().toISOString(),character:r.character||ctx.name2||'Character',botId:bid,worldMode:wm,content:{...r},meta:{isPinned:false,isFavorite:false,isSecret:r.isSecret||false,linkedIds:r.linkedIds||[],tags:extractTags(r.diary||'')}}));
        toast(`✓ Created ${results.length} memories`);
        renderDiaryEntries();
    } else toast('No new memories found','err');
}

async function callDiaryAI(mode,count) {
    const ctx=SillyTavern.getContext(),allChat=ctx.chat||[];
    let slice,si=0,ei=0;
    if(mode==='latest'){slice=allChat.slice(-count);si=Math.max(0,allChat.length-count);ei=allChat.length;}
    else if(mode==='first'){slice=allChat.slice(0,count);si=0;ei=count;}
    else{slice=allChat.filter(m=>m.mes&&m.mes.length>15).slice(-120);si=Math.max(0,allChat.length-120);ei=allChat.length;}
    const log=slice.filter(m=>m.mes&&m.mes.length>8).map(m=>`[${m.is_user?'User':(m.name||'NPC')}]: ${(m.mes||'').slice(0,70)}`).join('\n');
    const prev=loadMems({botId:botId()}).slice(0,6).map(m=>`- [${m.character}] ${(m.content.diary||'').slice(0,50)}`).join('\n');
    const reg=Object.keys(EXT._internal.nameRegistry||{}).join(', ');
    const sys='You are a JSON API. Output ONLY a raw JSON array. No markdown fences, no explanation, no thinking.';
    const prompt=`Create unique diary entries from this roleplay chat. Do NOT repeat previous entries.
Known characters: ${reg||'none'}
Previous entries (skip): ${prev||'none'}
Chat (#${si+1}-${ei}):
${log}
Output JSON array:
[{"character":"Name","rp_date":"Thai date","rp_location":"Location","rp_tags":["#Tag"],"mood":"Mood","diary":"Thai 2-4 sentences","isSecret":false,"linkedIds":[]}]`;
    const raw=await callAI(prompt,sys);
    const data=extractJSON(raw,'array');
    return Array.isArray(data)?data:[];
}

// ── Memory helpers ────────────────────────────────────────
function loadMems(filter={}) {
    let m=[...(EXT.memories||[])];
    if(filter.botId) m=m.filter(x=>x.botId===filter.botId||!x.botId);
    if(filter.character) m=m.filter(x=>x.character===filter.character);
    return m.sort((a,b)=>(b.meta.isPinned?1:0)-(a.meta.isPinned?1:0)||new Date(b.timestamp)-new Date(a.timestamp));
}
function saveMem(entry) {
    if(!EXT._internal.nameRegistry) EXT._internal.nameRegistry={};
    let cn=entry.character.replace(/[()（）[\]]/g,'').trim(),canon=cn;
    for(let k in EXT._internal.nameRegistry){if(simScore(cn,k)>90){canon=k;break;}}
    EXT._internal.nameRegistry[canon]=true;
    entry.character=canon;
    const existing=EXT.memories.filter(m=>m.character===canon);
    if(existing.some(m=>simScore(m.content.diary||'',entry.content.diary||'')>85)) return;
    EXT.memories.unshift(entry);
    if(EXT.memories.length>EXT.diary.storage.max) EXT.memories=EXT.memories.slice(0,EXT.diary.storage.max);
    save();
}
const checkUnlock=(m)=>{if(!m.meta.isSecret)return true;const mode=EXT.diary.display.secretMode;if(mode==='time')return(Date.now()-new Date(m.timestamp))>86400000*3;if(mode==='affection')return(m.content.affection_score||0)>=80;return false;};
const extractTags=(t)=>{const tags=[],kw={'#Romantic':['รัก','หัวใจ'],'#Drama':['เสียใจ','ร้องไห้'],'#Mystery':['ลึกลับ','ความลับ']},l=t.toLowerCase();for(const[k,v]of Object.entries(kw))if(v.some(w=>l.includes(w)))tags.push(k);return tags;};
const detectWorldMode=()=>{const names=new Set();(SillyTavern.getContext().chat||[]).slice(-50).forEach(m=>{if(m.name&&!m.is_user&&!m.is_system)names.add(m.name);});return names.size>2?'rpg':'solo';};

// ════════════════════════════════════════════════════════════
// FORUM MODULE
// ════════════════════════════════════════════════════════════
function renderForum() {
    const ctx=SillyTavern.getContext();
    const posts=botPosts();
    const threads=posts.filter(p=>p.type==='thread');
    const members=forumChars();

    $('#lumi-title').text('Forum');
    const body=$('#lumi-body');
    body.data('view','forum');
    body.html(`
      <div class="lumi-hero">
        <div class="lumi-hero-eyebrow">${I.news} Community Board</div>
        <div class="lumi-hero-title">${esc(ctx.name2||'World')}</div>
        <div class="lumi-hero-sub">${threads.length} posts · ${members.length} voices</div>
      </div>
      <div class="lumi-reload-bar">
        <button class="lumi-reload-btn" id="btn-forum-reload">${I.refresh} Refresh Feed</button>
        <button class="lumi-sm-btn" id="btn-forum-clear" title="Clear all posts">${I.trash}</button>
      </div>
      <div class="lumi-compose">
        <div class="lumi-compose-row">
          <div class="lumi-avatar lumi-avatar-sm" style="background:${colorOf(ctx.name1||'Player')}">${(ctx.name1||'P').charAt(0)}</div>
          <span style="font-size:12px;color:var(--lsub);">What's happening?</span>
        </div>
        <textarea id="compose-txt" class="lumi-input lumi-textarea" placeholder="Write a post..."></textarea>
        <div class="lumi-compose-footer">
          <button id="btn-post" class="lumi-sm-btn">${I.send} Post</button>
          <div style="flex:1;"></div>
        </div>
      </div>
      <div class="lumi-forum-layout">
        <div class="lumi-feed" id="lumi-feed"></div>
        <div class="lumi-sidebar" id="lumi-sidebar"></div>
      </div>`);

    // Bind buttons
    $('#btn-forum-reload').on('click', async function(){
        $(this).html(`<span class="lumi-spin lumi-spin-dark"></span> Loading...`).prop('disabled',true);
        await runForumRefresh();
        $(this).html(`${I.refresh} Refresh Feed`).prop('disabled',false);
    });
    $('#btn-forum-clear').on('click',()=>{
        if(confirm('Clear all forum posts for this character?')){savePosts([]);renderFeed();renderSidebar();toast('✓ Cleared');}
    });
    $('#btn-post').on('click',async()=>{
        const txt=$('#compose-txt').val().trim();
        if(!txt){toast('Write something first','err');return;}
        const ctx=SillyTavern.getContext();
        const newPost={id:'post_'+Date.now(),type:'thread',posterType:'player',author:ctx.name1||'Player',title:null,content:txt,threadTag:'Discussion',timestamp:new Date().toISOString(),parentId:null,likes:0,likedBy:[]};
        const arr=botPosts();arr.push(newPost);savePosts(arr);
        $('#compose-txt').val('');
        renderFeed();renderSidebar();
        toast('✓ Posted');
        // AI might react
        setTimeout(()=>aiReactToPost(newPost.id),1200);
    });

    renderFeed();
    renderSidebar();
}

// ── Feed render ───────────────────────────────────────────
function renderFeed() {
    const threads=botPosts().filter(p=>p.type==='thread').sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    if(!threads.length){
        $('#lumi-feed').html(`<div class="lumi-empty"><div class="lumi-empty-icon">💬</div><div class="lumi-empty-text">Nothing here yet.<br>Hit Refresh Feed to see what's happening!</div></div>`);
        return;
    }
    let html='';
    threads.forEach(th=>{
        const replies=botPosts().filter(p=>p.parentId===th.id);
        html+=postCardHTML(th,replies);
    });
    $('#lumi-feed').html(html);
    bindFeedEvents();
}

function postCardHTML(th, replies) {
    const color=colorOf(th.author), init=(th.author||'?').charAt(0).toUpperCase();
    const liked=th.likedBy&&th.likedBy.includes('__player__');
    const likeCount=th.likes||0;
    const typeClass=th.posterType==='news'?'post-news':th.posterType==='citizen'?'post-citizen':'';
    const typeBadge=th.posterType==='news'?`<span class="lumi-post-type-badge badge-news">${I.news} News</span>`:th.posterType==='npc'?`<span class="lumi-post-type-badge badge-npc">NPC</span>`:th.posterType==='citizen'?`<span class="lumi-post-type-badge badge-citizen">Citizen</span>`:`<span class="lumi-post-type-badge badge-main">Main</span>`;

    let replyHTML='';
    replies.forEach(r=>{
        const rc=colorOf(r.author),ri=(r.author||'?').charAt(0).toUpperCase();
        replyHTML+=`<div class="lumi-reply">
          <div class="lumi-reply-head">
            <div class="lumi-avatar lumi-avatar-sm" style="background:${rc}">${ri}</div>
            <div class="lumi-reply-name">${esc(r.author)}</div>
            <div class="lumi-reply-time">${timeAgo(r.timestamp)}</div>
          </div>
          <div class="lumi-reply-body">${esc(r.content)}</div>
        </div>`;
    });

    return `<div class="lumi-post ${typeClass}" data-id="${th.id}">
      <div class="lumi-post-head">
        <div class="lumi-avatar" style="background:${color}">${init}</div>
        <div class="lumi-post-author-wrap">
          <div class="lumi-post-author">${esc(th.author)} ${typeBadge}</div>
          <div class="lumi-post-meta">${timeAgo(th.timestamp)}${th.threadTag?` · <span class="lumi-post-tag">${esc(th.threadTag)}</span>`:''}</div>
        </div>
        <button class="lumi-act act-danger" data-act="del-post" data-id="${th.id}" style="padding:3px 5px;margin-left:4px;">${I.trash}</button>
      </div>
      ${th.title?`<div class="lumi-post-title">${esc(th.title)}</div>`:''}
      <div class="lumi-post-body">${esc(th.content)}</div>
      <div class="lumi-post-actions">
        <button class="lumi-post-btn${liked?' liked':''}" data-act="like" data-id="${th.id}">${liked?I.heartF:I.heart} ${likeCount||''} Like</button>
        <button class="lumi-post-btn" data-act="toggle-replies" data-id="${th.id}">${I.comment} ${replies.length||''} Reply</button>
        <button class="lumi-post-btn" data-act="ai-reply" data-id="${th.id}">${I.spark} AI</button>
      </div>
      <div class="lumi-replies-wrap" id="rep-${th.id}">
        ${replyHTML}
        <div class="lumi-compose-reply">
          <textarea class="lumi-reply-input" placeholder="Write a reply..." data-thread="${th.id}" rows="1"></textarea>
          <button class="lumi-reply-send-btn" data-act="send-reply" data-thread="${th.id}">${I.send}</button>
        </div>
      </div>
    </div>`;
}

function bindFeedEvents() {
    // Like
    $('[data-act="like"]').off('click').on('click',function(){
        const id=$(this).data('id');
        const arr=botPosts(), post=arr.find(p=>p.id===id);
        if(!post) return;
        if(!post.likedBy) post.likedBy=[];
        const idx=post.likedBy.indexOf('__player__');
        if(idx>=0){post.likedBy.splice(idx,1);post.likes=Math.max(0,(post.likes||0)-1);}
        else{post.likedBy.push('__player__');post.likes=(post.likes||0)+1;}
        savePosts(arr);
        $(this).toggleClass('liked');
        renderFeed();
    });

    // Toggle replies
    $('[data-act="toggle-replies"]').off('click').on('click',function(){
        const id=$(this).data('id');
        $(`#rep-${id}`).is(':visible')?$(`#rep-${id}`).slideUp(180):$(`#rep-${id}`).slideDown(200);
    });

    // Send reply (player)
    $('[data-act="send-reply"]').off('click').on('click',async function(){
        const tid=$(this).data('thread');
        const txt=$(`.lumi-reply-input[data-thread="${tid}"]`).val().trim();
        if(!txt) return;
        const ctx=SillyTavern.getContext();
        const r={id:'rep_'+Date.now(),type:'reply',posterType:'player',author:ctx.name1||'Player',content:txt,timestamp:new Date().toISOString(),parentId:tid,likes:0,likedBy:[]};
        const arr=botPosts();arr.push(r);savePosts(arr);
        $(`.lumi-reply-input[data-thread="${tid}"]`).val('');
        renderFeed();
        setTimeout(()=>aiReactToPost(tid),1000);
    });

    // AI reply button
    $('[data-act="ai-reply"]').off('click').on('click',async function(){
        const tid=$(this).data('id');
        const $btn=$(this);
        $btn.html(`<span class="lumi-spin lumi-spin-dark" style="width:11px;height:11px;border-width:2px;"></span>`).prop('disabled',true);
        await aiReactToPost(tid);
        $btn.html(`${I.spark} AI`).prop('disabled',false);
    });

    // Delete post
    $('[data-act="del-post"]').off('click').on('click',function(e){
        e.stopPropagation();
        const id=$(this).data('id');
        if(!confirm('Delete post and all replies?')) return;
        savePosts(botPosts().filter(p=>p.id!==id&&p.parentId!==id));
        renderFeed();renderSidebar();
    });

    // Auto-resize
    $('.lumi-reply-input').on('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px';});
}

// ── Sidebar render ────────────────────────────────────────
function renderSidebar() {
    const members=forumChars();
    const posts=botPosts();
    let html=`<div class="lumi-sidebar-section"><div class="lumi-sidebar-title">Active Members</div>`;
    if(!members.length) html+=`<div style="font-size:11px;color:var(--lsub);text-align:center;padding:8px;">No activity yet</div>`;
    members.slice(0,10).forEach(c=>{
        const cnt=posts.filter(p=>p.author===c&&p.type==='thread').length;
        html+=`<div class="lumi-member-card" data-char="${esc(c)}">
          <div class="lumi-avatar lumi-avatar-sm" style="background:${colorOf(c)}">${c.charAt(0)}</div>
          <div><div class="lumi-member-name">${esc(c)}</div><div class="lumi-member-posts">${cnt} posts</div></div>
        </div>`;
    });
    html+=`</div>`;
    $('#lumi-sidebar').html(html);
    $('.lumi-member-card').on('click',function(){showMemberProfile($(this).data('char'));});
}

function showMemberProfile(char) {
    const posts=botPosts().filter(p=>p.author===char&&p.type==='thread');
    const color=colorOf(char);
    let html=`<div style="text-align:center;padding:16px 12px;">
      <div style="width:52px;height:52px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;margin:0 auto 10px;box-shadow:0 4px 14px rgba(0,0,0,.4);">${char.charAt(0)}</div>
      <div style="font-size:15px;font-weight:700;color:var(--ltext);">${esc(char)}</div>
      <div style="font-size:11px;color:var(--lsub);margin-top:3px;">${posts.length} posts · ${posts.reduce((s,p)=>s+(p.likes||0),0)} likes</div>
    </div>
    <div style="padding:0 14px 14px;">
      <div style="font-size:10px;font-weight:700;color:var(--lsub);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">Recent Posts</div>`;
    if(!posts.length) html+=`<div style="font-size:12px;color:var(--lsub);text-align:center;padding:12px;">No posts yet</div>`;
    posts.slice(-4).reverse().forEach(p=>{
        html+=`<div style="background:var(--lcard);border:1px solid var(--lborder);border-radius:11px;padding:9px;margin-bottom:7px;">
          ${p.title?`<div style="font-size:12px;font-weight:600;margin-bottom:3px;">${esc(p.title)}</div>`:''}
          <div style="font-size:11px;color:var(--lsub);">${esc((p.content||'').slice(0,70))}...</div>
          <div style="font-size:10px;color:var(--lsub);margin-top:4px;">${timeAgo(p.timestamp)}</div>
        </div>`;
    });
    html+=`</div><div style="padding:0 14px 14px;"><button id="back-profile" class="lumi-sm-btn" style="width:100%;justify-content:center;">${I.back} Back to Feed</button></div>`;
    $('#lumi-feed').html(html);
    $('#back-profile').on('click',()=>renderFeed());
}

// ════════════════════════════════════════════════════════════
// FORUM AI ENGINE
// ════════════════════════════════════════════════════════════

// Character pool: main chars + NPC names + citizen names + news
function buildPosterPool() {
    const ctx=SillyTavern.getContext();
    const pt=EXT.forum.posterTypes;
    let pool=[];
    // Main characters from chat
    if(pt.mainChars){
        const mains=new Set();
        (ctx.chat||[]).slice(-60).forEach(m=>{if(m.name&&!m.is_user)mains.add(m.name);});
        if(ctx.name2) mains.add(ctx.name2);
        mains.forEach(c=>pool.push({name:c,type:'main'}));
    }
    // Generic NPCs (AI will generate realistic names based on world)
    if(pt.npcs){['NPC_1','NPC_2','NPC_3'].forEach(n=>pool.push({name:n,type:'npc',placeholder:true}));}
    // Citizens (anonymous public)
    if(pt.citizens){['Citizen_A','Citizen_B'].forEach(n=>pool.push({name:n,type:'citizen',placeholder:true}));}
    // News / Announcements
    if(pt.news) pool.push({name:'News Board',type:'news'});
    return pool;
}

// Master refresh: generate new posts + reactions to existing posts
async function runForumRefresh() {
    const ctx=SillyTavern.getContext();
    const existing=botPosts();
    const pool=buildPosterPool();
    if(!pool.length){toast('No characters to post','err');return;}

    const chatCtx=(ctx.chat||[]).slice(-20).filter(m=>m.mes&&m.mes.length>5).map(m=>`${m.is_user?'User':m.name}: ${(m.mes||'').replace(/\n/g,' ').slice(0,80)}`).join('\n')||'No recent chat.';
    const existingTitles=existing.slice(-10).filter(p=>p.type==='thread').map(p=>p.title||p.content.slice(0,40)).join('; ');

    const sys='You are a JSON API. Output ONLY a raw JSON array. No markdown, no explanation, no thinking tags.';
    const prompt=`Generate a realistic social forum feed for a roleplay world.

Recent story events:
${chatCtx}

Already posted topics (avoid repeating): ${existingTitles||'none'}

Character pool: ${pool.filter(p=>!p.placeholder).map(p=>p.name).join(', ')||'various NPCs and citizens'}

Generate 3-5 posts. Mix types:
- Main character posts: personal reactions to story events
- NPC posts: side characters sharing opinions (invent believable NPC names for this world)
- Citizen posts: anonymous public reactions (invent names like townspeople)
- News: official announcements if relevant (author="Town Herald" or similar)

Each post can optionally include 1-3 replies from OTHER characters.

Return ONLY this JSON structure:
[
  {
    "author": "Character or invented NPC name",
    "posterType": "main|npc|citizen|news",
    "title": "Post title or null",
    "content": "Post body (2-3 sentences, feel like real social media)",
    "threadTag": "Gossip|Event|Question|Rant|Update|News|Warning",
    "replies": [
      {"author": "Another character name", "posterType": "main|npc|citizen", "content": "Reply (1-2 sentences)"}
    ]
  }
]`;

    try {
        const raw=await callAI(prompt,sys);
        const data=extractJSON(raw,'array');
        if(!data||!Array.isArray(data)||!data.length){toast('AI returned no posts','err');return;}

        const now=Date.now();
        const toAdd=[];

        data.filter(p=>p&&typeof p.content==='string'&&p.content.length>0).forEach((p,i)=>{
            const threadId='post_'+(now+i*100)+'_'+Math.random().toString(36).substr(2,4);
            toAdd.push({
                id:threadId, type:'thread',
                posterType:p.posterType||'npc',
                author:(p.author||'Unknown').trim(),
                title:p.title&&p.title.trim()?p.title.trim():null,
                content:p.content.trim(),
                threadTag:p.threadTag||'Update',
                timestamp:new Date(now+i*1800).toISOString(),
                parentId:null, likes:0, likedBy:[]
            });
            // Add replies that came with the post
            if(Array.isArray(p.replies)){
                p.replies.filter(r=>r&&typeof r.content==='string'&&r.content.length>0).forEach((r,j)=>{
                    toAdd.push({
                        id:'rep_'+(now+i*100+j+1)+'_'+Math.random().toString(36).substr(2,4),
                        type:'reply',
                        posterType:r.posterType||'npc',
                        author:(r.author||'Someone').trim(),
                        content:r.content.trim(),
                        timestamp:new Date(now+i*1800+(j+1)*900).toISOString(),
                        parentId:threadId, likes:0, likedBy:[]
                    });
                });
            }
        });

        if(!toAdd.length){toast('No valid posts generated','err');return;}
        savePosts([...existing,...toAdd]);
        renderFeed();renderSidebar();
        toast(`✓ Added ${toAdd.filter(p=>p.type==='thread').length} posts`);
    } catch(e){
        console.error('[LumiPulse] runForumRefresh error:',e);
        toast('Error: '+e.message,'err');
    }
}

// AI reactions to a specific post (likes + replies)
async function aiReactToPost(threadId) {
    const all=botPosts();
    const thread=all.find(p=>p.id===threadId);
    if(!thread) return;

    const existingReps=all.filter(p=>p.parentId===threadId);
    const pool=buildPosterPool().filter(p=>p.name!==thread.author&&!p.placeholder);
    if(!pool.length) return;

    const recentRepliers=existingReps.slice(-4).map(r=>r.author);
    const eligible=pool.filter(p=>!recentRepliers.includes(p.name));
    if(!eligible.length) return;

    // Maybe randomly like the post
    if(Math.random()>0.5){
        const liker=eligible[Math.floor(Math.random()*eligible.length)];
        if(!thread.likedBy) thread.likedBy=[];
        if(!thread.likedBy.includes(liker.name)){
            thread.likedBy.push(liker.name);
            thread.likes=(thread.likes||0)+1;
        }
    }

    // Generate 1-2 replies
    const numRep=Math.random()>0.5?2:1;
    const repliers=eligible.slice(0,numRep);

    const sys='You are a JSON API. Output ONLY a raw JSON array. No markdown, no explanation.';
    const postContext=`Post by ${thread.author}: "${(thread.title?thread.title+' — ':'')}${thread.content}"`;
    const prevCtx=existingReps.length?`Previous replies:\n${existingReps.slice(-3).map(r=>`${r.author}: ${r.content}`).join('\n')}`:'';
    const prompt=`Generate ${numRep} natural social-media reply(ies) for this forum post.
${postContext}
${prevCtx}
Reply from: ${repliers.map(r=>r.name).join(', ')}
Rules: 1-2 sentences, casual natural tone, in character, can agree/question/tease/react emotionally.
Output: [{"author":"Name","content":"Reply"}]`;

    try {
        const raw=await callAI(prompt,sys);
        const data=extractJSON(raw,'array');
        if(!data||!Array.isArray(data)) { savePosts(all); if($('#lumi-feed').length)renderFeed(); return; }

        const now=Date.now();
        const newReps=data.filter(r=>r&&typeof r.content==='string'&&r.content.length>0).map((r,i)=>({
            id:'rep_'+(now+i*500)+'_'+Math.random().toString(36).substr(2,4),
            type:'reply', posterType:repliers[i]?.type||'npc',
            author:(r.author||repliers[0]?.name||'Someone').trim(),
            content:r.content.trim(),
            timestamp:new Date(now+i*600).toISOString(),
            parentId:threadId, likes:0, likedBy:[]
        }));

        savePosts([...all,...newReps]);
        if($('#lumi-feed').length) renderFeed();
    } catch(e){ savePosts(all); console.error('[LumiPulse] aiReactToPost:',e); }
}

const forumChars=()=>{
    const ctx=SillyTavern.getContext(),s=new Set();
    (ctx.chat||[]).slice(-60).forEach(m=>{if(m.name&&!m.is_user)s.add(m.name);});
    if(ctx.name2) s.add(ctx.name2);
    // Add unique authors from posts
    botPosts().forEach(p=>{if(p.author&&p.author!=='Player')s.add(p.author);});
    return Array.from(s);
};

// ── Forum auto trigger ─────────────────────────────────────
function setupForumAutoTrigger() {
    $(document).off('messageReceived.lumi-forum').on('messageReceived.lumi-forum', async()=>{
        const f=EXT.forum;
        if(!f.enabled||!f.autoGen.enabled) return;
        EXT._internal.forumMsgCounter=(EXT._internal.forumMsgCounter||0)+1;
        const now=Date.now();
        let gen=false;
        if(f.autoGen.triggerType==='turn_count'&&EXT._internal.forumMsgCounter>=f.autoGen.turnInterval){gen=true;EXT._internal.forumMsgCounter=0;}
        if(f.autoGen.triggerType==='time_interval'&&(now-EXT._internal.lastForumGenTime)/60000>=f.autoGen.timeInterval){gen=true;EXT._internal.lastForumGenTime=now;}
        if(f.autoGen.triggerType==='random'&&Math.random()<f.autoGen.randomChance) gen=true;
        if(gen) await runForumRefresh();
    });
}

// ════════════════════════════════════════════════════════════
// DIARY AUTO TRIGGER
// ════════════════════════════════════════════════════════════
function setupDiaryAutoTrigger() {
    $(document).off('messageReceived.lumi-diary').on('messageReceived.lumi-diary', async()=>{
        const d=EXT.diary, cfg=d.autoGen;
        if(!cfg.enabled) return;
        EXT._internal.diaryMsgCounter=(EXT._internal.diaryMsgCounter||0)+1;
        const lastMsg=(SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'').toLowerCase();
        let gen=false;
        if(cfg.triggerType==='turn_count'&&EXT._internal.diaryMsgCounter>=cfg.turnInterval){gen=true;EXT._internal.diaryMsgCounter=0;}
        else if(cfg.triggerType==='emotion'&&cfg.emotionKeywords.some(k=>lastMsg.includes(k))) gen=true;
        else if(cfg.triggerType==='random'&&Math.random()<cfg.randomChance) gen=true;
        if(gen){
            const results=await callDiaryAI('latest',cfg.turnInterval||20);
            if(results&&results.length){
                const ctx=SillyTavern.getContext(), bid=botId(), wm=d.worldMode==='auto'?detectWorldMode():d.worldMode;
                results.forEach(r=>saveMem({id:'mem_auto_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),timestamp:new Date().toISOString(),character:r.character||ctx.name2||'Character',botId:bid,worldMode:wm,content:{...r},meta:{isPinned:false,isFavorite:false,isSecret:r.isSecret||false,linkedIds:r.linkedIds||[],tags:extractTags(r.diary||'')}}));
            }
        }
    });
}

// ════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════
function renderSettings() {
    $('#lumi-title').text('Settings');
    const body=$('#lumi-body');
    body.data('view','settings');

    const s=EXT, ag=s.diary.autoGen, fg=s.forum.autoGen, api=s.api;
    const theme=s._internal.theme||'sakura';
    const pt=s.forum.posterTypes||{mainChars:true,npcs:true,citizens:true,news:true};

    body.html(`<div style="padding:12px 14px 24px;">

    <div class="lumi-form-card">
      <div class="lumi-form-title">Theme</div>
      <div class="lumi-theme-grid">
        ${Object.entries(THEMES).map(([k,t])=>`
        <label class="lumi-theme-card${k===theme?' selected':''}" style="border-color:${k===theme?t.p:'var(--lborder)'};">
          <input type="radio" name="lumi-theme" value="${k}" ${k===theme?'checked':''} style="display:none;">
          <div class="lumi-theme-dot" style="background:${t.grad};"></div>
          <div class="lumi-theme-label">${t.name}</div>
        </label>`).join('')}
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">${I.api} Custom API (for LumiPulse only)</div>
      <div class="lumi-set-row"><span>Use Custom API</span><input type="checkbox" id="api-en" ${api.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div id="api-cfg" style="display:${api.enabled?'block':'none'};">
        <div style="margin:8px 0 6px;"><label class="lumi-label">Provider</label>
          <select id="api-provider" class="lumi-select" style="width:100%;box-sizing:border-box;">
            <option value="openai" ${api.provider==='openai'?'selected':''}>OpenAI / Compatible</option>
            <option value="anthropic" ${api.provider==='anthropic'?'selected':''}>Anthropic Claude</option>
          </select>
        </div>
        <div style="margin-bottom:6px;"><label class="lumi-label">Base URL</label>
          <input type="text" id="api-url" value="${esc(api.baseUrl||'')}" class="lumi-input" placeholder="https://api.openai.com/v1">
        </div>
        <div style="margin-bottom:6px;"><label class="lumi-label">API Key</label>
          <div class="lumi-api-key-row">
            <input type="password" id="api-key" value="${esc(api.apiKey||'')}" class="lumi-input" placeholder="sk-...">
            <div class="lumi-api-status ${api.apiKey?'status-ok':'status-idle'}" id="api-status-dot"></div>
          </div>
        </div>
        <div style="margin-bottom:6px;"><label class="lumi-label">Model</label>
          <input type="text" id="api-model" value="${esc(api.model||'')}" class="lumi-input" placeholder="gpt-4o-mini">
        </div>
        <div style="margin-bottom:10px;"><label class="lumi-label">Max Tokens</label>
          <input type="number" id="api-tokens" value="${api.maxTokens||800}" min="100" max="4000" class="lumi-input">
        </div>
        <button id="btn-test-api" class="lumi-sm-btn" style="width:100%;justify-content:center;">${I.api} Test Connection</button>
        <div id="api-test-result" style="margin-top:6px;font-size:11px;color:var(--lsub);"></div>
      </div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">General</div>
      <div class="lumi-set-row"><span>Extension Enabled</span><input type="checkbox" id="set-en" ${s.isEnabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>World Mode</span><select id="set-wm"><option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option><option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option><option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option></select></div>
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Diary Auto-Generation</div>
      <div class="lumi-set-row"><span>Enabled</span><input type="checkbox" id="ag-en" ${ag.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="ag-tr"><option value="turn_count" ${ag.triggerType==='turn_count'?'selected':''}>Every X Messages</option><option value="emotion" ${ag.triggerType==='emotion'?'selected':''}>Emotion Keywords</option><option value="random" ${ag.triggerType==='random'?'selected':''}>Random</option></select></div>
      ${ag.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Messages per gen</span><input type="number" id="ag-int" value="${ag.turnInterval}" min="5" max="100" style="width:60px;"></div>`:''}
      ${ag.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="ag-chance" value="${Math.round(ag.randomChance*100)}" min="1" max="50" style="width:60px;"></div>`:''}
      ${ag.triggerType==='emotion'?`<div class="lumi-set-row" style="flex-direction:column;align-items:flex-start;gap:5px;"><span>Keywords (comma-sep)</span><input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" style="width:100%;box-sizing:border-box;"></div>`:''}
    </div>

    <div class="lumi-form-card">
      <div class="lumi-form-title">Forum Auto-Generation</div>
      <div class="lumi-set-row"><span>Forum Enabled</span><input type="checkbox" id="forum-en" ${s.forum.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Auto-gen Enabled</span><input type="checkbox" id="forum-ag-en" ${fg.enabled?'checked':''} style="width:18px;height:18px;accent-color:var(--lp);"></div>
      <div class="lumi-set-row"><span>Trigger</span><select id="forum-tr"><option value="turn_count" ${fg.triggerType==='turn_count'?'selected':''}>Every X Msgs</option><option value="time_interval" ${fg.triggerType==='time_interval'?'selected':''}>Every X Min</option><option value="random" ${fg.triggerType==='random'?'selected':''}>Random</option></select></div>
      ${fg.triggerType==='turn_count'?`<div class="lumi-set-row"><span>Messages</span><input type="number" id="forum-int" value="${fg.turnInterval}" min="3" max="100" style="width:60px;"></div>`:''}
      ${fg.triggerType==='time_interval'?`<div class="lumi-set-row"><span>Minutes</span><input type="number" id="forum-time" value="${fg.timeInterval}" min="1" max="60" style="width:60px;"></div>`:''}
      ${fg.triggerType==='random'?`<div class="lumi-set-row"><span>Chance %</span><input type="number" id="forum-chance" value="${Math.round(fg.randomChance*100)}" min="1" max="50" style="width:60px;"></div>`:''}
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
        <button id="btn-clr" class="lumi-sm-btn lumi-danger-btn" style="flex:1;justify-content:center;">${I.trash} Clear All</button>
      </div>
    </div>
    </div>`);

    // ── Bind settings events ──
    $('input[name="lumi-theme"]').on('change',function(){
        EXT._internal.theme=$(this).val();applyTheme(EXT._internal.theme);save();renderSettings();
    });
    $('#api-en').on('change',function(){EXT.api.enabled=$(this).prop('checked');save();$('#api-cfg').toggle(EXT.api.enabled);});
    $('#api-provider').on('change',function(){EXT.api.provider=$(this).val();save();});
    $('#api-url').on('change',function(){EXT.api.baseUrl=$(this).val();save();});
    $('#api-key').on('change',function(){EXT.api.apiKey=$(this).val();save();$('#api-status-dot').attr('class','lumi-api-status '+(EXT.api.apiKey?'status-ok':'status-idle'));});
    $('#api-model').on('change',function(){EXT.api.model=$(this).val();save();});
    $('#api-tokens').on('change',function(){EXT.api.maxTokens=parseInt($(this).val())||800;save();});
    $('#btn-test-api').on('click',async function(){
        const $btn=$(this);
        $btn.html(`<span class="lumi-spin lumi-spin-dark"></span> Testing...`).prop('disabled',true);
        try{
            const res=await callCustomAPI('Say only "OK" and nothing else.','You respond with only one word.');
            if(res){$('#api-test-result').html(`<span style="color:#34D399;">✓ Connected: "${esc(res.slice(0,40))}"</span>`);$('#api-status-dot').attr('class','lumi-api-status status-ok');}
            else{$('#api-test-result').html(`<span style="color:var(--ldanger);">✗ Empty response</span>`);$('#api-status-dot').attr('class','lumi-api-status status-err');}
        }catch(e){$('#api-test-result').html(`<span style="color:var(--ldanger);">✗ ${esc(e.message.slice(0,80))}</span>`);$('#api-status-dot').attr('class','lumi-api-status status-err');}
        $btn.html(`${I.api} Test Connection`).prop('disabled',false);
    });
    $('#set-en').on('change',function(){EXT.isEnabled=$(this).prop('checked');save();});
    $('#set-wm').on('change',function(){EXT.diary.worldMode=$(this).val();save();});
    $('#ag-en').on('change',function(){EXT.diary.autoGen.enabled=$(this).prop('checked');save();});
    $('#ag-tr').on('change',function(){EXT.diary.autoGen.triggerType=$(this).val();save();renderSettings();});
    $('#ag-int').on('change',function(){EXT.diary.autoGen.turnInterval=parseInt($(this).val())||20;save();});
    $('#ag-chance').on('change',function(){EXT.diary.autoGen.randomChance=(parseInt($(this).val())||10)/100;save();});
    $('#ag-kw').on('change',function(){EXT.diary.autoGen.emotionKeywords=$(this).val().split(',').map(k=>k.trim()).filter(Boolean);save();});
    $('#forum-en').on('change',function(){EXT.forum.enabled=$(this).prop('checked');save();});
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
    $('#btn-clr').on('click',()=>{if(confirm('Clear ALL memories and forum posts?')){EXT.memories=[];EXT.forumPosts={};EXT._internal.nameRegistry={};save();toast('✓ All data cleared');}});
}

// ════════════════════════════════════════════════════════════
// SETTINGS PANEL (sidebar in ST)
// ════════════════════════════════════════════════════════════
function createSettingsPanel() {
    if ($('#lumi-panel').length) return;
    $('#extensions_settings').append(`<div id="lumi-panel" class="inline-drawer">
      <div class="inline-drawer-toggle inline-drawer-header">
        <b style="font-family:var(--lfont),'Noto Sans Thai',sans-serif;color:var(--lp);font-weight:600;">LumiPulse v5</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content" style="display:none;padding:10px;"></div>
    </div>`);
}

// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════
const exportText=(c,f)=>{const b=new Blob([c],{type:'text/markdown'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=f;a.click();URL.revokeObjectURL(u);toast('✓ Exported');};
const exportJSON=(d,f)=>{const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=f;a.click();URL.revokeObjectURL(u);toast('✓ Exported');};
