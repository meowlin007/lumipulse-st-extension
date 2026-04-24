"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: true,
    forumTopic: "", isForumInitialized: false, includeRandomNPCs: true, forumData: [], diaryData: null,
    memories: [],
    _internal: { messageCounter: 0, firstChatDate: null, fabPosition: { bottom: "100px", right: "20px" } },
    diary: {
        worldMode: 'auto',
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'], randomChance: 0.08 },
        display: { viewMode: 'timeline', showSecret: true, secretUnlockMode: 'ai', showFavoritesOnly: false },
        storage: { maxEntries: 40, autoSave: true },
        manualGen: { messageRange: 'last', messageCount: 50 }
    }
};
let extension_settings = {};

// Icon URLs
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// SVG Icons
const svgHeart = `<svg viewBox="0 0 32 32" fill="none" width="28" height="28"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1"/></svg>`;
const svgSettings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgRef = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const svgStar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgStarFilled = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="#FFB6C1" stroke-width="1" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2" width="24" height="24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgTrash = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const svgPlus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const svgRefresh = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
const svgDownload = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const svgChart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
const svgReset = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
const svgClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgMapPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgCloud = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;
const svgGear = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgChat = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT & INIT
// ═══════════════════════════════════════════════
jQuery(async () => {
    const boot = setInterval(() => {        if (window.SillyTavern && SillyTavern.getContext && document.body) {
            clearInterval(boot);
            console.log("[LumiPulse] Ready. Initializing...");
            initLumiPulse();
        }
    }, 500);
});

function initLumiPulse() {
    const ctx = SillyTavern.getContext();
    if (!ctx.extensionSettings[extensionName]) { 
        ctx.extensionSettings[extensionName] = { ...defaultSettings }; 
        ctx.saveSettingsDebounced(); 
    }
    extension_settings = ctx.extensionSettings;
    const s = extension_settings[extensionName];
    if (!s.diary) s.diary = defaultSettings.diary;
    if (!s.memories) s.memories = [];
    if (!s._internal) s._internal = defaultSettings._internal;
    if (!s._internal.fabPosition) s._internal.fabPosition = { bottom: "100px", right: "20px" };

    injectStyles();
    createSettingsUI();
    
    if (s.isEnabled) {
        setTimeout(() => {
            spawnLumiButton();
            createContentModal();
            setupAutoTriggerListener();
            console.log("[LumiPulse] FAB & Modules Loaded");
        }, 800);
    }
    document.addEventListener('click', (e) => { if (!e._fromDrag) spawnHeartEffect(e); });
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [], names = new Set();
    chat.slice(-50).forEach(m => { if (m.name && !m.is_user && !m.is_system) names.add(m.name); });
    return names.size > 2 ? 'rpg' : 'solo';
}

function getChatNPCs(limit=10) {
    const chat = SillyTavern.getContext().chat || [], names = new Map(), cn = getCharacterName();
    // สแกนหา character names จาก chat
    chat.slice(-100).forEach(m => { 
        if (m.name && !m.is_user && !m.is_system && m.name!==cn && m.name.toLowerCase() !== cn.toLowerCase()) {
            const count = names.get(m.name) || 0;            names.set(m.name, count + 1);
        } 
    });
    // เรียงตามความถี่และ return
    return Array.from(names.entries()).sort((a,b) => b[1] - a[1]).slice(0, limit).map(([name]) => name);
}

function getAllCharactersFromChat() {
    const chat = SillyTavern.getContext().chat || [];
    const characters = new Set();
    const cn = getCharacterName();
    
    chat.forEach(m => {
        if (m.name && !m.is_user && !m.is_system) {
            // แยกชื่อตัวละครจากข้อความ (สมมติว่าขึ้นต้นด้วย "ชื่อ: ")
            const match = m.mes.match(/^([^:：]+)[:：]/);
            if (match) {
                const charName = match[1].trim();
                if (charName && charName !== cn) {
                    characters.add(charName);
                }
            }
            // หรือใช้ name จาก message
            if (m.name !== cn) {
                characters.add(m.name);
            }
        }
    });
    
    return Array.from(characters);
}

function getCharacterName() { return SillyTavern.getContext().name2 || "ตัวละคร"; }
function getUserName() { return SillyTavern.getContext().name1 || "ผู้เล่น"; }

function escapeHtml(t) { 
    return typeof t==='string' ? t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;') : ''; 
}

function formatTime(iso) { 
    const d=new Date(iso); 
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; 
}

function extractTags(t) { 
    const tags=[], kw={'โรแมนติก':['รัก','หัวใจ','ชอบ','แอบชอบ'],'ดราม่า':['เสียใจ','ร้องไห้','เจ็บปวด'],'ตลก':['ขำ','ตลก','555'],'จุดเปลี่ยน':['ตัดสินใจ','เปลี่ยน','เริ่ม']}, l=t.toLowerCase(); 
    for(const[k,v]of Object.entries(kw)) if(v.some(w=>l.includes(w))) tags.push(`#${k}`); 
    return tags.slice(0,3); 
}
function checkUnlock(m) { 
    if(!m.meta.isSecret) return true; 
    const c=extension_settings[extensionName].diary.display; 
    if(c.secretUnlockMode==='manual') return false; 
    if(c.secretUnlockMode==='affection') return (m.content.affection_score||0)>=80; 
    return (new Date()-new Date(m.timestamp))/864e5>=3; 
}

function saveMemory(entry) {
    const s=extension_settings[extensionName];
    s.memories.unshift(entry);
    if(s.memories.length>s.diary.storage.maxEntries) s.memories=s.memories.slice(0,s.diary.storage.maxEntries);
    SillyTavern.getContext().saveSettingsDebounced();
}

function loadMemories(f={}) {
    let mem=[...(extension_settings[extensionName].memories||[])];
    if(f.character) mem=mem.filter(m=>m.character===f.character);
    if(f.worldMode) mem=mem.filter(m=>m.worldMode===f.worldMode);
    if(f.showSecret===false) mem=mem.filter(m=>!m.meta.isSecret||checkUnlock(m));
    if(f.favoritesOnly) mem=mem.filter(m=>m.meta.isFavorite);
    return mem.sort((a,b)=>(b.meta.isPinned===true)-(a.meta.isPinned===true) || new Date(b.timestamp)-new Date(a.timestamp));
}

function saveFabPosition(pos) {
    extension_settings[extensionName]._internal.fabPosition = pos;
    SillyTavern.getContext().saveSettingsDebounced();
}

function loadFabPosition() {
    return extension_settings[extensionName]._internal.fabPosition || { bottom: "100px", right: "20px" };
}

// ═══════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════
function parseJSON(text) {
    if(!text||typeof text!=='string') return null;
    let m=text.match(/\{[\s\S]*\}/); 
    if(m){try{return JSON.parse(m[0]);}catch(e){}}
    toastr.warning('AI ตอบกลับผิดรูปแบบ'); 
    return null;
}

async function callST(p) {
    try {
        const ctx=SillyTavern.getContext(); 
        let res;
        if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(p,false,false);
        else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(p,true);        else if(typeof window.generateQuietPrompt==='function') res=await window.generateQuietPrompt(p,false,false);
        else if(typeof window.generateRaw==='function') res=await window.generateRaw(p,true);
        else {toastr.error('หา generate function ไม่เจอ');return null;}
        return parseJSON(res);
    }catch(e){console.error(e);toastr.error('AI Error');return null;}
}

