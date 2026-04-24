"use strict";

const extensionName = "lumipulse-st-extension";

const defaultSettings = {
    isEnabled: true,
    forumTopic: "",
    isForumInitialized: false,
    includeRandomNPCs: true,
    forumData: [],
    diaryData: null,
    memories: [],
    _internal: { messageCounter: 0, firstChatDate: null, fabPosition: null },
    diary: {
        worldMode: 'auto',
        autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, emotionKeywords: ['รัก','โกรธ','เสียใจ','ดีใจ','หัวใจ','กลัว'], randomChance: 0.08 },
        display: { viewMode: 'timeline', showSecret: true, secretUnlockMode: 'ai' },
        storage: { maxEntries: 40, autoSave: true },
        generation: { messageRange: 30, useAllMessages: false, startFromIndex: 0 }
    }
};
let extension_settings = {};

// Icon URLs (เดิมของคุณ)
const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// SVG Icons (สำหรับปุ่มในการ์ด)
const svgHeart = `<svg viewBox="0 0 32 32" fill="none" width="24" height="24"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1"/></svg>`;
const svgPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1-1v-5h2v-2l-2-2z"/></svg>`;
const svgRef = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const svgStar = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgStarFilled = `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="none" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const svgLock = `<svg viewBox="0 0 24 24" fill="none" stroke="#FFB6C1" stroke-width="2" width="24" height="24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const svgTrash = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
const svgPlus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const svgClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const svgCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgMapPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgCloud = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;
const svgBack = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;

// ═══════════════════════════════════════════════
// BOOT
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
    chat.slice(-50).forEach(function(m) {
        if (m.name && !m.is_user && !m.is_system) names.add(m.name);
    });
    return names.size > 2 ? 'rpg' : 'solo';
}

function getRPGCharacters(limit) {
    if (!limit) limit = 10;
    const ctx = SillyTavern.getContext();
    const characters = [];
    const currentChar = ctx.characters ? ctx.characters[ctx.characterId] : null;
    if (currentChar) {
        characters.push({
            name: currentChar.name || getCharacterName(),
            avatar: currentChar.avatar,
            isCurrent: true,
            color: generateColorFromString(currentChar.name || 'default')
        });
    }
    if (ctx.characters) {
        Object.keys(ctx.characters).forEach(function(key) {
            const char = ctx.characters[key];
            if (char.name && char.name !== (currentChar ? currentChar.name : null) && !characters.find(function(c) { return c.name === char.name; })) {
                characters.push({
                    name: char.name,
                    avatar: char.avatar,
                    isCurrent: false,
                    color: generateColorFromString(char.name)
                });
            }
        });
    }
    const chat = ctx.chat || [];
    chat.slice(-100).forEach(function(m) {
        if (m.name && !m.is_user && !m.is_system && !characters.find(function(c) { return c.name === m.name; })) {
            characters.push({
                name: m.name,
                avatar: null,
                isCurrent: false,
                color: generateColorFromString(m.name)
            });
        }
    });
    return characters.slice(0, limit);
}

