"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: true,
    forumTopic: "", isForumInitialized: false, includeRandomNPCs: true, forumData: [], diaryData: null,
    memories: [],
    _internal: { messageCounter: 0, firstChatDate: null },
    diary: {
        worldMode: 'auto',
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'], randomChance: 0.08 },
        display: { viewMode: 'timeline', showSecret: true, secretUnlockMode: 'affection' },
        storage: { maxEntries: 40, autoSave: true }
    }
};
let extension_settings = {};

const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart = `<svg viewBox="0 0 32 32" fill="none"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1"/></svg>`;
const svgSettings = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgPin = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgRef = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const svgStar = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="#FFB6C1" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT (คงโครงสร้างเดิมที่ทำงานได้จริง)
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
    extension_settings = context.extensionSettings;
    const s = extension_settings[extensionName];
    if (!s.diary) s.diary = { ...defaultSettings.diary };
    if (!s.memories) s.memories = [];    if (!s._internal) s._internal = { ...defaultSettings._internal };

    injectStyles();
    createSettingsUI();
    
    if (extension_settings[extensionName].isEnabled) {
        // หน่วงเวลาเล็กน้อยให้ ST โหลด Layout เสร็จ
        setTimeout(() => {
            spawnLumiButton();
            createContentModal();
            setupAutoTriggerListener();
            console.log("[LumiPulse] ✅ Modules loaded");
        }, 1500);
    }
    
    // Heart Effect
    document.addEventListener('click', (e) => {
        if (!e._fromDrag) spawnHeartEffect(e);
    });
}

