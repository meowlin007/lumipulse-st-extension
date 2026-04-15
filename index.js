"use strict";

const extensionName = "lumipulse-st-extension";

const defaultSettings = { 
    isEnabled: false,
    forumTopic: "",
    isForumInitialized: false,
    includeRandomNPCs: true,
    diaryData: [],
    phoneData: {},
    forumData: []
};

let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1" stroke="#FFB6C1" stroke-width="1" stroke-linejoin="round"/></svg>`;

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
    if (extension_settings[extensionName].isEnabled) { spawnLumiButton(); createContentModal(); }
    document.addEventListener('mousedown', (e) => {
        if(e.target.closest('#lumi-main-fab') || e.target.closest('.lumi-menu-item') || e.target.closest('.lumi-modal-close') || e.target.closest('.lumi-btn-start')) {
            spawnHeartEffect(e);
        }
    });
}

function getCurrentCharacter() {
    const context = SillyTavern.getContext();
    return { name: context.name2 || 'Unknown', avatar: context.character_avatar || '' };
}

function getChatContext() {
    const chat = SillyTavern.getContext().chat || [];
    const recent = chat.slice(-20);
    const names = new Set();
    let text = "";
    recent.forEach(m => {
        if (m.name && !m.is_user && !m.is_system) names.add(m.name);
        text += `${m.name}: ${m.mes.substring(0, 150)}\n`;
    });
    return { npcs: Array.from(names), contextText: text };
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400&display=swap');
        @keyframes lumiPop { 0% { opacity: 0; transform: scale(0.7) translateY(30px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes heartRise { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); } 100% { opacity: 0; transform: translate(-50%, -120px) scale(2) rotate(15deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulseLoad { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

        .lumi-vector-heart { position: fixed; z-index: 2147483647; pointer-events: none; width: 30px; height: 30px; animation: heartRise 1s ease-out forwards; filter: drop-shadow(0 0 8px rgba(255,182,193,0.9)); }
        #lumi-main-fab { position: fixed !important; z-index: 2147483647 !important; width: 50px; height: 50px; cursor: move; touch-action: none; background: url('${btnUrl}') no-repeat center; background-size: contain; filter: drop-shadow(0 5px 15px rgba(255,182,193,0.6)); }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        
        .lumi-menu-container { position: fixed; z-index: 2147483646; display: none; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(25px); border-radius: 45px; padding: 30px; border: 1.5px solid rgba(255, 182, 193, 0.5); box-shadow: 0 25px 60px rgba(255, 182, 193, 0.4); font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-menu-grid { display: flex; gap: 30px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .lumi-menu-item:hover { transform: translateY(-10px); }
        .lumi-menu-icon { width: 60px; height: 60px; object-fit: contain; }
        .lumi-menu-text { font-size: 14px; color: #ff85a2; letter-spacing: 0.5px; opacity: 0.9; }
        .lumi-branding { margin-top: 25px; font-size: 12px; color: #ffb6c1; text-transform: uppercase; letter-spacing: 4px; text-align: center; font-weight: 300; }

        .lumi-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(12px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal-box { width: 94%; max-width: 480px; height: 82vh; background: rgba(255, 255, 255, 0.98); border-radius: 45px; border: 2px solid #FFD1DC; box-shadow: 0 30px 70px rgba(255,182,193,0.3); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr', sans-serif; font-weight: 300; animation: lumiPop 0.5s forwards; }
        .lumi-modal-header { padding: 30px; text-align: center; color: #ff85a2; border-bottom: 1px solid #FFF0F3; position: relative; font-size: 20px; }
        .lumi-modal-close { position: absolute; right: 25px; top: 25px; width: 35px; height: 35px; background: #FFF0F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff85a2; font-weight: bold; }
        .lumi-modal-body { flex: 1; padding: 20px; overflow-y: auto; background: #FFFFFF; }

        .lumi-setup-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px; text-align: center; padding: 0 20px; }
        .lumi-input { width: 100%; background: #FFF5F7; border: 2px solid #FFD1DC; border-radius: 20px; padding: 15px; color: #ff85a2; font-family: 'Mitr'; font-size: 15px; outline: none; text-align: center; }
        .lumi-btn-start { background: linear-gradient(135deg, #FFB6C1, #FF85A2); color: white; border: none; padding: 12px 40px; border-radius: 25px; font-size: 16px; cursor: pointer; box-shadow: 0 5px 15px rgba(255,133,162,0.3); transition: 0.3s; font-family: 'Mitr'; }
        .lumi-btn-start:hover { transform: scale(1.05); }

        .forum-post { background: white; border-radius: 30px; padding: 20px; margin-bottom: 20px; border: 1px solid #F8F8F8; box-shadow: 0 8px 20px rgba(0,0,0,0.03); animation: lumiPop 0.5s backwards; }
        .post-header { display: flex; gap: 15px; align-items: center; margin-bottom: 12px; }
        .post-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #FFD1DC; }
        .post-avatar-letter { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #FFD1DC; display: flex; align-items: center; justify-content: center; background: #FFF0F3; color: #ff85a2; font-size: 20px; font-weight: 400; }
        .post-author { font-weight: 400; color: #444; font-size: 16px; }
        .post-time { font-size: 12px; color: #CCC; }
        .post-content { font-size: 14px; color: #666; line-height: 1.6; }
        .post-footer { display: flex; gap: 20px; margin-top: 15px; color: #ffb6c1; font-size: 14px; }
        
        .lumi-loader { width: 50px; height: 50px; border: 3px solid #FFF0F3; border-top-color: #ff85a2; border-radius: 50%; animation: spin 1s infinite linear; }
    `;
    document.head.appendChild(style);
}

function spawnHeartEffect(e) {
    const heart = document.createElement('div');
    heart.className = 'lumi-vector-heart';
    heart.innerHTML = svgHeart;
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
}

function createContentModal() {
    if ($('#lumi-modal-overlay').length > 0) return;
    const html = `
        <div id="lumi-modal-overlay" class="lumi-modal-overlay">
            <div class="lumi-modal-box">
                <div class="lumi-modal-header">
                    <span id="lumi-modal-title"></span>
                    <div class="lumi-modal-close" onclick="$('#lumi-modal-overlay').fadeOut(200)">×</div>
                </div>
                <div id="lumi-modal-body" class="lumi-modal-body"></div>
            </div>
        </div>
    `;
    $('body').append(html);
}

function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200);
    const s = extension_settings[extensionName];
    
    if (type === 'forum') {
        $('#lumi-modal-title').text('Social Forum');
        renderForumUI();
    } else {
        $('#lumi-modal-title').text('Character Data');
        $('#lumi-modal-body').html('<div style="text-align:center; padding-top:100px; color:#ffb6c1;">Coming Soon... 🌸</div>');
    }
    
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);
}

async function generateAIPosts(topic, includeNpcs) {
    const ctx = getChatContext();
    const mainChar = getCurrentCharacter();
    const prompt = `Generate a JSON array containing 3 social media / forum posts regarding the topic: "${topic}".
Context events: "${ctx.contextText}".
Available characters: ${mainChar.name}, ${ctx.npcs.join(', ')}.
${includeNpcs ? "You can invent anonymous or background characters." : "Only use the available characters."}
Return ONLY valid JSON in this exact format:
[{"author": "Name", "avatar_letter": "N", "time": "10m ago", "content": "Text", "likes": 12, "comments": 3}]`;

    try {
        let aiResult = "";
        if (typeof window.generateRaw === 'function') {
            aiResult = await window.generateRaw(prompt, true);
        } else if (window.SillyTavern && SillyTavern.getContext().api && SillyTavern.getContext().api.generate) {
            aiResult = await SillyTavern.getContext().api.generate(prompt);
        } else {
            const fb = [];
            fb.push({ author: mainChar.name, avatar_letter: mainChar.name.charAt(0).toUpperCase(), time: "Just now", content: `กำลังคิดเรื่อง ${topic} อยู่เลย มีใครพอจะรู้เรื่องนี้บ้างไหม? 🌸`, likes: Math.floor(Math.random()*50)+10, comments: Math.floor(Math.random()*10)+1 });
            if (ctx.npcs.length > 0) {
                fb.push({ author: ctx.npcs[0], avatar_letter: ctx.npcs[0].charAt(0).toUpperCase(), time: "5m ago", content: `เห็นด้วยเลย! เรื่อง ${topic} ช่วงนี้กำลังเป็นประเด็นหนักมาก 🤔`, likes: Math.floor(Math.random()*30), comments: Math.floor(Math.random()*5) });
            }
            if (includeNpcs) {
                fb.push({ author: "Anonymous", avatar_letter: "?", time: "15m ago", content: `วงในบอกมาว่า ${topic} มีเบื้องหลังที่พวกเรายังไม่รู้อีกเยอะ รอติดตามเลย 🤫`, likes: Math.floor(Math.random()*100), comments: Math.floor(Math.random()*20) });
            }
            return fb;
        }

        const match = aiResult.match(/\[.*\]/s);
        if (match) return JSON.parse(match[0]);
        throw new Error("Invalid format");
    } catch (e) {
        console.error(e);
        const fb = [];
        fb.push({ author: mainChar.name, avatar_letter: mainChar.name.charAt(0).toUpperCase(), time: "Just now", content: `เรื่อง ${topic} ก็น่าสนใจดีนะ 🌸`, likes: 12, comments: 2 });
        if (includeNpcs) fb.push({ author: "Secret User", avatar_letter: "?", time: "10m ago", content: `มีใครอัปเดตเรื่อง ${topic} บ้าง เล่าหน่อย`, likes: 45, comments: 10 });
        return fb;
    }
}

async function executeForumGeneration() {
    const s = extension_settings[extensionName];
    const body = $('#lumi-modal-body');
    const char = getCurrentCharacter();

    body.html(`
        <div class="lumi-setup-container">
            <div class="lumi-loader"></div>
            <div style="color:#ff85a2; font-size:16px; animation: pulseLoad 1.5s infinite;">
                AI is analyzing context and generating posts for<br/>
                <b style="font-size:20px;">"${s.forumTopic}"</b>
            </div>
        </div>
    `);

    const posts = await generateAIPosts(s.forumTopic, s.includeRandomNPCs);
    
    body.empty();
    let feedHtml = `<div style="font-size:12px; color:#ffb6c1; margin-bottom:20px; text-align:center;">Showing feed for: ${s.forumTopic}</div>`;

    posts.forEach((p, idx) => {
        let avatarHtml = `<div class="post-avatar-letter">${p.avatar_letter}</div>`;
        if (p.author.toLowerCase() === char.name.toLowerCase()) {
            avatarHtml = `<img src="${char.avatar}" class="post-avatar" onerror="this.src='${btnUrl}'">`;
        }
        feedHtml += `
            <div class="forum-post" style="animation-delay: ${idx * 0.15}s;">
                <div class="post-header">
                    ${avatarHtml}
                    <div class="post-info">
                        <span class="post-author">${p.author}</span>
                        <span class="post-time">${p.time}</span>
                    </div>
                </div>
                <div class="post-content">${p.content}</div>
                <div class="post-footer"><span>❤️ ${p.likes}</span> <span>💬 ${p.comments}</span></div>
            </div>
        `;
    });

    body.append(feedHtml);
}

function renderForumUI() {
    const s = extension_settings[extensionName];
    const body = $('#lumi-modal-body');
    body.empty();

    if (!s.isForumInitialized) {
        body.html(`
            <div class="lumi-setup-container">
                <img src="${iconForum}" style="width:80px; opacity:0.8; margin-bottom:10px;">
                <div style="color:#ff85a2; font-size:18px;">Create new Forum Topic</div>
                <input id="forum-topic-input" class="lumi-input" placeholder="e.g. Magic University, Zombie Apocalypse..." />
                <label class="checkbox_label" style="font-size:14px; color:#ff85a2; margin-top:10px;">
                    <input id="npc-toggle" type="checkbox" ${s.includeRandomNPCs ? 'checked' : ''} />
                    <span>Allow AI to generate random NPCs</span>
                </label>
                <button id="btn-create-forum" class="lumi-btn-start" style="margin-top:20px;">Generate Feed</button>
            </div>
        `);

        $('#btn-create-forum').on('click', () => {
            const topic = $('#forum-topic-input').val();
            if (!topic) return toastr.warning("Please enter a topic.");
            s.forumTopic = topic;
            s.includeRandomNPCs = $('#npc-toggle').prop('checked');
            s.isForumInitialized = true;
            SillyTavern.getContext().saveSettingsDebounced();
            executeForumGeneration();
        });
    } else {
        executeForumGeneration();
    }
}

function spawnLumiButton() {
    $('#lumi-main-fab, .lumi-menu-container').remove();
    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab'; fab.className = 'lumi-floating';
    fab.style.top = '45%'; fab.style.right = '20px';
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.className = 'lumi-menu-container';
    menu.innerHTML = `
        <div class="lumi-menu-grid">
            <div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon"><span class="lumi-menu-text">Diary</span></div>
            <div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}" class="lumi-menu-icon"><span class="lumi-menu-text">Phone</span></div>
            <div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon"><span class="lumi-menu-text">Forum</span></div>
        </div>
        <div class="lumi-branding">Lumipulse</div>
    `;
    document.body.appendChild(menu);

    let isDragging = false, offset = { x: 0, y: 0 };
    const updateMenuPos = () => {
        const rect = fab.getBoundingClientRect();
        const menuEl = $(menu);
        let left = rect.left - (menuEl.outerWidth() / 2) + (rect.width / 2);
        let top = rect.top - menuEl.outerHeight() - 30;
        if (left < 15) left = 15;
        if (left + menuEl.outerWidth() > window.innerWidth) left = window.innerWidth - menuEl.outerWidth() - 15;
        if (top < 15) top = rect.bottom + 30;
        menuEl.css({ left: left + 'px', top: top + 'px' });
    };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true; $(menu).fadeOut(150);
        const t = e.touches[0];
        let x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth - 50));
        let y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight - 50));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        if (!isDragging) { updateMenuPos(); $(menu).fadeToggle(400); }
        fab.classList.add('lumi-floating');
        isDragging = false;
    });

    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => openLumiModal('diary'));
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => openLumiModal('phone'));
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => openLumiModal('forum'));
}

function createSettingsUI() {
    const html = `
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b style="color: #ff85a2; font-family: 'Mitr'; font-weight: 300;">🌸 LumiPulse Hub</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content" style="font-family: 'Mitr'; font-weight: 300;">
            <label class="checkbox_label"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label>
            <button id="lumi-reset-forum" class="menu_button">Reset Forum Topic</button>
        </div>
    </div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled);
    
    $(document).on('change', '#lumi_enable_toggle', function() {
        extension_settings[extensionName].isEnabled = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        if (extension_settings[extensionName].isEnabled) { spawnLumiButton(); createContentModal(); } else { $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove(); }
    });

    $(document).on('click', '#lumi-reset-forum', () => {
        extension_settings[extensionName].isForumInitialized = false;
        SillyTavern.getContext().saveSettingsDebounced();
        toastr.success("Forum reset. You can now create a new topic.");
    });
}