function generateColorFromString(str) {
    const colors = ['#FFB6C1', '#E6D5F0', '#B6D7F0', '#B6F0D7', '#F0E6B6', '#F0B6D7'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getChatNPCs(limit) {
    if (!limit) limit = 5;
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set();
    const cn = getCharacterName();
    chat.slice(-40).forEach(function(m) {
        if (m.name && !m.is_user && !m.is_system && m.name !== cn) names.add(m.name);
    });
    return Array.from(names).slice(0, limit);
}

function getCharacterName() {
    const ctx = SillyTavern.getContext();
    return ctx.name2 || "ตัวละคร";
}

function getUserName() {
    const ctx = SillyTavern.getContext();
    return ctx.name1 || "ผู้เล่น";
}

function escapeHtml(t) {
    if (typeof t !== 'string') return '';
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function extractTags(t) {
    const tags = [];
    const kw = {
        'โรแมนติก': ['รัก','หัวใจ','ชอบ','แอบชอบ'],
        'ดราม่า': ['เสียใจ','ร้องไห้','เจ็บปวด'],
        'ตลก': ['ขำ','ตลก','555'],
        'จุดเปลี่ยน': ['ตัดสินใจ','เปลี่ยน','เริ่ม']
    };
    const l = t.toLowerCase();
    for (const k in kw) {
        if (kw.hasOwnProperty(k)) {
            const v = kw[k];
            for (let i = 0; i < v.length; i++) {
                if (l.includes(v[i])) {
                    tags.push('#' + k);
                    break;
                }
            }
        }
    }
    return tags.slice(0, 3);
}

function checkUnlock(m) {
    if (!m.meta.isSecret) return true;
    const c = extension_settings[extensionName].diary.display;
    if (c.secretUnlockMode === 'manual') return false;
    if (c.secretUnlockMode === 'affection') return (m.content.affection_score || 0) >= 80;
    return (new Date() - new Date(m.timestamp)) / 864e5 >= 3;
}

function saveMemory(entry) {
    const s = extension_settings[extensionName];
    s.memories.unshift(entry);
    if (s.memories.length > s.diary.storage.maxEntries) {
        s.memories = s.memories.slice(0, s.diary.storage.maxEntries);
    }
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

function scrollToMessage(messageIndex) {
    const msgElement = $('#chat [data-message-index="' + messageIndex + '"]');
    if (msgElement.length) {
        msgElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        msgElement.css('background', 'rgba(255,182,193,0.3)');
        setTimeout(function() { msgElement.css('background', ''); }, 2000);
        showToast('เลื่อนไปข้อความ #' + (messageIndex + 1));
    } else {
        showToast('ไม่พบข้อความที่อ้างอิง', 'warning');
    }
}

// ═══════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════
function parseJSON(text) {
    if (!text || typeof text !== 'string') return null;
    let m = text.match(/\{[\s\S]*\}/);
    if (m) {
        try { return JSON.parse(m[0]); } catch (e) {}
    }
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
    } catch (e) {
        console.error('[LumiPulse]', e);
        if (typeof toastr !== 'undefined') toastr.error('AI Error: ' + e.message);
        return null;
    }
}

async function requestDiaryGen(opt) {
    if (!opt) opt = {};
    const trigger = opt.trigger || 'manual';
    const messageRange = opt.messageRange || 30;
    const useAllMessages = opt.useAllMessages || false;
    const startFromIndex = opt.startFromIndex || 0;
    const ctx = SillyTavern.getContext();
    const charName = getCharacterName();
    const userName = getUserName();
    let wm = extension_settings[extensionName].diary.worldMode;
    if (wm === 'auto') wm = detectWorldMode();

    const allChat = ctx.chat || [];
    const endIndex = useAllMessages ? allChat.length : Math.min(startFromIndex + messageRange, allChat.length);
    const startIndex = useAllMessages ? 0 : Math.max(0, endIndex - messageRange);
    const chatSlice = allChat.slice(startIndex, endIndex);
    const chatLog = chatSlice.map(function(m, i) {
        return '[#' + (startIndex + i + 1) + '] ' + (m.is_user ? userName : (m.name || 'NPC')) + ': ' + (m.mes || '').slice(0, 150);
    }).join('\n');

    const prompt = '[System: You are ' + charName + '\'s inner voice. Respond ONLY with valid JSON, no markdown.]\nChat Log:\n' + chatLog + '\n\nWrite a diary entry from ' + charName + '\'s perspective about feelings toward ' + userName + '.\nReturn ONLY this JSON in Thai:\n{\n  "rp_date": "วันที่สมมติ",\n  "rp_location": "สถานที่",\n  "rp_weather": "สภาพอากาศ",\n  "affection_score": 65,\n  "mood": "อารมณ์ในคำเดียว",\n  "diary": "เนื้อหา 3-5 ประโยค มุมมองบุคคลที่ 1",\n  "isSecret": false,\n  "referencedMessageIndex": ' + startIndex + '\n}';
    return await callST(prompt);
}

// ═══════════════════════════════════════════════
// AUTO-TRIGGER
// ═══════════════════════════════════════════════
function setupAutoTriggerListener() {
    $(document).off('messageReceived', onNewChat).on('messageReceived', onNewChat);
}

async function onNewChat() {
    const s = extension_settings[extensionName];
    const cfg = s.diary.autoGen;
    if (!cfg.enabled) return;
    s._internal.messageCounter++;
    const lastMsg = (SillyTavern.getContext().chat ? SillyTavern.getContext().chat.slice(-1)[0].mes : '') || '';
    const lastMsgLower = lastMsg.toLowerCase();
    let gen = false;
    let type = 'auto';
    if (cfg.triggerType === 'turn_count' && s._internal.messageCounter >= cfg.turnInterval) {
        gen = true; type = 'turn'; s._internal.messageCounter = 0;
    } else if (cfg.triggerType === 'emotion') {
        for (let i = 0; i < cfg.emotionKeywords.length; i++) {
            if (lastMsgLower.includes(cfg.emotionKeywords[i])) { gen = true; type = 'emotion'; break; }
        }
    } else if (cfg.triggerType === 'random' && Math.random() < cfg.randomChance) {
        gen = true; type = 'random';
    } else if (lastMsgLower.includes('#จำ') || lastMsgLower.includes('#diary')) {
        gen = true; type = 'user_tag';
    }
    if (!gen) return;
    const res = await requestDiaryGen({ trigger: type, messageRange: s.diary.generation.messageRange });
    if (res) {
        const ctx = SillyTavern.getContext();
        let wm = s.diary.worldMode; if (wm === 'auto') wm = detectWorldMode();
        createMemoryEntry(res, type, ctx, wm, ctx.chat ? ctx.chat.slice(-1)[0].mes : '', ctx.chat ? ctx.chat.length : 0);
    }
}

async function manualGenerate() {
    const s = extension_settings[extensionName].diary;
    const ctx = SillyTavern.getContext();
    $('#lumi-modal-body').html(
        '<div style="padding:16px;">' +
        '<h4 style="color:#ff85a2;margin-bottom:16px;">ตั้งค่าการบันทึก</h4>' +
        '<div style="margin-bottom:16px;">' +
        '<label style="font-size:12px;color:#666;display:block;margin-bottom:6px;">จำนวนข้อความให้อ่าน:</label>' +
        '<input type="range" id="gen-message-range" min="5" max="100" value="' + s.generation.messageRange + '" style="width:100%;">' +
        '<div style="text-align:center;font-size:11px;color:#ffb6c1;"><span id="range-value">' + s.generation.messageRange + '</span> ข้อความล่าสุด</div>' +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
        '<label class="checkbox_label" style="font-size:12px;color:#666;">' +
        '<input type="checkbox" id="gen-use-all"' + (s.generation.useAllMessages ? ' checked' : '') + '>' +
        '<span>อ่านทั้งหมดตั้งแต่เริ่มแชท</span>' +
        '</label>' +
        '</div>' +
        '<div id="gen-start-wrap" style="margin-bottom:16px;' + (s.generation.useAllMessages ? 'display:none;' : '') + '">' +
        '<label style="font-size:12px;color:#666;display:block;margin-bottom:6px;">เริ่มจากข้อความที่:</label>' +
        '<input type="number" id="gen-start-index" value="' + s.generation.startFromIndex + '" min="0" max="' + (ctx.chat ? ctx.chat.length : 0) + '" class="lumi-input" style="width:100%;">' +
        '</div>' +
        '<div style="display:flex;gap:10px;margin-top:20px;">' +
        '<button id="gen-cancel" class="lumi-btn-sm" style="flex:1;">ยกเลิก</button>' +
        '<button id="gen-confirm" class="lumi-btn-gen" style="flex:2;">✨ บันทึกความทรงจำ</button>' +
        '</div>' +
        '</div>'
    );
    $('#gen-message-range').on('input', function() { $('#range-value').text($(this).val()); });
    $('#gen-use-all').on('change', function() { $('#gen-start-wrap').toggle(!$(this).prop('checked')); });
    $('#gen-cancel').on('click', function() { renderDiaryUI(); });
    $('#gen-confirm').on('click', async function() {
        const messageRange = parseInt($('#gen-message-range').val()) || 30;
        const useAllMessages = $('#gen-use-all').prop('checked');
        const startFromIndex = parseInt($('#gen-start-index').val()) || 0;
        s.generation.messageRange = messageRange;
        s.generation.useAllMessages = useAllMessages;
        s.generation.startFromIndex = startFromIndex;
        SillyTavern.getContext().saveSettingsDebounced();
        $('#lumi-modal-body').html('<div style="text-align:center;padding:60px 20px;"><div class="lumi-loader"></div><div style="color:#ff85a2;margin-top:16px;">กำลังบันทึกความทรงจำ...</div></div>');
        let wm = s.worldMode; if (wm === 'auto') wm = detectWorldMode();
        const res = await requestDiaryGen({ trigger: 'manual', messageRange: messageRange, useAllMessages: useAllMessages, startFromIndex: startFromIndex });
        if (res) {
            const ctx2 = SillyTavern.getContext();
            createMemoryEntry(res, 'manual', ctx2, wm, ctx2.chat ? ctx2.chat.slice(-1)[0].mes : '', ctx2.chat ? ctx2.chat.length : 0);
            showToast('บันทึกความทรงจำเสร็จแล้ว', 'success');
            setTimeout(function() { loadAndRenderTimeline(); }, 1000);
        } else {
            showToast('ไม่สามารถบันทึกได้', 'error');
            setTimeout(function() { renderDiaryUI(); }, 1000);
        }
    });
}

function createMemoryEntry(res, type, ctx, wm, refText, messageIndex) {
    const entry = {
        id: 'mem_' + Date.now(),
        timestamp: new Date().toISOString(),
        trigger: type,
        character: getRPGCharacters(1)[0] ? getRPGCharacters(1)[0].name : getCharacterName(),
        characterId: ctx.characterId,
        worldMode: wm,
        content: {
            rp_date: res.rp_date || 'วันไม่ทราบแน่ชัด',
            rp_location: res.rp_location || 'สถานที่ปัจจุบัน',
            rp_weather: res.rp_weather || 'บรรยากาศเงียบสงบ',
            affection_score: res.affection_score || 50,
            mood: res.mood || 'สงบ',
            diary: res.diary || ''
        },
        meta: {
            isPinned: false, isFavorite: false, isHidden: false,
            isSecret: res.isSecret || false,
            unlockCondition: res.isSecret ? { type: 'affection', value: 80 } : null,
            tags: extractTags(res.diary || ''),
            referenceText: refText ? refText.slice(0, 100) : '',
            referencedMessageIndex: res.referencedMessageIndex !== undefined ? res.referencedMessageIndex : (messageIndex - 30)
        }
    };
    saveMemory(entry);
    showToast('บันทึกแล้ว: ' + res.rp_date);
}

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'lumi-styles';
    styleEl.innerHTML =
        "@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500&display=swap');" +
        ":root{--lumi-pink:#FFB6C1;--lumi-pink-soft:#FFF0F5;--lumi-pink-bold:#FF69B4;--lumi-shadow:0 8px 32px rgba(255,105,180,0.15)}" +
        "@keyframes lumiPop{0%{opacity:0;transform:scale(.85) translateY(15px)}100%{opacity:1;transform:scale(1) translateY(0)}}" +
        "@keyframes heartRise{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-80px) scale(1.8)}}" +
        "@keyframes spin{to{transform:rotate(360deg)}}" +
        "@keyframes fadeIn{from{opacity:0}to{opacity:1}}" +
        ".lumi-vector-heart{position:fixed;z-index:2147483647;pointer-events:none;width:28px;height:28px;animation:heartRise .8s ease-out forwards;filter:drop-shadow(0 0 4px #FFB6C1)}" +
        "#lumi-main-fab{position:fixed!important;z-index:2147483647!important;width:48px!important;height:48px!important;border-radius:50%!important;background:#FFF0F5 url('" + btnUrl + "') no-repeat center center!important;background-size:26px!important;border:2px solid #FFB6C1!important;box-shadow:var(--lumi-shadow)!important;cursor:grab!important;touch-action:none!important;user-select:none!important;display:flex!important;align-items:center!important;justify-content:center!important}#lumi-main-fab:active{cursor:grabbing!important}#lumi-main-fab.dragging{transition:none!important}" +
        ".lumi-menu-container{position:fixed;z-index:2147483646;display:none;background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);border-radius:20px;padding:16px;border:1.5px solid rgba(255,182,193,0.3);box-shadow:0 10px 30px rgba(255,182,193,0.2);font-family:'Mitr',sans-serif;font-weight:300;min-width:180px}" +
        ".lumi-menu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}" +
        ".lumi-menu-item{display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;transition:transform .2s;padding:8px;border-radius:12px}" +
        ".lumi-menu-item:hover{transform:translateY(-3px);background:#FFF0F3}" +
        ".lumi-menu-icon{width:42px;height:42px;object-fit:contain}" +
        ".lumi-menu-text{font-size:11px;color:#ff85a2;text-align:center}" +
        ".lumi-modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100dvh;background:rgba(0,0,0,0.3);backdrop-filter:blur(12px);z-index:2147483648;display:none;align-items:center;justify-content:center}" +
        ".lumi-modal-box{width:94%;max-width:480px;height:82vh;background:#fff;border-radius:24px;border:2px solid #FFD1DC;box-shadow:0 20px 50px rgba(255,182,193,0.15);display:flex;flex-direction:column;overflow:hidden;font-family:'Mitr',sans-serif;font-weight:300;animation:lumiPop .3s forwards}" +
        ".lumi-modal-header{padding:16px 20px;text-align:center;color:#ff85a2;border-bottom:1.5px solid #FFF0F3;position:relative;font-size:14px;font-weight:400;display:flex;align-items:center;justify-content:center}" +
        ".lumi-modal-back{position:absolute;left:12px;top:14px;width:26px;height:26px;background:#FFF0F3;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ff85a2}" +
        ".lumi-modal-close{position:absolute;right:12px;top:14px;width:26px;height:26px;background:#FFF0F3;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ff85a2}" +
        ".lumi-modal-body{flex:1;padding:16px;overflow-y:auto}" +
        ".lumi-btn-gen{background:linear-gradient(135deg,#FFB6C1,#FF85A2);color:#fff;border:none;padding:10px 24px;border-radius:16px;font-family:'Mitr';cursor:pointer;transition:opacity .2s;box-shadow:0 4px 12px rgba(255,133,162,0.2);font-size:13px;font-weight:400}.lumi-btn-gen:hover{opacity:.9}" +
        ".lumi-btn-sm{padding:6px 12px;border-radius:10px;border:none;background:#FFF0F3;color:#ff85a2;font-family:'Mitr';font-size:10px;cursor:pointer;transition:.2s;display:inline-flex;align-items:center;gap:4px}.lumi-btn-sm:hover{background:#FFE0E6}.lumi-btn-sm.danger{background:#FFE0E0;color:#ff6b6b}" +
        ".lumi-btn-icon{width:24px;height:24px;border-radius:50%;border:none;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ffb6c1;transition:.2s;padding:0}.lumi-btn-icon:hover{background:#FFF0F3;transform:scale(1.1)}.lumi-btn-icon.active{background:#FFF0F3;color:#FFD700}.lumi-btn-icon.danger:hover{background:#FFE0E0;color:#ff6b6b}" +
        ".lumi-loader{width:32px;height:32px;border:3px solid #FFF0F3;border-top-color:#ff85a2;border-radius:50%;animation:spin 1s infinite linear;margin:0 auto}" +
        ".lumi-nav-tabs{display:flex;gap:6px;margin-bottom:14px;border-bottom:1px solid #FFF0F3;padding-bottom:8px}" +
        ".lumi-nav-tab{padding:5px 12px;border-radius:10px;background:transparent;color:#ffb6c1;font-family:'Mitr';font-size:10px;cursor:pointer;transition:.2s;border:none}.lumi-nav-tab:hover{background:#FFF0F3}.lumi-nav-tab.active{background:#FFB6C1;color:#fff}" +
        ".lumi-filter-bar{display:flex;gap:6px;margin-bottom:12px}" +
        ".lumi-filter-select,.lumi-filter-search{flex:1;padding:6px 10px;border:1.5px solid #FFD1DC;border-radius:10px;background:#fff;color:#ff85a2;font-family:'Mitr';font-size:11px;outline:none}.lumi-filter-search{color:#666}" +
        ".lumi-timeline-date{font-size:11px;color:#ffb6c1;padding:6px 0;border-bottom:1px dashed #FFE8EE;margin:10px 0 6px;display:flex;align-items:center;gap:5px}" +
        ".lumi-memory-card{background:#FFFBFC;border:1px solid #FFE8EE;border-radius:14px;padding:12px;margin-bottom:8px;position:relative;transition:box-shadow .2s}.lumi-memory-card.pinned{border:1.5px solid #FFD1DC;background:#FFF8FA}.lumi-memory-card.favorite{border-left:3px solid #FFD700}.lumi-memory-card.secret-locked{opacity:.7;background:#F8F8F8}" +
        ".lumi-memory-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;flex-wrap:wrap;gap:4px}" +
        ".lumi-memory-char{font-weight:400;color:#444;font-size:12px;display:flex;align-items:center;gap:5px}" +
        ".lumi-char-dot{width:7px;height:7px;border-radius:50%;display:inline-block}" +
        ".lumi-rp-info{background:#FFF0F3;padding:2px 7px;border-radius:8px;color:#ff85a2;font-size:9px;display:inline-flex;align-items:center;gap:3px}" +
        ".lumi-memory-content{font-size:12px;color:#555;line-height:1.6;margin:7px 0 8px;white-space:pre-wrap}" +
        ".lumi-memory-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px}" +
        ".lumi-tag{font-size:9px;padding:2px 7px;border-radius:9px;background:#FFF0F3;color:#ff85a2}" +
        ".lumi-memory-actions{display:flex;gap:5px;justify-content:flex-end;border-top:1px solid #FFE8EE;padding-top:7px}" +
        ".lumi-locked-overlay{position:absolute;inset:0;background:rgba(255,255,255,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;z-index:1;border-radius:14px}" +
        ".lumi-locked-text{font-size:11px;color:#ffb6c1}.lumi-locked-hint{font-size:9px;color:#ccc}" +
        ".lumi-ref-badge{background:#FFF0F3;padding:2px 6px;border-radius:6px;font-size:9px;color:#ff85a2;cursor:pointer}.lumi-ref-badge:hover{background:#FFE0E6}" +
        ".lumi-settings-card{background:#FFF9FA;border:1px solid #FFE8EE;border-radius:14px;padding:12px;margin-bottom:10px}" +
        ".lumi-settings-card h4{font-size:12px;color:#ff85a2;margin:0 0 10px;font-weight:400;display:flex;align-items:center;gap:5px}" +
        ".lumi-input{width:100%;background:#fff;border:1.5px solid #FFD1DC;border-radius:10px;padding:7px 10px;color:#ff85a2;font-family:'Mitr';font-size:11px;outline:none;box-sizing:border-box}" +
        ".lumi-stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px}" +
        ".lumi-stat-card{background:#FFF9FA;border:1px solid #FFE8EE;border-radius:12px;padding:12px;text-align:center}" +
        ".lumi-stat-value{font-size:20px;color:#ff85a2;font-weight:500;margin-bottom:3px}.lumi-stat-label{font-size:10px;color:#888}" +
        ".lumi-rpg-columns{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}" +
        ".lumi-character-column{background:#FFFBFC;border:1px solid #FFE8EE;border-radius:14px;padding:10px}" +
        ".lumi-character-header{display:flex;align-items:center;gap:7px;margin-bottom:8px;padding-bottom:7px;border-bottom:1px dashed #FFE8EE}" +
        ".lumi-character-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;flex-shrink:0}" +
        ".lumi-character-name{font-size:12px;color:#444;font-weight:400}.lumi-character-count{font-size:9px;color:#ffb6c1}" +
        ".lumi-empty{text-align:center;color:#ffb6c1;padding:30px 20px;font-size:12px;line-height:1.6}" +
        ".lumi-toggle-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:11px;color:#666}" +
        ".lumi-toggle{position:relative;width:32px;height:17px;background:#FFE8EE;border-radius:9px;cursor:pointer;transition:.3s}.lumi-toggle.active{background:#FFB6C1}" +
        ".lumi-toggle::after{content:'';position:absolute;top:2px;left:2px;width:13px;height:13px;background:#fff;border-radius:50%;transition:.3s;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.lumi-toggle.active::after{left:17px}" +
        "#lumi-settings-drawer .inline-drawer-content{font-family:'Mitr',sans-serif;font-weight:300;padding:10px 0}" +
        "#lumi-settings-drawer .menu_button{background:linear-gradient(135deg,#FFB6C1,#FF85A2);color:white;border:none;border-radius:10px;padding:7px 10px;font-family:'Mitr',sans-serif;font-size:11px;cursor:pointer;width:100%;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:5px}" +
        "#lumi-settings-drawer .menu_button.danger{background:linear-gradient(135deg,#ff6b6b,#ff4757)}" +
        "#lumi-settings-drawer .text_pole{background:#FFF9FA;border:1.5px solid #FFD1DC;border-radius:10px;color:#ff85a2;font-family:'Mitr',sans-serif;font-size:11px;padding:5px 8px;outline:none;width:100%}" +
        "#lumi-settings-drawer .checkbox_label{font-size:12px;color:#aaa}" +
        "@media(max-width:768px){.lumi-rpg-columns{grid-template-columns:1fr}.lumi-stats-grid{grid-template-columns:1fr}}";
    document.head.appendChild(styleEl);
}

// ═══════════════════════════════════════════════
// HEART
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) {
    const h = document.createElement('div');
    h.className = 'lumi-vector-heart'; h.innerHTML = svgHeart;
    h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
    document.body.appendChild(h);
    setTimeout(function() { h.remove(); }, 800);
}

// ═══════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════
function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(150);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(250);
    if (type === 'forum') renderForumUI();
    else if (type === 'diary') renderDiaryUI();
    else if (type === 'phone') {
        $('#lumi-modal-title').text('Phone');
        $('#lumi-modal-body').html('<div class="lumi-empty">Coming Soon 🌸</div>');
    }
}