// ═══════════════════════════════════════════════
// HELPERS & AI CORE
// ═══════════════════════════════════════════════
function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [], names = new Set();
    chat.slice(-50).forEach(m => { if (m.name && !m.is_user && !m.is_system) names.add(m.name); });
    return names.size > 2 ? 'rpg' : 'solo';
}
function getChatNPCs(limit=5) {
    const chat = SillyTavern.getContext().chat || [], names = new Set(), cn = getCharacterName();
    chat.slice(-40).forEach(m => { if (m.name && !m.is_user && !m.is_system && m.name!==cn) names.add(m.name); });
    return Array.from(names).slice(0, limit);
}
function getCharacterName() { return SillyTavern.getContext().name2 || "ตัวละคร"; }
function getUserName() { return SillyTavern.getContext().name1 || "ผู้เล่น"; }
function escapeHtml(t) { return typeof t==='string' ? t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;') : ''; }
function formatTime(iso) { const d=new Date(iso); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function getMoodEmoji(m) { return {'ตื่นเต้น':'😳','ดีใจ':'😊','อบอุ่น':'🥰','รัก':'💖','เสียใจ':'😢','โกรธ':'😠','สับสน':'😕','กลัว':'😨','แปลกหน้า':'😶','เพื่อน':'🤝','สนิท':'💕'}[m] || '🌸'; }
function extractTags(t) { const tags=[],kw={'#โรแมนติก':['รัก','หัวใจ','ชอบ','แอบชอบ'],'#ดราม่า':['เสียใจ','ร้องไห้','เจ็บปวด'],'#ตลก':['ขำ','ตลก','555'],'#จุดเปลี่ยน':['ตัดสินใจ','เปลี่ยน','เริ่ม']},l=t.toLowerCase(); for(const[k,v]of Object.entries(kw)) if(v.some(w=>l.includes(w))) tags.push(k); return tags.slice(0,3); }
function checkUnlock(m) { if(!m.meta.isSecret) return true; const c=extension_settings[extensionName].diary.display; if(c.secretUnlockMode==='manual') return false; if(c.secretUnlockMode==='affection') return (m.content.affection_score||0)>=80; return (new Date()-new Date(m.timestamp))/864e5>=3; }
function saveMemory(entry) { const s=extension_settings[extensionName]; s.memories.unshift(entry); if(s.memories.length>s.diary.storage.maxEntries) s.memories=s.memories.slice(0,s.diary.storage.maxEntries); SillyTavern.getContext().saveSettingsDebounced(); }
function loadMemories(f={}) { let mem=[...(extension_settings[extensionName].memories||[])]; if(f.character) mem=mem.filter(m=>m.character===f.character); if(f.worldMode) mem=mem.filter(m=>m.worldMode===f.worldMode); if(f.showSecret===false) mem=mem.filter(m=>!m.meta.isSecret||checkUnlock(m)); return mem.sort((a,b)=>(b.meta.isPinned===true)-(a.meta.isPinned===true) || new Date(b.timestamp)-new Date(a.timestamp)); }

function parseJSON(text) { if(!text||typeof text!=='string') return null; let m=text.match(/\{[\s\S]*\}/); if(m){try{return JSON.parse(m[0]);}catch(e){}} toastr.warning('AI ตอบกลับผิดรูปแบบ 🌸'); return null; }
async function callST(p) { try { const ctx=SillyTavern.getContext(); let res; if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(p,false,false); else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(p,true); else if(typeof window.generateQuietPrompt==='function') res=await window.generateQuietPrompt(p,false,false); else if(typeof window.generateRaw==='function') res=await window.generateRaw(p,true); else {toastr.error('หา generate function ไม่เจอ');return null;} return parseJSON(res); }catch(e){console.error(e);toastr.error('AI Error');return null;} }

async function requestDiaryGen(opt={}) {
    const {charName=getCharacterName(), trigger='manual', ev=null, linked=[]} = opt;
    const ctx=SillyTavern.getContext(), cc=ctx.characters?.[ctx.characterId]||{};    let wm=extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm=detectWorldMode();
    const chatLog=(ctx.chat||[]).slice(-25).map(m=>`${m.is_user?'User':m.name||'NPC'}: ${(m.mes||'').slice(0,150)}`).join('\n');
    const evNote=ev?`\n🎉 Event: ${ev.label}\n${ev.promptBoost}`:'';
    const prompt=`[System: You are ${charName}'s inner voice. Respond ONLY with valid JSON.]
Profile: ${cc.data?.personality||'Normal'} | World: ${wm==='rpg'?'Group':'Solo'} | Others: ${linked.join(',')||'None'}
Chat Log:\n${chatLog}\n${evNote}
Generate a diary entry based on the RP context. Infer the fictional date, location, and weather from the chat.
Format: {"rp_date":"วันที่ในเกม","rp_location":"สถานที่ RP","rp_weather":"สภาพอากาศ/บรรยากาศ","affection_score":0-100,"mood":"อารมณ์","diary":"เนื้อหาไดอารี่ 3-5 ประโยค มุมมองบุคคลที่ 1 ภาษาไทย"}
NO markdown, ONLY JSON.`;
    return await callST(prompt);
}

// ═══════════════════════════════════════════════
// AUTO-TRIGGER & MANUAL
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).on('messageReceived', onNewChat);
    $(document).on('activeCharacterChanged', () => {
        extension_settings[extensionName]._internal.messageCounter=0;
        if(!extension_settings[extensionName]._internal.firstChatDate) {
            extension_settings[extensionName]._internal.firstChatDate=new Date().toISOString();
            SillyTavern.getContext().saveSettingsDebounced();
        }
    });
}
async function onNewChat() {
    const s=extension_settings[extensionName], cfg=s.diary.autoGen;
    if(!cfg.enabled) return;
    s._internal.messageCounter++;
    const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'').toLowerCase();
    let gen=false, type='manual', refTxt=lastMsg;
    if(cfg.triggerType==='turn_count' && s._internal.messageCounter>=cfg.turnInterval) { gen=true; type='turn'; s._internal.messageCounter=0; }
    else if(cfg.triggerType==='emotion' && cfg.emotionKeywords.some(k=>lastMsg.includes(k))) { gen=true; type='emotion'; }
    else if(cfg.triggerType==='random' && Math.random()<cfg.randomChance) { gen=true; type='random'; }
    else if(lastMsg.includes('#จำ') || lastMsg.includes('#memory') || lastMsg.includes('#diary')) { gen=true; type='user_tag'; }
    if(gen) {
        SillyTavern.getContext().saveSettingsDebounced();
        let wm=s.diary.worldMode; if(wm==='auto') wm=detectWorldMode();
        const res=await requestDiaryGen({trigger:type, linkedChars:wm==='rpg'?getChatNPCs(3):[]});
        if(res) createMemoryEntry(res, type, SillyTavern.getContext(), wm, refTxt);
    }
}
async function manualGenerate() {
    const ctx=SillyTavern.getContext(); 
    $('#lumi-modal-body').html(`<div style="text-align:center;padding:40px;"><div class="lumi-loader-wrap"><div class="lumi-loader"></div><div style="color:#ff85a2;margin-top:10px;">กำลังบันทึก...</div></div></div>`);
    let wm=extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm=detectWorldMode();
    const res=await requestDiaryGen({trigger:'manual', linkedChars:wm==='rpg'?getChatNPCs(3):[]});
    if(res) { createMemoryEntry(res, 'manual', ctx, wm, ctx.chat?.slice(-1)[0]?.mes||''); loadAndRenderTimeline(); } else { renderDiaryUI(); }
}
function createMemoryEntry(res, type, ctx, wm, refText) {    const entry = { id:"mem_"+Date.now(), timestamp:new Date().toISOString(), trigger:type, character:getCharacterName(), characterId:ctx.characterId, worldMode:wm, content: { rp_date: res.rp_date||"วันไม่ทราบแน่ชัด", rp_location: res.rp_location||"สถานที่ปัจจุบัน", rp_weather: res.rp_weather||"บรรยากาศเงียบสงบ", affection_score: res.affection_score||50, mood: res.mood||"สงบ", diary: res.diary||"" }, meta: { isPinned:false, isFavorite:false, isHidden:false, isSecret:false, unlockCondition:null, tags:extractTags(res.diary||''), referenceText: refText?.slice(0,100)||"" } };
    saveMemory(entry); showToast(`🌸 บันทึก: ${res.rp_date}`);
}

