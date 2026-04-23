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
        // ลองทุก function ที่ ST versions ต่างๆ อาจใช้
        const candidates = [
            'generateRaw',
            'generateQuietPrompt', 
            'generate',
            'sendGenerationRequest',
            'getGeneratingApi',
        ];

        // หาตัวที่มีอยู่จริง แล้วแจ้งใน toastr ด้วย
        const found = candidates.filter(n => typeof window[n] === 'function');
        
        if (found.length === 0) {
            // ไม่เจอเลย — ลอง SillyTavern.getContext() แทน
            const ctx = SillyTavern.getContext();
            const ctxFns = Object.keys(ctx).filter(k => typeof ctx[k] === 'function' && k.toLowerCase().includes('gen'));
            toastr.warning('ไม่พบ generate function — context has: ' + (ctxFns.join(', ') || 'none'));
            return null;
        }

        toastr.info('พบ: ' + found.join(', '), 'LumiPulse Debug', { timeOut: 5000 });

        // ลองใช้ตัวแรกที่เจอ
        if (typeof window.generateRaw === 'function') {
            const result = await window.generateRaw(prompt, true);
            return parseJSONFromAI(result);
        }
        if (typeof window.generateQuietPrompt === 'function') {
            const result = await window.generateQuietPrompt(prompt, false, false);
            return parseJSONFromAI(result);
        }
        if (typeof window.generate === 'function') {
            const result = await window.generate(prompt);
            return parseJSONFromAI(result);
        }

        toastr.error('ยังเรียก generate ไม่ได้ — แจ้งชื่อที่เห็นใน toastr ให้ด้วยนะคะ');
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
                        <div class="post-footer">❤️ ${p.likes || 0} Likes</div>
                    </div>
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
// DIARY UI
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

function renderDiaryUI() {
    const s        = extension_settings[extensionName];
    const body     = $('#lumi-modal-body');
    const charName = getCharacterName();

    $('#lumi-modal-title').text(`📖 ${charName}'s Diary`);
    $('.lumi-modal-opt').hide();
    body.empty();

    if (!s.diaryData) {
        body.html(`
            <div class="lumi-setup">
                <img src="${iconDiary}" style="width:75px;" alt="diary">
                <div style="color:#ff85a2; font-size:16px; line-height:1.6;">
                    อ่านความในใจของ<br>
                    <b style="font-weight:400;">${escapeHtml(charName)}</b> ที่มีต่อคุณ
                </div>
                <div style="font-size:12px; color:#ffb6c1; max-width:260px; line-height:1.6; text-align:center;">
                    AI จะวิเคราะห์บทสนทนาล่าสุด แล้วเขียนเป็นบันทึกความในใจของตัวละคร
                </div>
                <button id="btn-gen-diary" class="lumi-btn-gen">✨ Generate Diary</button>
            </div>
        `);
        $('#btn-gen-diary').on('click', () => startDiaryGeneration());
        return;
    }

    const d     = s.diaryData;
    const score = Math.max(0, Math.min(100, d.affection_score || 0));
    const level = getAffectionLevel(score);

    body.html(`
        <div class="lumi-diary-wrap">
            <div class="lumi-diary-header">
                <div class="lumi-diary-avatar">${escapeHtml(charName.charAt(0).toUpperCase())}</div>
                <div>
                    <div class="lumi-diary-charname">${escapeHtml(charName)}</div>
                    <div class="lumi-diary-date">${escapeHtml(d.date || '')} · ${level.emoji} ${escapeHtml(d.mood || '')}</div>
                </div>
            </div>

            <div class="lumi-affection-wrap">
                <div class="lumi-affection-label">
                    <span>ความสัมพันธ์</span>
                    <span style="color:${level.color}; font-weight:400;">${level.emoji} ${level.label}</span>
                </div>
                <div class="lumi-affection-track">
                    <div class="lumi-affection-fill" style="background:${level.color};"></div>
                </div>
                <div class="lumi-affection-score">${score} / 100</div>
            </div>

            <div class="lumi-diary-paper">
                <div class="lumi-diary-lines"></div>
                <div class="lumi-diary-text">${escapeHtml(d.diary || '')}</div>
            </div>

            <div style="text-align:center; margin-top:18px; padding-bottom:20px;">
                <button id="btn-regen-diary" class="lumi-btn-gen" style="padding:8px 28px; font-size:12px;">
                    🔄 Generate ใหม่
                </button>
            </div>
        </div>
    `);

    setTimeout(() => {
        $('.lumi-affection-fill').css('width', score + '%');
    }, 100);

    $('#btn-regen-diary').on('click', () => startDiaryGeneration());
}

