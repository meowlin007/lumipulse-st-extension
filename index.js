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

// ฟังก์ชันโหลดหน้าตั้งค่า (Settings UI)
async function loadSettings() {
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    // ตรวจสอบสถานะ Checkbox
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);
    
    // ตั้งค่าการบันทึกเมื่อกดติ๊กถูก
    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

// จุดเริ่มต้นการทำงานของสคริปต์
$(document).ready(async () => {
    // เตรียมพื้นที่เก็บข้อมูลในระบบ SillyTavern
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = defaultSettings;
    }

    // ลงทะเบียน Extension เข้าสู่ระบบหลัก
    registerExtension(extensionName, loadSettings);
    
    console.log("🌸 LumiPulse: Registered Successfully!");
});

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
