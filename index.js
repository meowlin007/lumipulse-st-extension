"use strict";

// ดึงตัวแปรจากระบบ SillyTavern (เลียนแบบ RPG Companion)
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

// ฟังก์ชันโหลด HTML หน้าตั้งค่า
async function loadSettings() {
    // โหลดไฟล์ settings.html มาแสดงผล
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    // ตั้งค่าปุ่ม Toggle ให้ตรงกับความจริง
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);

    // เมื่อกดติ๊กถูก
    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

// ฟังก์ชันเริ่มต้นทำงาน (เลียนแบบโครงสร้าง RPG Companion)
$(document).ready(async () => {
    // ตรวจสอบว่ามีที่เก็บ Settings หรือยัง
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
