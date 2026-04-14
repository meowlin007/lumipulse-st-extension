"use strict";

// ใช้เส้นทาง Import ตามแบบ RPG Companion เป๊ะๆ
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

// เตรียมข้อมูล Settings
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = defaultSettings;
}

// ฟังก์ชันโหลดหน้าจอตั้งค่า
async function loadSettings() {
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    // เชื่อมต่อ Checkbox
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);
    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

// *** จุดสำคัญ ***: ห้ามใส่ใน $(document).ready
// ต้องเรียกใช้ทันทีเพื่อให้ระบบ SillyTavern ตรวจพบ Extension ของเรา
registerExtension(extensionName, loadSettings);
