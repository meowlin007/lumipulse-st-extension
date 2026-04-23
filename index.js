"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
    forumTopic: "",
    isForumInitialized: false,
    includeRandomNPCs: true,
    forumData: [],
    diaryData: null
};
let extension_settings = {};

const btnUrl    = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart    = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1" stroke="#FFB6C1" stroke-width="1" stroke-linejoin="round"/></svg>`;
const svgSettings = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

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
    if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = { ...defaultSettings };
        context.saveSettingsDebounced();
    }
    extension_settings = context.extensionSettings;
    injectStyles();
    createSettingsUI();
    if (extension_settings[extensionName].isEnabled) {
        spawnLumiButton();
        createContentModal();
    }
    document.addEventListener('click', (e) => {
        if (!e._fromDrag) spawnHeartEffect(e);
    });
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function getChatNPCs() {
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set();
    chat.slice(-40).forEach(m => {
        if (m.name && !m.is_user && !m.is_system) names.add(m.name);
    });
    return Array.from(names);
}

function getCharacterName() {
    const ctx = SillyTavern.getContext();
    return ctx.name2 || "ตัวละคร";
}

function getUserName() {
    const ctx = SillyTavern.getContext();
    return ctx.name1 || "ผู้เล่น";
}

function getRecentChatSummary() {
    const chat = SillyTavern.getContext().chat || [];
    return chat.slice(-30).map(m => {
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
        .replace(/'/g, '&#039;');
}

// ═══════════════════════════════════════════════
// AI CORE
// ═══════════════════════════════════════════════
function parseJSONFromAI(text) {
    if (!text || typeof text !== 'string') return null;

    // ลอง array ก่อน (forum)
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        try { return JSON.parse(arrayMatch[0]); } catch (_) {}
    }

    // ลอง object (diary)
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
        // วิธีที่ 1: generateRaw (ST เวอร์ชันใหม่)
        if (typeof window.generateRaw === 'function') {
            const result = await window.generateRaw(prompt, true);
            return parseJSONFromAI(result);
        }

        // วิธีที่ 2: generateQuietPrompt (รองรับ Gemini ทุก backend)
        if (typeof window.generateQuietPrompt === 'function') {
            const result = await window.generateQuietPrompt(prompt, false, false);
            return parseJSONFromAI(result);
        }

        // ไม่พบทั้งคู่
        console.error('[LumiPulse] ไม่พบ generateRaw หรือ generateQuietPrompt');
        toastr.error('ต้องการ SillyTavern เวอร์ชันล่าสุดค่ะ');
        return null;

    } catch (err) {
        console.error('[LumiPulse] callSTGenerate error:', err);
        toastr.error('เกิดข้อผิดพลาด: ' + err.message);
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

async function requestDiaryGeneration() {
    const charName = getCharacterName();
    const userName = getUserName();
    const chatLog  = getRecentChatSummary();

    const prompt = `[System: You are roleplaying as ${charName}'s inner voice. Respond ONLY with valid JSON, no explanation, no markdown backticks.]

You are ${charName}. Based on the conversation log below, write your private diary entry about your feelings toward ${userName}.

Conversation log:
---
${chatLog}
---

Return ONLY this JSON (in Thai language):
{
  "date": "วันที่สมมติ เช่น 'วันอังคาร ต้นเดือนพฤษภา'",
  "affection_score": 65,
  "mood": "อารมณ์ในคำเดียว เช่น ตื่นเต้น / สับสน / อบอุ่น",
  "diary": "เนื้อหาไดอารี่ 3-5 ประโยค มุมมองบุคคลที่ 1 ธรรมชาติ ไม่เป็นทางการ"
}`;

    return await callSTGenerate(prompt);
}

// ═══════════════════════════════════════════════
// STYLES
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
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
            width: 94%; max-width: 460px; height: 82vh;
            background: #FFFFFF; border-radius: 45px;
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
            animation: lumiPop 0.5s backwards;
        }
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

        /* ── Diary ── */
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
    `;
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════
// HEART EFFECT
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
// MODAL CONTROL
// ═══════════════════════════════════════════════
function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);

    if (type === 'forum') {
        renderForumUI();
    } else if (type === 'diary') {
        renderDiaryUI();
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
// FORUM UI
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
            s.includeRandomNPCs = $('#npc-opt').prop('checked');
            s.isForumInitialized = true;
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
      
