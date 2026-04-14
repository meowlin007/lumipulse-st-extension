"use strict";

import { 
    renderExtensionTemplateAsync, 
    extension_settings 
} from "../../../extensions.js";

import { 
    saveSettingsDebounced, 
    registerExtension 
} from "../../extensions.js"; 

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
};

// ตรวจสอบข้อมูลเริ่มต้น
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = defaultSettings;
}

async function loadSettings() {
    // ใช้ renderExtensionTemplateAsync ตามต้นฉบับ
    const html = await renderExtensionTemplateAsync(extensionName, "settings");
    const $settingsPage = $(html);

    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);

    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

// ลงทะเบียนเข้าสู่ระบบ
registerExtension(extensionName, loadSettings);

console.log("💖 LumiPulse: Registered Successfully using RPG pattern!");
