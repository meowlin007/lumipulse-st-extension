"use strict";

const extensionName = "lumipulse-st-extension";
let extension_settings = {};
const btnUrl = "https://file.garden/ad59q6JMmVnp7v1-/lumi-fab-icon.png";

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
        context.extensionSettings[extensionName] = { isEnabled: false };
        context.saveSettingsDebounced();
    }
    extension_settings = context.extensionSettings;
    injectStyles();
    createSettingsUI();
    createHubUI();
    if (extension_settings[extensionName].isEnabled) spawnLumiButton();
}

function injectStyles() {
    if ($('#lumi-styles').length > 0) return;
    const style = document.createElement('style');
    style.id = 'lumi-styles';
    style.innerHTML = `
        @keyframes lumiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .lumi-floating { animation: lumiFloat 3s ease-in-out infinite; }
        
        /* แอนิเมชันสำหรับเมนูสไลด์ลง */
        @keyframes lumiSlideDown {
            0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ปรับปรุงหน้าต่าง Hub ให้เรียบแต่คิวท์ */
        #lumi-hub-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(2px);
            z-index: 2147483646; display: none;
        }
        .lumi-hub-window {
            position: fixed; width: 220px; background: rgba(255, 245, 247, 0.95); 
            border: 2px solid #FFD1DC; border-radius: 15px; padding: 10px;
            box-shadow: 0 5px 15px rgba(255, 182, 193, 0.2);
            text-align: center; z-index: 2147483647;
            animation: lumiSlideDown 0.3s ease-out forwards; /* ใส่แอนิเมชันเปิด */
        }
        
        .lumi-hub-header { color: #ff85a2; font-weight: bold; font-size: 16px; margin-bottom: 10px; font-family: 'Courier New', Courier, monospace; }
        
        /* ปรับ Menu Grid ให้เป็น List เรียงลงมา */
        .lumi-menu-list { display: flex; flex-direction: column; gap: 6px; }
        .lumi-menu-item {
            background: white; border: 1.5px solid #FFD1DC; padding: 8px;
            border-radius: 10px; cursor: pointer; transition: all 0.2s; 
            color: #ff85a2; font-size: 14px; display: flex; align-items: center; gap: 8px;
            font-family: 'Courier New', Courier, monospace;
        }
        .lumi-menu-item:hover { background: #FFF0F5; border-color: #FFB6C1; transform: translateX(3px); }
        .lumi-menu-item i { font-size: 18px; width: 20px; text-align: center; }
        
        /* ปรับปุ่มปิดให้มินิมอล */
        .lumi-close-btn { 
            position: absolute; top: 5px; right: 5px; width: 20px; height: 20px;
            color: #FFD1DC; display: flex; align-items: center; justify-content: center; 
            cursor: pointer; font-size: 18px; transition: color 0.2s;
        }
        .lumi-close-btn:hover { color: #FF85A2; }
    `;
    document.head.appendChild(style);
}

function createHubUI() {
    if ($('#lumi-hub-overlay').length > 0) return;
    const html = `
        <div id="lumi-hub-overlay" onclick="if(event.target.id === 'lumi-hub-overlay') $('#lumi-hub-overlay').fadeOut(200)">
            <div id="lumi-hub-window" class="lumi-hub-window">
                <div class="lumi-close-btn" onclick="$('#lumi-hub-overlay').fadeOut(200)">×</div>
                <div class="lumi-hub-header">:: LumiPulse ::</div>
                <div class="lumi-menu-list">
                    <div class="lumi-menu-item" onclick="toastr.info('Diary Soon!')"><i class="fa-solid fa-book-heart"></i>Diary</div>
                    <div class="lumi-menu-item" onclick="toastr.info('Phone Soon!')"><i class="fa-solid fa-mobile-retro"></i>Phone</div>
                    <div class="lumi-menu-item" onclick="toastr.info('Forum Soon!')"><i class="fa-solid fa-users-rectangle"></i>Forum</div>
                </div>
            </div>
        </div>`;
    $('body').append(html);
}

