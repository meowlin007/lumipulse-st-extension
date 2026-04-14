"use strict";

// ถอยกลับ 3 ก้าวเพื่อดึงตัวแปรระบบหลัก
import {
    extension_settings,
    renderTemplateAsync,
    saveSettingsDebounced
} from "../../../extensions.js";

// ถอยกลับ 2 ก้าวเพื่อลงทะเบียน Extension
import { registerExtension } from "../../extensions.js";

const extensionName = "lumipulse-st-extension";
const defaultSettings = {
    isEnabled: false,
};

// ฟังก์ชันสำหรับโหลดหน้าจอตั้งค่าในเมนู Extensions
async function loadSettings() {
    // โหลดไฟล์ settings.html มาแสดงผล
    const html = await renderTemplateAsync(extensionName, "settings.html");
    const $settingsPage = $(html);

    // ตรวจสอบและตั้งค่า Checkbox ตามจริง
    $settingsPage.find('#lumi-enable-toggle').prop('checked', extension_settings[extensionName].isEnabled);

    // ดักจับการคลิกเปิด-ปิด
    $settingsPage.find('#lumi-enable-toggle').on('change', function () {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });

    return $settingsPage;
}

// เตรียมพื้นที่เก็บข้อมูลถ้ายังไม่มี
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = defaultSettings;
}

// *** จุดสำคัญ ***: เรียกใช้ทันทีเพื่อให้ระบบ ST ตรวจพบ
registerExtension(extensionName, loadSettings);

console.log("💖 LumiPulse: Registered Successfully!");