function createContentModal() {
    if ($('#lumi-modal-overlay').length) return;
    $('body').append(
        '<div id="lumi-modal-overlay" class="lumi-modal-overlay">' +
        '<div class="lumi-modal-box">' +
        '<div class="lumi-modal-header">' +
        '<div class="lumi-modal-back" id="lumi-modal-back">' + svgBack + '</div>' +
        '<span id="lumi-modal-title"></span>' +
        '<div class="lumi-modal-close">' + svgClose + '</div>' +
        '</div>' +
        '<div id="lumi-modal-body" class="lumi-modal-body"></div>' +
        '</div>' +
        '</div>'
    );
    $('#lumi-modal-back').on('click', function() { loadAndRenderTimeline(); });
    $('#lumi-modal-overlay').on('click', function(e) { if (e.target.id === 'lumi-modal-overlay') $(this).fadeOut(200); });
    $(document).off('click', '.lumi-modal-close').on('click', '.lumi-modal-close', function() { $('#lumi-modal-overlay').fadeOut(200); });
}

// ═══════════════════════════════════════════════
// FORUM
// ═══════════════════════════════════════════════
function renderForumUI() {
    $('#lumi-modal-title').text('Forum');
    $('#lumi-modal-body').html('<div class="lumi-empty">Coming Soon 🌸</div>');
}

