"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { 
    isEnabled: false,
    allowExternalNPCs: true, // ติ๊กถูกเอาไว้ผสม NPC สมมติ
    forumData: [] 
};

let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";
const iconDiary = "https://file.garden/ad59q6JMmVnp7v1-/lumi-diary-icon.png";
const iconPhone = "https://file.garden/ad59q6JMmVnp7v1-/lumi-phone-icon.png";
const iconForum = "https://file.garden/ad59q6JMmVnp7v1-/lumi-forum-icon.png";

// สัญลักษณ์ SVG
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
    if (extension_settings[extensionName].isEnabled) { spawnLumiButton(); createContentModal(); }
    document.addEventListener('mousedown', (e) => { if(e.target.closest('#lumi-main-fab') || e.target.closest('.lumi-menu-item')) spawnHeartEffect(e); });
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400&display=swap');
        
        /* Animations */
        @keyframes lumiPop { 0% { opacity: 0; transform: scale(0.6) translateY(30px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes heartRise { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); } 20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); } 100% { opacity: 0; transform: translate(-50%, -100px) scale(1.8) rotate(15deg); } }

        /* UI Elements */
        .lumi-vector-heart { position: fixed; z-index: 2147483647; pointer-events: none; width: 25px; height: 25px; animation: heartRise 0.9s ease-out forwards; }
        #lumi-main-fab { position: fixed !important; z-index: 2147483647 !important; width: 50px; height: 50px; cursor: move; touch-action: none; background: url('${btnUrl}') no-repeat center; background-size: contain; filter: drop-shadow(0 5px 15px rgba(255,182,193,0.6)); }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        
        .lumi-menu-container { position: fixed; z-index: 2147483646; display: none; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(25px); border-radius: 45px; padding: 30px; border: 2px solid rgba(255, 182, 193, 0.5); box-shadow: 0 25px 60px rgba(255, 182, 193, 0.4); font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-menu-grid { display: flex; gap: 30px; align-items: center; justify-content: center; }
        .lumi-menu-item { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); animation: lumiPop 0.5s backwards; }
        .lumi-menu-item:hover { transform: translateY(-10px) scale(1.05); }
        .lumi-menu-icon { width: 60px; height: 60px; object-fit: contain; }
        .lumi-menu-text { font-size: 14px; color: #ff85a2; letter-spacing: 0.5px; opacity: 0.9; }

        /* Forum Modal */
        .lumi-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); z-index: 2147483648; display: none; align-items: center; justify-content: center; }
        .lumi-modal-box { width: 92%; max-width: 450px; height: 85vh; background: rgba(255, 255, 255, 0.95); border-radius: 35px; border: 2px solid #FFD1DC; display: flex; flex-direction: column; overflow: hidden; font-family: 'Mitr', sans-serif; font-weight: 300; }
        .lumi-modal-header { padding: 22px; text-align: center; color: #ff85a2; border-bottom: 2px dashed #FFD1DC; position: relative; }
        .lumi-modal-close { position: absolute; right: 20px; top: 22px; width: 32px; height: 32px; background: #FFD1DC; color: #ff85a2; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .lumi-modal-body { flex: 1; padding: 15px; overflow-y: auto; background: #FFF5F7; }

        /* Forum Post Styles (The Social Feed Look) */
        .lumi-forum-post {
            background: white; border-radius: 20px; padding: 15px; margin-bottom: 12px;
            box-shadow: 0 4px 10px rgba(255,182,193,0.1); display: flex; gap: 12px;
            animation: lumiPop 0.4s ease-out; border: 1px solid #FFF0F3;
        }
        .lumi-post-avatar {
            width: 45px; height: 45px; border-radius: 50%; background: #FFE4E8;
            flex-shrink: 0; border: 2px solid #FFD1DC; overflow: hidden;
        }
        .lumi-post-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .lumi-post-content { flex: 1; }
        .lumi-post-author { font-weight: 500; color: #ff85a2; font-size: 14px; margin-bottom: 4px; }
        .lumi-post-text { font-size: 13px; color: #7a6e71; line-height: 1.5; }
        .lumi-post-time { font-size: 10px; color: #ffb6c1; margin-top: 8px; text-transform: uppercase; }
    `;
    document.head.appendChild(style);
}

// 🪄 ฟังก์ชันจำลองโพสต์ในฟอรั่ม
function renderForum() {
    const charName = SillyTavern.getContext().name2 || 'Someone';
    
    // ข้อมูลจำลอง (เดี๋ยวเฟสหน้าจะใช้ AI สร้างจริงๆ ค่ะ)
    const mockPosts = [
        { author: charName, text: "วันนี้บรรยากาศในมหาลัยดีจัง... มีเรื่องให้คิดนิดหน่อยแฮะ", time: "5 mins ago", isNPC: true },
        { author: "Gossip_Girl", text: "เห็นดาวคณะเดินอยู่กับเด็กปี 1 ที่สวนหลังมหาลัยด้วยล่ะ! ใครกันนะ?", time: "12 mins ago", isNPC: false },
        { author: "Admin_Lumi", text: "ยินดีต้อนรับสู่ฟอรั่ม LumiPulse! อย่าลืมรักษากฎระเบียบกันด้วยนะคะ", time: "1 hour ago", isNPC: false }
    ];

    let html = mockPosts.map(post => `
        <div class="lumi-forum-post">
            <div class="lumi-post-avatar">
                ${post.isNPC ? '<span style="font-size:24px; display:flex; justify-content:center; align-items:center; height:100%;">👤</span>' : '<span style="font-size:24px; display:flex; justify-content:center; align-items:center; height:100%;">🐱</span>'}
            </div>
            <div class="lumi-post-content">
                <div class="lumi-post-author">${post.author}</div>
                <div class="lumi-post-text">${post.text}</div>
                <div class="lumi-post-time">${post.time}</div>
            </div>
        </div>
    `).join('');

    $('#lumi-modal-body').html(html);
}

function openLumiModal(type) {
    $('.lumi-menu-container').fadeOut(200);
    $('#lumi-modal-overlay').css('display', 'flex').hide().fadeIn(300);
    
    if (type === 'forum') {
        $('#lumi-modal-title').text('University Forum');
        renderForum();
    } else {
        $('#lumi-modal-title').text('LumiPulse Hub');
        $('#lumi-modal-body').html('<div style="text-align:center; padding:50px; color:#ffb6c1;">Coming Soon... 🌸</div>');
    }
}

// --- ฟังก์ชันพื้นฐานเหมือนเดิม ---
function spawnHeartEffect(e) {
    const heart = document.createElement('div');
    heart.className = 'lumi-vector-heart'; heart.innerHTML = svgHeart;
    heart.style.left = e.clientX + 'px'; heart.style.top = e.clientY + 'px';
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
        <div style="margin-top:25px; font-size:12px; color:#ffb6c1; text-transform:uppercase; letter-spacing:4px; text-align:center; font-weight:300;">Lumipulse</div>
    `;
    document.body.appendChild(menu);

    let isDragging = false, offset = { x: 0, y: 0 };
    const updateMenuPos = () => {
        const rect = fab.getBoundingClientRect();
        const menuEl = $(menu);
        let left = rect.left - (menuEl.outerWidth() / 2) + (rect.width / 2);
        let top = rect.top - menuEl.outerHeight() - 35;
        if (left < 15) left = 15; if (left + menuEl.outerWidth() > window.innerWidth) left = window.innerWidth - menuEl.outerWidth() - 15;
        if (top < 15) top = rect.bottom + 35;
        menuEl.css({ left: left + 'px', top: top + 'px' });
    };

    fab.addEventListener('touchstart', (e) => { isDragging = false; fab.classList.remove('lumi-floating'); const t = e.touches[0]; offset.x = t.clientX - fab.getBoundingClientRect().left; offset.y = t.clientY - fab.getBoundingClientRect().top; });
    fab.addEventListener('touchmove', (e) => { isDragging = true; $(menu).fadeOut(200); const t = e.touches[0]; let x = Math.max(0, Math.min(t.clientX - offset.x, window.innerWidth - 50)); let y = Math.max(0, Math.min(t.clientY - offset.y, window.innerHeight - 50)); fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto'; }, { passive: false });
    fab.addEventListener('touchend', () => { if (!isDragging) { updateMenuPos(); $(menu).fadeToggle(400); } fab.classList.add('lumi-floating'); isDragging = false; });

    $(document).off('click', '#lumi-forum').on('click', '#lumi-forum', () => openLumiModal('forum'));
    $(document).off('click', '#lumi-diary').on('click', '#lumi-diary', () => openLumiModal('diary'));
    $(document).off('click', '#lumi-phone').on('click', '#lumi-phone', () => openLumiModal('phone'));
}

function createSettingsUI() {
    const html = `
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Mitr'; font-weight: 300;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div>
        <div class="inline-drawer-content">
            <label class="checkbox_label" style="font-family: 'Mitr'; font-weight: 300;"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label>
            <label class="checkbox_label" style="font-family: 'Mitr'; font-weight: 300;"><input id="lumi_external_npc_toggle" type="checkbox" /><span>อนุญาตให้ NPC สมมติโพสต์ในฟอรั่ม</span></label>
        </div>
    </div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        extension_settings[extensionName].isEnabled = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
        if (extension_settings[extensionName].isEnabled) { spawnLumiButton(); createContentModal(); } else { $('#lumi-main-fab, .lumi-menu-container, #lumi-modal-overlay').remove(); }
    });
    $('#lumi_external_npc_toggle').prop('checked', extension_settings[extensionName].allowExternalNPCs).on('change', function() {
        extension_settings[extensionName].allowExternalNPCs = $(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
}

function createContentModal() {
    if ($('#lumi-modal-overlay').length > 0) return;
    $('body').append(`<div id="lumi-modal-overlay" class="lumi-modal-overlay"><div class="lumi-modal-box"><div class="lumi-modal-header"><span id="lumi-modal-title"></span><div class="lumi-modal-close" onclick="$('#lumi-modal-overlay').fadeOut(250)">×</div></div><div id="lumi-modal-body" class="lumi-modal-body"></div></div></div>`);
         }
    
