"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: true,
    forumTopic: "", isForumInitialized: false, includeRandomNPCs: true, forumData: [],
    diary: {
        worldMode: 'auto',
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก', 'โกรธ', 'เสียใจ', 'ดีใจ', 'ตกใจ', 'หัวใจ', 'ชอบ'], randomChance: 0.1 },
        display: { showSecret: true, secretUnlockMode: 'affection' },
        storage: { maxEntries: 50 }
    },
    memories: [],
    _internal: { messageCounter: 0, firstChatDate: null }
};
let extension_settings = {};

const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart    = `<svg viewBox="0 0 24 24" fill="#FFB6C1" stroke="#fff" stroke-width="1"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const svgSettings = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="#FFB6C1" stroke-width="1"><path d="M16 2l4 4-4 4-1-1-1 1-1-1-1 1-4-4 4-4 1 1 1-1 1 1 1-1z"/><path d="M14 10v10l-2 2-2-2V10"/><path d="M8 2h8"/></svg>`;
const svgPinEmpty = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="1.5"><path d="M16 2l4 4-4 4-1-1-1 1-1-1-1 1-4-4 4-4 1 1 1-1 1 1 1-1z"/><path d="M14 10v10l-2 2-2-2V10"/><path d="M8 2h8"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════
jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext) {
            clearInterval(boot); initLumiPulse();
        }
    }, 800);
});

function initLumiPulse() {
    const ctx = SillyTavern.getContext();
    if (!ctx.extensionSettings[extensionName]) { ctx.extensionSettings[extensionName] = JSON.parse(JSON.stringify(defaultSettings)); ctx.saveSettingsDebounced(); }
    const s = ctx.extensionSettings[extensionName];
    if (!s.diary) s.diary = JSON.parse(JSON.stringify(defaultSettings.diary));
    if (!s.memories) s.memories = [];
    if (!s._internal) s._internal = { messageCounter: 0, firstChatDate: null };
    extension_settings = ctx.extensionSettings;

    injectStyles();
    createSettingsUI();
    if (s.isEnabled) setTimeout(() => { spawnLumiButton(); createContentModal(); setupAutoTriggerListener(); }, 1000);    
    document.addEventListener('click', e => { if (!e._fromDrag) spawnHeartEffect(e); });
}

