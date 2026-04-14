// นำเข้าตัวแปรหลักจากระบบ SillyTavern
import { extension_settings, saveSettingsDebounced } from '../../../extensions.js';
import { registerExtension } from '../../extensions.js';

const extensionName = "lumipulse"; // ชื่อโฟลเดอร์ extension ของคุณ
const defaultSettings = {
    isEnabled: false, // สถานะเริ่มต้น (ปิดไว้ก่อน)
};

// ฟังก์ชันสำหรับโหลดการตั้งค่า
function loadSettings() {
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = defaultSettings;
    }
}

// ฟังก์ชันสร้างหน้าจอเมนูในแถบ Extension
function onSettingsClick() {
    const settingsHtml = `
        <div class="lumipulse-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-content">
                    <div class="flex-container">
                        <label class="checkbox_label">
                            <input type="checkbox" id="lumi-enable-toggle" ${extension_settings[extensionName].isEnabled ? 'checked' : ''}>
                            Enable LumiPulse
                        </label>
                    </div>
                    <p style="font-size: 0.8em; color: #999;">
                        🌸 ระบบจังหวะแสงแห่งความทรงจำและโซเชียลจำลอง
                    </p>
                    <hr>
                    </div>
            </div>
        </div>
    `;

    // สั่งให้ปุ่ม Toggle ทำงานเวลาคนมากด
    $(document).on('change', '#lumi-enable-toggle', function() {
        extension_settings[extensionName].isEnabled = !!$(this).prop('checked');
        saveSettingsDebounced();
        alert(extension_settings[extensionName].isEnabled ? 'LumiPulse เปิดใช้งานแล้ว!' : 'LumiPulse ปิดการใช้งาน');
    });

    return settingsHtml;
}

// ฟังก์ชันเริ่มต้น (รันทันทีที่ ST โหลด)
$(document).ready(function () {
    loadSettings();
    
    // จดทะเบียน Extension เข้ากับระบบของ SillyTavern
    registerExtension(extensionName, onSettingsClick);
    
    console.log("🌸 LumiPulse Extension Registered!");
});