function spawnLumiButton() {
    $('#lumi-main-fab').remove();
    const fab = document.createElement('div');
    fab.id = 'lumi-main-fab';
    fab.className = 'lumi-floating';
    fab.style.cssText = `
        position: fixed !important; top: 45% !important; right: 15px !important;
        width: 55px !important; height: 55px !important;
        background: url('${btnUrl}') no-repeat center !important;
        background-size: contain !important; z-index: 2147483647 !important;
        cursor: move !important; touch-action: none !important;
        filter: drop-shadow(0 3px 5px rgba(0,0,0,0.1)) !important;
        transition: transform 0.1s ease; /* สำหรับเอฟเฟกต์ตอนกด */
    `;
    document.body.appendChild(fab);

    let isDragging = false, offset = { x: 0, y: 0 };

    fab.addEventListener('touchstart', (e) => {
        isDragging = false; fab.classList.remove('lumi-floating');
        fab.style.transform = 'scale(0.95)'; // หดตัวนิดนึงตอนแตะ
        const t = e.touches[0];
        offset.x = t.clientX - fab.getBoundingClientRect().left;
        offset.y = t.clientY - fab.getBoundingClientRect().top;
    }, { passive: true });

    fab.addEventListener('touchmove', (e) => {
        isDragging = true; const t = e.touches[0];
        let x = t.clientX - offset.x, y = t.clientY - offset.y;
        x = Math.max(0, Math.min(x, window.innerWidth - 55));
        y = Math.max(0, Math.min(y, window.innerHeight - 55));
        fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto';
    }, { passive: false });

    fab.addEventListener('touchend', () => {
        fab.style.transform = 'scale(1)'; // กลับมาขนาดเดิม
        if (!isDragging) {
            // คำนวณตำแหน่ง Hub ให้เด้งลงมาจากปุ่ม
            const rect = fab.getBoundingClientRect();
            const hub = $('#lumi-hub-window');
            const hubWidth = 220;
            
            let hubX = rect.left + (rect.width / 2) - (hubWidth / 2); // จัดกึ่งกลางปุ่ม
            let hubY = rect.bottom + 10;  // เด้งลงด้านล่างปุ่ม

            // ป้องกันไม่ให้เมนูทะลุขอบจอ
            if (hubX < 10) hubX = 10;
            if (hubX + hubWidth > window.innerWidth) hubX = window.innerWidth - hubWidth - 10;
            if (hubY + 180 > window.innerHeight) hubY = rect.top - 190; // ถ้าข้างล่างไม่มีที่ ให้เด้งขึ้นข้างบนแทน

            hub.css({ left: hubX + 'px', top: hubY + 'px' });
            $('#lumi-hub-overlay').fadeIn(100); // FadeIn เร็วขึ้นเพื่อให้ดูสมูธกับแอนิเมชันสไลด์
        }
        fab.classList.add('lumi-floating');
        isDragging = false;
    });
}

// createSettingsUI ยังคงเดิม
function createSettingsUI() {
    const html = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b style="color: #ff85a2; font-family: 'Courier New', Courier, monospace;">🌸 LumiPulse Hub</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div></div><div class="inline-drawer-content"><label class="checkbox_label"><input id="lumi_enable_toggle" type="checkbox" /><span>เปิดใช้งาน LumiPulse</span></label></div></div>`;
    $('#extensions_settings').append(html);
    $('#lumi_enable_toggle').prop('checked', extension_settings[extensionName].isEnabled).on('change', function() {
        const enabled = $(this).prop('checked');
        extension_settings[extensionName].isEnabled = enabled;
        SillyTavern.getContext().saveSettingsDebounced();
        if (enabled) spawnLumiButton(); else { $('#lumi-main-fab').remove(); $('#lumi-hub-overlay').hide(); }
    });
}
