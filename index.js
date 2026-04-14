// นำเข้าตัวแปรหลักจากระบบ SillyTavern
import { extension_settings, saveSettingsDebounced } from '../../../extensions.js';
import { registerExtension } from '../../extensions.js';

// แก้ตรงนี้ครับ! ต้องตรงกับชื่อ Folder ใน GitHub ของคุณเป๊ะๆ
const extensionName = "lumipulse-st-extension"; 

const defaultSettings = {
    isEnabled: false, 
};

function loadSettings() {
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = defaultSettings;
    }
}

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
