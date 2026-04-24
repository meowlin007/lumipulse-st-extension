"use strict";

const extensionName = "lumipulse-st-extension";

// ⚙️ ค่าเริ่มต้นการตั้งค่า
const defaultSettings = {
    isEnabled: true,
    memories: [],
    _internal: {
        messageCounter: 0,
        firstChatDate: null,
        fabPosition: null // { top, left, right, bottom, transform }
    },
    diary: {
        worldMode: 'auto', // auto, solo, rpg
        autoGen: { 
            enabled: true, 
            triggerType: 'turn_count', // turn_count, emotion, random, user_tag
            turnInterval: 20, 
            emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว','หวง'], 
            randomChance: 0.08 
        },
        display: { 
            viewMode: 'timeline', 
            showSecret: true, 
            secretUnlockMode: 'ai' // ai, affection, time, manual
        },
        storage: { maxEntries: 50, autoSave: true },
        generation: { 
            messageRange: 30, 
            useAllMessages: false, 
            startFromIndex: 0 
        }
    }
};

let extension_settings = {};

// 🖼️ ลิงค์ไอคอน (ตามคำขอ)
const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// 🎨 SVG Vector Icons (สำหรับปุ่มในระบบ)
const svgHeart    = `<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FFB6C1"/></svg>`;
const svgPin      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgRef      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const svgStar     = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock     = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgTrash    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const svgClose    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgBack     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgMapPin   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgCloud    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT SYSTEM
// ═══════════════════════════════════════════════
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
    if (!ctx.extensionSettings[extensionName]) {
        ctx.extensionSettings[extensionName] = JSON.parse(JSON.stringify(defaultSettings));
        ctx.saveSettingsDebounced();
    }
    extension_settings = ctx.extensionSettings;
    
    // Inject Styles & UI
    injectStyles();
    createSettingsUI();
    
    if (extension_settings[extensionName].isEnabled) {
        setTimeout(() => {
            spawnLumiButton();
            createContentModal();
            setupAutoTriggerListener();
        }, 800);
    }
    
    // Heart Effect Listener
    document.addEventListener('click', (e) => {
        if (!e._fromDrag) spawnHeartEffect(e);
    });
}

// ═══════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════
function getCharacterName() { return SillyTavern.getContext().name2 || "ตัวละคร"; }
function getUserName() { return SillyTavern.getContext().name1 || "ผู้เล่น"; }

