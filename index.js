"use strict";

const extensionName = "lumipulse-st-extension";

const defaultSettings = { 
    isEnabled: false,
    forumType: 'university', // university, social, rpg
    includeRandomNPCs: true,  // ติ๊กเพื่อเอา NPC สมมติมาลงฟอรั่ม
    diaryData: [],
    phoneData: {},
    forumData: [] // เก็บโพสต์ในฟอรั่ม
};

let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// Premium Rounded Vector Heart SVG
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
    document.addEventListener('mousedown', (e) => spawnHeartEffect(e));
}

function getCurrentCharacter() {
    const context = SillyTavern.getContext();
    const char = { name: context.name2 || 'Unknown', avatar: context.character_avatar || '' };
    return char;
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500&display=swap');
        @keyframes lumiPop { 0% { opacity: 0; transform: scale(0.6) translateY(30px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes heartRise { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); } 100% { opacity: 0; transform: translate(-50%, -120px) scale(2) rotate(15deg); } }

        .lumi-vector-heart { position: fixed; z-index: 2147483647; pointer-events: none; width: 30px; height: 30px; animation: heartRise 1s ease-out forwards; filter: drop-shadow(0 0 8px rgba(255,182,193,0.9)); }
        #lumi-main-fab { position: fixed !important; z-index: 2147483647 !important; width: 50px; height: 50px; cursor: move; touch-action: none; background: url('${btnUrl}') no-repeat center; background-size: contain; filter: drop-shadow(0 5px 15px rgba(255,182,193,0.6)); }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        
        .lumi-menu-container { position: fixed; z-index: 2147483646; display: none; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(25px); border-radius: 45px; padding: 30px; border: 2px solid rgba(255, 182, 193, 0.5); box-shadow: 0 25px 60px rgba(255, 182, 193, 0.4); font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-menu-grid { display: flex; gap: 30px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .lumi-menu-item:hover { transform: translateY(-10px); }
        .lumi-menu-icon { width: 60px; height: 60px; object-fit: contain; }
        .lumi-menu-text { font-size: 14px; color: #ff85a2; letter-spacing: 0.5px; opacity: 0.9; }
        .lumi-branding { margin-top: 25px; font-size: 12px; color: #ffb6c1; text-transform: uppercase; letter-spacing: 4px; text-align: center; font-weight: 300; }

        /* Forum & Modal System */
        .lumi-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(8px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal-box { width: 94%; max-width: 480px; height: 85vh; background: #FFFFFF; border-radius: 40px; border: 2.5px solid #FFD1DC; box-shadow: 0 20px 50px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr', sans-serif; animation: lumiPop 0.4s forwards; }
        .lumi-modal-header { padding: 25px; text-align: center; color: #ff85a2; border-bottom: 1.5px solid #FFF0F3; position: relative; font-weight: 500; font-size: 18px; }
        .lumi-modal-close { position: absolute; right: 25px; top: 25px; width: 35px; height: 35px; background: #FFF0F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff85a2; }
        .lumi-modal-body { flex: 1; padding: 15px; overflow-y: auto; background: #FAFAFA; }

        /* Social Post Design */
        .forum-post { background: white; border-radius: 25px; padding: 15px; margin-bottom: 15px; border: 1px solid #F0F0F0; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .post-header { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
        .post-avatar { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #FFD1DC; }
        .post-info { display: flex; flex-direction: column; }
        .post-author { font-weight: 500; color: #333; font-size: 15px; }
        .post-time { font-size: 11px; color: #BBB; }
        .post-content { font-size: 14px; color: #555; line-height: 1.5; padding: 5px 0; }
        .post-footer { display: flex; gap: 15px; margin-top: 10px; color: #ffb6c1; font-size: 13px; }
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

function openLumiModal(type) {
    const char = getCurrentCharacter();
    let title = (type === 'forum') ? 'University Feed' : `${char.name}'s Diary`;
    
    $('#lumi-modal-title').text(title);
    $('#lumi-modal-body').empty();

    if (type === 'forum') {
        renderForumFeed();
    } else {
        $('#lumi-modal-body').html('<div style="text-align:center; padding:50px; color:#ffb6c1;">Scanning logs... 🌸</div>');
    }

    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);
}

function renderForumFeed() {
    const char = getCurrentCharacter();
    const isUni = extension_settings[extensionName].forumType === 'university';
    
    // สร้างโพสต์จาก NPC ในแชท
    let posts = `
        <div class="forum-post animate__animated animate__fadeInUp">
            <div class="post-header">
                <img src="${char.avatar}" class="post-avatar" onerror="this.src='${btnUrl}'">
                <div class="post-info">
                    <span class="post-author">${char.name}</span>
                    <span class="post-time">Just now • ${isUni ? 'Campus Square' : 'Social'}</span>
                </div>
            </div>
            <div class="post-content">วันนี้บรรยากาศในมหาลัยดีจัง มีใครอยากไปหาอะไรกินที่โรงอาหารเป็นเพื่อนไหม? 🌸</div>
            <div class="post-footer"><span>❤️ 12</span> <span>💬 4</span></div>
        </div>
    `;

    // ถ้าติ๊กเอา NPC อื่นๆ มาด้วย
    if (extension_settings[extensionName].includeRandomNPCs) {
        posts += `
            <div class="forum-post" style="opacity: 0.8;">
                <div class="post-header">
                    <div class="post-avatar" style="background:#FFD1DC; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">S</div>
                    <div class="post-info">
                        <span class="post-author">Student_Senior_04</span>
                        <span class="post-time">10m ago • Secret Board</span>
                    </div>
                </div>
                <div class="post-content">ใครเห็นดาวมหาลัยคนล่าสุดบ้าง? เห็นว่าเดินอยู่แถวคณะกับเด็กใหม่นะ... แอบอิจฉาจัง! 🤫</div>
                <div class="post-footer"><span>❤️ 45</span> <span>💬 12</span></div>
            </div>
        `;
    }

    $('#lumi-modal-body').append(posts);
}

function createContentModal() {
    if ($('#lumi-modal-overlay').length > 0) return;
    const modalHtml = `
        <div id="lumi-modal-overlay" class="lumi-modal-overlay" onclick="if(event.target.id==='lumi-modal-overlay')$(this).fadeOut(200)">
            <div class="lumi-modal-box">
                <div class="lumi-modal-header">
                    <span id="lumi-modal-title"></span>
                    <div class="lumi-modal-close" onclick="$('#lumi-modal-overlay').fadeOut(200)">×</div>
                </div>
                <div id="lumi-modal-body" class="lumi-modal-body"></div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
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
            <hr/>
            <label>ฟอรั่มหัวข้อ:</label>
            <select id="lumi_forum_type" class="text_pole">
                <option value="university">University (มหาลัย)</option>
                <option value="social">Social Media (โซเชียล)</option>
                <option value="rpg">RPG Guild (กิลด์นักผจญภัย)</option>
            </select>
            <label class="checkbox_label"><input id="lumi_include_npc" type="checkbox" /><span>รวม NPC สมมติในฟอรั่ม</span></label>
        </div>
    </div>`;
    $('#extensions_settings').append(html);
    
    const s = extension_settings[extensionName];
    $('#lumi_enable_toggle').prop('checked', s.isEnabled);
    $('#lumi_forum_type').val(s.forumType);
    $('#lumi_include_npc').prop('checked', s.includeRandomNPCs);

    $(document).on('change', '#lumi_enable_toggle', function() {
        s.isEnabled = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        if (s.isEnabled) { spawnLumiButton(); createContentModal(); } else { $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove(); }
    });

    $(document).on('change', '#lumi_forum_type, #lumi_include_npc', function() {
        s.forumType = $('#lumi_forum_type').val();
        s.includeRandomNPCs = $('#lumi_include_npc').prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
}