async function requestDiaryGen(opt={}) {
    const {charName=getCharacterName(), trigger='manual', ev=null, linked=[], chatMessages=[]} = opt;
    const ctx=SillyTavern.getContext(), cc=ctx.characters?.[ctx.characterId]||{};
    let wm=extension_settings[extensionName].diary.worldMode; 
    if(wm==='auto') wm=detectWorldMode();
    
    const chatLog = chatMessages.length > 0 
        ? chatMessages.map((m, i) => `[#${i+1}] ${m.is_user?'User':m.name||'NPC'}: ${(m.mes||'').slice(0,200)}`).join('\n')
        : (ctx.chat||[]).slice(-25).map(m=>`${m.is_user?'User':m.name||'NPC'}: ${(m.mes||'').slice(0,150)}`).join('\n');
    
    const evNote=ev?`\nEvent: ${ev.label}\n${ev.promptBoost}`:'';
    const allChars = getAllCharactersFromChat();
    const charNote = allChars.length > 0 ? `\nCharacters in chat: ${allChars.join(', ')}` : '';
    
    const prompt=`[System: You are ${charName}'s inner voice. Respond ONLY with valid JSON.]
Profile: ${cc.data?.personality||'Normal'} | World: ${wm==='rpg'?'Group':'Solo'} | Others: ${linked.join(',')||'None'}${charNote}
Chat Log:\n${chatLog}\n${evNote}

Generate a diary entry based on the RP context. Infer the fictional date, location, and weather from the chat.
Decide if this memory should be secret (isSecret: true) if it contains very private thoughts or vulnerable moments.

Format: {
  "rp_date": "วันที่ในเกม เช่น วันขึ้น 15 ค่ำ เดือน 3",
  "rp_location": "สถานที่ RP เช่น ตำหนักตะวันออก",
  "rp_weather": "สภาพอากาศ เช่น ฝนตกปรอยๆ อากาศเย็น",
  "affection_score": 0-100,
  "mood": "อารมณ์เช่น ตื่นเต้น ดีใจ อบอุ่น",
  "diary": "เนื้อหาไดอารี่ 3-5 ประโยค มุมมองบุคคลที่ 1 ภาษาไทย",
  "isSecret": true/false,
  "character": "ชื่อตัวละครที่พูดถึง (ถ้าเป็น RPG ให้ใช้ชื่อที่ปรากฏในแชท)"
}
NO markdown, ONLY JSON.`;
    return await callST(prompt);
}

// ═══════════════════════════════════════════════
// AUTO-TRIGGER + MANUAL
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).on('messageReceived', onNewChat);
    $(document).on('activeCharacterChanged', () => {
        extension_settings[extensionName]._internal.messageCounter=0;
        if(!extension_settings[extensionName]._internal.firstChatDate) {            extension_settings[extensionName]._internal.firstChatDate=new Date().toISOString();
            SillyTavern.getContext().saveSettingsDebounced();
        }
    });
}

async function onNewChat() {
    const s=extension_settings[extensionName], cfg=s.diary.autoGen;
    if(!cfg.enabled) return;
    s._internal.messageCounter++;
    const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'').toLowerCase();
    
    let gen=false, type='manual', triggerChatText=lastMsg;
    if(cfg.triggerType==='turn_count' && s._internal.messageCounter>=cfg.turnInterval) { 
        gen=true; type='turn'; s._internal.messageCounter=0; 
    } else if(cfg.triggerType==='emotion' && cfg.emotionKeywords.some(k=>lastMsg.includes(k))) { 
        gen=true; type='emotion'; 
    } else if(cfg.triggerType==='random' && Math.random()<cfg.randomChance) { 
        gen=true; type='random'; 
    } else if(lastMsg.includes('#จำ') || lastMsg.includes('#memory') || lastMsg.includes('#diary')) { 
        gen=true; type='user_tag'; 
    }

    if(gen) {
        SillyTavern.getContext().saveSettingsDebounced();
        const ctx=SillyTavern.getContext(), ev=null; 
        let wm=s.diary.worldMode; 
        if(wm==='auto') wm=detectWorldMode();
        const res=await requestDiaryGen({trigger:type, ev, linkedChars:wm==='rpg'?getChatNPCs(3):[]});
        if(res) createMemoryEntry(res, type, ctx, wm, triggerChatText);
    }
}

