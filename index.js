"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: true, // เปลี่ยนเป็น true เพื่อให้ปุ่มแสดงทันทีหลังติดตั้ง
    forumTopic: "",
    isForumInitialized: false,
    includeRandomNPCs: true,
    forumData: [],
    diaryData: null,
    
    // Diary 2.0 Config
    diary: {
        worldMode: 'auto',
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก', 'โกรธ', 'เสียใจ', 'ดีใจ', 'ตกใจ', 'หัวใจ', 'ชอบ'], randomChance: 0.1 },
        display: { viewMode: 'timeline', showSecret: true, secretUnlockMode: 'affection' },
        storage: { maxEntries: 50, autoSave: true }
    },
    memories: [],
    _internal: { messageCounter: 0, lastGenerated: 0, firstChatDate: null }
};
let extension_settings = {};

const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart    = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1" stroke="#FFB6C1" stroke-width="1" stroke-linejoin="round"/></svg>`;
const svgSettings = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="#FFB6C1" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgStarEmpty= `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT (คงโครงสร้างเดิมเป๊ะ)
// ═══════════════════════════════════════════════
jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext) {
            clearInterval(boot);
            initLumiPulse();
        }
    }, 1000);
});

function initLumiPulse() {
    console.log("[LumiPulse] 🟢 Init started");
    const context = SillyTavern.getContext();
        if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = { ...defaultSettings };
        context.saveSettingsDebounced();
    }
    
    const s = context.extensionSettings[extensionName];
    if (!s.diary) s.diary = { ...defaultSettings.diary };
    if (!s.memories) s.memories = [];
    if (!s._internal) s._internal = { ...defaultSettings._internal };
    
    if (s.diaryData && s.memories.length === 0) {
        s.memories.push({ id: "mem_legacy_"+Date.now(), timestamp: new Date().toISOString(), trigger: "legacy", character: getCharacterName(), characterId: context.characterId, worldMode: 'solo', linkedCharacters: [], content: {...s.diaryData}, meta: { isFavorite: false, isHidden: false, isSecret: false, unlockCondition: null, tags: ["#นำเข้า"], relatedMessages: [], linkedMemoryIds: [] }});
        s.diaryData = null; context.saveSettingsDebounced();
    }
    
    extension_settings = context.extensionSettings;
    
    // 🛡️ โหลดสไตล์ก่อนเสมอ
    injectStyles();
    createSettingsUI();
    
    if (extension_settings[extensionName].isEnabled) {
        // ⏳ หน่วงนิดหน่อยให้ ST โหลด DOM เสร็จ
        setTimeout(() => {
            spawnLumiButton();
            createContentModal();
            setupAutoTriggerListener();
            console.log("[LumiPulse] ✅ Modules loaded");
        }, 1200);
    }
    
    // Heart Effect (คงโครงสร้างเดิม)
    document.addEventListener('click', (e) => {
        if (!e._fromDrag) spawnHeartEffect(e);
    });
}

// ═══════════════════════════════════════════════
// HELPERS (เดิม + ใหม่)
// ═══════════════════════════════════════════════
function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [];
    const uniqueChars = new Set();
    chat.slice(-50).forEach(msg => { if (msg.name && !msg.is_user && !msg.is_system) uniqueChars.add(msg.name); });
    return uniqueChars.size > 2 ? 'rpg' : 'solo';
}

function getChatNPCs(limit = 5) {
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set(), currentChar = getCharacterName();    chat.slice(-40).forEach(m => { if (m.name && !m.is_user && !m.is_system && m.name !== currentChar) names.add(m.name); });
    return Array.from(names).slice(0, limit);
}

function checkForSpecialEvent(charName, characterData) {
    const today = new Date(), desc = characterData?.description || '', notes = characterData?.data?.creator_notes || '';
    const birthdayMatch = (desc + notes).match(/birthday[:\s]+(\d{1,2})[\/\-](\d{1,2})/i);
    if (birthdayMatch) { const [, day, month] = birthdayMatch; if (today.getDate() == day && today.getMonth() + 1 == month) return { type: 'birthday', label: '🎂 วันเกิด', isSecret: false, promptBoost: `Today is ${charName}'s birthday! Write a special diary entry...` }; }
    const firstDate = extension_settings[extensionName]._internal.firstChatDate;
    if (firstDate) { const days = Math.floor((today - new Date(firstDate)) / 86400000); if ([30,100,365].includes(days)) return { type: `anniversary_${days}d`, label: `💕 ครบ ${days} วัน`, isSecret: days>=100, promptBoost: `It's been ${days} days...` }; }
    if (today.getDate() <= 3) { const m = today.getMonth(); const s = m>=2&&m<=4?'ฤดูใบไม้ผลิ🌸':m>=5&&m<=7?'ฤดูร้อน☀️':m>=8&&m<=10?'ฤดูใบไม้ร่วง🍁':'ฤดูหนาว❄️'; return { type: `season_${m}`, label: `🗓️ ${s}`, isSecret: false, promptBoost: `A new season (${s}) has begun...` }; }
    return null;
}

function extractTags(text) {
    const tags = [], kw = { '#โรแมนติก':['รัก','หัวใจ','ชอบ','แอบชอบ','ใจเต้น'], '#ดราม่า':['เสียใจ','ร้องไห้','เจ็บปวด'], '#ตลก':['ขำ','ตลก','ฮา','555'], '#จุดเปลี่ยน':['ตัดสินใจ','เปลี่ยน','เริ่ม','ครั้งแรก'], '#อบอุ่น':['อบอุ่น','สุขใจ','ขอบคุณ','ดีใจ'] };
    const low = text.toLowerCase();
    for (const [t, w] of Object.entries(kw)) if (w.some(k => low.includes(k))) tags.push(t);
    return tags.slice(0,3);
}

function checkUnlockCondition(memory) {
    if (!memory.meta.isSecret) return true;
    const cfg = extension_settings[extensionName].diary.display;
    if (cfg.secretUnlockMode === 'manual') return false;
    if (cfg.secretUnlockMode === 'affection') return (memory.content.affection_score || 0) >= (memory.meta.unlockCondition?.value || 80);
    return (new Date() - new Date(memory.timestamp)) / 86400000 >= 3;
}

function saveMemory(entry) {
    const s = extension_settings[extensionName];
    s.memories.unshift(entry);
    if (s.memories.length > s.diary.storage.maxEntries) s.memories = s.memories.slice(0, s.diary.storage.maxEntries);
    SillyTavern.getContext().saveSettingsDebounced();
}

