"use strict";

// ใช้เส้นทางถอยหลัง 2 ก้าว (../../) ให้เหมือนกันทั้งหมดตามมาตรฐาน ST
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

// ฟังก์ชันโหลดหน้าจอตั้งค่าในเมนู Extensions
async function loadSettings() {
    [span_3](start_span)// โหลดไฟล์ settings.html มาแสดงผล[span_3](end_span)
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    [span_4](start_span)[span_5](start_span)// เชื่อมต่อ Checkbox กับสถานะการเปิด-ปิดในระบบ[span_4](end_span)[span_5](end_span)
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);

    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

[span_6](start_span)[span_7](start_span)// ตรวจสอบพื้นที่เก็บข้อมูลในระบบ SillyTavern[span_6](end_span)[span_7](end_span)
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = defaultSettings;
}

[span_8](start_span)[span_9](start_span)// ลงทะเบียน Extension ทันทีเพื่อให้ระบบตรวจพบ (ห้ามใส่ใน document.ready)[span_8](end_span)[span_9](end_span)
registerExtension(extensionName, loadSettings);

console.log("💖 LumiPulse: Registered Successfully!");
