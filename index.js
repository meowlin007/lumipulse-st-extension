"use strict";

// รวมการ Import ไว้ที่จุดเดียวและใช้ ../../ ให้ถูกต้อง
import {
    extension_settings,
    renderTemplateAsync,
    saveSettingsDebounced,
    registerExtension
} from "../../extensions.js";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
};

// ฟังก์ชันโหลดหน้าจอตั้งค่า
async function loadSettings() {
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    // ตรวจสอบสถานะ Checkbox
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);

    // บันทึกค่าเมื่อมีการเปลี่ยนแปลง
    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

// เตรียมพื้นที่เก็บข้อมูลในระบบ
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = defaultSettings;
}

// ลงทะเบียนกับระบบทันที
registerExtension(extensionName, loadSettings);

console.log("💖 LumiPulse: Registered Successfully!");
