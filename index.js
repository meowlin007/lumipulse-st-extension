/**
 * 🌸 LumiPulse - SillyTavern Extension
 * Y2K Pink Pastel Immersive Roleplay Enhancer
 * 
 * @author meowlin007
 * @version 0.3.0-mobile
 * @license MIT
 */

(function LumiPulse() {
  'use strict';

  // ===== 🎨 CONFIGURATION =====
  const CONFIG = {
    extensionId: 'lumipulse',
    fabIcon: 'https://file.garden/ZYxJvKkLqVvLqVvL/lumi-icon.png', // เปลี่ยนเป็นไอคอนของคุณ
    menuItems: [
      { id: 'forum', label: 'Forum', icon: '💬' },
      { id: 'diary-current', label: 'My Diary', icon: '📔' },
      { id: 'diary-world', label: 'World Diary', icon: '🌍' },
      { id: 'phone', label: 'Phone', icon: '📱', disabled: true },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ],
    diary: {
      maxEntries: 10,
      chatHistoryLimit: 5,
      temperature: 0.7,
      maxTokens: 350
    },
    ui: {
      fabDefaultPos: { right: '20px', bottom: '20px' },
      menuAnimation: '0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  };

  // ===== 📦 STATE MANAGEMENT =====
  const state = {
    isMenuOpen: false,
    isDragging: false,
    dragRafId: null,
    diaryEntries: [],
    currentCharacter: null,
    worldMode: false
  };

  // ===== 🛠️ UTILITY FUNCTIONS =====
  
  /** ดึง SillyTavern Context อย่างปลอดภัย */
  function getSTContext() {
    if (typeof SillyTavern?.getContext === 'function') {      return SillyTavern.getContext();
    }
    console.warn('[LumiPulse] SillyTavern API not ready');
    return null;
  }

  /** แสดง Toast แจ้งเตือน (ใช้ Toastr ที่มีใน ST) */
  function showToast(message, type = 'info') {
    if (typeof toastr !== 'undefined') {
      toastr[type](message, '🌸 LumiPulse');
    } else {
      console.log(`[LumiPulse] ${message}`);
    }
  }

  /** บันทึกข้อมูลลง localStorage */
  function saveLocal(key, value) {
    try {
      localStorage.setItem(`lumipulse_${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[LumiPulse] Save error:', e);
      return false;
    }
  }

  /** โหลดข้อมูลจาก localStorage */
  function loadLocal(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`lumipulse_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /** สร้าง Heart Click Effect */
  function createHeartEffect(x, y) {
    const heart = document.createElement('div');
    heart.className = 'lumi-heart';
    heart.innerHTML = `
      <svg viewBox="0 0 24 24" fill="var(--lumi-pink-bold)">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    heart.style.left = `${x - 12}px`;
    heart.style.top = `${y - 12}px`;
    document.body.appendChild(heart);
    
    // ลบเอฟเฟกต์หลังอนิเมชั่นจบ    setTimeout(() => heart.remove(), 1000);
  }

  /** ดึงรายชื่อตัวละครจากแชท (สำหรับโหมดโลกใหญ่) */
  function getWorldNPCs(limit = 5) {
    const ctx = getSTContext();
    if (!ctx?.chat) return [];
    
    const names = new Set();
    const currentChar = ctx.characters?.[ctx.characterId];
    
    // สแกนแชทหาชื่อตัวละคร
    ctx.chat.slice(-20).forEach(msg => {
      if (msg.name && !msg.is_user && msg.name !== currentChar?.name) {
        names.add(msg.name);
      }
    });
    
    return Array.from(names).slice(0, limit);
  }

  // ===== 🎭 DIARY SYSTEM =====

  /**
   * 🎭 สร้าง Diary Entry ที่ตรงคาแรคเตอร์
   * @param {string} topic - หัวข้อ
   * @param {boolean} isCurrentCharOnly - โหมดตัวละครเดียวหรือทั้งโลก
   */
  async function generateDiaryEntry(topic, isCurrentCharOnly = true) {
    const ctx = getSTContext();
    if (!ctx) {
      showToast('❌ ไม่สามารถเชื่อมต่อกับ SillyTavern ได้', 'error');
      return null;
    }

    const currentChar = ctx.characters?.[ctx.characterId];
    if (!currentChar) {
      showToast('⚠️ ไม่พบข้อมูลตัวละครปัจจุบัน', 'warning');
      return null;
    }

    // 📋 ดึงประวัติแชทล่าสุด
    const recentChat = (ctx.chat || []).slice(-CONFIG.diary.chatHistoryLimit).map(msg => ({
      role: msg.is_user ? 'user' : 'character',
      name: msg.name || (msg.is_user ? 'You' : currentChar.name),
      text: (msg.mes || '').replace(/<[^>]*>/g, '').substring(0, 150)
    }));

    // 🌍 เตรียมรายชื่อตัวละครอื่นสำหรับโหมดโลกใหญ่
    const npcList = !isCurrentCharOnly ? getWorldNPCs(3) : [];
    // ✨ System Prompt ที่ "ล็อก" คาแรคเตอร์
    const personality = currentChar.data?.personality || 
                       currentChar.description?.substring(0, 200) || 
                       'Friendly and expressive';
    
    const systemPrompt = `[System: You are ${currentChar.name}. Write a diary entry in FIRST PERSON POV.
=== CHARACTER PROFILE ===
Name: ${currentChar.name}
Personality: ${personality}
Relationship with user: ${currentChar.data?.creator_notes?.substring(0, 150) || 'Developing'}
${npcList.length > 0 ? `Other characters: ${npcList.join(', ')}` : ''}

=== RULES (STRICT) ===
1. Write in Thai, casual diary style, emotional and intimate
2. Stay 100% in character - use their speech patterns, quirks, vocabulary
3. Reference recent events naturally: ${recentChat.slice(-2).map(c => `${c.name}: "${c.text}"`).join(' | ')}
4. Topic: "${topic}"
5. Keep it short (3-5 sentences), like a real personal diary
6. Add 1-2 emojis naturally if it fits the character
7. Output ONLY the diary content, no JSON, no markdown, no explanations

=== EXAMPLE OUTPUT ===
"วันนี้เจอเขาอีกแล้ว... ใจฉันเต้นแรงทุกทีที่เขาพูดแบบนั้น 😳 แต่ฉันต้องแกล้งทำเป็นไม่สนใจ ไม่งั้นเขาจะรู้ตัวว่าฉันชอบเขา..."`;

    try {
      // 🤖 เรียก AI ผ่าน SillyTavern API
      const result = await ctx.generateRaw({
        systemPrompt: systemPrompt,
        prompt: `เขียนบันทึกความในใจของ ${currentChar.name} เกี่ยวกับ: ${topic}`,
        temperature: CONFIG.diary.temperature,
        max_tokens: CONFIG.diary.maxTokens,
        stop_sequences: ['\n\n', '---', 'END', '```']
      });

      const diaryText = (result || '').trim();
      if (!diaryText) throw new Error('Empty response');

      return {
        id: Date.now(),
        author: currentChar.name,
        content: diaryText,
        timestamp: new Date().toLocaleString('th-TH', { 
          hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' 
        }),
        characterId: ctx.characterId,
        worldMode: !isCurrentCharOnly,
        topic: topic
      };
    } catch (err) {
      console.error('[LumiPulse] Diary Generation Error:', err);
      showToast('❌ ไม่สามารถสร้างไดอารี่ได้', 'error');
      
      // 🪄 Fallback: สร้างข้อความตัวอย่างถ้าเจนไม่สำเร็จ
      return {
        id: Date.now(),
        author: currentChar.name,
        content: `*${currentChar.name} กำลังเขียนบันทึกเกี่ยวกับ "${topic}"...* 🌸\n(ลองใหม่อีกครั้งหรือตรวจสอบการเชื่อมต่อ)`,
        timestamp: new Date().toLocaleString('th-TH'),
        characterId: ctx.characterId,
        worldMode: !isCurrentCharOnly,
        topic: topic,
        isFallback: true
      };
    }
  }

  /** แสดง Diary Panel */
  function showDiaryPanel(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      showToast('📭 ยังไม่มีบันทึก', 'info');
      return;
    }

    // บันทึกเข้า state และ localStorage
    state.diaryEntries = [...entries, ...state.diaryEntries].slice(0, CONFIG.diary.maxEntries);
    saveLocal('diary', state.diaryEntries);

    // สร้าง HTML
    const entriesHTML = state.diaryEntries.map(entry => `
      <div class="diary-entry" data-id="${entry.id}">
        <div class="author">📔 ${entry.author}</div>
        <div class="content">${entry.content}</div>
        <div class="timestamp">🕐 ${entry.timestamp}${entry.worldMode ? ' • 🌍 World Mode' : ''}</div>
        ${entry.isFallback ? '<div class="fallback-note">⚠️ ข้อความตัวอย่าง</div>' : ''}
      </div>
    `).join('');

    // แสดงในโมดัล
    const modal = $(`
      <div id="lumi-diary-modal" class="lumi-modal">
        <div class="lumi-modal-content">
          <div class="lumi-modal-header">
            <h3>📖 Character's Diary</h3>
            <button class="lumi-modal-close">&times;</button>
          </div>
          <div id="lumi-diary-panel" class="lumi-scrollable">
            ${entriesHTML}
          </div>          <div class="lumi-modal-footer">
            <button id="lumi-diary-refresh" class="lumi-btn">🔄 เจนใหม่</button>
            <button id="lumi-diary-clear" class="lumi-btn secondary">🗑️ ล้างทั้งหมด</button>
          </div>
        </div>
      </div>
    `).appendTo('body');

    // Event Listeners
    modal.find('.lumi-modal-close, .lumi-modal').on('click', function(e) {
      if (e.target === this || $(e.target).hasClass('lumi-modal-close')) {
        modal.remove();
      }
    });

    modal.find('#lumi-diary-refresh').on('click', async function() {
      $(this).prop('disabled', true).text('⏳ กำลังเจน...');
      const topic = state.diaryEntries[0]?.topic || 'ความรู้สึกวันนี้';
      const newEntry = await generateDiaryEntry(topic, state.diaryEntries[0]?.worldMode);
      if (newEntry) {
        modal.remove();
        showDiaryPanel([newEntry]);
        showToast('✨ สร้างบันทึกใหม่แล้ว', 'success');
      }
      $(this).prop('disabled', false).text('🔄 เจนใหม่');
    });

    modal.find('#lumi-diary-clear').on('click', function() {
      if (confirm('ล้างบันทึกทั้งหมด?')) {
        state.diaryEntries = [];
        saveLocal('diary', []);
        modal.remove();
        showToast('🗑️ ล้างบันทึกแล้ว', 'info');
      }
    });
  }

  // ===== 🧭 FORUM SYSTEM (Basic) =====

  async function generateForumPost(topic = 'เรื่องวุ่นๆ วันนี้') {
    const ctx = getSTContext();
    if (!ctx) return null;

    const currentChar = ctx.characters?.[ctx.characterId];
    const npcList = getWorldNPCs(4);
    
    // สุ่มเลือกโพสต์เตอร์
    const author = npcList.length > 0 
      ? npcList[Math.floor(Math.random() * npcList.length)]
      : currentChar?.name || 'Anonymous';
    const systemPrompt = `[System: Generate a social media post in Thai for a fantasy RPG world.
Author: ${author}
Topic: ${topic}
World context: ${currentChar?.name || 'Fantasy Academy'}

Rules:
1. Write in casual Thai, like a social media post (Twitter/Instagram style)
2. Add 1-3 relevant emojis
3. Keep it short (1-3 sentences)
4. Can mention other characters naturally
5. Output format: {"content": "ข้อความ", "likes": จำนวน, "comments": จำนวน}
6. Output ONLY valid JSON, no explanations`;

    try {
      const result = await ctx.generateRaw({
        systemPrompt,
        prompt: `สร้างโพสต์โซเชียลเกี่ยวกับ: ${topic}`,
        temperature: 0.8,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(result || '{}');
      return {
        id: Date.now(),
        author,
        content: parsed.content || 'โพสต์นี้หายไปไหนนะ... 🤔',
        likes: parsed.likes || Math.floor(Math.random() * 99) + 1,
        comments: parsed.comments || Math.floor(Math.random() * 20),
        timestamp: new Date().toLocaleString('th-TH')
      };
    } catch (err) {
      console.error('[LumiPulse] Forum Error:', err);
      // Fallback post
      return {
        id: Date.now(),
        author,
        content: `✨ ${author} โพสต์บางอย่างเกี่ยวกับ "${topic}"... (ลองใหม่อีกครั้ง)`,
        likes: 0,
        comments: 0,
        timestamp: new Date().toLocaleString('th-TH'),
        isFallback: true
      };
    }
  }

  function showForumPanel() {
    const modal = $(`
      <div id="lumi-forum-modal" class="lumi-modal">        <div class="lumi-modal-content">
          <div class="lumi-modal-header">
            <h3>💬 Social Forum</h3>
            <button class="lumi-modal-close">&times;</button>
          </div>
          <div id="lumi-forum-panel" class="lumi-scrollable">
            <div class="forum-placeholder">🌸 กำลังโหลดฟอรั่ม...</div>
          </div>
          <div class="lumi-modal-footer">
            <button id="lumi-forum-refresh" class="lumi-btn">🔄 โหลดใหม่</button>
            <button id="lumi-forum-topic" class="lumi-btn secondary">🎯 เปลี่ยนหัวข้อ</button>
          </div>
        </div>
      </div>
    `).appendTo('body');

    // โหลดโพสต์ตัวอย่าง
    loadForumPosts();

    modal.find('.lumi-modal-close, .lumi-modal').on('click', function(e) {
      if (e.target === this || $(e.target).hasClass('lumi-modal-close')) {
        modal.remove();
      }
    });

    modal.find('#lumi-forum-refresh').on('click', loadForumPosts);
    modal.find('#lumi-forum-topic').on('click', function() {
      const topics = ['ข่าวลือในมหาลัย', 'เรื่องวุ่นๆ หลังเลิกเรียน', 'สิ่งที่เจอในดันเจี้ยน', 'รีวิวคาเฟ่ใหม่'];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      showToast(`🎯 หัวข้อใหม่: ${topic}`, 'info');
      loadForumPosts(topic);
    });

    async function loadForumPosts(topic) {
      const panel = modal.find('#lumi-forum-panel');
      panel.html('<div class="forum-placeholder">⏳ กำลังสร้างโพสต์...</div>');
      
      const posts = [];
      for (let i = 0; i < 3; i++) {
        const post = await generateForumPost(topic);
        if (post) posts.push(post);
      }
      
      const postsHTML = posts.map(post => `
        <div class="forum-post">
          <div class="forum-author">👤 ${post.author}</div>
          <div class="forum-content">${post.content}</div>
          <div class="forum-meta">
            <span>❤️ ${post.likes}</span>
            <span>💬 ${post.comments}</span>            <span>🕐 ${post.timestamp}</span>
          </div>
          ${post.isFallback ? '<div class="fallback-note">⚠️ ข้อความตัวอย่าง</div>' : ''}
        </div>
      `).join('');
      
      panel.html(postsHTML || '<div class="forum-placeholder">📭 ไม่มีโพสต์</div>');
    }
  }

  // ===== 🎮 FLOATING BUTTON (Optimized Drag) =====

  function spawnLumiButton() {
    // ลบปุ่มเก่า
    $('#lumi-fab').remove();
    
    const fab = $(`
      <div id="lumi-fab" title="LumiPulse Menu" role="button" aria-label="Open LumiPulse" tabindex="0">
        <img src="${CONFIG.fabIcon}" alt="Lumi" draggable="false">
      </div>
    `).appendTo('body');

    // 🎨 โหลดตำแหน่งเก่า
    const savedPos = loadLocal('fabPos');
    if (savedPos?.left && savedPos?.top) {
      fab.css({ left: savedPos.left, top: savedPos.top, right: 'auto', bottom: 'auto' });
    }

    // 📱 Drag variables
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let rafId = null;
    let tapTimer = null;
    const dragThreshold = 8; // px - ขยับน้อยกว่านี้ = แตะปกติ

    // 🖱️ Start drag
    const onDragStart = (e) => {
      if (e.button === 2) return; // คลิกขวา = ข้าม
      e.preventDefault();
      
      const point = e.type.startsWith('touch') ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      
      const rect = fab[0].getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      
      isDragging = false; // ยังไม่ใช่ลาก จนกว่าจะขยับเกิน threshold
      fab.addClass('dragging');    };

    // 🖱️ During drag
    const onDragMove = (e) => {
      if (!startX && !startY) return;
      
      const point = e.type.startsWith('touch') ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // ถ้าขยับเกิน threshold = เริ่มลาก
      if (distance > dragThreshold) {
        isDragging = true;
        clearTimeout(tapTimer);
        e.preventDefault();
      }
      
      if (!isDragging) return;
      
      // ใช้ RAF เพื่อประสิทธิภาพ
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        fab.css({
          left: `${initialLeft + dx}px`,
          top: `${initialTop + dy}px`,
          right: 'auto',
          bottom: 'auto',
          transition: 'none' // ปิด transition ขณะลาก
        });
        rafId = null;
      });
    };

    // 🖱️ End drag
    const onDragEnd = (e) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      fab.removeClass('dragging');
      
      // ถ้าไม่ได้ลาก = แตะปกติ
      if (!isDragging) {
        tapTimer = setTimeout(() => {
          toggleLumiMenu();
          const point = e.type.startsWith('touch') ? (e.changedTouches?.[0] || e.touches?.[0]) : e;
          if (point?.clientX) createHeartEffect(point.clientX, point.clientY);
        }, 50);      } else {
        // จบการลาก = บันทึกตำแหน่ง
        const pos = fab.position();
        saveLocal('fabPos', { left: `${pos.left}px`, top: `${pos.top}px` });
        fab.css('transition', ''); // เปิด transition คืน
      }
      
      // รีเซ็ต
      startX = startY = initialLeft = initialTop = null;
      isDragging = false;
    };

    // 🔗 Bind events (touch + mouse)
    fab.on('touchstart mousedown', onDragStart);
    $(document).on('touchmove mousemove', onDragMove);
    $(document).on('touchend mouseup', onDragEnd);
    
    // ⌨️ Keyboard support
    fab.on('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLumiMenu();
      }
    });

    // 🔄 Long press = reset position
    let longPressTimer = null;
    fab.on('touchstart', () => {
      longPressTimer = setTimeout(() => {
        if (!isDragging) {
          resetFabPosition(fab);
          showToast('📍 รีเซ็ตตำแหน่งปุ่มแล้ว', 'info');
        }
      }, 800);
    }).on('touchend touchcancel', () => {
      clearTimeout(longPressTimer);
    });

    return fab;
  }

  function resetFabPosition(fab) {
    fab.css(CONFIG.ui.fabDefaultPos);
    saveLocal('fabPos', null);
  }

  // ===== 🧭 MENU SYSTEM =====

  function toggleLumiMenu() {
    const menu = $('#lumi-menu');    
    if (menu.length) {
      // มีเมนูอยู่แล้ว = ปิด
      menu.fadeOut(150, () => menu.remove());
      state.isMenuOpen = false;
      return;
    }
    
    // สร้างเมนูใหม่
    state.isMenuOpen = true;
    const menuHTML = `
      <div id="lumi-menu" role="menu" aria-label="LumiPulse Menu">
        <div class="lumi-menu-header">
          <span class="lumi-menu-title">✨ LumiPulse</span>
          <button id="lumi-menu-close" class="lumi-menu-close">&times;</button>
        </div>
        <div class="lumi-menu-grid">
          ${CONFIG.menuItems.map(item => `
            <div class="lumi-menu-item ${item.disabled ? 'disabled' : ''}" 
                 data-action="${item.id}" 
                 role="menuitem"
                 ${item.disabled ? 'aria-disabled="true"' : ''}
                 tabindex="${item.disabled ? '-1' : '0'}">
              <span class="lumi-menu-icon">${item.icon}</span>
              <span class="lumi-menu-text">${item.label}</span>
            </div>
          `).join('')}
        </div>
        <div class="lumi-menu-footer">
          <small>v${CONFIG.version || '0.3.0'} • Made with 💖</small>
        </div>
      </div>
    `;
    
    const menuEl = $(menuHTML).appendTo('body');
    
    // 🎬 อนิเมชั่นเข้า
    menuEl.css('display', 'flex').css('opacity', '0').animate({ opacity: 1 }, 150);
    
    // ❌ ปิดเมนู
    menuEl.find('#lumi-menu-close, #lumi-menu').on('click', function(e) {
      if (e.target === this || $(e.target).hasClass('lumi-menu-close')) {
        menuEl.fadeOut(150, () => menuEl.remove());
        state.isMenuOpen = false;
      }
    });
    
    // 🎯 คลิกเมนู
    menuEl.find('.lumi-menu-item:not(.disabled)').on('click', function() {
      const action = $(this).data('action');      createHeartEffect(this.getBoundingClientRect().left + 20, this.getBoundingClientRect().top + 20);
      handleMenuAction(action);
    });
    
    // ⌨️ Keyboard nav
    menuEl.find('.lumi-menu-item:not(.disabled)').on('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $(this).trigger('click');
      }
    });
  }

  function handleMenuAction(action) {
    // ปิดเมนูก่อน
    $('#lumi-menu').fadeOut(150, () => $('#lumi-menu').remove());
    state.isMenuOpen = false;
    
    switch(action) {
      case 'forum':
        showForumPanel();
        break;
      case 'diary-current':
        generateDiaryEntry('ความรู้สึกวันนี้ที่มีต่อเรา', true)
          .then(entry => entry && showDiaryPanel([entry]));
        break;
      case 'diary-world':
        showToast('🌍 โหลดไดอารี่โลกใหญ่...', 'info');
        Promise.all([
          generateDiaryEntry('เรื่องวุ่นๆ วันนี้', false),
          generateDiaryEntry('สิ่งที่อยากบอก', false)
        ]).then(entries => {
          const valid = entries.filter(e => e);
          if (valid.length) showDiaryPanel(valid);
        });
        break;
      case 'phone':
        showToast('📱 ฟีเจอร์ Phone กำลังพัฒนาอยู่ค่ะ 🌸', 'info');
        break;
      case 'settings':
        showToast('⚙️ เปิดการตั้งค่า...', 'info');
        // TODO: Implement settings panel
        break;
      default:
        console.log('[LumiPulse] Unknown action:', action);
    }
  }

  // ===== 🎨 CSS INJECTION (Fallback) =====
  function injectFallbackStyles() {
    if (document.getElementById('lumipulse-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'lumipulse-styles';
    style.textContent = `
      :root {
        --lumi-pink-soft: #FFF0F5;
        --lumi-pink-mid: #FFB6C1;
        --lumi-pink-bold: #FF69B4;
        --lumi-purple: #E6D5F0;
        --lumi-white-glass: rgba(255, 255, 255, 0.92);
        --lumi-ease: cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      #lumi-fab {
        position: fixed;
        width: 56px; height: 56px;
        border-radius: 50%;
        background: var(--lumi-pink-bold);
        box-shadow: 0 4px 20px rgba(255, 105, 180, 0.4);
        border: 3px solid white;
        cursor: grab;
        z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        will-change: transform;
        transform: translateZ(0);
        touch-action: none;
        transition: transform 0.1s;
      }
      #lumi-fab:active { cursor: grabbing; transform: scale(0.95); }
      #lumi-fab img { width: 32px; height: 32px; pointer-events: none; }
      #lumi-menu {
        position: fixed;
        bottom: 90px; right: 20px;
        width: 280px;
        background: var(--lumi-white-glass);
        backdrop-filter: blur(12px);
        border-radius: 24px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        border: 2px solid var(--lumi-pink-mid);
        flex-direction: column;
        gap: 12px;
        z-index: 9998;
        display: none;
      }
      .lumi-menu-header {
        display: flex; justify-content: space-between; align-items: center;
        padding-bottom: 8px; border-bottom: 1px solid var(--lumi-pink-mid);
      }      .lumi-menu-title { font-weight: bold; color: var(--lumi-pink-bold); }
      .lumi-menu-close {
        background: none; border: none; font-size: 24px;
        color: #999; cursor: pointer; line-height: 1;
      }
      .lumi-menu-grid {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
      }
      .lumi-menu-item {
        display: flex; flex-direction: column; align-items: center;
        padding: 12px 8px; border-radius: 16px;
        background: white; cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        touch-action: manipulation;
      }
      .lumi-menu-item:active { transform: scale(0.95); }
      .lumi-menu-item.disabled { opacity: 0.5; cursor: not-allowed; }
      .lumi-menu-icon { font-size: 24px; margin-bottom: 4px; }
      .lumi-menu-text { font-size: 12px; color: #666; }
      .lumi-menu-footer { text-align: center; color: #999; font-size: 11px; }
      .lumi-heart {
        position: fixed; width: 24px; height: 24px;
        pointer-events: none; z-index: 10000;
        animation: lumi-heart-float 1s ease-out forwards;
      }
      @keyframes lumi-heart-float {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to { opacity: 0; transform: translateY(-100px) scale(1.5); }
      }
      .lumi-modal {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 10001;
      }
      .lumi-modal-content {
        background: white; border-radius: 20px;
        width: 90%; max-width: 400px; max-height: 80vh;
        display: flex; flex-direction: column;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
      }
      .lumi-modal-header {
        padding: 16px; border-bottom: 1px solid #eee;
        display: flex; justify-content: space-between; align-items: center;
      }
      .lumi-modal-header h3 { margin: 0; color: var(--lumi-pink-bold); }
      .lumi-modal-close {
        background: none; border: none; font-size: 28px;
        color: #999; cursor: pointer; line-height: 1;
      }      .lumi-scrollable {
        padding: 16px; overflow-y: auto; flex: 1;
      }
      .lumi-modal-footer {
        padding: 12px 16px; border-top: 1px solid #eee;
        display: flex; gap: 8px; justify-content: flex-end;
      }
      .lumi-btn {
        padding: 8px 16px; border-radius: 12px;
        background: var(--lumi-pink-bold); color: white;
        border: none; font-weight: 500; cursor: pointer;
        transition: opacity 0.2s;
      }
      .lumi-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .lumi-btn.secondary { background: #eee; color: #333; }
      .diary-entry {
        background: linear-gradient(135deg, #FFF9FB, #FFF0F5);
        border-left: 4px solid var(--lumi-pink-bold);
        border-radius: 12px; padding: 12px; margin: 8px 0;
        font-size: 14px;
      }
      .diary-entry .author { font-weight: bold; color: var(--lumi-pink-bold); margin-bottom: 4px; }
      .diary-entry .content { color: #444; line-height: 1.5; }
      .diary-entry .timestamp { font-size: 11px; color: #999; margin-top: 6px; }
      .diary-entry .fallback-note { font-size: 11px; color: #ff9800; margin-top: 4px; }
      .forum-post {
        background: #fafafa; border-radius: 12px;
        padding: 12px; margin: 8px 0; border: 1px solid #eee;
      }
      .forum-author { font-weight: 600; color: var(--lumi-pink-bold); margin-bottom: 6px; }
      .forum-content { color: #333; line-height: 1.4; margin-bottom: 8px; }
      .forum-meta { font-size: 11px; color: #999; display: flex; gap: 12px; }
      .forum-placeholder { text-align: center; color: #999; padding: 20px; }
      @media (max-width: 768px) {
        #lumi-fab { width: 52px; height: 52px; bottom: 16px; right: 16px; }
        #lumi-menu { width: calc(100vw - 40px); right: 20px; bottom: 80px; }
        .lumi-menu-grid { grid-template-columns: repeat(3, 1fr); }
      }
    `;
    document.head.appendChild(style);
  }

  // ===== 🚀 INITIALIZATION =====

  function init() {
    console.log('[LumiPulse] Initializing... 🌸');
    
    // โหลด fallback CSS (ถ้า style.css โหลดไม่สำเร็จ)
    injectFallbackStyles();
        // โหลด diary จากเก็บ
    state.diaryEntries = loadLocal('diary', []);
    
    // สร้างปุ่มลอย (รอนิดหน่อยให้หน้าเว็บโหลดเสร็จ)
    setTimeout(() => {
      spawnLumiButton();
      showToast('🌸 LumiPulse พร้อมใช้งาน!', 'success');
    }, 1000);
    
    // 🔄 ฟังการเปลี่ยนตัวละคร
    $(document).on('activeCharacterChanged', () => {
      const ctx = getSTContext();
      state.currentCharacter = ctx?.characters?.[ctx.characterId] || null;
      console.log('[LumiPulse] Character changed:', state.currentCharacter?.name);
    });
  }

  // ===== 🎬 START =====
  
  // รอให้ SillyTavern โหลดเสร็จ
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 🌸 Export สำหรับดีบัก (ไม่ต้องใช้ก็ได้)
  window.LumiPulse = { CONFIG, state, generateDiaryEntry, spawnLumiButton };

})();