function escapeHtml(t) {
    if (typeof t !== 'string') return '';
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function generateColorFromString(str) {
    const colors = ['#FFB6C1', '#E6D5F0', '#B6D7F0', '#B6F0D7', '#F0E6B6', '#F0B6D7'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// 🧠 ตรวจจับตัวละครในโลก RPG
function getRPGCharacters(limit = 10) {
    const ctx = SillyTavern.getContext();
    const characters = [];
    const currentChar = ctx.characters?.[ctx.characterId];
    
    if (currentChar) {
        characters.push({ name: currentChar.name, color: generateColorFromString(currentChar.name) });
    }
    
    // สแกนจากการ์ดอื่น
    if (ctx.characters) {
        Object.values(ctx.characters).forEach(c => {
            if (c.name && !characters.find(x => x.name === c.name)) {
                characters.push({ name: c.name, color: generateColorFromString(c.name) });
            }
        });
    }
    
    // สแกนจากแชทล่าสุด
    const chat = ctx.chat || [];
    chat.slice(-100).forEach(m => {
        if (m.name && !m.is_user && !characters.find(x => x.name === m.name)) {
            characters.push({ name: m.name, color: generateColorFromString(m.name) });
        }
    });
    
    return characters.slice(0, limit);
}

function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set();
    chat.slice(-50).forEach(m => { if (m.name && !m.is_user && !m.is_system) names.add(m.name); });
    return names.size > 2 ? 'rpg' : 'solo';
}

function extractTags(text) {
    const tags = [], kw = { '#โรแมนติก':['รัก','หัวใจ','ชอบ'],'#ดราม่า':['เสียใจ','ร้องไห้'],'#ตลก':['ขำ','ตลก'] }, l = text.toLowerCase();
    for(const[k,v]of Object.entries(kw)) if(v.some(w=>l.includes(w))) tags.push(k);
    return tags.slice(0, 3);
}

// ═══════════════════════════════════════════════
// AI & MEMORY SYSTEM
// ═══════════════════════════════════════════════
async function callSTGenerate(prompt) {
    try {
        const ctx = SillyTavern.getContext();
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(prompt, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(prompt, true);
        else if (typeof window.generateQuietPrompt === 'function') res = await window.generateQuietPrompt(prompt, false, false);
        else if (typeof window.generateRaw === 'function') res = await window.generateRaw(prompt, true);
        
        if (!res) return null;
        const match = res.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    } catch (e) {
        console.error('[LumiPulse] AI Error:', e);
        return null;
    }
}

async function generateDiaryEntry(options = {}) {
    const { range = 30, useAll = false, startIndex = 0 } = options;
    const ctx = SillyTavern.getContext();
    const charName = getCharacterName();
    let wm = extension_settings[extensionName].diary.worldMode;
    if (wm === 'auto') wm = detectWorldMode();

    // ตัดข้อความตามตัวเลือกผู้ใช้
    const allChat = ctx.chat || [];
    const endIndex = useAll ? allChat.length : Math.min(startIndex + range, allChat.length);
    const startIdx = useAll ? 0 : Math.max(0, endIndex - range);
    const chatSlice = allChat.slice(startIdx, endIndex);
    
    const chatLog = chatSlice.map((m, i) => `[${startIdx+i+1}] ${m.is_user?'User':m.name||'NPC'}: ${m.mes.slice(0,100)}`).join('\n');

    const prompt = `[System: You are ${charName}'s inner voice. Respond ONLY with valid JSON.]
Context: World Mode: ${wm}, Others: ${getChatNPCs(3).join(',')}
Chat Log:
${chatLog}

Create a diary entry. Infer fictional date, location, and weather from context.
Decide if this is a 'Secret' (isSecret: true) if it contains deep vulnerabilities.
Return ONLY JSON in Thai:
{
  "rp_date": "วันที่สมมติในเกม",
  "rp_location": "สถานที่",
  "rp_weather": "สภาพอากาศ",
  "affection_score": 0-100,
  "mood": "อารมณ์สั้นๆ",
  "diary": "เนื้อหาไดอารี่ 3-5 ประโยค",
  "isSecret": true/false,
  "refIndex": ${startIdx}
}`;
    return await callSTGenerate(prompt);
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
    // Filter Secret
    const unlockMode = extension_settings[extensionName].diary.display.secretUnlockMode;
    if (!extension_settings[extensionName].diary.display.showSecret) {
        mem = mem.filter(m => !m.meta.isSecret);
    }
    return mem.sort((a,b) => (b.meta.isPinned?1:0) - (a.meta.isPinned?1:0) || new Date(b.timestamp) - new Date(a.timestamp));
}

// ═══════════════════════════════════════════════
// AUTO TRIGGER
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).off('messageReceived', onNewChat).on('messageReceived', onNewChat);
}

async function onNewChat() {
    const s = extension_settings[extensionName], cfg = s.diary.autoGen;
    if (!cfg.enabled) return;
    s._internal.messageCounter++;
    
    const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
    let gen = false;
    
    if (cfg.triggerType === 'turn_count' && s._internal.messageCounter >= cfg.turnInterval) { gen=true; s._internal.messageCounter=0; }
    else if (cfg.triggerType === 'emotion' && cfg.emotionKeywords.some(k => lastMsg.includes(k))) { gen=true; }
    else if (cfg.triggerType === 'random' && Math.random() < cfg.randomChance) { gen=true; }
    else if (lastMsg.includes('#จำ') || lastMsg.includes('#diary')) { gen=true; }
    
    if (gen) {
        const res = await generateDiaryEntry({ range: s.diary.generation.messageRange });
        if (res) {
            const ctx = SillyTavern.getContext();
            saveMemory({
                id: 'mem_'+Date.now(), timestamp: new Date().toISOString(),
                character: getCharacterName(), worldMode: detectWorldMode(),
                content: { ...res },
                meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, tags: extractTags(res.diary), refIndex: res.refIndex }
            });
            showToast('🌸 มีความทรงจำใหม่เกิดขึ้น...');
        }
    }
}

