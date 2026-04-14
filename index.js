"use strict";

import { 
    extension_settings, 
    renderTemplateAsync, 
    saveSettingsDebounced 
} from "../../extensions.js";
import { registerExtension } from "../../extensions.js";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
};

// ฟังก์ชันนี้จะถูกเรียกเมื่อ SillyTavern พยายามวาดหน้าจอ Extension
async function loadSettings() {
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    // เชื่อมต่อปุ่ม Checkbox กับระบบ Save
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);
    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
        console.log("LumiPulse Status:", extension_settings[extensionName].isEnabled);
    });

    return $settingsPage;
}

// จุดเริ่มต้นของ Extension
$(document).ready(async () => {
    // เตรียมที่เก็บข้อมูลถ้ายังไม่มี
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = defaultSettings;
    }

    // ลงทะเบียนกับระบบหลัก
    registerExtension(extensionName, loadSettings);
    console.log("🌸 LumiPulse: Extension Registered Successfully!");
});
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = defaultSettings;
    }

    // จดทะเบียน Extension
    registerExtension(extensionName, loadSettings);
    
    console.log("🌸 LumiPulse: ระบบเสถียรพร้อมทำงานแบบ RPG Companion แล้ว!");
});

    // ใช้การดักจับ Event แบบนิ่งๆ
    $(document).off('change', '#lumi-enable-toggle').on('change', '#lumi-enable-toggle', function() {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return settingsHtml;
}

$(document).ready(function () {
    loadSettings();
    registerExtension(extensionName, onSettingsClick);
    console.log("🌸 LumiPulse Extension Registered!");
});