// ═══════════════════════════════════════════════
// DIARY UI
// ═══════════════════════════════════════════════
function renderDiaryUI() {
    const cn = getCharacterName();
    $('#lumi-modal-title').text(cn + "'s Memories");
    const chars = getRPGCharacters(10);
    let charOptions = '<option value="">ทุกตัวละคร</option>';
    for (let i = 0; i < chars.length; i++) {
        charOptions += '<option value="' + escapeHtml(chars[i].name) + '">' + escapeHtml(chars[i].name) + '</option>';
    }
    $('#lumi-modal-body').html(
        '<div class="lumi-nav-tabs">' +
        '<button class="lumi-nav-tab active" data-view="timeline">Timeline</button>' +
        '<button class="lumi-nav-tab" data-view="rpg">RPG View</button>' +
        '</div>' +
        '<div style="text-align:center;margin-bottom:12px;">' +
        '<button id="lumi-manual-gen" class="lumi-btn-gen">' + svgPlus + ' บันทึกความทรงจำ</button>' +
        '</div>' +
        '<div class="lumi-filter-bar">' +
        '<select id="lumi-f-char" class="lumi-filter-select">' + charOptions + '</select>' +
        '<input id="lumi-f-search" class="lumi-filter-search" placeholder="ค้นหา...">' +
        '</div>' +
        '<div id="lumi-timeline-panel" class="lumi-timeline-container"></div>'
    );
    loadAndRenderTimeline();
    $('#lumi-f-char, #lumi-f-search').on('change keyup', function() { setTimeout(loadAndRenderTimeline, 200); });
    $('#lumi-manual-gen').on('click', manualGenerate);
    $('.lumi-nav-tab').on('click', function() {
        $('.lumi-nav-tab').removeClass('active'); $(this).addClass('active');
        const view = $(this).data('view');
        if (view === 'timeline') loadAndRenderTimeline();
        else if (view === 'rpg') renderRPGView();
    });
}

