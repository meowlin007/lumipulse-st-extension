"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: true,
    forumTopic: "",
    isForumInitialized: false,
    includeRandomNPCs: true,
    forumData: [],
    diaryData: null,
    diary: {
        worldMode: 'auto',
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก', 'โกรธ', 'เสียใจ', 'ดีใจ', 'ตกใจ', 'หัวใจ', 'ชอบ'], randomChance: 0.1 },
        display: { showSecret: true, secretUnlockMode: 'affection' },
        storage: { maxEntries: 50, autoSave: true }
    },
    memories: [],
    _internal: { messageCounter: 0, firstChatDate: null }
};
let extension_settings = {};

const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart    = `<svg viewBox="0 0 32 32" fill="none"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1" stroke="#FFB6C1" stroke-width="1.5"/></svg>`;
const svgSettings = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="#FFB6C1" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgStarEmpty= `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="#FF85A2" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`;
const svgLink     = `<svg viewBox="0 0 24 24" fill="none" stroke="#FF85A2" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════
jQuery(() => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext) {
            clearInterval(boot);
            initLumiPulse();
        }
    }, 1000);
});

function initLumiPulse() {
    const ctx = SillyTavern.getContext();
    if (!ctx.extensionSettings[extensionName]) {
        ctx.extensionSettings[extensionName] = { ...defaultSettings };        ctx.saveSettingsDebounced();
    }
    const s = ctx.extensionSettings[extensionName];
    if (!s.diary) s.diary = { ...defaultSettings.diary };
    if (!s.memories) s.memories = [];
    if (!s._internal) s._internal = { ...defaultSettings._internal };
    if (s.diaryData && !s.memories.length) {
        s.memories.push({ id:"mem_legacy_"+Date.now(), timestamp:new Date().toISOString(), trigger:"legacy", character:getCharacterName(), characterId:ctx.characterId, worldMode:'solo', linkedCharacters:[], content:{...s.diaryData}, meta:{isFavorite:false,isPinned:false,isHidden:false,isSecret:false,unlockCondition:null,tags:["#นำเข้า"],relatedMessages:[]} });
        s.diaryData = null; ctx.saveSettingsDebounced();
    }
    extension_settings = ctx.extensionSettings;
    injectStyles(); createSettingsUI();
    if (extension_settings[extensionName].isEnabled) {
        setTimeout(() => { spawnLumiButton(); createContentModal(); setupAutoTriggerListener(); console.log('[LumiPulse] ✅ Ready'); }, 1200);
    }
    document.addEventListener('click', e => { if (!e._fromDrag) spawnHeartEffect(e); });
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [];
    const chars = new Set();
    chat.slice(-50).forEach(m => { if (m.name && !m.is_user && !m.is_system) chars.add(m.name); });
    return chars.size > 2 ? 'rpg' : 'solo';
}
function getChatNPCs(limit = 5) {
    const chat = SillyTavern.getContext().chat || [], names = new Set(), cn = getCharacterName();
    chat.slice(-40).forEach(m => { if (m.name && !m.is_user && !m.is_system && m.name !== cn) names.add(m.name); });
    return [...names].slice(0, limit);
}
function checkForSpecialEvent(cn, cd) {
    const today = new Date(), d = cd?.description || '', n = cd?.data?.creator_notes || '';
    const b = (d+n).match(/birthday[:\s]+(\d{1,2})[\/\-](\d{1,2})/i);
    if (b) { const [,dy,mo]=b; if(today.getDate()==dy && today.getMonth()+1==mo) return {type:'birthday',label:'🎂 วันเกิด',isSecret:false,promptBoost:`Today is ${cn}'s birthday!`}; }
    const fd = extension_settings[extensionName]._internal.firstChatDate;
    if (fd) { const days=Math.floor((today-new Date(fd))/864e5); if([30,100,365].includes(days)) return {type:`anniv_${days}`,label:`💕 ครบ ${days} วัน`,isSecret:days>=100,promptBoost:`It's been ${days} days...`}; }
    if (today.getDate()<=3) { const m=today.getMonth(); const s=m<3?'❄️หน้าหนาว':m<6?'🌸หน้าใบไม้ผลิ':m<9?'☀️หน้าร้อน':'🍁หน้าใบไม้ร่วง'; return {type:`season_${m}`,label:`🗓️ ${s}`,isSecret:false,promptBoost:`New season ${s} has begun.`}; }
    return null;
}
function extractTags(txt) {
    const tags=[], kw={'#โรแมนติก':['รัก','หัวใจ','ชอบ','แอบชอบ','#ดราม่า':['เสียใจ','ร้องไห้','เจ็บ','#ตลก':['ขำ','ตลก','555','#จุดเปลี่ยน':['เริ่ม','ตัดสินใจ','เปลี่ยน','#อบอุ่น':['อบอุ่น','ขอบคุณ','สุข']};
    const low=txt.toLowerCase(); for(const[t,w]of Object.entries(kw)) if(w.some(k=>low.includes(k))) tags.push(t); return tags.slice(0,3);
}
function checkUnlock(m) {
    if(!m.meta.isSecret) return true;
    const cfg=extension_settings[extensionName].diary.display;
    if(cfg.secretUnlockMode==='manual') return false;
    if(cfg.secretUnlockMode==='affection') return (m.content.affection_score||0)>=(m.meta.unlockCondition?.value||80);    return (Date.now()-new Date(m.timestamp))/864e5>=3;
}
function saveMemory(e) {
    const s=extension_settings[extensionName]; s.memories.unshift(e);
    if(s.memories.length>s.diary.storage.maxEntries) s.memories=s.memories.slice(0,s.diary.storage.maxEntries);
    SillyTavern.getContext().saveSettingsDebounced();
}
function loadMemories(f={}) {
    let m=[...(extension_settings[extensionName].memories||[])];
    if(f.character) m=m.filter(x=>x.character===f.character);
    if(f.worldMode) m=m.filter(x=>x.worldMode===f.worldMode);
    if(f.showSecret===false) m=m.filter(x=>!x.meta.isSecret||checkUnlock(x));
    if(f.search) { const q=f.search.toLowerCase(); m=m.filter(x=>x.content.diary?.toLowerCase().includes(q)||x.content.mood?.toLowerCase().includes(q)||x.meta.tags?.some(t=>t.toLowerCase().includes(q))); }
    // ปักหมุดขึ้นก่อน -> เรียงตามเวลา
    m.sort((a,b)=>(b.meta.isPinned===a.meta.isPinned?0:b.meta.isPinned?1:-1)||new Date(b.timestamp)-new Date(a.timestamp));
    return m;
}
function formatRPDate(d) { return d?.length>10 ? d : 'ไม่ระบุ'; }
function getMoodEmoji(m) { return {'ตื่นเต้น':'😳','ดีใจ':'😊','อบอุ่น':'🥰','รัก':'💖','เสียใจ':'😢','โกรธ':'😠','สับสน':'😕','แปลกหน้า':'😶','เพื่อน':'🤝','สนิท':'💕'}[m]||'🌸'; }
function getCharacterName() { return SillyTavern.getContext().name2||"ตัวละคร"; }
function getUserName() { return SillyTavern.getContext().name1||"ผู้เล่น"; }
function getRecentChat(l=30) { return (SillyTavern.getContext().chat||[]).slice(-l).map(m=>`${m.is_user?getUserName():getCharacterName()}: ${(m.mes||"").slice(0,200)}`).join("\n"); }
function escapeHtml(s) { if(typeof s!=='string') return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ═══════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════
function parseJSON(text) {
    if(!text||typeof text!=='string') return null;
    let m=text.match(/\{[\s\S]*\}/); if(m) try{return JSON.parse(m[0]);}catch(_){}
    m=text.match(/\[[\s\S]*\]/); if(m) try{return JSON.parse(m[0]);}catch(_){}
    toastr.warning('AI ตอบผิดรูปแบบ 🌸'); return null;
}
async function callST(prompt) {
    try {
        const ctx=SillyTavern.getContext(); let r;
        if(typeof ctx.generateQuietPrompt==='function') r=await ctx.generateQuietPrompt(prompt,false,false);
        else if(typeof ctx.generateRaw==='function') r=await ctx.generateRaw(prompt,true);
        else if(typeof window.generateQuietPrompt==='function') r=await window.generateQuietPrompt(prompt,false,false);
        else if(typeof window.generateRaw==='function') r=await window.generateRaw(prompt,true);
        else { toastr.error('ไม่พบฟังก์ชันเจน'); return null; }
        return parseJSON(r);
    } catch(e) { console.error('[Lumi] AI:',e); toastr.error('AI Error'); return null; }
}
async function requestAIGeneration(topic, npcs, rnd) {
    return await callST(`[System: JSON array only. Topic: "${topic}" | Chars: ${npcs.join(',')} | ${rnd?'can create new':'strict'}]
Generate 4 Thai social posts. Format: [{"author":"","content":"","likes":12,"time":"5m ago"}]`);
}
async function requestDiaryGeneration(opt={}) {
    const {char=getCharacterName(), trigger='manual', event=null, linked=[]} = opt;    const ctx=SillyTavern.getContext(), cd=ctx.characters?.[ctx.characterId]||{};
    let wm=extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm=detectWorldMode();
    const evNote=event?`\n🎉 Event: ${event.label} - ${event.promptBoost}`:'';
    const prompt=`[System: You are ${char}'s inner voice. JSON ONLY.
Profile: ${cd.data?.personality||'Expressive'} | World: ${wm==='rpg'?'Group':'Solo'}
Chat:\n${getRecentChat(30)}\n${evNote}
Infer RP date, location, weather from context. Output ONLY:
{"rp_date":"วันที่ใน RP (เช่น 'เช้าวันจันทร์ที่ 12 เดือนหยก')","rp_location":"สถานที่ใน RP","rp_weather":"สภาพอากาศใน RP","affection_score":0-100,"mood":"อารมณ์เดียว","diary":"เนื้อหาไดอารี่ 3-5 ประโยค มุมมองบุคคลที่1 ภาษาไทยธรรมชาติ"}`;
    return await callST(prompt);
}

// ═══════════════════════════════════════════════
// AUTO-TRIGGER & COMMANDS
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).on('messageReceived', onNewMsg);
    $(document).on('activeCharacterChanged', ()=>{ extension_settings[extensionName]._internal.messageCounter=0; SillyTavern.getContext().saveSettingsDebounced(); if(!extension_settings[extensionName]._internal.firstChatDate){extension_settings[extensionName]._internal.firstChatDate=new Date().toISOString(); SillyTavern.getContext().saveSettingsDebounced();}});
}
async function onNewMsg() {
    const s=extension_settings[extensionName], cfg=s.diary.autoGen;
    if(!cfg.enabled) return;
    s._internal.messageCounter++;
    let gen=false, type=null;
    const chat=SillyTavern.getContext().chat||[]; const last=chat[chat.length-1];
    if(cfg.triggerType==='turn_count'&&s._internal.messageCounter>=cfg.turnInterval){gen=true;type='turn_count';s._internal.messageCounter=0;}
    else if(cfg.triggerType==='emotion'){const txt=(last?.mes||'').toLowerCase();if(cfg.emotionKeywords.some(k=>txt.includes(k))){gen=true;type='emotion_detected';}}
    else if(cfg.triggerType==='random'&&Math.random()<cfg.randomChance){gen=true;type='random';}
    if(last?.is_user && (last.mes?.includes('#จำ')||last.mes?.includes('#diary')||last.mes?.includes('#บันทึก'))){gen=true;type='user_command';}
    
    if(gen) {
        SillyTavern.getContext().saveSettingsDebounced();
        const ctx=SillyTavern.getContext(), ev=checkForSpecialEvent(getCharacterName(),ctx.characters?.[ctx.characterId]);
        if(ev) type=`evt_${ev.type}`;
        let wm=s.diary.worldMode; if(wm==='auto') wm=detectWorldMode();
        const res=await requestDiaryGeneration({trigger:type,event:ev,linked:wm==='rpg'?getChatNPCs(3):[]});
        if(res) {
            const entry={id:"mem_"+Date.now(),timestamp:new Date().toISOString(),trigger:type,character:getCharacterName(),characterId:ctx.characterId,worldMode:wm,linkedCharacters:wm==='rpg'?getChatNPCs(3):[],content:{...res,eventType:ev?.type},meta:{isFavorite:false,isPinned:false,isHidden:false,isSecret:ev?.isSecret,unlockCondition:ev?{type:s.diary.display.secretUnlockMode,value:80}:null,tags:extractTags(res.diary),relatedMessages:chat.length>0?[chat.length-1]:[]}};
            saveMemory(entry);
            showToast(`🌸 ${entry.character} มีความทรงจำใหม่: "${res.mood}"`);
        }
    }
}

// ═══════════════════════════════════════════════
// STYLES (Glass FAB + Clean Settings + RP UI)
// ═══════════════════════════════════════════════
function injectStyles() {
    if($('#lumi-styles').length) return;
    const s=document.createElement('style'); s.id='lumi-styles';
    s.innerHTML=`    @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
    :root{--lp-pink:#FFB6C1;--lp-pink-soft:#FFF0F5;--lp-glass:rgba(255,240,245,0.88);--lp-shadow:0 8px 24px rgba(255,105,180,0.15);--lp-ease:cubic-bezier(.4,0,.2,1);}
    @keyframes lpPop{0%{opacity:0;transform:scale(.9) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes lpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes lpHeart{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-120px) scale(1.8)}}
    
    .lumi-heart{position:fixed;z-index:99999;pointer-events:none;width:28px;height:28px;animation:lpHeart .8s ease-out forwards}
    #lumi-main-fab{position:fixed!important;z-index:99998!important;width:44px;height:44px;cursor:grab;touch-action:none;user-select:none;display:flex!important;align-items:center;justify-content:center;background:var(--lp-glass)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1.5px solid rgba(255,182,193,.5);border-radius:50%;box-shadow:var(--lp-shadow);will-change:transform;transform:translateZ(0);transition:transform .2s var(--lp-ease)}
    #lumi-main-fab:active{cursor:grabbing;transform:scale(.92)}
    #lumi-main-fab img{width:22px;height:22px;pointer-events:none;opacity:.85}
    .lumi-menu{position:fixed;z-index:99997;display:none;background:rgba(255,255,255,.98);backdrop-filter:blur(20px);border-radius:24px;padding:18px;border:1px solid rgba(255,182,193,.3);box-shadow:var(--lp-shadow);font-family:'Mitr',sans-serif}
    .lumi-menu-grid{display:flex;gap:18px;justify-content:center}
    .lumi-mi{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:transform .2s}
    .lumi-mi:hover{transform:translateY(-4px)}
    .lumi-mi img{width:44px;height:44px;object-fit:contain}
    .lumi-mt{font-size:11px;color:#ff85a2}
    .lumi-brand{text-align:center;margin-top:12px;font-size:9px;color:#ffb6c1;letter-spacing:2px}
    
    .lumi-overlay{position:fixed;inset:0;background:rgba(0,0,0,.15);backdrop-filter:blur(12px);z-index:99996;display:none;align-items:center;justify-content:center}
    .lumi-box{width:92%;max-width:440px;height:80vh;background:#fff;border-radius:28px;border:1px solid #FFD1DC;box-shadow:var(--lp-shadow);display:flex;flex-direction:column;overflow:hidden;font-family:'Mitr',sans-serif;animation:lpPop .3s var(--lp-ease)}
    .lumi-hd{padding:18px;text-align:center;color:#ff85a2;border-bottom:1px solid #FFF0F5;position:relative;font-size:16px;font-weight:400}
    .lumi-close{position:absolute;right:16px;top:16px;width:28px;height:28px;background:#FFF0F5;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ff85a2;font-size:16px}
    .lumi-opt{position:absolute;left:16px;top:16px;width:28px;height:28px;color:#ffb6c1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.3s}
    .lumi-opt:hover{transform:rotate(45deg)}
    .lumi-body{flex:1;overflow-y:auto;padding:16px}
    
    .lp-btn{background:linear-gradient(135deg,#FFB6C1,#FF85A2);color:#fff;border:none;padding:10px 32px;border-radius:20px;font-family:'Mitr';cursor:pointer;transition:opacity .2s;font-size:13px}
    .lp-btn:hover{opacity:.85}
    .lp-input{width:100%;background:#FFF9FA;border:1px solid #FFD1DC;border-radius:16px;padding:10px;color:#ff85a2;font-family:'Mitr';text-align:center;outline:none;font-size:13px;box-sizing:border-box}
    .lp-card{background:#fff;border-radius:20px;padding:16px;margin-bottom:14px;border:1px solid #FFE8EE;box-shadow:0 4px 12px rgba(0,0,0,.02);transition:transform .2s,box-shadow .2s}
    .lp-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(255,182,193,.12)}
    .lp-card.locked{opacity:.7;background:#FFF5F7;pointer-events:none}
    .lp-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
    .lp-char{font-weight:500;color:#444;font-size:14px}
    .lp-time{font-size:10px;color:#ccc}
    .lp-rp-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
    .lp-badge{font-size:9px;padding:3px 8px;border-radius:10px;background:#FFF0F5;color:#ff85a2}
    .lp-mood{display:flex;align-items:center;gap:6px;font-size:11px;color:#666;margin-bottom:6px}
    .lp-diary{font-size:13px;color:#555;line-height:1.6;white-space:pre-wrap;margin-bottom:10px}
    .lp-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
    .lp-tag{font-size:9px;padding:2px 7px;border-radius:9px;background:#FFF0F5;color:#ff85a2}
    .lp-acts{display:flex;gap:6px;justify-content:flex-end;border-top:1px solid #FFE8EE;padding-top:8px}
    .lp-icon{width:28px;height:28px;border-radius:50%;border:none;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;color:#ffb6c1}
    .lp-icon:hover{background:#FFF0F5;transform:scale(1.1)}
    .lp-icon.active{color:#FFD700}
    .lp-icon.danger:hover{background:#FFE0E0;color:#ff6b6b}
    
    .lp-set-sec{background:#fff;border-radius:20px;padding:16px;margin-bottom:14px;border:1px solid #FFE8EE}
    .lp-set-t{font-size:14px;color:#ff85a2;margin-bottom:10px;font-weight:500;display:flex;align-items:center;gap:6px}
    .lp-row{margin-bottom:10px}    .lp-row label{font-size:12px;color:#666;display:block;margin-bottom:4px}
    .lp-row input,.lp-row select{width:100%;padding:8px 12px;border:1px solid #FFD1DC;border-radius:14px;background:#FFF9FA;color:#ff85a2;font-family:'Mitr';font-size:12px;outline:none}
    
    /* Toggle Switch CSS */
    .lp-switch{position:relative;width:44px;height:24px;display:inline-block}
    .lp-switch input{opacity:0;width:0;height:0}
    .lp-switch .sl{position:absolute;cursor:pointer;inset:0;background:#ddd;border-radius:24px;transition:.3s}
    .lp-switch .sl:before{content:"";position:absolute;height:20px;width:20px;left:2px;bottom:2px;background:#fff;transition:.3s;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.1)}
    .lp-switch input:checked+.sl{background:#FF85A2}
    .lp-switch input:checked+.sl:before{transform:translateX(20px)}
    
    .lp-filter{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
    .lp-sel{flex:1;min-width:100px;padding:8px 10px;border:1px solid #FFD1DC;border-radius:14px;background:#fff;color:#ff85a2;font-family:'Mitr';font-size:11px}
    .lp-search{flex:2;min-width:120px;padding:8px 10px;border:1px solid #FFD1DC;border-radius:14px;background:#fff;color:#666;font-family:'Mitr';font-size:11px}
    
    .lp-empty{text-align:center;color:#ffb6c1;padding:40px 20px;font-size:13px}
    .lp-locked-ov{position:absolute;inset:0;background:rgba(255,255,255,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;z-index:2}
    .lp-locked-t{font-size:11px;color:#ffb6c1;text-align:center}
    @media(max-width:768px){#lumi-main-fab{width:42px;height:42px} .lumi-box{width:96%;height:85vh}}
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// HEART & MODAL
// ═══════════════════════════════════════════════
function spawnHeartEffect(e){const h=document.createElement('div');h.className='lumi-heart';h.innerHTML=svgHeart;h.style.left=e.clientX+'px';h.style.top=e.clientY+'px';document.body.appendChild(h);setTimeout(()=>h.remove(),800);}
function openLumi(type){$('.lumi-menu').fadeOut(200);$('#lp-ov').css('display','flex').hide().fadeIn(300);if(type==='forum')renderForum();else if(type==='diary')renderDiary();else{$('#lp-hd').text('📱 Phone');$('#lp-body').html('<div style="text-align:center;color:#ffb6c1;padding:40px;"><img src="'+iconPhone+'" style="width:60px;opacity:.6"><div style="margin-top:10px">Coming Soon 🌸</div></div>');$('.lp-opt').hide();}}

// ═══════════════════════════════════════════════
// FORUM
// ═══════════════════════════════════════════════
function renderForum(){const s=extension_settings[extensionName],b=$('#lp-body');b.empty();$('#lp-hd').text('Social Forum');if(!s.isForumInitialized){$('.lp-opt').hide();b.html(`<div style="display:flex;flex-direction:column;align-items:center;gap:12px;height:100%;justify-content:center"><img src="${iconForum}" style="width:60px"><div style="color:#ff85a2">ระบุหัวข้อฟอรั่ม</div><input id="lp-ft" class="lp-input" placeholder="เช่น มหาวิทยาลัยเวทมนตร์" value="${escapeHtml(s.forumTopic)}"><button id="lp-fg" class="lp-btn">เริ่มสร้าง ✨</button></div>`);$('#lp-fg').on('click',()=>{const t=$('#lp-ft').val().trim();if(!t){toastr.warning("ใส่หัวข้อก่อน 🌸");return;}s.forumTopic=t;s.isForumInitialized=true;s.forumData=[];SillyTavern.getContext().saveSettingsDebounced();renderForum();});}else{$('.lp-opt').show();if(!s.forumData?.length){b.html('<div style="text-align:center;padding:40px;color:#ff85a2">AI กำลังประมวลผล... ⏳</div>');requestAIGeneration(s.forumTopic,getChatNPCs(),true).then(p=>{if(!p?.length){s.isForumInitialized=false;SillyTavern.getContext().saveSettingsDebounced();renderForum();return;}s.forumData=p;SillyTavern.getContext().saveSettingsDebounced();renderForum();});}else{b.html(`<div style="text-align:center;margin-bottom:12px;font-size:11px;color:#ffb6c1;letter-spacing:2px">${escapeHtml(s.forumTopic.toUpperCase())}</div>`);s.forumData.forEach((p,i)=>{b.append(`<div class="lp-card" style="animation-delay:${i*.08}s"><div class="lp-hdr"><div style="display:flex;gap:8px;align-items:center"><div style="width:36px;height:36px;border-radius:50%;background:#FFF0F5;color:#ff85a2;display:flex;align-items:center;justify-content:center;font-size:14px">${(p.author||'?')[0]}</div><div><div style="font-weight:500;color:#444;font-size:13px">${escapeHtml(p.author||'Unknown')}</div><div style="font-size:9px;color:#ccc">${escapeHtml(p.time||'now')}</div></div></div></div><div style="font-size:13px;color:#555;margin-top:6px">${escapeHtml(p.content||'')}</div><div style="margin-top:6px;color:#ffb6c1;font-size:11px">❤️ ${p.likes||0} Likes</div></div>`);});b.append(`<div style="text-align:center;margin-top:12px"><button id="lp-fr" class="lp-btn" style="padding:8px 24px;font-size:11px">🔄 Refresh</button></div>`);$('#lp-fr').on('click',()=>{s.forumData=[];SillyTavern.getContext().saveSettingsDebounced();renderForum();});}}}

// ═══════════════════════════════════════════════
// DIARY 2.0 (RP Date, Pins, Link)
// ═══════════════════════════════════════════════
function renderDiary(){const s=extension_settings[extensionName],b=$('#lp-body'),cn=getCharacterName();$('#lp-hd').text(`📖 ${cn}'s Memories`);$('.lp-opt').show();b.html(`<div class="lp-filter"><select id="lp-fc" class="lp-sel"><option value="">👤 ทุกตัว</option>${[cn,...getChatNPCs(5)].filter((v,i,a)=>a.indexOf(v)===i).map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select><select id="lp-fm" class="lp-sel"><option value="">🌍 โหมด</option><option value="solo">👤 Solo</option><option value="rpg">🌐 RPG</option></select><input id="lp-fs" class="lp-search" placeholder="🔍 ค้นหา..."></div><div style="text-align:center;margin-bottom:12px"><button id="lp-manual-gen" class="lp-btn" style="padding:8px 24px;font-size:11px">✨ บันทึกความทรงจำตอนนี้</button></div><div id="lp-tl" style="padding-bottom:10px"></div>`);loadTimeline();$('#lp-fc,#lp-fm,#lp-fs').on('change keyup',debounce(loadTimeline,250));$('#lp-manual-gen').on('click',()=>manualGen());$('.lp-opt').off('click').on('click',()=>renderSettings());}

function loadTimeline(){const f={character:$('#lp-fc').val()||null,worldMode:$('#lp-fm').val()||null,showSecret:extension_settings[extensionName].diary.display.showSecret,search:$('#lp-fs').val()||null};const m=loadMemories(f);const p=$('#lp-tl');if(!m.length){p.html('<div class="lp-empty"><div style="font-size:32px;margin-bottom:8px;opacity:.6">📭</div>ยังไม่มีบันทึก<br><span style="font-size:11px;color:#ccc">ระบบจะเจนอัตโนมัติ หรือใช้ปุ่มด้านบนเพื่อบันทึกเอง 🌸</span></div>');return;}let h='';m.forEach(e=>h+=renderCard(e));p.html(h);bindActs();}

function renderCard(e){const lk=e.meta.isSecret&&!checkUnlock(e);const lvl=getLvl(e.content.affection_score);const mood=getMoodEmoji(e.content.mood);const rp=e.content.rp_date||e.content.rp_location||e.content.rp_weather;return `<div class="lp-card ${lk?'locked':''}" data-id="${e.id}">${lk?`<div class="lp-locked-ov">${svgLock}<div class="lp-locked-t">🔒 ความทรงจำลับ</div><div style="font-size:9px;color:#ccc">${e.meta.unlockCondition?.type==='affection'?'≥80 แต้ม':'รอเวลาเปิดเผย'}</div></div>`:''}<div class="lp-hdr"><span class="lp-char">${escapeHtml(e.character)}</span><span class="lp-time">${formatTime(e.timestamp)}</span></div>${rp?`<div class="lp-rp-meta">${e.content.rp_date?`<span class="lp-badge">📅 ${escapeHtml(e.content.rp_date)}</span>`:''}${e.content.rp_location?`<span class="lp-badge">📍 ${escapeHtml(e.content.rp_location)}</span>`:''}${e.content.rp_weather?`<span class="lp-badge">🌤️ ${escapeHtml(e.content.rp_weather)}</span>`:''}</div>`:''}<div class="lp-mood"><span>${mood} ${escapeHtml(e.content.mood)}</span><span style="font-size:10px;color:${lvl.color}">❤️ ${e.content.affection_score}</span></div><div class="lp-diary">${lk?'...':escapeHtml(e.content.diary)}</div><div class="lp-tags">${(e.meta.tags||[]).map(t=>`<span class="lp-tag">${t}</span>`).join('')}</div><div class="lp-acts">${!lk?`<button class="lp-icon ${e.meta.isPinned?'active':''}" data-act="pin" title="ปักหมุด">${svgPin}</button><button class="lp-icon ${e.meta.isFavorite?'active':''}" data-act="fav" title="ชื่นชอบ">${e.meta.isFavorite?svgStar:svgStarEmpty}</button><button class="lp-icon" data-act="link" title="ย้อนแชท">${svgLink}</button><button class="lp-icon danger" data-act="del" title="ลบ">🗑️</button>`:''}</div></div>`;}

function bindActs(){$('.lp-icon[data-act="pin"]').off('click').on('click',function(e){e.stopPropagation();const id=$(this).closest('.lp-card').data('id'),m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m){m.meta.isPinned=!m.meta.isPinned;SillyTavern.getContext().saveSettingsDebounced();loadTimeline();showToast(m.meta.isPinned?'📌 ปักหมุดแล้ว':'📌 ยกเลิกปักหมุด','info');}});$('.lp-icon[data-act="fav"]').off('click').on('click',function(e){e.stopPropagation();const id=$(this).closest('.lp-card').data('id'),m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m){m.meta.isFavorite=!m.meta.isFavorite;SillyTavern.getContext().saveSettingsDebounced();$(this).toggleClass('active').html(m.meta.isFavorite?svgStar:svgStarEmpty);showToast(m.meta.isFavorite?'⭐ เก็บแล้ว':'🗑️ เอาออกแล้ว','info');}});$('.lp-icon[data-act="link"]').off('click').on('click',function(e){e.stopPropagation();const id=$(this).closest('.lp-card').data('id'),m=extension_settings[extensionName].memories.find(x=>x.id===id);const idx=m?.meta?.relatedMessages?.[0];if(idx!==undefined){showToast(`🔍 กำลังพยายามเลื่อนไปข้อความ #${idx}...`);const target=$(`#chat .mes[data-mesid="${idx}"]`).eq(0);if(target.length){target[0].scrollIntoView({behavior:'smooth',block:'center'});}else{showToast('⚠️ ไม่พบข้อความในหน้าจอ (อาจถูกโหลดออกแล้ว)','warning');}}else{showToast('📌 บันทึกนี้ไม่ลิงก์กับข้อความเก่า','info');}});$('.lp-icon[data-act="del"]').off('click').on('click',function(e){e.stopPropagation();if(confirm('ลบความทรงจำนี้?')){const id=$(this).closest('.lp-card').data('id'),s=extension_settings[extensionName];s.memories=s.memories.filter(x=>x.id!==id);SillyTavern.getContext().saveSettingsDebounced();$(this).closest('.lp-card').fadeOut(200,()=>{if(!$('.lp-card').length)loadTimeline();});showToast('🗑️ ลบแล้ว','success');}});}
function debounce(fn,w){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn(...a),w);}}
function getLvl(s){const l=[{m:0,M:20,t:"แปลกหน้า",c:"#CCC",e:"😶"},{m:20,M:40,t:"รู้จักกัน",c:"#FFD1DC",e:"🙂"},{m:40,M:60,t:"เพื่อน",c:"#FFB6C1",e:"😊"},{m:60,M:80,t:"สนิท",c:"#FF85A2",e:"🥰"},{m:80,M:101,t:"ใกล้ชิด",c:"#FF4D79",e:"💖"}];return l.find(x=>s>=x.m&&s<x.M)||l[0];}
function formatTime(i){const d=new Date(i);return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}

