"use strict";

const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    memories: [],
    _internal: { messageCounter: 0, firstChatDate: null, fabPosition: null, currentView: 'timeline' },
    diary: {
        worldMode: 'auto',
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'], randomChance: 0.08 },
        display: { viewMode: 'timeline', secretUnlockMode: 'ai' },
        storage: { maxEntries: 50, autoSave: true },
        generation: { messageRange: 30, useAllMessages: false, startFromIndex: 0 }
    }
};
let extension_settings = {};

// Icon URLs (คงเดิมตามที่คุณใช้)
const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// SVG Icons (สำหรับปุ่มกระทำในการ์ดและ UI)
const svgPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgStar = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgStarFilled = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="none" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgRef = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const svgTrash = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const svgPlus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const svgClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgBack = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgMapPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgCloud = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;
const svgHeart = `<svg viewBox="0 0 32 32" fill="none" width="24" height="24"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1"/></svg>`;
const svgGear = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgLock = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2" width="24" height="24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT & INIT
// ═══════════════════════════════════════════════
jQuery(function() {
    const boot = setInterval(function() {
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
    const s = extension_settings[extensionName];
    if (!s.diary) s.diary = JSON.parse(JSON.stringify(defaultSettings.diary));
    if (!s.memories) s.memories = [];
    if (!s._internal) s._internal = JSON.parse(JSON.stringify(defaultSettings._internal));
    if (!s._internal.fabPosition) s._internal.fabPosition = null;

    injectStyles();
    createSettingsUI();

    if (s.isEnabled) {
        setTimeout(function() {
            spawnLumiButton();
            createContentModal();
            setupAutoTriggerListener();
        }, 800);
    }
    document.addEventListener("click", function(e) {
        if (!e._fromDrag) spawnHeartEffect(e);
    });
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set();
    chat.slice(-50).forEach(function(m) { if (m.name && !m.is_user && !m.is_system) names.add(m.name); });
    return names.size > 2 ? 'rpg' : 'solo';
}

function getRPGCharacters(limit) {
    if (!limit) limit = 10;
    const ctx = SillyTavern.getContext();
    const characters = [];
    const currentChar = ctx.characters ? ctx.characters[ctx.characterId] : null;
    if (currentChar) {
        characters.push({ name: currentChar.name || getCharacterName(), avatar: currentChar.avatar, isCurrent: true, color: generateColorFromString(currentChar.name || 'default') });
    }
    if (ctx.characters) {
        Object.keys(ctx.characters).forEach(function(key) {
            const char = ctx.characters[key];
            if (char.name && char.name !== (currentChar ? currentChar.name : null) && !characters.find(function(c) { return c.name === char.name; })) {
                characters.push({ name: char.name, avatar: char.avatar, isCurrent: false, color: generateColorFromString(char.name) });
            }
        });
    }
    const chat = ctx.chat || [];
    chat.slice(-100).forEach(function(m) {
        if (m.name && !m.is_user && !m.is_system && !characters.find(function(c) { return c.name === m.name; })) {
            characters.push({ name: m.name, avatar: null, isCurrent: false, color: generateColorFromString(m.name) });
        }
    });
    return characters.slice(0, limit);
}

function generateColorFromString(str) {
    const colors = ['#FFB6C1', '#E6D5F0', '#B6D7F0', '#B6F0D7', '#F0E6B6', '#F0B6D7'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function getChatNPCs(limit) {
    if (!limit) limit = 5;
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set();
    const cn = getCharacterName();
    chat.slice(-40).forEach(function(m) { if (m.name && !m.is_user && !m.is_system && m.name !== cn) names.add(m.name); });
    return Array.from(names).slice(0, limit);
}

function getCharacterName() { return SillyTavern.getContext().name2 || "ตัวละคร"; }
function getUserName() { return SillyTavern.getContext().name1 || "ผู้เล่น"; }

function escapeHtml(t) {
    if (typeof t !== 'string') return '';
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function extractTags(t) {
    const tags = [];
    const kw = {'โรแมนติก':['รัก','หัวใจ','ชอบ','แอบชอบ'],'ดราม่า':['เสียใจ','ร้องไห้','เจ็บปวด'],'ตลก':['ขำ','ตลก','555'],'จุดเปลี่ยน':['ตัดสินใจ','เปลี่ยน','เริ่ม']};
    const l = t.toLowerCase();
    for (const k in kw) {
        if (kw.hasOwnProperty(k)) {
            for (let i = 0; i < kw[k].length; i++) {
                if (l.includes(kw[k][i])) { tags.push('#'+k); break; }
            }
        }
    }
    return tags.slice(0, 3);
}

function checkUnlock(m) {
    if (!m.meta.isSecret) return true;
    const mode = extension_settings[extensionName].diary.display.secretUnlockMode;
    if (mode === 'manual') return false;
    if (mode === 'affection') return (m.content.affection_score || 0) >= 80;
    if (mode === 'time') return (new Date() - new Date(m.timestamp)) / 864e5 >= 3;
    return true;
}

function saveMemory(entry) {
    const s = extension_settings[extensionName];
    s.memories.unshift(entry);
    if (s.memories.length > s.diary.storage.maxEntries) s.memories = s.memories.slice(0, s.diary.storage.maxEntries);
    SillyTavern.getContext().saveSettingsDebounced();
}

function loadMemories(f) {
    if (!f) f = {};
    let mem = JSON.parse(JSON.stringify(extension_settings[extensionName].memories || []));
    if (f.character) mem = mem.filter(function(m) { return m.character === f.character; });
    if (f.showSecret === false) mem = mem.filter(function(m) { return !m.meta.isSecret || checkUnlock(m); });
    return mem.sort(function(a, b) {
        return (b.meta.isPinned === true) - (a.meta.isPinned === true) || new Date(b.timestamp) - new Date(a.timestamp);
    });
}

function saveFabPosition(pos) {
    extension_settings[extensionName]._internal.fabPosition = pos;
    SillyTavern.getContext().saveSettingsDebounced();
}

function loadFabPosition() {
    return extension_settings[extensionName]._internal.fabPosition || null;
}

function scrollToMessage(index) {
    if (index === undefined || index === null) { showToast('ไม่พบตำแหน่งอ้างอิง', 'warning'); return; }
    const el = $('#chat [data-message-index="' + index + '"]');
    if (el.length) {
        el[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.css('background', 'rgba(255,182,193,0.25)');
        setTimeout(function() { el.css('background', ''); }, 2500);
        showToast('เลื่อนไปข้อความ #' + (index + 1));
    } else {
        showToast('ไม่พบข้อความในหน้าจอปัจจุบัน', 'warning');
    }
}

// ═══════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════
function parseJSON(text) {
    if (!text || typeof text !== 'string') return null;
    let m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch(e) {} }
    if (typeof toastr !== 'undefined') toastr.warning('AI ตอบกลับผิดรูปแบบ');
    return null;
}

async function callST(p) {
    try {
        const ctx = SillyTavern.getContext();
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') res = await ctx.generateQuietPrompt(p, false, false);
        else if (typeof ctx.generateRaw === 'function') res = await ctx.generateRaw(p, true);
        else if (typeof window.generateQuietPrompt === 'function') res = await window.generateQuietPrompt(p, false, false);
        else if (typeof window.generateRaw === 'function') res = await window.generateRaw(p, true);
        else { if (typeof toastr !== 'undefined') toastr.error('หา generate function ไม่เจอ'); return null; }
        return parseJSON(res);
    } catch(e) {
        console.error('[LumiPulse]', e);
        if (typeof toastr !== 'undefined') toastr.error('AI Error: ' + e.message);
        return null;
    }
}

async function requestDiaryGen(opt) {
    if (!opt) opt = {};
    const ctx = SillyTavern.getContext();
    const charName = getCharacterName();
    const userName = getUserName();
    let wm = extension_settings[extensionName].diary.worldMode;
    if (wm === 'auto') wm = detectWorldMode();

    const allChat = ctx.chat || [];
    let startIndex = opt.startFromIndex || 0;
    let endIndex = opt.useAllMessages ? allChat.length : Math.min(startIndex + (opt.messageRange || 30), allChat.length);
    if (opt.useAllMessages) startIndex = 0;
    else if (startIndex < 0) startIndex = Math.max(0, allChat.length + startIndex);
    
    const chatSlice = allChat.slice(startIndex, endIndex);
    const chatLog = chatSlice.map(function(m, i) {
        return "[#" + (startIndex + i + 1) + "] " + (m.is_user ? userName : (m.name || "NPC")) + ": " + (m.mes || "").slice(0, 150);
    }).join("\n");

    const prompt = "[System: You are " + charName + "'s inner voice. Respond ONLY with valid JSON, no markdown.]\nChat Context:\n" + chatLog + "\n\nWrite a diary entry from " + charName + "'s perspective. Infer fictional date, location, and weather from context.\nDecide if this memory is secret (isSecret: true) if it contains deeply private thoughts.\nReturn ONLY this JSON in Thai:\n{\n  \"rp_date\": \"วันที่สมมติในเกม\",\n  \"rp_location\": \"สถานที่\",\n  \"rp_weather\": \"สภาพอากาศ/บรรยากาศ\",\n  \"affection_score\": 0-100,\n  \"mood\": \"อารมณ์หลัก\",\n  \"diary\": \"เนื้อหา 3-5 ประโยค\",\n  \"isSecret\": false,\n  \"referencedMessageIndex\": " + startIndex + "\n}";
    return await callST(prompt);
}

// ═══════════════════════════════════════════════
// AUTO-TRIGGER & MANUAL GEN
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).off('messageReceived', onNewChat).on('messageReceived', onNewChat);
    $(document).on('activeCharacterChanged', function() {
        extension_settings[extensionName]._internal.messageCounter = 0;
        if (!extension_settings[extensionName]._internal.firstChatDate) {
            extension_settings[extensionName]._internal.firstChatDate = new Date().toISOString();
            SillyTavern.getContext().saveSettingsDebounced();
        }
    });
}

async function onNewChat() {
    const s = extension_settings[extensionName];
    const cfg = s.diary.autoGen;
    if (!cfg.enabled) return;
    s._internal.messageCounter++;
    const lastMsg = (SillyTavern.getContext().chat ? SillyTavern.getContext().chat.slice(-1)[0].mes : "") || "";
    const lastMsgLower = lastMsg.toLowerCase();
    let gen = false, type = "auto";
    
    if (cfg.triggerType === "turn_count" && s._internal.messageCounter >= cfg.turnInterval) { gen = true; type = "turn"; s._internal.messageCounter = 0; }
    else if (cfg.triggerType === "emotion") { for (let i = 0; i < cfg.emotionKeywords.length; i++) { if (lastMsgLower.includes(cfg.emotionKeywords[i])) { gen = true; type = "emotion"; break; } } }
    else if (cfg.triggerType === "random" && Math.random() < cfg.randomChance) { gen = true; type = "random"; }
    else if (lastMsgLower.includes("#จำ") || lastMsgLower.includes("#diary")) { gen = true; type = "user_tag"; }
    
    if (!gen) return;
    const res = await requestDiaryGen({ trigger: type, messageRange: s.diary.generation.messageRange });
    if (res) {
        const ctx = SillyTavern.getContext();
        let wm = s.diary.worldMode; if (wm === "auto") wm = detectWorldMode();
        createMemoryEntry(res, type, ctx, wm, ctx.chat ? ctx.chat.slice(-1)[0].mes : "", ctx.chat ? ctx.chat.length : 0);
    }
}

function showGenConfigUI() {
    const s = extension_settings[extensionName].diary;
    const maxMsg = SillyTavern.getContext().chat ? SillyTavern.getContext().chat.length : 100;
    $("#lumi-modal-body").html(
        '<div style="padding:16px;">' +
        '<h4 style="color:#ff85a2;margin-bottom:16px;text-align:center;">ตั้งค่าการบันทึกความทรงจำ</h4>' +
        '<div style="margin-bottom:14px;">' +
        '<label style="font-size:12px;color:#666;display:block;margin-bottom:6px;">ช่วงข้อความให้อ่าน:</label>' +
        '<input type="range" id="gen-range" min="5" max="100" value="' + s.generation.messageRange + '" style="width:100%;">' +
        '<div style="text-align:center;font-size:11px;color:#ffb6c1;margin-top:4px;"><span id="range-val">' + s.generation.messageRange + '</span> ข้อความ</div>' +
        '</div>' +
        '<div style="margin-bottom:14px;">' +
        '<label class="checkbox_label" style="font-size:12px;color:#666;cursor:pointer;">' +
        '<input type="checkbox" id="gen-all" ' + (s.generation.useAllMessages ? 'checked' : '') + '> <span>อ่านทั้งหมดตั้งแต่เริ่มแชท</span>' +
        '</label>' +
        '</div>' +
        '<div id="gen-start-box" style="margin-bottom:16px;' + (s.generation.useAllMessages ? 'display:none;' : '') + '">' +
        '<label style="font-size:12px;color:#666;display:block;margin-bottom:6px;">เริ่มจากข้อความที่:</label>' +
        '<input type="number" id="gen-start" value="' + s.generation.startFromIndex + '" min="0" max="' + maxMsg + '" class="lumi-input" style="width:100%;">' +
        '</div>' +
        '<div style="display:flex;gap:10px;margin-top:20px;">' +
        '<button id="gen-cancel" class="lumi-btn-sm" style="flex:1;">ยกเลิก</button>' +
        '<button id="gen-confirm" class="lumi-btn-gen" style="flex:2;">✨ เริ่มบันทึก</button>' +
        '</div></div>'
    );
    $("#gen-range").on("input", function() { $("#range-val").text($(this).val()); });
    $("#gen-all").on("change", function() { $("#gen-start-box").toggle(!$(this).prop("checked")); });
    $("#gen-cancel").on("click", function() { navigateToView("timeline"); });
    $("#gen-confirm").on("click", async function() {
        const range = parseInt($("#gen-range").val()) || 30;
        const useAll = $("#gen-all").prop("checked");
        const start = parseInt($("#gen-start").val()) || 0;
        s.generation.messageRange = range;
        s.generation.useAllMessages = useAll;
        s.generation.startFromIndex = start;
        SillyTavern.getContext().saveSettingsDebounced();
        
        $("#lumi-modal-body").html('<div style="text-align:center;padding:60px 20px;"><div class="lumi-loader"></div><div style="color:#ff85a2;margin-top:16px;">AI กำลังอ่านบริบทและบันทึกความทรงจำ...</div></div>');
        
        let wm = s.worldMode; if (wm === "auto") wm = detectWorldMode();
        const res = await requestDiaryGen({ trigger: "manual", messageRange: range, useAllMessages: useAll, startFromIndex: start });
        
        if (res) {
            const ctx = SillyTavern.getContext();
            createMemoryEntry(res, "manual", ctx, wm, ctx.chat ? ctx.chat.slice(-1)[0].mes : "", ctx.chat ? ctx.chat.length : 0);
            showToast("✅ บันทึกความทรงจำเสร็จเรียบร้อยแล้ว", "success");
            setTimeout(function() { navigateToView("timeline"); }, 1200);
        } else {
            showToast("❌ ไม่สามารถบันทึกได้ ลองใหม่อีกครั้ง", "error");
            setTimeout(function() { navigateToView("timeline"); }, 1000);
        }
    });
}

function createMemoryEntry(res, type, ctx, wm, refText, msgCount) {
    const entry = {
        id: "mem_" + Date.now(),
        timestamp: new Date().toISOString(),
        trigger: type,
        character: getRPGCharacters(1)[0] ? getRPGCharacters(1)[0].name : getCharacterName(),
        characterId: ctx.characterId,
        worldMode: wm,
        content: {
            rp_date: res.rp_date || "วันไม่ทราบแน่ชัด",
            rp_location: res.rp_location || "สถานที่ปัจจุบัน",
            rp_weather: res.rp_weather || "บรรยากาศเงียบสงบ",
            affection_score: Math.min(100, Math.max(0, res.affection_score || 50)),
            mood: res.mood || "สงบ",
            diary: res.diary || ""
        },
        meta: {
            isPinned: false, isFavorite: false, isHidden: false,
            isSecret: res.isSecret || false,
            unlockCondition: res.isSecret ? { type: extension_settings[extensionName].diary.display.secretUnlockMode, value: 80 } : null,
            tags: extractTags(res.diary || ""),
            referenceText: refText ? refText.slice(0, 100) : "",
            referencedMessageIndex: res.referencedMessageIndex !== undefined ? res.referencedMessageIndex : Math.max(0, msgCount - 30)
        }
    };
    saveMemory(entry);
    showToast("📜 บันทึกแล้ว: " + res.rp_date);
}

// ═══════════════════════════════════════════════
// STYLES (Y2K Pastel + Glassmorphism + Animations)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($("#lumi-styles").length) return;
    const el = document.createElement("style");
    el.id = "lumi-styles";
    el.innerHTML = 
        "@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');" +
        ":root{--p:#FFB6C1;--ps:#FFF0F5;--pb:#FF69B4;--sh:0 8px 32px rgba(255,105,180,0.15);--g:rgba(255,245,250,0.88)}" +
        "@keyframes pop{0%{opacity:0;transform:scale(.9) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}" +
        "@keyframes rise{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-80px) scale(1.8)}}" +
        "@keyframes spin{to{transform:rotate(360deg)}}" +
        "@keyframes fade{from{opacity:0}to{opacity:1}}" +
        ".lumi-heart{position:fixed;z-index:2147483647;pointer-events:none;width:28px;height:28px;animation:rise .8s ease-out forwards;filter:drop-shadow(0 0 4px var(--p))}" +
        
        "#lumi-fab{position:fixed!important;z-index:2147483647!important;width:42px!important;height:42px!important;border-radius:50%!important;background:var(--g) url('" + btnUrl + "') no-repeat center center!important;background-size:22px!important;border:2px solid rgba(255,255,255,0.7)!important;box-shadow:var(--sh)!important;cursor:grab!important;touch-action:none!important;user-select:none!important;display:flex!important;align-items:center!important;justify-content:center!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;transition:transform .2s, box-shadow .2s!important}" +
        "#lumi-fab:active{cursor:grabbing!important;transform:scale(0.95)!important}" +
        "#lumi-fab.dragging{transition:none!important;transform:none!important}" +
        
        ".lumi-menu{position:fixed;z-index:2147483646;display:none;background:rgba(255,255,255,0.96);backdrop-filter:blur(16px);border-radius:22px;padding:14px;border:1.5px solid rgba(255,182,193,0.3);box-shadow:0 12px 35px rgba(255,182,193,0.2);font-family:'Mitr',sans-serif;font-weight:300;min-width:170px}" +
        ".lumi-menu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}" +
        ".lumi-mi{display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;padding:8px;border-radius:12px;transition:transform .2s,background .2s}" +
        ".lumi-mi:hover{transform:translateY(-3px);background:var(--ps)}" +
        ".lumi-mi img{width:38px;height:38px;object-fit:contain}" +
        ".lumi-mi span{font-size:10px;color:var(--pb)}" +
        
        ".lumi-modal-ov{position:fixed;top:0;left:0;width:100vw;height:100dvh;background:rgba(0,0,0,0.3);backdrop-filter:blur(12px);z-index:2147483648;display:none;align-items:center;justify-content:center;animation:fade .3s ease}" +
        ".lumi-modal{width:94%;max-width:460px;height:80vh;background:#fff;border-radius:24px;border:2px solid #FFD1DC;box-shadow:0 20px 50px rgba(255,182,193,0.15);display:flex;flex-direction:column;overflow:hidden;font-family:'Mitr',sans-serif;font-weight:300;animation:pop .35s forwards}" +
        ".lumi-hd{padding:16px 20px;text-align:center;color:var(--pb);border-bottom:1.5px solid var(--ps);position:relative;font-size:14px;font-weight:400;display:flex;align-items:center;justify-content:center}" +
        ".lumi-hd .btn{position:absolute;top:14px;width:26px;height:26px;background:var(--ps);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--pb);transition:background .2s}" +
        ".lumi-hd .btn:hover{background:#ffe0e6}" +
        ".lumi-hd .btn.l{left:12px}.lumi-hd .btn.r{right:12px}" +
        ".lumi-bd{flex:1;padding:16px;overflow-y:auto;scroll-behavior:smooth}" +
        
        ".lumi-btn{background:linear-gradient(135deg,var(--p),var(--pb));color:#fff;border:none;padding:10px 24px;border-radius:16px;font-family:'Mitr';cursor:pointer;transition:opacity .2s,transform .2s;box-shadow:0 4px 12px rgba(255,133,162,0.2);font-size:13px;font-weight:400}" +
        ".lumi-btn:hover{opacity:.9;transform:translateY(-1px)}.lumi-btn:active{transform:translateY(0)}" +
        ".lumi-sm{padding:6px 12px;border-radius:10px;border:none;background:var(--ps);color:var(--pb);font-family:'Mitr';font-size:10px;cursor:pointer;transition:.2s;display:inline-flex;align-items:center;gap:4px}" +
        ".lumi-sm:hover{background:#ffe0e6}.lumi-sm.dng{background:#ffe0e0;color:#ff6b6b}" +
        ".lumi-ic{width:24px;height:24px;border-radius:50%;border:none;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--p);transition:.2s;padding:0}" +
        ".lumi-ic:hover{background:var(--ps);transform:scale(1.1)}.lumi-ic.act{background:var(--ps);color:#FFD700}.lumi-ic.dng:hover{background:#ffe0e0;color:#ff6b6b}" +
        ".lumi-load{width:32px;height:32px;border:3px solid var(--ps);border-top-color:var(--pb);border-radius:50%;animation:spin 1s infinite linear;margin:0 auto}" +
        
        ".lumi-tabs{display:flex;gap:6px;margin-bottom:14px;border-bottom:1px solid var(--ps);padding-bottom:8px}" +
        ".lumi-tab{padding:5px 12px;border-radius:10px;background:transparent;color:var(--p);font-family:'Mitr';font-size:10px;cursor:pointer;transition:.2s;border:none}" +
        ".lumi-tab:hover{background:var(--ps)}.lumi-tab.act{background:var(--p);color:#fff}" +
        ".lumi-fbar{display:flex;gap:6px;margin-bottom:12px}" +
        ".lumi-fsel,.lumi-fin{flex:1;padding:6px 10px;border:1.5px solid #FFD1DC;border-radius:10px;background:#fff;color:var(--p);font-family:'Mitr';font-size:11px;outline:none}.lumi-fin{color:#666}" +
        
        ".lumi-tdate{font-size:11px;color:var(--p);padding:6px 0;border-bottom:1px dashed #FFE8EE;margin:10px 0 6px;display:flex;align-items:center;gap:5px}" +
        ".lumi-card{background:#FFFBFC;border:1px solid #FFE8EE;border-radius:14px;padding:12px;margin-bottom:8px;position:relative;transition:box-shadow .2s,transform .2s}" +
        ".lumi-card:hover{box-shadow:0 3px 10px rgba(255,182,193,0.1);transform:translateY(-1px)}" +
        ".lumi-card.pin{border:1.5px solid #FFD1DC;background:#FFF8FA}" +
        ".lumi-card.fav{border-left:3px solid #FFD700}" +
        ".lumi-card.sec{opacity:.7;background:#F8F8F8}" +
        ".lumi-ch{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;flex-wrap:wrap;gap:4px}" +
        ".lumi-cn{font-weight:400;color:#444;font-size:12px;display:flex;align-items:center;gap:5px}" +
        ".lumi-dot{width:7px;height:7px;border-radius:50%;display:inline-block}" +
        ".lumi-rp{background:var(--ps);padding:2px 7px;border-radius:8px;color:var(--pb);font-size:9px;display:inline-flex;align-items:center;gap:3px}" +
        ".lumi-cc{font-size:12px;color:#555;line-height:1.6;margin:7px 0 8px;white-space:pre-wrap}" +
        ".lumi-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px}" +
        ".lumi-tag{font-size:9px;padding:2px 7px;border-radius:9px;background:var(--ps);color:var(--pb)}" +
        ".lumi-acts{display:flex;gap:5px;justify-content:flex-end;border-top:1px solid #FFE8EE;padding-top:7px}" +
        ".lumi-lock{position:absolute;inset:0;background:rgba(255,255,255,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;z-index:1;border-radius:14px}" +
        ".lumi-ltxt{font-size:11px;color:var(--p)}.lumi-lhint{font-size:9px;color:#ccc}" +
        ".lumi-ref{background:var(--ps);padding:2px 6px;border-radius:6px;font-size:9px;color:var(--pb);cursor:pointer;transition:background .2s}" +
        ".lumi-ref:hover{background:#ffe0e6}" +
        
        ".lumi-scard{background:#FFF9FA;border:1px solid #FFE8EE;border-radius:14px;padding:12px;margin-bottom:10px}" +
        ".lumi-scard h4{font-size:12px;color:var(--pb);margin:0 0 10px;font-weight:400;display:flex;align-items:center;gap:5px}" +
        ".lumi-in{width:100%;background:#fff;border:1.5px solid #FFD1DC;border-radius:10px;padding:7px 10px;color:var(--p);font-family:'Mitr';font-size:11px;outline:none;box-sizing:border-box}" +
        ".lumi-sgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px}" +
        ".lumi-sbox{background:#FFF9FA;border:1px solid #FFE8EE;border-radius:12px;padding:12px;text-align:center}" +
        ".lumi-sv{font-size:20px;color:var(--pb);font-weight:500;margin-bottom:3px}.lumi-sl{font-size:10px;color:#888}" +
        ".lumi-rcol{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}" +
        ".lumi-rcard{background:#FFFBFC;border:1px solid #FFE8EE;border-radius:14px;padding:10px}" +
        ".lumi-rhd{display:flex;align-items:center;gap:7px;margin-bottom:8px;padding-bottom:7px;border-bottom:1px dashed #FFE8EE}" +
        ".lumi-rav{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;flex-shrink:0}" +
        ".lumi-rnm{font-size:12px;color:#444;font-weight:400}.lumi-rcnt{font-size:9px;color:var(--p)}" +
        ".lumi-empty{text-align:center;color:var(--p);padding:30px 20px;font-size:12px;line-height:1.6}" +
        ".lumi-trow{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:11px;color:#666}" +
        ".lumi-tog{position:relative;width:32px;height:17px;background:#FFE8EE;border-radius:9px;cursor:pointer;transition:.3s}" +
        ".lumi-tog.act{background:var(--p)}" +
        ".lumi-tog::after{content:'';position:absolute;top:2px;left:2px;width:13px;height:13px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 1px 3px rgba(0,0,0,0.1)}" +
        ".lumi-tog.act::after{left:17px}" +
        
        "#lumi-panel .inline-drawer-content{font-family:'Mitr',sans-serif;font-weight:300;padding:10px 0}" +
        "#lumi-panel .menu_btn{background:linear-gradient(135deg,var(--p),var(--pb));color:white;border:none;border-radius:10px;padding:7px 10px;font-family:'Mitr',sans-serif;font-size:11px;cursor:pointer;width:100%;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:5px}" +
        "#lumi-panel .menu_btn.dng{background:linear-gradient(135deg,#ff6b6b,#ff4757)}" +
        "#lumi-panel .t_pole{background:#FFF9FA;border:1.5px solid #FFD1DC;border-radius:10px;color:var(--p);font-family:'Mitr',sans-serif;font-size:11px;padding:5px 8px;outline:none;width:100%}" +
        "#lumi-panel .chk{font-size:12px;color:#aaa}" +
        "@media(max-width:768px){.lumi-rcol{grid-template-columns:1fr}.lumi-sgrid{grid-template-columns:1fr}}";
    document.head.appendChild(el);
}

// ═══════════════════════════════════════════════
// HEART EFFECT
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) {
    const h = document.createElement("div");
    h.className = "lumi-heart"; h.innerHTML = svgHeart;
    h.style.left = e.clientX + "px"; h.style.top = e.clientY + "px";
    document.body.appendChild(h);
    setTimeout(function() { h.remove(); }, 800);
}

// ═══════════════════════════════════════════════
// MODAL & NAVIGATION
// ═══════════════════════════════════════════════
function navigateToView(view) {
    extension_settings[extensionName]._internal.currentView = view;
    if (view === 'timeline' || view === 'rpg') renderDiaryUI(view);
    else if (view === 'settings') renderSettingsModal();
    else if (view === 'gen') showGenConfigUI();
    else renderDiaryUI('timeline');
}

function openLumiModal(type) {
    $(".lumi-menu").fadeOut(150);
    $("#lumi-modal-ov").css("display", "flex").hide().fadeIn(250);
    if (type === 'diary') navigateToView('timeline');
    else if (type === 'settings') navigateToView('settings');
    else if (type === 'phone' || type === 'forum') {
        $("#lumi-modal-title").text(type === 'phone' ? 'Phone' : 'Forum');
        $("#lumi-modal-bd").html('<div class="lumi-empty">ฟีเจอร์นี้กำลังพัฒนา 🌸</div>');
    }
}

function createContentModal() {
    if ($("#lumi-modal-ov").length) return;
    $("body").append(
        '<div id="lumi-modal-ov" class="lumi-modal-ov">' +
        '<div class="lumi-modal">' +
        '<div class="lumi-hd">' +
        '<div class="btn l" id="lumi-back">' + svgBack + '</div>' +
        '<span id="lumi-modal-title">Memories</span>' +
        '<div class="btn r" id="lumi-close">' + svgClose + '</div>' +
        '</div>' +
        '<div id="lumi-modal-bd" class="lumi-bd"></div>' +
        '</div></div>'
    );
    $("#lumi-back").on("click", function() { navigateToView("timeline"); });
    $("#lumi-close").on("click", function() { $("#lumi-modal-ov").fadeOut(200); });
    $("#lumi-modal-ov").on("click", function(e) { if (e.target.id === "lumi-modal-ov") $(this).fadeOut(200); });
}

// ═══════════════════════════════════════════════
// DIARY UI & RENDERING
// ═══════════════════════════════════════════════
function renderDiaryUI(defaultView) {
    const view = defaultView || extension_settings[extensionName]._internal.currentView || 'timeline';
    const cn = getCharacterName();
    $("#lumi-modal-title").text(cn + "'s Memories");
    const chars = getRPGCharacters(10);
    let opts = '<option value="">ทุกตัวละคร</option>';
    for (let i = 0; i < chars.length; i++) opts += '<option value="' + escapeHtml(chars[i].name) + '">' + escapeHtml(chars[i].name) + '</option>';
    
    $("#lumi-modal-bd").html(
        '<div class="lumi-tabs">' +
        '<button class="lumi-tab ' + (view === 'timeline' ? 'act' : '') + '" data-v="timeline">Timeline</button>' +
        '<button class="lumi-tab ' + (view === 'rpg' ? 'act' : '') + '" data-v="rpg">RPG View</button>' +
        '</div>' +
        '<div style="text-align:center;margin-bottom:12px;"><button id="lumi-gen-btn" class="lumi-btn">' + svgPlus + ' บันทึกความทรงจำ</button></div>' +
        '<div class="lumi-fbar">' +
        '<select id="lumi-fc" class="lumi-fsel">' + opts + '</select>' +
        '<input id="lumi-fq" class="lumi-fin" placeholder="ค้นหาความทรงจำ...">' +
        '</div>' +
        '<div id="lumi-panel-c" class="lumi-bd" style="padding:0;"></div>'
    );
    
    if (view === 'timeline') loadAndRenderTimeline();
    else renderRPGView();
    
    $("#lumi-fc, #lumi-fq").on("change keyup", function() { setTimeout(function() { if ($("#lumi-panel-c .lumi-tabs").length) return; view === 'rpg' ? renderRPGView() : loadAndRenderTimeline(); }, 200); });
    $("#lumi-gen-btn").on("click", function() { navigateToView("gen"); });
    $(".lumi-tab").on("click", function() { navigateToView($(this).data("v")); });
}

function loadAndRenderTimeline() {
    const f = { character: $("#lumi-fc").val() || null, showSecret: extension_settings[extensionName].diary.display.showSecret };
    const q = ($("#lumi-fq").val() || "").toLowerCase();
    let mem = loadMemories(f);
    if (q) mem = mem.filter(function(m) { return (m.content.diary||"").toLowerCase().includes(q) || (m.content.mood||"").includes(q) || (m.content.rp_location||"").includes(q); });
    const p = $("#lumi-panel-c");
    if (!mem.length) { p.html('<div class="lumi-empty">ยังไม่มีความทรงจำ<br><small>กดปุ่มด้านบนเพื่อเริ่มต้น</small></div>'); return; }
    const grp = {};
    for (let i = 0; i < mem.length; i++) { const dk = mem[i].content.rp_date || 'ไม่ระบุวันที่'; if (!grp[dk]) grp[dk] = []; grp[dk].push(mem[i]); }
    let h = '';
    for (const d in grp) {
        if (grp.hasOwnProperty(d)) {
            h += '<div class="lumi-tdate">' + svgCalendar + ' ' + escapeHtml(d) + '</div>';
            for (let j = 0; j < grp[d].length; j++) h += renderCard(grp[d][j], false);
        }
    }
    p.html(h); bindEvents();
}

function renderRPGView() {
    const f = { character: $("#lumi-fc").val() || null, showSecret: extension_settings[extensionName].diary.display.showSecret };
    let mem = loadMemories(f);
    const by = {};
    for (let i = 0; i < mem.length; i++) { if (!by[mem[i].character]) by[mem[i].character] = []; by[mem[i].character].push(mem[i]); }
    const p = $("#lumi-panel-c");
    if (!Object.keys(by).length) { p.html('<div class="lumi-empty">ยังไม่มีความทรงจำ</div>'); return; }
    let h = '<div class="lumi-rcol">';
    for (const c in by) {
        if (by.hasOwnProperty(c)) {
            const col = generateColorFromString(c);
            h += '<div class="lumi-rcard"><div class="lumi-rhd"><div class="lumi-rav" style="background:' + col + '">' + escapeHtml(c.charAt(0).toUpperCase()) + '</div><div><div class="lumi-rnm">' + escapeHtml(c) + '</div><div class="lumi-rcnt">' + by[c].length + ' ความทรงจำ</div></div></div>';
            for (let j = 0; j < by[c].length; j++) h += renderCard(by[c][j], true);
            h += '</div>';
        }
    }
    h += '</div>'; p.html(h); bindEvents();
}

function renderCard(e, compact) {
    const locked = e.meta.isSecret && !checkUnlock(e);
    const col = generateColorFromString(e.character);
    const rp = '<span class="lumi-rp">' + svgMapPin + ' ' + escapeHtml(e.content.rp_location) + '</span><span class="lumi-rp">' + svgCloud + ' ' + escapeHtml(e.content.rp_weather) + '</span>';
    const ref = e.meta.referencedMessageIndex !== undefined ? '<span class="lumi-ref" data-idx="' + e.meta.referencedMessageIndex + '">#' + (e.meta.referencedMessageIndex + 1) + '</span>' : '';
    let tags = ''; for (let i = 0; i < (e.meta.tags||[]).length; i++) tags += '<span class="lumi-tag">' + e.meta.tags[i] + '</span>';
    const acts = '<button class="lumi-ic ' + (e.meta.isPinned?'act':'') + '" data-a="pin">' + svgPin + '</button><button class="lumi-ic ' + (e.meta.isFavorite?'act':'') + '" data-a="fav">' + (e.meta.isFavorite?svgStarFilled:svgStar) + '</button><button class="lumi-ic" data-a="ref">' + svgRef + '</button><button class="lumi-ic dng" data-a="del">' + svgTrash + '</button>';
    if (locked) return '<div class="lumi-card sec" data-id="' + e.id + '"><div class="lumi-lock">' + svgLock + '<div class="lumi-ltxt">ความทรงจำนี้ยังมองไม่เห็น</div><div class="lumi-lhint">จะเปิดเผยเมื่อถึงเวลา...</div></div><div class="lumi-ch"><span class="lumi-cn"><span class="lumi-dot" style="background:' + col + '"></span>' + escapeHtml(e.character) + '</span></div></div>';
    return '<div class="lumi-card ' + (e.meta.isPinned?'pin':'') + ' ' + (e.meta.isFavorite?'fav':'') + '" data-id="' + e.id + '"><div class="lumi-ch"><span class="lumi-cn"><span class="lumi-dot" style="background:' + col + '"></span>' + escapeHtml(e.character) + '</span><div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">' + (compact?'':rp) + ' ' + ref + '</div></div><div style="font-size:10px;color:#888;margin-bottom:5px;">' + escapeHtml(e.content.mood) + ' · ❤️ ' + e.content.affection_score + '</div><div class="lumi-cc">' + escapeHtml(e.content.diary) + '</div><div class="lumi-tags">' + tags + '</div>' + (compact?'':'<div class="lumi-acts">' + acts + '</div>') + '</div>';
}

function bindEvents() {
    $(".lumi-ic[data-a='pin']").off("click").on("click", function(e) { e.stopPropagation(); togglePin($(this).closest(".lumi-card").data("id")); });
    $(".lumi-ic[data-a='fav']").off("click").on("click", function(e) { e.stopPropagation(); toggleFav($(this).closest(".lumi-card").data("id")); });
    $(".lumi-ic[data-a='ref']").off("click").on("click", function(e) { e.stopPropagation(); showRef($(this).closest(".lumi-card").data("id")); });
    $(".lumi-ic[data-a='del']").off("click").on("click", function(e) { e.stopPropagation(); delMem($(this).closest(".lumi-card").data("id")); });
    $(".lumi-ref").off("click").on("click", function(e) { e.stopPropagation(); scrollToMessage(parseInt($(this).data("idx"))); });
}

function togglePin(id) { const s=extension_settings[extensionName], m=s.memories.find(x=>x.id===id); if(m){m.meta.isPinned=!m.meta.isPinned; SillyTavern.getContext().saveSettingsDebounced(); loadAndRenderTimeline();} }
function toggleFav(id) {
    const s=extension_settings[extensionName], m=s.memories.find(x=>x.id===id);
    if(m){
        m.meta.isFavorite=!m.meta.isFavorite;
        if(m.meta.isFavorite && !m.meta.tags.includes('#ล้ำค่า')) m.meta.tags.push('#ล้ำค่า');
        else m.meta.tags=m.meta.tags.filter(t=>t!=='#ล้ำค่า');
        SillyTavern.getContext().saveSettingsDebounced(); loadAndRenderTimeline();
        showToast(m.meta.isFavorite?'⭐ เพิ่มเป็นความทรงจำล้ำค่า':'เอาออกจากรายการล้ำค่า');
    }
}
function showRef(id) { const m=extension_settings[extensionName].memories.find(x=>x.id===id); if(m&&m.meta.referencedMessageIndex!==undefined) scrollToMessage(m.meta.referencedMessageIndex); else if(m) showToast(m.meta.referenceText||'ไม่มีข้อมูล'); }
function delMem(id) { if(confirm('ลบความทรงจำนี้?')){const s=extension_settings[extensionName];s.memories=s.memories.filter(x=>x.id!==id);SillyTavern.getContext().saveSettingsDebounced();loadAndRenderTimeline();} }

// ═══════════════════════════════════════════════
// SETTINGS (Panel & Modal)
// ═══════════════════════════════════════════════
function renderSettingsModal() {
    $("#lumi-modal-title").text("Settings");
    const s = extension_settings[extensionName].diary;
    const ag = s.autoGen;
    $("#lumi-modal-bd").html(
        '<div style="padding:16px;">' +
        '<div class="lumi-scard"><h4>' + svgGear + ' ทั่วไป</h4>' +
        '<div style="margin-bottom:8px;"><label style="font-size:11px;color:#666;">โหมดโลก</label><select id="s-wm" class="lumi-in" style="margin-top:4px;"><option value="auto" '+(s.worldMode==='auto'?'selected':'')+'>อัตโนมัติ</option><option value="solo" '+(s.worldMode==='solo'?'selected':'')+'>เดี่ยว</option><option value="rpg" '+(s.worldMode==='rpg'?'selected':'')+'>RPG</option></select></div>' +
        '<div><label style="font-size:11px;color:#666;">วิธีจัดการความลับ</label><select id="s-sec" class="lumi-in" style="margin-top:4px;"><option value="ai" '+(s.display.secretUnlockMode==='ai'?'selected':'')+'>AI ตัดสินใจอัตโนมัติ</option><option value="affection" '+(s.display.secretUnlockMode==='affection'?'selected':'')+'>ความสัมพันธ์ ≥ 80</option><option value="time" '+(s.display.secretUnlockMode==='time'?'selected':'')+'>ผ่านไป 3 วัน</option><option value="manual" '+(s.display.secretUnlockMode==='manual'?'selected':'')+'>ปลดล็อกเองเท่านั้น</option></select></div></div>' +
        '<div class="lumi-scard"><h4>' + svgRef + ' อัตโนมัติ</h4>' +
        '<div class="lumi-trow"><span>เปิดใช้งาน</span><div id="s-ag-tog" class="lumi-tog '+(ag.enabled?'act':'')+'"></div></div>' +
        '<div style="margin-top:8px;"><label style="font-size:11px;color:#666;">ทริกเกอร์</label><select id="s-ag-type" class="lumi-in" style="margin-top:4px;"><option value="turn_count" '+(ag.triggerType==='turn_count'?'selected':'')+'>ทุก X ข้อความ</option><option value="emotion" '+(ag.triggerType==='emotion'?'selected':'')+'>คำอารมณ์</option><option value="random" '+(ag.triggerType==='random'?'selected':'')+'>สุ่ม</option></select></div>' +
        '<div id="s-turn-wrap" style="margin-top:8px;'+(ag.triggerType!=='turn_count'?'display:none;':'')+'"><input type="number" id="s-turn-int" value="'+ag.turnInterval+'" min="5" max="100" class="lumi-in" style="width:60px;"> <span style="font-size:10px;color:#888;">ข้อความ</span></div></div>' +
        '<div style="display:flex;gap:8px;margin-top:14px;"><button id="s-save" class="lumi-btn" style="flex:2;">💾 บันทึกการตั้งค่า</button><button id="s-rst" class="lumi-sm" style="flex:1;">📍 รีเซ็ตปุ่ม</button></div></div>'
    );
    $("#s-ag-tog").on("click", function() { $(this).toggleClass("act"); });
    $("#s-ag-type").on("change", function() { $("#s-turn-wrap").toggle($(this).val()==='turn_count'); });
    $("#s-save").on("click", function() {
        s.worldMode = $("#s-wm").val();
        s.display.secretUnlockMode = $("#s-sec").val();
        s.autoGen.enabled = $("#s-ag-tog").hasClass("act");
        s.autoGen.triggerType = $("#s-ag-type").val();
        s.autoGen.turnInterval = parseInt($("#s-turn-int").val()) || 20;
        SillyTavern.getContext().saveSettingsDebounced();
        showToast("✅ บันทึกการตั้งค่าแล้ว", "success");
        setTimeout(function() { navigateToView("timeline"); }, 600);
    });
    $("#s-rst").on("click", function() { saveFabPosition(null); $("#lumi-fab, .lumi-menu").remove(); spawnLumiButton(); showToast("📍 รีเซ็ตตำแหน่งปุ่มแล้ว"); });
}

function createSettingsUI() {
    if ($("#lumi-panel").length) return;
    const s = extension_settings[extensionName].diary;
    $("#extensions_settings").append(
        '<div id="lumi-panel" class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color:var(--pb);font-family:\'Mitr\';font-weight:300;">LumiPulse</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>' +
        '<div class="inline-drawer-content" style="display:none;">' +
        '<div style="margin-bottom:10px;"><label class="chk"><input id="p-en" type="checkbox" '+(extension_settings[extensionName].isEnabled?'checked':'')+'><span>เปิดใช้งาน</span></label></div>' +
        '<div style="margin-bottom:8px;"><label style="font-size:11px;color:#888;">โหมดโลก</label><select id="p-wm" class="t_pole"><option value="auto" '+(s.worldMode==='auto'?'selected':'')+'>อัตโนมัติ</option><option value="solo" '+(s.worldMode==='solo'?'selected':'')+'>เดี่ยว</option><option value="rpg" '+(s.worldMode==='rpg'?'selected':'')+'>RPG</option></select></div>' +
        '<div style="margin-top:12px;border-top:1px solid #333;padding-top:10px;">' +
        '<button id="p-rst" class="menu_btn">📍 รีเซ็ตปุ่มลอย</button>' +
        '<button id="p-clr" class="menu_btn dng">🗑️ ล้างความทรงจำ</button>' +
        '</div></div></div>'
    );
    $("#p-en").on("change", function() {
        extension_settings[extensionName].isEnabled = $(this).prop("checked");
        SillyTavern.getContext().saveSettingsDebounced();
        if (extension_settings[extensionName].isEnabled) setTimeout(function() { spawnLumiButton(); createContentModal(); setupAutoTriggerListener(); }, 500);
        else { $("#lumi-fab, .lumi-menu, #lumi-modal-ov").remove(); $(document).off("messageReceived", onNewChat); }
    });
    $("#p-wm").on("change", function() { extension_settings[extensionName].diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $("#p-rst").on("click", function() { saveFabPosition(null); $("#lumi-fab, .lumi-menu").remove(); spawnLumiButton(); showToast("รีเซ็ตปุ่มแล้ว"); });
    $("#p-clr").on("click", function() { if(confirm("ล้างความทรงจำทั้งหมด?")) { extension_settings[extensionName].memories = []; SillyTavern.getContext().saveSettingsDebounced(); showToast("ล้างแล้ว"); } });
}

// ═══════════════════════════════════════════════
// FAB BUTTON (Drag Fix + Menu 3 Items)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $("#lumi-fab, .lumi-menu").remove();
    if (!document.body) { setTimeout(spawnLumiButton, 800); return; }

    const fab = document.createElement("div");
    fab.id = "lumi-fab";
    const pos = loadFabPosition();
    if (pos) { fab.style.top=pos.top||"auto"; fab.style.left=pos.left||"auto"; fab.style.right=pos.right||"auto"; fab.style.bottom=pos.bottom||"auto"; fab.style.transform=pos.transform||"none"; }
    else { fab.style.top="50%"; fab.style.right="0px"; fab.style.transform="translateY(-50%)"; }
    document.body.appendChild(fab);

    const menu = document.createElement("div");
    menu.className = "lumi-menu";
    menu.innerHTML = '<div class="lumi-menu-grid">' +
        '<div class="lumi-mi" id="m-diary"><img src="'+iconDiary+'" alt="D"><span>Diary</span></div>' +
        '<div class="lumi-mi" id="m-phone"><img src="'+iconPhone+'" alt="P"><span>Phone</span></div>' +
        '<div class="lumi-mi" id="m-forum"><img src="'+iconForum+'" alt="F"><span>Forum</span></div>' +
        '</div>';
    document.body.appendChild(menu);

    function updateMenuPos() {
        const r=fab.getBoundingClientRect(), m=$(menu);
        let l=r.left-(m.outerWidth()/2)+(r.width/2), t=r.top-m.outerHeight()-10;
        if(l<10)l=10; if(l+m.outerWidth()>window.innerWidth-10)l=window.innerWidth-m.outerWidth()-10; if(t<10)t=r.bottom+10;
        m.css({left:l+"px",top:t+"px"});
    }

    let isDragging=false, hasMoved=false;
    let dragStart={x:0,y:0}, offset={x:0,y:0}, curPos={x:0,y:0};
    const TH=12; // Threshold 12px ตามที่ขอ

    // Mouse
    fab.addEventListener("mousedown", function(e) {
        if(e.button===2) return;
        e.preventDefault();
        isDragging=false; hasMoved=false;
        fab.classList.add("dragging");
        const rect=fab.getBoundingClientRect();
        offset.x=e.clientX-rect.left; offset.y=e.clientY-rect.top;
        dragStart.x=e.clientX; dragStart.y=e.clientY;
        curPos.x=rect.left; curPos.y=rect.top;
        
        function onMove(ev) {
            const dist=Math.hypot(ev.clientX-dragStart.x, ev.clientY-dragStart.y);
            if(dist>TH && !hasMoved) {
                hasMoved=true; isDragging=true;
                $(menu).fadeOut(50);
                fab.style.transform="none"; fab.style.right="auto"; fab.style.bottom="auto";
            }
            if(!isDragging) return;
            curPos.x=Math.max(0, Math.min(ev.clientX-offset.x, window.innerWidth-42));
            curPos.y=Math.max(0, Math.min(ev.clientY-offset.y, window.innerHeight-42));
            fab.style.left=curPos.x+"px"; fab.style.top=curPos.y+"px";
        }
        function onUp() {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            fab.classList.remove("dragging");
            if(!hasMoved) { updateMenuPos(); $(menu).fadeToggle(150); }
            else { saveFabPosition({top:curPos.y+"px",left:curPos.x+"px",right:"auto",bottom:"auto",transform:"none"}); }
            isDragging=false; hasMoved=false;
        }
        document.addEventListener("mousemove", onMove, {passive:false});
        document.addEventListener("mouseup", onUp, {passive:false});
    }, {passive:false});

    // Touch
    let isTD=false, hasTM=false;
    fab.addEventListener("touchstart", function(e) {
        e.preventDefault();
        isTD=false; hasTM=false;
        fab.classList.add("dragging");
        const t=e.touches[0], rect=fab.getBoundingClientRect();
        offset.x=t.clientX-rect.left; offset.y=t.clientY-rect.top;
        dragStart.x=t.clientX; dragStart.y=t.clientY;
        curPos.x=rect.left; curPos.y=rect.top;
    }, {passive:false});
    fab.addEventListener("touchmove", function(e) {
        e.preventDefault();
        const t=e.touches[0];
        const dist=Math.hypot(t.clientX-dragStart.x, t.clientY-dragStart.y);
        if(dist>TH && !hasTM) {
            hasTM=true; isTD=true;
            $(menu).fadeOut(50);
            fab.style.transform="none"; fab.style.right="auto"; fab.style.bottom="auto";
        }
        if(!isTD) return;
        curPos.x=Math.max(0, Math.min(t.clientX-offset.x, window.innerWidth-42));
        curPos.y=Math.max(0, Math.min(t.clientY-offset.y, window.innerHeight-42));
        fab.style.left=curPos.x+"px"; fab.style.top=curPos.y+"px";
    }, {passive:false});
    fab.addEventListener("touchend", function(e) {
        e.preventDefault();
        fab.classList.remove("dragging");
        if(!hasTM) { updateMenuPos(); $(menu).fadeToggle(150); }
        else { saveFabPosition({top:curPos.y+"px",left:curPos.x+"px",right:"auto",bottom:"auto",transform:"none"}); }
        isTD=false; hasTM=false;
    }, {passive:false});

    $(document).off("click","#m-diary").on("click","#m-diary",function(){openLumiModal("diary");});
    $(document).off("click","#m-phone").on("click","#m-phone",function(){openLumiModal("phone");});
    $(document).off("click","#m-forum").on("click","#m-forum",function(){openLumiModal("forum");});
}

function showToast(m, t) { if(!t)t="info"; if(typeof toastr!=="undefined") toastr[t](m, "LumiPulse"); }