function loadAndRenderTimeline() {
    const f = { character: $('#lumi-f-char').val() || null, showSecret: extension_settings[extensionName].diary.display.showSecret };
    const q = ($('#lumi-f-search').val() || '').toLowerCase();
    let mem = loadMemories(f);
    if (q) { mem = mem.filter(function(m) { return (m.content.diary || '').toLowerCase().includes(q) || (m.content.mood || '').includes(q); }); }
    const p = $('#lumi-timeline-panel');
    if (!mem.length) { p.html('<div class="lumi-empty">ยังไม่มีความทรงจำ<br><small>กด "บันทึกความทรงจำ" เพื่อเริ่มต้น</small></div>'); return; }
    const grouped = {};
    for (let i = 0; i < mem.length; i++) {
        const m = mem[i];
        const dk = m.content.rp_date || 'ไม่ระบุวันที่';
        if (!grouped[dk]) grouped[dk] = [];
        grouped[dk].push(m);
    }
    let h = '';
    for (const date in grouped) {
        if (grouped.hasOwnProperty(date)) {
            const entries = grouped[date];
            h += '<div class="lumi-timeline-date">' + svgCalendar + ' ' + escapeHtml(date) + '</div>';
            for (let j = 0; j < entries.length; j++) { h += renderMemoryCard(entries[j], false); }
        }
    }
    p.html(h);
    bindMemoryCardEvents();
}