// ═══════════════════════════════════════════════
// 🛡️ STYLES (โครงสร้างเดิม + บังคับปุ่มให้เห็นชัด)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400&display=swap');
        @keyframes lumiPop { 0% { opacity: 0; transform: scale(0.8) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes heartRise { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(2) rotate(15deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .lumi-vector-heart { position: fixed; z-index: 2147483647; pointer-events: none; width: 30px; height: 30px; animation: heartRise 0.8s ease-out forwards; filter: drop-shadow(0 0 5px #FFB6C1); }

        /* 🔥 บังคับปุ่มลอย: กึ่งกลางขอบขวา + เห็นชัดบนทุกธีม */
        #lumi-main-fab {
            position: fixed !important; 
            z-index: 2147483647 !important; 
            top: 50% !important; 
            right: 15px !important; 
            transform: translateY(-50%) !important;
            width: 50px; height: 50px; 
            cursor: grab; touch-action: none; user-select: none;
            display: flex !important; 
            align-items: center; justify-content: center;
            background: url('${btnUrl}') no-repeat center center, rgba(255,245,250,0.9) !important;
            background-size: 70%, 100% !important;
            border-radius: 50% !important; 
            border: 2px solid #FFB6C1 !important;
            box-shadow: 0 5px 20px rgba(255,182,193,0.6) !important;
            backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
            will-change: transform;
        }
        #lumi-main-fab:active { cursor: grabbing; transform: translateY(-50%) scale(0.95) !important; }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }

        .lumi-menu-container { position: fixed; z-index: 2147483646; display: none; background: rgba(255,255,255,0.98); backdrop-filter: blur(25px); border-radius: 45px; padding: 30px; border: 2px solid rgba(255,182,193,0.4); box-shadow: 0 25px 60px rgba(255,182,193,0.3); font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-menu-grid { display: flex; gap: 25px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: transform 0.3s; }
        .lumi-menu-item:hover { transform: translateY(-8px); }
        .lumi-menu-icon { width: 55px; height: 55px; object-fit: contain; }
        .lumi-menu-text { font-size: 13px; color: #ff85a2; letter-spacing: 0.5px; }
        .lumi-branding { margin-top: 25px; font-size: 11px; color: #ffb6c1; text-transform: uppercase; letter-spacing: 4px; text-align: center; }
        .lumi-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.1); backdrop-filter: blur(15px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal-box { width: 94%; max-width: 460px; height: 82vh; background: #FFFFFF; border-radius: 45px; border: 2px solid #FFD1DC; box-shadow: 0 30px 70px rgba(255,182,193,0.15); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr', sans-serif; font-weight: 300; animation: lumiPop 0.4s forwards; }
        .lumi-modal-header { padding: 25px; text-align: center; color: #ff85a2; border-bottom: 1.5px solid #FFF0F3; position: relative; font-size: 18px; }
        .lumi-modal-close { position: absolute; right: 20px; top: 25px; width: 35px; height: 35px; background: #FFF0F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff85a2; }
        .lumi-modal-opt { position: absolute; left: 20px; top: 25px; width: 35px; height: 35px; color: #ffb6c1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
        .lumi-modal-opt:hover { color: #ff85a2; transform: rotate(45deg); }
        .lumi-modal-body { flex: 1; padding: 20px; overflow-y: auto; background: #FFFFFF; }

        .lumi-setup { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px; text-align: center; }
        .lumi-input { width: 100%; background: #FFF9FA; border: 1.5px solid #FFD1DC; border-radius: 20px; padding: 15px; color: #ff85a2; font-family: 'Mitr'; text-align: center; outline: none; font-size: 14px; box-sizing: border-box; }
        .lumi-btn-gen { background: linear-gradient(135deg, #FFB6C1, #FF85A2); color: white; border: none; padding: 12px 45px; border-radius: 25px; font-family: 'Mitr'; cursor: pointer; transition: opacity 0.3s; box-shadow: 0 5px 15px rgba(255,133,162,0.2); font-size: 14px; }
        .lumi-btn-gen:hover { opacity: 0.85; }

        .forum-post { background: white; border-radius: 30px; padding: 18px; margin-bottom: 18px; border: 1px solid #FDF2F4; box-shadow: 0 5px 15px rgba(0,0,0,0.02); animation: lumiPop 0.5s backwards; }
        .post-header { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
        .post-avatar { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #FFD1DC; background: #FFF0F3; display: flex; align-items: center; justify-content: center; color: #ff85a2; font-size: 18px; flex-shrink: 0; }
        .post-author { font-weight: 400; color: #444; font-size: 15px; }
        .post-content { font-size: 14px; color: #666; line-height: 1.6; }
        .post-footer { margin-top: 12px; color: #ffb6c1; font-size: 13px; display: flex; gap: 15px; }
        .lumi-loader-wrap { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 100px; }
        .lumi-loader { width: 45px; height: 45px; border: 3px solid #FFF0F3; border-top-color: #ff85a2; border-radius: 50%; animation: spin 1s infinite linear; }
        .lumi-coming-soon { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: #ffb6c1; font-size: 15px; text-align: center; }
        .lumi-coming-soon img { width: 80px; opacity: 0.7; }

        .lumi-diary-wrap { padding-bottom: 10px; }
        .lumi-diary-header { display: flex; gap: 14px; align-items: center; margin-bottom: 20px; }
        .lumi-diary-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #FFD1DC, #FFB6C1); display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(255,182,193,0.4); }
        .lumi-diary-charname { font-size: 17px; color: #444; font-weight: 400; }
        .lumi-diary-date { font-size: 11px; color: #ffb6c1; margin-top: 3px; }
        .lumi-affection-wrap { background: #FFF9FA; border-radius: 20px; padding: 14px 16px; margin-bottom: 20px; border: 1px solid #FFE8EE; }
        .lumi-affection-label { display: flex; justify-content: space-between; font-size: 12px; color: #aaa; margin-bottom: 8px; }
        .lumi-affection-track { height: 8px; background: #FFE8EE; border-radius: 10px; overflow: hidden; }
        .lumi-affection-fill { height: 100%; border-radius: 10px; transition: width 1s ease; width: 0%; }
        .lumi-affection-score { text-align: right; font-size: 11px; color: #ffb6c1; margin-top: 5px; }
        .lumi-diary-paper { background: #FFFBFC; border: 1px solid #FFE8EE; border-radius: 25px; padding: 22px 20px; position: relative; overflow: hidden; min-height: 150px; }
        .lumi-diary-lines { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(transparent, transparent 27px, #FFF0F3 27px, #FFF0F3 28px); opacity: 0.5; border-radius: 25px; }
        .lumi-diary-text { position: relative; z-index: 1; font-size: 14px; color: #555; line-height: 1.85; white-space: pre-wrap; }

        /* Timeline UI */
        .lumi-timeline-container { padding-bottom: 10px; }
        .lumi-timeline-date { font-size: 13px; color: #ffb6c1; font-weight: 400; padding: 12px 0 8px; border-bottom: 1px dashed #FFE8EE; margin: 16px 0 12px; }
        .lumi-memory-card { background: #FFFBFC; border: 1px solid #FFE8EE; border-radius: 20px; padding: 16px; margin-bottom: 12px; position: relative; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; }
        .lumi-memory-card:hover { box-shadow: 0 4px 12px rgba(255,182,193,0.15); transform: translateY(-2px); }
        .lumi-memory-card.pinned { border: 1.5px solid #FFD1DC; background: #FFF8FA; }
        .lumi-memory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
        .lumi-memory-char { font-weight: 400; color: #444; font-size: 15px; }
        .lumi-memory-time { font-size: 11px; color: #ccc; }
        .lumi-badge-rpg, .lumi-badge-event { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #FFF0F3; color: #ff85a2; }
        .lumi-memory-mood { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; margin-bottom: 10px; }
        .lumi-affection-mini { font-size: 11px; font-weight: 400; }        .lumi-memory-content { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 12px; white-space: pre-wrap; }
        .lumi-memory-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .lumi-tag { font-size: 10px; padding: 3px 10px; border-radius: 12px; background: #FFF0F3; color: #ff85a2; }
        .lumi-memory-actions { display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #FFE8EE; padding-top: 10px; }
        .lumi-btn-icon { width: 32px; height: 32px; border-radius: 50%; border: none; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s; font-size: 16px; color: #ffb6c1; }
        .lumi-btn-icon:hover { background: #FFF0F3; transform: scale(1.1); }
        .lumi-btn-icon.active { background: #FFF0F3; color: #FFD700; }
        .lumi-btn-icon.danger:hover { background: #FFE0E0; color: #ff6b6b; }
        .lumi-locked-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 1; }
        .lumi-locked-icon { width: 40px; height: 40px; opacity: 0.8; }
        .lumi-locked-text { font-size: 12px; color: #ffb6c1; text-align: center; }
        .lumi-locked-hint { font-size: 10px; color: #ccc; }
        .lumi-settings-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #FFF0F3; }
        .lumi-settings-section:last-child { border-bottom: none; }
        .lumi-settings-section h4 { font-size: 14px; color: #ff85a2; margin-bottom: 12px; font-weight: 400; }
        .lumi-sub-settings { margin-left: 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: #666; }
        .lumi-sub-settings input[type="number"], .lumi-sub-settings input[type="text"], .lumi-sub-settings select { width: 100%; padding: 8px 12px; border: 1px solid #FFD1DC; border-radius: 12px; background: #FFF9FA; color: #ff85a2; font-family: 'Mitr'; font-size: 12px; outline: none; }
        .lumi-btn-small { padding: 6px 16px; border-radius: 15px; border: none; background: #FFF0F3; color: #ff85a2; font-family: 'Mitr'; font-size: 11px; cursor: pointer; margin-right: 8px; transition: background 0.2s; }
        .lumi-btn-small:hover { background: #FFE0E6; }
        .lumi-btn-small.danger { background: #FFE0E0; color: #ff6b6b; }
        .lumi-btn-small.danger:hover { background: #FFCCCC; }
        .lumi-filter-bar { display: flex; gap: 8px; padding: 10px; background: #FFF9FA; border-radius: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .lumi-filter-select { flex: 1; min-width: 120px; padding: 8px 12px; border: 1px solid #FFD1DC; border-radius: 12px; background: white; color: #ff85a2; font-family: 'Mitr'; font-size: 12px; }
        .lumi-filter-search { flex: 2; min-width: 150px; padding: 8px 12px; border: 1px solid #FFD1DC; border-radius: 12px; background: white; color: #666; font-family: 'Mitr'; font-size: 12px; }
        .lumi-empty { text-align: center; color: #ffb6c1; padding: 40px 20px; font-size: 14px; line-height: 1.6; }
        .lumi-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.7; }
        @media (max-width: 768px) { #lumi-main-fab { width: 48px; height: 48px; } .lumi-menu-container { width: calc(100vw - 40px); right: 20px !important; } .lumi-menu-grid { gap: 15px; } .lumi-menu-icon { width: 48px; height: 48px; } }
    `;
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════
// HEART & MODAL
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) { const h=document.createElement('div'); h.className='lumi-vector-heart'; h.innerHTML=svgHeart; h.style.left=e.clientX+'px'; h.style.top=e.clientY+'px'; document.body.appendChild(h); setTimeout(()=>h.remove(),800); }
function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200); $('#lumi-modal-overlay').css('display','flex').hide().fadeIn(300);
    if(type==='forum') renderForumUI();
    else if(type==='diary') renderDiaryUI();
    else if(type==='phone') { $('#lumi-modal-title').text('📱 Phone'); $('#lumi-modal-body').html(`<div class="lumi-coming-soon"><img src="${iconPhone}"><div>Phone</div><div style="font-size:12px;opacity:.6;">Coming Soon 🌸</div></div>`); $('.lumi-modal-opt').hide(); }
}
function createContentModal() {
    if($('#lumi-modal-overlay').length) return;
    $('body').append(`<div id="lumi-modal-overlay" class="lumi-modal-overlay"><div class="lumi-modal-box"><div class="lumi-modal-header"><div class="lumi-modal-opt">${svgSettings}</div><span id="lumi-modal-title"></span><div class="lumi-modal-close">×</div></div><div id="lumi-modal-body" class="lumi-modal-body"></div></div></div>`);
    $('#lumi-modal-overlay').on('click',function(e){if(e.target.id==='lumi-modal-overlay')$(this).fadeOut(200);});
    $(document).off('click','.lumi-modal-close').on('click','.lumi-modal-close',()=>$('#lumi-modal-overlay').fadeOut(200));
}

// ═══════════════════════════════════════════════
// FORUM UI (Placeholder)// ═══════════════════════════════════════════════
function renderForumUI() { $('#lumi-modal-title').text('Social Forum'); $('#lumi-modal-body').html('<div style="text-align:center;padding:40px;color:#ffb6c1">Forum UI Coming Soon 🌸</div>'); }

// ═══════════════════════════════════════════════
// DIARY UI 2.0
// ═══════════════════════════════════════════════
function renderDiaryUI() {
    const s=extension_settings[extensionName], cn=getCharacterName();
    $('#lumi-modal-title').text(`📖 ${cn}'s Memories`); $('.lumi-modal-opt').show().attr('title','ตั้งค่า');
    const wm=s.diary.worldMode==='auto'?detectWorldMode():s.diary.worldMode;
    const chars=[cn,...getChatNPCs(5)].filter((v,i,a)=>a.indexOf(v)===i);
    $('#lumi-modal-body').html(`
        <div style="text-align:center;margin-bottom:12px"><button id="lumi-manual-gen" class="lumi-btn-gen">✨ บันทึกความทรงจำตอนนี้</button></div>
        <div class="lumi-filter-bar">
            <select class="lumi-filter-select" id="lumi-filter-char"><option value="">👤 ทุกตัวละคร</option>${chars.map(c=>`<option value="${escapeHtml(c)}" ${c===cn?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select>
            <input type="text" class="lumi-filter-search" id="lumi-filter-search" placeholder="🔍 ค้นหา...">
        </div>
        <div id="lumi-timeline-panel" class="lumi-timeline-container"></div>
    `);
    loadAndRenderTimeline();
    $('#lumi-filter-char,#lumi-filter-mode,#lumi-filter-search').on('change keyup', debounce(()=>loadAndRenderTimeline(),300));
    $('#lumi-manual-gen').on('click', manualGenerate);
    $('.lumi-modal-opt').off('click').on('click',()=>renderDiarySettingsInModal());
}

function loadAndRenderTimeline() {
    const f={character:$('#lumi-filter-char').val()||null, worldMode:$('#lumi-filter-mode').val()||null, showSecret:extension_settings[extensionName].diary.display.showSecret};
    const q=$('#lumi-filter-search').val()?.toLowerCase()||'';
    let mem=loadMemories(f);
    if(q) mem=mem.filter(m=>m.content.diary?.toLowerCase().includes(q)||m.content.mood?.toLowerCase().includes(q)||m.content.rp_location?.includes(q));
    const p=$('#lumi-timeline-panel');
    if(!mem.length){p.html(`<div class="lumi-empty"><div class="lumi-empty-icon">📭</div><div>ยังไม่มีบันทึกความทรงจำ</div></div>`);return;}
    const g={}; mem.forEach(m=>{const k=m.timestamp.split('T')[0]; if(!g[k])g[k]=[]; g[k].push(m);});
    let h=''; for(const[k,e]of Object.entries(g)){h+=`<div class="lumi-timeline-date">📅 ${formatThaiDate(k)}</div>`; e.forEach(x=>h+=renderMemoryCard(x));}
    p.html(h); bindMemoryCardEvents();
}

function formatThaiDate(iso) { const d=new Date(iso),m=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`; }

function renderMemoryCard(entry) {
    const locked=entry.meta.isSecret&&!checkUnlock(entry);
    const lvl=getAffectionLevel(entry.content.affection_score), mood=getMoodEmoji(entry.content.mood);
    let ev=''; if(entry.content.eventType){const map={'birthday':'🎂','anniversary_30d':'💕30d','anniversary_100d':'💕100d','anniversary_365d':'💕1y','season_0':'🌸','season_1':'☀️','season_2':'🍁','season_3':'❄️'};ev=`<span class="lumi-badge-event">${map[entry.content.eventType]||'🎉'}</span>`;}
    return `<div class="lumi-memory-card ${locked?'locked':''} ${entry.meta.isPinned?'pinned':''}" data-id="${entry.id}">${locked?`<div class="lumi-locked-overlay"><div class="lumi-locked-icon">${svgLock}</div><div class="lumi-locked-text">🔒 ล็อกอยู่</div></div>`:''}<div class="lumi-memory-header"><span class="lumi-memory-char">${escapeHtml(entry.character)}</span><span class="lumi-memory-time">${formatTime(entry.timestamp)}</span>${entry.worldMode==='rpg'?'<span class="lumi-badge-rpg">🌍 RPG</span>':''} ${ev}</div><div class="lumi-memory-mood"><span>${mood} ${escapeHtml(entry.content.mood)}</span><span class="lumi-affection-mini" style="color:${lvl.color}">❤️ ${entry.content.affection_score}</span></div><div class="lumi-memory-content ${locked?'locked':''}">${locked?'...':escapeHtml(entry.content.diary)}</div><div style="font-size:10px;color:#aaa;margin-bottom:6px">📍${escapeHtml(entry.content.rp_location)} | ☁️${escapeHtml(entry.content.rp_weather)}</div>${!locked?`<div class="lumi-memory-tags">${(entry.meta.tags||[]).map(t=>`<span class="lumi-tag">${t}</span>`).join('')}</div><div class="lumi-memory-actions"><button class="lumi-btn-icon ${entry.meta.isPinned?'active':''}" data-action="pin">${entry.meta.isPinned?'📌':''}</button><button class="lumi-btn-icon ${entry.meta.isFavorite?'active':''}" data-action="fav">${entry.meta.isFavorite?svgStar:svgStarEmpty}</button><button class="lumi-btn-icon" data-action="ref">${svgRef}</button><button class="lumi-btn-icon danger" data-action="del">🗑️</button></div>`:''}</div>`;
}
const AFFECTION_LEVELS=[{min:0,max:20,label:"แปลกหน้า",color:"#CCC",emoji:"😶"},{min:20,max:40,label:"รู้จักกัน",color:"#FFD1DC",emoji:"🙂"},{min:40,max:60,label:"เพื่อน",color:"#FFB6C1",emoji:"😊"},{min:60,max:80,label:"สนิทกัน",color:"#FF85A2",emoji:"🥰"},{min:80,max:101,label:"ใกล้ชิดมาก",color:"#FF4D79",emoji:"💖"}];
function getAffectionLevel(score){return AFFECTION_LEVELS.find(l=>score>=l.min&&score<l.max)||AFFECTION_LEVELS[0];}

function bindMemoryCardEvents() {
    $('.lumi-btn-icon[data-action="pin"]').off('click').on('click',function(e){e.stopPropagation();const id=$(this).closest('.lumi-memory-card').data('id'),m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m){m.meta.isPinned=!m.meta.isPinned;SillyTavern.getContext().saveSettingsDebounced();loadAndRenderTimeline();}});    $('.lumi-btn-icon[data-action="fav"]').off('click').on('click',function(e){e.stopPropagation();const id=$(this).closest('.lumi-memory-card').data('id'),m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m){m.meta.isFavorite=!m.meta.isFavorite;SillyTavern.getContext().saveSettingsDebounced();loadAndRenderTimeline();}});
    $('.lumi-btn-icon[data-action="ref"]').off('click').on('click',function(e){e.stopPropagation();const id=$(this).closest('.lumi-memory-card').data('id'),m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m)alert('📜 บริบท:\n'+(m.meta.referenceText||'ไม่มี'));});
    $('.lumi-btn-icon[data-action="del"]').off('click').on('click',function(e){e.stopPropagation();if(confirm('ลบความทรงจำนี้?')){const id=$(this).closest('.lumi-memory-card').data('id'),s=extension_settings[extensionName];s.memories=s.memories.filter(x=>x.id!==id);SillyTavern.getContext().saveSettingsDebounced();$(this).closest('.lumi-memory-card').fadeOut(200,()=>{if(!$('.lumi-memory-card').length)loadAndRenderTimeline();});}});
}
function debounce(func,wait){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>func(...a),wait);};}

function renderDiarySettingsInModal() {
    const s=extension_settings[extensionName].diary;
    $('#lumi-modal-title').text('⚙️ Diary Settings');
    $('#lumi-modal-body').html(`<div style="padding:16px;"><div class="lumi-settings-section"><h4>🌍 โหมดโลก</h4><select id="lumi-wm"><option value="auto" ${s.worldMode==='auto'?'selected':''}>🤖 อัตโนมัติ</option><option value="solo" ${s.worldMode==='solo'?'selected':''}>👤 เดี่ยว</option><option value="rpg" ${s.worldMode==='rpg'?'selected':''}>🌐 RPG</option></select></div><div class="lumi-settings-section"><h4>⚙️ เจนอัตโนมัติ</h4><label class="checkbox_label"><input type="checkbox" id="lumi-age" ${s.autoGen.enabled?'checked':''}><span>เปิดใช้งาน</span></label><div class="lumi-sub-settings"><label>ทริกเกอร์:</label><select id="lumi-tt"><option value="turn_count" ${s.autoGen.triggerType==='turn_count'?'selected':''}>🔢 ทุก X ข้อความ</option><option value="emotion" ${s.autoGen.triggerType==='emotion'?'selected':''}>💬 คำอารมณ์</option><option value="random" ${s.autoGen.triggerType==='random'?'selected':''}>🎲 สุ่ม</option></select><div id="lumi-tw" style="display:${s.autoGen.triggerType==='turn_count'?'block':'none'}"><label>เจนทุก <input type="number" id="lumi-ti" value="${s.autoGen.turnInterval}" min="5" max="100"> ข้อความ</label></div><div id="lumi-ew" style="display:${s.autoGen.triggerType==='emotion'?'block':'none'}"><label>คำ: <input type="text" id="lumi-ek" value="${s.autoGen.emotionKeywords.join(',')}" placeholder="รัก,โกรธ"></label></div></div></div><div class="lumi-settings-section"><h4>🔒 ความลับ</h4><label class="checkbox_label"><input type="checkbox" id="lumi-ss" ${s.display.showSecret?'checked':''}><span>แสดงภาพซ้อน</span></label><label style="margin-top:8px;display:block;">ปลดล็อก:</label><select id="lumi-sm"><option value="affection" ${s.display.secretUnlockMode==='affection'?'selected':''}>❤️ ความสัมพันธ์ ≥80</option><option value="event" ${s.display.secretUnlockMode==='event'?'selected':''}>🎉 3 วันหลังเกิด</option><option value="manual" ${s.display.secretUnlockMode==='manual'?'selected':''}>✋ แมนนวล</option></select></div><div class="lumi-settings-section"><h4>🗂️ จัดการ</h4><label>เก็บสูงสุด <input type="number" id="lumi-me" value="${s.storage.maxEntries}" min="10" max="200"> รายการ</label><div style="margin-top:12px;"><button id="lumi-exp" class="lumi-btn-small">📤 Export</button><button id="lumi-clr" class="lumi-btn-small danger">🗑️ ล้าง</button><button id="lumi-rst-pos" class="lumi-btn-small">📍 รีเซ็ตตำแหน่งปุ่ม</button></div></div><div style="text-align:center;margin-top:20px;"><button id="lumi-sav" class="lumi-btn-gen" style="padding:10px 40px;">💾 บันทึก</button></div></div>`);
    $('#lumi-tt').on('change',function(){$('#lumi-tw').toggle($(this).val()==='turn_count');$('#lumi-ew').toggle($(this).val()==='emotion');});
    $('#lumi-sav').on('click',()=>{const s=extension_settings[extensionName].diary;s.worldMode=$('#lumi-wm').val();s.autoGen.enabled=$('#lumi-age').prop('checked');s.autoGen.triggerType=$('#lumi-tt').val();s.autoGen.turnInterval=parseInt($('#lumi-ti').val())||20;s.autoGen.emotionKeywords=$('#lumi-ek').val().split(',').map(k=>k.trim()).filter(k=>k);s.display.showSecret=$('#lumi-ss').prop('checked');s.display.secretUnlockMode=$('#lumi-sm').val();s.storage.maxEntries=parseInt($('#lumi-me').val())||40;SillyTavern.getContext().saveSettingsDebounced();extension_settings[extensionName]._internal.messageCounter=0;showToast('✅ บันทึกแล้ว','success');setTimeout(()=>renderDiaryUI(),500);});
    $('#lumi-exp').on('click',()=>{const b=new Blob([JSON.stringify(extension_settings[extensionName].memories,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`lumi-mem-${Date.now()}.json`;a.click();showToast('📤 Export เสร็จ','success');});
    $('#lumi-clr').on('click',()=>{if(confirm('ล้างทั้งหมด?')){extension_settings[extensionName].memories=[];SillyTavern.getContext().saveSettingsDebounced();showToast('🗑️ ล้างแล้ว','success');setTimeout(()=>renderDiaryUI(),500);}});
    $('#lumi-rst-pos').on('click',()=>{const fab=$('#lumi-main-fab');if(fab.length){fab.css({top:'50%',right:'15px',bottom:'auto',left:'auto'});showToast('📍 รีเซ็ตแล้ว','success');}else{spawnLumiButton();showToast('📍 สร้างใหม่แล้ว','success');}});
}

// ═══════════════════════════════════════════════
// 🛡️ FAB BUTTON (กู้คืนโครงสร้างเดิม + ตำแหน่งกึ่งกลางขอบขวา)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    console.log("[LumiPulse] 🔄 สร้างปุ่มลอย...");
    
    if (!document.body) { console.warn("[LumiPulse] ⚠️ body ไม่พร้อม รอแล้วสร้างใหม่"); setTimeout(spawnLumiButton, 1000); return; }

    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    // ตำแหน่งเริ่มต้น: กึ่งกลางขอบขวา ตามที่ขอ
    fab.style.top = '50%';
    fab.style.right = '15px';
    fab.style.transform = 'translateY(-50%)';
    document.body.appendChild(fab);
    
    // บังคับแสดงผลทันที
    fab.style.display = 'flex';
    fab.style.visibility = 'visible';
    fab.style.opacity = '1';

    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon" alt="diary"><span class="lumi-menu-text">Memories</span></div>
            <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon" alt="forum"><span class="lumi-menu-text">Forum</span></div>
        </div>
        <div class="lumi-branding">LumiPulse</div>
    `;
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
        const onMove = ev => { const dx=ev.clientX-dragStart.x, dy=ev.clientY-dragStart.y; if(Math.sqrt(dx*dx+dy*dy)>THRESHOLD){isDragging=true; $(menu).fadeOut(100);} if(!isDragging)return; let x=Math.max(0,Math.min(ev.clientX-mouseOffset.x,window.innerWidth-50)), y=Math.max(0,Math.min(ev.clientY-mouseOffset.y,window.innerHeight-50)); fab.style.left=x+'px'; fab.style.top=y+'px'; fab.style.right='auto'; fab.style.transform='none'; updateMenuPos(); };
        const onUp = ev => { document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); fab.classList.add('lumi-floating'); fab.style.top='50%'; fab.style.right='15px'; fab.style.left='auto'; fab.style.transform='translateY(-50%)'; if(!isDragging){clearTimeout(tapTimer); tapTimer=setTimeout(()=>{updateMenuPos(); $(menu).fadeToggle(300); spawnHeartEffect({...ev, _fromDrag:false});},50);} isDragging=false; };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });

    fab.addEventListener('touchstart', e => {
        isTouchDrag=false; fab.classList.remove('lumi-floating');
        const t=e.touches[0], r=fab.getBoundingClientRect(); touchOffset.x=t.clientX-r.left; touchOffset.y=t.clientY-r.top; dragStart.x=t.clientX; dragStart.y=t.clientY;
    }, {passive:false});
    fab.addEventListener('touchmove', e => {
        e.preventDefault(); const t=e.touches[0]; const dx=t.clientX-dragStart.x, dy=t.clientY-dragStart.y;
        if(Math.sqrt(dx*dx+dy*dy)>THRESHOLD){isTouchDrag=true; $(menu).fadeOut(100);}
        if(!isTouchDrag)return; let x=Math.max(0,Math.min(t.clientX-touchOffset.x,window.innerWidth-50)), y=Math.max(0,Math.min(t.clientY-touchOffset.y,window.innerHeight-50)); fab.style.left=x+'px'; fab.style.top=y+'px'; fab.style.right='auto'; fab.style.transform='none'; updateMenuPos();
    }, {passive:false});
    fab.addEventListener('touchend', e => {
        fab.classList.add('lumi-floating'); fab.style.top='50%'; fab.style.right='15px'; fab.style.left='auto'; fab.style.transform='translateY(-50%)';
        if(!isTouchDrag){clearTimeout(tapTimer); tapTimer=setTimeout(()=>{updateMenuPos(); $(menu).fadeToggle(300); const t=e.changedTouches?.[0]; if(t)spawnHeartEffect({_fromDrag:false, clientX:t.clientX, clientY:t.clientY});},50);}
        isTouchDrag=false;
    });

    $(document).off('click','#lumi-diary').on('click','#lumi-diary',()=>openLumiModal('diary'))
               .off('click','#lumi-forum').on('click','#lumi-forum',()=>openLumiModal('forum'));
}

// ═══════════════════════════════════════════════
// SETTINGS PANEL (ในหน้า Extension)
// ═══════════════════════════════════════════════
function createSettingsUI() {
    if ($('#lumi-settings-drawer').length) return;
    const s = extension_settings[extensionName].diary;
    const ag = s.autoGen;
    $('#extensions_settings').append(`
        <div id="lumi-settings-drawer" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b style="color:#ff85a2; font-family:'Mitr'; font-weight:300;">🌸 LumiPulse Hub</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="font-family:'Mitr'; font-weight:300; padding: 10px 0; display: none;">
                <div style="margin-bottom: 12px;">
                    <label class="checkbox_label"><input id="lumi_enable_toggle" type="checkbox" ${extension_settings[extensionName].isEnabled ? 'checked' : ''} /><span>เปิดใช้งาน LumiPulse</span></label>
                </div>
                <div style="font-size: 11px; color: #ffb6c1; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">การตั้งค่าทั่วไป</div>
                <div style="margin-bottom: 8px;">
                    <label style="font-size: 12px; color: #aaa;">โหมดโลก</label>
                    <select id="lumi_world_mode" class="text_pole" style="width: 100%; margin-top: 4px;">
                        <option value="auto" ${s.worldMode==='auto'?'selected':''}>🤖 อัตโนมัติ</option><option value="solo" ${s.worldMode==='solo'?'selected':''}>👤 เดี่ยว</option><option value="rpg" ${s.worldMode==='rpg'?'selected':''}>🌐 RPG</option>
                    </select>
                </div>
                <div style="margin-bottom: 8px;">
                    <label class="checkbox_label" style="font-size: 12px; color: #aaa;"><input id="lumi_autogen_toggle" type="checkbox" ${ag.enabled ? 'checked' : ''} /><span>เจนไดอารี่อัตโนมัติ</span></label>
                </div>
                <div id="lumi_autogen_options" style="display: ${ag.enabled ? 'block' : 'none'}; margin-left: 15px; margin-bottom: 10px;">
                    <label style="font-size: 11px; color: #888;">ทริกเกอร์:</label>
                    <select id="lumi_trigger_type" class="text_pole" style="width: 100%; margin: 4px 0;">
                        <option value="turn_count" ${ag.triggerType==='turn_count'?'selected':''}>🔢 ทุก X ข้อความ</option><option value="emotion" ${ag.triggerType==='emotion'?'selected':''}>💬 คำอารมณ์</option><option value="random" ${ag.triggerType==='random'?'selected':''}>🎲 สุ่ม</option>
                    </select>
                    <div id="lumi_turn_interval_wrap" style="display: ${ag.triggerType==='turn_count'?'block':'none'}; margin-top: 4px;"><input id="lumi_turn_interval" type="number" value="${ag.turnInterval}" min="5" max="100" class="text_pole" style="width: 60px;"> <span style="font-size: 11px; color: #888;">ข้อความ</span></div>
                </div>
                <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                    <button id="lumi_reset_fab" class="menu_button" style="width: 100%; margin-bottom: 5px;">📍 รีเซ็ตตำแหน่งปุ่มลอย</button>
                    <button id="lumi_clear_memories" class="menu_button" style="width: 100%; color: #ff6b6b;">🗑️ ล้างความทรงจำ</button>
                </div>
            </div>
        </div>
    `);

    $('#lumi_enable_toggle').on('change', function() {
        extension_settings[extensionName].isEnabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced();
        if(extension_settings[extensionName].isEnabled) { setTimeout(() => { spawnLumiButton(); createContentModal(); setupAutoTriggerListener(); }, 500); }
        else { $('#lumi-main-fab,.lumi-menu-container,#lumi-modal-overlay').remove(); $(document).off('messageReceived', onNewChat); }
    });
    $('#lumi_world_mode').on('change', function() { extension_settings[extensionName].diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi_autogen_toggle').on('change', function() { extension_settings[extensionName].diary.autoGen.enabled = $(this).prop('checked'); $('#lumi_autogen_options').toggle($(this).prop('checked')); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi_trigger_type').on('change', function() { extension_settings[extensionName].diary.autoGen.triggerType = $(this).val(); $('#lumi_turn_interval_wrap').toggle($(this).val() === 'turn_count'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi_turn_interval').on('change', function() { extension_settings[extensionName].diary.autoGen.turnInterval = parseInt($(this).val()) || 20; SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi_reset_fab').on('click', function() { const fab=$('#lumi-main-fab'); if(fab.length){fab.css({top:'50%',right:'15px',bottom:'auto',left:'auto',transform:'translateY(-50%)'}).show(); showToast('📍 รีเซ็ตตำแหน่งแล้ว','success');} else { spawnLumiButton(); showToast('📍 สร้างปุ่มใหม่แล้ว','success'); } });
    $('#lumi_clear_memories').on('click', function() { if(confirm('ล้างความทรงจำทั้งหมด?')){ extension_settings[extensionName].memories=[]; SillyTavern.getContext().saveSettingsDebounced(); showToast('🗑️ ล้างแล้ว','success'); } });
}

function showToast(m,t='info'){if(typeof toastr!=='undefined')toastr[t](m,'🌸 LumiPulse');}
