// ฟังก์ชันสำหรับเปิด/ปิดเมนู
function toggleLumiMenu() {
    const panel = document.getElementById('lumi-main-panel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

// สร้าง UI ลงในหน้าจอ SillyTavern
async function initLumiPulse() {
    // 1. สร้างปุ่ม FAB
    const fab = document.createElement('div');
    fab.className = 'lumi-fab';
    fab.innerHTML = '✨'; // ไอคอนเริ่มต้น
    fab.onclick = toggleLumiMenu;
    document.body.appendChild(fab);

    // 2. สร้างหน้าต่างเมนู (รอใส่ฟีเจอร์ Phone/Forum/Memory)
    const panel = document.createElement('div');
    panel.id = 'lumi-main-panel';
    panel.className = 'lumi-panel';
    panel.innerHTML = `
        <h3 style="color: #FF85A2; margin-top:0;">🌸 LumiPulse Hub</h3>
        <hr style="border: 1px solid #FFD1DC;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button style="background: #FFD1DC; border:none; border-radius:10px; padding:10px;">📱 Character's Phone</button>
            <button style="background: #FFD1DC; border:none; border-radius:10px; padding:10px;">🌐 Social Forum</button>
            <button style="background: #FFD1DC; border:none; border-radius:10px; padding:10px;">📖 Memory Diary</button>
        </div>
    `;
    document.body.appendChild(panel);
}

// สั่งให้ทำงานเมื่อเปิด Extension
initLumiPulse();