async function manualGenerateWithOptions() {
    const s = extension_settings[extensionName].diary.manualGen;
    const ctx = SillyTavern.getContext();
    const totalMessages = ctx.chat?.length || 0;
    
    // สร้าง UI สำหรับเลือก options
    $('#lumi-modal-title').text('บันทึกความทรงจำ');
    $('#lumi-modal-body').html(`
        <div class="lumi-settings-card">
            <h4>เลือกช่วงข้อความที่จะใช้อ่าน</h4>
            <div style="margin-bottom:12px;">
                <label class="checkbox_label" style="font-size:12px;">
                    <input type="radio" name="msgRange" value="all" ${s.messageRange==='all'?'checked':''}>
                    <span>อ่านทั้งหมด (${totalMessages} ข้อความ)</span>
                </label>
            </div>
            <div style="margin-bottom:12px;">                <label class="checkbox_label" style="font-size:12px;">
                    <input type="radio" name="msgRange" value="last" ${s.messageRange==='last'?'checked':''}>
                    <span>ข้อความล่าสุด</span>
                    <input type="number" id="manualMsgCount" value="${s.messageCount}" min="10" max="${totalMessages}" 
                           class="lumi-input" style="width:80px;margin-left:8px;display:inline-block;"> ข้อความ
                </label>
            </div>
            <div style="margin-bottom:12px;">
                <label class="checkbox_label" style="font-size:12px;">
                    <input type="radio" name="msgRange" value="custom" ${s.messageRange==='custom'?'checked':''}>
                    <span>กำหนดเอง: ข้อความที่</span>
                    <input type="number" id="manualMsgFrom" value="0" min="0" max="${totalMessages-1}" 
                           class="lumi-input" style="width:70px;margin:0 4px;display:inline-block;">
                    <span>ถึง</span>
                    <input type="number" id="manualMsgTo" value="${totalMessages-1}" min="0" max="${totalMessages-1}" 
                           class="lumi-input" style="width:70px;margin:0 4px;display:inline-block;">
                </label>
            </div>
        </div>
        <div style="text-align:center;margin-top:16px;">
            <button id="btnStartGen" class="lumi-btn-gen">เริ่มบันทึกความทรงจำ</button>
        </div>
    `);
    
    $('#btnStartGen').on('click', async function() {
        const range = $('input[name="msgRange"]:checked').val();
        let startIdx = 0, endIdx = totalMessages;
        
        if(range === 'last') {
            const count = parseInt($('#manualMsgCount').val()) || 50;
            startIdx = Math.max(0, totalMessages - count);
            s.messageCount = count;
        } else if(range === 'custom') {
            startIdx = parseInt($('#manualMsgFrom').val()) || 0;
            endIdx = parseInt($('#manualMsgTo').val()) || totalMessages;
        }
        
        s.messageRange = range;
        SillyTavern.getContext().saveSettingsDebounced();
        
        // ดึงข้อความในช่วงที่กำหนด
        const chatMessages = ctx.chat?.slice(startIdx, endIdx) || [];
        
        $('#lumi-modal-body').html(`
            <div style="text-align:center;padding:40px;">
                <div class="lumi-loader"></div>
                <div style="color:#ff85a2;margin-top:10px;">กำลังอ่าน ${chatMessages.length} ข้อความและบันทึกความทรงจำ...</div>
            </div>
        `);
                let wm=extension_settings[extensionName].diary.worldMode; 
        if(wm==='auto') wm=detectWorldMode();
        
        const res=await requestDiaryGen({
            trigger:'manual', 
            linkedChars:wm==='rpg'?getChatNPCs(3):[],
            chatMessages: chatMessages
        });
        
        if(res) {
            const lastMsg = chatMessages[chatMessages.length-1]?.mes || '';
            createMemoryEntry(res, 'manual', ctx, wm, lastMsg);
            showToast(`บันทึกความทรงจำเสร็จสิ้น: ${res.rp_date}`);
            renderDiaryUI(); // กลับไปหน้าไดอารี่ทันที
        } else { 
            renderDiaryUI(); 
            showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
    });
}

function createMemoryEntry(res, type, ctx, wm, refText) {
    const entry = {
        id:"mem_"+Date.now(), 
        timestamp:new Date().toISOString(), 
        trigger:type,
        character: res.character || getCharacterName(), // ใช้ชื่อจาก AI หรือ default
        characterId:ctx.characterId, 
        worldMode:wm,
        content: {
            rp_date: res.rp_date || "วันไม่ทราบแน่ชัด",
            rp_location: res.rp_location || "สถานที่ปัจจุบัน",
            rp_weather: res.rp_weather || "บรรยากาศเงียบสงบ",
            affection_score: res.affection_score || 50,
            mood: res.mood || "สงบ",
            diary: res.diary || ""
        },
        meta: { 
            isPinned:false, 
            isFavorite:false, 
            isHidden:false, 
            isSecret: res.isSecret || false, 
            unlockCondition: res.isSecret ? {type: 'affection', value: 80} : null, 
            tags:extractTags(res.diary||''), 
            referenceText: refText?.slice(0,100)||"",
            messageIndex: ctx.chat?.length ? ctx.chat.length - 1 : 0
        }
    };
    saveMemory(entry);
}
// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
function injectStyles() {
    if($('#lumi-styles').length) return;
    const s=document.createElement('style'); 
    s.id='lumi-styles';
    s.innerHTML=`
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
        
        :root {
            --lumi-pink-soft: #FFF0F5;
            --lumi-pink-mid: #FFB6C1;
            --lumi-pink-bold: #FF69B4;
            --lumi-purple: #E6D5F0;
            --lumi-gold: #FFD700;
            --lumi-glass: rgba(255, 240, 245, 0.88);
            --lumi-shadow: 0 8px 32px rgba(255, 105, 180, 0.15);
        }
        
        @keyframes lumiPop{0%{opacity:0;transform:scale(.85) translateY(15px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes heartRise{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-80px) scale(1.8)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        
        .lumi-vector-heart{position:fixed;z-index:2147483647;pointer-events:none;width:28px;height:28px;animation:heartRise .8s ease-out forwards;filter:drop-shadow(0 0 4px #FFB6C1)}
        
        /* ปุ่มลอย - แก้ไขให้ลากได้จริง */
        #lumi-main-fab{
            position:fixed !important;
            bottom:100px !important;
            right:20px !important;
            top:auto !important;
            left:auto !important;
            transform:none !important;
            z-index:2147483647 !important;
            width:50px !important;
            height:50px !important;
            border-radius:50% !important;
            background:var(--lumi-glass) url('${btnUrl}') no-repeat center center !important;
            backdrop-filter:blur(10px) !important;
            -webkit-backdrop-filter:blur(10px) !important;
            border:2px solid #FFB6C1 !important;
            box-shadow:var(--lumi-shadow) !important;
            cursor:grab !important;
            touch-action:none !important;
            user-select:none !important;
            display:flex !important;
            align-items:center !important;            justify-content:center !important;
            transition:box-shadow .2s !important;
            pointer-events:auto !important;
            background-size:28px, 100% !important;
        }
        #lumi-main-fab:active{box-shadow:0 3px 10px rgba(255,182,193,0.3) !important; cursor:grabbing !important;}
        #lumi-main-fab.dragging{transition:none !important;}
        
        .lumi-menu-container{
            position:fixed;
            z-index:2147483646;
            display:none;
            background:rgba(255,255,255,0.96);
            backdrop-filter:blur(20px);
            -webkit-backdrop-filter:blur(20px);
            border-radius:24px;
            padding:20px;
            border:1.5px solid rgba(255,182,193,0.3);
            box-shadow:0 15px 40px rgba(255,182,193,0.2);
            font-family:'Mitr',sans-serif;
            font-weight:300;
            min-width:220px;
        }
        .lumi-menu-header{
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:12px;
            padding-bottom:8px;
            border-bottom:1px solid #FFF0F3;
        }
        .lumi-menu-title{
            font-size:12px;
            color:#ff85a2;
            font-weight:400;
        }
        .lumi-menu-settings-btn{
            width:24px;
            height:24px;
            border-radius:50%;
            background:#FFF0F3;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            transition:.2s;
            color:#ff85a2;
        }
        .lumi-menu-settings-btn:hover{background:#FFE0E6; transform:rotate(30deg);}
        .lumi-menu-grid{display:flex;gap:16px;justify-content:center}        .lumi-menu-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:transform .2s;padding:8px}
        .lumi-menu-item:hover{transform:translateY(-3px)}
        .lumi-menu-icon{width:36px;height:36px;object-fit:contain}
        .lumi-menu-text{font-size:11px;color:#ff85a2}
        .lumi-branding{margin-top:16px;font-size:9px;color:#ffb6c1;text-transform:uppercase;letter-spacing:3px;text-align:center}
        
        .lumi-modal-overlay{
            position:fixed;top:0;left:0;width:100vw;height:100dvh;
            background:rgba(0,0,0,0.3);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            z-index:2147483648;
            display:none;
            align-items:center;
            justify-content:center;
            animation:fadeIn .3s ease;
        }
        .lumi-modal-box{
            width:94%;max-width:480px;height:82vh;
            background:#fff;
            border-radius:28px;
            border:2px solid #FFD1DC;
            box-shadow:0 20px 50px rgba(255,182,193,0.15);
            display:flex;flex-direction:column;
            overflow:hidden;
            font-family:'Mitr',sans-serif;
            font-weight:300;
            animation:lumiPop .35s forwards;
        }
        .lumi-modal-header{
            padding:18px 20px;
            text-align:center;
            color:#ff85a2;
            border-bottom:1.5px solid #FFF0F3;
            position:relative;
            font-size:15px;
            font-weight:400;
        }
        .lumi-modal-close{
            position:absolute;right:14px;top:16px;
            width:26px;height:26px;
            background:#FFF0F3;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;
            color:#ff85a2;
            transition:background .2s;
        }
        .lumi-modal-close:hover{background:#FFE0E6}
        .lumi-modal-body{flex:1;padding:16px;overflow-y:auto;scroll-behavior:smooth}        
        .lumi-btn-gen{
            background:linear-gradient(135deg,#FFB6C1,#FF85A2);
            color:#fff;
            border:none;
            padding:10px 28px;
            border-radius:18px;
            font-family:'Mitr';
            cursor:pointer;
            transition:opacity .2s, transform .2s;
            box-shadow:0 4px 12px rgba(255,133,162,0.2);
            font-size:13px;
            font-weight:400;
        }
        .lumi-btn-gen:hover{opacity:.9;transform:translateY(-1px)}
        .lumi-btn-gen:active{transform:translateY(0)}
        
        .lumi-loader{
            width:32px;height:32px;
            border:3px solid #FFF0F3;
            border-top-color:#ff85a2;
            border-radius:50%;
            animation:spin 1s infinite linear;
            margin:0 auto;
        }
        
        .lumi-timeline-container{padding-bottom:8px}
        .lumi-timeline-date{
            font-size:11px;
            color:#ffb6c1;
            font-weight:400;
            padding:8px 0 6px;
            border-bottom:1px dashed #FFE8EE;
            margin:12px 0 8px;
            display:flex;
            align-items:center;
            gap:6px;
        }
        .lumi-memory-card{
            background:#FFFBFC;
            border:1px solid #FFE8EE;
            border-radius:16px;
            padding:14px;
            margin-bottom:10px;
            position:relative;
            transition:box-shadow .2s,transform .2s;
        }
        .lumi-memory-card:hover{
            box-shadow:0 3px 10px rgba(255,182,193,0.1);
            transform:translateY(-1px);        }
        .lumi-memory-card.pinned{
            border:1.5px solid #FFD1DC;
            background:#FFF8FA;
        }
        .lumi-memory-card.secret-locked{
            opacity:0.7;
            background:#F8F8F8;
        }
        .lumi-memory-header{
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:6px;
            flex-wrap:wrap;
            gap:5px;
        }
        .lumi-memory-char{
            font-weight:400;
            color:#444;
            font-size:13px;
        }
        .lumi-memory-meta{
            font-size:10px;
            color:#888;
            display:flex;
            gap:6px;
            flex-wrap:wrap;
        }
        .lumi-rp-info{
            background:#FFF0F3;
            padding:2px 8px;
            border-radius:8px;
            color:#ff85a2;
            font-size:9px;
            display:inline-flex;
            align-items:center;
            gap:3px;
        }
        .lumi-memory-content{
            font-size:12px;
            color:#555;
            line-height:1.6;
            margin:8px 0 10px;
            white-space:pre-wrap;
        }
        .lumi-memory-tags{
            display:flex;
            gap:5px;
            flex-wrap:wrap;            margin-bottom:8px;
        }
        .lumi-tag{
            font-size:9px;
            padding:2px 8px;
            border-radius:10px;
            background:#FFF0F3;
            color:#ff85a2;
        }
        .lumi-memory-actions{
            display:flex;
            gap:6px;
            justify-content:flex-end;
            border-top:1px solid #FFE8EE;
            padding-top:8px;
        }
        .lumi-btn-icon{
            width:24px;
            height:24px;
            border-radius:50%;
            border:none;
            background:#fff;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            color:#ffb6c1;
            transition:.2s;
            padding:0;
        }
        .lumi-btn-icon:hover{background:#FFF0F3;transform:scale(1.1)}
        .lumi-btn-icon.active{background:#FFF0F3;color:#FFD700}
        .lumi-btn-icon.danger:hover{background:#FFE0E0;color:#ff6b6b}
        
        .lumi-locked-overlay{
            position:absolute;
            inset:0;
            background:rgba(255,255,255,0.92);
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:8px;
            z-index:1;
            border-radius:16px;
        }
        .lumi-locked-text{
            font-size:11px;
            color:#ffb6c1;
            text-align:center;        }
        .lumi-locked-hint{
            font-size:9px;
            color:#ccc;
        }
        
        .lumi-settings-card{
            background:#FFF9FA;
            border:1px solid #FFE8EE;
            border-radius:16px;
            padding:14px;
            margin-bottom:12px;
        }
        .lumi-settings-card h4{
            font-size:12px;
            color:#ff85a2;
            margin:0 0 10px;
            font-weight:400;
            display:flex;
            align-items:center;
            gap:6px;
        }
        .lumi-toggle-row{
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:8px;
            font-size:11px;
            color:#666;
        }
        .lumi-toggle{
            position:relative;
            width:34px;
            height:18px;
            background:#FFE8EE;
            border-radius:9px;
            cursor:pointer;
            transition:.3s;
        }
        .lumi-toggle.active{background:#FFB6C1}
        .lumi-toggle::after{
            content:'';
            position:absolute;
            top:2px;
            left:2px;
            width:14px;
            height:14px;
            background:#fff;
            border-radius:50%;
            transition:.3s;            box-shadow:0 1px 3px rgba(0,0,0,0.1);
        }
        .lumi-toggle.active::after{left:18px}
        .lumi-input{
            width:100%;
            background:#fff;
            border:1.5px solid #FFD1DC;
            border-radius:10px;
            padding:7px 10px;
            color:#ff85a2;
            font-family:'Mitr';
            font-size:11px;
            outline:none;
            box-sizing:border-box;
        }
        .lumi-input:focus{border-color:#FFB6C1}
        .lumi-btn-sm{
            padding:6px 12px;
            border-radius:10px;
            border:none;
            background:#FFF0F3;
            color:#ff85a2;
            font-family:'Mitr';
            font-size:10px;
            cursor:pointer;
            margin-right:6px;
            transition:.2s;
            display:inline-flex;
            align-items:center;
            gap:4px;
        }
        .lumi-btn-sm:hover{background:#FFE0E6}
        .lumi-btn-sm.danger{background:#FFE0E0;color:#ff6b6b}
        .lumi-btn-sm.danger:hover{background:#FFCCCC}
        
        .lumi-rpg-columns{
            display:grid;
            grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));
            gap:12px;
        }
        .lumi-character-column{
            background:#FFFBFC;
            border:1px solid #FFE8EE;
            border-radius:16px;
            padding:12px;
        }
        .lumi-character-header{
            display:flex;
            align-items:center;
            gap:8px;            margin-bottom:10px;
            padding-bottom:8px;
            border-bottom:1px dashed #FFE8EE;
        }
        .lumi-character-avatar{
            width:32px;
            height:32px;
            border-radius:50%;
            background:linear-gradient(135deg, #FFD1DC, #FFB6C1);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#fff;
            font-size:14px;
            flex-shrink:0;
        }
        .lumi-character-name{
            font-size:13px;
            color:#444;
            font-weight:400;
        }
        .lumi-character-count{
            font-size:10px;
            color:#ffb6c1;
        }
        
        .lumi-dashboard{padding:16px;}
        .lumi-stats-grid{
            display:grid;
            grid-template-columns:repeat(2, 1fr);
            gap:10px;
            margin-bottom:16px;
        }
        .lumi-stat-card{
            background:#FFF9FA;
            border:1px solid #FFE8EE;
            border-radius:12px;
            padding:12px;
            text-align:center;
        }
        .lumi-stat-value{
            font-size:20px;
            color:#ff85a2;
            font-weight:500;
            margin-bottom:4px;
        }
        .lumi-stat-label{
            font-size:10px;
            color:#888;
        }        .lumi-chart-placeholder{
            background:#FFF9FA;
            border:1px solid #FFE8EE;
            border-radius:12px;
            padding:20px;
            text-align:center;
            color:#ffb6c1;
            font-size:12px;
        }
        
        .lumi-filter-bar{
            display:flex;
            gap:6px;
            margin-bottom:12px;
            flex-wrap:wrap;
        }
        .lumi-filter-select, .lumi-filter-search{
            flex:1;
            min-width:100px;
            padding:7px 10px;
            border:1.5px solid #FFD1DC;
            border-radius:10px;
            background:#fff;
            color:#ff85a2;
            font-family:'Mitr';
            font-size:11px;
            outline:none;
        }
        .lumi-filter-search{color:#666;}
        
        .lumi-empty{
            text-align:center;
            color:#ffb6c1;
            padding:30px 20px;
            font-size:12px;
            line-height:1.6;
        }
        
        .lumi-nav-tabs{
            display:flex;
            gap:8px;
            margin-bottom:16px;
            border-bottom:1px solid #FFF0F3;
            padding-bottom:8px;
            flex-wrap:wrap;
        }
        .lumi-nav-tab{
            padding:6px 14px;
            border-radius:12px;
            background:transparent;            color:#ffb6c1;
            font-family:'Mitr';
            font-size:11px;
            cursor:pointer;
            transition:.2s;
            border:none;
        }
        .lumi-nav-tab:hover{background:#FFF0F3}
        .lumi-nav-tab.active{background:#FFB6C1;color:#fff;}
        
        .lumi-msg-ref{
            background:#FFF0F3;
            padding:4px 8px;
            border-radius:6px;
            font-size:9px;
            color:#ff85a2;
            cursor:pointer;
            display:inline-flex;
            align-items:center;
            gap:3px;
            margin-top:4px;
        }
        .lumi-msg-ref:hover{background:#FFE0E6;}
        
        #lumi-settings-drawer .inline-drawer-content {
            font-family: 'Mitr', sans-serif;
            font-weight: 300;
            padding: 10px 0;
        }
        #lumi-settings-drawer .menu_button {
            background: linear-gradient(135deg, #FFB6C1, #FF85A2);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 8px 12px;
            font-family: 'Mitr', sans-serif;
            font-size: 11px;
            cursor: pointer;
            transition: opacity 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
        }
        #lumi-settings-drawer .menu_button:hover {opacity: 0.9;}
        #lumi-settings-drawer .menu_button.danger {background: linear-gradient(135deg, #ff6b6b, #ff4757);}
        #lumi-settings-drawer .text_pole {
            background: #FFF9FA;
            border: 1.5px solid #FFD1DC;            border-radius: 10px;
            color: #ff85a2;
            font-family: 'Mitr', sans-serif;
            font-size: 11px;
            padding: 6px 10px;
            outline: none;
        }
        #lumi-settings-drawer .text_pole:focus {border-color: #FFB6C1;}
        #lumi-settings-drawer .checkbox_label {font-size: 12px;color: #aaa;}
        #lumi-settings-drawer select.text_pole {width: 100%;margin-top: 4px;}
        
        @media(max-width:768px){
            .lumi-menu-container{width:calc(100vw-30px);right:15px!important}
            .lumi-modal-box{height:85vh}
            .lumi-rpg-columns{grid-template-columns:1fr}
            .lumi-stats-grid{grid-template-columns:1fr}
        }
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// HEART & MODAL
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) { 
    const h=document.createElement('div'); 
    h.className='lumi-vector-heart'; 
    h.innerHTML=svgHeart; 
    h.style.left=e.clientX+'px'; 
    h.style.top=e.clientY+'px'; 
    document.body.appendChild(h); 
    setTimeout(()=>h.remove(),800); 
}

function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(150); 
    $('#lumi-modal-overlay').css('display','flex').hide().fadeIn(250);
    if(type==='forum') renderForumUI();
    else if(type==='diary') renderDiaryUI();
    else if(type==='dashboard') renderDashboard();
    else if(type==='phone') { 
        $('#lumi-modal-title').text('Phone'); 
        $('#lumi-modal-body').html('<div class="lumi-empty">ฟีเจอร์นี้กำลังพัฒนา</div>'); 
    } else if(type==='settings') {
        renderSettingsInModal();
    }
}

function createContentModal() {
    if($('#lumi-modal-overlay').length) return;    $('body').append(`<div id="lumi-modal-overlay" class="lumi-modal-overlay"><div class="lumi-modal-box"><div class="lumi-modal-header"><span id="lumi-modal-title"></span><div class="lumi-modal-close">${svgClose}</div></div><div id="lumi-modal-body" class="lumi-modal-body"></div></div></div>`);
    $('#lumi-modal-overlay').on('click',function(e){if(e.target.id==='lumi-modal-overlay')$(this).fadeOut(200);});
    $(document).off('click','.lumi-modal-close').on('click','.lumi-modal-close',()=>$('#lumi-modal-overlay').fadeOut(200));
}

function renderForumUI() { 
    $('#lumi-modal-title').text('Forum'); 
    $('#lumi-modal-body').html('<div class="lumi-empty">ฟีเจอร์นี้กำลังพัฒนา</div>'); 
}

function renderDashboard() {
    $('#lumi-modal-title').text('Dashboard');
    const mem = extension_settings[extensionName].memories || [];
    const totalMem = mem.length;
    const pinnedMem = mem.filter(m => m.meta.isPinned).length;
    const secretMem = mem.filter(m => m.meta.isSecret).length;
    const favoriteMem = mem.filter(m => m.meta.isFavorite).length;
    const characters = [...new Set(mem.map(m => m.character))];
    
    $('#lumi-modal-body').html(`
        <div class="lumi-dashboard">
            <div class="lumi-stats-grid">
                <div class="lumi-stat-card">
                    <div class="lumi-stat-value">${totalMem}</div>
                    <div class="lumi-stat-label">ความทรงจำทั้งหมด</div>
                </div>
                <div class="lumi-stat-card">
                    <div class="lumi-stat-value">${pinnedMem}</div>
                    <div class="lumi-stat-label">ปักหมุด</div>
                </div>
                <div class="lumi-stat-card">
                    <div class="lumi-stat-value">${favoriteMem}</div>
                    <div class="lumi-stat-label">ชื่นชอบ</div>
                </div>
                <div class="lumi-stat-card">
                    <div class="lumi-stat-value">${secretMem}</div>
                    <div class="lumi-stat-label">ความลับ</div>
                </div>
            </div>
            
            <div class="lumi-settings-card">
                <h4>ความทรงจำต่อตัวละคร</h4>
                ${characters.map(char => {
                    const count = mem.filter(m => m.character === char).length;
                    return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;color:#666;">
                        <span>${escapeHtml(char)}</span>
                        <span style="color:#ff85a2;">${count}</span>
                    </div>`;
                }).join('')}
                ${characters.length === 0 ? '<div style="font-size:11px;color:#ccc;text-align:center;">ยังไม่มีความทรงจำ</div>' : ''}            </div>
            
            <div class="lumi-chart-placeholder">
                กราฟความสัมพันธ์จะแสดงที่นี่ในเวอร์ชันถัดไป
            </div>
            
            <div style="margin-top:16px;text-align:center;">
                <button class="lumi-btn-sm" onclick="exportMemories()">
                    ${svgDownload} Export JSON
                </button>
            </div>
        </div>
    `);
}

function renderSettingsInModal() {
    $('#lumi-modal-title').text('ตั้งค่า LumiPulse');
    const s = extension_settings[extensionName].diary;
    
    $('#lumi-modal-body').html(`
        <div class="lumi-settings-card">
            <h4>โหมดโลก</h4>
            <select id="modal_world_mode" class="lumi-input">
                <option value="auto" ${s.worldMode === 'auto' ? 'selected' : ''}>อัตโนมัติ</option>
                <option value="solo" ${s.worldMode === 'solo' ? 'selected' : ''}>เดี่ยว</option>
                <option value="rpg" ${s.worldMode === 'rpg' ? 'selected' : ''}>กลุ่ม</option>
            </select>
        </div>
        <div class="lumi-settings-card">
            <h4>การเจนอัตโนมัติ</h4>
            <label class="checkbox_label">
                <input type="checkbox" id="modal_autogen" ${s.autoGen.enabled?'checked':''}>
                <span>เปิดใช้งาน</span>
            </label>
            <select id="modal_trigger" class="lumi-input" style="margin-top:8px;">
                <option value="turn_count" ${s.autoGen.triggerType==='turn_count'?'selected':''}>ทุก X ข้อความ</option>
                <option value="emotion" ${s.autoGen.triggerType==='emotion'?'selected':''}>คำอารมณ์</option>
                <option value="random" ${s.autoGen.triggerType==='random'?'selected':''}>สุ่ม</option>
            </select>
            <div style="margin-top:8px;">
                <input type="number" id="modal_interval" value="${s.autoGen.turnInterval}" class="lumi-input" placeholder="จำนวนข้อความ">
            </div>
        </div>
        <div style="text-align:center;margin-top:16px;">
            <button id="modal_save" class="lumi-btn-gen">บันทึกการตั้งค่า</button>
        </div>
    `);
    
    $('#modal_save').on('click', function() {
        s.worldMode = $('#modal_world_mode').val();        s.autoGen.enabled = $('#modal_autogen').prop('checked');
        s.autoGen.triggerType = $('#modal_trigger').val();
        s.autoGen.turnInterval = parseInt($('#modal_interval').val()) || 20;
        SillyTavern.getContext().saveSettingsDebounced();
        showToast('บันทึกการตั้งค่าแล้ว');
        setTimeout(() => {
            $('#lumi-modal-overlay').fadeOut(200);
            renderDiaryUI();
        }, 500);
    });
}

function renderDiaryUI() {
    const s=extension_settings[extensionName], cn=getCharacterName();
    $('#lumi-modal-title').text(`${cn}'s Memories`);
    
    const wm=s.diary.worldMode==='auto'?detectWorldMode():s.diary.worldMode;
    const chars=[cn,...getChatNPCs(5),...getAllCharactersFromChat()].filter((v,i,a)=>a.indexOf(v)===i);
    const showFav = s.diary.display.showFavoritesOnly;
    
    $('#lumi-modal-body').html(`
        <div class="lumi-nav-tabs">
            <button class="lumi-nav-tab ${!showFav?'active':''}" data-filter="all">ทั้งหมด</button>
            <button class="lumi-nav-tab ${showFav?'active':''}" data-filter="favorites">ชื่นชอบ</button>
            <button class="lumi-nav-tab" data-view="rpg">RPG View</button>
            <button class="lumi-nav-tab" data-view="dashboard">Dashboard</button>
        </div>
        
        <div id="lumi-diary-content">
            <div style="text-align:center;margin-bottom:12px">
                <button id="lumi-manual-gen" class="lumi-btn-gen">
                    ${svgPlus} บันทึกความทรงจำตอนนี้
                </button>
            </div>
            
            <div class="lumi-filter-bar">
                <select id="lumi-f-char" class="lumi-filter-select">
                    <option value="">ทุกตัวละคร</option>
                    ${chars.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
                </select>
                <input id="lumi-f-search" class="lumi-filter-search" placeholder="ค้นหาไดอารี่...">
            </div>
            
            <div id="lumi-timeline-panel" class="lumi-timeline-container"></div>
        </div>
    `);
    
    loadAndRenderTimeline();
    $('#lumi-f-char, #lumi-f-search').on('change keyup', ()=>setTimeout(loadAndRenderTimeline, 200));
    $('#lumi-manual-gen').on('click', manualGenerateWithOptions);    
    $('.lumi-nav-tab').on('click', function() {
        const filter = $(this).data('filter');
        const view = $(this).data('view');
        
        $('.lumi-nav-tab').removeClass('active');
        $(this).addClass('active');
        
        if(filter === 'favorites') {
            s.diary.display.showFavoritesOnly = true;
            loadAndRenderTimeline();
        } else if(filter === 'all') {
            s.diary.display.showFavoritesOnly = false;
            loadAndRenderTimeline();
        } else if(view === 'rpg') {
            renderRPGView();
        } else if(view === 'dashboard') {
            renderDashboard();
        }
    });
}

function renderRPGView() {
    const f={character:$('#lumi-f-char').val()||null, worldMode:null, showSecret:extension_settings[extensionName].diary.display.showSecret};
    const q=$('#lumi-f-search').val()?.toLowerCase()||'';
    let mem=loadMemories(f);
    if(q) mem=mem.filter(m=>m.content.diary?.toLowerCase().includes(q)||m.content.mood?.includes(q)||m.content.rp_location?.includes(q));
    
    const byChar = {};
    mem.forEach(m => {
        if(!byChar[m.character]) byChar[m.character] = [];
        byChar[m.character].push(m);
    });
    
    const panel = $('#lumi-timeline-panel');
    if(Object.keys(byChar).length === 0) {
        panel.html('<div class="lumi-empty">ยังไม่มีความทรงจำ</div>');
        return;
    }
    
    let html = '<div class="lumi-rpg-columns">';
    for(const[char, entries] of Object.entries(byChar)) {
        html += `
            <div class="lumi-character-column">
                <div class="lumi-character-header">
                    <div class="lumi-character-avatar">${escapeHtml(char.charAt(0).toUpperCase())}</div>
                    <div>
                        <div class="lumi-character-name">${escapeHtml(char)}</div>
                        <div class="lumi-character-count">${entries.length} ความทรงจำ</div>
                    </div>                </div>
                ${entries.map(m => renderMemoryCard(m, true)).join('')}
            </div>
        `;
    }
    html += '</div>';
    panel.html(html);
    bindMemoryCardEvents();
}

function loadAndRenderTimeline() {
    const s = extension_settings[extensionName];
    const f={
        character:$('#lumi-f-char').val()||null, 
        worldMode:null, 
        showSecret:s.diary.display.showSecret,
        favoritesOnly:s.diary.display.showFavoritesOnly
    };
    const q=$('#lumi-f-search').val()?.toLowerCase()||'';
    let mem=loadMemories(f);
    if(q) mem=mem.filter(m=>m.content.diary?.toLowerCase().includes(q)||m.content.mood?.includes(q)||m.content.rp_location?.includes(q));
    const p=$('#lumi-timeline-panel');
    if(!mem.length){
        p.html('<div class="lumi-empty">ยังไม่มีความทรงจำ<br><small style="opacity:.7">แชทต่อหรือกดปุ่มสร้างบันทึก</small></div>');
        return;
    }
    
    const grouped = {};
    mem.forEach(m => {
        const dateKey = m.content.rp_date || 'ไม่ระบุวันที่';
        if(!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(m);
    });
    
    let h='';
    for(const[date, entries] of Object.entries(grouped)) {
        h += `<div class="lumi-timeline-date">${svgCalendar} ${escapeHtml(date)}</div>`;
        entries.forEach(m => { h += renderMemoryCard(m, false); });
    }
    p.html(h);
    bindMemoryCardEvents();
}

function renderMemoryCard(entry, compact=false) {
    const isLocked = entry.meta.isSecret && !checkUnlock(entry);
    const rp = `
        <span class="lumi-rp-info">${svgCalendar} ${escapeHtml(entry.content.rp_date)}</span>
        <span class="lumi-rp-info">${svgMapPin} ${escapeHtml(entry.content.rp_location)}</span>
        <span class="lumi-rp-info">${svgCloud} ${escapeHtml(entry.content.rp_weather)}</span>
    `;    const tags = (entry.meta.tags||[]).map(t=>`<span class="lumi-tag">${t}</span>`).join('');
    const msgRef = entry.meta.messageIndex 
        ? `<div class="lumi-msg-ref" data-msg-idx="${entry.meta.messageIndex}">${svgChat} ข้อความ #${entry.meta.messageIndex+1}</div>` 
        : '';
    const acts = `
        <button class="lumi-btn-icon ${entry.meta.isFavorite?'active':''}" data-act="fav" title="ชื่นชอบ">${entry.meta.isFavorite?svgStarFilled:svgStar}</button>
        <button class="lumi-btn-icon ${entry.meta.isPinned?'active':''}" data-act="pin" title="ปักหมุด">${svgPin}</button>
        <button class="lumi-btn-icon danger" data-act="del" title="ลบ">${svgTrash}</button>
    `;
    
    if(isLocked) {
        return `<div class="lumi-memory-card secret-locked" data-id="${entry.id}">
            <div class="lumi-locked-overlay">
                ${svgLock}
                <div class="lumi-locked-text">ความทรงจำนี้ยังมองไม่เห็น</div>
                <div class="lumi-locked-hint">${entry.meta.unlockCondition?.type==='affection'?'ปลดล็อกเมื่อความสัมพันธ์ ≥ 80':'จะเปิดเผยเมื่อถึงเวลา...'}</div>
            </div>
            <div class="lumi-memory-header">
                <span class="lumi-memory-char">${escapeHtml(entry.character)}</span>
            </div>
            <div class="lumi-memory-meta">${rp}</div>
        </div>`;
    }
    
    return `<div class="lumi-memory-card ${entry.meta.isPinned?'pinned':''}" data-id="${entry.id}">
        <div class="lumi-memory-header">
            <span class="lumi-memory-char">${escapeHtml(entry.character)}</span>
            <div class="lumi-memory-meta">${compact ? '' : rp}</div>
        </div>
        <div style="font-size:10px;color:#888;margin-bottom:6px">
            ${entry.content.mood} · ❤️ ${entry.content.affection_score}
        </div>
        <div class="lumi-memory-content">${escapeHtml(entry.content.diary)}</div>
        ${msgRef}
        <div class="lumi-memory-tags">${tags}</div>
        ${compact ? '' : `<div class="lumi-memory-actions">${acts}</div>`}
    </div>`;
}

function bindMemoryCardEvents() {
    $('.lumi-btn-icon[data-act="pin"]').off('click').on('click',function(e){
        e.stopPropagation();
        const id=$(this).closest('.lumi-memory-card').data('id');
        togglePin(id);
    });
    $('.lumi-btn-icon[data-act="fav"]').off('click').on('click',function(e){
        e.stopPropagation();
        const id=$(this).closest('.lumi-memory-card').data('id');
        toggleFav(id);
    });    $('.lumi-btn-icon[data-act="del"]').off('click').on('click',function(e){
        e.stopPropagation();
        const id=$(this).closest('.lumi-memory-card').data('id');
        delMem(id);
    });
    $('.lumi-msg-ref').off('click').on('click',function(){
        const idx = $(this).data('msgIdx');
        scrollToMessage(idx);
    });
}

function togglePin(id){
    const s=extension_settings[extensionName],m=s.memories.find(x=>x.id===id);
    if(m){
        m.meta.isPinned=!m.meta.isPinned;
        SillyTavern.getContext().saveSettingsDebounced();
        loadAndRenderTimeline();
    }
}

function toggleFav(id){
    const s=extension_settings[extensionName],m=s.memories.find(x=>x.id===id);
    if(m){
        m.meta.isFavorite=!m.meta.isFavorite;
        SillyTavern.getContext().saveSettingsDebounced();
        loadAndRenderTimeline();
        // แสดง notification
        if(m.meta.isFavorite) {
            showToast('เพิ่ม vàoความทรงจำล้ำค่า - ใช้ filter "ชื่นชอบ" เพื่อดูเฉพาะรายการนี้');
        }
    }
}

function delMem(id){
    if(confirm('ลบความทรงจำนี้?')){
        const s=extension_settings[extensionName];
        s.memories=s.memories.filter(x=>x.id!==id);
        SillyTavern.getContext().saveSettingsDebounced();
        loadAndRenderTimeline();
    }
}

function scrollToMessage(index) {
    // พยายามเลื่อนไปยังข้อความนั้นในแชท
    const chatContainer = $('#chat');
    if(chatContainer.length) {
        const messages = chatContainer.find('.mes');
        if(messages[index]) {
            messages[index].scrollIntoView({behavior: 'smooth', block: 'center'}
);            $(messages[index]).effect('highlight', {color: '#FFB6C1'}, 2000);
            showToast(`เลื่อนไปยังข้อความ #${index+1}`);
        } else {
            showToast(`ไม่พบข้อความ #${index+1}`, 'warning');
        }
    } else {
        alert(`ข้อความนี้คือข้อความที่ #${index+1} ในแชท`);
    }
}

function exportMemories() {
    const data = JSON.stringify(extension_settings[extensionName].memories, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumipulse-memories-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export สำเร็จ');
}

// ═══════════════════════════════════════════════
// ⚙️ SETTINGS PANEL
// ═══════════════════════════════════════════════
function createSettingsUI() {
    if ($('#lumi-settings-drawer').length) return;
    const s = extension_settings[extensionName].diary;
    const ag = s.autoGen;

    $('#extensions_settings').append(`
        <div id="lumi-settings-drawer" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b style="color:#ff85a2; font-family:'Mitr'; font-weight:300;">LumiPulse Hub</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="display: none;">
                <div style="margin-bottom: 12px;">
                    <label class="checkbox_label">
                        <input id="lumi_enable_toggle" type="checkbox" ${extension_settings[extensionName].isEnabled ? 'checked' : ''} />
                        <span>เปิดใช้งาน LumiPulse</span>
                    </label>
                </div>
                
                <div style="font-size: 11px; color: #ffb6c1; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                    การตั้งค่าทั่วไป
                </div>
                
                <div style="margin-bottom: 8px;">
                    <label style="font-size: 12px; color: #aaa;">โหมดโลก</label>                    <select id="lumi_world_mode" class="text_pole">
                        <option value="auto" ${s.worldMode === 'auto' ? 'selected' : ''}>อัตโนมัติ</option>
                        <option value="solo" ${s.worldMode === 'solo' ? 'selected' : ''}>เดี่ยว</option>
                        <option value="rpg" ${s.worldMode === 'rpg' ? 'selected' : ''}>กลุ่ม</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <label class="checkbox_label" style="font-size: 12px; color: #aaa;">
                        <input id="lumi_autogen_toggle" type="checkbox" ${ag.enabled ? 'checked' : ''} />
                        <span>เจนไดอารี่อัตโนมัติ</span>
                    </label>
                </div>
                
                <div id="lumi_autogen_options" style="display: ${ag.enabled ? 'block' : 'none'}; margin-left: 15px; margin-bottom: 10px;">
                    <label style="font-size: 11px; color: #888;">ทริกเกอร์:</label>
                    <select id="lumi_trigger_type" class="text_pole" style="width: 100%; margin: 4px 0;">
                        <option value="turn_count" ${ag.triggerType === 'turn_count' ? 'selected' : ''}>ทุก X ข้อความ</option>
                        <option value="emotion" ${ag.triggerType === 'emotion' ? 'selected' : ''}>คำอารมณ์</option>
                        <option value="random" ${ag.triggerType === 'random' ? 'selected' : ''}>สุ่ม</option>
                    </select>
                    
                    <div id="lumi_turn_interval_wrap" style="display: ${ag.triggerType === 'turn_count' ? 'block' : 'none'}; margin-top: 4px;">
                        <input id="lumi_turn_interval" type="number" value="${ag.turnInterval}" min="5" max="100" class="text_pole" style="width: 60px;"> <span style="font-size: 11px; color: #888;">ข้อความ</span>
                    </div>
                </div>
                
                <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                    <button id="lumi_export" class="menu_button" style="margin-bottom: 5px;">
                        ${svgDownload} Export JSON
                    </button>
                    <button id="lumi_clear_memories" class="menu_button danger">
                        ${svgTrash} ล้างความทรงจำทั้งหมด
                    </button>
                </div>
            </div>
        </div>
    `);

    $('#lumi_enable_toggle').on('change', function() {
        extension_settings[extensionName].isEnabled = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        if(extension_settings[extensionName].isEnabled) {
            setTimeout(() => { spawnLumiButton(); createContentModal(); setupAutoTriggerListener(); }, 500);
        } else {
            $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove();
            $(document).off('messageReceived', onNewChat);
        }
    });
        $('#lumi_world_mode').on('change', function() {
        extension_settings[extensionName].diary.worldMode = $(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    $('#lumi_autogen_toggle').on('change', function() {
        extension_settings[extensionName].diary.autoGen.enabled = $(this).prop('checked');
        $('#lumi_autogen_options').toggle($(this).prop('checked'));
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    $('#lumi_trigger_type').on('change', function() {
        extension_settings[extensionName].diary.autoGen.triggerType = $(this).val();
        $('#lumi_turn_interval_wrap').toggle($(this).val() === 'turn_count');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    $('#lumi_turn_interval').on('change', function() {
        extension_settings[extensionName].diary.autoGen.turnInterval = parseInt($(this).val()) || 20;
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    $('#lumi_export').on('click', function() {
        exportMemories();
    });
    
    $('#lumi_clear_memories').on('click', function() {
        if(confirm('ล้างความทรงจำทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            extension_settings[extensionName].memories = [];
            SillyTavern.getContext().saveSettingsDebounced();
            showToast('ล้างความทรงจำทั้งหมดแล้ว');
        }
    });
}

// ═══════════════════════════════════════════════
// 🛡️ FAB BUTTON (ลากได้จริง!)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    if (!document.body) { 
        setTimeout(spawnLumiButton, 800); 
        return; 
    }
    
    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    
    // ตำแหน่งจาก settings
    const pos = loadFabPosition();    fab.style.bottom = pos.bottom || "100px";
    fab.style.right = pos.right || "20px";
    fab.style.top = pos.top || "auto";
    fab.style.left = pos.left || "auto";
    
    document.body.appendChild(fab);
    
    setTimeout(() => { 
        fab.style.display = 'flex'; 
        fab.style.visibility = 'visible'; 
        fab.style.opacity = '1'; 
    }, 50);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML = `
        <div class="lumi-menu-header">
            <span class="lumi-menu-title">LumiPulse</span>
            <div class="lumi-menu-settings-btn" id="menu-settings-btn" title="ตั้งค่า">${svgGear}</div>
        </div>
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon"><span class="lumi-menu-text">Memories</span></div>
            <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon"><span class="lumi-menu-text">Forum</span></div>
            <div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}" class="lumi-menu-icon"><span class="lumi-menu-text">Phone</span></div>
        </div>
        <div class="lumi-branding">LumiPulse</div>
    `;
    document.body.appendChild(menu);

    function updateMenuPos() {
        const r = fab.getBoundingClientRect(), m = $(menu);
        let l = r.left - (m.outerWidth() / 2) + (r.width / 2);
        let t = r.top - m.outerHeight() - 10;
        if (l < 10) l = 10;
        if (l + m.outerWidth() > window.innerWidth - 10) l = window.innerWidth - m.outerWidth() - 10;
        if (t < 10) t = r.bottom + 10;
        m.css({ left: l + 'px', top: t + 'px' });
    }

    // Drag Logic - แบบง่ายและได้ผล
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, startLeft, startTop;
    let tapTimer = null;

    const startDrag = (e) => {
        isDragging = false;
        hasMoved = false;
        fab.classList.add('dragging');
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        
        const rect = fab.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        e.preventDefault();
    };

    const doDrag = (e) => {
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        if (Math.sqrt(dx*dx + dy*dy) > 5 && !hasMoved) {
            hasMoved = true;
            isDragging = true;
            $(menu).fadeOut(100);
        }
        
        if (!isDragging) return;
        
        const newLeft = startLeft + dx;
        const newTop = startTop + dy;
        
        fab.style.left = newLeft + 'px';
        fab.style.top = newTop + 'px';
        fab.style.right = 'auto';
        fab.style.bottom = 'auto';
        fab.style.transform = 'none';
    };

    const endDrag = (e) => {
        fab.classList.remove('dragging');
        
        if (!hasMoved) {
            // Click event
            clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                updateMenuPos();
                $(menu).fadeToggle(200);
                const clientX = e.type.includes('touch') ? (e.changedTouches[0]?.clientX || e.clientX) : e.clientX;
                const clientY = e.type.includes('touch') ? (e.changedTouches[0]?.clientY || e.clientY) : e.clientY;
                spawnHeartEffect({ clientX, clientY, _fromDrag: false });            }, 50);
        } else {
            // บันทึกตำแหน่ง
            const rect = fab.getBoundingClientRect();
            saveFabPosition({
                left: rect.left + 'px',
                top: rect.top + 'px',
                right: 'auto',
                bottom: 'auto',
                transform: 'none'
            });
        }
        
        isDragging = false;
        hasMoved = false;
    };

    // Mouse events
    fab.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    fab.addEventListener('touchstart', startDrag, {passive: false});
    document.addEventListener('touchmove', doDrag, {passive: false});
    document.addEventListener('touchend', endDrag);

    // Menu clicks
    $('#menu-settings-btn').on('click', () => {
        $(menu).fadeOut(200);
        openLumiModal('settings');
    });
    
    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => {
        $(menu).fadeOut(200);
        openLumiModal('diary');
    });
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => {
        $(menu).fadeOut(200);
        openLumiModal('forum');
    });
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => {
        $(menu).fadeOut(200);
        openLumiModal('phone');
    });
}

function showToast(m, t='info') { 
    if(typeof toastr!=='undefined') toastr[t](m, 'LumiPulse'); 
}