function renderRPGView() {
    const f = { character: $('#lumi-f-char').val() || null, showSecret: extension_settings[extensionName].diary.display.showSecret };
    let mem = loadMemories(f);
    const byChar = {};
    for (let i = 0; i < mem.length; i++) { const m = mem[i]; if (!byChar[m.character]) byChar[m.character] = []; byChar[m.character].push(m); }
    const panel = $('#lumi-timeline-panel');
    if (!Object.keys(byChar).length) { panel.html('<div class="lumi-empty">ยังไม่มีความทรงจำ</div>'); return; }
    let html = '<div class="lumi-rpg-columns">';
    for (const char in byChar) {
        if (byChar.hasOwnProperty(char)) {
            const entries = byChar[char];
            const color = generateColorFromString(char);
            html += '<div class="lumi-character-column">' +
                '<div class="lumi-character-header">' +
                '<div class="lumi-character-avatar" style="background:' + color + '">' + escapeHtml(char.charAt(0).toUpperCase()) + '</div>' +
                '<div><div class="lumi-character-name">' + escapeHtml(char) + '</div><div class="lumi-character-count">' + entries.length + ' ความทรงจำ</div></div>' +
                '</div>';
            for (let j = 0; j < entries.length; j++) { html += renderMemoryCard(entries[j], true); }
            html += '</div>';
        }
    }
    html += '</div>';
    panel.html(html);
    bindMemoryCardEvents();
}

function renderMemoryCard(entry, compact) {
    if (compact === undefined) compact = false;
    const isLocked = entry.meta.isSecret && !checkUnlock(entry);
    const color = generateColorFromString(entry.character);
    const rp = '<span class="lumi-rp-info">' + svgMapPin + ' ' + escapeHtml(entry.content.rp_location) + '</span><span class="lumi-rp-info">' + svgCloud + ' ' + escapeHtml(entry.content.rp_weather) + '</span>';
    const refBadge = entry.meta.referencedMessageIndex !== undefined ? '<span class="lumi-ref-badge" data-msg-index="' + entry.meta.referencedMessageIndex + '">#' + (entry.meta.referencedMessageIndex + 1) + '</span>' : '';
    let tags = '';
    if (entry.meta.tags && entry.meta.tags.length) { for (let i = 0; i < entry.meta.tags.length; i++) { tags += '<span class="lumi-tag">' + entry.meta.tags[i] + '</span>'; } }
    const acts = '<button class="lumi-btn-icon' + (entry.meta.isPinned ? ' active' : '') + '" data-act="pin">' + svgPin + '</button>' +
        '<button class="lumi-btn-icon' + (entry.meta.isFavorite ? ' active' : '') + '" data-act="fav">' + (entry.meta.isFavorite ? svgStarFilled : svgStar) + '</button>' +
        '<button class="lumi-btn-icon" data-act="ref">' + svgRef + '</button>' +
        '<button class="lumi-btn-icon danger" data-act="del">' + svgTrash + '</button>';
    if (isLocked) {
        return '<div class="lumi-memory-card secret-locked" data-id="' + entry.id + '">' +
            '<div class="lumi-locked-overlay">' + svgLock + '<div class="lumi-locked-text">ความทรงจำนี้ยังมองไม่เห็น</div><div class="lumi-locked-hint">จะเปิดเผยเมื่อถึงเวลา...</div></div>' +
            '<div class="lumi-memory-header"><span class="lumi-memory-char"><span class="lumi-char-dot" style="background:' + color + '"></span>' + escapeHtml(entry.character) + '</span></div>' +
            '</div>';
    }
    return '<div class="lumi-memory-card' + (entry.meta.isPinned ? ' pinned' : '') + (entry.meta.isFavorite ? ' favorite' : '') + '" data-id="' + entry.id + '">' +
        '<div class="lumi-memory-header">' +
        '<span class="lumi-memory-char"><span class="lumi-char-dot" style="background:' + color + '"></span>' + escapeHtml(entry.character) + '</span>' +
        '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">' + (compact ? '' : rp) + ' ' + refBadge + '</div>' +
        '</div>' +
        '<div style="font-size:10px;color:#888;margin-bottom:5px;">' + escapeHtml(entry.content.mood) + ' · ❤️ ' + entry.content.affection_score + '</div>' +
        '<div class="lumi-memory-content">' + escapeHtml(entry.content.diary) + '</div>' +
        '<div class="lumi-memory-tags">' + tags + '</div>' +
        (compact ? '' : '<div class="lumi-memory-actions">' + acts + '</div>') +
        '</div>';
}

