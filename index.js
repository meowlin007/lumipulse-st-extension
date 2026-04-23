"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
    forumTopic: "",
    isForumInitialized: false,
    includeRandomNPCs: true,
    forumData: [],
    diaryData: null, // legacy - keep for backward compat
    
    // 🆕 Diary 2.0 Settings
    diary: {
        // World Mode
        worldMode: 'auto', // 'auto' | 'solo' | 'rpg'
        
        // Auto-generation triggers
        autoGen: {
            enabled: true,
            triggerType: 'turn_count', // 'turn_count' | 'emotion' | 'random' | 'user_tag'
            turnInterval: 20,
            emotionKeywords: ['รัก', 'โกรธ', 'เสียใจ', 'ดีใจ', 'ตกใจ', 'หัวใจ', 'ชอบ'],
            randomChance: 0.1 // 10% chance per message
        },
        
        // Display preferences
        display: {
            viewMode: 'timeline', // 'timeline' | 'grid'
            showSecret: true, // show locked memories with overlay
            secretUnlockMode: 'affection' // 'affection' | 'event' | 'manual'
        },
        
        // Storage
        storage: {
            maxEntries: 50,
            autoSave: true
        }
    },
    
    // 🆕 Memory storage (array of entries)
    memories: [],
    
    // 🆕 Tracking for auto-triggers
    _internal: {
        messageCounter: 0,
        lastGenerated: 0,
        firstChatDate: null
    }
};
let extension_settings = {};
// ═══════════════════════════════════════════════
// ASSETS (รักษาเดิมของคุณ)
// ═══════════════════════════════════════════════
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
// BOOT
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
    const context = SillyTavern.getContext();
    
    // Initialize settings with defaults
    if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = { ...defaultSettings };
        context.saveSettingsDebounced();
    }
    
    // Merge old settings with new structure (backward compat)
    const s = context.extensionSettings[extensionName];
    if (!s.diary) s.diary = { ...defaultSettings.diary };
    if (!s.memories) s.memories = [];
    if (!s._internal) s._internal = { ...defaultSettings._internal };
    
    // Migrate old single diaryData to memories array
    if (s.diaryData && s.memories.length === 0) {
        s.memories.push({
            id: "mem_legacy_" + Date.now(),
            timestamp: new Date().toISOString(),
            trigger: "legacy_import",
            character: getCharacterName(),
            characterId: context.characterId,            worldMode: 'solo',
            linkedCharacters: [],
            content: { ...s.diaryData },
            meta: {
                isFavorite: false,
                isHidden: false,
                isSecret: false,
                unlockCondition: null,
                tags: ["#นำเข้า"],
                relatedMessages: [],
                linkedMemoryIds: []
            }
        });
        s.diaryData = null; // clear legacy
        context.saveSettingsDebounced();
    }
    
    extension_settings = context.extensionSettings;
    
    injectStyles();
    createSettingsUI();
    
    if (extension_settings[extensionName].isEnabled) {
        spawnLumiButton();
        createContentModal();
        setupAutoTriggerListener(); // 🆕 ตั้งค่าระบบทริกเกอร์อัตโนมัติ
    }
}

// ═══════════════════════════════════════════════
// 🆕 HELPER FUNCTIONS (ใหม่)
// ═══════════════════════════════════════════════

/** 🔍 ตรวจจับโหมดโลก: Solo หรือ RPG */
function detectWorldMode() {
    const chat = SillyTavern.getContext().chat || [];
    const uniqueChars = new Set();
    
    chat.slice(-50).forEach(msg => {
        if (msg.name && !msg.is_user && !msg.is_system) {
            uniqueChars.add(msg.name);
        }
    });
    
    return uniqueChars.size > 2 ? 'rpg' : 'solo';
}

/** 🎭 ดึงรายชื่อตัวละครจากแชท (สำหรับโหมด RPG) */
function getChatNPCs(limit = 5) {
    const chat = SillyTavern.getContext().chat || [];    const names = new Set();
    const currentChar = getCharacterName();
    
    chat.slice(-40).forEach(m => {
        if (m.name && !m.is_user && !m.is_system && m.name !== currentChar) {
            names.add(m.name);
        }
    });
    
    return Array.from(names).slice(0, limit);
}

/** 🎲 ตรวจสอบเหตุการณ์พิเศษ (วันเกิด, ครบรอบ, ฤดูกาล) */
function checkForSpecialEvent(charName, characterData) {
    const today = new Date();
    const desc = characterData?.description || '';
    const notes = characterData?.data?.creator_notes || '';
    
    // 🎂 Birthday check (format: birthday: DD/MM หรือ birthday DD/MM)
    const birthdayMatch = (desc + notes).match(/birthday[:\s]+(\d{1,2})[\/\-](\d{1,2})/i);
    if (birthdayMatch) {
        const [, day, month] = birthdayMatch;
        if (today.getDate() == day && today.getMonth() + 1 == month) {
            return {
                type: 'birthday',
                label: '🎂 วันเกิด',
                isSecret: false,
                promptBoost: `Today is ${charName}'s birthday! Write a special diary entry about their feelings, hopes, and wishes on this meaningful day.`
            };
        }
    }
    
    // 💕 Anniversary check (first chat date)
    const firstDate = extension_settings[extensionName]._internal.firstChatDate;
    if (firstDate) {
        const daysSince = Math.floor((today - new Date(firstDate)) / (1000*60*60*24));
        if ([30, 100, 365].includes(daysSince)) {
            return {
                type: `anniversary_${daysSince}d`,
                label: `💕 ครบ ${daysSince} วัน`,
                isSecret: daysSince >= 100,
                promptBoost: `It's been ${daysSince} days since ${charName} first met the user. Reflect on how their relationship has changed, memorable moments, and feelings about this journey.`
            };
        }
    }
    
    // 🍂 Season change (start of month)
    if (today.getDate() <= 3) {
        const month = today.getMonth();
        const season = month >= 2 && month <= 4 ? 'ฤดูใบไม้ผลิ🌸' :                        month >= 5 && month <= 7 ? 'ฤดูร้อน☀️' :
                       month >= 8 && month <= 10 ? 'ฤดูใบไม้ร่วง🍁' : 'ฤดูหนาว❄️';
        return {
            type: `season_${month}`,
            label: `🗓️ ${season}`,
            isSecret: false,
            promptBoost: `A new season has begun (${season}). Write about ${charName}'s hopes, feelings, and expectations for this season, and how it relates to their relationship with the user.`
        };
    }
    
    return null;
}

/** 🏷️ แยกแท็กอัตโนมัติจากเนื้อหาไดอารี่ */
function extractTags(diaryText) {
    const tags = [];
    const keywords = {
        '#โรแมนติก': ['รัก', 'หัวใจ', 'ชอบ', 'แอบชอบ', 'ใจเต้น'],
        '#ดราม่า': ['เสียใจ', 'ร้องไห้', 'เจ็บปวด', 'ผิดหวัง'],
        '#ตลก': ['ขำ', 'ตลก', 'ฮา', '555'],
        '#จุดเปลี่ยน': ['ตัดสินใจ', 'เปลี่ยน', 'เริ่ม', 'ครั้งแรก'],
        '#อบอุ่น': ['อบอุ่น', 'สุขใจ', 'ขอบคุณ', 'ดีใจ']
    };
    
    const lower = diaryText.toLowerCase();
    for (const [tag, words] of Object.entries(keywords)) {
        if (words.some(w => lower.includes(w))) {
            tags.push(tag);
        }
    }
    
    return tags.slice(0, 3); // max 3 tags
}

/** 🔒 เช็คว่าความทรงจำลับปลดล็อกหรือยัง */
function checkUnlockCondition(memory) {
    if (!memory.meta.isSecret) return true;
    
    const config = extension_settings[extensionName].diary.display;
    if (config.secretUnlockMode === 'manual') return false;
    
    if (config.secretUnlockMode === 'affection') {
        // ปลดล็อกถ้า affection >= ค่าที่กำหนด
        const threshold = memory.meta.unlockCondition?.value || 80;
        return (memory.content.affection_score || 0) >= threshold;
    }
    
    if (config.secretUnlockMode === 'event') {
        // ปลดล็อกถ้าเป็นอีเวนต์ที่ผ่านแล้ว (ง่ายๆ: ผ่านไป 3 วัน)
        const memoryDate = new Date(memory.timestamp);        const now = new Date();
        const daysPassed = (now - memoryDate) / (1000*60*60*24);
        return daysPassed >= 3;
    }
    
    return false;
}

/** 💾 บันทึกความทรงจำลง storage */
function saveMemory(entry) {
    const s = extension_settings[extensionName];
    const config = s.diary.storage;
    
    // เพิ่มเข้าไปบนสุดของอาเรย์
    s.memories.unshift(entry);
    
    // ตัดให้ไม่เกินค่าสูงสุด
    if (s.memories.length > config.maxEntries) {
        s.memories = s.memories.slice(0, config.maxEntries);
    }
    
    // บันทึกลง settings
    SillyTavern.getContext().saveSettingsDebounced();
}