async function manualGen(){const ctx=SillyTavern.getContext(),ev=checkForSpecialEvent(getCharacterName(),ctx.characters?.ctx.characterId]);let wm=extension_settings[extensionName].diary.worldMode;if(wm==='auto')wm=detectWorldMode();$('#lp-manual-gen').text('⏳ กำลังบันทึก...').prop('disabled',true);const res=await requestDiaryGeneration({trigger:'manual',event:ev,linked:wm==='rpg'?getChatNPCs(3):[]});if(res){const e={id:"mem_"+Date.now(),timestamp:new Date().toISOString(),trigger:'manual',character:getCharacterName(),characterId:ctx.characterId,worldMode:wm,linkedCharacters:wm==='rpg'?getChatNPCs(3):[],content:{...res,eventType:ev?.type},meta:{isFavorite:false,isPinned:false,isHidden:false,isSecret:ev?.isSecret,unlockCondition:ev?{type:extension_settings[extensionName].diary.display.secretUnlockMode,value:80}:null,tags:extractTags(res.diary),relatedMessages:(ctx.chat||[]).length>0?[(ctx.chat||[]).length-1]:[]}};saveMemory(e);loadTimeline();showToast('✨ บันทึกความทรงจำใหม่แล้ว','success');}$('#lp-manual-gen').text('✨ บันทึกความทรงจำตอนนี้').prop('disabled',false);}
// ═══════════════════════════════════════════════
// SETTINGS UI (Clean & Functional)
// ═══════════════════════════════════════════════
function renderSettings(){const s=extension_settings[extensionName].diary;$('#lp-hd').text('⚙️ ตั้งค่า');$('#lp-body').html(`<div class="lp-set-sec"><div class="lp-set-t">🌍 โหมดโลก</div><div class="lp-row"><select id="lp-wm"><option value="auto" ${s.worldMode==='auto'?'selected':''}>🤖 อัตโนมัติ</option><option value="solo" ${s.worldMode==='solo'?'selected':''}>👤 เดี่ยว</option><option value="rpg" ${s.worldMode==='rpg'?'selected':''}>🌐 RPG</option></select></div></div><div class="lp-set-sec"><div class="lp-set-t">⚡ เจนอัตโนมัติ</div><div class="lp-row"><label style="display:flex;align-items:center;gap:8px"><span>เปิดใช้งาน</span><label class="lp-switch"><input type="checkbox" id="lp-age" ${s.autoGen.enabled?'checked':''}><span class="sl"></span></label></label></div><div class="lp-row"><label>ทริกเกอร์</label><select id="lp-tt"><option value="turn_count" ${s.autoGen.triggerType==='turn_count'?'selected':''}>🔢 ทุก X ข้อความ</option><option value="emotion" ${s.autoGen.triggerType==='emotion'?'selected':''}>💬 คำอารมณ์</option><option value="random" ${s.autoGen.triggerType==='random'?'selected':''}>🎲 สุ่ม</option></select></div><div class="lp-row" id="lp-tw" style="display:${s.autoGen.triggerType==='turn_count'?'block':'none'}"><label>เจนทุก <input type="number" id="lp-ti" value="${s.autoGen.turnInterval}" min="5" max="100" style="width:50px;display:inline"> ข้อความ</label></div><div class="lp-row" id="lp-ew" style="display:${s.autoGen.triggerType==='emotion'?'block':'none'}"><label>คำตรวจจับ <input type="text" id="lp-ek" value="${s.autoGen.emotionKeywords.join(',')}" placeholder="รัก,โกรธ,ดีใจ"></label></div></div><div class="lp-set-sec"><div class="lp-set-t">🔒 ความลับ</div><div class="lp-row"><label style="display:flex;align-items:center;gap:8px"><span>แสดงภาพซ้อน</span><label class="lp-switch"><input type="checkbox" id="lp-ss" ${s.display.showSecret?'checked':''}><span class="sl"></span></label></label></div><div class="lp-row"><label>วิธีปลดล็อก</label><select id="lp-sm"><option value="affection" ${s.display.secretUnlockMode==='affection'?'selected':''}>❤️ ความสัมพันธ์ ≥80</option><option value="event" ${s.display.secretUnlockMode==='event'?'selected':''}>🎉 3 วันหลังเกิด</option><option value="manual" ${s.display.secretUnlockMode==='manual'?'selected':''}>✋ แมนนวล</option></select></div></div><div class="lp-set-sec"><div class="lp-set-t">💾 จัดการ</div><div class="lp-row"><label>เก็บสูงสุด <input type="number" id="lp-me" value="${s.storage.maxEntries}" min="10" max="200" style="width:60px;display:inline"> รายการ</label></div><div style="display:flex;gap:8px;margin-top:12px"><button id="lp-exp" class="lp-btn" style="padding:8px 16px;font-size:11px;flex:1;background:#FFF0F5;color:#ff85a2">📤 Export</button><button id="lp-rst-fab" class="lp-btn" style="padding:8px 16px;font-size:11px;flex:1;background:#FFF0F5;color:#ff85a2">📍 รีเซ็ตตำแหน่งปุ่ม</button><button id="lp-clr" class="lp-btn" style="padding:8px 16px;font-size:11px;flex:1;background:#FFE0E0;color:#ff6b6b">🗑️ ล้างความทรงจำ</button></div></div><div style="text-align:center;margin-top:16px"><button id="lp-sav" class="lp-btn" style="padding:10px 36px">💾 บันทึกการตั้งค่า</button></div>`);$('#lp-tt').on('change',function(){$('#lp-tw').toggle($(this).val()==='turn_count');$('#lp-ew').toggle($(this).val()==='emotion');});$('#lp-sav').on('click',()=>{const s=extension_settings[extensionName].diary;s.worldMode=$('#lp-wm').val();s.autoGen.enabled=$('#lp-age').prop('checked');s.autoGen.triggerType=$('#lp-tt').val();s.autoGen.turnInterval=parseInt($('#lp-ti').val())||20;s.autoGen.emotionKeywords=$('#lp-ek').val().split(',').map(k=>k.trim()).filter(k=>k);s.display.showSecret=$('#lp-ss').prop('checked');s.display.secretUnlockMode=$('#lp-sm').val();s.storage.maxEntries=parseInt($('#lp-me').val())||50;SillyTavern.getContext().saveSettingsDebounced();extension_settings[extensionName]._internal.messageCounter=0;showToast('✅ บันทึกแล้ว','success');setTimeout(()=>renderDiary(),400);});$('#lp-exp').on('click',()=>{const b=new Blob([JSON.stringify(extension_settings[extensionName].memories,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`lumi-mem-${new Date().toISOString().split('T')[0]}.json`;a.click();showToast('📤 Export เสร็จ','success');});$('#lp-rst-fab').on('click',()=>{const f=document.getElementById('lumi-main-fab');if(f){f.style.top='';f.style.bottom='90px';f.style.right='20px';f.style.left='auto';showToast('📍 รีเซ็ตตำแหน่งปุ่มแล้ว','info');}});$('#lp-clr').on('click',()=>{if(confirm('ล้างความทรงจำทั้งหมด?')){extension_settings[extensionName].memories=[];SillyTavern.getContext().saveSettingsDebounced();showToast('🗑️ ล้างแล้ว','success');setTimeout(()=>renderSettings(),400);}});}

// ═══════════════════════════════════════════════
// FAB BUTTON (Smooth Drag, No Reset Interference)
// ═══════════════════════════════════════════════
function spawnLumiButton(){$('#lumi-main-fab,.lumi-menu').remove();console.log('[LumiPulse] 🔄 สร้างปุ่ม...');if(!document.body){setTimeout(spawnLumiButton,800);return;}const fab=document.createElement('div');fab.id='lumi-main-fab';fab.innerHTML=`<img src="${btnUrl}" alt="Lumi">`;fab.style.bottom='90px';fab.style.right='20px';document.body.appendChild(fab);fab.style.display='flex';const menu=document.createElement('div');menu.className='lumi-menu';menu.innerHTML=`<div class="lumi-menu-grid"><div class="lumi-mi" id="lp-diary"><img src="${iconDiary}"><span class="lumi-mt">Diary</span></div><div class="lumi-mi" id="lp-phone"><img src="${iconPhone}"><span class="lumi-mt">Phone</span></div><div class="lumi-mi" id="lp-forum"><img src="${iconForum}"><span class="lumi-mt">Forum</span></div></div><div class="lumi-brand">LUMIPULSE</div>`;document.body.appendChild(menu);function uPos(){const r=fab.getBoundingClientRect(),m=$(menu);let l=r.left-(m.outerWidth()/2)+(r.width/2),t=r.top-m.outerHeight()-12;if(l<10)l=10;if(l+m.outerWidth()>innerWidth-10)l=innerWidth-m.outerWidth()-10;if(t<10)t=r.bottom+12;m.css({left:l,top:t});}let drag=false,dOff={x:0,y:0},start={x:0,y:0},tOff={x:0,y:0},tDrag=false,tt=null;const TH=10;fab.addEventListener('mousedown',e=>{if(e.button===2)return;e.preventDefault();drag=false;fab.style.animation='none';const r=fab.getBoundingClientRect();dOff.x=e.clientX-r.left;dOff.y=e.clientY-r.top;start.x=e.clientX;start.y=e.clientY;const mv=ev=>{if(Math.hypot(ev.clientX-start.x,ev.clientY-start.y)>TH){drag=true;$('menu').fadeOut(80);}if(!drag)return;let x=Math.max(0,Math.min(ev.clientX-dOff.x,innerWidth-44)),y=Math.max(0,Math.min(ev.clientY-dOff.y,innerHeight-44));fab.style.left=x+'px';fab.style.top=y+'px';fab.style.right='auto';fab.style.bottom='auto';fab.style.transform='none';uPos();};const up=ev=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);fab.style.animation='lpFloat 3s ease-in-out infinite';if(!drag){clearTimeout(tt);tt=setTimeout(()=>{uPos();$(menu).fadeToggle(250);spawnHeartEffect({...ev,_fromDrag:false});},50);}drag=false;};document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);});fab.addEventListener('touchstart',e=>{e.preventDefault();tDrag=false;fab.style.animation='none';const t=e.touches[0],r=fab.getBoundingClientRect();tOff.x=t.clientX-r.left;tOff.y=t.clientY-r.top;start.x=t.clientX;start.y=t.clientY;},{passive:false});fab.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0];if(Math.hypot(t.clientX-start.x,t.clientY-start.y)>TH){tDrag=true;$('menu').fadeOut(80);}if(!tDrag)return;let x=Math.max(0,Math.min(t.clientX-tOff.x,innerWidth-44)),y=Math.max(0,Math.min(t.clientY-tOff.y,innerHeight-44));fab.style.left=x+'px';fab.style.top=y+'px';fab.style.right='auto';fab.style.bottom='auto';fab.style.transform='none';uPos();},{passive:false});fab.addEventListener('touchend',()=>{fab.style.animation='lpFloat 3s ease-in-out infinite';if(!tDrag){clearTimeout(tt);tt=setTimeout(()=>{uPos();$(menu).fadeToggle(250);spawnHeartEffect({clientX:0,clientY:0,_fromDrag:false});},50);}tDrag=false;});$(document).off('click','#lp-diary').on('click','#lp-diary',()=>openLumi('diary')).off('click','#lp-phone').on('click','#lp-phone',()=>openLumi('phone')).off('click','#lp-forum').on('click','#lp-forum',()=>openLumi('forum'));}