function startDiaryGeneration() {
    const s    = extension_settings[extensionName];
    const body = $('#lumi-modal-body');

    body.html(`
        <div class="lumi-loader-wrap">
            <div class="lumi-loader"></div>
            <div style="color:#ff85a2;">กำลังอ่านความในใจ...</div>
            <div style="font-size:11px; color:#ffb6c1; margin-top:5px;">🌸 รอสักครู่นะคะ</div>
        </div>
    `);

    requestDiaryGeneration().then(data => {
        if (!data) {
            s.diaryData = null;
            SillyTavern.getContext().saveSettingsDebounced();
            renderDiaryUI();
            return;
        }
        s.diaryData = data;
        SillyTavern.getContext().saveSettingsDebounced();
        renderDiaryUI();
    });
}

// ═══════════════════════════════════════════════
// FAB BUTTON
// ═══════════════════════════════════════════════
function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();

    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    fab.style.top   = '45%';
    fab.style.right = '20px';
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary">
                <img src="${iconDiary}" class="lumi-menu-icon" alt="diary">
                <span class="lumi-menu-text">Diary</span>
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

    // Mouse drag (Desktop)
    let isDragging = false;
    let mouseOffset = { x: 0, y: 0 };

    fab.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = false;
        fab.classList.remove('lumi-floating');
        const r = fab.getBoundingClientRect();
        mouseOffset.x = e.clientX - r.left;
        mouseOffset.y = e.clientY - r.top;

        function onMouseMove(ev) {
            isDragging = true;
            $(menu).fadeOut(100);
            let x = Math.max(0, Math.min(ev.clientX - mouseOffset.x, window.innerWidth  - 50));
            let y = Math.max(0, Math.min(ev.clientY - mouseOffset.y, window.innerHeight - 50));
            fab.style.left  = x + 'px';
            fab.style.top   = y + 'px';
            fab.style.right = 'auto';
            updateMenuPos();
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup',   onMouseUp);
            fab.classList.add('lumi-floating');
            if (!isDragging) { updateMenuPos(); $(menu).fadeToggle(300); }
            isDragging = false;
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup',   onMouseUp);
    });

    // Touch drag (Mobile)
    let isTouchDrag = false;
    let touchOffset = { x: 0, y: 0 };

    fab.addEventListener('touchstart', (e) => {
        isTouchDrag = false;
        fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        const r = fab.getBoundingClientRect();
        touchOffset.x = t.clientX - r.left;
        touchOffset.y = t.clientY - r.top;
    }, { passive: true });

    fab.addEventListener('touchmove', (e) => {
        e.preventDefault();
        isTouchDrag = true;
        $(menu).fadeOut(100);
        const t = e.touches[0];
        let x = Math.max(0, Math.min(t.clientX - touchOffset.x, window.innerWidth  - 50));
        let y = Math.max(0, Math.min(t.clientY - touchOffset.y, window.innerHeight - 50));
        fab.style.left  = x + 'px';
        fab.style.top   = y + 'px';
        fab.style.right = 'auto';
        updateMenuPos();
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        fab.classList.add('lumi-floating');
        if (!isTouchDrag) { updateMenuPos(); $(menu).fadeToggle(300); }
        isTouchDrag = false;
    });

    $(document)
        .off('click', '#lumi-diary').on('click', '#lumi-diary', () => openLumiModal('diary'))
        .off('click', '#lumi-phone').on('click', '#lumi-phone', () => openLumiModal('phone'))
        .off('click', '#lumi-forum').on('click', '#lumi-forum', () => openLumiModal('forum'));
}

// ═══════════════════════════════════════════════
// MODAL SHELL
// ═══════════════════════════════════════════════
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
    $('.lumi-modal-opt').on('click', () => {
        extension_settings[extensionName].isForumInitialized = false;
        extension_settings[extensionName].forumData = [];
        SillyTavern.getContext().saveSettingsDebounced();
        renderForumUI();
    });
}

// ═══════════════════════════════════════════════
// SETTINGS PANEL
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
                <button id="lumi-reset" class="menu_button">🗑️ Reset All Data</button>
                <div style="font-size:11px; color:#ffb6c1; margin-top:5px; line-height:1.5;">
                    v1.2 · 🌸 Forum · 📖 Diary · 📱 Phone (soon)
                </div>
            </div>
        </div>
    `);

    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled);

    $(document).on('change', '#lumi_enable_toggle', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) { spawnLumiButton(); createContentModal(); }
        else { $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove(); }
    });

    $(document).on('click', '#lumi-reset', () => {
        const s = extension_settings[extensionName];
        s.isForumInitialized = false;
        s.forumTopic         = "";
        s.forumData          = [];
        s.diaryData          = null;
        SillyTavern.getContext().saveSettingsDebounced();
        toastr.success("ล้างข้อมูลทั้งหมดแล้วค่ะ 🌸");
    });
}
