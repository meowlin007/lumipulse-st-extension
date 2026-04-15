"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { isEnabled: false, forumTopic: "", isForumInitialized: false, includeRandomNPCs: true, forumData: [] };
let extension_settings = {};

const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1" stroke="#FFB6C1" stroke-width="1" stroke-linejoin="round"/></svg>`;
const svgSettings = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

jQuery(async () => {
    const boot = setInterval(() => {
        if (window.SillyTavern && SillyTavern.getContext) { clearInterval(boot); initLumiPulse(); }
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
    document.addEventListener('mousedown', (e) => spawnHeartEffect(e));
}

function getChatNPCs() {
    const chat = SillyTavern.getContext().chat || [];
    const names = new Set();
    chat.slice(-40).forEach(m => { if (m.name && !m.is_user && !m.is_system) names.add(m.name); });
    return Array.from(names);
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400&display=swap');
        @keyframes lumiPop { 0% { opacity: 0; transform: scale(0.8) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes heartRise { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(2) rotate(15deg); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .lumi-vector-heart { position: fixed; z-index: 2147483647; pointer-events: none; width: 30px; height: 30px; animation: heartRise 0.8s ease-out forwards; filter: drop-shadow(0 0 5px #FFB6C1); }
        #lumi-main-fab { position: fixed !important; z-index: 2147483647 !important; width: 50px; height: 50px; cursor: move; touch-action: none; background: url('${btnUrl}') no-repeat center; background-size: contain; filter: drop-shadow(0 5px 15px rgba(255,182,193,0.5)); }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        .lumi-menu-container { position: fixed; z-index: 2147483646; display: none; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(25px); border-radius: 45px; padding: 30px; border: 2px solid rgba(255, 182, 193, 0.4); box-shadow: 0 25px 60px rgba(255, 182, 193, 0.3); font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-menu-grid { display: flex; gap: 25px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; }
        .lumi-menu-item:hover { transform: translateY(-8px); }
        .lumi-menu-icon { width: 55px; height: 55px; object-fit: contain; }
        .lumi-menu-text { font-size: 13px; color: #ff85a2; letter-spacing: 0.5px; }
        .lumi-branding { margin-top: 25px; font-size: 11px; color: #ffb6c1; text-transform: uppercase; letter-spacing: 4px; text-align: center; }

        .lumi-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.1); backdrop-filter: blur(15px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal-box { width: 94%; max-width: 460px; height: 82vh; background: #FFFFFF; border-radius: 45px; border: 2px solid #FFD1DC; box-shadow: 0 30px 70px rgba(255,182,193,0.15); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr', sans-serif; font-weight: 300; animation: lumiPop 0.4s forwards; }
        .lumi-modal-header { padding: 25px; text-align: center; color: #ff85a2; border-bottom: 1.5px solid #FFF0F3; position: relative; font-size: 18px; }
        .lumi-modal-close { position: absolute; right: 20px; top: 25px; width: 35px; height: 35px; background: #FFF0F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff85a2; }
        .lumi-modal-opt { position: absolute; left: 20px; top: 25px; width: 35px; height: 35px; color: #ffb6c1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
        .lumi-modal-opt:hover { color: #ff85a2; transform: rotate(45deg); }
        .lumi-modal-body { flex: 1; padding: 20px; overflow-y: auto; background: #FFFFFF; }

        .lumi-setup { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px; text-align: center; }
        .lumi-input { width: 100%; background: #FFF9FA; border: 1.5px solid #FFD1DC; border-radius: 20px; padding: 15px; color: #ff85a2; font-family: 'Mitr'; text-align: center; outline: none; font-size: 14px; }
        .lumi-btn-gen { background: linear-gradient(135deg, #FFB6C1, #FF85A2); color: white; border: none; padding: 12px 45px; border-radius: 25px; font-family: 'Mitr'; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(255,133,162,0.2); }
        
        .forum-post { background: white; border-radius: 30px; padding: 18px; margin-bottom: 18px; border: 1px solid #FDF2F4; box-shadow: 0 5px 15px rgba(0,0,0,0.02); animation: lumiPop 0.5s backwards; }
        .post-header { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
        .post-avatar { width: 45px; height: 45px; border-radius: 50%; border: 2px solid #FFD1DC; background: #FFF0F3; display: flex; align-items: center; justify-content: center; color: #ff85a2; font-size: 18px; }
        .post-author { font-weight: 400; color: #444; font-size: 15px; }
        .post-content { font-size: 14px; color: #666; line-height: 1.6; }
        .post-footer { margin-top: 12px; color: #ffb6c1; font-size: 13px; display: flex; gap: 15px; }
        .lumi-loader-wrap { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 100px; }
        .lumi-loader { width: 45px; height: 45px; border: 3px solid #FFF0F3; border-top-color: #ff85a2; border-radius: 50%; animation: spin 1s infinite linear; }
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
    setTimeout(() => heart.remove(), 800);
}

async function requestAIGeneration(topic, npcs, includeRandom) {
    const prompt = `[Task: Forum Simulation] Topic: "${topic}". Current NPCs: [${npcs.join(", ")}]. Generate 4 social media posts. ${includeRandom ? "Invent background NPCs if needed." : ""} Return ONLY JSON Array: [{"author": "Name", "content": "Post text", "likes": 12, "time": "5m ago"}]`;
    
    try {
        const context = SillyTavern.getContext();
        // 🔥 เปลี่ยนมาใช้ระบบ Generate ภายในของ ST แทนการ Fetch ตรงๆ เพื่อเลี่ยง 404
        let result = "";
        if (typeof window.generateRaw === 'function') {
            result = await window.generateRaw(prompt, true);
        } else {
            const response = await fetch('/api/backends/chat-completions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': context.csrfToken },
                body: JSON.stringify({ prompt, max_context: 2000, max_gen: 600 })
            });
            const data = await response.json();
            result = data.choices[0].message.content || data.generated_text || "";
        }
        const jsonMatch = result.match(/\[.*\]/s);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) { return []; }
}

function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);
    if (type === 'forum') { renderForumUI(); } 
    else { $('#lumi-modal-title').text('LumiPulse Hub'); $('#lumi-modal-body').html('<div style="text-align:center; padding-top:100px; color:#ffb6c1;">Coming Soon... 🌸</div>'); }
}

function renderForumUI() {
    const s = extension_settings[extensionName];
    const body = $('#lumi-modal-body');
    const title = $('#lumi-modal-title');
    body.empty();

    if (!s.isForumInitialized) {
        title.text('Create New Forum');
        $('.lumi-modal-opt').hide();
        body.html(`
            <div class="lumi-setup">
                <img src="${iconForum}" style="width:70px;">
                <div style="color:#ff85a2; font-size:16px;">ระบุหัวข้อที่คุณต้องการให้ AI สแกน</div>
                <input id="topic-input" class="lumi-input" placeholder="เช่น มหาวิทยาลัยเวทมนตร์, คลับลับ..." value="${s.forumTopic}" />
                <label class="checkbox_label" style="font-size:13px; color:#ffb6c1;">
                    <input id="npc-opt" type="checkbox" ${s.includeRandomNPCs ? 'checked' : ''} />
                    <span>อนุญาตให้ AI สร้าง NPC เสริม</span>
                </label>
                <button id="btn-gen" class="lumi-btn-gen">เริ่มสร้างฟอรั่ม</button>
            </div>
        `);
        $('#btn-gen').on('click', () => {
            const t = $('#topic-input').val();
            if(!t) return toastr.warning("กรุณาใส่หัวข้อ");
            s.forumTopic = t; s.includeRandomNPCs = $('#npc-opt').prop('checked');
            s.isForumInitialized = true; s.forumData = [];
            SillyTavern.getContext().saveSettingsDebounced();
            renderForumUI();
        });
    } else {
        title.text('Social Forum');
        $('.lumi-modal-opt').show();
        if (s.forumData.length === 0) {
            body.html('<div class="lumi-loader-wrap"><div class="lumi-loader"></div><div style="color:#ff85a2;">AI กำลังประมวลผลฟอรั่ม...</div></div>');
            const npcs = getChatNPCs();
            requestAIGeneration(s.forumTopic, npcs, s.includeRandomNPCs).then(posts => {
                s.forumData = posts;
                SillyTavern.getContext().saveSettingsDebounced();
                renderForumUI();
            });
        } else {
            body.append(`<div style="font-size:11px; color:#ffb6c1; text-align:center; margin-bottom:15px;">TOPIC: ${s.forumTopic.toUpperCase()}</div>`);
            s.forumData.forEach(p => {
                body.append(`<div class="forum-post"><div class="post-header"><div class="post-avatar">${p.author.charAt(0)}</div><div style="display:flex; flex-direction:column;"><span class="post-author">${p.author}</span><span style="font-size:10px; color:#CCC;">${p.time}</span></div></div><div class="post-content">${p.content}</div><div class="post-footer">❤️ ${p.likes} Likes</div></div>`);
            });
        }
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
    menu.innerHTML = `<div class="lumi-menu-grid"><div class="lumi-menu-item" id="lumi-diary"><img src="${iconDiary}" class="lumi-menu-icon"><span class="lumi-menu-text">Diary</span></div><div class="lumi-menu-item" id="lumi-phone"><img src="${iconPhone}" class="lumi-menu-icon"><span class="lumi-menu-text">Phone</span></div><div class="lumi-menu-item" id="lumi-forum"><img src="${iconForum}" class="lumi-menu-icon"><span class="lumi-menu-text">Forum</span></div></div><div class="lumi-branding">Lumipulse</div>`;
    document.body.appendChild(menu);

    let isDrag = false, offset = { x: 0, y: 0 };
    const upPos = () => {
        const r = fab.getBoundingClientRect(); const m = $(menu);
        let l = r.left - (m.outerWidth()/2) + (r.width/2);
        let t = r.top - m.outerHeight() - 30;
        if(l < 10) l=10; if(l+m.outerWidth() > window.innerWidth) l=window.innerWidth-m.outerWidth()-10;
        if(t < 10) t=r.bottom+30;
        m.css({ left: l+'px', top: t+'px' });
    };

    fab.addEventListener('touchstart', (e) => { isDrag = false; fab.classList.remove('lumi-floating'); const t = e.touches[0]; offset.x = t.clientX - fab.getBoundingClientRect().left; offset.y = t.clientY - fab.getBoundingClientRect().top; });
    fab.addEventListener('touchmove', (e) => { isDrag = true; $(menu).fadeOut(100); const t = e.touches[0]; let x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth-50)); let y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight-50)); fab.style.left = x+'px'; fab.style.top = y+'px'; fab.style.right = 'auto'; upPos(); }, { passive: false });
    fab.addEventListener('touchend', () => { if(!isDrag) { upPos(); $(menu).fadeToggle(400); } fab.classList.add('lumi-floating'); isDrag = false; });

    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => openLumiModal('diary'));
    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => openLumiModal('forum'));
}

function createContentModal() {
    if ($('#lumi-modal-overlay').length > 0) return;
    const html = `<div id="lumi-modal-overlay" class="lumi-modal-overlay" onclick="if(event.target.id==='lumi-modal-overlay')$(this).fadeOut(200)"><div class="lumi-modal-box"><div class="lumi-modal-header"><div class="lumi-modal-opt">${svgSettings}</div><span id="lumi-modal-title"></span><div class="lumi-modal-close" onclick="$('#lumi-modal-overlay').fadeOut(200)">×</div></div><div id="lumi-modal-body" class="lumi-modal-body"></div></div></div>`;
    $('body').append(html);
    $('.lumi-modal-opt').on('click', () => { extension_settings[extensionName].isForumInitialized = false; renderForumUI(); });
}

function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Mitr'; font-weight: 300;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content" style="font-family: 'Mitr'; font-weight: 300;"><label class="checkbox_label"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label><button id="lumi-reset" class="menu_button">Reset All Forum Data</button></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled);
    $(document).on('change', '#lumi_enable_toggle', function() {
        extension_settings[extensionName].isEnabled = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        if(extension_settings[extensionName].isEnabled) { spawnLumiButton(); createContentModal(); } else { $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove(); }
    });
    $(document).on('click', '#lumi-reset', () => { 
        extension_settings[extensionName].isForumInitialized = false; extension_settings[extensionName].forumTopic = ""; extension_settings[extensionName].forumData = [];
        SillyTavern.getContext().saveSettingsDebounced(); toastr.success("ล้างข้อมูลฟอรั่มแล้ว"); 
    });
}
