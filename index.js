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

const svgHeart = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.2s-10.5-6.3-13.2-11.4c-2-3.8-.7-8.4 3.3-10.2 3.1-1.4 6.5-.4 8.4 2.2 1.9-2.6 5.3-3.6 8.4-2.2 4 1.8 5.3 6.4 3.3 10.2-2.7 5.1-13.2 11.4-13.2 11.4z" fill="#FFB6C1" stroke="#FFB6C1" stroke-width="1"/></svg>`;

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
    document.addEventListener('mousedown', (e) => spawnHeartEffect(e));
}

function getCurrentCharacter() {
    const context = SillyTavern.getContext();
    return { name: context.name2 || 'Unknown', avatar: context.character_avatar || '' };
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
        .lumi-input { width: 100%; background: #FFF5F7; border: 2px solid #FFD1DC; border-radius: 20px; padding: 15px; color: #ff85a2; font-family: 'Mitr'; font-size: 15px; outline: none; }
        .lumi-btn-start { background: linear-gradient(135deg, #FFB6C1, #FF85A2); color: white; border: none; padding: 12px 40px; border-radius: 25px; font-size: 16px; cursor: pointer; box-shadow: 0 5px 15px rgba(255,133,162,0.3); transition: 0.3s; }
        .lumi-btn-start:hover { transform: scale(1.05); }

        .forum-post { background: white; border-radius: 30px; padding: 20px; margin-bottom: 20px; border: 1px solid #F8F8F8; box-shadow: 0 8px 20px rgba(0,0,0,0.03); }
        .post-header { display: flex; gap: 15px; align-items: center; margin-bottom: 12px; }
        .post-avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #FFD1DC; }
        .post-author { font-weight: 400; color: #444; font-size: 16px; }
        .post-time { font-size: 12px; color: #CCC; }
        .post-content { font-size: 14px; color: #666; line-height: 1.6; }
        .post-footer { display: flex; gap: 20px; margin-top: 15px; color: #ffb6c1; font-size: 14px; }
        
        .lumi-loader { width: 40px; height: 40px; border: 3px solid #FFF0F3; border-top-color: #ff85a2; border-radius: 50%; animation: spin 1s infinite linear; }
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
        $('#lumi-modal-title').text('Character Diary');
        $('#lumi-modal-body').html('<div style="text-align:center; padding-top:100px; color:#ffb6c1;">Coming Soon... 🌸</div>');
    }
    
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);
}

function renderForumUI() {
    const s = extension_settings[extensionName];
    const body = $('#lumi-modal-body');
    body.empty();

    if (!s.isForumInitialized) {
        body.html(`
            <div class="lumi-setup-container">
                <img src="${iconForum}" style="width:80px; opacity:0.8;">
                <div style="color:#ff85a2; font-size:18px;">สร้างหัวข้อฟอรั่มของคุณ</div>
                <input id="forum-topic-input" class="lumi-input" placeholder="เช่น มหาวิทยาลัยเวทมนตร์, โลกซอมบี้..." />
                <label class="checkbox_label" style="font-size:13px; color:#ffb6c1;">
                    <input id="npc-toggle" type="checkbox" ${s.includeRandomNPCs ? 'checked' : ''} />
                    <span>รวม NPC สมมติอื่นๆ ในโพสต์</span>
                </label>
                <button id="btn-create-forum" class="lumi-btn-start">เริ่มการเชื่อมต่อ</button>
            </div>
        `);

        $('#btn-create-forum').on('click', () => {
            const topic = $('#forum-topic-input').val();
            if (!topic) return toastr.warning("กรุณาระบุหัวข้อฟอรั่ม");
            s.forumTopic = topic;
            s.includeRandomNPCs = $('#npc-toggle').prop('checked');
            s.isForumInitialized = true;
            SillyTavern.getContext().saveSettingsDebounced();
            renderForumUI();
        });
    } else {
        body.html(`
            <div class="lumi-setup-container">
                <div class="lumi-loader"></div>
                <div style="color:#ff85a2;">กำลังประมวลผลฟอรั่ม<br/><b>${s.forumTopic}</b></div>
            </div>
        `);
        
        setTimeout(() => {
            body.empty();
            const char = getCurrentCharacter();
            let feedHtml = `
                <div style="font-size:12px; color:#ffb6c1; margin-bottom:15px; text-align:center;">
                    กำลังแสดงโพสต์ที่เกี่ยวข้องกับ: ${s.forumTopic}
                </div>
                <div class="forum-post">
                    <div class="post-header">
                        <img src="${char.avatar}" class="post-avatar" onerror="this.src='${btnUrl}'">
                        <div class="post-info">
                            <span class="post-author">${char.name}</span>
                            <span class="post-time">Just now</span>
                        </div>
                    </div>
                    <div class="post-content">ทุกคนคิดว่าหัวข้อ "${s.forumTopic}" วันนี้เป็นยังไงบ้าง? เราว่าน่าสนใจดีนะ! 🌸</div>
                    <div class="post-footer"><span>❤️ 24</span> <span>💬 5</span></div>
                </div>
            `;

            if (s.includeRandomNPCs) {
                feedHtml += `
                    <div class="forum-post" style="opacity:0.8;">
                        <div class="post-header">
                            <div class="post-avatar" style="background:#FFD1DC; display:flex; align-items:center; justify-content:center; color:white;">?</div>
                            <div class="post-info">
                                <span class="post-author">Anonymous_Student</span>
                                <span class="post-time">5m ago</span>
                            </div>
                        </div>
                        <div class="post-content">ใครก็ได้ช่วยสรุปเรื่อง ${s.forumTopic} ให้ที ตามไม่ทันแล้ว! 😅</div>
                        <div class="post-footer"><span>❤️ 10</span> <span>💬 2</span></div>
                    </div>
                `;
            }
            body.append(feedHtml);
        }, 2000);
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
        let top = rect.top - menuEl.outerHeight() - 35;
        if (left < 15) left = 15;
        if (left + menuEl.outerWidth() > window.innerWidth) left = window.innerWidth - menuEl.outerWidth() - 15;
        if (top < 15) top = rect.bottom + 35;
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
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => toastr.info('Phone coming soon!'));
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
            <button id="lumi-reset-forum" class="menu_button">รีเซ็ตหัวข้อฟอรั่ม</button>
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
        toastr.success("รีเซ็ตหัวข้อฟอรั่มแล้ว");
    });
}
    
