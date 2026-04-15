"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { 
    isEnabled: false,
    forumType: 'university', // university, adventure, night_club
    includeRandomNpcs: true,
    forumPosts: []
};

let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

const svgHeart = `<svg viewBox="0 0 32 32" fill="#ffb6c1" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.5L14.1 26.75C7.2 20.5 2.7 16.45 2.7 11.5C2.7 7.45 5.85 4.3 9.9 4.3C12.15 4.3 14.35 5.35 15.8 7C17.25 5.35 19.45 4.3 21.7 4.3C25.75 4.3 28.9 7.45 28.9 11.5C28.9 16.45 24.4 20.5 17.5 26.75L16 28.5Z"/></svg>`;

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
    document.addEventListener('mousedown', (e) => spawnHeartEffect(e));
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500&display=swap');
        @keyframes lumiPop { 0% { opacity: 0; transform: scale(0.6) translateY(30px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes heartRise { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); } 20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.8) rotate(15deg); } }

        .lumi-vector-heart { position: fixed; z-index: 2147483647; pointer-events: none; width: 25px; height: 25px; animation: heartRise 0.9s ease-out forwards; filter: drop-shadow(0 0 5px rgba(255,182,193,0.8)); }
        #lumi-main-fab { position: fixed !important; z-index: 2147483647 !important; width: 50px; height: 50px; cursor: move; touch-action: none; background: url('${btnUrl}') no-repeat center; background-size: contain; filter: drop-shadow(0 5px 15px rgba(255,182,193,0.6)); }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        
        /* Menu & Containers */
        .lumi-menu-container { position: fixed; z-index: 2147483646; display: none; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(25px); border-radius: 45px; padding: 30px; border: 2px solid rgba(255, 182, 193, 0.5); box-shadow: 0 25px 60px rgba(255, 182, 193, 0.4); font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-menu-grid { display: flex; gap: 30px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); animation: lumiPop 0.5s backwards; }
        .lumi-menu-icon { width: 60px; height: 60px; object-fit: contain; }
        .lumi-menu-text { font-size: 14px; color: #ff85a2; letter-spacing: 0.5px; opacity: 0.9; }
        .lumi-branding { margin-top: 25px; font-size: 12px; color: #ffb6c1; text-transform: uppercase; letter-spacing: 4px; text-align: center; font-weight: 300; }

        /* Modal Content */
        .lumi-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal-box { width: 92%; max-width: 450px; height: 85vh; background: rgba(255, 255, 255, 0.98); border-radius: 40px; border: 2px solid #FFD1DC; box-shadow: 0 20px 50px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr', sans-serif; animation: lumiPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .lumi-modal-header { padding: 20px; text-align: center; color: #ff85a2; border-bottom: 1.5px solid #FFF0F3; position: relative; font-weight: 500; font-size: 18px; }
        .lumi-modal-close { position: absolute; right: 20px; top: 18px; width: 32px; height: 32px; background: #FFF0F3; color: #ff85a2; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .lumi-modal-body { flex: 1; padding: 15px; overflow-y: auto; background: #FAFAFA; }

        /* Forum Specific Styles */
        .lumi-forum-post { background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #F0F0F0; animation: lumiPop 0.4s ease-out; }
        .lumi-post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .lumi-post-avatar { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #FFD1DC; }
        .lumi-post-info { display: flex; flex-direction: column; }
        .lumi-post-author { font-weight: 500; color: #ff85a2; font-size: 14px; }
        .lumi-post-time { font-size: 11px; color: #CCC; font-weight: 300; }
        .lumi-post-content { font-size: 13px; color: #555; line-height: 1.5; font-weight: 300; word-wrap: break-word; }
        .lumi-post-tag { display: inline-block; padding: 2px 8px; background: #FFF0F3; color: #ff85a2; border-radius: 10px; font-size: 10px; margin-top: 8px; }
    `;
    document.head.appendChild(style);
}

function createContentModal() {
    if ($('#lumi-modal-overlay').length > 0) return;
    const modalHtml = `
        <div id="lumi-modal-overlay" class="lumi-modal-overlay">
            <div class="lumi-modal-box">
                <div class="lumi-modal-header">
                    <span id="lumi-modal-title">Forum</span>
                    <div class="lumi-modal-close" onclick="$('#lumi-modal-overlay').fadeOut(250)">×</div>
                </div>
                <div id="lumi-modal-body" class="lumi-modal-body"></div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
}

// ระบบจำลอง NPC โพสต์ (Mocking Forum Content)
function renderForum() {
    const charName = SillyTavern.getContext().name2 || "Character";
    const charAvatar = SillyTavern.getContext().characters[SillyTavern.getContext().this_chid]?.avatar || "";
    const avatarUrl = charAvatar ? `/thumbnail?type=avatar&file=${charAvatar}` : "";

    // ตัวอย่างข้อมูลโพสต์ (ในอนาคตส่วนนี้จะสแกนแชทมาสร้าง)
    const mockPosts = [
        { author: charName, avatar: avatarUrl, content: "วันนี้บรรยากาศในมหาลัยดีจังเลยเนอะ... มีใครอยากไปกินกาแฟด้วยกันไหม?", time: "2 mins ago", tag: "General" },
        { author: "Random Senior", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix", content: "ใครลืมสมุดไว้ที่ห้อง LAB คณะวิทย์ รบกวนมาติดต่อรับด่วนนะครับ", time: "15 mins ago", tag: "Science Dept" }
    ];

    if (extension_settings[extensionName].includeRandomNpcs) {
        mockPosts.push({ author: "Ghost Girl", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna", content: "แอบเห็นคนเดินจูงมือกันหน้าคณะบริหารด้วยแหละ... หวานจนมดขึ้นเลย! 💖", time: "1 hour ago", tag: "Gossip" });
    }

    let forumHtml = mockPosts.map(post => `
        <div class="lumi-forum-post">
            <div class="lumi-post-header">
                <img src="${post.avatar}" class="lumi-post-avatar" onerror="this.src='${btnUrl}'">
                <div class="lumi-post-info">
                    <span class="lumi-post-author">${post.author}</span>
                    <span class="lumi-post-time">${post.time}</span>
                </div>
            </div>
            <div class="lumi-post-content">${post.content}</div>
            <div class="lumi-post-tag"># ${post.tag}</div>
        </div>
    `).join('');

    $('#lumi-modal-body').html(forumHtml);
}

function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);
    
    if (type === 'forum') {
        $('#lumi-modal-title').text(extension_settings[extensionName].forumType.toUpperCase() + " FORUM");
        renderForum();
    } else {
        $('#lumi-modal-body').html(`<div style="text-align:center; padding:50px; color:#ff85a2;">${type.toUpperCase()} coming soon...</div>`);
    }
}

function spawnHeartEffect(e) {
    const heart = document.createElement('div');
    heart.className = 'lumi-vector-heart';
    heart.innerHTML = `<svg viewBox="0 0 32 32" fill="#ffb6c1" xmlns="http://www.w3.org/2000/svg"><path d="M16 28.5L14.1 26.75C7.2 20.5 2.7 16.45 2.7 11.5C2.7 7.45 5.85 4.3 9.9 4.3C12.15 4.3 14.35 5.35 15.8 7C17.25 5.35 19.45 4.3 21.7 4.3C25.75 4.3 28.9 7.45 28.9 11.5C28.9 16.45 24.4 20.5 17.5 26.75L16 28.5Z"/></svg>`;
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 900);
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
        isDragging = true; $(menu).fadeOut(100);
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
        </div>
        <div class="inline-drawer-content">
            <label class="checkbox_label" style="font-family: 'Mitr'; font-weight: 300;">
                <input id="lumi_enable_toggle" type="checkbox" />
                <span>เปิดใช้งาน LumiPulse</span>
            </label>
            <label class="checkbox_label" style="font-family: 'Mitr'; font-weight: 300; margin-top:10px;">
                <input id="lumi_random_npc_toggle" type="checkbox" />
                <span>รวม NPC สมมติใน Forum</span>
            </label>
            <div style="margin-top:10px;">
                <span style="font-size:12px; font-family:'Mitr'; color:#ff85a2;">ธีม Forum:</span>
                <select id="lumi_forum_theme" class="text_pole">
                    <option value="university">University (มหาวิทยาลัย)</option>
                    <option value="adventure">Adventure (กิลด์นักผจญภัย)</option>
                    <option value="night_club">Night Club (บาร์/คลับ)</option>
                </select>
            </div>
        </div>
    </div>`;
    $('#extensions_settings').append(html);
    
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        extension_settings[extensionName].isEnabled = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        if (extension_settings[extensionName].isEnabled) { spawnLumiButton(); createContentModal(); } else { $('#lumi-main-fab, .lumi-menu-container').remove(); }
    });

    $('#lumi_random_npc_toggle').prop('checked', extension_settings[extensionName].includeRandomNpcs).on('change', function() {
        extension_settings[extensionName].includeRandomNpcs = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });

    $('#lumi_forum_theme').val(extension_settings[extensionName].forumType).on('change', function() {
        extension_settings[extensionName].forumType = $(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
    });
    }
