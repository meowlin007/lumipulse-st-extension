"use strict";

const extensionName = "lumipulse-st-extension";
const defaultSettings = { isEnabled: false };
let extension_settings = {};

jQuery(async () => {
    const checkInterval = setInterval(() => {
        if (window.SillyTavern && window.SillyTavern.getContext().extensionSettings) {
            clearInterval(checkInterval);
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

    createSettingsUI();
    toggleLumiFab(extension_settings[extensionName].isEnabled);
}

function createSettingsUI() {
    const settingsHtml = `
    <div class="lumipulse-settings-panel">
        <div class="inline-drawer">
            <div class="inline-drawer-header inline-drawer-toggle">
                <b>🌸 LumiPulse: Configuration</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="lumi-enable-toggle">
                    <span>Enable LumiPulse Hub</span>
                </label>
            </div>
        </div>
    </div>`;

    $('#extensions_settings').append(settingsHtml);

    $('#lumi-enable-toggle')
        .prop('checked', extension_settings[extensionName].isEnabled)
        .on('change', function () {
            const isChecked = $(this).prop('checked');
            extension_settings[extensionName].isEnabled = isChecked;
            SillyTavern.getContext().saveSettingsDebounced();
            toggleLumiFab(isChecked);
        });
}

function toggleLumiFab(isEnabled) {
    $('#lumi-main-fab').remove();
    
    if (isEnabled) {
        const fabHtml = `
            <div id="lumi-main-fab" class="lumi-fab">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>`;
        $('body').append(fabHtml);
        
        $('#lumi-main-fab').on('click', () => {
            toastr.info('LumiPulse Hub is coming soon! ✨');
        });
    }
}
