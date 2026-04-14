"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { 
    isEnabled: false,
    fabPos: { top: '40%', right: '20px' } // เก็บตำแหน่งปุ่ม
};
let extension_settings = {};

// 1. สไตล์ปุ่มแบบ Vector & Y2K
const style = document.createElement('style');
style.innerHTML = `
    .lumi-fab {
        position: fixed !important;
        width: 60px !important;
        height: 60px !important;
        background: linear-gradient(135deg, #FFD1DC 0%, #FFB6C1 100%) !important;
        border: 3px solid #FFFFFF !important;
        border-radius: 50% !important;
        display: none;
        align-items: center !important;
        justify-content: center !important;
        z-index: 2147483647 !important;
        box-shadow: 0 4px 15px rgba(255, 182, 193, 0.8) !important;
        cursor: grab !important;
        touch-action: none !important; /* ป้องกันจอเลื่อนขณะลากปุ่ม */
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    }
    .lumi-fab.active { display: flex !important; }
    .lumi-fab:active { cursor: grabbing !important; transform: scale(0.9) !important; }
    .lumi-fab i { 
        color: white !important; 
        font-size: 24px !important; 
        text-shadow: 0 0 8px rgba(255,255,255,0.6) !important; 
    }
`;
document.head.appendChild(style);

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
        context.extensionSettings[extensionName] = JSON.parse(JSON.stringify(defaultSettings));
        context.saveSettingsDebounced();
    }
    extension_settings = context.extensionSettings;

    createSettingsUI();
    createFab();
}

function createSettingsUI() {
    const settingsHtml = `
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b style="color: #ff85a2;">🌸 LumiPulse Hub</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
        </div>
        <div class="inline-drawer-content">
            <label class="checkbox_label">
                <input id="lumi_enable_toggle" type="checkbox" />
                <span>เปิดใช้งาน LumiPulse</span>
            </label>
        </div>
    </div>`;

    $('#extensions_settings').append(settingsHtml);
    $('#lumi_enable_toggle')
        .prop('checked', extension_settings[extensionName].isEnabled)
        .on('change', function () {
            const enabled = $(this).prop('checked');
            extension_settings[extensionName].isEnabled = enabled;
            SillyTavern.getContext().saveSettingsDebounced();
            enabled ? $('#lumi-main-fab').addClass('active') : $('#lumi-main-fab').removeClass('active');
        });
}

function createFab() {
    if ($('#lumi-main-fab').length) return;

    const pos = extension_settings[extensionName].fabPos;
    const fab = $(`<div id="lumi-main-fab" class="lumi-fab ${extension_settings[extensionName].isEnabled ? 'active' : ''}">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
    </div>`);

    fab.css({ top: pos.top, right: pos.right });
    $('body').append(fab);

    // ระบบลากปุ่ม (Draggable)
    let isDragging = false;
    fab.on('touchstart mousedown', function(e) {
        isDragging = false;
        const startY = e.pageY || e.originalEvent.touches[0].pageY;
        const startX = e.pageX || e.originalEvent.touches[0].pageX;
        const offset = fab.offset();

        $(document).on('touchmove mousemove', function(me) {
            isDragging = true;
            const moveY = me.pageY || me.originalEvent.touches[0].pageY;
            const moveX = me.pageX || me.originalEvent.touches[0].pageX;
            
            const newTop = moveY - (fab.height() / 2);
            const newRight = $(window).width() - moveX - (fab.width() / 2);

            fab.css({ top: newTop, right: newRight, left: 'auto' });
        });
    });

    $(document).on('touchend mouseup', function() {
        if (isDragging) {
            // เซฟตำแหน่งหลังลากเสร็จ
            extension_settings[extensionName].fabPos = {
                top: fab.css('top'),
                right: fab.css('right')
            };
            SillyTavern.getContext().saveSettingsDebounced();
        }
        $(document).off('touchmove mousemove');
    });

    fab.on('click', function(e) {
        if (!isDragging) {
            toastr.success("🌸 ยินดีต้อนรับสู่ LumiPulse Hub ค่ะ!");
        }
    });
}