// ═══════════════════════════════════════════════
// SHELL & EXT SETTINGS
// ═══════════════════════════════════════════════
function createContentModal(){if($('#lp-ov').length)return;$('body').append(`<div id="lp-ov" class="lumi-overlay"><div class="lumi-box"><div class="lumi-hd"><div class="lp-opt">${svgSettings}</div><span id="lp-hd"></span><div class="lumi-close">×</div></div><div id="lp-body" class="lumi-body"></div></div></div>`);$('#lp-ov').on('click',function(e){if(e.target.id==='lp-ov')$(this).fadeOut(200);});$(document).off('click','.lumi-close').on('click','.lumi-close',()=>$('#lp-ov').fadeOut(200));}
function createSettingsUI(){$('#extensions_settings').append(`<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color:#ff85a2;font-family:'Mitr';font-weight:400;">🌸 LumiPulse</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="font-family:'Mitr';display:flex;flex-direction:column;gap:8px;padding:12px 0;"><label class="checkbox_label"><input id="lp-toggle" type="checkbox"><span>เปิดใช้งาน</span></label><button id="lp-reset" class="menu_button" style="background:#FFE0E0;color:#ff6b6b;border-radius:12px">🗑️ ล้างข้อมูล</button><div style="font-size:10px;color:#ffb6c1">v2.1.0 · 📖 Memories · 🌍 RPG · 🎮 Game-Like</div></div></div>`);$('#lp-toggle').prop('checked',extension_settings[extensionName].isEnabled);$(document).on('change','#lp-toggle',function(){const en=$(this).prop('checked');extension_settings[extensionName].isEnabled=en;SillyTavern.getContext().saveSettingsDebounced();if(en){setTimeout(()=>{spawnLumiButton();createContentModal();setupAutoTriggerListener();},400);}else{$('#lumi-main-fab,.lumi-menu,#lp-ov').remove();$(document).off('messageReceived',onNewMsg);}});$(document).on('click','#lp-reset',()=>{const s=extension_settings[extensionName];s.isForumInitialized=false;s.forumTopic="";s.forumData=[];s.diaryData=null;s.memories=[];s._internal={...defaultSettings._internal};SillyTavern.getContext().saveSettingsDebounced();showToast("ล้างข้อมูลแล้ว 🌸","success");});}
function showToast(m,t='info'){if(typeof toastr!=='undefined') toastr[t](m,'🌸 LumiPulse');else console.log(`[Lumi] ${m}`);}
