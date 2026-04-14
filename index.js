"use strict";

import { 
    extension_settings, 
    renderTemplateAsync, 
    saveSettingsDebounced 
} from "../../../extensions.js";

import { registerExtension } from "../../extensions.js";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
};

// ตรวจสอบว่ามีที่เก็บข้อมูลหรือยัง
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = defaultSettings;
}

// ฟังก์ชันโหลดหน้าจอตั้งค่า
async function loadSettings() {
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    // เชื่อมปุ่มติ๊กถูก
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);
    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

// ลงทะเบียนทันที (ไม่ต้องมี $(document).ready ครอบ)
registerExtension(extensionName, loadSettings);