// ═══════════════════════════════════════════════
// STYLES (Y2K Pink Pastel)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const s = document.createElement('style');
    s.id = 'lumi-styles';
    s.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');
        :root { --lumi-pink: #FFB6C1; --lumi-soft: #FFF0F5; --lumi-glass: rgba(255,255,255,0.85); }
        @keyframes pop { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
        @keyframes floatHeart { 0%{opacity:1;transform:translate(-50%,-50%) scale(0.5)} 100%{opacity:0;transform:translate(-50%,-100px) scale(1.5)} }
        
        /* 📱 Floating Button (Glassmorphism) */
        #lumi-fab {
            position: fixed; z-index: 99999; width: 42px; height: 42px; border-radius: 50%;
            background: var(--lumi-glass) url('${btnUrl}') no-repeat center center;
            background-size: 22px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 15px rgba(255,182,193,0.3);
            cursor: grab; touch-action: none; user-select: none; transition: transform 0.2s;
        }
        #lumi-fab:active { cursor: grabbing; transform: scale(0.95); }
        
        /* 📋 Menu */
        .lumi-menu {
            position: fixed; z-index: 99998; display: none;
            background: rgba(255,255,255,0.95); backdrop-filter: blur(15px);
            border-radius: 20px; padding: 15px; border: 1px solid rgba(255,182,193,0.2);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); font-family: 'Mitr', sans-serif;
        }
        .lumi-menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; opacity: 0.8; transition: 0.2s; }
        .lumi-menu-item:hover { opacity: 1; transform: translateY(-3px); }
        .lumi-menu-item img { width: 36px; height: 36px; object-fit: contain; }
        .lumi-menu-item span { font-size: 10px; color: #ff85a2; }

        /* 🖼️ Modal */
        .lumi-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
            background: rgba(0,0,0,0.3); backdrop-filter: blur(5px);
            z-index: 100000; display: none; align-items: center; justify-content: center;
        }
        .lumi-modal-box {
            width: 92%; max-width: 480px; height: 85vh; background: #fff;
            border-radius: 24px; border: 1px solid #FFD1DC;
            box-shadow: 0 20px 50px rgba(255,105,180,0.15);
            display: flex; flex-direction: column; overflow: hidden;
            font-family: 'Mitr', sans-serif; animation: pop 0.3s ease;
        }
        .lumi-header {
            padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #FFF0F5; background: #FFFBFC;
        }
        .lumi-header h3 { margin: 0; font-size: 16px; color: #ff85a2; font-weight: 400; }
        .lumi-btn-icon {
            width: 30px; height: 30px; border-radius: 50%; background: #FFF0F5; border: none;
            display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff85a2;
        }
        .lumi-body { flex: 1; overflow-y: auto; padding: 15px; background: #fff; }

        /* 📝 Diary Cards */
        .lumi-nav { display: flex; gap: 10px; margin-bottom: 15px; }
        .lumi-nav button {
            flex: 1; padding: 8px; border: 1px solid #FFE8EE; background: #fff;
            border-radius: 12px; color: #ff85a2; font-family: 'Mitr'; cursor: pointer;
        }
        .lumi-nav button.active { background: #FFB6C1; color: white; border-color: #FFB6C1; }
        
        .lumi-card {
            background: #FFFBFC; border: 1px solid #FFE8EE; border-radius: 16px;
            padding: 14px; margin-bottom: 12px; position: relative; transition: 0.2s;
        }
        .lumi-card:hover { box-shadow: 0 5px 15px rgba(255,182,193,0.1); transform: translateY(-2px); }
        .lumi-card.pinned { border: 1px solid #FFD700; background: #FFFDF5; }
        .lumi-card.locked { background: #F8F9FA; opacity: 0.7; }
        
        .lumi-meta { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
        .lumi-badge {
            font-size: 10px; padding: 3px 8px; border-radius: 8px; background: #FFF0F5;
            color: #ff85a2; display: flex; align-items: center; gap: 4px;
        }
        .lumi-text { font-size: 13px; color: #555; line-height: 1.6; white-space: pre-wrap; margin: 10px 0; }
        .lumi-actions { display: flex; gap: 8px; justify-content: flex-end; border-top: 1px dashed #FFE8EE; padding-top: 8px; }
        .lumi-act-btn { background: none; border: none; cursor: pointer; color: #ffb6c1; opacity: 0.6; transition: 0.2s; }
        .lumi-act-btn:hover { opacity: 1; color: #ff69b4; }
        .lumi-act-btn.active { opacity: 1; color: #FFD700; }

        /* RPG Columns */
        .lumi-rpg-cols { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
        .lumi-col { background: #FFFBFC; border: 1px solid #FFE8EE; border-radius: 16px; padding: 10px; }
        .lumi-col-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #FFE8EE; }
        .lumi-avatar { width: 24px; height: 24px; border-radius: 50%; background: #FFB6C1; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }

        /* Settings UI */
        .lumi-set-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; color: #666; }
        .lumi-input { width: 100%; background: #FFF9FA; border: 1px solid #FFD1DC; border-radius: 10px; padding: 8px; color: #ff85a2; font-family: 'Mitr'; outline: none; }
        .lumi-btn-gen { width: 100%; background: linear-gradient(135deg, #FFB6C1, #FF85A2); color: white; border: none; padding: 12px; border-radius: 12px; font-family: 'Mitr'; cursor: pointer; margin-top: 10px; }
        .lumi-toast {
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
            padding: 10px 20px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            z-index: 999999; font-family: 'Mitr'; font-size: 13px; color: #ff85a2;
            animation: pop 0.3s ease; pointer-events: none;
        }

        @media (max-width: 768px) { .lumi-rpg-cols { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(s);
}

// ═══════════════════════════════════════════════
// FAB BUTTON (Fixed Drag Logic)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-fab, .lumi-menu').remove();
    if (!document.body) return;

    const fab = document.createElement('div');
    fab.id = 'lumi-fab';
    
    // ตำแหน่งเริ่มต้น
    const pos = extension_settings[extensionName]._internal.fabPosition;
    if (pos) { Object.assign(fab.style, pos); }
    else { fab.style.top = '50%'; fab.style.right = '20px'; fab.style.transform = 'translateY(-50%)'; }
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}"><span>Memories</span></div>
            <div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}"><span>Phone</span></div>
            <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}"><span>Forum</span></div>
        </div>`;
    document.body.appendChild(menu);

    // 🖱️ Drag Logic
    let isDragging = false, startX, startY, initLeft, initTop;
    const THRESHOLD = 12;
    let movedDist = 0;

    function startDrag(x, y) {
        isDragging = false; movedDist = 0;
        startX = x; startY = y;
        const rect = fab.getBoundingClientRect();
        initLeft = rect.left; initTop = rect.top;
        // Reset transform for dragging
        fab.style.transform = 'none';
    }

    function moveDrag(x, y) {
        const dx = x - startX, dy = y - startY;
        movedDist = Math.hypot(dx, dy);
        if (movedDist > THRESHOLD) isDragging = true;
        if (isDragging) {
            fab.style.left = (initLeft + dx) + 'px';
            fab.style.top = (initTop + dy) + 'px';
            fab.style.right = 'auto'; fab.style.bottom = 'auto';
            $(menu).fadeOut(100);
        }
    }

    function endDrag() {
        if (isDragging) {
            // Save position
            extension_settings[extensionName]._internal.fabPosition = {
                top: fab.style.top, left: fab.style.left, right: 'auto', bottom: 'auto', transform: 'none'
            };
            SillyTavern.getContext().saveSettingsDebounced();
        } else if (movedDist < THRESHOLD) {
            // Tap -> Toggle Menu
            const r = fab.getBoundingClientRect();
            const mW = $(menu).outerWidth();
            menu.style.left = (r.left + r.width/2 - mW/2) + 'px';
            menu.style.top = (r.top - $(menu).outerHeight() - 15) + 'px';
            $(menu).fadeToggle(200);
        }
        isDragging = false;
    }

    // Mouse Events
    fab.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
        const onMove = ev => moveDrag(ev.clientX, ev.clientY);
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); endDrag(); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    // Touch Events (สำคัญมากสำหรับมือถือ)
    fab.addEventListener('touchstart', e => {
        e.preventDefault(); // ป้องกัน scroll
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    fab.addEventListener('touchmove', e => {
        e.preventDefault();
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    fab.addEventListener('touchend', e => {
        e.preventDefault();
        endDrag();
    }, { passive: false });

    // Menu Clicks
    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => { $(menu).fadeOut(); openLumiModal('diary'); });
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => { $(menu).fadeOut(); openLumiModal('phone'); });
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => { $(menu).fadeOut(); openLumiModal('forum'); });
}

// ═══════════════════════════════════════════════
// MODAL & UI SYSTEM
// ═══════════════════════════════════════════════
function createContentModal() {
    if ($('#lumi-modal-overlay').length) return;
    $('body').append(`
        <div id="lumi-modal-overlay" class="lumi-modal-overlay">
            <div class="lumi-modal-box">
                <div class="lumi-header">
                    <button class="lumi-btn-icon" id="lumi-back">${svgBack}</button>
                    <h3 id="lumi-title">Memories</h3>
                    <button class="lumi-btn-icon" id="lumi-close">${svgClose}</button>
                </div>
                <div id="lumi-body" class="lumi-body"></div>
            </div>
        </div>
    `);
    $('#lumi-close, #lumi-modal-overlay').on('click', e => { if(e.target.id === 'lumi-modal-overlay' || e.target.closest('#lumi-close')) $('#lumi-modal-overlay').fadeOut(); });
    $('#lumi-back').on('click', () => renderDiaryUI()); // กลับหน้าหลัก
}

function openLumiModal(type) {
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(200);
    if (type === 'diary') renderDiaryUI();
    else if (type === 'phone') $('#lumi-body').html('<div style="text-align:center;padding:40px;color:#ffb6c1">Coming Soon 📱</div>');
    else if (type === 'forum') $('#lumi-body').html('<div style="text-align:center;padding:40px;color:#ffb6c1">Coming Soon 💬</div>');
}

function renderDiaryUI() {
    $('#lumi-title').text(getCharacterName() + "'s Memories");
    const chars = getRPGCharacters();
    let charOpts = '<option value="">All Characters</option>';
    chars.forEach(c => charOpts += `<option value="${c.name}">${c.name}</option>`);
    
    $('#lumi-body').html(`
        <div class="lumi-nav">
            <button class="active" onclick="switchView('timeline')">Timeline</button>
            <button onclick="switchView('rpg')">RPG View</button>
            <button onclick="renderGenSettings()">✨ Gen</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:15px;">
            <select id="lumi-filter-char" class="lumi-input" style="flex:1">${charOpts}</select>
            <input id="lumi-search" class="lumi-input" placeholder="Search..." style="flex:1">
        </div>
        <div id="lumi-content"></div>
    `);
    
    $('#lumi-filter-char, #lumi-search').on('change input', () => renderTimelineContent());
    renderTimelineContent();
}

function renderTimelineContent() {
    const char = $('#lumi-filter-char').val();
    const search = $('#lumi-search').val().toLowerCase();
    let mems = loadMemories({ character: char || null });
    if (search) mems = mems.filter(m => (m.content.diary||'').toLowerCase().includes(search) || (m.content.rp_date||'').includes(search));
    
    const content = $('#lumi-content');
    if (!mems.length) { content.html('<div style="text-align:center;color:#ccc;padding:20px">No memories yet</div>'); return; }
    
    // Group by Date
    const grouped = {};
    mems.forEach(m => { const d = m.content.rp_date || 'Unknown'; if(!grouped[d]) grouped[d]=[]; grouped[d].push(m); });
    
    let html = '';
    for(const date in grouped) {
        html += `<div style="font-size:12px;color:#ffb6c1;margin:15px 0 5px;display:flex;align-items:center;gap:5px">${svgCalendar} ${date}</div>`;
        grouped[date].forEach(m => html += renderCard(m));
    }
    content.html(html);
    bindCardEvents();
}

function renderCard(m) {
    const isLocked = m.meta.isSecret && !checkUnlock(m);
    const color = generateColorFromString(m.character);
    const pinClass = m.meta.isPinned ? 'pinned' : '';
    const lockClass = isLocked ? 'locked' : '';
    
    return `
        <div class="lumi-card ${pinClass} ${lockClass}" data-id="${m.id}">
            ${isLocked ? `<div style="position:absolute;inset:0;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;border-radius:16px">${svgLock}</div>` : ''}
            <div class="lumi-meta">
                <span class="lumi-badge" style="background:${color};color:white">${m.character}</span>
                <span class="lumi-badge">${svgMapPin} ${m.content.rp_location||'?'}</span>
                <span class="lumi-badge">${svgCloud} ${m.content.rp_weather||'?'}</span>
            </div>
            <div class="lumi-text">${isLocked ? 'Locked Content...' : m.content.diary}</div>
            <div class="lumi-actions">
                <button class="lumi-act-btn ${m.meta.isPinned?'active':''}" data-act="pin" title="Pin">${svgPin}</button>
                <button class="lumi-act-btn ${m.meta.isFavorite?'active':''}" data-act="fav" title="Favorite">${svgStar}</button>
                <button class="lumi-act-btn" data-act="ref" title="Ref Chat">${svgRef}</button>
                <button class="lumi-act-btn" data-act="del" title="Delete">${svgTrash}</button>
            </div>
        </div>`;
}

function renderRPGView() {
    const mems = loadMemories({});
    const byChar = {};
    mems.forEach(m => { if(!byChar[m.character]) byChar[m.character]=[]; byChar[m.character].push(m); });
    
    let html = '<div class="lumi-rpg-cols">';
    for(const char in byChar) {
        const color = generateColorFromString(char);
        html += `<div class="lumi-col">
            <div class="lumi-col-head">
                <div class="lumi-avatar" style="background:${color}">${char[0]}</div>
                <span style="font-weight:500;font-size:13px">${char}</span>
            </div>
            ${byChar[char].map(m => renderCard(m)).join('')}
        </div>`;
    }
    html += '</div>';
    $('#lumi-content').html(html);
    bindCardEvents();
}

function renderGenSettings() {
    $('#lumi-title').text('New Memory');
    const cfg = extension_settings[extensionName].diary.generation;
    $('#lumi-body').html(`
        <div style="padding:10px;">
            <div class="lumi-set-row"><span>Range (Latest Messages)</span></div>
            <input type="range" id="gen-range" min="5" max="100" value="${cfg.messageRange}" style="width:100%;margin-bottom:10px">
            <div style="text-align:center;font-size:12px;color:#ffb6c1;margin-bottom:15px" id="range-val">${cfg.messageRange} msgs</div>
            
            <div class="lumi-set-row"><span>Start From Index</span></div>
            <input type="number" id="gen-start" class="lumi-input" value="${cfg.startFromIndex}" placeholder="0 (Latest)">
            
            <div class="lumi-set-row" style="margin-top:10px"><label><input type="checkbox" id="gen-all" ${cfg.useAllMessages?'checked':''}> Use All History</label></div>
            
            <button id="btn-gen-now" class="lumi-btn-gen">✨ Generate Memory</button>
            <div id="gen-loading" style="display:none;text-align:center;margin-top:20px"><div class="lumi-loader"></div> Generating...</div>
        </div>
    `);
    
    $('#gen-range').on('input', function(){ $('#range-val').text(this.value + ' msgs'); });
    $('#btn-gen-now').on('click', async function() {
        const range = parseInt($('#gen-range').val());
        const start = parseInt($('#gen-start').val()) || 0;
        const useAll = $('#gen-all').prop('checked');
        
        $('#gen-loading').show();
        const res = await generateDiaryEntry({ range, useAll, startIndex: start });
        $('#gen-loading').hide();
        
        if(res) {
            const ctx = SillyTavern.getContext();
            saveMemory({
                id: 'mem_'+Date.now(), timestamp: new Date().toISOString(),
                character: getCharacterName(), worldMode: detectWorldMode(),
                content: { ...res },
                meta: { isPinned: false, isFavorite: false, isSecret: res.isSecret, tags: extractTags(res.diary), refIndex: res.refIndex }
            });
            showToast('🌸 Memory Created!');
            setTimeout(() => renderDiaryUI(), 1000);
        } else {
            showToast('❌ Generation Failed');
        }
    });
}

function bindCardEvents() {
    $('.lumi-act-btn').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        const act = $(this).data('act');
        const mem = extension_settings[extensionName].memories.find(m => m.id === id);
        if(!mem) return;
        
        if(act === 'pin') { mem.meta.isPinned = !mem.meta.isPinned; renderTimelineContent(); }
        if(act === 'fav') { mem.meta.isFavorite = !mem.meta.isFavorite; renderTimelineContent(); }
        if(act === 'del') { 
            if(confirm('Delete?')) { extension_settings[extensionName].memories = extension_settings[extensionName].memories.filter(m => m.id !== id); renderTimelineContent(); }
        }
        if(act === 'ref') { 
            if(mem.meta.refIndex !== undefined) scrollToMessage(mem.meta.refIndex);
            else showToast('No reference found');
        }
        SillyTavern.getContext().saveSettingsDebounced();
    });
}

function scrollToMessage(index) {
    const el = $(`#chat [data-message-index="${index}"]`);
    if(el.length) {
        el[0].scrollIntoView({behavior:'smooth', block:'center'});
        el.css('background', 'rgba(255,182,193,0.3)');
        setTimeout(() => el.css('background', ''), 2000);
    }
}

// ═══════════════════════════════════════════════
// SETTINGS UI
// ═══════════════════════════════════════════════
function createSettingsUI() {
    if ($('#lumi-settings-drawer').length) return;
    const s = extension_settings[extensionName];
    $('#extensions_settings').append(`
        <div id="lumi-settings-drawer" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b style="color:#ff85a2;font-family:'Mitr';font-weight:300;">🌸 LumiPulse</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="display:none;font-family:'Mitr';">
                <label class="checkbox_label"><input id="lumi-en" type="checkbox" ${s.isEnabled?'checked':''}><span>Enabled</span></label>
                <div style="margin-top:10px">
                    <div class="lumi-set-row"><span>World Mode</span><select id="lumi-wm" class="text_pole" style="width:100px"><option value="auto" ${s.diary.worldMode==='auto'?'selected':''}>Auto</option><option value="solo" ${s.diary.worldMode==='solo'?'selected':''}>Solo</option><option value="rpg" ${s.diary.worldMode==='rpg'?'selected':''}>RPG</option></select></div>
                    <div class="lumi-set-row"><span>Auto Gen</span><input id="lumi-ag" type="checkbox" ${s.diary.autoGen.enabled?'checked':''}></div>
                    <div class="lumi-set-row"><span>Trigger</span><select id="lumi-tr" class="text_pole" style="width:100px"><option value="turn_count" ${s.diary.autoGen.triggerType==='turn_count'?'selected':''}>Turns</option><option value="emotion" ${s.diary.autoGen.triggerType==='emotion'?'selected':''}>Emotion</option></select></div>
                </div>
                <div style="margin-top:15px;display:flex;gap:5px">
                    <button id="lumi-rst" class="menu_button" style="flex:1;font-size:11px">📍 Reset Pos</button>
                    <button id="lumi-clr" class="menu_button" style="flex:1;font-size:11px">🗑️ Clear</button>
                </div>
            </div>
        </div>
    `);
    
    $('#lumi-en').on('change', function(){ s.isEnabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); if(s.isEnabled) setTimeout(()=>{spawnLumiButton();createContentModal();setupAutoTriggerListener();},500); else $('#lumi-fab,#lumi-menu,#lumi-modal-overlay').remove(); });
    $('#lumi-wm').on('change', function(){ s.diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi-ag').on('change', function(){ s.diary.autoGen.enabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi-tr').on('change', function(){ s.diary.autoGen.triggerType = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi-rst').on('click', ()=>{ s._internal.fabPosition = null; SillyTavern.getContext().saveSettingsDebounced(); $('#lumi-fab').remove(); spawnLumiButton(); showToast('Position Reset'); });
    $('#lumi-clr').on('click', ()=>{ if(confirm('Clear all?')) { s.memories=[]; SillyTavern.getContext().saveSettingsDebounced(); showToast('Cleared'); } });
}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) {
    const h = document.createElement('div'); h.innerHTML = svgHeart;
    h.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:30px;height:30px;z-index:99999;pointer-events:none;animation:floatHeart 0.8s ease forwards`;
    document.body.appendChild(h); setTimeout(()=>h.remove(), 800);
}

function showToast(msg) {
    const t = document.createElement('div'); t.className = 'lumi-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(()=>t.remove(), 2000);
}

function checkUnlock(m) {
    if(!m.meta.isSecret) return true;
    const mode = extension_settings[extensionName].diary.display.secretUnlockMode;
    if(mode === 'time') return (Date.now() - new Date(m.timestamp)) > 86400000 * 3;
    if(mode === 'affection') return m.content.affection_score >= 80;
    return false; // Manual or AI decided (default locked until manual intervention if needed, but for now simple logic)
}

// Global function for HTML onclick
window.switchView = function(v) {
    $('.lumi-nav button').removeClass('active');
    event.target.classList.add('active');
    if(v==='timeline') renderTimelineContent();
    else if(v==='rpg') renderRPGView();
};

