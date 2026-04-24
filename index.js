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
// BOOT
// ═══════════════════════════════════════════════
jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext) { clearInterval(boot); initLumiPulse(); }
    }, 800);
});

function initLumiPulse() {
    console.log("[LumiPulse] 🟢 Init started");
    const ctx = SillyTavern.getContext();
    if (!ctx.extensionSettings[extensionName]) { ctx.extensionSettings[extensionName] = { ...defaultSettings }; ctx.saveSettingsDebounced(); }
    extension_settings = ctx.extensionSettings;
    const s = extension_settings[extensionName];
    if (!s.diary) s.diary = defaultSettings.diary;
    if (!s.memories) s.memories = [];
    if (!s._internal) s._internal = defaultSettings._internal;

    injectStyles(); 
    createSettingsUI(); // สร้าง Panel การตั้งค่าในหน้า Extension
    
    if (s.isEnabled) {        setTimeout(() => { 
            spawnLumiButton(); 
            createContentModal(); 
            setupAutoTriggerListener(); 
        }, 1000);
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
    return mem.sort((a,b)=>(b.meta.isPinned===true)-(a.meta.isPinned===true) || new Date(b.timestamp)-new Date(a.timestamp));
}

// ═══════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════
function parseJSON(text) {
    if(!text||typeof text!=='string') return null;    let m=text.match(/\{[\s\S]*\}/); if(m){try{return JSON.parse(m[0]);}catch(e){}}
    toastr.warning('AI ตอบกลับผิดรูปแบบ 🌸'); return null;
}
async function callST(p) {
    try {
        const ctx=SillyTavern.getContext(); let res;
        if(typeof ctx.generateQuietPrompt==='function') res=await ctx.generateQuietPrompt(p,false,false);
        else if(typeof ctx.generateRaw==='function') res=await ctx.generateRaw(p,true);
        else if(typeof window.generateQuietPrompt==='function') res=await window.generateQuietPrompt(p,false,false);
        else if(typeof window.generateRaw==='function') res=await window.generateRaw(p,true);
        else {toastr.error('หา generate function ไม่เจอ');return null;}
        return parseJSON(res);
    }catch(e){console.error(e);toastr.error('AI Error');return null;}
}

async function requestDiaryGen(opt={}) {
    const {charName=getCharacterName(), trigger='manual', ev=null, linked=[]} = opt;
    const ctx=SillyTavern.getContext(), cc=ctx.characters?.[ctx.characterId]||{};
    let wm=extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm=detectWorldMode();
    const chatLog=(ctx.chat||[]).slice(-25).map(m=>`${m.is_user?'User':m.name||'NPC'}: ${(m.mes||'').slice(0,150)}`).join('\n');
    const evNote=ev?`\n🎉 Event: ${ev.label}\n${ev.promptBoost}`:'';
    const prompt=`[System: You are ${charName}'s inner voice. Respond ONLY with valid JSON.]
Profile: ${cc.data?.personality||'Normal'} | World: ${wm==='rpg'?'Group':'Solo'} | Others: ${linked.join(',')||'None'}
Chat Log:\n${chatLog}\n${evNote}
Generate a diary entry based on the RP context. Infer the fictional date, location, and weather from the chat.
Format: {"rp_date":"วันที่ในเกม (เช่น วันขึ้น 15 ค่ำ เดือน 3)","rp_location":"สถานที่ RP","rp_weather":"สภาพอากาศ/บรรยากาศ","affection_score":0-100,"mood":"อารมณ์","diary":"เนื้อหาไดอารี่ 3-5 ประโยค มุมมองบุคคลที่ 1 ภาษาไทย"}
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
        let gen=false, type='manual', triggerChatText=lastMsg;
    if(cfg.triggerType==='turn_count' && s._internal.messageCounter>=cfg.turnInterval) { gen=true; type='turn'; s._internal.messageCounter=0; }
    else if(cfg.triggerType==='emotion' && cfg.emotionKeywords.some(k=>lastMsg.includes(k))) { gen=true; type='emotion'; }
    else if(cfg.triggerType==='random' && Math.random()<cfg.randomChance) { gen=true; type='random'; }
    else if(lastMsg.includes('#จำ') || lastMsg.includes('#memory') || lastMsg.includes('#diary')) { gen=true; type='user_tag'; }

    if(gen) {
        SillyTavern.getContext().saveSettingsDebounced();
        const ctx=SillyTavern.getContext(), ev=null; 
        let wm=s.diary.worldMode; if(wm==='auto') wm=detectWorldMode();
        const res=await requestDiaryGen({trigger:type, ev, linkedChars:wm==='rpg'?getChatNPCs(3):[]});
        if(res) createMemoryEntry(res, type, ctx, wm, triggerChatText);
    }
}

async function manualGenerate() {
    const ctx=SillyTavern.getContext(); 
    $('#lumi-modal-body').html(`<div style="text-align:center;padding:40px;"><div class="lumi-loader-wrap"><div class="lumi-loader"></div><div style="color:#ff85a2;margin-top:10px;">กำลังบันทึกความทรงจำ...</div></div></div>`);
    let wm=extension_settings[extensionName].diary.worldMode; if(wm==='auto') wm=detectWorldMode();
    const res=await requestDiaryGen({trigger:'manual', linkedChars:wm==='rpg'?getChatNPCs(3):[]});
    if(res) {
        const lastMsg = ctx.chat?.slice(-1)[0]?.mes || '';
        createMemoryEntry(res, 'manual', ctx, wm, lastMsg);
        loadAndRenderTimeline();
    } else { renderDiaryUI(); }
}

function createMemoryEntry(res, type, ctx, wm, refText) {
    const entry = {
        id:"mem_"+Date.now(), timestamp:new Date().toISOString(), trigger:type,
        character:getCharacterName(), characterId:ctx.characterId, worldMode:wm,
        content: {
            rp_date: res.rp_date || "วันไม่ทราบแน่ชัด",
            rp_location: res.rp_location || "สถานที่ปัจจุบัน",
            rp_weather: res.rp_weather || "บรรยากาศเงียบสงบ",
            affection_score: res.affection_score || 50,
            mood: res.mood || "สงบ",
            diary: res.diary || ""
        },
        meta: { isPinned:false, isFavorite:false, isHidden:false, isSecret:false, unlockCondition:null, tags:extractTags(res.diary||''), referenceText: refText?.slice(0,100)||"" }
    };
    saveMemory(entry);
    showToast(`🌸 บันทึกความทรงจำ: ${res.rp_date}`);
}

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
function injectStyles() {
    if($('#lumi-styles').length) return;    const s=document.createElement('style'); s.id='lumi-styles';
    s.innerHTML=`
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400&display=swap');
        @keyframes lumiPop{0%{opacity:0;transform:scale(.85) translateY(15px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes heartRise{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-80px) scale(1.8)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .lumi-vector-heart{position:fixed;z-index:99999;pointer-events:none;width:28px;height:28px;animation:heartRise .8s ease-out forwards;filter:drop-shadow(0 0 4px #FFB6C1)}
        
        /* 🛡️ ปุ่มลอย: ปรับให้เห็นชัดบนธีมมืด มีขอบชัดเจน */
        #lumi-main-fab{position:fixed!important;z-index:99999!important;width:46px;height:46px;border-radius:50%;background:rgba(255,245,250,0.95) url('${btnUrl}') no-repeat center center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);background-size:26px,100%;border:2px solid #FFB6C1!important;box-shadow:0 4px 15px rgba(255,182,193,0.5)!important;cursor:grab;touch-action:none;user-select:none;display:flex!important;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s}
        #lumi-main-fab:active{transform:scale(0.92);box-shadow:0 2px 8px rgba(255,182,193,0.3)!important;cursor:grabbing}
        
        .lumi-menu-container{position:fixed;z-index:99998;display:none;background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);border-radius:28px;padding:22px;border:1.5px solid rgba(255,182,193,0.3);box-shadow:0 15px 40px rgba(255,182,193,0.2);font-family:'Mitr',sans-serif;font-weight:300}
        .lumi-menu-grid{display:flex;gap:20px;justify-content:center}
        .lumi-menu-item{display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:transform .2s}
        .lumi-menu-item:hover{transform:translateY(-5px)}
        .lumi-menu-icon{width:42px;height:42px;object-fit:contain}
        .lumi-menu-text{font-size:12px;color:#ff85a2}
        .lumi-branding{margin-top:18px;font-size:10px;color:#ffb6c1;text-transform:uppercase;letter-spacing:3px;text-align:center}
        
        .lumi-modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100dvh;background:rgba(0,0,0,0.25);backdrop-filter:blur(12px);z-index:99997;display:none;align-items:center;justify-content:center}
        .lumi-modal-box{width:94%;max-width:440px;height:80vh;background:#fff;border-radius:32px;border:2px solid #FFD1DC;box-shadow:0 20px 50px rgba(255,182,193,0.15);display:flex;flex-direction:column;overflow:hidden;font-family:'Mitr',sans-serif;font-weight:300;animation:lumiPop .35s forwards}
        .lumi-modal-header{padding:20px;text-align:center;color:#ff85a2;border-bottom:1.5px solid #FFF0F3;position:relative;font-size:16px}
        .lumi-modal-close{position:absolute;right:16px;top:18px;width:28px;height:28px;background:#FFF0F3;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ff85a2}
        .lumi-modal-opt{position:absolute;left:16px;top:18px;width:28px;height:28px;color:#ffb6c1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.3s}
        .lumi-modal-opt:hover{color:#ff85a2;transform:rotate(45deg)}
        .lumi-modal-body{flex:1;padding:14px;overflow-y:auto}
        
        .lumi-btn-gen{background:linear-gradient(135deg,#FFB6C1,#FF85A2);color:#fff;border:none;padding:10px 30px;border-radius:20px;font-family:'Mitr';cursor:pointer;transition:opacity .2s;box-shadow:0 4px 12px rgba(255,133,162,0.2);font-size:13px}
        .lumi-btn-gen:hover{opacity:.9}
        .lumi-loader{width:36px;height:36px;border:3px solid #FFF0F3;border-top-color:#ff85a2;border-radius:50%;animation:spin 1s infinite linear;margin:0 auto}
        
        /* Timeline */
        .lumi-timeline-container{padding-bottom:8px}
        .lumi-timeline-date{font-size:12px;color:#ffb6c1;font-weight:400;padding:10px 0 6px;border-bottom:1px dashed #FFE8EE;margin:12px 0 8px}
        .lumi-memory-card{background:#FFFBFC;border:1px solid #FFE8EE;border-radius:16px;padding:14px;margin-bottom:10px;position:relative;transition:box-shadow .2s,transform .2s}
        .lumi-memory-card:hover{box-shadow:0 3px 10px rgba(255,182,193,0.1);transform:translateY(-1px)}
        .lumi-memory-card.pinned{border:1.5px solid #FFD1DC;background:#FFF8FA}
        .lumi-memory-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:5px}
        .lumi-memory-char{font-weight:400;color:#444;font-size:14px}
        .lumi-memory-meta{font-size:10px;color:#888;display:flex;gap:6px}
        .lumi-rp-info{background:#FFF0F3;padding:2px 8px;border-radius:8px;color:#ff85a2;font-size:9px}
        .lumi-memory-content{font-size:13px;color:#555;line-height:1.6;margin:8px 0 10px;white-space:pre-wrap}
        .lumi-memory-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}
        .lumi-tag{font-size:9px;padding:2px 8px;border-radius:10px;background:#FFF0F3;color:#ff85a2}
        .lumi-memory-actions{display:flex;gap:6px;justify-content:flex-end;border-top:1px solid #FFE8EE;padding-top:8px}
        .lumi-btn-icon{width:26px;height:26px;border-radius:50%;border:none;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;color:#ffb6c1;transition:.2s}
        .lumi-btn-icon:hover{background:#FFF0F3;transform:scale(1.1)}
        .lumi-btn-icon.active{background:#FFF0F3;color:#FFD700}
        @media(max-width:768px){.lumi-menu-container{width:calc(100vw-30px);right:15px!important}.lumi-modal-box{height:85vh}}    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// HEART & MODAL
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) { const h=document.createElement('div'); h.className='lumi-vector-heart'; h.innerHTML=svgHeart; h.style.left=e.clientX+'px'; h.style.top=e.clientY+'px'; document.body.appendChild(h); setTimeout(()=>h.remove(),800); }
function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(150); $('#lumi-modal-overlay').css('display','flex').hide().fadeIn(250);
    if(type==='forum') renderForumUI();
    else if(type==='diary') renderDiaryUI();
    else if(type==='phone') { $('#lumi-modal-title').text('📱 Phone'); $('#lumi-modal-body').html('<div style="text-align:center;padding:40px;color:#ffb6c1">Coming Soon 🌸</div>'); }
}
function createContentModal() {
    if($('#lumi-modal-overlay').length) return;
    $('body').append(`<div id="lumi-modal-overlay" class="lumi-modal-overlay"><div class="lumi-modal-box"><div class="lumi-modal-header"><div class="lumi-modal-opt">${svgSettings}</div><span id="lumi-modal-title"></span><div class="lumi-modal-close">×</div></div><div id="lumi-modal-body" class="lumi-modal-body"></div></div></div>`);
    $('#lumi-modal-overlay').on('click',function(e){if(e.target.id==='lumi-modal-overlay')$(this).fadeOut(200);});
    $(document).off('click','.lumi-modal-close').on('click','.lumi-modal-close',()=>$('#lumi-modal-overlay').fadeOut(200));
}

// ═══════════════════════════════════════════════
// FORUM UI (Placeholder)
// ═══════════════════════════════════════════════
function renderForumUI() { $('#lumi-modal-title').text('Forum'); $('#lumi-modal-body').html('<div style="text-align:center;padding:40px;color:#ffb6c1">Forum UI Coming Soon 🌸</div>'); }

// ═══════════════════════════════════════════════
// DIARY UI 2.0
// ═══════════════════════════════════════════════
function renderDiaryUI() {
    const s=extension_settings[extensionName], cn=getCharacterName();
    $('#lumi-modal-title').text(`📖 ${cn}'s Memories`); $('.lumi-modal-opt').show();
    const wm=s.diary.worldMode==='auto'?detectWorldMode():s.diary.worldMode;
    const chars=[cn,...getChatNPCs(5)].filter((v,i,a)=>a.indexOf(v)===i);
    $('#lumi-modal-body').html(`
        <div style="text-align:center;margin-bottom:12px"><button id="lumi-manual-gen" class="lumi-btn-gen">✨ บันทึกความทรงจำตอนนี้</button></div>
        <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
            <select id="lumi-f-char" class="text_pole" style="flex:1"><option value="">👤 ทุกตัวละคร</option>${chars.map(c=>`<option value="${escapeHtml(c)}" ${c===cn?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select>
            <input id="lumi-f-search" class="text_pole" style="flex:2" placeholder="🔍 ค้นหาไดอารี่...">
        </div>
        <div id="lumi-timeline-panel" class="lumi-timeline-container"></div>
    `);
    loadAndRenderTimeline();
    $('#lumi-f-char, #lumi-f-search').on('change keyup', ()=>setTimeout(loadAndRenderTimeline, 200));
    $('#lumi-manual-gen').on('click', manualGenerate);
}

function loadAndRenderTimeline() {
    const f={character:$('#lumi-f-char').val()||null, worldMode:null, showSecret:extension_settings[extensionName].diary.display.showSecret};
    const q=$('#lumi-f-search').val()?.toLowerCase()||'';    let mem=loadMemories(f);
    if(q) mem=mem.filter(m=>m.content.diary?.toLowerCase().includes(q)||m.content.mood?.includes(q)||m.content.rp_location?.includes(q));
    const p=$('#lumi-timeline-panel');
    if(!mem.length){p.html('<div style="text-align:center;padding:30px;color:#ffb6c1">📭 ยังไม่มีความทรงจำ<br><small style="opacity:.7">แชทต่อหรือกดปุ่มสร้างบันทึก</small></div>');return;}
    let h='';
    mem.forEach(m=>{
        const rp = `<span class="lumi-rp-info">📅 ${escapeHtml(m.content.rp_date)}</span> <span class="lumi-rp-info">📍 ${escapeHtml(m.content.rp_location)}</span> <span class="lumi-rp-info">☁️ ${escapeHtml(m.content.rp_weather)}</span>`;
        const tags = (m.meta.tags||[]).map(t=>`<span class="lumi-tag">${t}</span>`).join('');
        const acts = `
            <button class="lumi-btn-icon ${m.meta.isPinned?'active':''}" data-act="pin" title="ปักหมุด">${m.meta.isPinned?'📌':''}</button>
            <button class="lumi-btn-icon ${m.meta.isFavorite?'active':''}" data-act="fav" title="ชื่นชอบ">${m.meta.isFavorite?'❤️':'🤍'}</button>
            <button class="lumi-btn-icon" data-act="ref" title="ดูบริบท">${svgRef}</button>
            <button class="lumi-btn-icon" data-act="del" title="ลบ">🗑️</button>
        `;
        h+=`<div class="lumi-memory-card ${m.meta.isPinned?'pinned':''}" data-id="${m.id}">
            <div class="lumi-memory-header"><span class="lumi-memory-char">${escapeHtml(m.character)}</span><div class="lumi-memory-meta">${rp}</div></div>
            <div style="font-size:11px;color:#888;margin-bottom:6px">${getMoodEmoji(m.content.mood)} ${escapeHtml(m.content.mood)} · ❤️ ${m.content.affection_score}</div>
            <div class="lumi-memory-content">${escapeHtml(m.content.diary)}</div>
            <div class="lumi-memory-tags">${tags}</div>
            <div class="lumi-memory-actions">${acts}</div>
        </div>`;
    });
    p.html(h);
    $('.lumi-btn-icon[data-act="pin"]').on('click',e=>{e.stopPropagation();togglePin($(this).closest('.lumi-memory-card').data('id'));});
    $('.lumi-btn-icon[data-act="fav"]').on('click',e=>{e.stopPropagation();toggleFav($(this).closest('.lumi-memory-card').data('id'));});
    $('.lumi-btn-icon[data-act="ref"]').on('click',e=>{e.stopPropagation();showRef($(this).closest('.lumi-memory-card').data('id'));});
    $('.lumi-btn-icon[data-act="del"]').on('click',e=>{e.stopPropagation();delMem($(this).closest('.lumi-memory-card').data('id'));});
}

function togglePin(id){const s=extension_settings[extensionName],m=s.memories.find(x=>x.id===id);if(m){m.meta.isPinned=!m.meta.isPinned;SillyTavern.getContext().saveSettingsDebounced();loadAndRenderTimeline();}}
function toggleFav(id){const s=extension_settings[extensionName],m=s.memories.find(x=>x.id===id);if(m){m.meta.isFavorite=!m.meta.isFavorite;SillyTavern.getContext().saveSettingsDebounced();loadAndRenderTimeline();}}
function showRef(id){const m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m)alert('📜 บริบทต้นทาง:\n'+(m.meta.referenceText||'ไม่มีข้อมูล'));}
function delMem(id){if(confirm('ลบความทรงจำนี้?')){const s=extension_settings[extensionName];s.memories=s.memories.filter(x=>x.id!==id);SillyTavern.getContext().saveSettingsDebounced();loadAndRenderTimeline();}}

// ═══════════════════════════════════════════════
// ⚙️ SETTINGS PANEL (ย้ายมาอยู่ในหน้า Extension)
// ═══════════════════════════════════════════════
function createSettingsUI() {
    if ($('#lumi-settings-drawer').length) return; // กันซ้ำ

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
                    <label class="checkbox_label">
                        <input id="lumi_enable_toggle" type="checkbox" ${extension_settings[extensionName].isEnabled ? 'checked' : ''} />
                        <span>เปิดใช้งาน LumiPulse (แสดงปุ่มลอย)</span>
                    </label>
                </div>

                <div style="font-size: 11px; color: #ffb6c1; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                    การตั้งค่าทั่วไป
                </div>

                <div style="margin-bottom: 8px;">
                    <label style="font-size: 12px; color: #aaa;">โหมดโลก (World Mode)</label>
                    <select id="lumi_world_mode" class="text_pole" style="width: 100%; margin-top: 4px;">
                        <option value="auto" ${s.worldMode === 'auto' ? 'selected' : ''}>🤖 อัตโนมัติ (ตรวจจับจากแชท)</option>
                        <option value="solo" ${s.worldMode === 'solo' ? 'selected' : ''}>👤 เดี่ยว (Solo)</option>
                        <option value="rpg" ${s.worldMode === 'rpg' ? 'selected' : ''}>🌐 กลุ่ม (RPG)</option>
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
                        <option value="turn_count" ${ag.triggerType === 'turn_count' ? 'selected' : ''}>🔢 ทุก X ข้อความ</option>
                        <option value="emotion" ${ag.triggerType === 'emotion' ? 'selected' : ''}>💬 คำอารมณ์</option>
                        <option value="random" ${ag.triggerType === 'random' ? 'selected' : ''}>🎲 สุ่ม</option>
                    </select>
                    
                    <div id="lumi_turn_interval_wrap" style="display: ${ag.triggerType === 'turn_count' ? 'block' : 'none'}; margin-top: 4px;">
                        <input id="lumi_turn_interval" type="number" value="${ag.turnInterval}" min="5" max="100" class="text_pole" style="width: 60px;"> <span style="font-size: 11px; color: #888;">ข้อความ</span>
                    </div>
                </div>

                <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                    <button id="lumi_reset_fab" class="menu_button" style="width: 100%; margin-bottom: 5px;">📍 รีเซ็ตตำแหน่งปุ่มลอย</button>
                    <button id="lumi_clear_memories" class="menu_button" style="width: 100%; color: #ff6b6b;">🗑️ ล้างความทรงจำทั้งหมด</button>
                </div>

            </div>
        </div>
    `);
    // Bind Events
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

    // World Mode
    $('#lumi_world_mode').on('change', function() {
        extension_settings[extensionName].diary.worldMode = $(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
    });

    // Auto Gen Toggle
    $('#lumi_autogen_toggle').on('change', function() {
        extension_settings[extensionName].diary.autoGen.enabled = $(this).prop('checked');
        $('#lumi_autogen_options').toggle($(this).prop('checked'));
        SillyTavern.getContext().saveSettingsDebounced();
    });

    // Trigger Type
    $('#lumi_trigger_type').on('change', function() {
        extension_settings[extensionName].diary.autoGen.triggerType = $(this).val();
        $('#lumi_turn_interval_wrap').toggle($(this).val() === 'turn_count');
        SillyTavern.getContext().saveSettingsDebounced();
    });

    // Interval
    $('#lumi_turn_interval').on('change', function() {
        extension_settings[extensionName].diary.autoGen.turnInterval = parseInt($(this).val()) || 20;
        SillyTavern.getContext().saveSettingsDebounced();
    });

    // Reset FAB Button
    $('#lumi_reset_fab').on('click', function() {
        const fab = $('#lumi-main-fab');
        if (fab.length) {
            fab.css({ bottom: '100px', right: '20px', top: 'auto', left: 'auto' }).show();
            showToast('📍 รีเซ็ตตำแหน่งปุ่มลอยแล้ว', 'success');
        } else {
            spawnLumiButton();
            showToast('📍 สร้างปุ่มลอยใหม่แล้ว', 'success');
        }
    });
    // Clear Memories
    $('#lumi_clear_memories').on('click', function() {
        if(confirm('ล้างความทรงจำทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            extension_settings[extensionName].memories = [];
            SillyTavern.getContext().saveSettingsDebounced();
            showToast('🗑️ ล้างความทรงจำทั้งหมดแล้ว', 'success');
        }
    });
}

// ═══════════════════════════════════════════════
// 🛡️ FAB BUTTON (ปรับปรุงให้เห็นชัด)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    if(!document.body){setTimeout(spawnLumiButton,800);return;}
    
    const fab=document.createElement('div'); fab.id='lumi-main-fab';
    // ตำแหน่งเริ่มต้นที่ปลอดภัย (เหนือแป้นพิมพ์)
    fab.style.bottom='100px'; fab.style.right='20px';
    document.body.appendChild(fab);
    fab.style.display='flex'; fab.style.visibility='visible'; fab.style.opacity='1';

    const menu=document.createElement('div'); menu.className='lumi-menu-container';
    menu.innerHTML=`<div class="lumi-menu-grid">
        <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon"><span class="lumi-menu-text">Memories</span></div>
        <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon"><span class="lumi-menu-text">Forum</span></div>
    </div><div class="lumi-branding">LumiPulse</div>`;
    document.body.appendChild(menu);

    function updateMenuPos() {
        const r=fab.getBoundingClientRect(), m=$(menu);
        let l=r.left-(m.outerWidth()/2)+(r.width/2), t=r.top-m.outerHeight()-10;
        if(l<10)l=10; if(l+m.outerWidth()>window.innerWidth-10)l=window.innerWidth-m.outerWidth()-10; if(t<10)t=r.bottom+10;
        m.css({left:l+'px',top:t+'px'});
    }

    // Drag/Tap Logic
    let isDragging=false, isTouchDrag=false, dragStart={x:0,y:0}, offset={x:0,y:0};
    const TH=10; 
    let tapTimer=null;

    fab.addEventListener('mousedown', e=>{
        if(e.button===2)return; e.preventDefault(); isDragging=false;
        const r=fab.getBoundingClientRect(); offset.x=e.clientX-r.left; offset.y=e.clientY-r.top; dragStart.x=e.clientX; dragStart.y=e.clientY;
        const onMove=ev=>{const dx=ev.clientX-dragStart.x, dy=ev.clientY-dragStart.y; if(Math.sqrt(dx*dx+dy*dy)>TH){isDragging=true;$(menu).fadeOut(100);} if(!isDragging)return; let x=Math.max(0,Math.min(ev.clientX-offset.x,window.innerWidth-46)), y=Math.max(0,Math.min(ev.clientY-offset.y,window.innerHeight-46)); fab.style.left=x+'px'; fab.style.top=y+'px'; fab.style.bottom='auto'; fab.style.right='auto'; };
        const onUp=ev=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp); if(!isDragging){clearTimeout(tapTimer);tapTimer=setTimeout(()=>{updateMenuPos();$(menu).fadeToggle(200);spawnHeartEffect({...ev,_fromDrag:false});},50);} isDragging=false; };
        document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
    });
    fab.addEventListener('touchstart', e=>{
        isTouchDrag=false; const t=e.touches[0], r=fab.getBoundingClientRect(); offset.x=t.clientX-r.left; offset.y=t.clientY-r.top; dragStart.x=t.clientX; dragStart.y=t.clientY;
    },{passive:false});
    fab.addEventListener('touchmove', e=>{
        e.preventDefault(); const t=e.touches[0]; const dx=t.clientX-dragStart.x, dy=t.clientY-dragStart.y;
        if(Math.sqrt(dx*dx+dy*dy)>TH){isTouchDrag=true;$(menu).fadeOut(100);} if(!isTouchDrag)return;
        let x=Math.max(0,Math.min(t.clientX-offset.x,window.innerWidth-46)), y=Math.max(0,Math.min(t.clientY-offset.y,window.innerHeight-46));
        fab.style.left=x+'px'; fab.style.top=y+'px'; fab.style.bottom='auto'; fab.style.right='auto';
    },{passive:false});
    fab.addEventListener('touchend', e=>{
        if(!isTouchDrag){clearTimeout(tapTimer);tapTimer=setTimeout(()=>{updateMenuPos();$(menu).fadeToggle(200);const t=e.changedTouches?.[0];if(t)spawnHeartEffect({_fromDrag:false,clientX:t.clientX,clientY:t.clientY});},50);}
        isTouchDrag=false;
    });

    $(document).off('click','#lumi-diary').on('click','#lumi-diary',()=>openLumiModal('diary'))
               .off('click','#lumi-forum').on('click','#lumi-forum',()=>openLumiModal('forum'));
}

function showToast(m,t='info'){if(typeof toastr!=='undefined')toastr[t](m,'🌸 LumiPulse');}