/** 💾 โหลดความทรงจำจาก storage */
function loadMemories(filter = {}) {
    let memories = [...(extension_settings[extensionName].memories || [])];
    
    // Apply filters
    if (filter.character) {
        memories = memories.filter(m => m.character === filter.character);
    }
    if (filter.tag) {
        memories = memories.filter(m => m.meta.tags?.includes(filter.tag));
    }
    if (filter.showSecret === false) {
        memories = memories.filter(m => !m.meta.isSecret || checkUnlockCondition(m));
    }
    if (filter.worldMode) {
        memories = memories.filter(m => m.worldMode === filter.worldMode);
    }
    
    // Sort by timestamp (newest first)
    return memories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/** 🎨 แปลงวันที่เป็นรูปแบบไทย */
function formatThaiDate(isoString) {
    const date = new Date(isoString);    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

/** 🕐 แปลงเวลาเป็นรูปแบบสั้น */
function formatTime(isoString) {
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

/** 😊 ไอคอนตามอารมณ์ */
function getMoodEmoji(mood) {
    const map = {
        'ตื่นเต้น': '😳', 'ดีใจ': '😊', 'อบอุ่น': '🥰', 'รัก': '💖',
        'เสียใจ': '😢', 'โกรธ': '😠', 'สับสน': '😕', 'แปลกหน้า': '😶',
        'เพื่อน': '🤝', 'สนิท': '💕'
    };
    return map[mood] || '🌸';
}

// ═══════════════════════════════════════════════
// HELPERS (เดิมของคุณ - รักษาไว้)
// ═══════════════════════════════════════════════
function getCharacterName() {
    const ctx = SillyTavern.getContext();
    return ctx.name2 || "ตัวละคร";
}

function getUserName() {
    const ctx = SillyTavern.getContext();
    return ctx.name1 || "ผู้เล่น";
}

function getRecentChatSummary(limit = 30) {
    const chat = SillyTavern.getContext().chat || [];
    return chat.slice(-limit).map(m => {
        const role = m.is_user ? getUserName() : getCharacterName();
        return `${role}: ${(m.mes || "").slice(0, 200)}`;
    }).join("\n");
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');}

// ═══════════════════════════════════════════════
// AI CORE (เดิมของคุณ + ปรับปรุง)
// ═══════════════════════════════════════════════
function parseJSONFromAI(text) {
    if (!text || typeof text !== 'string') return null;

    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        try { return JSON.parse(arrayMatch[0]); } catch (_) {}
    }

    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
        try { return JSON.parse(objMatch[0]); } catch (_) {}
    }

    console.warn('[LumiPulse] parseJSONFromAI: ไม่พบ JSON ใน:', text);
    toastr.warning('AI ตอบกลับผิดรูปแบบ ลองกด Generate ใหม่ค่ะ 🌸');
    return null;
}

async function callSTGenerate(prompt) {
    try {
        const ctx = SillyTavern.getContext();

        if (typeof ctx.generateQuietPrompt === 'function') {
            const result = await ctx.generateQuietPrompt(prompt, false, false);
            return parseJSONFromAI(result);
        }

        if (typeof ctx.generateRaw === 'function') {
            const result = await ctx.generateRaw(prompt, true);
            return parseJSONFromAI(result);
        }

        if (typeof window.generateQuietPrompt === 'function') {
            const result = await window.generateQuietPrompt(prompt, false, false);
            return parseJSONFromAI(result);
        }

        if (typeof window.generateRaw === 'function') {
            const result = await window.generateRaw(prompt, true);
            return parseJSONFromAI(result);
        }

        toastr.error('หา generate function ไม่เจอเลยค่ะ');
        return null;
    } catch (err) {
        console.error('[LumiPulse] callSTGenerate error:', err);
        toastr.error('Error: ' + err.message, 'LumiPulse', { timeOut: 8000 });
        return null;
    }
}

async function requestAIGeneration(topic, npcs, includeRandom) {
    const npcList    = npcs.length > 0 ? npcs.join(', ') : 'ตัวละครในเรื่อง';
    const randomNote = includeRandom
        ? 'คุณสามารถสร้างชื่อ NPC เสริมที่ไม่มีในรายชื่อได้'
        : 'ใช้เฉพาะชื่อในรายชื่อที่ให้มาเท่านั้น';

    const prompt = `[System: You are a social media post generator for a roleplay forum. Respond ONLY with a valid JSON array, no explanation, no markdown.]
Topic: "${topic}"
Available characters: [${npcList}]
${randomNote}

Generate exactly 4 social media posts in Thai language that fit the topic and setting.
Each post should feel natural, like real social media. Mix emotional/dramatic/funny tones.

Return ONLY this JSON format:
[
  {"author": "ชื่อตัวละคร", "content": "ข้อความโพสต์", "likes": 12, "time": "5m ago"}
]`;

    return await callSTGenerate(prompt);
}

// 🎭 🆕 Enhanced Diary Generation (รองรับ RPG + Events + Auto-trigger)
async function requestDiaryGeneration(options = {}) {
    const {
        charName = getCharacterName(),
        triggerType = 'manual',
        eventInfo = null,
        linkedChars = [],
        forceAffection = null
    } = options;
    
    const userName = getUserName();
    const chatLog  = getRecentChatSummary(30);
    const ctx = SillyTavern.getContext();
    const currentChar = ctx.characters?.[ctx.characterId] || {};
    
    // 🎭 ดึง Personality จาก Character Card
    const personality = currentChar.data?.personality || 
                       currentChar.description?.substring(0, 200) || 
                       'Friendly and expressive';
    const scenario = currentChar.scenario?.substring(0, 150) || '';
        // 🌍 โหมดโลก
    let worldMode = extension_settings[extensionName].diary.worldMode;
    if (worldMode === 'auto') {
        worldMode = detectWorldMode();
    }
    
    // 🎲 อีเวนต์พิเศษ
    const eventBoost = eventInfo?.promptBoost || '';
    const eventNote = eventInfo 
        ? `\n🎉 Special Event: ${eventInfo.label} - ${eventBoost}` 
        : '';
    
    // 🔗 ตัวละครเชื่อมโยง (RPG)
    const linkedNote = linkedChars.length > 0
        ? `\n👥 Other characters present: ${linkedChars.join(', ')}. You can reference them naturally if relevant.`
        : '';
    
    // 💖 Affection context
    const affectionNote = forceAffection !== null
        ? `\n💕 Current affection level: ${forceAffection}/100. Reflect this in your tone.`
        : '';

    const prompt = `[System: You are roleplaying as ${charName}'s inner voice. Respond ONLY with valid JSON, no explanation, no markdown backticks.]

=== CHARACTER PROFILE (STRICT - STAY IN CHARACTER) ===
Name: ${charName}
Personality: ${personality}
Scenario/Background: ${scenario}
Relationship with ${userName}: ${currentChar.data?.creator_notes?.substring(0, 100) || 'Developing...'}
World Mode: ${worldMode === 'rpg' ? 'RPG/Group - multiple characters interact' : 'Solo - focus on you and the user'}${linkedNote}

=== CONVERSATION LOG (Recent) ===
---
${chatLog}
---${eventNote}${affectionNote}

=== INSTRUCTIONS ===
You are ${charName}. Based on the conversation log above, write your PRIVATE diary entry.

Trigger Context: ${triggerType}
${triggerType === 'turn_count' ? '- This is a regular entry after some time has passed.' : ''}
${triggerType === 'emotion_detected' ? '- An emotional moment just happened. Capture those feelings.' : ''}
${triggerType === 'event_birthday' ? '- Today is your birthday! Write about your wishes and feelings.' : ''}
${triggerType === 'event_anniversary' ? '- A meaningful anniversary. Reflect on your journey together.' : ''}

Rules:
1. Write in Thai language, casual diary style, emotional and intimate
2. Stay 100% in character - use ${charName}'s speech patterns, quirks, vocabulary
3. Reference recent chat events naturally but subtly
4. Keep it short (3-5 sentences), like a real personal diary5. Add 1-2 emojis naturally ONLY if it fits ${charName}'s personality
6. Output ONLY valid JSON in this exact format:
{
  "date": "วันที่สมมติ เช่น 'วันอังคาร แรม 3 ค่ำ'",
  "affection_score": 72,
  "mood": "อารมณ์ในคำเดียว เช่น ตื่นเต้น / สับสน / อบอุ่น",
  "diary": "เนื้อหาไดอารี่ 3-5 ประโยค มุมมองบุคคลที่ 1 ธรรมชาติ ไม่เป็นทางการ"
}
7. NO markdown, NO explanations, NO extra text - ONLY the JSON object`;

    return await callSTGenerate(prompt);
}

async function requestAIGeneration(topic, npcs, includeRandom) {
    const npcList    = npcs.length > 0 ? npcs.join(', ') : 'ตัวละครในเรื่อง';
    const randomNote = includeRandom
        ? 'คุณสามารถสร้างชื่อ NPC เสริมที่ไม่มีในรายชื่อได้'
        : 'ใช้เฉพาะชื่อในรายชื่อที่ให้มาเท่านั้น';

    const prompt = `[System: You are a social media post generator for a roleplay forum. Respond ONLY with a valid JSON array, no explanation, no markdown.]
Topic: "${topic}"
Available characters: [${npcList}]
${randomNote}

Generate exactly 4 social media posts in Thai language that fit the topic and setting.
Each post should feel natural, like real social media. Mix emotional/dramatic/funny tones.

Return ONLY this JSON format:
[
  {"author": "ชื่อตัวละคร", "content": "ข้อความโพสต์", "likes": 12, "time": "5m ago"}
]`;

    return await callSTGenerate(prompt);
}

// ═══════════════════════════════════════════════
// 🆕 AUTO-TRIGGER SYSTEM (ระบบทริกเกอร์อัตโนมัติ)
// ═══════════════════════════════════════════════

function setupAutoTriggerListener() {
    // 🎧 ฟังเหตุการณ์เมื่อมีข้อความใหม่ในแชท
    $(document).on('messageReceived', onNewChatMessage);
    
    // 🔄 ฟังเมื่อเปลี่ยนตัวละคร (รีเซ็ตเคาน์เตอร์)
    $(document).on('activeCharacterChanged', () => {
        extension_settings[extensionName]._internal.messageCounter = 0;
        SillyTavern.getContext().saveSettingsDebounced();
        
        // บันทึกวันที่เริ่มแชทครั้งแรก (สำหรับครบรอบ)
        if (!extension_settings[extensionName]._internal.firstChatDate) {            extension_settings[extensionName]._internal.firstChatDate = new Date().toISOString();
            SillyTavern.getContext().saveSettingsDebounced();
        }
    });
}

async function onNewChatMessage() {
    const s = extension_settings[extensionName];
    const config = s.diary.autoGen;
    
    if (!config.enabled) return;
    
    // เพิ่มเคาน์เตอร์
    s._internal.messageCounter = (s._internal.messageCounter || 0) + 1;
    
    // 🎲 ตรวจสอบทริกเกอร์ตามประเภท
    let shouldGenerate = false;
    let triggerType = null;
    
    if (config.triggerType === 'turn_count') {
        if (s._internal.messageCounter >= config.turnInterval) {
            shouldGenerate = true;
            triggerType = 'turn_count';
            s._internal.messageCounter = 0; // รีเซ็ต
        }
    }
    
    else if (config.triggerType === 'emotion') {
        const lastMsg = (SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '').toLowerCase();
        if (config.emotionKeywords.some(kw => lastMsg.includes(kw.toLowerCase()))) {
            shouldGenerate = true;
            triggerType = 'emotion_detected';
        }
    }
    
    else if (config.triggerType === 'random') {
        if (Math.random() < config.randomChance) {
            shouldGenerate = true;
            triggerType = 'random';
        }
    }
    
    else if (config.triggerType === 'user_tag') {
        const lastMsg = SillyTavern.getContext().chat?.slice(-1)[0]?.mes || '';
        if (lastMsg.includes('#จำ') || lastMsg.includes('#memory') || lastMsg.includes('#diary')) {
            shouldGenerate = true;
            triggerType = 'user_tagged';
        }
    }
        // 🎯 ถ้าถึงเวลาเจน
    if (shouldGenerate) {
        SillyTavern.getContext().saveSettingsDebounced(); // บันทึกรีเซ็ตเคาน์เตอร์
        
        // เช็กอีเวนต์พิเศษ
        const ctx = SillyTavern.getContext();
        const currentChar = ctx.characters?.[ctx.characterId];
        const eventInfo = checkForSpecialEvent(getCharacterName(), currentChar);
        
        if (eventInfo) {
            triggerType = `event_${eventInfo.type}`;
        }
        
        // 🌍 โหมดโลก
        let worldMode = s.diary.worldMode;
        if (worldMode === 'auto') {
            worldMode = detectWorldMode();
        }
        
        // 🔗 ตัวละครเชื่อมโยง (RPG)
        const linkedChars = worldMode === 'rpg' ? getChatNPCs(3) : [];
        
        // 🤖 เจนไดอารี่
        const result = await requestDiaryGeneration({
            triggerType,
            eventInfo,
            linkedChars
        });
        
        if (result) {
            // 📦 สร้าง memory entry
            const memoryEntry = {
                id: "mem_" + Date.now(),
                timestamp: new Date().toISOString(),
                trigger: triggerType,
                character: getCharacterName(),
                characterId: ctx.characterId,
                worldMode,
                linkedCharacters: linkedChars,
                content: {
                    ...result,
                    eventType: eventInfo?.type || null
                },
                meta: {
                    isFavorite: false,
                    isHidden: false,
                    isSecret: eventInfo?.isSecret || false,
                    unlockCondition: eventInfo ? { type: s.diary.display.secretUnlockMode, value: eventInfo.isSecret ? 80 : null } : null,
                    tags: extractTags(result.diary),
                    relatedMessages: [], // TODO: implement message linking                    linkedMemoryIds: [] // TODO: implement RPG cross-references
                }
            };
            
            // 💾 บันทึก
            saveMemory(memoryEntry);
            
            // 🔔 แจ้งเตือนแบบนุ่มนวล (ไม่รบกวน)
            if (!memoryEntry.meta.isSecret || s.diary.display.showSecret) {
                showSubtleNotification(`🌸 ${memoryEntry.character} มีความทรงจำใหม่: "${result.mood}"`);
            }
        }
    }
}

/** 🔔 แสดงแจ้งเตือนแบบไม่รบกวน (ใช้ Toastr ที่มีใน ST) */
function showSubtleNotification(message) {
    if (typeof toastr !== 'undefined') {
        toastr.info(message, '🌸 LumiPulse', { 
            timeOut: 4000, 
            positionClass: 'toast-top-right',
            opacity: 0.9
        });
    }
}

// ═══════════════════════════════════════════════
// STYLES (เดิมของคุณ + เพิ่มคลาสใหม่)
// ═══════════════════════════════════════════════
function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400&display=swap');

        @keyframes lumiPop {
            0%   { opacity: 0; transform: scale(0.8) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lumiFloat {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-10px); }
        }
        @keyframes heartRise {
            0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
            100% { opacity: 0; transform: translate(-50%, -100px) scale(2) rotate(15deg); }
        }
        @keyframes spin {
            0%   { transform: rotate(0deg); }            100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .lumi-vector-heart {
            position: fixed; z-index: 2147483647; pointer-events: none;
            width: 30px; height: 30px;
            animation: heartRise 0.8s ease-out forwards;
            filter: drop-shadow(0 0 5px #FFB6C1);
        }

        #lumi-main-fab {
            position: fixed !important; z-index: 2147483647 !important;
            width: 50px; height: 50px; cursor: grab;
            touch-action: none; user-select: none;
            background: url('${btnUrl}') no-repeat center;
            background-size: contain;
            filter: drop-shadow(0 5px 15px rgba(255,182,193,0.5));
            will-change: transform;
            transform: translateZ(0);
        }
        #lumi-main-fab:active { cursor: grabbing; }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }

        .lumi-menu-container {
            position: fixed; z-index: 2147483646; display: none;
            background: rgba(255,255,255,0.98); backdrop-filter: blur(25px);
            border-radius: 45px; padding: 30px;
            border: 2px solid rgba(255,182,193,0.4);
            box-shadow: 0 25px 60px rgba(255,182,193,0.3);
            font-family: 'Mitr', sans-serif; font-weight: 300;
        }
        .lumi-menu-grid { display: flex; gap: 25px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: transform 0.3s; }
        .lumi-menu-item:hover { transform: translateY(-8px); }
        .lumi-menu-icon { width: 55px; height: 55px; object-fit: contain; }
        .lumi-menu-text { font-size: 13px; color: #ff85a2; letter-spacing: 0.5px; }
        .lumi-branding  { margin-top: 25px; font-size: 11px; color: #ffb6c1; text-transform: uppercase; letter-spacing: 4px; text-align: center; }

        .lumi-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
            background: rgba(0,0,0,0.1); backdrop-filter: blur(15px);
            z-index: 2147483648; display: none;
            align-items: center; justify-content: center;
        }
        .lumi-modal-box {
            width: 94%; max-width: 460px; height: 82vh;            background: #FFFFFF; border-radius: 45px;
            border: 2px solid #FFD1DC;
            box-shadow: 0 30px 70px rgba(255,182,193,0.15);
            display: flex; flex-direction: column; overflow: hidden;
            font-family: 'Mitr', sans-serif; font-weight: 300;
            animation: lumiPop 0.4s forwards;
        }
        .lumi-modal-header {
            padding: 25px; text-align: center; color: #ff85a2;
            border-bottom: 1.5px solid #FFF0F3; position: relative; font-size: 18px;
        }
        .lumi-modal-close {
            position: absolute; right: 20px; top: 25px;
            width: 35px; height: 35px; background: #FFF0F3; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #ff85a2;
        }
        .lumi-modal-opt {
            position: absolute; left: 20px; top: 25px;
            width: 35px; height: 35px; color: #ffb6c1;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: 0.3s;
        }
        .lumi-modal-opt:hover { color: #ff85a2; transform: rotate(45deg); }
        .lumi-modal-body { flex: 1; padding: 20px; overflow-y: auto; background: #FFFFFF; }

        .lumi-setup {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            height: 100%; gap: 20px; text-align: center;
        }
        .lumi-input {
            width: 100%; background: #FFF9FA; border: 1.5px solid #FFD1DC;
            border-radius: 20px; padding: 15px; color: #ff85a2;
            font-family: 'Mitr'; text-align: center; outline: none;
            font-size: 14px; box-sizing: border-box;
        }
        .lumi-btn-gen {
            background: linear-gradient(135deg, #FFB6C1, #FF85A2);
            color: white; border: none; padding: 12px 45px;
            border-radius: 25px; font-family: 'Mitr';
            cursor: pointer; transition: opacity 0.3s;
            box-shadow: 0 5px 15px rgba(255,133,162,0.2); font-size: 14px;
        }
        .lumi-btn-gen:hover { opacity: 0.85; }

        .forum-post {
            background: white; border-radius: 30px; padding: 18px; margin-bottom: 18px;
            border: 1px solid #FDF2F4; box-shadow: 0 5px 15px rgba(0,0,0,0.02);
            animation: lumiPop 0.5s backwards;        }
        .post-header  { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
        .post-avatar  {
            width: 45px; height: 45px; border-radius: 50%;
            border: 2px solid #FFD1DC; background: #FFF0F3;
            display: flex; align-items: center; justify-content: center;
            color: #ff85a2; font-size: 18px; flex-shrink: 0;
        }
        .post-author  { font-weight: 400; color: #444; font-size: 15px; }
        .post-content { font-size: 14px; color: #666; line-height: 1.6; }
        .post-footer  { margin-top: 12px; color: #ffb6c1; font-size: 13px; display: flex; gap: 15px; }

        .lumi-loader-wrap { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 100px; }
        .lumi-loader {
            width: 45px; height: 45px; border: 3px solid #FFF0F3;
            border-top-color: #ff85a2; border-radius: 50%;
            animation: spin 1s infinite linear;
        }

        .lumi-coming-soon {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; height: 100%; gap: 16px;
            color: #ffb6c1; font-size: 15px; text-align: center;
        }
        .lumi-coming-soon img { width: 80px; opacity: 0.7; }

        /* ── Diary (เดิม) ── */
        .lumi-diary-wrap { padding-bottom: 10px; }
        .lumi-diary-header { display: flex; gap: 14px; align-items: center; margin-bottom: 20px; }
        .lumi-diary-avatar {
            width: 52px; height: 52px; border-radius: 50%;
            background: linear-gradient(135deg, #FFD1DC, #FFB6C1);
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 22px; flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(255,182,193,0.4);
        }
        .lumi-diary-charname { font-size: 17px; color: #444; font-weight: 400; }
        .lumi-diary-date { font-size: 11px; color: #ffb6c1; margin-top: 3px; }

        .lumi-affection-wrap {
            background: #FFF9FA; border-radius: 20px;
            padding: 14px 16px; margin-bottom: 20px; border: 1px solid #FFE8EE;
        }
        .lumi-affection-label {
            display: flex; justify-content: space-between;
            font-size: 12px; color: #aaa; margin-bottom: 8px;
        }
        .lumi-affection-track { height: 8px; background: #FFE8EE; border-radius: 10px; overflow: hidden; }
        .lumi-affection-fill  { height: 100%; border-radius: 10px; transition: width 1s ease; width: 0%; }
        .lumi-affection-score { text-align: right; font-size: 11px; color: #ffb6c1; margin-top: 5px; }
        .lumi-diary-paper {
            background: #FFFBFC; border: 1px solid #FFE8EE;
            border-radius: 25px; padding: 22px 20px;
            position: relative; overflow: hidden; min-height: 150px;
        }
        .lumi-diary-lines {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background-image: repeating-linear-gradient(
                transparent, transparent 27px, #FFF0F3 27px, #FFF0F3 28px
            );
            opacity: 0.5; border-radius: 25px;
        }
        .lumi-diary-text {
            position: relative; z-index: 1;
            font-size: 14px; color: #555; line-height: 1.85; white-space: pre-wrap;
        }

        /* ── 🆕 Timeline UI (ใหม่) ── */
        .lumi-timeline-container { padding-bottom: 10px; }
        .lumi-timeline-date {
            font-size: 13px; color: #ffb6c1; font-weight: 400;
            padding: 12px 0 8px; border-bottom: 1px dashed #FFE8EE;
            margin: 16px 0 12px;
        }
        
        .lumi-memory-card {
            background: #FFFBFC; border: 1px solid #FFE8EE;
            border-radius: 20px; padding: 16px; margin-bottom: 12px;
            position: relative; overflow: hidden;
            transition: box-shadow 0.2s, transform 0.2s;
        }
        .lumi-memory-card:hover {
            box-shadow: 0 4px 12px rgba(255,182,193,0.15);
            transform: translateY(-2px);
        }
        .lumi-memory-card.locked {
            opacity: 0.7; background: #FFF5F7;
        }
        
        .lumi-memory-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 8px; flex-wrap: wrap; gap: 6px;
        }
        .lumi-memory-char {
            font-weight: 400; color: #444; font-size: 15px;
        }
        .lumi-memory-time {
            font-size: 11px; color: #ccc;
        }        .lumi-badge-rpg, .lumi-badge-event {
            font-size: 10px; padding: 2px 8px; border-radius: 10px;
            background: #FFF0F3; color: #ff85a2;
        }
        
        .lumi-memory-mood {
            display: flex; align-items: center; gap: 8px;
            font-size: 12px; color: #666; margin-bottom: 10px;
        }
        .lumi-affection-mini {
            font-size: 11px; font-weight: 400;
        }
        
        .lumi-memory-content {
            font-size: 14px; color: #555; line-height: 1.7;
            margin-bottom: 12px; white-space: pre-wrap;
        }
        .lumi-memory-content.locked {
            color: #bbb; font-style: italic;
        }
        
        .lumi-memory-tags {
            display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;
        }
        .lumi-tag {
            font-size: 10px; padding: 3px 10px; border-radius: 12px;
            background: #FFF0F3; color: #ff85a2;
        }
        
        .lumi-memory-actions {
            display: flex; gap: 8px; justify-content: flex-end;
            border-top: 1px solid #FFE8EE; padding-top: 10px;
        }
        .lumi-btn-icon {
            width: 32px; height: 32px; border-radius: 50%;
            border: none; background: white;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: transform 0.2s, background 0.2s;
            font-size: 16px; color: #ffb6c1;
        }
        .lumi-btn-icon:hover { background: #FFF0F3; transform: scale(1.1); }
        .lumi-btn-icon.active { background: #FFF0F3; color: #FFD700; }
        .lumi-btn-icon.danger:hover { background: #FFE0E0; color: #ff6b6b; }
        
        /* 🔒 Locked overlay */
        .lumi-locked-overlay {
            position: absolute; inset: 0;
            background: rgba(255,255,255,0.9);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;            gap: 10px; z-index: 1;
        }
        .lumi-locked-icon { width: 40px; height: 40px; opacity: 0.8; }
        .lumi-locked-text {
            font-size: 12px; color: #ffb6c1; text-align: center;
        }
        .lumi-locked-hint {
            font-size: 10px; color: #ccc;
        }
        
        /* ── Settings Panel ── */
        .lumi-settings-section {
            margin-bottom: 20px; padding-bottom: 16px;
            border-bottom: 1px solid #FFF0F3;
        }
        .lumi-settings-section:last-child { border-bottom: none; }
        .lumi-settings-section h4 {
            font-size: 14px; color: #ff85a2; margin-bottom: 12px;
            font-weight: 400;
        }
        .lumi-sub-settings {
            margin-left: 16px; margin-top: 8px;
            display: flex; flex-direction: column; gap: 8px;
            font-size: 12px; color: #666;
        }
        .lumi-sub-settings input[type="number"],
        .lumi-sub-settings input[type="text"],
        .lumi-sub-settings select {
            width: 100%; padding: 8px 12px;
            border: 1px solid #FFD1DC; border-radius: 12px;
            background: #FFF9FA; color: #ff85a2;
            font-family: 'Mitr'; font-size: 12px;
            outline: none;
        }
        .lumi-btn-small {
            padding: 6px 16px; border-radius: 15px;
            border: none; background: #FFF0F3; color: #ff85a2;
            font-family: 'Mitr'; font-size: 11px; cursor: pointer;
            margin-right: 8px; transition: background 0.2s;
        }
        .lumi-btn-small:hover { background: #FFE0E6; }
        .lumi-btn-small.danger { background: #FFE0E0; color: #ff6b6b; }
        .lumi-btn-small.danger:hover { background: #FFCCCC; }
        
        /* Filter bar */
        .lumi-filter-bar {
            display: flex; gap: 8px; padding: 10px;
            background: #FFF9FA; border-radius: 16px;
            margin-bottom: 16px; flex-wrap: wrap;
        }        .lumi-filter-select {
            flex: 1; min-width: 120px;
            padding: 8px 12px; border: 1px solid #FFD1DC;
            border-radius: 12px; background: white;
            color: #ff85a2; font-family: 'Mitr'; font-size: 12px;
        }
        .lumi-filter-search {
            flex: 2; min-width: 150px;
            padding: 8px 12px; border: 1px solid #FFD1DC;
            border-radius: 12px; background: white;
            color: #666; font-family: 'Mitr'; font-size: 12px;
        }
        
        /* Empty state */
        .lumi-empty {
            text-align: center; color: #ffb6c1; padding: 40px 20px;
            font-size: 14px; line-height: 1.6;
        }
        .lumi-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.7; }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            #lumi-main-fab { width: 48px; height: 48px; }
            .lumi-menu-container { width: calc(100vw - 40px); right: 20px !important; }
            .lumi-menu-grid { gap: 15px; }
            .lumi-menu-icon { width: 48px; height: 48px; }
            .lumi-modal-box { width: 96%; height: 85vh; }
            .lumi-memory-card { padding: 14px; }
        }
    `;
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════
// HEART EFFECT (เดิมของคุณ)
// ═══════════════════════════════════════════════
function spawnHeartEffect(e) {
    const heart = document.createElement('div');
    heart.className = 'lumi-vector-heart';
    heart.innerHTML = svgHeart;
    heart.style.left = e.clientX + 'px';
    heart.style.top  = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 800);
}

// ═══════════════════════════════════════════════
// MODAL CONTROL (เดิม + ปรับปรุง)
// ═══════════════════════════════════════════════
function openLumiModal(type) {    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);

    if (type === 'forum') {
        renderForumUI();
    } else if (type === 'diary') {
        renderDiaryUI(); // 🆕 ใช้ Timeline UI ใหม่
    } else if (type === 'phone') {
        $('#lumi-modal-title').text('📱 Phone');
        $('#lumi-modal-body').html(`
            <div class="lumi-coming-soon">
                <img src="${iconPhone}" alt="phone">
                <div>Character's Phone</div>
                <div style="font-size:12px; opacity:0.6;">Coming Soon 🌸</div>
            </div>
        `);
        $('.lumi-modal-opt').hide();
    }
}

// ═══════════════════════════════════════════════
// FORUM UI (เดิมของคุณ - ไม่แก้)
// ═══════════════════════════════════════════════
function renderForumUI() {
    const s    = extension_settings[extensionName];
    const body = $('#lumi-modal-body');
    body.empty();
    $('#lumi-modal-title').text('Social Forum');

    if (!s.isForumInitialized) {
        $('.lumi-modal-opt').hide();
        body.html(`
            <div class="lumi-setup">
                <img src="${iconForum}" style="width:70px;" alt="forum">
                <div style="color:#ff85a2; font-size:16px;">ระบุหัวข้อที่ต้องการให้ AI สแกน</div>
                <input id="topic-input" class="lumi-input"
                    placeholder="เช่น มหาวิทยาลัยเวทมนตร์, คลับลับ..."
                    value="${escapeHtml(s.forumTopic)}" />
                <label class="checkbox_label" style="font-size:13px; color:#ffb6c1;">
                    <input id="npc-opt" type="checkbox" ${s.includeRandomNPCs ? 'checked' : ''} />
                    <span>อนุญาตให้ AI สร้าง NPC เสริม</span>
                </label>
                <button id="btn-gen" class="lumi-btn-gen">เริ่มสร้างฟอรั่ม ✨</button>
            </div>
        `);
        $('#btn-gen').on('click', () => {
            const t = $('#topic-input').val().trim();
            if (!t) { toastr.warning("กรุณาใส่หัวข้อก่อนนะคะ 🌸"); return; }
            s.forumTopic        = t;
            s.includeRandomNPCs = $('#npc-opt').prop('checked');            s.isForumInitialized = true;
            s.forumData          = [];
            SillyTavern.getContext().saveSettingsDebounced();
            renderForumUI();
        });

    } else {
        $('.lumi-modal-opt').show();

        if (!s.forumData || s.forumData.length === 0) {
            body.html(`
                <div class="lumi-loader-wrap">
                    <div class="lumi-loader"></div>
                    <div style="color:#ff85a2;">AI กำลังประมวลผลฟอรั่ม...</div>
                    <div style="font-size:11px; color:#ffb6c1; margin-top:5px;">อาจใช้เวลาสักครู่ค่ะ 🌸</div>
                </div>
            `);
            const npcs = getChatNPCs();
            requestAIGeneration(s.forumTopic, npcs, s.includeRandomNPCs).then(posts => {
                if (!posts || posts.length === 0) {
                    s.isForumInitialized = false;
                    SillyTavern.getContext().saveSettingsDebounced();
                    renderForumUI();
                    return;
                }
                s.forumData = posts;
                SillyTavern.getContext().saveSettingsDebounced();
                renderForumUI();
            });

        } else {
            body.append(`
                <div style="font-size:11px; color:#ffb6c1; text-align:center; margin-bottom:15px; letter-spacing:2px;">
                    TOPIC: ${escapeHtml(s.forumTopic.toUpperCase())}
                </div>
            `);
            s.forumData.forEach((p, i) => {
                const delay   = i * 0.08;
                const initial = (p.author || '?').charAt(0).toUpperCase();
                body.append(`
                    <div class="forum-post" style="animation-delay:${delay}s">
                        <div class="post-header">
                            <div class="post-avatar">${initial}</div>
                            <div style="display:flex;flex-direction:column;">
                                <span class="post-author">${escapeHtml(p.author || 'Unknown')}</span>
                                <span style="font-size:10px;color:#CCC;">${escapeHtml(p.time || 'just now')}</span>
                            </div>
                        </div>
                        <div class="post-content">${escapeHtml(p.content || '')}</div>
                        <div class="post-footer">❤️ ${p.likes || 0} Likes</div>                    </div>
                `);
            });
            body.append(`
                <div style="text-align:center; margin-top:10px; padding-bottom:20px;">
                    <button id="btn-refresh-forum" class="lumi-btn-gen" style="padding:8px 30px; font-size:12px;">
                        🔄 Refresh Posts
                    </button>
                </div>
            `);
            $('#btn-refresh-forum').on('click', () => {
                extension_settings[extensionName].forumData = [];
                SillyTavern.getContext().saveSettingsDebounced();
                renderForumUI();
            });
        }
    }
}

// ═══════════════════════════════════════════════
// 🆕 DIARY UI - Timeline Version (ใหม่ทั้งหมด)
// ═══════════════════════════════════════════════

const AFFECTION_LEVELS = [
    { min: 0,  max: 20,  label: "แปลกหน้า",   color: "#CCC",    emoji: "😶" },
    { min: 20, max: 40,  label: "รู้จักกัน",    color: "#FFD1DC", emoji: "🙂" },
    { min: 40, max: 60,  label: "เพื่อน",       color: "#FFB6C1", emoji: "😊" },
    { min: 60, max: 80,  label: "สนิทกัน",      color: "#FF85A2", emoji: "🥰" },
    { min: 80, max: 101, label: "ใกล้ชิดมาก",   color: "#FF4D79", emoji: "💖" },
];

function getAffectionLevel(score) {
    return AFFECTION_LEVELS.find(l => score >= l.min && score < l.max) || AFFECTION_LEVELS[0];
}

/** 🆕 Render Timeline UI สำหรับไดอารี่ */
function renderDiaryUI() {
    const s = extension_settings[extensionName];
    const body = $('#lumi-modal-body');
    const charName = getCharacterName();
    
    $('#lumi-modal-title').text(`📖 ${charName}'s Memories`);
    $('.lumi-modal-opt').show().attr('title', 'ตั้งค่าไดอารี่');
    
    // 🎛️ Filter bar
    const worldMode = s.diary.worldMode === 'auto' ? detectWorldMode() : s.diary.worldMode;
    const characters = [charName, ...getChatNPCs(5)].filter((v, i, a) => a.indexOf(v) === i);
    
    body.html(`
        <div class="lumi-filter-bar">            <select class="lumi-filter-select" id="lumi-filter-char">
                <option value="">👤 ทุกตัวละคร</option>
                ${characters.map(c => `<option value="${escapeHtml(c)}" ${c===charName?'selected':''}>${escapeHtml(c)}</option>`).join('')}
            </select>
            <select class="lumi-filter-select" id="lumi-filter-mode">
                <option value="">🌍 ทุกโหมด</option>
                <option value="solo" ${worldMode==='solo'?'selected':''}>👤 Solo</option>
                <option value="rpg" ${worldMode==='rpg'?'selected':''}>🌐 RPG</option>
            </select>
            <input type="text" class="lumi-filter-search" id="lumi-filter-search" placeholder="🔍 ค้นหา...">
        </div>
        <div id="lumi-timeline-panel" class="lumi-timeline-container"></div>
    `);
    
    // 🔄 โหลดความทรงจำ
    loadAndRenderTimeline();
    
    // 🎧 Event listeners สำหรับฟิลเตอร์
    $('#lumi-filter-char, #lumi-filter-mode, #lumi-filter-search').on('change keyup', debounce(loadAndRenderTimeline, 300));
    
    // ⚙️ ปุ่มตั้งค่า (ใน modal)
    $('.lumi-modal-opt').off('click').on('click', () => {
        renderDiarySettingsInModal();
    });
}

/** 🆕 โหลดและเรนเดอร์ Timeline */
function loadAndRenderTimeline() {
    const filter = {
        character: $('#lumi-filter-char').val() || null,
        worldMode: $('#lumi-filter-mode').val() || null,
        showSecret: extension_settings[extensionName].diary.display.showSecret
    };
    
    const searchTerm = $('#lumi-filter-search').val()?.toLowerCase() || '';
    
    let memories = loadMemories(filter);
    
    // ค้นหา
    if (searchTerm) {
        memories = memories.filter(m => 
            m.content.diary?.toLowerCase().includes(searchTerm) ||
            m.content.mood?.toLowerCase().includes(searchTerm) ||
            m.meta.tags?.some(t => t.toLowerCase().includes(searchTerm))
        );
    }
    
    const panel = $('#lumi-timeline-panel');
    
    if (memories.length === 0) {        panel.html(`
            <div class="lumi-empty">
                <div class="lumi-empty-icon">📭</div>
                <div>ยังไม่มีบันทึกความทรงจำ</div>
                <div style="font-size:12px; color:#ccc; margin-top:8px;">
                    ${extension_settings[extensionName].diary.autoGen.enabled 
                        ? 'ระบบจะสร้างอัตโนมัติเมื่อครบเงื่อนไขที่ตั้งไว้ 🌸' 
                        : 'กดปุ่ม "✨ Generate Diary" เพื่อสร้างบันทึกแรก'}
                </div>
            </div>
        `);
        return;
    }
    
    // 📅 จัดกลุ่มตามวันที่
    const grouped = {};
    memories.forEach(m => {
        const dateKey = m.timestamp.split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(m);
    });
    
    // 🎨 เรนเดอร์
    let html = '';
    for (const [dateKey, entries] of Object.entries(grouped)) {
        html += `<div class="lumi-timeline-date">📅 ${formatThaiDate(dateKey)}</div>`;
        entries.forEach(entry => {
            html += renderMemoryCard(entry);
        });
    }
    
    panel.html(html);
    bindMemoryCardEvents();
}

/** 🆕 เรนเดอร์การ์ดความทรงจำ */
function renderMemoryCard(entry) {
    const isLocked = entry.meta.isSecret && !checkUnlockCondition(entry);
    const level = getAffectionLevel(entry.content.affection_score);
    const moodEmoji = getMoodEmoji(entry.content.mood);
    
    // Event badge
    let eventBadge = '';
    if (entry.content.eventType) {
        const eventLabels = {
            'birthday': '🎂 วันเกิด',
            'anniversary_30d': '💕 ครบ 30 วัน',
            'anniversary_100d': '💕 ครบ 100 วัน', 
            'anniversary_365d': '💕 ครบ 1 ปี',
            'season_1': '🌸 ฤดูใบไม้ผลิ',            'season_2': '☀️ ฤดูร้อน',
            'season_3': '🍁 ฤดูใบไม้ร่วง',
            'season_4': '❄️ ฤดูหนาว'
        };
        eventBadge = `<span class="lumi-badge-event">${eventLabels[entry.content.eventType] || '🎉 อีเวนต์'}</span>`;
    }
    
    // RPG badge
    const rpgBadge = entry.worldMode === 'rpg' ? '<span class="lumi-badge-rpg">🌍 RPG</span>' : '';
    
    // Linked characters
    const linkedText = entry.linkedCharacters?.length > 0 
        ? `<div style="font-size:10px; color:#ccc; margin-top:4px;">👥 ${entry.linkedCharacters.join(', ')}</div>` 
        : '';
    
    return `
        <div class="lumi-memory-card ${isLocked ? 'locked' : ''}" data-id="${entry.id}">
            ${isLocked ? `
                <div class="lumi-locked-overlay">
                    <div class="lumi-locked-icon">${svgLock}</div>
                    <div class="lumi-locked-text">🔒 ความทรงจำนี้ยังมองไม่เห็น</div>
                    <div class="lumi-locked-hint">
                        ${entry.meta.unlockCondition?.type === 'affection' 
                            ? `ปลดล็อกเมื่อความสัมพันธ์ ≥ ${entry.meta.unlockCondition.value}` 
                            : 'จะเปิดเผยเมื่อถึงเวลา...'}
                    </div>
                </div>
            ` : ''}
            
            <div class="lumi-memory-header">
                <span class="lumi-memory-char">${escapeHtml(entry.character)}</span>
                <span class="lumi-memory-time">${formatTime(entry.timestamp)}</span>
                ${rpgBadge} ${eventBadge}
            </div>
            
            <div class="lumi-memory-mood">
                <span>${moodEmoji} ${escapeHtml(entry.content.mood)}</span>
                <span class="lumi-affection-mini" style="color:${level.color}">❤️ ${entry.content.affection_score}</span>
            </div>
            
            <div class="lumi-memory-content ${isLocked ? 'locked' : ''}">
                ${isLocked ? '...' : escapeHtml(entry.content.diary)}
            </div>
            
            ${linkedText}
            
            ${!isLocked ? `
                <div class="lumi-memory-tags">
                    ${(entry.meta.tags || []).map(t => `<span class="lumi-tag">${t}</span>`).join('')}
                </div>                <div class="lumi-memory-actions">
                    <button class="lumi-btn-icon ${entry.meta.isFavorite ? 'active' : ''}" data-action="favorite" title="เก็บไว้ดู">
                        ${entry.meta.isFavorite ? svgStar : svgStarEmpty}
                    </button>
                    <button class="lumi-btn-icon" data-action="reference" title="อ้างอิงแชท">🔍</button>
                    <button class="lumi-btn-icon danger" data-action="delete" title="ลบ">🗑️</button>
                </div>
            ` : ''}
        </div>
    `;
}

/** 🆕 ผูกอีเวนต์สำหรับการ์ดความทรงจำ */
function bindMemoryCardEvents() {
    // ⭐ Favorite toggle
    $('.lumi-btn-icon[data-action="favorite"]').off('click').on('click', function(e) {
        e.stopPropagation();
        const card = $(this).closest('.lumi-memory-card');
        const id = card.data('id');
        const memories = extension_settings[extensionName].memories;
        const entry = memories.find(m => m.id === id);
        
        if (entry) {
            entry.meta.isFavorite = !entry.meta.isFavorite;
            SillyTavern.getContext().saveSettingsDebounced();
            $(this).toggleClass('active').html(entry.meta.isFavorite ? svgStar : svgStarEmpty);
            showToast(entry.meta.isFavorite ? '⭐ เก็บความทรงจำนี้แล้ว' : '🗑️ เอาออกแล้ว', 'info');
        }
    });
    
    // 🔍 Reference chat (TODO: implement jump to message)
    $('.lumi-btn-icon[data-action="reference"]').off('click').on('click', function(e) {
        e.stopPropagation();
        showToast('🔍 ฟีเจอร์อ้างอิงแชทกำลังพัฒนาอยู่ค่ะ 🌸', 'info');
    });
    
    // 🗑️ Delete
    $('.lumi-btn-icon[data-action="delete"]').off('click').on('click', function(e) {
        e.stopPropagation();
        const card = $(this).closest('.lumi-memory-card');
        const id = card.data('id');
        
        if (confirm('ลบความทรงจำนี้ใช่ไหมคะ? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            const s = extension_settings[extensionName];
            s.memories = s.memories.filter(m => m.id !== id);
            SillyTavern.getContext().saveSettingsDebounced();
            card.fadeOut(200, () => {
                card.remove();
                if ($('.lumi-memory-card').length === 0) {
                    loadAndRenderTimeline(); // รีเรนเดอร์ถ้าว่าง                }
            });
            showToast('🗑️ ลบความทรงจำแล้ว', 'success');
        }
    });
}

/** 🆕 Debounce helper */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/** 🆕 Render Settings ใน Modal */
function renderDiarySettingsInModal() {
    const s = extension_settings[extensionName].diary;
    
    $('#lumi-modal-title').text('⚙️ Diary Settings');
    $('#lumi-modal-body').html(`
        <div class="lumi-modal-body" style="padding: 16px;">
            <div class="lumi-settings-section">
                <h4>🌍 โหมดโลก</h4>
                <select id="lumi-world-mode">
                    <option value="auto" ${s.worldMode==='auto'?'selected':''}>🤖 อัตโนมัติ (ตรวจจับจากแชท)</option>
                    <option value="solo" ${s.worldMode==='solo'?'selected':''}>👤 โหมดเดี่ยว</option>
                    <option value="rpg" ${s.worldMode==='rpg'?'selected':''}>🌐 โหมด RPG/กลุ่ม</option>
                </select>
            </div>
            
            <div class="lumi-settings-section">
                <h4>⚙️ การสร้างอัตโนมัติ</h4>
                <label class="checkbox_label">
                    <input type="checkbox" id="lumi-autogen-enable" ${s.autoGen.enabled?'checked':''}/>
                    <span>เปิดการสร้างไดอารี่อัตโนมัติ</span>
                </label>
                
                <div class="lumi-sub-settings">
                    <label>ทริกเกอร์:</label>
                    <select id="lumi-trigger-type">
                        <option value="turn_count" ${s.autoGen.triggerType==='turn_count'?'selected':''}>🔢 ทุก X ข้อความ</option>
                        <option value="emotion" ${s.autoGen.triggerType==='emotion'?'selected':''}>💬 พบคำอารมณ์</option>
                        <option value="random" ${s.autoGen.triggerType==='random'?'selected':''}>🎲 สุ่ม</option>
                        <option value="user_tag" ${s.autoGen.triggerType==='user_tag'?'selected':''}>🏷️ เมื่อผู้ใช้แท็ก #จำ</option>                    </select>
                    
                    <div id="lumi-turn-count-wrap" style="display:${s.autoGen.triggerType==='turn_count'?'block':'none'}">
                        <label>เจนทุก <input type="number" id="lumi-turn-interval" value="${s.autoGen.turnInterval}" min="5" max="100"/> ข้อความ</label>
                    </div>
                    
                    <div id="lumi-emotion-wrap" style="display:${s.autoGen.triggerType==='emotion'?'block':'none'}">
                        <label>คำอารมณ์ (คั่นด้วยจุลภาค):</label>
                        <input type="text" id="lumi-emotion-kw" value="${s.autoGen.emotionKeywords.join(',')}" placeholder="รัก,โกรธ,เสียใจ"/>
                    </div>
                    
                    <div id="lumi-random-wrap" style="display:${s.autoGen.triggerType==='random'?'block':'none'}">
                        <label>โอกาสสุ่ม: <input type="number" id="lumi-random-chance" value="${Math.round(s.autoGen.randomChance*100)}" min="1" max="50"/>% ต่อข้อความ</label>
                    </div>
                </div>
            </div>
            
            <div class="lumi-settings-section">
                <h4>🔒 ความทรงจำลับ</h4>
                <label class="checkbox_label">
                    <input type="checkbox" id="lumi-show-secret" ${s.display.showSecret?'checked':''}/>
                    <span>แสดงความทรงจำที่ยังไม่ได้ปลดล็อก (เป็นภาพซ้อน)</span>
                </label>
                <label style="margin-top:8px; display:block;">วิธีปลดล็อก:</label>
                <select id="lumi-unlock-mode">
                    <option value="affection" ${s.display.secretUnlockMode==='affection'?'selected':''}>❤️ ตามระดับความสัมพันธ์ (≥80)</option>
                    <option value="event" ${s.display.secretUnlockMode==='event'?'selected':''}>🎉 ผ่านไป 3 วันหลังเกิดเหตุการณ์</option>
                    <option value="manual" ${s.display.secretUnlockMode==='manual'?'selected':''}>✋ ปลดล็อกเองเท่านั้น</option>
                </select>
            </div>
            
            <div class="lumi-settings-section">
                <h4>🗂️ การจัดการ</h4>
                <label>เก็บสูงสุด <input type="number" id="lumi-max-entries" value="${s.storage.maxEntries}" min="10" max="200"/> บันทึก</label>
                <div style="margin-top:12px;">
                    <button id="lumi-export-memories" class="lumi-btn-small">📤 Export JSON</button>
                    <button id="lumi-clear-memories" class="lumi-btn-small danger">🗑️ ล้างทั้งหมด</button>
                </div>
            </div>
            
            <div style="text-align:center; margin-top:20px;">
                <button id="lumi-save-settings" class="lumi-btn-gen" style="padding:10px 40px;">💾 บันทึกการตั้งค่า</button>
            </div>
        </div>
    `);
    
    // 🎧 Toggle sub-settings visibility
    $('#lumi-trigger-type').on('change', function() {
        const val = $(this).val();
        $('#lumi-turn-count-wrap').toggle(val === 'turn_count');        $('#lumi-emotion-wrap').toggle(val === 'emotion');
        $('#lumi-random-wrap').toggle(val === 'random');
    });
    
    // 💾 Save settings
    $('#lumi-save-settings').on('click', () => {
        const s = extension_settings[extensionName].diary;
        
        // World mode
        s.worldMode = $('#lumi-world-mode').val();
        
        // Auto-gen
        s.autoGen.enabled = $('#lumi-autogen-enable').prop('checked');
        s.autoGen.triggerType = $('#lumi-trigger-type').val();
        s.autoGen.turnInterval = parseInt($('#lumi-turn-interval').val()) || 20;
        s.autoGen.emotionKeywords = $('#lumi-emotion-kw').val().split(',').map(k => k.trim()).filter(k => k);
        s.autoGen.randomChance = (parseInt($('#lumi-random-chance').val()) || 10) / 100;
        
        // Display
        s.display.showSecret = $('#lumi-show-secret').prop('checked');
        s.display.secretUnlockMode = $('#lumi-unlock-mode').val();
        
        // Storage
        s.storage.maxEntries = parseInt($('#lumi-max-entries').val()) || 50;
        
        // Save
        SillyTavern.getContext().saveSettingsDebounced();
        
        // Reset counter if interval changed
        extension_settings[extensionName]._internal.messageCounter = 0;
        
        showToast('✅ บันทึกการตั้งค่าแล้ว', 'success');
        
        // กลับไปหน้า Timeline
        setTimeout(() => renderDiaryUI(), 500);
    });
    
    // 📤 Export
    $('#lumi-export-memories').on('click', () => {
        const data = JSON.stringify(extension_settings[extensionName].memories, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumipulse-memories-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📤 Export เสร็จแล้ว', 'success');
    });
        // 🗑️ Clear all
    $('#lumi-clear-memories').on('click', () => {
        if (confirm('ล้างความทรงจำทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
            extension_settings[extensionName].memories = [];
            SillyTavern.getContext().saveSettingsDebounced();
            showToast('🗑️ ล้างความทรงจำทั้งหมดแล้ว', 'success');
            setTimeout(() => renderDiaryUI(), 500);
        }
    });
}

// ═══════════════════════════════════════════════
// DIARY UI (เดิม - สำหรับ backward compat)
// ═══════════════════════════════════════════════
function renderDiaryUILegacy() {
    // 🆕 เปลี่ยนไปใช้ Timeline UI แทน
    renderDiaryUI();
}

function startDiaryGeneration() {
    const s    = extension_settings[extensionName];
    const body = $('#lumi-modal-body');
    const ctx = SillyTavern.getContext();
    const currentChar = ctx.characters?.[ctx.characterId];
    
    // 🎲 เช็กอีเวนต์
    const eventInfo = checkForSpecialEvent(getCharacterName(), currentChar);
    
    // 🌍 โหมดโลก
    let worldMode = s.diary.worldMode;
    if (worldMode === 'auto') {
        worldMode = detectWorldMode();
    }
    
    // 🔗 Linked chars
    const linkedChars = worldMode === 'rpg' ? getChatNPCs(3) : [];

    body.html(`
        <div class="lumi-loader-wrap">
            <div class="lumi-loader"></div>
            <div style="color:#ff85a2;">กำลังอ่านความในใจ...</div>
            <div style="font-size:11px; color:#ffb6c1; margin-top:5px;">🌸 รอสักครู่นะคะ</div>
        </div>
    `);

    requestDiaryGeneration({
        triggerType: 'manual',
        eventInfo,
        linkedChars
    }).then(data => {        if (!data) {
            renderDiaryUI();
            return;
        }
        
        // 💾 สร้าง memory entry
        const memoryEntry = {
            id: "mem_" + Date.now(),
            timestamp: new Date().toISOString(),
            trigger: 'manual',
            character: getCharacterName(),
            characterId: ctx.characterId,
            worldMode,
            linkedCharacters: linkedChars,
            content: {
                ...data,
                eventType: eventInfo?.type || null
            },
            meta: {
                isFavorite: false,
                isHidden: false,
                isSecret: eventInfo?.isSecret || false,
                unlockCondition: eventInfo ? { type: s.diary.display.secretUnlockMode, value: 80 } : null,
                tags: extractTags(data.diary),
                relatedMessages: [],
                linkedMemoryIds: []
            }
        };
        
        saveMemory(memoryEntry);
        renderDiaryUI(); // 🆕 ใช้ Timeline
        showToast('✨ สร้างบันทึกใหม่แล้ว', 'success');
    });
}

// ═══════════════════════════════════════════════
// FAB BUTTON (เดิมของคุณ + ปรับปรุงเล็กน้อย)
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();

    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    fab.style.top   = '45%';
    fab.style.right = '20px';
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'Open LumiPulse Menu');
    fab.setAttribute('tabindex', '0');
    document.body.appendChild(fab);
    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary">
                <img src="${iconDiary}" class="lumi-menu-icon" alt="diary">
                <span class="lumi-menu-text">Memories</span>
            </div>
            <div class="lumi-menu-item" id="lumi-phone">
                <img src="${iconPhone}" class="lumi-menu-icon" alt="phone">
                <span class="lumi-menu-text">Phone</span>
            </div>
            <div class="lumi-menu-item" id="lumi-forum">
                <img src="${iconForum}" class="lumi-menu-icon" alt="forum">
                <span class="lumi-menu-text">Forum</span>
            </div>
        </div>
        <div class="lumi-branding">Lumipulse</div>
    `;
    document.body.appendChild(menu);

    function updateMenuPos() {
        const r = fab.getBoundingClientRect();
        const m = $(menu);
        let l = r.left - (m.outerWidth() / 2) + (r.width / 2);
        let t = r.top - m.outerHeight() - 15;
        if (l < 10) l = 10;
        if (l + m.outerWidth() > window.innerWidth - 10) l = window.innerWidth - m.outerWidth() - 10;
        if (t < 10) t = r.bottom + 15;
        m.css({ left: l + 'px', top: t + 'px' });
    }

    // 🎯 Drag/Tap logic (เหมือนเดิม + เพิ่ม threshold)
    const DRAG_THRESHOLD = 8;
    let isDragging = false, isTouchDrag = false;
    let dragStartX = 0, dragStartY = 0;
    let mouseOffset = { x: 0, y: 0 }, touchOffset = { x: 0, y: 0 };
    let tapTimer = null;

    // Mouse
    fab.addEventListener('mousedown', (e) => {
        if (e.button === 2) return;
        e.preventDefault();
        isDragging = false;
        fab.classList.remove('lumi-floating');
        const r = fab.getBoundingClientRect();
        dragStartX = e.clientX; dragStartY = e.clientY;
        mouseOffset.x = e.clientX - r.left; mouseOffset.y = e.clientY - r.top;
        function onMouseMove(ev) {
            const dx = ev.clientX - dragStartX, dy = ev.clientY - dragStartY;
            if (Math.sqrt(dx*dx + dy*dy) > DRAG_THRESHOLD) {
                isDragging = true;
                $(menu).fadeOut(100);
            }
            if (!isDragging) return;
            let x = Math.max(0, Math.min(ev.clientX - mouseOffset.x, window.innerWidth - 50));
            let y = Math.max(0, Math.min(ev.clientY - mouseOffset.y, window.innerHeight - 50));
            fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
            updateMenuPos();
        }
        function onMouseUp(ev) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            fab.classList.add('lumi-floating');
            if (!isDragging) {
                clearTimeout(tapTimer);
                tapTimer = setTimeout(() => {
                    updateMenuPos();
                    $(menu).fadeToggle(300);
                    spawnHeartEffect({ ...ev, _fromDrag: false });
                }, 50);
            }
            isDragging = false;
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Touch
    fab.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isTouchDrag = false;
        fab.classList.remove('lumi-floating');
        const t = e.touches[0], r = fab.getBoundingClientRect();
        dragStartX = t.clientX; dragStartY = t.clientY;
        touchOffset.x = t.clientX - r.left; touchOffset.y = t.clientY - r.top;
    }, { passive: false });

    fab.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - dragStartX, dy = t.clientY - dragStartY;
        if (Math.sqrt(dx*dx + dy*dy) > DRAG_THRESHOLD) {
            isTouchDrag = true;
            $(menu).fadeOut(100);
        }
        if (!isTouchDrag) return;
        let x = Math.max(0, Math.min(t.clientX - touchOffset.x, window.innerWidth - 50));        let y = Math.max(0, Math.min(t.clientY - touchOffset.y, window.innerHeight - 50));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
        updateMenuPos();
    }, { passive: false });

    fab.addEventListener('touchend', (e) => {
        fab.classList.add('lumi-floating');
        if (!isTouchDrag) {
            clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                updateMenuPos();
                $(menu).fadeToggle(300);
                const t = e.changedTouches?.[0];
                if (t) spawnHeartEffect({ _fromDrag: false, clientX: t.clientX, clientY: t.clientY });
            }, 50);
        }
        isTouchDrag = false;
    });

    // Keyboard
    fab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            updateMenuPos();
            $(menu).fadeToggle(300);
        }
    });

    // Long press reset
    let longPressTimer = null;
    fab.addEventListener('touchstart', () => {
        longPressTimer = setTimeout(() => {
            if (!isTouchDrag) {
                fab.style.top = '45%'; fab.style.right = '20px'; fab.style.left = 'auto';
                showToast('📍 รีเซ็ตตำแหน่งปุ่มแล้ว', 'info');
            }
        }, 800);
    }, { passive: true });
    fab.addEventListener('touchend', () => clearTimeout(longPressTimer));
    fab.addEventListener('touchcancel', () => clearTimeout(longPressTimer));

    // Menu clicks
    $(document)
        .off('click', '#lumi-diary').on('click', '#lumi-diary', () => openLumiModal('diary'))
        .off('click', '#lumi-phone').on('click', '#lumi-phone', () => openLumiModal('phone'))
        .off('click', '#lumi-forum').on('click', '#lumi-forum', () => openLumiModal('forum'));
}

// ═══════════════════════════════════════════════
// MODAL SHELL (เดิมของคุณ)// ═══════════════════════════════════════════════
function createContentModal() {
    if ($('#lumi-modal-overlay').length > 0) return;
    $('body').append(`
        <div id="lumi-modal-overlay" class="lumi-modal-overlay">
            <div class="lumi-modal-box">
                <div class="lumi-modal-header">
                    <div class="lumi-modal-opt">${svgSettings}</div>
                    <span id="lumi-modal-title"></span>
                    <div class="lumi-modal-close">×</div>
                </div>
                <div id="lumi-modal-body" class="lumi-modal-body"></div>
            </div>
        </div>
    `);

    $('#lumi-modal-overlay').on('click', function(e) {
        if (e.target.id === 'lumi-modal-overlay') $(this).fadeOut(200);
    });
    $(document).off('click', '.lumi-modal-close').on('click', '.lumi-modal-close', () => {
        $('#lumi-modal-overlay').fadeOut(200);
    });
}

// ═══════════════════════════════════════════════
// SETTINGS PANEL (เดิมของคุณ + เพิ่มปุ่มเข้าถึงเร็ว)
// ═══════════════════════════════════════════════
function createSettingsUI() {
    $('#extensions_settings').append(`
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b style="color:#ff85a2; font-family:'Mitr'; font-weight:300;">🌸 LumiPulse Hub</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="font-family:'Mitr'; font-weight:300; display:flex; flex-direction:column; gap:10px; padding:15px 0;">
                <label class="checkbox_label">
                    <input id="lumi_enable_toggle" type="checkbox" />
                    <span>เปิดใช้งาน LumiPulse</span>
                </label>
                <button id="lumi-diary-settings" class="menu_button">⚙️ ตั้งค่าไดอารี่</button>
                <button id="lumi-reset" class="menu_button">🗑️ Reset All Data</button>
                <div style="font-size:11px; color:#ffb6c1; margin-top:5px; line-height:1.5;">
                    v2.0 · 🌸 Forum · 📖 Memories (Auto) · 📱 Phone (soon)
                </div>
            </div>
        </div>
    `);

    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled);
    $(document).on('change', '#lumi_enable_toggle', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) { spawnLumiButton(); createContentModal(); setupAutoTriggerListener(); }
        else { 
            $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove();
            $(document).off('messageReceived', onNewChatMessage); // 🆕 ลบ listener
        }
    });
    
    // 🆕 ปุ่มตั้งค่าไดอารี่ใน Extension Panel
    $(document).on('click', '#lumi-diary-settings', () => {
        if (!extension_settings[extensionName].isEnabled) {
            toastr.warning('เปิดใช้งาน LumiPulse ก่อนนะคะ 🌸');
            return;
        }
        // เปิดโมดอลตั้งค่า
        createContentModal();
        renderDiarySettingsInModal();
        $('#lumi-modal-overlay').fadeIn(300);
    });

    $(document).on('click', '#lumi-reset', () => {
        const s = extension_settings[extensionName];
        s.isForumInitialized = false;
        s.forumTopic = "";
        s.forumData = [];
        s.diaryData = null;
        s.memories = []; // 🆕 ล้างความทรงจำด้วย
        s._internal = { ...defaultSettings._internal };
        SillyTavern.getContext().saveSettingsDebounced();
        toastr.success("ล้างข้อมูลทั้งหมดแล้วค่ะ 🌸");
    });
}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
function showToast(message, type = 'info') {
    if (typeof toastr !== 'undefined') {
        toastr[type](message, '🌸 LumiPulse');
    } else {
        console.log(`[LumiPulse] ${message}`);
    }
}