function loadMemories(filter = {}) {
    let mem = [...(extension_settings[extensionName].memories || [])];
    if (filter.character) mem = mem.filter(m => m.character === filter.character);
    if (filter.worldMode) mem = mem.filter(m => m.worldMode === filter.worldMode);
    if (filter.showSecret === false) mem = mem.filter(m => !m.meta.isSecret || checkUnlockCondition(m));
    return mem.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function formatThaiDate(iso) { const d = new Date(iso), m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`; }
function formatTime(iso) { const d = new Date(iso); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function getMoodEmoji(mood) { return { 'ตื่นเต้น':'😳','ดีใจ':'😊','อบอุ่น':'🥰','รัก':'💖','เสียใจ':'😢','โกรธ':'😠','สับสน':'😕','แปลกหน้า':'😶','เพื่อน':'🤝','สนิท':'💕' }[mood] || '🌸'; }
function getCharacterName() { return SillyTavern.getContext().name2 || "ตัวละคร"; }
function getUserName() { return SillyTavern.getContext().name1 || "ผู้เล่น"; }
function getRecentChatSummary(limit = 30) { const c = SillyTavern.getContext().chat || []; return c.slice(-limit).map(m => `${m.is_user?getUserName():getCharacterName()}: ${(m.mes||"").slice(0,200)}`).join("\n"); }function escapeHtml(str) { if(typeof str!=='string') return ''; return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// ═══════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════
function parseJSONFromAI(text) {
    if (!text || typeof text !== 'string') return null;
    let m = text.match(/\[[\s\S]*\]/); if (m) { try { return JSON.parse(m[0]); } catch(_) {} }
    m = text.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch(_) {} }
    toastr.warning('AI ตอบกลับผิดรูปแบบ 🌸'); return null;
}

async function callSTGenerate(prompt) {
    try {
        const ctx = SillyTavern.getContext();
        let res;
        if (typeof ctx.generateQuietPrompt==='function') res = await ctx.generateQuietPrompt(prompt,false,false);
        else if (typeof ctx.generateRaw==='function') res = await ctx.generateRaw(prompt,true);
        else if (typeof window.generateQuietPrompt==='function') res = await window.generateQuietPrompt(prompt,false,false);
        else if (typeof window.generateRaw==='function') res = await window.generateRaw(prompt,true);
        else { toastr.error('หา generate function ไม่เจอ'); return null; }
        return parseJSONFromAI(res);
    } catch (e) { console.error('[Lumi] AI Error:', e); toastr.error('AI Error: '+e.message); return null; }
}

async function requestAIGeneration(topic, npcs, includeRandom) {
    const prompt = `[System: Respond ONLY with JSON array. Topic: "${topic}" | Characters: [${npcs.join(', ')}|${includeRandom?'(can create new)':'(strict)'}]
Generate 4 Thai social posts. Format: [{"author":"ชื่อ","content":"ข้อความ","likes":12,"time":"5m ago"}]`;
    return await callSTGenerate(prompt);
}

async function requestDiaryGeneration(options = {}) {
    const { charName = getCharacterName(), triggerType = 'manual', eventInfo = null, linkedChars = [] } = options;
    const ctx = SillyTavern.getContext(), currentChar = ctx.characters?.[ctx.characterId] || {};
    let wm = extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm = detectWorldMode();
    const eventNote = eventInfo ? `\n🎉 Event: ${eventInfo.label} - ${eventInfo.promptBoost}` : '';
    const prompt = `[System: You are ${charName}'s inner voice. Respond ONLY with JSON.
Profile: ${currentChar.data?.personality||'Friendly'} | World: ${wm==='rpg'?'Group':'Solo'} | Others: ${linkedChars.join(',')}
Recent Chat:\n${getRecentChatSummary(30)}\n${eventNote}
Write a private diary in Thai. 3-5 sentences. JSON only: {"date":"...","affection_score":0-100,"mood":"...","diary":"..."}`;
    return await callSTGenerate(prompt);
}

// ═══════════════════════════════════════════════
// AUTO-TRIGGER
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).on('messageReceived', onNewChatMessage);
    $(document).on('activeCharacterChanged', () => {
        extension_settings[extensionName]._internal.messageCounter = 0;        SillyTavern.getContext().saveSettingsDebounced();
        if (!extension_settings[extensionName]._internal.firstChatDate) {
            extension_settings[extensionName]._internal.firstChatDate = new Date().toISOString();
            SillyTavern.getContext().saveSettingsDebounced();
        }
    });
}

async function onNewChatMessage() {
    const s = extension_settings[extensionName], cfg = s.diary.autoGen;
    if (!cfg.enabled) return;
    s._internal.messageCounter++;
    let gen = false, type = null;
    if (cfg.triggerType==='turn_count' && s._internal.messageCounter>=cfg.turnInterval) { gen=true; type='turn_count'; s._internal.messageCounter=0; }
    else if (cfg.triggerType==='emotion') { const msg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'').toLowerCase(); if(cfg.emotionKeywords.some(k=>msg.includes(k))) { gen=true; type='emotion_detected'; } }
    else if (cfg.triggerType==='random' && Math.random()<cfg.randomChance) { gen=true; type='random'; }
    else if (cfg.triggerType==='user_tag') { const msg = SillyTavern.getContext().chat?.slice(-1)[0]?.mes||''; if(msg.includes('#จำ')||msg.includes('#memory')) { gen=true; type='user_tagged'; } }
    
    if (gen) {
        SillyTavern.getContext().saveSettingsDebounced();
        const ctx = SillyTavern.getContext(), ev = checkForSpecialEvent(getCharacterName(), ctx.characters?.[ctx.characterId]);
        if(ev) type=`event_${ev.type}`;
        let wm = s.diary.worldMode; if(wm==='auto') wm=detectWorldMode();
        const res = await requestDiaryGeneration({ triggerType: type, eventInfo: ev, linkedChars: wm==='rpg'?getChatNPCs(3):[] });
        if(res) {
            const entry = { id:"mem_"+Date.now(), timestamp:new Date().toISOString(), trigger:type, character:getCharacterName(), characterId:ctx.characterId, worldMode:wm, linkedCharacters:wm==='rpg'?getChatNPCs(3):[], content:{...res, eventType:ev?.type}, meta:{isFavorite:false,isHidden:false,isSecret:ev?.isSecret,unlockCondition:ev?{type:s.diary.display.secretUnlockMode,value:80}:null,tags:extractTags(res.diary),relatedMessages:[],linkedMemoryIds:[]} };
            saveMemory(entry);
            if(!entry.meta.isSecret || s.diary.display.showSecret) showToast(`🌸 ${entry.character} มีความทรงจำใหม่: "${res.mood}"`);
        }
    }
}

// ═══════════════════════════════════════════════
// STYLES (คงเดิม + บังคับแสดงปุ่ม)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400&display=swap');
        @keyframes lumiPop { 0%{opacity:0;transform:scale(.8) translateY(20px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes lumiFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes heartRise { 0%{opacity:1;transform:translate(-50%,-50%) scale(.5)} 100%{opacity:0;transform:translate(-50%,-100px) scale(2) rotate(15deg)} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .lumi-vector-heart { position:fixed; z-index:2147483647; pointer-events:none; width:30px; height:30px; animation:heartRise .8s ease-out forwards; filter:drop-shadow(0 0 5px #FFB6C1); }
        
        /* 🛡️ บังคับแสดงปุ่มเสมอ */
        #lumi-main-fab {
            position:fixed !important; z-index:2147483646 !important;            width:50px; height:50px; cursor:grab; touch-action:none; user-select:none;
            display:block !important; visibility:visible !important; opacity:1 !important;
            background: url('${btnUrl}') no-repeat center center, #FFB6C1 !important;
            background-size: 70%, 100% !important;
            border-radius:50% !important; filter:drop-shadow(0 5px 15px rgba(255,182,193,.5)) !important;
            will-change:transform; transform:translateZ(0);
        }
        #lumi-main-fab:active { cursor:grabbing; }
        .lumi-floating { animation:lumiFloat 3s ease-in-out infinite; }
        .lumi-menu-container { position:fixed; z-index:2147483645; display:none; background:rgba(255,255,255,.98); backdrop-filter:blur(25px); border-radius:45px; padding:30px; border:2px solid rgba(255,182,193,.4); box-shadow:0 25px 60px rgba(255,182,193,.3); font-family:'Mitr',sans-serif; font-weight:300; }
        .lumi-menu-grid { display:flex; gap:25px; align-items:center; justify-content:center; }
        .lumi-menu-item { display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer; transition:transform .3s; }
        .lumi-menu-item:hover { transform:translateY(-8px); }
        .lumi-menu-icon { width:55px; height:55px; object-fit:contain; }
        .lumi-menu-text { font-size:13px; color:#ff85a2; letter-spacing:.5px; }
        .lumi-branding { margin-top:25px; font-size:11px; color:#ffb6c1; text-transform:uppercase; letter-spacing:4px; text-align:center; }
        .lumi-modal-overlay { position:fixed; top:0; left:0; width:100vw; height:100dvh; background:rgba(0,0,0,.1); backdrop-filter:blur(15px); z-index:2147483648; display:none; align-items:center; justify-content:center; }
        .lumi-modal-box { width:94%; max-width:460px; height:82vh; background:#fff; border-radius:45px; border:2px solid #FFD1DC; box-shadow:0 30px 70px rgba(255,182,193,.15); display:flex; flex-direction:column; overflow:hidden; font-family:'Mitr',sans-serif; font-weight:300; animation:lumiPop .4s forwards; }
        .lumi-modal-header { padding:25px; text-align:center; color:#ff85a2; border-bottom:1.5px solid #FFF0F3; position:relative; font-size:18px; }
        .lumi-modal-close { position:absolute; right:20px; top:25px; width:35px; height:35px; background:#FFF0F3; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#ff85a2; }
        .lumi-modal-opt { position:absolute; left:20px; top:25px; width:35px; height:35px; color:#ffb6c1; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.3s; }
        .lumi-modal-opt:hover { color:#ff85a2; transform:rotate(45deg); }
        .lumi-modal-body { flex:1; padding:20px; overflow-y:auto; background:#fff; }
        .lumi-setup { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:20px; text-align:center; }
        .lumi-input { width:100%; background:#FFF9FA; border:1.5px solid #FFD1DC; border-radius:20px; padding:15px; color:#ff85a2; font-family:'Mitr'; text-align:center; outline:none; font-size:14px; box-sizing:border-box; }
        .lumi-btn-gen { background:linear-gradient(135deg,#FFB6C1,#FF85A2); color:#fff; border:none; padding:12px 45px; border-radius:25px; font-family:'Mitr'; cursor:pointer; transition:opacity .3s; box-shadow:0 5px 15px rgba(255,133,162,.2); font-size:14px; }
        .lumi-btn-gen:hover { opacity:.85; }
        .forum-post { background:#fff; border-radius:30px; padding:18px; margin-bottom:18px; border:1px solid #FDF2F4; box-shadow:0 5px 15px rgba(0,0,0,.02); animation:lumiPop .5s backwards; }
        .post-header { display:flex; gap:12px; align-items:center; margin-bottom:10px; }
        .post-avatar { width:45px; height:45px; border-radius:50%; border:2px solid #FFD1DC; background:#FFF0F3; display:flex; align-items:center; justify-content:center; color:#ff85a2; font-size:18px; flex-shrink:0; }
        .post-author { font-weight:400; color:#444; font-size:15px; }
        .post-content { font-size:14px; color:#666; line-height:1.6; }
        .post-footer { margin-top:12px; color:#ffb6c1; font-size:13px; display:flex; gap:15px; }
        .lumi-loader-wrap { display:flex; flex-direction:column; align-items:center; gap:15px; margin-top:100px; }
        .lumi-loader { width:45px; height:45px; border:3px solid #FFF0F3; border-top-color:#ff85a2; border-radius:50%; animation:spin 1s infinite linear; }
        .lumi-coming-soon { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:16px; color:#ffb6c1; font-size:15px; text-align:center; }
        .lumi-coming-soon img { width:80px; opacity:.7; }
        .lumi-diary-wrap { padding-bottom:10px; }
        .lumi-diary-header { display:flex; gap:14px; align-items:center; margin-bottom:20px; }
        .lumi-diary-avatar { width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#FFD1DC,#FFB6C1); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; flex-shrink:0; box-shadow:0 4px 12px rgba(255,182,193,.4); }
        .lumi-diary-charname { font-size:17px; color:#444; font-weight:400; }
        .lumi-diary-date { font-size:11px; color:#ffb6c1; margin-top:3px; }
        .lumi-affection-wrap { background:#FFF9FA; border-radius:20px; padding:14px 16px; margin-bottom:20px; border:1px solid #FFE8EE; }
        .lumi-affection-label { display:flex; justify-content:space-between; font-size:12px; color:#aaa; margin-bottom:8px; }
        .lumi-affection-track { height:8px; background:#FFE8EE; border-radius:10px; overflow:hidden; }
        .lumi-affection-fill { height:100%; border-radius:10px; transition:width 1s ease; width:0%; }
        .lumi-affection-score { text-align:right; font-size:11px; color:#ffb6c1; margin-top:5px; }
        .lumi-diary-paper { background:#FFFBFC; border:1px solid #FFE8EE; border-radius:25px; padding:22px 20px; position:relative; overflow:hidden; min-height:150px; }
        .lumi-diary-lines { position:absolute; top:0; left:0; right:0; bottom:0; background-image:repeating-linear-gradient(transparent,transparent 27px,#FFF0F3 27px,#FFF0F3 28px); opacity:.5; border-radius:25px; }
        .lumi-diary-text { position:relative; z-index:1; font-size:14px; color:#555; line-height:1.85; white-space:pre-wrap; }        .lumi-timeline-container { padding-bottom:10px; }
        .lumi-timeline-date { font-size:13px; color:#ffb6c1; font-weight:400; padding:12px 0 8px; border-bottom:1px dashed #FFE8EE; margin:16px 0 12px; }
        .lumi-memory-card { background:#FFFBFC; border:1px solid #FFE8EE; border-radius:20px; padding:16px; margin-bottom:12px; position:relative; overflow:hidden; transition:box-shadow .2s,transform .2s; }
        .lumi-memory-card:hover { box-shadow:0 4px 12px rgba(255,182,193,.15); transform:translateY(-2px); }
        .lumi-memory-card.locked { opacity:.7; background:#FFF5F7; }
        .lumi-memory-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px; }
        .lumi-memory-char { font-weight:400; color:#444; font-size:15px; }
        .lumi-memory-time { font-size:11px; color:#ccc; }
        .lumi-badge-rpg, .lumi-badge-event { font-size:10px; padding:2px 8px; border-radius:10px; background:#FFF0F3; color:#ff85a2; }
        .lumi-memory-mood { display:flex; align-items:center; gap:8px; font-size:12px; color:#666; margin-bottom:10px; }
        .lumi-affection-mini { font-size:11px; font-weight:400; }
        .lumi-memory-content { font-size:14px; color:#555; line-height:1.7; margin-bottom:12px; white-space:pre-wrap; }
        .lumi-memory-content.locked { color:#bbb; font-style:italic; }
        .lumi-memory-tags { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
        .lumi-tag { font-size:10px; padding:3px 10px; border-radius:12px; background:#FFF0F3; color:#ff85a2; }
        .lumi-memory-actions { display:flex; gap:8px; justify-content:flex-end; border-top:1px solid #FFE8EE; padding-top:10px; }
        .lumi-btn-icon { width:32px; height:32px; border-radius:50%; border:none; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:transform .2s,background .2s; font-size:16px; color:#ffb6c1; }
        .lumi-btn-icon:hover { background:#FFF0F3; transform:scale(1.1); }
        .lumi-btn-icon.active { background:#FFF0F3; color:#FFD700; }
        .lumi-btn-icon.danger:hover { background:#FFE0E0; color:#ff6b6b; }
        .lumi-locked-overlay { position:absolute; inset:0; background:rgba(255,255,255,.9); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; z-index:1; }
        .lumi-locked-icon { width:40px; height:40px; opacity:.8; }
        .lumi-locked-text { font-size:12px; color:#ffb6c1; text-align:center; }
        .lumi-locked-hint { font-size:10px; color:#ccc; }
        .lumi-settings-section { margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #FFF0F3; }
        .lumi-settings-section:last-child { border-bottom:none; }
        .lumi-settings-section h4 { font-size:14px; color:#ff85a2; margin-bottom:12px; font-weight:400; }
        .lumi-sub-settings { margin-left:16px; margin-top:8px; display:flex; flex-direction:column; gap:8px; font-size:12px; color:#666; }
        .lumi-sub-settings input[type="number"], .lumi-sub-settings input[type="text"], .lumi-sub-settings select { width:100%; padding:8px 12px; border:1px solid #FFD1DC; border-radius:12px; background:#FFF9FA; color:#ff85a2; font-family:'Mitr'; font-size:12px; outline:none; }
        .lumi-btn-small { padding:6px 16px; border-radius:15px; border:none; background:#FFF0F3; color:#ff85a2; font-family:'Mitr'; font-size:11px; cursor:pointer; margin-right:8px; transition:background .2s; }
        .lumi-btn-small:hover { background:#FFE0E6; }
        .lumi-btn-small.danger { background:#FFE0E0; color:#ff6b6b; }
        .lumi-btn-small.danger:hover { background:#FFCCCC; }
        .lumi-filter-bar { display:flex; gap:8px; padding:10px; background:#FFF9FA; border-radius:16px; margin-bottom:16px; flex-wrap:wrap; }
        .lumi-filter-select { flex:1; min-width:120px; padding:8px 12px; border:1px solid #FFD1DC; border-radius:12px; background:#fff; color:#ff85a2; font-family:'Mitr'; font-size:12px; }
        .lumi-filter-search { flex:2; min-width:150px; padding:8px 12px; border:1px solid #FFD1DC; border-radius:12px; background:#fff; color:#666; font-family:'Mitr'; font-size:12px; }
        .lumi-empty { text-align:center; color:#ffb6c1; padding:40px 20px; font-size:14px; line-height:1.6; }
        .lumi-empty-icon { font-size:40px; margin-bottom:12px; opacity:.7; }
        @media (max-width:768px) { #lumi-main-fab { width:48px; height:48px; } .lumi-menu-container { width:calc(100vw-40px); right:20px!important; } .lumi-menu-grid { gap:15px; } .lumi-menu-icon { width:48px; height:48px; } }
    `;
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════
// HEART EFFECT
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) {
    const heart = document.createElement('div');
    heart.className = 'lumi-vector-heart';
    heart.innerHTML = svgHeart;    heart.style.left = e.clientX + 'px';
    heart.style.top  = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 800);
}

// ═══════════════════════════════════════════════
// MODAL CONTROL
// ═══════════════════════════════════════════════
function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display','flex').hide().fadeIn(300);
    if(type==='forum') renderForumUI();
    else if(type==='diary') renderDiaryUI();
    else if(type==='phone') { $('#lumi-modal-title').text('📱 Phone'); $('#lumi-modal-body').html(`<div class="lumi-coming-soon"><img src="${iconPhone}"><div>Phone</div><div style="font-size:12px;opacity:.6;">Coming Soon 🌸</div></div>`); $('.lumi-modal-opt').hide(); }
}

// ═══════════════════════════════════════════════
// FORUM UI
// ═══════════════════════════════════════════════
function renderForumUI() {
    const s = extension_settings[extensionName], body = $('#lumi-modal-body'); body.empty(); $('#lumi-modal-title').text('Social Forum');
    if(!s.isForumInitialized) { $('.lumi-modal-opt').hide(); body.html(`<div class="lumi-setup"><img src="${iconForum}" style="width:70px;"><div style="color:#ff85a2;font-size:16px;">ระบุหัวข้อฟอรั่ม</div><input id="topic-input" class="lumi-input" placeholder="เช่น มหาวิทยาลัยเวทมนตร์..." value="${escapeHtml(s.forumTopic)}"><label class="checkbox_label" style="font-size:13px;color:#ffb6c1;"><input id="npc-opt" type="checkbox" ${s.includeRandomNPCs?'checked':''}><span>สร้าง NPC เสริม</span></label><button id="btn-gen" class="lumi-btn-gen">เริ่มสร้างฟอรั่ม ✨</button></div>`); $('#btn-gen').on('click',()=>{ const t=$('#topic-input').val().trim(); if(!t){toastr.warning("กรุณาใส่หัวข้อ 🌸");return;} s.forumTopic=t; s.includeRandomNPCs=$('#npc-opt').prop('checked'); s.isForumInitialized=true; s.forumData=[]; SillyTavern.getContext().saveSettingsDebounced(); renderForumUI(); }); }
    else { $('.lumi-modal-opt').show(); if(!s.forumData?.length) { body.html(`<div class="lumi-loader-wrap"><div class="lumi-loader"></div><div style="color:#ff85a2;">AI กำลังประมวลผล...</div></div>`); requestAIGeneration(s.forumTopic, getChatNPCs(), s.includeRandomNPCs).then(p=>{ if(!p?.length){s.isForumInitialized=false;SillyTavern.getContext().saveSettingsDebounced();renderForumUI();return;} s.forumData=p; SillyTavern.getContext().saveSettingsDebounced(); renderForumUI(); }); }
    else { body.append(`<div style="font-size:11px;color:#ffb6c1;text-align:center;margin-bottom:15px;letter-spacing:2px;">TOPIC: ${escapeHtml(s.forumTopic.toUpperCase())}</div>`); s.forumData.forEach((p,i)=>{ body.append(`<div class="forum-post" style="animation-delay:${i*.08}s"><div class="post-header"><div class="post-avatar">${(p.author||'?').charAt(0).toUpperCase()}</div><div style="display:flex;flex-direction:column;"><span class="post-author">${escapeHtml(p.author||'Unknown')}</span><span style="font-size:10px;color:#CCC;">${escapeHtml(p.time||'now')}</span></div></div><div class="post-content">${escapeHtml(p.content||'')}</div><div class="post-footer">❤️ ${p.likes||0} Likes</div></div>`); }); body.append(`<div style="text-align:center;margin-top:10px;padding-bottom:20px;"><button id="btn-refresh-forum" class="lumi-btn-gen" style="padding:8px 30px;font-size:12px;">🔄 Refresh</button></div>`); $('#btn-refresh-forum').on('click',()=>{ s.forumData=[]; SillyTavern.getContext().saveSettingsDebounced(); renderForumUI(); }); } }
}

// ═══════════════════════════════════════════════
// DIARY UI 2.0
// ═══════════════════════════════════════════════
const AFFECTION_LEVELS = [{min:0,max:20,label:"แปลกหน้า",color:"#CCC",emoji:"😶"},{min:20,max:40,label:"รู้จักกัน",color:"#FFD1DC",emoji:"🙂"},{min:40,max:60,label:"เพื่อน",color:"#FFB6C1",emoji:"😊"},{min:60,max:80,label:"สนิทกัน",color:"#FF85A2",emoji:"🥰"},{min:80,max:101,label:"ใกล้ชิดมาก",color:"#FF4D79",emoji:"💖"}];
function getAffectionLevel(score) { return AFFECTION_LEVELS.find(l=>score>=l.min&&score<l.max)||AFFECTION_LEVELS[0]; }

function renderDiaryUI() {
    const s = extension_settings[extensionName], body = $('#lumi-modal-body'), cn = getCharacterName();
    $('#lumi-modal-title').text(`📖 ${cn}'s Memories`); $('.lumi-modal-opt').show().attr('title','ตั้งค่า');
    const wm = s.diary.worldMode==='auto'?detectWorldMode():s.diary.worldMode;
    const chars = [cn, ...getChatNPCs(5)].filter((v,i,a)=>a.indexOf(v)===i);
    body.html(`<div class="lumi-filter-bar"><select class="lumi-filter-select" id="lumi-filter-char"><option value="">👤 ทุกตัวละคร</option>${chars.map(c=>`<option value="${escapeHtml(c)}" ${c===cn?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select><select class="lumi-filter-select" id="lumi-filter-mode"><option value="">🌍 ทุกโหมด</option><option value="solo" ${wm==='solo'?'selected':''}>👤 Solo</option><option value="rpg" ${wm==='rpg'?'selected':''}>🌐 RPG</option></select><input type="text" class="lumi-filter-search" id="lumi-filter-search" placeholder="🔍 ค้นหา..."></div><div id="lumi-timeline-panel" class="lumi-timeline-container"></div>`);
    loadAndRenderTimeline();
    $('#lumi-filter-char,#lumi-filter-mode,#lumi-filter-search').on('change keyup', debounce(()=>loadAndRenderTimeline(),300));
    $('.lumi-modal-opt').off('click').on('click',()=>renderDiarySettingsInModal());
}

function loadAndRenderTimeline() {
    const f = { character:$('#lumi-filter-char').val()||null, worldMode:$('#lumi-filter-mode').val()||null, showSecret:extension_settings[extensionName].diary.display.showSecret };
    const q = $('#lumi-filter-search').val()?.toLowerCase()||'';
    let mem = loadMemories(f);
    if(q) mem = mem.filter(m=>m.content.diary?.toLowerCase().includes(q)||m.content.mood?.toLowerCase().includes(q)||m.meta.tags?.some(t=>t.toLowerCase().includes(q)));
    const p = $('#lumi-timeline-panel');    if(!mem.length) { p.html(`<div class="lumi-empty"><div class="lumi-empty-icon">📭</div><div>ยังไม่มีบันทึกความทรงจำ</div><div style="font-size:12px;color:#ccc;margin-top:8px;">ระบบจะสร้างอัตโนมัติเมื่อครบเงื่อนไขที่ตั้งไว้ 🌸</div></div>`); return; }
    const g = {}; mem.forEach(m=>{ const k=m.timestamp.split('T')[0]; if(!g[k])g[k]=[]; g[k].push(m); });
    let h = ''; for(const[k,e]of Object.entries(g)){ h+=`<div class="lumi-timeline-date">📅 ${formatThaiDate(k)}</div>`; e.forEach(x=>h+=renderMemoryCard(x)); }
    p.html(h); bindMemoryCardEvents();
}

function renderMemoryCard(entry) {
    const locked = entry.meta.isSecret && !checkUnlockCondition(entry);
    const lvl = getAffectionLevel(entry.content.affection_score), mood = getMoodEmoji(entry.content.mood);
    let ev = ''; if(entry.content.eventType) { const map = {'birthday':'🎂 วันเกิด','anniversary_30d':'💕 30 วัน','anniversary_100d':'💕 100 วัน','anniversary_365d':'💕 1 ปี','season_0':'🌸 ใบไม้ผลิ','season_1':'☀️ ร้อน','season_2':'🍁 ใบไม้ร่วง','season_3':'❄️ หนาว'}; ev=`<span class="lumi-badge-event">${map[entry.content.eventType]||'🎉'}</span>`; }
    return `<div class="lumi-memory-card ${locked?'locked':''}" data-id="${entry.id}">${locked?`<div class="lumi-locked-overlay"><div class="lumi-locked-icon">${svgLock}</div><div class="lumi-locked-text">🔒 ความทรงจำนี้ยังมองไม่เห็น</div><div class="lumi-locked-hint">${entry.meta.unlockCondition?.type==='affection'?'ปลดล็อกเมื่อความสัมพันธ์ ≥ 80':'จะเปิดเผยเมื่อถึงเวลา...'}</div></div>`:''}<div class="lumi-memory-header"><span class="lumi-memory-char">${escapeHtml(entry.character)}</span><span class="lumi-memory-time">${formatTime(entry.timestamp)}</span>${entry.worldMode==='rpg'?'<span class="lumi-badge-rpg">🌍 RPG</span>':''} ${ev}</div><div class="lumi-memory-mood"><span>${mood} ${escapeHtml(entry.content.mood)}</span><span class="lumi-affection-mini" style="color:${lvl.color}">❤️ ${entry.content.affection_score}</span></div><div class="lumi-memory-content ${locked?'locked':''}">${locked?'...':escapeHtml(entry.content.diary)}</div>${!locked?`<div class="lumi-memory-tags">${(entry.meta.tags||[]).map(t=>`<span class="lumi-tag">${t}</span>`).join('')}</div><div class="lumi-memory-actions"><button class="lumi-btn-icon ${entry.meta.isFavorite?'active':''}" data-action="fav">${entry.meta.isFavorite?svgStar:svgStarEmpty}</button><button class="lumi-btn-icon danger" data-action="del">🗑️</button></div>`:''}</div>`;
}

function bindMemoryCardEvents() {
    $('.lumi-btn-icon[data-action="fav"]').off('click').on('click',function(e){ e.stopPropagation(); const id=$(this).closest('.lumi-memory-card').data('id'), m=extension_settings[extensionName].memories.find(x=>x.id===id); if(m){ m.meta.isFavorite=!m.meta.isFavorite; SillyTavern.getContext().saveSettingsDebounced(); $(this).toggleClass('active').html(m.meta.isFavorite?svgStar:svgStarEmpty); showToast(m.meta.isFavorite?'⭐ เก็บแล้ว':'🗑️ เอาออกแล้ว','info'); }});
    $('.lumi-btn-icon[data-action="del"]').off('click').on('click',function(e){ e.stopPropagation(); if(confirm('ลบความทรงจำนี้?')){ const id=$(this).closest('.lumi-memory-card').data('id'), s=extension_settings[extensionName]; s.memories=s.memories.filter(x=>x.id!==id); SillyTavern.getContext().saveSettingsDebounced(); $(this).closest('.lumi-memory-card').fadeOut(200,()=>{ $(this).remove(); if(!$('.lumi-memory-card').length) loadAndRenderTimeline(); }); showToast('🗑️ ลบแล้ว','success'); }});
}

function debounce(func, wait) { let t; return function(...a){ clearTimeout(t); t=setTimeout(()=>func(...a),wait); }; }

function renderDiarySettingsInModal() {
    const s = extension_settings[extensionName].diary;
    $('#lumi-modal-title').text('⚙️ Diary Settings');
    $('#lumi-modal-body').html(`<div style="padding:16px;"><div class="lumi-settings-section"><h4>🌍 โหมดโลก</h4><select id="lumi-wm"><option value="auto" ${s.worldMode==='auto'?'selected':''}>🤖 อัตโนมัติ</option><option value="solo" ${s.worldMode==='solo'?'selected':''}>👤 เดี่ยว</option><option value="rpg" ${s.worldMode==='rpg'?'selected':''}>🌐 RPG</option></select></div><div class="lumi-settings-section"><h4>⚙️ เจนอัตโนมัติ</h4><label class="checkbox_label"><input type="checkbox" id="lumi-age" ${s.autoGen.enabled?'checked':''}><span>เปิดใช้งาน</span></label><div class="lumi-sub-settings"><label>ทริกเกอร์:</label><select id="lumi-tt"><option value="turn_count" ${s.autoGen.triggerType==='turn_count'?'selected':''}>🔢 ทุก X ข้อความ</option><option value="emotion" ${s.autoGen.triggerType==='emotion'?'selected':''}>💬 คำอารมณ์</option><option value="random" ${s.autoGen.triggerType==='random'?'selected':''}>🎲 สุ่ม</option></select><div id="lumi-tw" style="display:${s.autoGen.triggerType==='turn_count'?'block':'none'}"><label>เจนทุก <input type="number" id="lumi-ti" value="${s.autoGen.turnInterval}" min="5" max="100"> ข้อความ</label></div><div id="lumi-ew" style="display:${s.autoGen.triggerType==='emotion'?'block':'none'}"><label>คำ: <input type="text" id="lumi-ek" value="${s.autoGen.emotionKeywords.join(',')}" placeholder="รัก,โกรธ"></label></div></div></div><div class="lumi-settings-section"><h4>🔒 ความลับ</h4><label class="checkbox_label"><input type="checkbox" id="lumi-ss" ${s.display.showSecret?'checked':''}><span>แสดงภาพซ้อน</span></label><label style="margin-top:8px;display:block;">ปลดล็อก:</label><select id="lumi-sm"><option value="affection" ${s.display.secretUnlockMode==='affection'?'selected':''}>❤️ ความสัมพันธ์ ≥80</option><option value="event" ${s.display.secretUnlockMode==='event'?'selected':''}>🎉 3 วันหลังเกิด</option><option value="manual" ${s.display.secretUnlockMode==='manual'?'selected':''}>✋ แมนนวล</option></select></div><div class="lumi-settings-section"><h4>🗂️ จัดการ</h4><label>เก็บสูงสุด <input type="number" id="lumi-me" value="${s.storage.maxEntries}" min="10" max="200"> รายการ</label><div style="margin-top:12px;"><button id="lumi-exp" class="lumi-btn-small">📤 Export</button><button id="lumi-clr" class="lumi-btn-small danger">🗑️ ล้าง</button></div></div><div style="text-align:center;margin-top:20px;"><button id="lumi-sav" class="lumi-btn-gen" style="padding:10px 40px;">💾 บันทึก</button></div></div>`);
    $('#lumi-tt').on('change',function(){ $('#lumi-tw').toggle($(this).val()==='turn_count'); $('#lumi-ew').toggle($(this).val()==='emotion'); });
    $('#lumi-sav').on('click',()=>{ const s=extension_settings[extensionName].diary; s.worldMode=$('#lumi-wm').val(); s.autoGen.enabled=$('#lumi-age').prop('checked'); s.autoGen.triggerType=$('#lumi-tt').val(); s.autoGen.turnInterval=parseInt($('#lumi-ti').val())||20; s.autoGen.emotionKeywords=$('#lumi-ek').val().split(',').map(k=>k.trim()).filter(k=>k); s.display.showSecret=$('#lumi-ss').prop('checked'); s.display.secretUnlockMode=$('#lumi-sm').val(); s.storage.maxEntries=parseInt($('#lumi-me').val())||50; SillyTavern.getContext().saveSettingsDebounced(); extension_settings[extensionName]._internal.messageCounter=0; showToast('✅ บันทึกแล้ว','success'); setTimeout(()=>renderDiaryUI(),500); });
    $('#lumi-exp').on('click',()=>{ const b=new Blob([JSON.stringify(extension_settings[extensionName].memories,null,2)],{type:'application/json'}), u=URL.createObjectURL(b), a=document.createElement('a'); a.href=u; a.download=`lumi-mem-${new Date().toISOString().split('T')[0]}.json`; a.click(); showToast('📤 Export เสร็จ','success'); });
    $('#lumi-clr').on('click',()=>{ if(confirm('ล้างทั้งหมด?')){ extension_settings[extensionName].memories=[]; SillyTavern.getContext().saveSettingsDebounced(); showToast('🗑️ ล้างแล้ว','success'); setTimeout(()=>renderDiaryUI(),500); }});
}

function startDiaryGeneration() {
    const ctx=SillyTavern.getContext(), ev=checkForSpecialEvent(getCharacterName(), ctx.characters?.[ctx.characterId]);
    let wm=extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm=detectWorldMode();
    $('#lumi-modal-body').html(`<div class="lumi-loader-wrap"><div class="lumi-loader"></div><div style="color:#ff85a2;">กำลังอ่านความในใจ...</div></div>`);
    requestDiaryGeneration({triggerType:'manual',eventInfo:ev,linkedChars:wm==='rpg'?getChatNPCs(3):[]}).then(d=>{ if(!d){renderDiaryUI();return;} const e={id:"mem_"+Date.now(),timestamp:new Date().toISOString(),trigger:'manual',character:getCharacterName(),characterId:ctx.characterId,worldMode:wm,linkedCharacters:wm==='rpg'?getChatNPCs(3):[],content:{...d,eventType:ev?.type},meta:{isFavorite:false,isHidden:false,isSecret:ev?.isSecret,unlockCondition:ev?{type:extension_settings[extensionName].diary.display.secretUnlockMode,value:80}:null,tags:extractTags(d.diary),relatedMessages:[],linkedMemoryIds:[]}}; saveMemory(e); renderDiaryUI(); showToast('✨ สร้างบันทึกใหม่แล้ว','success'); });
}

// ═══════════════════════════════════════════════
// 🛡️ FAB BUTTON (โครงสร้างเดิม + แก้จุดที่ซ่อน)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    console.log("[LumiPulse] 🔄 สร้างปุ่มลอย...");
    
    if (!document.body) { console.warn("[LumiPulse] ⚠️ body ไม่พร้อม รอ 1 วิแล้วสร้างใหม่"); setTimeout(spawnLumiButton, 1000); return; }

    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    fab.style.top   = '45%';    fab.style.right = '20px';
    document.body.appendChild(fab);
    
    // 🛡️ บังคับแสดงทันทีหลังแปะ
    fab.style.display = 'block';
    fab.style.visibility = 'visible';
    fab.style.opacity = '1';

    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML = `<div class="lumi-menu-grid">
        <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon" alt="diary"><span class="lumi-menu-text">Diary</span></div>
        <div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}" class="lumi-menu-icon" alt="phone"><span class="lumi-menu-text">Phone</span></div>
        <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon" alt="forum"><span class="lumi-menu-text">Forum</span></div>
    </div><div class="lumi-branding">Lumipulse</div>`;
    document.body.appendChild(menu);

    function updateMenuPos() {
        const r = fab.getBoundingClientRect(), m = $(menu);
        let l = r.left - (m.outerWidth()/2) + (r.width/2);
        let t = r.top - m.outerHeight() - 15;
        if(l<10)l=10; if(l+m.outerWidth()>window.innerWidth-10)l=window.innerWidth-m.outerWidth()-10; if(t<10)t=r.bottom+15;
        m.css({left:l+'px', top:t+'px'});
    }

    // Drag/Tap Logic (คงโครงสร้างเดิม + เพิ่ม Threshold ป้องกันแตะผิด)
    let isDragging = false, mouseOffset = {x:0,y:0};
    let isTouchDrag = false, touchOffset = {x:0,y:0};
    const THRESHOLD = 8;
    let dragStart = {x:0,y:0}, tapTimer = null;

    fab.addEventListener('mousedown', e => {
        if(e.button===2)return; e.preventDefault(); isDragging=false; fab.classList.remove('lumi-floating');
        const r=fab.getBoundingClientRect(); mouseOffset.x=e.clientX-r.left; mouseOffset.y=e.clientY-r.top; dragStart.x=e.clientX; dragStart.y=e.clientY;
        const onMove = ev => { const dx=ev.clientX-dragStart.x, dy=ev.clientY-dragStart.y; if(Math.sqrt(dx*dx+dy*dy)>THRESHOLD){isDragging=true; $(menu).fadeOut(100);} if(!isDragging)return; let x=Math.max(0,Math.min(ev.clientX-mouseOffset.x,window.innerWidth-50)), y=Math.max(0,Math.min(ev.clientY-mouseOffset.y,window.innerHeight-50)); fab.style.left=x+'px'; fab.style.top=y+'px'; fab.style.right='auto'; updateMenuPos(); };
        const onUp = ev => { document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); fab.classList.add('lumi-floating'); if(!isDragging){clearTimeout(tapTimer); tapTimer=setTimeout(()=>{updateMenuPos(); $(menu).fadeToggle(300); spawnHeartEffect({...ev, _fromDrag:false});},50);} isDragging=false; };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });

    fab.addEventListener('touchstart', e => {
        isTouchDrag=false; fab.classList.remove('lumi-floating');
        const t=e.touches[0], r=fab.getBoundingClientRect(); touchOffset.x=t.clientX-r.left; touchOffset.y=t.clientY-r.top; dragStart.x=t.clientX; dragStart.y=t.clientY;
    }, {passive:false});
    fab.addEventListener('touchmove', e => {
        e.preventDefault(); const t=e.touches[0]; const dx=t.clientX-dragStart.x, dy=t.clientY-dragStart.y;
        if(Math.sqrt(dx*dx+dy*dy)>THRESHOLD){isTouchDrag=true; $(menu).fadeOut(100);}
        if(!isTouchDrag)return; let x=Math.max(0,Math.min(t.clientX-touchOffset.x,window.innerWidth-50)), y=Math.max(0,Math.min(t.clientY-touchOffset.y,window.innerHeight-50)); fab.style.left=x+'px'; fab.style.top=y+'px'; fab.style.right='auto'; updateMenuPos();
    }, {passive:false});
    fab.addEventListener('touchend', e => {
        fab.classList.add('lumi-floating');        if(!isTouchDrag){clearTimeout(tapTimer); tapTimer=setTimeout(()=>{updateMenuPos(); $(menu).fadeToggle(300); const t=e.changedTouches?.[0]; if(t)spawnHeartEffect({_fromDrag:false, clientX:t.clientX, clientY:t.clientY});},50);}
        isTouchDrag=false;
    });

    // Long press reset
    let longTimer=null;
    fab.addEventListener('touchstart',()=>{longTimer=setTimeout(()=>{if(!isTouchDrag){fab.style.top='45%';fab.style.right='20px';fab.style.left='auto';fab.style.bottom='auto';showToast('📍 รีเซ็ตตำแหน่ง','info');}},800);},{passive:true});
    fab.addEventListener('touchend touchcancel',()=>clearTimeout(longTimer));

    $(document).off('click','#lumi-diary').on('click','#lumi-diary',()=>openLumiModal('diary'))
               .off('click','#lumi-phone').on('click','#lumi-phone',()=>openLumiModal('phone'))
               .off('click','#lumi-forum').on('click','#lumi-forum',()=>openLumiModal('forum'));
}

// ═══════════════════════════════════════════════
// MODAL SHELL & SETTINGS (คงเดิม)
// ═══════════════════════════════════════════════
function createContentModal() {
    if($('#lumi-modal-overlay').length)return;
    $('body').append(`<div id="lumi-modal-overlay" class="lumi-modal-overlay"><div class="lumi-modal-box"><div class="lumi-modal-header"><div class="lumi-modal-opt">${svgSettings}</div><span id="lumi-modal-title"></span><div class="lumi-modal-close">×</div></div><div id="lumi-modal-body" class="lumi-modal-body"></div></div></div>`);
    $('#lumi-modal-overlay').on('click',function(e){if(e.target.id==='lumi-modal-overlay')$(this).fadeOut(200);});
    $(document).off('click','.lumi-modal-close').on('click','.lumi-modal-close',()=>$('#lumi-modal-overlay').fadeOut(200));
}

function createSettingsUI() {
    $('#extensions_settings').append(`<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color:#ff85a2;font-family:'Mitr';font-weight:300;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="font-family:'Mitr';font-weight:300;display:flex;flex-direction:column;gap:10px;padding:15px 0;"><label class="checkbox_label"><input id="lumi_enable_toggle" type="checkbox"><span>เปิดใช้งาน LumiPulse</span></label><button id="lumi-reset" class="menu_button">🗑️ Reset All Data</button><div style="font-size:11px;color:#ffb6c1;margin-top:5px;line-height:1.5;">v2.0.2 · 🌸 Forum · 📖 Memories (Auto) · 📱 Phone (soon)</div></div></div>`);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled);
    $(document).on('change','#lumi_enable_toggle',function(){
        const en=$(this).prop('checked'); extension_settings[extensionName].isEnabled=en; SillyTavern.getContext().saveSettingsDebounced();
        if(en){setTimeout(()=>{spawnLumiButton();createContentModal();setupAutoTriggerListener();},500);}
        else{$('#lumi-main-fab,.lumi-menu-container,#lumi-modal-overlay').remove(); $(document).off('messageReceived',onNewChatMessage);}
    });
    $(document).on('click','#lumi-reset',()=>{const s=extension_settings[extensionName]; s.isForumInitialized=false;s.forumTopic="";s.forumData=[];s.diaryData=null;s.memories=[];s._internal={...defaultSettings._internal}; SillyTavern.getContext().saveSettingsDebounced(); showToast("ล้างข้อมูลแล้ว 🌸","success");});
}

function showToast(msg, type='info') { if(typeof toastr!=='undefined') toastr[type](msg,'🌸 LumiPulse'); else console.log(`[Lumi] ${msg}`); }
