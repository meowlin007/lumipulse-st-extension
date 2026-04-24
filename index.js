"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: true, forumTopic: "", isForumInitialized: false, includeRandomNPCs: true, forumData: [], diaryData: null,
    diary: {
        worldMode: 'auto', autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','ตกใจ','หัวใจ','ชอบ'], randomChance: 0.1 },
        display: { showSecret: true, secretUnlockMode: 'affection' }, storage: { maxEntries: 60, autoSave: true }
    },
    memories: [], _internal: { messageCounter: 0, firstChatDate: null, fabPos: { bottom: '90px', right: '20px', top: 'auto', left: 'auto' } }
};
let extension_settings = {};

const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart = `<svg viewBox="0 0 32 32" fill="none"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1" stroke="#FFB6C1" stroke-width="1" stroke-linejoin="round"/></svg>`;
const svgSettings = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgLock = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgStar = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="#FFB6C1" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgPin = `<svg viewBox="0 0 24 24" fill="#FF85A2" stroke="none"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`;
const svgUnpin = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`;

jQuery(async () => {
    const boot = setInterval(() => { if(window.SillyTavern && SillyTavern.getContext){ clearInterval(boot); initLumiPulse(); } }, 1000);
});

function initLumiPulse() {
    const ctx = SillyTavern.getContext();
    if(!ctx.extensionSettings[extensionName]) { ctx.extensionSettings[extensionName] = {...defaultSettings}; ctx.saveSettingsDebounced(); }
    const s = ctx.extensionSettings[extensionName];
    if(!s.diary) s.diary = {...defaultSettings.diary};
    if(!s.memories) s.memories = [];
    if(!s._internal) s._internal = {...defaultSettings._internal};
    extension_settings = ctx.extensionSettings;
    injectStyles(); createSettingsUI();
    if(s.isEnabled) setTimeout(()=>{ spawnLumiButton(); createContentModal(); setupAutoTrigger(); }, 1200);
    document.addEventListener('click', e => { if(!e._fromDrag) spawnHeartEffect(e); });
}

// ═══════════════════════════════════════════════ HELPERS ═══════════════════════════════════════════════
function getChar() { return SillyTavern.getContext().name2 || "ตัวละคร"; }
function getUser() { return SillyTavern.getContext().name1 || "ผู้เล่น"; }
function getChat(limit=30) { return (SillyTavern.getContext().chat||[]).slice(-limit).map(m=>`${m.is_user?getUser():getChar()}: ${(m.mes||"").slice(0,200)}`).join("\n"); }
function escapeHtml(s){ return typeof s==='string' ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function detectWM(){ const c=SillyTavern.getContext().chat||[], u=new Set(); c.slice(-50).forEach(m=>{if(m.name&&!m.is_user&&!m.is_system)u.add(m.name);}); return u.size>2?'rpg':'solo'; }
function getNPCs(l=5){ const c=SillyTavern.getContext().chat||[], n=new Set(), cn=getChar(); c.slice(-40).forEach(m=>{if(m.name&&!m.is_user&&!m.is_system&&m.name!==cn)n.add(m.name);}); return Array.from(n).slice(0,l); }
function getRPDate(){ const d=new Date(); const th=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']; return `${d.getDate()} ${th[d.getMonth()]} ปีที่ ${Math.floor((d-new Date(2024,0,1))/86400000)+1}`; } // Fallback ถ้า AI ไม่ได้เจนfunction extractTags(t){ const tg=[], kw={'#โรแมนติก':['รัก','หัวใจ','ชอบ'],'#ดราม่า':['เสียใจ','ร้องไห้'],'#ตลก':['ขำ','555'],'#จุดเปลี่ยน':['เริ่ม','ครั้งแรก'],'#อบอุ่น':['สุขใจ','ขอบคุณ']}; const low=t.toLowerCase(); for(const[k,w]of Object.entries(kw))if(w.some(x=>low.includes(x)))tg.push(k); return tg.slice(0,3); }
function checkUnlock(m){ if(!m.meta.isSecret)return true; const c=extension_settings[extensionName].diary.display; if(c.secretUnlockMode==='manual')return false; if(c.secretUnlockMode==='affection')return (m.content.affection_score||0)>=80; return (new Date()-new Date(m.timestamp))/86400000>=3; }
function saveMem(e){ const s=extension_settings[extensionName]; s.memories.unshift(e); if(s.memories.length>s.diary.storage.maxEntries)s.memories=s.memories.slice(0,s.diary.storage.maxEntries); SillyTavern.getContext().saveSettingsDebounced(); }
function loadMem(f={}){ let m=[...extension_settings[extensionName].memories||[]]; if(f.char)m=m.filter(x=>x.character===f.char); if(f.wm)m=m.filter(x=>x.worldMode===f.wm); if(f.sec===false)m=m.filter(x=>!x.meta.isSecret||checkUnlock(x)); const pinned=m.filter(x=>x.meta.isPinned).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); const normal=m.filter(x=>!x.meta.isPinned).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); return [...pinned, ...normal]; }

// ═══════════════════════════════════════════════ AI CORE ═══════════════════════════════════════════════
function parseAI(t){ if(!t||typeof t!=='string')return null; let m=t.match(/\{[\s\S]*\}/)||t.match(/\[[\s\S]*\]/); if(m)try{return JSON.parse(m[0])}catch(e){} return null; }
async function callAI(prompt){ try{ const ctx=SillyTavern.getContext(); let r; if(typeof ctx.generateQuietPrompt==='function')r=await ctx.generateQuietPrompt(prompt,false,false); else if(typeof ctx.generateRaw==='function')r=await ctx.generateRaw(prompt,true); else if(typeof window.generateQuietPrompt==='function')r=await window.generateQuietPrompt(prompt,false,false); else if(typeof window.generateRaw==='function')r=await window.generateRaw(prompt,true); return parseAI(r); }catch(e){console.error(e); return null;} }

async function genDiary(opts={}){
    const {char=getChar(), trig='manual', ev=null, npc=[]}=opts;
    const ctx=SillyTavern.getContext(), c=ctx.characters?.[ctx.characterId]||{};
    let wm=extension_settings[extensionName].diary.worldMode; if(wm==='auto')wm=detectWM();
    const chatLog=getChat(30);
    const prompt=`[System: You are ${char}'s inner voice. Respond ONLY with valid JSON. No markdown, no extra text.]
Context: ${chatLog}\nWorld: ${wm==='rpg'?'Group (others: '+npc.join(',')+')':'Solo'}\nPersonality: ${c.data?.personality||'Expressive'}
Write a private Thai diary. Infer RP date, location, weather from context. DO NOT use real dates.
JSON: {"rp_date":"วันที่ในเนื้อเรื่อง","rp_location":"สถานที่","rp_weather":"สภาพอากาศ","affection_score":0-100,"mood":"อารมณ์","diary":"เนื้อหา 3-5 ประโยค"}
${ev?`\nEvent: ${ev.label} - ${ev.promptBoost}`:''}`;
    return await callAI(prompt);
}

// ═══════════════════════════════════════════════ AUTO TRIGGER ═══════════════════════════════════════════════
function setupAutoTrigger(){
    $(document).on('messageReceived', onNewMsg);
    $(document).on('activeCharacterChanged', ()=>{ extension_settings[extensionName]._internal.messageCounter=0; if(!extension_settings[extensionName]._internal.firstChatDate)extension_settings[extensionName]._internal.firstChatDate=new Date().toISOString(); SillyTavern.getContext().saveSettingsDebounced(); });
}
async function onNewMsg(){
    const s=extension_settings[extensionName], c=s.diary.autoGen; if(!c.enabled)return;
    s._internal.messageCounter++; let gen=false, t=null;
    if(c.triggerType==='turn_count'&&s._internal.messageCounter>=c.turnInterval){gen=true;t='turn_count';s._internal.messageCounter=0;}
    else if(c.triggerType==='emotion'){const m=(SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'').toLowerCase();if(c.emotionKeywords.some(k=>m.includes(k))){gen=true;t='emotion';}}
    else if(c.triggerType==='random'&&Math.random()<c.randomChance){gen=true;t='random';}
    else if(c.triggerType==='user_tag'){const m=SillyTavern.getContext().chat?.slice(-1)[0]?.mes||'';if(m.includes('#จำ')||m.includes('#diary')){gen=true;t='tag';}}
    if(gen){
        SillyTavern.getContext().saveSettingsDebounced();
        const ctx=SillyTavern.getContext(), ev=checkEvent(getChar(), ctx.characters?.[ctx.characterId]);
        if(ev)t=`event_${ev.type}`;
        const wm=s.diary.worldMode==='auto'?detectWM():s.diary.worldMode;
        const res=await genDiary({trig:t, ev, npc:wm==='rpg'?getNPCs(3):[]});
        if(res){
            const m={id:"mem_"+Date.now(), timestamp:new Date().toISOString(), trigger:t, character:getChar(), characterId:ctx.characterId, worldMode:wm, linkedChars:wm==='rpg'?getNPCs(3):[], content:{...res, eventType:ev?.type}, meta:{isFavorite:false,isPinned:false,isHidden:false,isSecret:ev?.isSecret,unlockCondition:ev?{type:s.diary.display.secretUnlockMode}:null,tags:extractTags(res.diary),contextSnip:res.diary.slice(0,150)}};
            saveMem(m); if(!m.meta.isSecret||s.diary.display.showSecret)showToast(`🌸 ${m.character} มีความทรงจำใหม่: "${res.mood}"`);
        }
    }
}
function checkEvent(name, data){ const d=new Date(), desc=(data?.description||'')+(data?.data?.creator_notes||''), b=(desc).match(/birthday[:\s]+(\d{1,2})[\/\-](\d{1,2})/i); if(b&&b[1]==d.getDate()&&b[2]==d.getMonth()+1)return{type:'bday',label:'🎂 วันเกิด',isSecret:false,promptBoost:`Today is ${name}'s birthday!`}; const fd=extension_settings[extensionName]._internal.firstChatDate; if(fd){const days=Math.floor((d-new Date(fd))/86400000);if([30,100,365].includes(days))return{type:`aniv_${days}d`,label:`💕 ครบ ${days} วัน`,isSecret:days>=100,promptBoost:`${days} days since meeting...`};} if(d.getDate()<=3)return{type:`season_${d.getMonth()}`,label:'🗓️ เปลี่ยนฤดู',isSecret:false,promptBoost:'New season begins...'}; return null; }

// ═══════════════════════════════════════════════ STYLES ═══════════════════════════════════════════════
function injectStyles(){    if($('#lumi-styles').length)return;
    const s=document.createElement('style'); s.id='lumi-styles';
    s.textContent=`@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400&display=swap');
    @keyframes p{0%{opacity:0;transform:scale(.8) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes f{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes h{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-100px) scale(1.5)}}
    .lumi-heart{position:fixed;z-index:99999;pointer-events:none;width:28px;height:28px;animation:h .8s ease-out forwards}
    #lumi-main-fab{position:fixed!important;z-index:2147483646!important;width:44px;height:44px;cursor:grab;touch-action:none;user-select:none;display:flex!important;align-items:center;justify-content:center;background:rgba(255,240,245,.75)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.8)!important;border-radius:14px!important;box-shadow:0 4px 15px rgba(255,182,193,.25)!important;transition:transform .2s}
    #lumi-main-fab img{width:22px;height:22px;pointer-events:none}
    #lumi-main-fab:active{cursor:grabbing;transform:scale(.95)}
    .lumi-floating{animation:f 3.5s ease-in-out infinite}
    .lumi-menu{position:fixed;z-index:2147483645;display:none;background:rgba(255,255,255,.95);backdrop-filter:blur(20px);border-radius:28px;padding:22px;border:1px solid rgba(255,182,193,.3);box-shadow:0 15px 40px rgba(255,182,193,.2);font-family:'Mitr',sans-serif}
    .lumi-menu-grid{display:flex;gap:20px;justify-content:center}
    .lumi-mi{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:transform .2s}
    .lumi-mi:hover{transform:translateY(-5px)}
    .lumi-mi img{width:48px;height:48px;object-fit:contain}
    .lumi-mi span{font-size:11px;color:#ff85a2}
    .overlay{position:fixed;top:0;left:0;width:100vw;height:100dvh;background:rgba(0,0,0,.15);backdrop-filter:blur(8px);z-index:2147483647;display:none;align-items:center;justify-content:center}
    .modal{width:92%;max-width:440px;max-height:85vh;background:#fff;border-radius:32px;border:1px solid #FFD1DC;display:flex;flex-direction:column;overflow:hidden;animation:p .3s ease;font-family:'Mitr',sans-serif;font-weight:300}
    .m-head{padding:18px 20px;border-bottom:1px solid #FFF0F3;position:relative;display:flex;justify-content:center;align-items:center;color:#ff85a2;font-size:15px}
    .m-btn{position:absolute;top:16px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ffb6c1;border-radius:50%;transition:.2s}
    .m-btn:hover{background:#FFF0F3;color:#ff85a2}
    .m-close{right:16px} .m-opt{left:16px}
    .m-body{flex:1;padding:18px;overflow-y:auto;background:#fff}
    .setup{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;text-align:center}
    .lumi-input{width:100%;padding:12px 16px;background:#FFF9FA;border:1px solid #FFD1DC;border-radius:16px;color:#ff85a2;font-family:'Mitr';font-size:13px;outline:none}
    .btn-gen{background:linear-gradient(135deg,#FFB6C1,#FF85A2);color:#fff;border:none;padding:10px 32px;border-radius:20px;font-family:'Mitr';cursor:pointer;font-size:12px;box-shadow:0 4px 10px rgba(255,133,162,.15);transition:.2s}
    .btn-gen:hover{opacity:.9}
    .f-post{background:#fff;border-radius:22px;padding:14px;margin-bottom:14px;border:1px solid #FDF2F4;animation:p .4s backwards}
    .f-head{display:flex;gap:10px;align-items:center;margin-bottom:8px}
    .f-av{width:38px;height:38px;border-radius:50%;background:#FFF0F3;display:flex;align-items:center;justify-content:center;color:#ff85a2;font-size:14px;border:1px solid #FFD1DC}
    .f-auth{font-weight:400;color:#444;font-size:13px}
    .f-txt{font-size:12px;color:#666;line-height:1.5}
    .f-foot{margin-top:8px;color:#ffb6c1;font-size:11px}
    .loader{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:60px}
    .spin{width:32px;height:32px;border:2px solid #FFF0F3;border-top-color:#ff85a2;border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .timeline{padding-bottom:10px}
    .t-date{font-size:12px;color:#ffb6c1;padding:8px 0 6px;border-bottom:1px dashed #FFE8EE;margin:12px 0 8px}
    .m-card{background:#FFFBFC;border:1px solid #FFE8EE;border-radius:18px;padding:12px;margin-bottom:10px;position:relative;transition:box-shadow .2s,transform .2s}
    .m-card:hover{box-shadow:0 3px 10px rgba(255,182,193,.1);transform:translateY(-2px)}
    .m-card.lock{opacity:.6;background:#FFF5F7}
    .m-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .m-ch{font-weight:400;color:#444;font-size:13px}
    .m-tm{font-size:9px;color:#ccc}
    .m-rp{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0;font-size:10px;color:#888}
    .m-rp span{background:#FFF0F3;padding:2px 6px;border-radius:8px}
    .m-mood{font-size:11px;color:#666;margin:6px 0 8px}
    .m-txt{font-size:12px;color:#555;line-height:1.6;white-space:pre-wrap;margin-bottom:10px}
    .m-txt.lock{color:#bbb;font-style:italic}    .m-act{display:flex;gap:6px;justify-content:flex-end;border-top:1px solid #FFE8EE;padding-top:8px}
    .m-btn-ic{width:26px;height:26px;border-radius:50%;border:none;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;color:#ffb6c1}
    .m-btn-ic:hover{background:#FFF0F3}
    .m-btn-ic.act{color:#FFD700}
    .m-btn-ic.del:hover{background:#FFE0E0;color:#ff6b6b}
    .lock-ov{position:absolute;inset:0;background:rgba(255,255,255,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;z-index:1}
    .lock-txt{font-size:11px;color:#ffb6c1}
    .filter{display:flex;gap:6px;padding:8px;background:#FFF9FA;border-radius:14px;margin-bottom:12px;flex-wrap:wrap}
    .filter select,.filter input{flex:1;min-width:100px;padding:6px 10px;border:1px solid #FFD1DC;border-radius:12px;background:#fff;color:#666;font-family:'Mitr';font-size:11px}
    .empty{text-align:center;color:#ffb6c1;padding:30px 15px;font-size:12px}
    .set-sec{margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #FFF0F3}
    .set-sec:last-child{border:none}
    .set-tit{font-size:13px;color:#ff85a2;margin-bottom:10px;font-weight:400;display:flex;align-items:center;gap:6px}
    .set-row{margin-left:4px;display:flex;flex-direction:column;gap:6px;font-size:11px;color:#666}
    .set-row select,.set-row input[type="number"],.set-row input[type="text"]{width:100%;padding:8px 10px;border:1px solid #FFD1DC;border-radius:12px;background:#FFF9FA;color:#ff85a2;font-family:'Mitr';font-size:11px;outline:none}
    .set-btn{padding:6px 14px;border-radius:12px;border:none;background:#FFF0F3;color:#ff85a2;font-family:'Mitr';font-size:10px;cursor:pointer;transition:.2s}
    .set-btn:hover{background:#FFE0E6}
    .set-btn.d{background:#FFE0E0;color:#ff6b6b}
    .set-btn.d:hover{background:#FFCCCC}
    .chk{display:flex;align-items:center;gap:6px;font-size:11px;color:#666;cursor:pointer}
    @media(max-width:768px){#lumi-main-fab{width:40px;height:40px}.lumi-menu{width:calc(100vw-30px);right:15px!important}.modal{width:96%;border-radius:26px}}`;
    document.head.appendChild(s);
}

function spawnHeartEffect(e){const h=document.createElement('div');h.className='lumi-heart';h.innerHTML=svgHeart;h.style.left=e.clientX+'px';h.style.top=e.clientY+'px';document.body.appendChild(h);setTimeout(()=>h.remove(),800);}

// ═══════════════════════════════════════════════ MODAL ═══════════════════════════════════════════════
function openLumiModal(t){$('.lumi-menu').fadeOut(150);$('.overlay').css('display','flex').hide().fadeIn(200);if(t==='forum')renderForum();else if(t==='diary')renderDiary();else if(t==='phone'){$('#m-tit').text('📱 Phone');$('.m-body').html(`<div class="setup"><div style="font-size:30px;opacity:.7">📱</div><div>Phone</div><div style="font-size:10px;color:#ccc">Coming Soon 🌸</div></div>`);$('.m-opt').hide();}}

function renderForum(){const s=extension_settings[extensionName],b=$('.m-body');b.empty();$('#m-tit').text('💬 Social Forum');if(!s.isForumInitialized){$('.m-opt').hide();b.html(`<div class="setup"><div style="color:#ff85a2;font-size:13px">ระบุหัวข้อฟอรั่ม</div><input id="f-inp" class="lumi-input" placeholder="เช่น มหาวิทยาลัยเวทมนตร์..." value="${escapeHtml(s.forumTopic)}"><label class="chk"><input id="f-npc" type="checkbox" ${s.includeRandomNPCs?'checked':''}><span>สร้าง NPC เสริม</span></label><button id="f-gen" class="btn-gen">เริ่มสร้าง ✨</button></div>`);$('#f-gen').on('click',()=>{const t=$('#f-inp').val().trim();if(!t)return; s.forumTopic=t;s.includeRandomNPCs=$('#f-npc').prop('checked');s.isForumInitialized=true;s.forumData=[];SillyTavern.getContext().saveSettingsDebounced();renderForum();});}else{$('.m-opt').show();if(!s.forumData?.length){b.html(`<div class="loader"><div class="spin"></div><div style="color:#ff85a2;font-size:12px">AI กำลังประมวลผล...</div></div>`);genForum(s.forumTopic, getNPCs(), s.includeRandomNPCs).then(p=>{if(!p?.length){s.isForumInitialized=false;SillyTavern.getContext().saveSettingsDebounced();renderForum();return;}s.forumData=p;SillyTavern.getContext().saveSettingsDebounced();renderForum();});}else{b.append(`<div style="font-size:10px;color:#ffb6c1;text-align:center;margin-bottom:10px;letter-spacing:1px">TOPIC: ${escapeHtml(s.forumTopic.toUpperCase())}</div>`);s.forumData.forEach((p,i)=>{b.append(`<div class="f-post" style="animation-delay:${i*.05}s"><div class="f-head"><div class="f-av">${(p.author||'?')[0]}</div><div><div class="f-auth">${escapeHtml(p.author||'Unknown')}</div><div style="font-size:9px;color:#ccc">${escapeHtml(p.time||'now')}</div></div></div><div class="f-txt">${escapeHtml(p.content||'')}</div><div class="f-foot">❤️ ${p.likes||0}</div></div>`);});b.append(`<div style="text-align:center;margin-top:8px"><button id="f-ref" class="btn-gen" style="padding:6px 20px;font-size:11px">🔄 Refresh</button></div>`);$('#f-ref').on('click',()=>{s.forumData=[];SillyTavern.getContext().saveSettingsDebounced();renderForum();});}}
}

async function genForum(topic, npcs, rand){return await callAI(`[System: JSON array only. Topic:"${topic}"|Chars:[${npcs.join(',')}]|${rand?'Can add new':'Strict only'}]\nGenerate 4 Thai social posts. Format:[{"author":"ชื่อ","content":"ข้อความ","likes":12,"time":"5m ago"}]`);}

// ═══════════════════════════════════════════════ DIARY 3.0 ═══════════════════════════════════════════════
function renderDiary(){
    const s=extension_settings[extensionName],b=$('.m-body'),cn=getChar();
    $('#m-tit').text(`📖 ${cn}'s Memories`);$('.m-opt').show().attr('title','ตั้งค่า');
    const wm=s.diary.worldMode==='auto'?detectWM():s.diary.worldMode;
    const chars=[cn,...getNPCs(5)].filter((v,i,a)=>a.indexOf(v)===i);
    b.html(`<div style="margin-bottom:12px;text-align:center"><button id="d-manual" class="btn-gen" style="width:100%;max-width:280px">✨ บันทึกความทรงจำตอนนี้</button></div>
    <div class="filter"><select id="f-c"><option value="">👤 ทุกตัวละคร</option>${chars.map(c=>`<option value="${escapeHtml(c)}" ${c===cn?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select><select id="f-w"><option value="">🌍 ทุกโหมด</option><option value="solo" ${wm==='solo'?'selected':''}>👤 Solo</option><option value="rpg" ${wm==='rpg'?'selected':''}>🌐 RPG</option></select><input id="f-q" placeholder="🔍 ค้นหา..."></div><div id="t-pan" class="timeline"></div>`);
    loadTimeline();
    $('#f-c,#f-w,#f-q').on('change keyup', debounce(()=>loadTimeline(),250));
    $('#d-manual').on('click',()=>{$('#d-manual').prop('disabled',true).text('⏳ กำลังอ่านความในใจ...'); genDiary({trig:'manual', npc:wm==='rpg'?getNPCs(3):[]}).then(d=>{$('#d-manual').prop('disabled',false).text('✨ บันทึกความทรงจำตอนนี้'); if(!d)return; const m={id:"mem_"+Date.now(),timestamp:new Date().toISOString(),trigger:'manual',character:cn,characterId:SillyTavern.getContext().characterId,worldMode:wm,linkedChars:wm==='rpg'?getNPCs(3):[],content:{...d,eventType:null},meta:{isFavorite:false,isPinned:false,isHidden:false,isSecret:false,unlockCondition:null,tags:extractTags(d.diary),contextSnip:d.diary.slice(0,150)}}; saveMem(m); loadTimeline(); showToast('✨ บันทึกความทรงจำใหม่แล้ว');});});
    $('.m-opt').off('click').on('click',()=>renderSettings());
}

function loadTimeline(){
    const f={char:$('#f-c').val()||null, wm:$('#f-w').val()||null, sec:extension_settings[extensionName].diary.display.showSecret};    const q=$('#f-q').val()?.toLowerCase()||'';
    let mem=loadMem(f); if(q)mem=mem.filter(m=>m.content.diary?.toLowerCase().includes(q)||m.content.mood?.toLowerCase().includes(q));
    const p=$('#t-pan'); if(!mem.length){p.html(`<div class="empty"><div style="font-size:28px;margin-bottom:8px">📭</div><div>ยังไม่มีบันทึกความทรงจำ</div></div>`);return;}
    const g={}; mem.forEach(m=>{const k=m.content.rp_date||m.timestamp.split('T')[0];if(!g[k])g[k]=[];g[k].push(m);});
    let h=''; for(const[k,e]of Object.entries(g)){h+=`<div class="t-date">📅 ${escapeHtml(k)}</div>`;e.forEach(x=>h+=mCard(x));} p.html(h); bindCard();
}

function mCard(e){
    const lk=e.meta.isSecret&&!checkUnlock(e);
    return `<div class="m-card ${lk?'lock':''}" data-id="${e.id}">${lk?`<div class="lock-ov">${svgLock}<div class="lock-txt">🔒 ความทรงจำนี้ยังมองไม่เห็น</div></div>`:''}
    <div class="m-hd"><span class="m-ch">${escapeHtml(e.character)}</span><span class="m-tm">${escapeHtml(e.content.rp_date||'')}</span></div>
    <div class="m-rp"><span>📍 ${escapeHtml(e.content.rp_location||'ไม่ระบุ')}</span><span>🌤️ ${escapeHtml(e.content.rp_weather||'ไม่ระบุ')}</span></div>
    <div class="m-mood">${getMoodEmoji(e.content.mood)} ${escapeHtml(e.content.mood||'')} · <span style="color:${getAffColor(e.content.affection_score)}">❤️ ${e.content.affection_score||0}</span></div>
    <div class="m-txt ${lk?'lock':''}">${lk?'...':escapeHtml(e.content.diary)}</div>
    ${!lk?`<div class="m-act"><button class="m-btn-ic ${e.meta.isPinned?'act':''}" data-a="pin" title="ปักหมุด">${e.meta.isPinned?svgPin:svgUnpin}</button><button class="m-btn-ic ${e.meta.isFavorite?'act':''}" data-a="fav" title="เก็บไว้">${e.meta.isFavorite?svgStar:svgUnpin}</button><button class="m-btn-ic" data-a="ctx" title="ดูบริบท">🔍</button><button class="m-btn-ic del" data-a="del" title="ลบ">🗑️</button></div>`:''}</div>`;
}

function bindCard(){
    $('.m-btn-ic[data-a="pin"]').off('click').on('click',function(e){e.stopPropagation();toggleMeta($(this).closest('.m-card').data('id'),'isPinned');});
    $('.m-btn-ic[data-a="fav"]').off('click').on('click',function(e){e.stopPropagation();toggleMeta($(this).closest('.m-card').data('id'),'isFavorite');});
    $('.m-btn-ic[data-a="ctx"]').off('click').on('click',function(e){e.stopPropagation();showContext($(this).closest('.m-card').data('id'));});
    $('.m-btn-ic[data-a="del"]').off('click').on('click',function(e){e.stopPropagation();if(confirm('ลบความทรงจำนี้?')){delMem($(this).closest('.m-card').data('id'));$(this).closest('.m-card').fadeOut(200,()=>{$(this).remove();if(!$('.m-card').length)loadTimeline();});showToast('🗑️ ลบแล้ว');}});
}

function toggleMeta(id,key){const m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m){m.meta[key]=!m.meta[key];SillyTavern.getContext().saveSettingsDebounced();loadTimeline();}}
function delMem(id){const s=extension_settings[extensionName];s.memories=s.memories.filter(x=>x.id!==id);SillyTavern.getContext().saveSettingsDebounced();}
function showContext(id){const m=extension_settings[extensionName].memories.find(x=>x.id===id);if(m){alert(`🔍 บริบทที่ใช้เจน:\n"${m.meta.contextSnip}..."`);}}
function getMoodEmoji(m){return{'ตื่นเต้น':'😳','ดีใจ':'😊','อบอุ่น':'🥰','รัก':'💖','เสียใจ':'😢','โกรธ':'😠','สับสน':'😕'}[m]||'🌸';}
function getAffColor(s){return s>=80?'#FF4D79':s>=60?'#FF85A2':s>=40?'#FFB6C1':s>=20?'#FFD1DC':'#CCC';}
function debounce(f,w){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),w);};}

// ═══════════════════════════════════════════════ SETTINGS 3.0 ═══════════════════════════════════════════════
function renderSettings(){
    const s=extension_settings[extensionName].diary;
    $('#m-tit').text('⚙️ ตั้งค่า');
    $('.m-body').html(`<div style="padding:4px;">
        <div class="set-sec"><div class="set-tit">🌍 โหมดโลก</div><div class="set-row"><select id="s-wm"><option value="auto" ${s.worldMode==='auto'?'selected':''}>🤖 อัตโนมัติ</option><option value="solo" ${s.worldMode==='solo'?'selected':''}>👤 เดี่ยว</option><option value="rpg" ${s.worldMode==='rpg'?'selected':''}>🌐 กลุ่ม</option></select></div></div>
        <div class="set-sec"><div class="set-tit">⚙️ สร้างอัตโนมัติ</div><div class="set-row"><label class="chk"><input type="checkbox" id="s-en" ${s.autoGen.enabled?'checked':''}><span>เปิดใช้งาน</span></label><select id="s-tt"><option value="turn_count" ${s.autoGen.triggerType==='turn_count'?'selected':''}>🔢 ทุก X ข้อความ</option><option value="emotion" ${s.autoGen.triggerType==='emotion'?'selected':''}>💬 คำอารมณ์</option><option value="random" ${s.autoGen.triggerType==='random'?'selected':''}>🎲 สุ่ม</option></select><div id="s-tc" style="display:${s.autoGen.triggerType==='turn_count'?'block':'none'}"><input type="number" id="s-ti" value="${s.autoGen.turnInterval}" min="5" max="100" placeholder="จำนวนข้อความ"></div><div id="s-ec" style="display:${s.autoGen.triggerType==='emotion'?'block':'none'}"><input type="text" id="s-ek" value="${s.autoGen.emotionKeywords.join(',')}" placeholder="รัก,โกรธ,เสียใจ"></div></div></div>
        <div class="set-sec"><div class="set-tit">🔒 ความลับ & การแสดงผล</div><div class="set-row"><label class="chk"><input type="checkbox" id="s-ss" ${s.display.showSecret?'checked':''}><span>แสดงภาพซ้อน</span></label><select id="s-sm"><option value="affection" ${s.display.secretUnlockMode==='affection'?'selected':''}>❤️ ความสัมพันธ์ ≥80</option><option value="event" ${s.display.secretUnlockMode==='event'?'selected':''}>🎉 3 วันหลังเกิด</option><option value="manual" ${s.display.secretUnlockMode==='manual'?'selected':''}>✋ แมนนวล</option></select></div></div>
        <div class="set-sec"><div class="set-tit">🛠️ เครื่องมือ</div><div class="set-row" style="flex-direction:row;flex-wrap:wrap;gap:8px"><button id="s-rpos" class="set-btn">📍 รีเซ็ตตำแหน่งปุ่ม</button><button id="s-exp" class="set-btn">📤 Export</button><button id="s-clr" class="set-btn d">🗑️ ล้างความทรงจำ</button></div></div>
        <div style="text-align:center;margin-top:16px"><button id="s-sav" class="btn-gen" style="width:100%;max-width:280px">💾 บันทึกการตั้งค่า</button></div>
    </div>`);
    $('#s-tt').on('change',function(){$('#s-tc').toggle($(this).val()==='turn_count');$('#s-ec').toggle($(this).val()==='emotion');});
    $('#s-sav').on('click',()=>{const s=extension_settings[extensionName].diary; s.worldMode=$('#s-wm').val();s.autoGen.enabled=$('#s-en').prop('checked');s.autoGen.triggerType=$('#s-tt').val();s.autoGen.turnInterval=parseInt($('#s-ti').val())||20;s.autoGen.emotionKeywords=$('#s-ek').val().split(',').map(k=>k.trim()).filter(k=>k);s.display.showSecret=$('#s-ss').prop('checked');s.display.secretUnlockMode=$('#s-sm').val();SillyTavern.getContext().saveSettingsDebounced();showToast('✅ บันทึกแล้ว');setTimeout(renderDiary,400);});
    $('#s-rpos').on('click',()=>{extension_settings[extensionName]._internal.fabPos={bottom:'90px',right:'20px',top:'auto',left:'auto'};$('#lumi-main-fab').css({bottom:'90px',right:'20px',top:'auto',left:'auto'});showToast('📍 รีเซ็ตตำแหน่งแล้ว');});
    $('#s-exp').on('click',()=>{const b=new Blob([JSON.stringify(extension_settings[extensionName].memories,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`lumi-mem-${new Date().toISOString().split('T')[0]}.json`;a.click();showToast('📤 Export เสร็จ');});
    $('#s-clr').on('click',()=>{if(confirm('ล้างความทรงจำทั้งหมด?')){extension_settings[extensionName].memories=[];SillyTavern.getContext().saveSettingsDebounced();showToast('🗑️ ล้างแล้ว');setTimeout(renderDiary,400);}});
}

// ═══════════════════════════════════════════════ FAB BUTTON 3.0 ═══════════════════════════════════════════════function spawnLumiButton(){
    $('#lumi-main-fab,.lumi-menu').remove(); console.log("[Lumi] 🔄 สร้าง FAB...");
    if(!document.body){setTimeout(spawnLumiButton,800);return;}
    const fab=document.createElement('div'); fab.id='lumi-main-fab'; fab.className='lumi-floating';
    fab.innerHTML=`<img src="${btnUrl}" alt="Lumi">`;
    const pos=extension_settings[extensionName]._internal.fabPos;
    fab.style.bottom=pos.bottom||'90px'; fab.style.right=pos.right||'20px'; fab.style.top=pos.top||'auto'; fab.style.left=pos.left||'auto';
    document.body.appendChild(fab);

    const menu=document.createElement('div'); menu.className='lumi-menu';
    menu.innerHTML=`<div class="lumi-menu-grid"><div class="lumi-mi" id="mi-d"><img src="${iconDiary}"><span>Diary</span></div><div class="lumi-mi" id="mi-p"><img src="${iconPhone}"><span>Phone</span></div><div class="lumi-mi" id="mi-f"><img src="${iconForum}"><span>Forum</span></div></div><div style="text-align:center;margin-top:14px;font-size:10px;color:#ffb6c1;letter-spacing:2px">LUMIPULSE</div>`;
    document.body.appendChild(menu);

    function updatePos(){const r=fab.getBoundingClientRect(),m=$(menu);let l=r.left-(m.outerWidth()/2)+(r.width/2),t=r.top-m.outerHeight()-10;if(l<10)l=10;if(l+m.outerWidth()>window.innerWidth-10)l=window.innerWidth-m.outerWidth()-10;if(t<10)t=r.bottom+10;m.css({left:l+'px',top:t+'px'});}

    let isDrag=false, moved=false, startX, startY;
    const TH=10;
    const endDrag=()=>{isDrag=false;moved=false;fab.classList.add('lumi-floating');if(pos)pos={bottom:'auto',right:'auto',top:fab.style.top,left:fab.style.left};extension_settings[extensionName]._internal.fabPos=pos;SillyTavern.getContext().saveSettingsDebounced();};
    const moveDrag=(cx,cy)=>{if(!isDrag&&Math.sqrt((cx-startX)**2+(cy-startY)**2)>TH){isDrag=true;fab.classList.remove('lumi-floating');}if(isDrag){moved=true;fab.style.left=(cx-(fab.offsetWidth/2))+'px';fab.style.top=(cy-(fab.offsetHeight/2))+'px';fab.style.right='auto';fab.style.bottom='auto';updatePos();}};

    fab.addEventListener('mousedown',e=>{if(e.button===2)return;e.preventDefault();startX=e.clientX;startY=e.clientY;isDrag=false;moved=false;fab.classList.remove('lumi-floating');const mv=ev=>moveDrag(ev.clientX,ev.clientY);const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);endDrag();if(!moved){openLumiMenu();}};document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);});
    fab.addEventListener('touchstart',e=>{e.preventDefault();startX=e.touches[0].clientX;startY=e.touches[0].clientY;isDrag=false;moved=false;fab.classList.remove('lumi-floating');},{passive:false});
    fab.addEventListener('touchmove',e=>{e.preventDefault();moveDrag(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    fab.addEventListener('touchend',()=>{endDrag();if(!moved)openLumiMenu();});

    function openLumiMenu(){updatePos();$('.lumi-menu').fadeIn(200);}
    $(document).off('click','.lumi-mi').on('click','.lumi-mi',function(){const t=this.id.replace('mi-','');openLumiModal(t);});
}

// ═══════════════════════════════════════════════ MODAL SHELL & PANEL ═══════════════════════════════════════════════
function createContentModal(){
    if($('.overlay').length)return;
    $('body').append(`<div class="overlay"><div class="modal"><div class="m-head"><div class="m-btn m-opt">${svgSettings}</div><span id="m-tit"></span><div class="m-btn m-close">✕</div></div><div class="m-body"></div></div></div>`);
    $('.overlay').on('click',function(e){if(e.target.classList.contains('overlay'))$(this).fadeOut(150);});
    $(document).off('click','.m-close').on('click','.m-close',()=>$('.overlay').fadeOut(150));
}

function createSettingsUI(){
    $('#extensions_settings').append(`<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color:#ff85a2;font-family:'Mitr';font-weight:300;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="font-family:'Mitr';font-weight:300;display:flex;flex-direction:column;gap:10px;padding:15px 0;"><label class="chk"><input id="lumi-en" type="checkbox"><span>เปิดใช้งาน LumiPulse</span></label><button id="lumi-res" class="menu_button">🗑️ ล้างข้อมูลทั้งหมด</button><div style="font-size:9px;color:#ffb6c1;margin-top:5px;line-height:1.4">v3.0 · 🌸 Forum · 📖 Memories · 📱 Phone</div></div></div>`);
    $('#lumi-en').prop('checked', extension_settings[extensionName].isEnabled);
    $(document).on('change','#lumi-en',function(){const en=$(this).prop('checked');extension_settings[extensionName].isEnabled=en;SillyTavern.getContext().saveSettingsDebounced();if(en){setTimeout(()=>{spawnLumiButton();createContentModal();setupAutoTrigger();},400);}else{$('#lumi-main-fab,.lumi-menu,.overlay').remove();$(document).off('messageReceived',onNewMsg);}});
    $(document).on('click','#lumi-res',()=>{const s=extension_settings[extensionName];s.isForumInitialized=false;s.forumTopic="";s.forumData=[];s.diaryData=null;s.memories=[];s._internal.messageCounter=0;SillyTavern.getContext().saveSettingsDebounced();showToast("🗑️ ล้างข้อมูลแล้ว");});
}

function showToast(m,t='info'){if(typeof toastr!=='undefined')toastr[t](m,'🌸 LumiPulse');}