function bindMemoryCardEvents() {
    $('.lumi-btn-icon[data-act="pin"]').off('click').on('click', function(e) { e.stopPropagation(); togglePin($(this).closest('.lumi-memory-card').data('id')); });
    $('.lumi-btn-icon[data-act="fav"]').off('click').on('click', function(e) { e.stopPropagation(); toggleFavorite($(this).closest('.lumi-memory-card').data('id')); });
    $('.lumi-btn-icon[data-act="ref"]').off('click').on('click', function(e) { e.stopPropagation(); showRef($(this).closest('.lumi-memory-card').data('id')); });
    $('.lumi-btn-icon[data-act="del"]').off('click').on('click', function(e) { e.stopPropagation(); delMem($(this).closest('.lumi-memory-card').data('id')); });
    $('.lumi-ref-badge').off('click').on('click', function(e) { e.stopPropagation(); scrollToMessage($(this).data('msg-index')); });
}

function togglePin(id) { const s = extension_settings[extensionName]; const m = s.memories.find(function(x) { return x.id === id; }); if (m) { m.meta.isPinned = !m.meta.isPinned; SillyTavern.getContext().saveSettingsDebounced(); loadAndRenderTimeline(); } }
function toggleFavorite(id) { const s = extension_settings[extensionName]; const m = s.memories.find(function(x) { return x.id === id; }); if (m) { m.meta.isFavorite = !m.meta.isFavorite; if (m.meta.isFavorite && !m.meta.tags.includes('#ล้ำค่า')) m.meta.tags.push('#ล้ำค่า'); else m.meta.tags = m.meta.tags.filter(function(t) { return t !== '#ล้ำค่า'; }); SillyTavern.getContext().saveSettingsDebounced(); loadAndRenderTimeline(); showToast(m.meta.isFavorite ? '⭐ เพิ่มเป็นความทรงจำล้ำค่า' : 'เอาออกจากรายการล้ำค่า'); } }
function showRef(id) { const m = extension_settings[extensionName].memories.find(function(x) { return x.id === id; }); if (m && m.meta.referencedMessageIndex !== undefined) scrollToMessage(m.meta.referencedMessageIndex); else if (m) showToast(m.meta.referenceText || 'ไม่มีข้อมูล'); }
function delMem(id) { if (confirm('ลบความทรงจำนี้?')) { const s = extension_settings[extensionName]; s.memories = s.memories.filter(function(x) { return x.id !== id; }); SillyTavern.getContext().saveSettingsDebounced(); loadAndRenderTimeline(); } }