// ═══════════════════════════════════════════════
// HELPERS & AI
// ═══════════════════════════════════════════════
function detectWorldMode() { const c = SillyTavern.getContext().chat||[]; const u = new Set(); c.slice(-50).forEach(m => { if(m.name && !m.is_user && !m.is_system) u.add(m.name); }); return u.size>2?'rpg':'solo'; }
function getChatNPCs(l=5) { const c = SillyTavern.getContext().chat||[], n = new Set(), cn = getCharacterName(); c.slice(-40).forEach(m => { if(m.name && !m.is_user && !m.is_system && m.name!==cn) n.add(m.name); }); return Array.from(n).slice(0,l); }
function getCharacterName() { return SillyTavern.getContext().name2 || "ตัวละคร"; }
function getUserName() { return SillyTavern.getContext().name1 || "ผู้เล่น"; }
function escapeHtml(s) { return typeof s==='string' ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function showToast(m, t='info') { if(typeof toastr!=='undefined') toastr[t](m,'🌸 LumiPulse'); else console.log(`[Lumi] ${m}`); }

function parseJSONFromAI(text) {
    if(!text || typeof text!=='string') return null;
    let m = text.match(/\[[\s\S]*\]/); if(m){try{return JSON.parse(m[0])}catch(_){}}
    m = text.match(/\{[\s\S]*\}/); if(m){try{return JSON.parse(m[0])}catch(_){}}
    toastr.warning('AI ตอบกลับผิดรูปแบบ 🌸'); return null;
}

async function callSTGenerate(prompt) {
    try {
        const ctx = SillyTavern.getContext(); let res;
        if(typeof ctx.generateQuietPrompt==='function') res = await ctx.generateQuietPrompt(prompt,false,false);
        else if(typeof ctx.generateRaw==='function') res = await ctx.generateRaw(prompt,true);
        else if(typeof window.generateQuietPrompt==='function') res = await window.generateQuietPrompt(prompt,false,false);
        else if(typeof window.generateRaw==='function') res = await window.generateRaw(prompt,true);
        else { toastr.error('ไม่พบฟังก์ชันเจนข้อความ'); return null; }
        return parseJSONFromAI(res);
    } catch(e) { console.error('[Lumi] AI Error:', e); toastr.error('AI Error'); return null; }
}

async function requestDiaryGeneration(opts = {}) {
    const { charName = getCharacterName(), triggerType = 'manual', eventInfo = null, linkedChars = [] } = opts;
    const ctx = SillyTavern.getContext(), cur = ctx.characters?.[ctx.characterId] || {};
    let wm = extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm = detectWorldMode();
    const evNote = eventInfo ? `\n🎉 Event: ${eventInfo.label}` : '';
    const prompt = `[System: You are ${charName}'s inner voice. Respond ONLY with JSON. No markdown, no extra text.
Context: ${charName} | World: ${wm==='rpg'?'Group':'Solo'} | Others: ${linkedChars.join(',')||'none'}
Recent Chat:\n${(SillyTavern.getContext().chat||[]).slice(-25).map(m=>`${m.is_user?getUserName():getCharacterName()}: ${(m.mes||'').slice(0,150)}`).join('\n')}${evNote}

INSTRUCTIONS:
1. Infer a FICTIONAL RP date/location/weather from the chat context (e.g., "วันที่ 4 หลังออกจากเมืองหลวง", "รุ่งเช้าที่ริมทะเลสาบ", "ฝนตกปรอยๆ"). DO NOT use real calendar dates.
2. Write a private diary in Thai. 3-5 sentences. Match ${charName}'s personality.
3. Output ONLY this JSON:
{"rp_date": "...", "rp_location": "...", "rp_weather": "...", "affection_score": 0-100, "mood": "...", "diary": "..."}
4. Keep it immersive, emotional, and RP-accurate.`;
    return await callSTGenerate(prompt);
}
async function requestAIGeneration(topic, npcs, rand) {
    const p = `[System: JSON array only. Topic: "${topic}" | Chars: [${npcs.join(',')}]${rand?' (can create new)':' (strict)'}
Generate 4 Thai social posts. Format: [{"author":"ชื่อ","content":"ข้อความ","likes":12,"time":"5m ago"}]`;
    return await callSTGenerate(p);
}

// ═══════════════════════════════════════════════
// MEMORY SYSTEM & AUTO-TRIGGER
// ═══════════════════════════════════════════════
function saveMemory(entry) {
    const s = extension_settings[extensionName];
    s.memories.unshift(entry);
    if(s.memories.length > s.diary.storage.maxEntries) s.memories = s.memories.slice(0, s.diary.storage.maxEntries);
    SillyTavern.getContext().saveSettingsDebounced();
}

function loadMemories(filter = {}) {
    let mem = [...(extension_settings[extensionName].memories || [])];
    if(filter.character) mem = mem.filter(m => m.character === filter.character);
    if(filter.worldMode) mem = mem.filter(m => m.worldMode === filter.worldMode);
    // ปักหมุดขึ้นก่อน แล้วค่อยเรียงเวลา
    mem.sort((a,b) => (b.meta.isPinned ? 1 : 0) - (a.meta.isPinned ? 1 : 0) || new Date(b.timestamp) - new Date(a.timestamp));
    return mem;
}

function checkUnlockCondition(memory) {
    if(!memory.meta.isSecret) return true;
    const cfg = extension_settings[extensionName].diary.display;
    if(cfg.secretUnlockMode==='manual') return false;
    if(cfg.secretUnlockMode==='affection') return (memory.content.affection_score||0) >= 80;
    return (new Date() - new Date(memory.timestamp)) / 86400000 >= 3;
}

function extractTags(text) {
    const t = [], kw = {'#โรแมนติก':['รัก','หัวใจ','ชอบ','แอบชอบ'],'#ดราม่า':['เสียใจ','ร้องไห้','เจ็บ'],'#ตลก':['ขำ','ตลก','555'],'#อบอุ่น':['อบอุ่น','สุขใจ','ขอบคุณ']};
    const l = text.toLowerCase(); for(const[k,w]of Object.entries(kw)) if(w.some(x=>l.includes(x))) t.push(k); return t.slice(0,3);
}

function setupAutoTriggerListener() {
    $(document).on('messageReceived', onNewChatMessage);
    $(document).on('activeCharacterChanged', () => { extension_settings[extensionName]._internal.messageCounter = 0; });
}

async function onNewChatMessage() {
    const s = extension_settings[extensionName], cfg = s.diary.autoGen;
    if(!cfg.enabled) return;
    s._internal.messageCounter++;
    let gen = false, type = null;
    const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();    
    if(cfg.triggerType==='turn_count' && s._internal.messageCounter>=cfg.turnInterval) { gen=true; type='turn_count'; s._internal.messageCounter=0; }
    else if(cfg.triggerType==='emotion' && cfg.emotionKeywords.some(k=>lastMsg.includes(k))) { gen=true; type='emotion'; }
    else if(cfg.triggerType==='random' && Math.random()<cfg.randomChance) { gen=true; type='random'; }
    else if(lastMsg.includes('#จำ') || lastMsg.includes('#diary') || lastMsg.includes('#memory')) { gen=true; type='user_tag'; }
    
    if(gen) {
        SillyTavern.getContext().saveSettingsDebounced();
        const ctx = SillyTavern.getContext(), ev = null; // สามารถเพิ่มระบบเช็คอีเวนต์ได้ภายหลัง
        let wm = s.diary.worldMode; if(wm==='auto') wm=detectWorldMode();
        const res = await requestDiaryGeneration({ triggerType: type, eventInfo: ev, linkedChars: wm==='rpg'?getChatNPCs(3):[] });
        if(res) {
            const entry = { id:"mem_"+Date.now(), timestamp:new Date().toISOString(), trigger:type, character:getCharacterName(), characterId:ctx.characterId, worldMode:wm, linkedCharacters:wm==='rpg'?getChatNPCs(3):[], content:res, meta:{isFavorite:false,isPinned:false,isHidden:false,isSecret:false,unlockCondition:null,tags:extractTags(res.diary),related_context:`[Auto] ${type} | Context: Chat #${SillyTavern.getContext().chat?.length||0}`}};
            saveMemory(entry);
            showToast(`📝 ${entry.character} บันทึกความทรงจำ: "${res.mood}"`);
        }
    }
}

// ═══════════════════════════════════════════════
// STYLES (Glassmorphism + Clean Settings)
// ═══════════════════════════════════════════════
function injectStyles() {
    if($('#lumi-styles').length) return;
    const s = document.createElement('style'); s.id = 'lumi-styles';
    s.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
        @keyframes lumiFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes heartRise { 0%{opacity:1;transform:translate(-50%,-50%) scale(.5)} 100%{opacity:0;transform:translate(-50%,-100px) scale(1.8) rotate(10deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        
        .lumi-vector-heart { position:fixed; z-index:999999; pointer-events:none; width:24px; height:24px; animation:heartRise .7s ease-out forwards; }
        
        /* 🔘 FAB ใหม่: เล็กกระทัดรัด แก้วใสพาสเทล */
        #lumi-main-fab {
            position:fixed !important; z-index:2147483647 !important;
            width:42px; height:42px; cursor:grab; touch-action:none; user-select:none;
            display:flex !important; align-items:center; justify-content:center;
            background: rgba(255, 240, 245, 0.85) !important;
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            border: 1.5px solid rgba(255,255,255,0.6) !important;
            border-radius: 50% !important;
            box-shadow: 0 4px 12px rgba(255,105,180,0.15) !important;
            will-change:transform; transform:translateZ(0);
        }
        #lumi-main-fab:active { cursor:grabbing; transform:scale(0.95); }
        #lumi-main-fab img { width:22px; height:22px; pointer-events:none; filter:drop-shadow(0 1px 2px rgba(0,0,0,.1)); }
        .lumi-floating { animation:lumiFloat 3.5s ease-in-out infinite; }
        
        .lumi-menu-container { position:fixed; z-index:2147483646; display:none; background:rgba(255,255,255,.96); backdrop-filter:blur(15px); border-radius:28px; padding:20px; border:1px solid rgba(255,182,193,.3); box-shadow:0 15px 40px rgba(255,182,193,.15); font-family:'Mitr',sans-serif; }        .lumi-menu-grid { display:flex; gap:18px; justify-content:center; }
        .lumi-menu-item { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; transition:transform .2s; }
        .lumi-menu-item:hover { transform:translateY(-5px); }
        .lumi-menu-icon { width:40px; height:40px; object-fit:contain; }
        .lumi-menu-text { font-size:11px; color:#ff85a2; letter-spacing:.3px; }
        .lumi-branding { margin-top:15px; font-size:9px; color:#ffb6c1; text-transform:uppercase; letter-spacing:3px; text-align:center; opacity:.7; }
        
        .lumi-modal-overlay { position:fixed; top:0; left:0; width:100vw; height:100dvh; background:rgba(15,10,15,.35); backdrop-filter:blur(8px); z-index:2147483648; display:none; align-items:center; justify-content:center; }
        .lumi-modal-box { width:92%; max-width:440px; height:80vh; background:#fff; border-radius:24px; border:1px solid #FFD1DC; box-shadow:0 20px 50px rgba(0,0,0,.08); display:flex; flex-direction:column; overflow:hidden; font-family:'Mitr',sans-serif; animation:fadeIn .3s ease; }
        .lumi-modal-header { padding:18px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #FFF0F3; }
        .lumi-modal-title { font-size:16px; color:#ff85a2; font-weight:400; }
        .lumi-btn-icon-sm { width:32px; height:32px; border-radius:16px; border:none; background:#FFF0F3; color:#ff85a2; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; }
        .lumi-btn-icon-sm:hover { background:#FFE0E6; }
        .lumi-modal-body { flex:1; padding:16px; overflow-y:auto; background:#FAFAFA; }
        
        /* 📅 Timeline & Cards */
        .lumi-filter-bar { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
        .lumi-filter-btn { flex:1; padding:10px; border-radius:14px; border:1px solid #FFD1DC; background:#fff; color:#ff85a2; font-family:'Mitr'; font-size:12px; cursor:pointer; text-align:center; transition:.2s; }
        .lumi-filter-btn:hover { background:#FFF0F3; }
        .lumi-filter-btn.active { background:#FFB6C1; color:#fff; border-color:#FFB6C1; }
        .lumi-gen-btn { padding:12px; border-radius:14px; border:none; background:linear-gradient(135deg,#FFB6C1,#FF85A2); color:#fff; font-family:'Mitr'; font-size:13px; cursor:pointer; box-shadow:0 4px 10px rgba(255,133,162,.2); transition:.2s; }
        .lumi-gen-btn:hover { opacity:.9; transform:translateY(-1px); }
        
        .lumi-memory-card { background:#fff; border:1px solid #FFE8EE; border-radius:16px; padding:14px; margin-bottom:12px; position:relative; animation:fadeIn .3s ease; }
        .lumi-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
        .lumi-rp-meta { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:6px; font-size:10px; color:#ffb6c1; }
        .lumi-rp-meta span { background:#FFF0F3; padding:2px 8px; border-radius:8px; }
        .lumi-card-text { font-size:13px; color:#555; line-height:1.6; white-space:pre-wrap; margin-bottom:10px; }
        .lumi-card-footer { display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #FFE8EE; padding-top:8px; }
        .lumi-card-tags { display:flex; gap:4px; flex-wrap:wrap; }
        .lumi-tag { font-size:9px; padding:2px 6px; background:#F8F4F6; color:#ff85a2; border-radius:6px; }
        .lumi-card-actions { display:flex; gap:6px; }
        .lumi-action-btn { width:26px; height:26px; border-radius:8px; border:1px solid #FFE8EE; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; font-size:12px; }
        .lumi-action-btn:hover { background:#FFF0F3; }
        .lumi-action-btn.active { background:#FFF8E1; border-color:#FFD700; }
        
        .lumi-empty { text-align:center; padding:40px 20px; color:#ffb6c1; font-size:13px; }
        .lumi-empty-icon { font-size:30px; margin-bottom:8px; opacity:.7; }
        
        /* 🎛️ Settings UI ใหม่ */
        .lumi-setting-card { background:#fff; border:1px solid #FFE8EE; border-radius:16px; padding:14px; margin-bottom:12px; }
        .lumi-setting-title { font-size:13px; color:#ff85a2; font-weight:400; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
        .lumi-toggle-row { display:flex; align-items:center; justify-content:space-between; margin:8px 0; }
        .lumi-toggle { width:40px; height:22px; background:#FFE8EE; border-radius:11px; position:relative; cursor:pointer; transition:.3s; }
        .lumi-toggle::after { content:''; position:absolute; top:2px; left:2px; width:18px; height:18px; background:#fff; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,.1); transition:.3s; }
        .lumi-toggle.on { background:#FFB6C1; }
        .lumi-toggle.on::after { left:20px; }
        .lumi-select, .lumi-input-clean { width:100%; padding:10px; border:1px solid #FFE8EE; border-radius:10px; background:#FAFAFA; font-family:'Mitr'; font-size:12px; color:#555; outline:none; margin-top:6px; }
        .lumi-btn-save { width:100%; padding:12px; border:none; border-radius:14px; background:linear-gradient(135deg,#FFB6C1,#FF85A2); color:#fff; font-family:'Mitr'; font-size:13px; cursor:pointer; margin-top:16px; box-shadow:0 4px 12px rgba(255,133,162,.2); }
    `;    document.head.appendChild(s);
}

function spawnHeartEffect(e) {
    const h = document.createElement('div'); h.className='lumi-vector-heart'; h.innerHTML=svgHeart; h.style.left=e.clientX+'px'; h.style.top=e.clientY+'px'; document.body.appendChild(h); setTimeout(()=>h.remove(),800);
}

// ═══════════════════════════════════════════════
// UI RENDERERS
// ═══════════════════════════════════════════════
function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display','flex').hide().fadeIn(300);
    if(type==='forum') renderForumUI();
    else if(type==='diary') renderDiaryUI();
    else if(type==='phone') { $('#lumi-modal-title').text('📱 Phone'); $('#lumi-modal-body').html(`<div class="lumi-empty"><div class="lumi-empty-icon">📱</div><div>Coming Soon 🌸</div></div>`); }
}

function renderForumUI() {
    const s = extension_settings[extensionName], b = $('#lumi-modal-body'); b.empty(); $('#lumi-modal-title').text('💬 Social Forum');
    if(!s.isForumInitialized) { b.html(`<div class="lumi-empty"><div class="lumi-empty-icon">💬</div><div>ระบุหัวข้อฟอรั่ม</div><input id="topic-input" class="lumi-input-clean" placeholder="เช่น มหาวิทยาลัยเวทมนตร์..." style="margin:10px 0;"><button id="btn-gen" class="lumi-gen-btn">เริ่มสร้าง ✨</button></div>`); $('#btn-gen').on('click',()=>{ const t=$('#topic-input').val().trim(); if(!t){toastr.warning("ใส่หัวข้อก่อนนะคะ 🌸");return;} s.forumTopic=t; s.includeRandomNPCs=true; s.isForumInitialized=true; s.forumData=[]; SillyTavern.getContext().saveSettingsDebounced(); renderForumUI(); }); }
    else {
        if(!s.forumData?.length) { b.html(`<div class="lumi-empty"><div class="lumi-empty-icon">⏳</div><div>AI กำลังประมวลผล...</div></div>`); requestAIGeneration(s.forumTopic,getChatNPCs(),true).then(p=>{if(!p?.length){s.isForumInitialized=false;SillyTavern.getContext().saveSettingsDebounced();renderForumUI();return;} s.forumData=p; SillyTavern.getContext().saveSettingsDebounced(); renderForumUI();}); }
        else {
            let h = `<div style="font-size:11px;color:#ffb6c1;text-align:center;margin-bottom:10px;">TOPIC: ${escapeHtml(s.forumTopic.toUpperCase())}</div>`;
            s.forumData.forEach((p,i)=>h+=`<div class="lumi-memory-card" style="animation-delay:${i*.08}s"><div class="lumi-card-header"><span style="font-weight:400;color:#444;">${escapeHtml(p.author)}</span><span style="font-size:10px;color:#ccc;">${escapeHtml(p.time)}</span></div><div class="lumi-card-text">${escapeHtml(p.content)}</div><div class="lumi-card-footer"><span style="font-size:11px;color:#ffb6c1;">❤️ ${p.likes||0}</span></div></div>`);
            h += `<div style="text-align:center;margin-top:10px;"><button id="btn-ref" class="lumi-btn-icon-sm" style="width:40px;height:40px;border-radius:20px;">🔄</button></div>`;
            b.html(h); $('#btn-ref').on('click',()=>{s.forumData=[];SillyTavern.getContext().saveSettingsDebounced();renderForumUI();});
        }
    }
}

function renderDiaryUI() {
    const s = extension_settings[extensionName], b = $('#lumi-modal-body'), cn = getCharacterName();
    $('#lumi-modal-title').text(`📖 ${cn}'s Memories`);
    b.html(`
        <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button class="lumi-gen-btn" style="flex:1;" id="btn-gen-now">✨ บันทึกความทรงจำตอนนี้</button>
            <button class="lumi-filter-btn" style="flex:1;" id="btn-rnd-mem">🎲 สุ่มความทรงจำ</button>
            <button class="lumi-btn-icon-sm" id="btn-open-settings">⚙️</button>
        </div>
        <div class="lumi-filter-bar">
            <button class="lumi-filter-btn active" data-f="all">📜 ทั้งหมด</button>
            <button class="lumi-filter-btn" data-f="solo">👤 เดี่ยว</button>
            <button class="lumi-filter-btn" data-f="rpg">🌐 RPG</button>
        </div>
        <div id="lumi-timeline"></div>
    `);
    
    loadTimeline('all');    $('.lumi-filter-btn').on('click',function(){ $('.lumi-filter-btn').removeClass('active'); $(this).addClass('active'); loadTimeline($(this).data('f')); });
    $('#btn-gen-now').on('click', startManualGen);
    $('#btn-rnd-mem').on('click', randomMemory);
    $('#btn-open-settings').on('click', renderDiarySettingsInModal);
}

function loadTimeline(filter = 'all') {
    const mem = loadMemories(filter==='all'?{}:{worldMode:filter});
    const p = $('#lumi-timeline');
    if(!mem.length){ p.html(`<div class="lumi-empty"><div class="lumi-empty-icon">📭</div><div>ยังไม่มีบันทึก</div><div style="font-size:11px;color:#ccc;margin-top:4px;">พิมพ์ #จำ ในแชท หรือกดปุ่มเจน</div></div>`); return; }
    
    let h = ''; mem.forEach((m,i) => {
        const locked = m.meta.isSecret && !checkUnlockCondition(m);
        const rpMeta = `<span>📅 ${escapeHtml(m.content.rp_date||'วันไม่ระบุ')}</span><span>📍 ${escapeHtml(m.content.rp_location||'ไม่ทราบที่')}</span><span>🌤️ ${escapeHtml(m.content.rp_weather||'ไม่ทราบอากาศ')}</span>`;
        h += `<div class="lumi-memory-card" style="animation-delay:${i*0.03}s">
            <div class="lumi-card-header"><span style="font-size:12px;color:#666;">${escapeHtml(m.character)}</span><span style="font-size:10px;color:#ccc;">#${m.trigger}</span></div>
            <div class="lumi-rp-meta">${rpMeta}</div>
            <div class="lumi-card-text ${locked?'lumi-locked':''}">${locked?'🔒 ความทรงจำนี้ยังมองไม่เห็น...':escapeHtml(m.content.diary||'')}</div>
            <div class="lumi-card-footer">
                <div class="lumi-card-tags">${(m.meta.tags||[]).map(t=>`<span class="lumi-tag">${t}</span>`).join('')}</div>
                <div class="lumi-card-actions">
                    <button class="lumi-action-btn ${m.meta.isPinned?'active':''}" data-act="pin" data-id="${m.id}">${m.meta.isPinned?svgPin:svgPinEmpty}</button>
                    <button class="lumi-action-btn" data-act="del" data-id="${m.id}">🗑️</button>
                </div>
            </div>
        </div>`;
    });
    p.html(h);
    bindCardEvents();
}

function bindCardEvents() {
    $('[data-act="pin"]').on('click',function(){ const id=$(this).data('id'), m=extension_settings[extensionName].memories.find(x=>x.id===id); if(m){ m.meta.isPinned=!m.meta.isPinned; SillyTavern.getContext().saveSettingsDebounced(); loadTimeline($('.lumi-filter-btn.active').data('f')); } });
    $('[data-act="del"]').on('click',function(){ if(confirm('ลบบันทึกนี้?')){ const id=$(this).data('id'), s=extension_settings[extensionName]; s.memories=s.memories.filter(x=>x.id!==id); SillyTavern.getContext().saveSettingsDebounced(); loadTimeline($('.lumi-filter-btn.active').data('f')); } });
}

function startManualGen() {
    const ctx=SillyTavern.getContext(), wm=extension_settings[extensionName].diary.worldMode==='auto'?detectWorldMode():extension_settings[extensionName].diary.worldMode;
    $('#lumi-timeline').html(`<div class="lumi-empty"><div class="lumi-empty-icon">✨</div><div>กำลังบันทึกความทรงจำ...</div></div>`);
    requestDiaryGeneration({triggerType:'manual', linkedChars:wm==='rpg'?getChatNPCs(3):[]}).then(d=>{
        if(!d){loadTimeline();return;}
        saveMemory({id:"mem_"+Date.now(),timestamp:new Date().toISOString(),trigger:'manual',character:getCharacterName(),characterId:ctx.characterId,worldMode:wm,linkedCharacters:wm==='rpg'?getChatNPCs(3):[],content:d,meta:{isFavorite:false,isPinned:false,isHidden:false,isSecret:false,unlockCondition:null,tags:extractTags(d.diary),related_context:`[Manual] Chat #${ctx.chat?.length||0}`}});
        showToast('✨ บันทึกแล้ว'); loadTimeline();
    });
}

function randomMemory() {
    const mem = extension_settings[extensionName].memories; if(!mem.length) return showToast('📭 ยังไม่มีบันทึกให้สุ่ม');
    const r = mem[Math.floor(Math.random()*mem.length)];
    $('#lumi-modal-title').text(`🎲 ความทรงจำสุ่ม`);    loadTimeline('all');
    setTimeout(()=>{ const card = $(`.lumi-memory-card[data-id="${r.id}"]`); if(card.length) { card.css('box-shadow','0 0 20px #FFB6C1').css('transform','scale(1.02)'); $('html,body').animate({scrollTop: card.offset().top - 150}, 400); setTimeout(()=>card.css({boxShadow:'',transform:''}),1500); } }, 300);
}

// ═══════════════════════════════════════════════
// 🎛️ SETTINGS UI (Clean & Organized)
// ═══════════════════════════════════════════════
function renderDiarySettingsInModal() {
    const s = extension_settings[extensionName].diary;
    $('#lumi-modal-title').text('⚙️ ตั้งค่าความทรงจำ');
    $('#lumi-modal-body').html(`
        <div class="lumi-setting-card">
            <div class="lumi-setting-title">🌍 โหมดโลก & การเจนอัตโนมัติ</div>
            <select id="lumi-wm" class="lumi-select"><option value="auto" ${s.worldMode==='auto'?'selected':''}>🤖 อัตโนมัติ (ตรวจจับจากแชท)</option><option value="solo" ${s.worldMode==='solo'?'selected':''}>👤 เดี่ยว</option><option value="rpg" ${s.worldMode==='rpg'?'selected':''}>🌐 RPG/กลุ่ม</option></select>
            <div class="lumi-toggle-row"><span>เปิดเจนอัตโนมัติ</span><div class="lumi-toggle ${s.autoGen.enabled?'on':''}" id="tog-age"></div></div>
            <select id="lumi-tt" class="lumi-select" style="${s.autoGen.enabled?'':'display:none'}"><option value="turn_count" ${s.autoGen.triggerType==='turn_count'?'selected':''}>🔢 ทุก X ข้อความ</option><option value="emotion" ${s.autoGen.triggerType==='emotion'?'selected':''}>💬 พบคำอารมณ์</option><option value="random" ${s.autoGen.triggerType==='random'?'selected':''}>🎲 สุ่ม</option></select>
            <input id="lumi-ti" class="lumi-input-clean" type="number" value="${s.autoGen.turnInterval}" placeholder="จำนวนข้อความ" style="${s.autoGen.triggerType==='turn_count'&&s.autoGen.enabled?'':'display:none'}">
        </div>
        <div class="lumi-setting-card">
            <div class="lumi-setting-title">🔒 ความเป็นส่วนตัว & การแสดง</div>
            <div class="lumi-toggle-row"><span>แสดงภาพซ้อนความลับ</span><div class="lumi-toggle ${s.display.showSecret?'on':''}" id="tog-ss"></div></div>
            <select id="lumi-sm" class="lumi-select"><option value="affection" ${s.display.secretUnlockMode==='affection'?'selected':''}>❤️ ปลดล็อกเมื่อความสัมพันธ์ ≥80</option><option value="event" ${s.display.secretUnlockMode==='event'?'selected':''}>🎉 ผ่านไป 3 วัน</option><option value="manual" ${s.display.secretUnlockMode==='manual'?'selected':''}>✋ แมนนวล</option></select>
        </div>
        <div class="lumi-setting-card">
            <div class="lumi-setting-title">📂 จัดการข้อมูล</div>
            <label style="font-size:12px;color:#666;">เก็บสูงสุด <input id="lumi-me" class="lumi-input-clean" type="number" value="${s.storage.maxEntries}" style="width:60px;padding:6px;display:inline-block;"> รายการ</label>
            <div style="display:flex;gap:8px;margin-top:10px;">
                <button id="btn-exp" class="lumi-btn-icon-sm" style="flex:1;">📤 Export</button>
                <button id="btn-clr" class="lumi-btn-icon-sm" style="flex:1;background:#FFE0E0;color:#ff6b6b;">🗑️ ล้างทั้งหมด</button>
            </div>
        </div>
        <button id="btn-sav" class="lumi-btn-save">💾 บันทึกการตั้งค่า</button>
    `);
    
    $('.lumi-toggle').on('click',function(){ $(this).toggleClass('on'); });
    $('#tog-age').on('click',function(){ $('#lumi-tt').toggle($(this).hasClass('on')); $('#lumi-ti').toggle($(this).hasClass('on') && $('#lumi-tt').val()==='turn_count'); });
    $('#lumi-tt').on('change',function(){ if($('#tog-age').hasClass('on')) $('#lumi-ti').toggle($(this).val()==='turn_count'); });
    
    $('#btn-sav').on('click',()=>{
        const s = extension_settings[extensionName].diary;
        s.worldMode = $('#lumi-wm').val();
        s.autoGen.enabled = $('#tog-age').hasClass('on');
        s.autoGen.triggerType = $('#lumi-tt').val();
        s.autoGen.turnInterval = parseInt($('#lumi-ti').val())||20;
        s.display.showSecret = $('#tog-ss').hasClass('on');
        s.display.secretUnlockMode = $('#lumi-sm').val();
        s.storage.maxEntries = parseInt($('#lumi-me').val())||50;
        SillyTavern.getContext().saveSettingsDebounced();
        extension_settings[extensionName]._internal.messageCounter = 0;
        showToast('✅ บันทึกแล้ว');        setTimeout(()=>renderDiaryUI(), 300);
    });
    $('#btn-exp').on('click',()=>{ const b=new Blob([JSON.stringify(extension_settings[extensionName].memories,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`lumi-mem-${new Date().toISOString().split('T')[0]}.json`;a.click(); showToast('📤 Export เสร็จ'); });
    $('#btn-clr').on('click',()=>{ if(confirm('ล้างทั้งหมด?')){ extension_settings[extensionName].memories=[]; SillyTavern.getContext().saveSettingsDebounced(); showToast('🗑️ ล้างแล้ว'); setTimeout(()=>renderDiaryUI(),300); }});
}

// ═══════════════════════════════════════════════
// FAB & MODAL (โครงสร้างเดิม + แก้จุดสำคัญ)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    if(!document.body){ setTimeout(spawnLumiButton, 1000); return; }
    
    const fab = document.createElement('div'); fab.id='lumi-main-fab'; fab.className='lumi-floating';
    fab.style.bottom='80px'; fab.style.right='20px';
    fab.innerHTML = `<img src="${btnUrl}" draggable="false">`;
    document.body.appendChild(fab);
    
    const menu = document.createElement('div'); menu.className='lumi-menu-container';
    menu.innerHTML = `<div class="lumi-menu-grid"><div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon"><span class="lumi-menu-text">Diary</span></div><div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}" class="lumi-menu-icon"><span class="lumi-menu-text">Phone</span></div><div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon"><span class="lumi-menu-text">Forum</span></div></div><div class="lumi-branding">Lumipulse</div>`;
    document.body.appendChild(menu);
    
    function updateMenuPos(){ const r=fab.getBoundingClientRect(), m=$(menu); let l=r.left-(m.outerWidth()/2)+(r.width/2), t=r.top-m.outerHeight()-12; if(l<10)l=10; if(l+m.outerWidth()>window.innerWidth-10)l=window.innerWidth-m.outerWidth()-10; if(t<10)t=r.bottom+12; m.css({left:l+'px',top:t+'px'}); }
    
    // 🖱️ Drag Logic (ลื่นมาก ไม่มีรีเซ็ตกวนใจ)
    let isDrag=false, startX=0, startY=0, offX=0, offY=0;
    const TH = 12;
    
    fab.addEventListener('mousedown', e => { if(e.button===2)return; e.preventDefault(); isDrag=false; fab.classList.remove('lumi-floating'); startX=e.clientX; startY=e.clientY; offX=e.clientX-fab.getBoundingClientRect().left; offY=e.clientY-fab.getBoundingClientRect().top; });
    fab.addEventListener('touchstart', e => { e.preventDefault(); isDrag=false; fab.classList.remove('lumi-floating'); const t=e.touches[0]; startX=t.clientX; startY=t.clientY; offX=t.clientX-fab.getBoundingClientRect().left; offY=t.clientY-fab.getBoundingClientRect().top; }, {passive:false});
    
    document.addEventListener('mousemove', e => { const dx=e.clientX-startX, dy=e.clientY-startY; if(!isDrag && Math.sqrt(dx*dx+dy*dy)>TH){ isDrag=true; $(menu).fadeOut(100); } if(!isDrag)return; fab.style.left=Math.max(0,Math.min(e.clientX-offX,window.innerWidth-42))+'px'; fab.style.top=Math.max(0,Math.min(e.clientY-offY,window.innerHeight-42))+'px'; fab.style.right='auto'; fab.style.bottom='auto'; updateMenuPos(); });
    document.addEventListener('touchmove', e => { e.preventDefault(); const t=e.touches[0], dx=t.clientX-startX, dy=t.clientY-startY; if(!isDrag && Math.sqrt(dx*dx+dy*dy)>TH){ isDrag=true; $(menu).fadeOut(100); } if(!isDrag)return; fab.style.left=Math.max(0,Math.min(t.clientX-offX,window.innerWidth-42))+'px'; fab.style.top=Math.max(0,Math.min(t.clientY-offY,window.innerHeight-42))+'px'; fab.style.right='auto'; fab.style.bottom='auto'; updateMenuPos(); }, {passive:false});
    
    const endDrag = () => { if(!isDrag){ updateMenuPos(); $(menu).fadeToggle(300); spawnHeartEffect({_fromDrag:false, clientX: startX, clientY: startY}); } fab.classList.add('lumi-floating'); isDrag=false; };
    document.addEventListener('mouseup', endDrag); document.addEventListener('touchend', endDrag);
    
    $(document).off('click','#lumi-diary').on('click','#lumi-diary',()=>openLumiModal('diary')).off('click','#lumi-phone').on('click','#lumi-phone',()=>openLumiModal('phone')).off('click','#lumi-forum').on('click','#lumi-forum',()=>openLumiModal('forum'));
}

function createContentModal(){ if($('#lumi-modal-overlay').length)return; $('body').append(`<div id="lumi-modal-overlay" class="lumi-modal-overlay"><div class="lumi-modal-box"><div class="lumi-modal-header"><span id="lumi-modal-title" class="lumi-modal-title"></span><button class="lumi-btn-icon-sm" id="lumi-close-modal">✕</button></div><div id="lumi-modal-body" class="lumi-modal-body"></div></div></div>`); $('#lumi-close-modal, #lumi-modal-overlay').on('click',function(e){if(e.target===this||e.target.id==='lumi-close-modal')$('#lumi-modal-overlay').fadeOut(200);}); }

function createSettingsUI(){ $('#extensions_settings').append(`<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color:#ff85a2;font-family:'Mitr';font-weight:300;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="font-family:'Mitr';font-weight:300;display:flex;flex-direction:column;gap:8px;padding:12px 0;"><label class="checkbox_label"><input id="lumi_enable_toggle" type="checkbox"><span>เปิดใช้งาน LumiPulse</span></label><button id="lumi-reset" class="menu_button">🗑️ Reset Data</button><div style="font-size:10px;color:#ffb6c1;margin-top:4px;">v2.1 · 📝 Auto Memory · 🎲 RP Context</div></div></div>`); $('#lumi_enable_toggle').prop('checked',extension_settings[extensionName].isEnabled); $(document).on('change','#lumi_enable_toggle',function(){ const en=$(this).prop('checked'); extension_settings[extensionName].isEnabled=en; SillyTavern.getContext().saveSettingsDebounced(); if(en)setTimeout(()=>{spawnLumiButton();createContentModal();setupAutoTriggerListener();},500); else{$('#lumi-main-fab,.lumi-menu-container,#lumi-modal-overlay').remove(); $(document).off('messageReceived',onNewChatMessage);} }); $(document).on('click','#lumi-reset',()=>{ const s=extension_settings[extensionName]; s.forumData=[];s.memories=[];s._internal={messageCounter:0,firstChatDate:null}; SillyTavern.getContext().saveSettingsDebounced(); showToast("รีเซ็ตแล้ว 🌸"); }); }