// ═══════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════
function createSettingsUI() {
    if ($('#lumi-settings-drawer').length) return;
    const s = extension_settings[extensionName].diary;
    const ag = s.autoGen;
    $('#extensions_settings').append(
        '<div id="lumi-settings-drawer" class="inline-drawer">' +
        '<div class="inline-drawer-toggle inline-drawer-header">' +
        '<b style="color:#ff85a2;font-family:\'Mitr\';font-weight:300;">LumiPulse</b>' +
        '<div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>' +
        '</div>' +
        '<div class="inline-drawer-content" style="display:none;">' +
        '<div style="margin-bottom:10px;">' +
        '<label class="checkbox_label">' +
        '<input id="lumi_enable_toggle" type="checkbox"' + (extension_settings[extensionName].isEnabled ? ' checked' : '') + ' />' +
        '<span>เปิดใช้งาน</span>' +
        '</label>' +
        '</div>' +
        '<div style="margin-bottom:8px;">' +
        '<label style="font-size:11px;color:#888;">โหมดโลก</label>' +
        '<select id="lumi_world_mode" class="text_pole">' +
        '<option value="auto"' + (s.worldMode === 'auto' ? ' selected' : '') + '>อัตโนมัติ</option>' +
        '<option value="solo"' + (s.worldMode === 'solo' ? ' selected' : '') + '>เดี่ยว</option>' +
        '<option value="rpg"' + (s.worldMode === 'rpg' ? ' selected' : '') + '>RPG</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-bottom:8px;">' +
        '<label class="checkbox_label">' +
        '<input id="lumi_autogen_toggle" type="checkbox"' + (ag.enabled ? ' checked' : '') + ' />' +
        '<span>เจนอัตโนมัติ</span>' +
        '</label>' +
        '</div>' +
        '<div style="margin-top:12px;border-top:1px solid #333;padding-top:10px;">' +
        '<button id="lumi_reset_fab" class="menu_button" style="margin-bottom:4px;">📍 รีเซ็ตปุ่มลอย</button>' +
        '<button id="lumi_clear_memories" class="menu_button danger">🗑️ ล้างทั้งหมด</button>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
    $('#lumi_enable_toggle').on('change', function() {
        extension_settings[extensionName].isEnabled = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        if (extension_settings[extensionName].isEnabled) { setTimeout(function() { spawnLumiButton(); createContentModal(); setupAutoTriggerListener(); }, 500); }
        else { $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove(); $(document).off('messageReceived', onNewChat); }
    });
    $('#lumi_world_mode').on('change', function() { extension_settings[extensionName].diary.worldMode = $(this).val(); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi_autogen_toggle').on('change', function() { extension_settings[extensionName].diary.autoGen.enabled = $(this).prop('checked'); SillyTavern.getContext().saveSettingsDebounced(); });
    $('#lumi_reset_fab').on('click', function() { saveFabPosition(null); $('#lumi-main-fab, .lumi-menu-container').remove(); spawnLumiButton(); showToast('รีเซ็ตปุ่มแล้ว'); });
    $('#lumi_clear_memories').on('click', function() { if (confirm('ล้างความทรงจำทั้งหมด?')) { extension_settings[extensionName].memories = []; SillyTavern.getContext().saveSettingsDebounced(); showToast('ล้างแล้ว'); } });
}

// ═══════════════════════════════════════════════
// FAB BUTTON - Drag Fix ONLY (โครงสร้างเดิม + แก้ลากได้)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    if (!document.body) { setTimeout(spawnLumiButton, 800); return; }

    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    const pos = loadFabPosition();
    if (pos) {
        fab.style.top = pos.top || 'auto';
        fab.style.left = pos.left || 'auto';
        fab.style.right = pos.right || 'auto';
        fab.style.bottom = pos.bottom || 'auto';
        fab.style.transform = pos.transform || 'none';
    } else {
        fab.style.top = '50%';
        fab.style.right = '0px';
        fab.style.transform = 'translateY(-50%)';
    }
    document.body.appendChild(fab);

    // เมนู 3 อย่างตามเดิม: Diary, Phone, Forum (ใช้ icon URL เดิม)
    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML =
        '<div class="lumi-menu-grid">' +
        '<div class="lumi-menu-item" id="lumi-diary"><img src="' + iconDiary + '" class="lumi-menu-icon" alt="diary"><span class="lumi-menu-text">Diary</span></div>' +
        '<div class="lumi-menu-item" id="lumi-phone"><img src="' + iconPhone + '" class="lumi-menu-icon" alt="phone"><span class="lumi-menu-text">Phone</span></div>' +
        '<div class="lumi-menu-item" id="lumi-forum"><img src="' + iconForum + '" class="lumi-menu-icon" alt="forum"><span class="lumi-menu-text">Forum</span></div>' +
        '</div>';
    document.body.appendChild(menu);

    function updateMenuPos() {
        const r = fab.getBoundingClientRect();
        const m = $(menu);
        let l = r.left - (m.outerWidth() / 2) + (r.width / 2);
        let t = r.top - m.outerHeight() - 10;
        if (l < 10) l = 10;
        if (l + m.outerWidth() > window.innerWidth - 10) l = window.innerWidth - m.outerWidth() - 10;
        if (t < 10) t = r.bottom + 10;
        m.css({ left: l + 'px', top: t + 'px' });
    }

    // 🆕 Drag System Fix: ใช้เทคนิคจาก Claude แต่เก็บโครงสร้างเดิม
    let isDragging = false;
    let hasMoved = false;
    let dragStart = { x: 0, y: 0 };
    let offset = { x: 0, y: 0 };
    let currentPos = { x: 0, y: 0 };
    const TH = 8;

    // Mouse Drag - แก้ด้วย passive: false + preventDefault + hasMoved flag
    fab.addEventListener('mousedown', function(e) {
        if (e.button === 2) return;
        e.preventDefault(); // ✅ ป้องกันการเลือกข้อความ
        isDragging = false;
        hasMoved = false; // ✅ flag แยก Tap vs Drag
        fab.classList.add('dragging');
        const rect = fab.getBoundingClientRect();
        offset.x = e.clientX - rect.left;
        offset.y = e.clientY - rect.top;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        currentPos.x = rect.left;
        currentPos.y = rect.top;

        function onMove(ev) {
            const dist = Math.hypot(ev.clientX - dragStart.x, ev.clientY - dragStart.y);
            // ✅ ถ้าขยับเกิน threshold = เริ่มลาก
            if (dist > TH && !hasMoved) {
                hasMoved = true;
                isDragging = true;
                $(menu).fadeOut(50);
                fab.style.transform = 'none';
                fab.style.right = 'auto';
                fab.style.bottom = 'auto';
            }
            if (!isDragging) return;
            currentPos.x = Math.max(0, Math.min(ev.clientX - offset.x, window.innerWidth - 48));
            currentPos.y = Math.max(0, Math.min(ev.clientY - offset.y, window.innerHeight - 48));
            fab.style.left = currentPos.x + 'px';
            fab.style.top = currentPos.y + 'px';
        }

        function onUp(ev) {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            fab.classList.remove('dragging');
            // ✅ ถ้าไม่ขยับ = แตะปกติ (เปิดเมนู)
            if (!hasMoved) {
                updateMenuPos();
                $(menu).fadeToggle(150);
            } else {
                // ✅ ถ้าลาก = บันทึกตำแหน่ง
                saveFabPosition({
                    top: currentPos.y + 'px',
                    left: currentPos.x + 'px',
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'none'
                });
            }
            isDragging = false;
            hasMoved = false;
        }

        document.addEventListener('mousemove', onMove, { passive: false }); // ✅ passive: false
        document.addEventListener('mouseup', onUp, { passive: false });
    }, { passive: false }); // ✅ passive: false

    // Touch Drag - แก้เหมือน Mouse
    let isTouchDrag = false;
    let hasTouchMoved = false;

    fab.addEventListener('touchstart', function(e) {
        e.preventDefault(); // ✅ ป้องกัน scroll
        isTouchDrag = false;
        hasTouchMoved = false;
        fab.classList.add('dragging');
        const touch = e.touches[0];
        const rect = fab.getBoundingClientRect();
        offset.x = touch.clientX - rect.left;
        offset.y = touch.clientY - rect.top;
        dragStart.x = touch.clientX;
        dragStart.y = touch.clientY;
        currentPos.x = rect.left;
        currentPos.y = rect.top;
    }, { passive: false });

    fab.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const dist = Math.hypot(touch.clientX - dragStart.x, touch.clientY - dragStart.y);
        if (dist > TH && !hasTouchMoved) {
            hasTouchMoved = true;
            isTouchDrag = true;
            $(menu).fadeOut(50);
            fab.style.transform = 'none';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
        }
        if (!isTouchDrag) return;
        currentPos.x = Math.max(0, Math.min(touch.clientX - offset.x, window.innerWidth - 48));
        currentPos.y = Math.max(0, Math.min(touch.clientY - offset.y, window.innerHeight - 48));
        fab.style.left = currentPos.x + 'px';
        fab.style.top = currentPos.y + 'px';
    }, { passive: false });

    fab.addEventListener('touchend', function(e) {
        e.preventDefault();
        fab.classList.remove('dragging');
        if (!hasTouchMoved) {
            updateMenuPos();
            $(menu).fadeToggle(150);
        } else {
            saveFabPosition({
                top: currentPos.y + 'px',
                left: currentPos.x + 'px',
                right: 'auto',
                bottom: 'auto',
                transform: 'none'
            });
        }
        isTouchDrag = false;
        hasTouchMoved = false;
    }, { passive: false });

    // Menu Clicks - 3 อย่างตามเดิม
    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', function() { openLumiModal('diary'); });
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', function() { openLumiModal('phone'); });
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', function() { openLumiModal('forum'); });
}

function showToast(m, t) {
    if (!t) t = 'info';
    if (typeof toastr !== 'undefined') toastr[t](m, 'LumiPulse');
}

