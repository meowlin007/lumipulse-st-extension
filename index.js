// Name: LumiPulse
// Version: 1.0.0
// Author: Meowlin007
// Description: A comprehensive memory and story management extension for SillyTavern

const extensionName = 'lumipulse-st-extension';
const svgHeart = '<svg viewBox="0 0 24 24" fill="none" width="40" height="40"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF69B4"/></svg>';
const svgPin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
const svgStar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
const svgLock = '<svg viewBox="0 0 24 24" fill="none" stroke="#ff85a2" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const svgClose = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const svgBack = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
const svgPlus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
const svgChevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>';
const svgCalendar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const svgMapPin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const svgUser = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
const svgBook = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>';
const svgLink = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const svgScroll = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
const svgGlobe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const svgNetwork = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="9.5" y1="17" x2="14.5" y2="17"/><line x1="7" y1="7" x2="10" y2="14"/><line x1="17" y1="7" x2="14" y2="14"/></svg>';
const svgComment = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
const svgSettings = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

// INITIALIZATION
// ═══════════════════════════════════════════════
jQuery(async () => {
    if (!extension_settings[extensionName]) {
        extension_settings[extensionName] = {
            memories: [],
            forumPosts: [],
            diary: {
                autoGen: { enabled: true, triggerType: 'turn_count', turnInterval: 20, randomChance: 0.1, emotionKeywords: ['รัก', 'โกรธ', 'แต่งงาน', 'ตาย'] },
                worldMode: 'auto',
                storage: { max: 100 },
                display: { showRefRange: true, showSecretSystem: true, secretMode: 'time' }
            },
            forum: {
                enabled: true,
                rpConnected: true,
                mode: 'auto',
                autoGen: { enabled: true, messageInterval: 10, timeInterval: 5, onImportantEvent: true },
                storage: { max: 100 }
            },
            _internal: {
                theme: 'pink',
                filterChar: '',
                filterDate: '',
                filterLoc: '',
                nameRegistry: {},
                messageCounter: 0
            }
        };
    }
    
    // Inject styles
    injectStyles();
    
    // Create UI elements
    createUI();
    
    // Bind events
    bindMainEvents();
    
    // Setup auto-trigger
    setupAutoTrigger();
    
    console.log('LumiPulse loaded');
});

function injectStyles() {
    const s = extension_settings[extensionName];
    const theme = s._internal.theme || 'pink';
    const colors = {
        pink: { primary: '#FF69B4', secondary: '#FFB6C1', bg: '#FFF0F5', card: '#FFFFFF', text: '#333', border: '#FFC0CB' },
        purple: { primary: '#9370DB', secondary: '#D8BFD8', bg: '#F5F0FF', card: '#FFFFFF', text: '#333', border: '#DDA0DD' },
        ocean: { primary: '#20B2AA', secondary: '#AFEEEE', bg: '#F0FFFF', card: '#FFFFFF', text: '#333', border: '#B0E0E6' },
        mint: { primary: '#98FB98', secondary: '#E0FFE0', bg: '#F5FFFA', card: '#FFFFFF', text: '#333', border: '#C1E1C1' }
    };
    const c = colors[theme];

    const css = `
    @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;500&display=swap');
    .lumi-overlay { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 99999; backdrop-filter: blur(5px); }
    .lumi-modal { position: relative; width: 90vw; max-width: 1000px; height: 85vh; margin: 5vh auto; background: ${c.bg}; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .lumi-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: ${c.primary}; color: white; }
    .lumi-header button { background: none; border: none; color: white; cursor: pointer; font-size: 16px; }
    .lumi-tabs { display: flex; border-bottom: 1px solid ${c.border}; background: ${c.card}; }
    .lumi-tab { padding: 12px 20px; cursor: pointer; font-size: 13px; font-weight: 500; color: #888; transition: 0.2s; }
    .lumi-tab.active { color: ${c.primary}; border-bottom: 2px solid ${c.primary}; }
    .lumi-body { flex: 1; overflow-y: auto; padding: 20px; background: ${c.bg}; }
    .lumi-fab { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: ${c.primary}; color: white; border: none; border-radius: 50%; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 99998; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: 0.3s; }
    .lumi-menu { position: fixed; z-index: 99998; display: none; background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); border-radius: 12px; padding: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .lumi-menu-item { display: flex; align-items: center; gap: 10px; padding: 10px 15px; cursor: pointer; border-radius: 8px; transition: 0.2s; }
    .lumi-menu-item:hover { background: ${c.secondary}; }
    .lumi-loading { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes highlightPulse { 0% { background-color: #ffff99; } 100% { background-color: inherit; } }
    .lumi-toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; background: ${c.primary}; color: white; border-radius: 8px; z-index: 100000; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    .lumi-input { width: 100%; background: ${c.card}; border: 1px solid ${c.border}; border-radius: 10px; padding: 10px; color: ${c.text}; font-family: 'Mitr'; outline: none; box-sizing: border-box; }
    .lumi-label { font-size: 12px; color: #666; margin-bottom: 6px; display: block; font-weight: 400; }
    .lumi-radio-group { display: flex; gap: 8px; margin-bottom: 10px; }
    .lumi-radio-label { flex: 1; text-align: center; padding: 8px; background: ${c.card}; border: 1px solid ${c.border}; border-radius: 10px; cursor: pointer; font-size: 12px; color: #666; transition: 0.2s; }
    .lumi-radio-label input[type="radio"] { display: none; }
    .lumi-radio-label input[type="radio"]:checked + span { background: ${c.primary}; color: white; }
    .lumi-card { background: ${c.card}; border: 1px solid ${c.border}; border-radius: 16px; padding: 14px; margin: 0 0 10px 38px; position: relative; transition: 0.2s; color: ${c.text}; }
    .lumi-card:hover { box-shadow: 0 5px 15px rgba(255,105,180,0.1); transform: translateY(-2px); }
    .lumi-card.pinned { border: 1px solid #FFD700; background: #FFFDF5; }
    .lumi-card.locked { background: #F8F9FA; opacity: 0.7; }
    .lumi-card.highlight { animation: highlightPulse 2s ease; }
    .lumi-meta { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; align-items: center; }
    .lumi-badge { font-size: 10px; padding: 3px 8px; background: ${c.secondary}; border-radius: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
    .lumi-badge:hover { opacity: 0.8; }
    .lumi-char-badge { background: ${c.primary}; color: white; }
    .lumi-act { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
    .lumi-act:hover { background: ${c.secondary}; }
    .lumi-text { font-size: 13px; line-height: 1.5; margin-bottom: 8px; }
    .lumi-ref { font-size: 10px; color: #888; background: #f0f0f0; padding: 2px 6px; border-radius: 10px; }
    .lumi-actions { display: flex; gap: 8px; margin-top: 8px; }
    .lumi-btn { padding: 6px 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 11px; transition: 0.2s; }
    .lumi-btn-edit { background: ${c.secondary}; color: ${c.text}; }
    .lumi-btn-del { background: #FFE0E0; color: #d9534f; }
    .lumi-btn-pin { background: #FFFACD; color: #FFD700; }
    .lumi-btn-fav { background: #FFE4E1; color: #FF69B4; }
    .lumi-search-bar { display: flex; gap: 10px; margin-bottom: 20px; }
    .lumi-search-input { flex: 1; }
    .lumi-gen-btn { background: ${c.primary}; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .lumi-form { margin-bottom: 15px; }
    .lumi-set-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed ${c.border}; }
    .lumi-set-row:last-child { border-bottom: none; }
    .lumi-forum-container { display: flex; gap: 20px; height: calc(100% - 40px); }
    .lumi-forum-main { flex: 3; background: ${c.card}; border-radius: 12px; padding: 15px; overflow-y: auto; }
    .lumi-forum-sidebar { flex: 1; background: ${c.card}; border-radius: 12px; padding: 15px; overflow-y: auto; }
    .lumi-forum-thread { background: ${c.card}; border: 1px solid ${c.border}; border-radius: 12px; padding: 15px; margin-bottom: 12px; }
    .lumi-forum-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed ${c.border}; }
    .lumi-forum-title { font-size: 14px; font-weight: 500; color: ${c.secondary}; }
    .lumi-forum-meta { font-size: 10px; color: #888; }
    .lumi-forum-post { margin: 10px 0; padding: 10px; background: ${c.bg}; border-radius: 8px; }
    .lumi-forum-author { font-weight: 500; color: ${c.primary}; }
    .lumi-forum-content { margin-top: 5px; }
    .lumi-forum-reply { margin-left: 20px; margin-top: 10px; padding: 8px; background: ${c.bg}; border-radius: 8px; }
    .lumi-edit-textarea { width: 100%; min-height: 80px; padding: 10px; border: 1px solid ${c.border}; border-radius: 10px; font-family: 'Mitr'; font-size: 13px; resize: vertical; color: ${c.text}; background: ${c.card}; }
    .lumi-btn-save { flex: 1; background: ${c.primary}; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer; }
    .lumi-btn-cancel { flex: 1; background: #FFE0E0; color: #d9534f; border: none; padding: 8px; border-radius: 8px; cursor: pointer; }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

function createUI() {
    // Create FAB button
    $('body').append(`<button class="lumi-fab">💬</button>`);
    
    // Create overlay modal
    $('body').append(`
    <div id="lumi-overlay" class="lumi-overlay">
        <div class="lumi-modal">
            <div class="lumi-header">
                <span id="lumi-title">LumiPulse</span>
                <button id="lumi-close">${svgClose}</button>
            </div>
            <div class="lumi-tabs">
                <div class="lumi-tab active" data-tab="diary">Diary</div>
                <div class="lumi-tab" data-tab="forum">Forum</div>
                <div class="lumi-tab" data-tab="settings">Settings</div>
            </div>
            <div class="lumi-body" id="lumi-body">
                <!-- Content will be injected here -->
            </div>
        </div>
    </div>
    `);
    
    // Create floating menu
    $('body').append(`
    <div class="lumi-menu" id="lumi-menu">
        <div class="lumi-menu-item" data-action="diary">
            ${svgBook} Open Diary
        </div>
        <div class="lumi-menu-item" data-action="forum">
            ${svgComment} Open Forum
        </div>
        <div class="lumi-menu-item" data-action="settings">
            ${svgSettings} Settings
        </div>
    </div>
    `);
}

function bindMainEvents() {
    // FAB click
    $(document).on('click', '.lumi-fab', function(e) {
        e.stopPropagation();
        const rect = this.getBoundingClientRect();
        $('#lumi-menu')
            .css({ top: rect.top - 10, right: rect.right + 10 })
            .toggle();
    });
    
    // Menu item click
    $(document).on('click', '.lumi-menu-item', function() {
        const action = $(this).data('action');
        openModal(action);
        $('#lumi-menu').hide();
    });
    
    // Close menu when clicking elsewhere
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.lumi-fab, .lumi-menu').length) {
            $('#lumi-menu').hide();
        }
    });
    
    // Modal close
    $('#lumi-close').on('click', function() {
        $('#lumi-overlay').fadeOut(200);
    });
    
    // Tab switching
    $('.lumi-tab').on('click', function() {
        const tab = $(this).data('tab');
        $('.lumi-tab').removeClass('active');
        $(this).addClass('active');
        
        if (tab === 'diary') renderDashboard();
        else if (tab === 'forum') renderForum();
        else if (tab === 'settings') renderSettings();
    });
}

function setupAutoTrigger() {
    // Message counter for diary auto-gen
    $(document).on('messageReceived', function() {
        const s = extension_settings[extensionName];
        s._internal.messageCounter = (s._internal.messageCounter || 0) + 1;
        SillyTavern.getContext().saveSettingsDebounced();
        
        // Check diary auto-gen
        const ag = s.diary.autoGen;
        if(ag.enabled && ag.triggerType === 'turn_count' && s._internal.messageCounter >= ag.turnInterval) {
            setTimeout(async () => {
                const results = await callAIBatch('latest', ag.turnInterval || 20);
                if(results && results.length > 0) {
                    const ctx = SillyTavern.getContext();
                    const wm = s.diary.worldMode === 'auto' ? detectWorldMode() : s.diary.worldMode;
                    const botId = ctx.characterId;
                    results.forEach(res => saveMemory({
                        id: 'mem_auto_' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
                        timestamp: new Date().toISOString(),
                        character: res.character || ctx.name2 || "Character",
                        botId: botId,
                        worldMode: wm,
                        content: { ...res },
                        meta: { 
                            isPinned: false, 
                            isFavorite: false, 
                            isSecret: res.isSecret, 
                            refRange: res.refRange, 
                            linkedIds: res.linkedIds || [], 
                            tags: extractTags(res.diary) 
                        }
                    }));
                }
                s._internal.messageCounter = 0;
                SillyTavern.getContext().saveSettingsDebounced();
            }, 1000);
        }
    });
    
    // Forum auto-trigger
    setupForumAutoTrigger();
}

function setupForumAutoTrigger() {
    $(document).on('messageReceived', async function() {
        const s = extension_settings[extensionName];
        const cfg = s.forum.autoGen;
        if(!cfg.enabled) return;

        const ctx = SillyTavern.getContext();
        const chat = ctx.chat || [];
        const lastMsg = chat[chat.length - 1]?.mes || '';
        
        // Check message interval
        if(chat.length % cfg.messageInterval === 0) {
            await generateForumPosts();
        }
        
        // Check important events
        if(cfg.onImportantEvent && lastMsg.match(/(รัก|แต่งงาน|ตาย|ลับ|secret|secretly|confess|kill|marry)/i)) {
            await generateForumPosts();
        }
    });
}

// DIARY MODULE
// ═══════════════════════════════════════════════
function renderDashboard() {
    $('#lumi-title').text('LumiPulse - Diary');
    const ctx = SillyTavern.getContext();
    const currentBotId = ctx.characterId;
    const currentBotName = ctx.name2 || "Unknown Bot";
    const mems = loadMemories({ botId: currentBotId });
    const filterChar = extension_settings[extensionName]._internal.filterChar || '';
    const filterDate = extension_settings[extensionName]._internal.filterDate || '';
    const filterLoc = extension_settings[extensionName]._internal.filterLoc || '';
    const chars = [...new Set(mems.map(m => m.character))];
    
    // Apply filters
    let filteredMems = mems;
    if(filterChar) filteredMems = filteredMems.filter(m => m.character === filterChar);
    if(filterDate) filteredMems = filteredMems.filter(m => m.content.rp_date === filterDate);
    if(filterLoc) filteredMems = filteredMems.filter(m => m.content.rp_location === filterLoc);
    
    // Group by date
    const grouped = {};
    filteredMems.forEach(m => {
        const date = m.content.rp_date;
        if(!grouped[date]) grouped[date] = [];
        grouped[date].push(m);
    });
    
    let html = `
    <div style="margin-bottom: 20px;">
        <div class="lumi-search-bar">
            <select id="filter-char" class="lumi-input">
                <option value="">All Characters</option>
                ${chars.map(c => `<option value="${c}" ${c === filterChar ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <input type="date" id="filter-date" class="lumi-input" value="${filterDate}">
            <input type="text" id="filter-loc" class="lumi-input" placeholder="Location" value="${filterLoc}">
        </div>
        <button id="btn-open-gen" class="lumi-gen-btn" style="margin-right: 10px;">${svgScroll} Analyze & Generate</button>
        <button id="btn-export-story" class="lumi-gen-btn">${svgBook} Export Story</button>
        <button id="btn-export-lore" class="lumi-gen-btn" style="margin-left: 10px;">${svgGlobe} Export Lorebook</button>
    </div>
    <div id="gen-form-container" style="display: none; background: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <div class="lumi-form">
            <label class="lumi-label">Analysis Mode</label>
            <div class="lumi-radio-group">
                <label class="lumi-radio-label"><input type="radio" name="gen-mode" value="latest" checked><span>Latest Messages</span></label>
                <label class="lumi-radio-label"><input type="radio" name="gen-mode" value="first"><span>First Messages</span></label>
                <label class="lumi-radio-label"><input type="radio" name="gen-mode" value="smart"><span>Smart Analysis</span></label>
            </div>
        </div>
        <div id="gen-count-wrap" style="margin-bottom: 10px;">
            <label class="lumi-label">Message Count</label>
            <input type="number" id="gen-count" value="30" min="5" max="200" class="lumi-input">
        </div>
        <button id="btn-run-gen" class="lumi-gen-btn" style="width: 100%; justify-content: center;">${svgPlus} Analyze & Generate</button>
    </div>
    <div id="lumi-content"></div>
    `;
    
    $('#lumi-body').html(html);
    // ✅ ย้าย .data() มาหลัง .html()
    $('#lumi-body').data('current-tab', 'diary');
    
    // Bind events
    $('#filter-char, #filter-date, #filter-loc').on('change', function() {
        extension_settings[extensionName]._internal.filterChar = $('#filter-char').val();
        extension_settings[extensionName]._internal.filterDate = $('#filter-date').val();
        extension_settings[extensionName]._internal.filterLoc = $('#filter-loc').val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderDashboard();
    });
    
    $('#btn-open-gen').on('click', function() {
        $('#gen-form-container').slideToggle(200);
    });
    
    $('#btn-run-gen').on('click', async function() {
        const mode = $('input[name="gen-mode"]:checked').val();
        const count = parseInt($('#gen-count').val()) || 30;
        const btn = $(this);
        btn.html('<span class="lumi-loading"></span> Processing...').prop('disabled', true);
        
        try {
            const results = await callAIBatch(mode, count);
            if(results && results.length > 0) {
                const ctx = SillyTavern.getContext();
                const wm = extension_settings[extensionName].diary.worldMode === 'auto' ? detectWorldMode() : extension_settings[extensionName].diary.worldMode;
                const botId = ctx.characterId;
                results.forEach(res => saveMemory({
                    id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
                    timestamp: new Date().toISOString(),
                    character: res.character || ctx.name2 || "Character",
                    botId: botId,
                    worldMode: wm,
                    content: { ...res },
                    meta: { 
                        isPinned: false, 
                        isFavorite: false, 
                        isSecret: res.isSecret, 
                        refRange: res.refRange, 
                        linkedIds: res.linkedIds || [], 
                        tags: extractTags(res.diary) 
                    }
                }));
                showToast(`Generated ${results.length} memories!`);
            }
        } catch(e) {
            console.error(e);
            showToast('Error generating memories');
        }
        
        btn.html(`${svgPlus} Analyze & Generate`).prop('disabled', false);
        renderDashboard();
    });
    
    $('#btn-export-story').on('click', function() {
        const story = generateStory(filteredMems);
        exportText(story, 'story.md');
    });
    
    $('#btn-export-lore').on('click', function() {
        const lore = generateLorebook(filteredMems);
        exportText(JSON.stringify(lore, null, 2), 'lorebook.json');
    });
    
    // Render grouped memories
    let contentHtml = '';
    Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([date, entries]) => {
        contentHtml += `<div style="margin-bottom: 20px;"><div style="font-size: 14px; font-weight: 500; color: ${extension_settings[extensionName]._internal.theme === 'pink' ? '#FF69B4' : '#333'}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">${svgCalendar} ${date}</div>`;
        entries.forEach((m, idx) => {
            contentHtml += renderCard(m, idx);
        });
        contentHtml += '</div>';
    });
    
    $('#lumi-content').html(contentHtml);
    bindEvents();
}

function renderCard(m, index) {
    const showSecret = extension_settings[extensionName].diary.display.showSecretSystem;
    const isLocked = showSecret && checkUnlock(m) === false;
    const color = generateColor(m.character);
    const delay = index * 0.05;
    let lockOverlay = '';
    
    if(isLocked) lockOverlay = `<div style="position: absolute; inset: 0; background: rgba(255,255,255,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 16px; z-index: 1; backdrop-filter: blur(5px);">${svgLock}<div style="font-size: 11px; color: var(--lumi-secondary); margin-top: 5px;">Locked</div></div>`;
    
    const moodIcon = m.content.rp_mood ? getMoodIcon(m.content.rp_mood) : '';
    const locHtml = m.content.rp_location ? ` <span class="lumi-badge" style="cursor: default;">${svgMapPin} ${escapeHtml(m.content.rp_location)}</span>` : '';
    const linkHtml = (m.meta.linkedIds && m.meta.linkedIds.length) ? ` <span class="lumi-badge" data-links="${m.meta.linkedIds.join(',')}">${svgLink} ${m.meta.linkedIds.length}</span>` : '';
    const tagsHtml = (m.content.rp_tags && m.content.rp_tags.length) ? `<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">${m.content.rp_tags.map(t => `<span class="lumi-badge" style="cursor: default; background: #E6E6FA;">${t}</span>`).join('')}</div>` : '';
    const refHtml = extension_settings[extensionName].diary.display.showRefRange && m.meta.refRange ? `<div class="lumi-ref" style="margin-top: 8px;">Ref: #${m.meta.refRange}</div>` : '';
    
    return `
    <div class="lumi-card ${m.meta.isPinned ? 'pinned' : ''} ${isLocked ? 'locked' : ''}" data-id="${m.id}" data-character="${m.character}" style="animation-delay: ${delay}s;">
        ${lockOverlay}
        <div class="lumi-meta">
            <span class="lumi-badge lumi-char-badge" style="background: ${color};">${m.character}</span>
            <span class="lumi-badge">${m.content.rp_date}</span>
            ${moodIcon ? `<span class="lumi-badge">${moodIcon}</span>` : ''}
            ${locHtml}
            ${linkHtml}
        </div>
        ${tagsHtml}
        <div class="lumi-text">${isLocked ? '🔒 Locked Content' : escapeHtml(m.content.diary)}</div>
        ${refHtml}
        <div class="lumi-actions">
            <div class="lumi-act lumi-pin" title="Pin">${m.meta.isPinned ? '📌' : '📍'}</div>
            <div class="lumi-act lumi-fav" title="Favorite">${m.meta.isFavorite ? '❤️' : '🤍'}</div>
            <div class="lumi-act lumi-edit" title="Edit">${svgPin}</div>
            <div class="lumi-act lumi-del" title="Delete">${svgStar}</div>
        </div>
    </div>
    `;
}

function bindEvents() {
    // Pin toggle
    $('.lumi-pin').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        const mem = extension_settings[extensionName].memories.find(m => m.id === id);
        if(mem) {
            mem.meta.isPinned = !mem.meta.isPinned;
            SillyTavern.getContext().saveSettingsDebounced();
            renderDashboard();
        }
    });
    
    // Favorite toggle
    $('.lumi-fav').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        const mem = extension_settings[extensionName].memories.find(m => m.id === id);
        if(mem) {
            mem.meta.isFavorite = !mem.meta.isFavorite;
            SillyTavern.getContext().saveSettingsDebounced();
            renderDashboard();
        }
    });
    
    // Edit inline
    $('.lumi-edit').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        editMemoryInline(id);
    });
    
    // Delete
    $('.lumi-del').off('click').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).closest('.lumi-card').data('id');
        if(confirm('Delete this memory?')) {
            extension_settings[extensionName].memories = extension_settings[extensionName].memories.filter(m => m.id !== id);
            SillyTavern.getContext().saveSettingsDebounced();
            renderDashboard();
        }
    });
    
    // Link click
    $('[data-links]').off('click').on('click', function(e) {
        e.stopPropagation();
        const ids = $(this).data('links').split(',');
        highlightMemories(ids);
    });
}

function editMemoryInline(id) {
    const mem = extension_settings[extensionName].memories.find(m => m.id === id);
    if (!mem) return;
    const card = $(`.lumi-card[data-id="${id}"]`);
    
    card.find('.lumi-text').html(`
        <textarea class="lumi-edit-textarea" style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid var(--lumi-border); border-radius: 10px; font-family: 'Mitr'; font-size: 13px; resize: vertical; color: var(--lumi-text); background: var(--lumi-card);">${mem.content.diary}</textarea>
        <div style="margin-top: 8px; display: flex; gap: 8px;">
            <button class="lumi-btn-save" style="flex: 1; background: var(--lumi-primary); color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer;">Save</button>
            <button class="lumi-btn-cancel" style="flex: 1; background: #FFE0E0; color: var(--lumi-danger); border: none; padding: 8px; border-radius: 8px; cursor: pointer;">Cancel</button>
        </div>
    `);
    
    card.find('.lumi-btn-save').on('click', function() {
        mem.content.diary = card.find('.lumi-edit-textarea').val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderDashboard();
        showToast('Updated!');
    });
    
    card.find('.lumi-btn-cancel').on('click', function() {
        renderDashboard();
    });
}

function saveMemory(entry) {
    const s = extension_settings[extensionName];
    if(!s._internal.nameRegistry) s._internal.nameRegistry = {};
    
    let cleanName = entry.character.replace(/[()（）[\]]/g, '').trim();
    let canonName = cleanName;
    
    for(let regName in s._internal.nameRegistry) {
        if(similarityScore(cleanName, regName) > 90) {
            canonName = regName;
            break;
        }
    }
    
    s._internal.nameRegistry[canonName] = true;
    entry.character = canonName;
    
    const charMems = s.memories.filter(m => m.character === canonName);
    const isDuplicate = charMems.some(m => similarityScore(m.content.diary, entry.content.diary) > 85);
    if (isDuplicate) return;
    
    s.memories.unshift(entry);
    if (s.memories.length > s.diary.storage.max) s.memories = s.memories.slice(0, s.diary.storage.max);
    SillyTavern.getContext().saveSettingsDebounced();
}

function loadMemories(filter = {}) {
    let mem = [...(extension_settings[extensionName].memories || [])];
    if (filter.botId) mem = mem.filter(m => m.botId === filter.botId || !m.botId);
    if (filter.character) mem = mem.filter(m => m.character === filter.character);
    return mem.sort((a,b) => (b.meta.isPinned ? 1 : 0) - (a.meta.isPinned ? 1 : 0) || new Date(b.timestamp) - new Date(a.timestamp));
}

async function callAIBatch(mode, count) {
    const ctx = SillyTavern.getContext();
    const allChat = ctx.chat || [];
    let chatSlice, startIndex = 0, endIndex = 0;
    
    if(mode === 'latest') {
        chatSlice = allChat.slice(-count);
        startIndex = Math.max(0, allChat.length - count);
        endIndex = allChat.length;
    }
    else if(mode === 'first') {
        chatSlice = allChat.slice(0, count);
        startIndex = 0;
        endIndex = count;
    }
    else {
        chatSlice = allChat.filter(m => m.mes && m.mes.length > 15).slice(-120);
        startIndex = Math.max(0, allChat.length - 120);
        endIndex = allChat.length;
    }
    
    const cleanChat = chatSlice.filter(m => m.mes && m.mes.length > 10);
    const chatLog = cleanChat.map((m, i) => `[${m.is_user ? 'User' : (m.name || 'NPC')}]: ${m.mes.slice(0, 60)}`).join('\n');
    const botMems = loadMemories({ botId: ctx.characterId });
    const prevTopics = botMems.slice(0, 10).map(m => `- [${m.character}] ${m.content.rp_date} @ ${m.content.rp_location}: ${m.content.diary.slice(0, 50)}...`).join('\n');
    const registryList = Object.keys(extension_settings[extensionName]._internal.nameRegistry || {}).join(', ');
    
    const prompt = `[System: Analyze chat to create UNIQUE diary entries.]
Recent Chat:
${chatLog}

Previous Topics:
${prevTopics}

Known Characters: ${registryList}

Instructions:
- Create 1-3 unique diary entries per character involved
- Focus on significant interactions, emotions, or events
- Include location, mood, and key details
- Use format: {"character": "Name", "rp_date": "YYYY-MM-DD", "rp_time": "HH:MM", "rp_location": "Location", "rp_mood": "Happy/Sad/Angry/Neutral", "rp_tags": ["tag1", "tag2"], "diary": "Diary entry content", "refRange": "start-end", "linkedIds": ["id1", "id2"]}
- Only return valid JSON array of entries
- Do not repeat previous topics

Output:` + '
```json\n[\n';
    
    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') {
            res = await ctx.generateQuietPrompt(prompt, false, false);
        } else if (typeof ctx.generateRaw === 'function') {
            res = await ctx.generateRaw(prompt, true);
        }
        
        if(!res) return [];
        
        // Clean up response to extract JSON
        const start = res.indexOf('[');
        const end = res.lastIndexOf(']') + 1;
        if(start === -1 || end === 0) return [];
        
        const jsonStr = res.substring(start, end);
        const parsed = JSON.parse(jsonStr);
        
        // Add reference range if missing
        parsed.forEach(entry => {
            if(!entry.refRange) {
                entry.refRange = `${startIndex}-${endIndex}`;
            }
            if(!entry.rp_date) {
                entry.rp_date = new Date().toISOString().split('T')[0];
            }
            if(!entry.rp_mood) {
                entry.rp_mood = detectMood(entry.diary);
            }
        });
        
        return parsed;
    } catch(e) {
        console.error('AI generation error:', e);
        return [];
    }
}

// FORUM MODULE
// ═══════════════════════════════════════════════
function renderForum() {
    <LaTex>id_33</LaTex>{[...new Set(posts.map(p => p.author))].map(c => `<option value="<LaTex>id_32</LaTex>{c}</option>`).join('')}
                </select>
                <select id="forum-filter-type" class="lumi-input" style="width: 120px;">
                    <option value="">All Types</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px; padding: 15px; background: var(--lumi-card); border-radius: 12px; border: 1px solid var(--lumi-border);">
                <textarea id="forum-post-input" class="lumi-input" placeholder="Write your forum post..." style="min-height: 80px; resize: vertical; margin-bottom: 10px;"></textarea>
                <div style="display: flex; gap: 10px;">
                    <select id="forum-post-type" class="lumi-input" style="flex: 1;">
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <button id="btn-submit-post" class="lumi-gen-btn">${svgPlus} Post</button>
                </div>
            </div>
            
            <div style="margin-bottom: 15px; text-align: center;">
                <button id="btn-generate-forum" class="lumi-gen-btn">${svgPlus} Generate Posts</button>
            </div>
            
            <div id="forum-posts-container">
                <!-- Posts will be rendered here -->
            </div>
        </div>
        
        <div class="lumi-forum-sidebar" id="forum-sidebar">
            <div style="font-size: 12px; font-weight: 500; color: var(--lumi-secondary); margin-bottom: 10px;">${svgNetwork} Character Network</div>
            <div id="network-nodes"></div>
        </div>
    </div>
    `;
    
    $('#lumi-body').html(html);
    // ✅ ย้าย .data() มาหลัง .html()
    <LaTex>id_31</LaTex>('#forum-filter-char, #forum-filter-type').on('change', function() {
        renderForumThreads();
    });
    
    <LaTex>id_30</LaTex>btn = <LaTex>id_29</LaTex>btn.html('<span class="lumi-loading"></span> Generating...').prop('disabled', true);
        
        const success = await generateForumPosts();
        
        if (success) {
            renderForumThreads(); // ✅ เรียกเฉพาะส่วนเนื้อหา ไม่ re-render ทั้งหน้า
        }
        
        <LaTex>id_28</LaTex>{svgPlus} Generate`).prop('disabled', false);
    });
    
    <LaTex>id_27</LaTex>btn = <LaTex>id_26</LaTex>btn.html('<span class="lumi-loading"></span> Posting...').prop('disabled', true);
        
        const success = await submitForumPost();
        
        if (success) {
            renderForumThreads(); // ✅ เรียกเฉพาะส่วนเนื้อหา
        }
        
        <LaTex>id_25</LaTex>{svgPlus} Post`).prop('disabled', false);
    });
    
    // Initial render of threads
    renderForumThreads();
}

function renderForumThreads() {
    const s = extension_settings[extensionName];
    const posts = s.forumPosts || [];
    const filterChar = <LaTex>id_24</LaTex>('#forum-filter-type').val();
    
    let filteredPosts = posts;
    if(filterChar) filteredPosts = filteredPosts.filter(p => p.author === filterChar);
    if(filterType) filteredPosts = filteredPosts.filter(p => p.type === filterType);
    
    // Group posts by thread
    const threads = {};
    filteredPosts.forEach(post => {
        const threadId = post.threadId;
        if(!threads[threadId]) threads[threadId] = [];
        threads[threadId].push(post);
    });
    
    let html = '';
    Object.entries(threads).forEach(([threadId, threadPosts]) => {
        const mainPost = threadPosts[0]; // First post is the main one
        const replies = threadPosts.slice(1);
        
        html += `
        <div class="lumi-forum-thread">
            <div class="lumi-forum-header">
                <div class="lumi-forum-title">${mainPost.threadTitle || 'Discussion Thread'}</div>
                <div class="lumi-forum-meta">${new Date(mainPost.timestamp).toLocaleString()}</div>
            </div>
            
            <div class="lumi-forum-post">
                <div class="lumi-forum-author">${mainPost.author}</div>
                <div class="lumi-forum-content">${escapeHtml(mainPost.content)}</div>
            </div>
            
            ${replies.map(reply => `
            <div class="lumi-forum-reply">
                <div class="lumi-forum-author">${reply.author}</div>
                <div class="lumi-forum-content"><LaTex>id_23</LaTex>('#forum-posts-container').html(html);
}

// ✅ แก้ไข: ลบ renderForum() ออก ให้ caller จัดการเอง
async function generateForumPosts() {
    const ctx = SillyTavern.getContext();
    const chat = ctx.chat || [];
    const recentChat = chat.slice(-20);
    const characters = [...new Set(recentChat.filter(m => m.name && !m.is_user).map(m => m.name))];
    
    if(characters.length === 0) {
        showToast('No characters in recent chat to generate forum posts');
        return false;
    }

    const prompt = `[System: Generate forum discussions based on recent chat events.]
Recent Chat:
${recentChat.map(m => `[${m.is_user ? 'User' : m.name}]: <LaTex>id_22</LaTex>{characters.join(', ')}
Generate 2-3 forum posts from different characters discussing recent events. Each post should:
- Reflect the character's personality
- React to events in the chat
- Show their perspective and emotions
Return JSON array:
[{"author": "Character Name", "threadId": "1", "threadTitle": "Topic Title", "content": "Post content", "type": "public|private", "mood": "Happy|Angry|Sad|Neutral", "timestamp": "${new Date().toISOString()}"}]`;

    try {
        let res;
        if (typeof ctx.generateQuietPrompt === 'function') {
            res = await ctx.generateQuietPrompt(prompt, false, false);
        } else if (typeof ctx.generateRaw === 'function') {
            res = await ctx.generateRaw(prompt, true);
        }
        
        if(!res) { showToast('Failed to generate forum posts'); return false; }
        
        const match = res.match(/\[[\s\S]*\]/);
        if(!match) { showToast('Invalid response format'); return false; }
        
        const newPosts = JSON.parse(match[0]);
        const s = extension_settings[extensionName];
        s.forumPosts = [...(s.forumPosts || []), ...newPosts].slice(-s.forum.storage.max);
        SillyTavern.getContext().saveSettingsDebounced();
        
        showToast(`Generated ${newPosts.length} forum posts!`);
        // ✅ ไม่เรียก renderForum() ที่นี่ - ให้ caller จัดการ
        return true;
    } catch(e) {
        console.error(e);
        showToast('Error generating forum posts');
        return false;
    }
}

// ✅ แก้ไข: ลบ renderForum() ออก ให้ caller จัดการเอง
async function submitForumPost() {
    const content = <LaTex>id_21</LaTex>('#forum-post-type').val();
    
    if(!content) { 
        showToast('Please enter post content'); 
        return false; 
    }
    
    const s = extension_settings[extensionName];
    const newPost = {
        id: 'post_' + Date.now(),
        author: 'Player',
        threadId: 'player_' + Date.now(),
        threadTitle: 'Player Discussion',
        content: content,
        type: type,
        mood: 'Neutral',
        timestamp: new Date().toISOString(),
        replies: []
    };

    s.forumPosts = [...(s.forumPosts || []), newPost].slice(-s.forum.storage.max);
    SillyTavern.getContext().saveSettingsDebounced();

    <LaTex>id_20</LaTex>('#lumi-title').text('LumiPulse - Settings');
    const s = extension_settings[extensionName];
    const ag = s.diary.autoGen;
    const fg = s.forum.autoGen;
    const savedTheme = s._internal.theme || 'pink';

    let html = `
    <div class="lumi-form">
        <label class="lumi-label">Theme</label>
        <div class="lumi-radio-group">
            <label class="lumi-radio-label"><input type="radio" name="theme" value="pink" ${savedTheme === 'pink' ? 'checked' : ''}><span style="background: #FF69B4;">Pink</span></label>
            <label class="lumi-radio-label"><input type="radio" name="theme" value="purple" ${savedTheme === 'purple' ? 'checked' : ''}><span style="background: #9370DB;">Purple</span></label>
            <label class="lumi-radio-label"><input type="radio" name="theme" value="ocean" ${savedTheme === 'ocean' ? 'checked' : ''}><span style="background: #20B2AA;">Ocean</span></label>
            <label class="lumi-radio-label"><input type="radio" name="theme" value="mint" ${savedTheme === 'mint' ? 'checked' : ''}><span style="background: #98FB98;">Mint</span></label>
        </div>
    </div>

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--lumi-border);">
        <label class="lumi-label">Diary Auto-Generation</label>
        <div class="lumi-set-row">
            <span>Enable Auto-Gen</span>
            <input type="checkbox" id="ag-en" ${ag.enabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--lumi-primary);">
        </div>
        <div class="lumi-set-row">
            <span>Trigger Type</span>
            <select id="ag-tr" class="lumi-input" style="width: 110px;">
                <option value="turn_count" ${ag.triggerType === 'turn_count' ? 'selected' : ''}>Turn Count</option>
                <option value="emotion" ${ag.triggerType === 'emotion' ? 'selected' : ''}>Emotion Keywords</option>
                <option value="random" ${ag.triggerType === 'random' ? 'selected' : ''}>Random Chance</option>
            </select>
        </div>
        ${ag.triggerType === 'turn_count' ? `
        <div class="lumi-set-row">
            <span>Messages per Gen</span>
            <input type="number" id="ag-int" value="${ag.turnInterval}" min="1" max="50" style="width: 60px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 6px; padding: 4px; color: var(--lumi-text); font-family: 'Mitr';">
        </div>
        ` : ''}
        ${ag.triggerType === 'random' ? `
        <div class="lumi-set-row">
            <span>Chance (%)</span>
            <input type="number" id="ag-chance" value="${(ag.randomChance * 100).toFixed(0)}" min="1" max="50" style="width: 60px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 6px; padding: 4px; color: var(--lumi-text); font-family: 'Mitr';">
        </div>
        ` : ''}
        ${ag.triggerType === 'emotion' ? `
        <label style="font-size: 12px; color: #666;">Keywords:</label>
        <input type="text" id="ag-kw" value="${ag.emotionKeywords.join(',')}" placeholder="รัก,โกรธ..." style="width: 100%; margin-top: 4px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 6px; padding: 6px; color: var(--lumi-text); font-family: 'Mitr';">
        ` : ''}
    </div>

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--lumi-border);">
        <label class="lumi-label">Forum Settings</label>
        <div class="lumi-set-row">
            <span>Enable Forum</span>
            <input type="checkbox" id="forum-en" ${s.forum.enabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--lumi-primary);">
        </div>
        <div class="lumi-set-row">
            <span>Connect to RP</span>
            <input type="checkbox" id="forum-rp" ${s.forum.rpConnected ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--lumi-primary);">
        </div>
        <div class="lumi-set-row">
            <span>Mode</span>
            <select id="forum-mode" class="lumi-input" style="width: 110px;">
                <option value="auto" ${s.forum.mode === 'auto' ? 'selected' : ''}>Auto</option>
                <option value="realtime" ${s.forum.mode === 'realtime' ? 'selected' : ''}>Real-time</option>
                <option value="turnbased" ${s.forum.mode === 'turnbased' ? 'selected' : ''}>Turn-based</option>
            </select>
        </div>
    </div>

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--lumi-border);">
        <label style="font-size: 12px; color: #666; display: block; margin-bottom: 6px;">Auto-Generate Triggers:</label>
        <div class="lumi-set-row">
            <span>Every X Messages</span>
            <input type="number" id="forum-msg-int" value="${fg.messageInterval}" min="1" max="50" style="width: 60px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 6px; padding: 4px; color: var(--lumi-text); font-family: 'Mitr';">
        </div>
        <div class="lumi-set-row">
            <span>Time Interval (min)</span>
            <input type="number" id="forum-time-int" value="${fg.timeInterval}" min="1" max="60" style="width: 60px; background: var(--lumi-card); border: 1px solid var(--lumi-border); border-radius: 6px; padding: 4px; color: var(--lumi-text); font-family: 'Mitr';">
        </div>
        <div class="lumi-set-row">
            <span>On Important Events</span>
            <input type="checkbox" id="forum-event" ${fg.onImportantEvent ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--lumi-primary);">
        </div>
    </div>

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--lumi-border);">
        <label class="lumi-label">Display Settings</label>
        <div class="lumi-set-row">
            <span>Show Reference Range</span>
            <input type="checkbox" id="disp-ref" ${s.diary.display.showRefRange ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--lumi-primary);">
        </div>
        <div class="lumi-set-row">
            <span>Show Secret System</span>
            <input type="checkbox" id="disp-sec" ${s.diary.display.showSecretSystem ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--lumi-primary);">
        </div>
    </div>

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--lumi-border);">
        <label class="lumi-label">Secret System</label>
        <div class="lumi-set-row">
            <span>Enable Secret Mode</span>
            <input type="checkbox" id="set-sec-en" ${s.diary.display.showSecretSystem ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--lumi-primary);">
        </div>
        <div class="lumi-set-row">
            <span>Unlock Rule</span>
            <select id="set-sec-mode" class="lumi-input" style="width: 130px;">
                <option value="time" ${s.diary.display.secretMode === 'time' ? 'selected' : ''}>After 3 Days</option>
                <option value="affection" ${s.diary.display.secretMode === 'affection' ? 'selected' : ''}>High Affection</option>
                <option value="always" ${s.diary.display.secretMode === 'always' ? 'selected' : ''}>Always Visible</option>
            </select>
        </div>
    </div>
    `;

    <LaTex>id_19</LaTex>('#lumi-body').data('current-tab', 'settings');

    // Bind settings events
    <LaTex>id_18</LaTex>(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
        injectStyles(); // Re-inject with new theme
    });
    
    <LaTex>id_17</LaTex>(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_16</LaTex>(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
        renderSettings(); // Re-render to show/hide options
    });
    
    <LaTex>id_15</LaTex>(this).val()) || 20;
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_14</LaTex>(this).val()) || 10) / 100;
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_13</LaTex>(this).val().split(',').map(k => k.trim()).filter(k => k);
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_12</LaTex>(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_11</LaTex>(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_10</LaTex>(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_9</LaTex>(this).val()) || 10;
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_8</LaTex>(this).val()) || 5;
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_7</LaTex>(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_6</LaTex>(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_5</LaTex>(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_4</LaTex>(this).prop('checked');
        SillyTavern.getContext().saveSettingsDebounced();
    });
    
    <LaTex>id_3</LaTex>(this).val();
        SillyTavern.getContext().saveSettingsDebounced();
    });
}

// HELPERS & UTILS
// ═══════════════════════════════════════════════
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'lumi-toast';
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

function checkUnlock(m) {
    if(!m.meta.isSecret) return true;
    if(!extension_settings[extensionName].diary.display.showSecretSystem) return true;
    
    const mode = extension_settings[extensionName].diary.display.secretMode;
    if(mode === 'time') return (Date.now() - new Date(m.timestamp)) > 86400000 * 3; // 3 days
    if(mode === 'affection') return (m.content.affection_score || 0) >= 80;
    return true; // 'always'
}

function exportText(content, filename) {
    const blob = new Blob([content], {type: 'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function generateColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function similarityScore(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function detectMood(text) {
    const lower = text.toLowerCase();
    if(lower.match(/(รัก|ชอบ|สุข|ดีใจ|happy|love)/)) return 'Happy';
    if(lower.match(/(โกรธ|ไม่พอใจ|angry|hate)/)) return 'Angry';
    if(lower.match(/(เศร้า|เสียใจ|sad|cry)/)) return 'Sad';
    if(lower.match(/(กลัว|worried|fear)/)) return 'Anxious';
    return 'Neutral';
}

function getMoodIcon(mood) {
    const icons = {
        'Happy': '😊',
        'Sad': '😢',
        'Angry': '😠',
        'Anxious': '😰',
        'Neutral': '😐'
    };
    return icons[mood] || '😐';
}

function extractTags(diary) {
    const tags = [];
    if(diary.match(/(รัก|ชอบ|ผูกพันธ์)/)) tags.push('Love');
    if(diary.match(/(ทะเลาะ|โกรธ|ไม่พอใจ)/)) tags.push('Conflict');
    if(diary.match(/(ลับ|ลับๆ|ความลับ)/)) tags.push('Secret');
    if(diary.match(/(สถานที่|เมือง|ห้อง|บ้าน)/)) tags.push('Location');
    if(diary.match(/(เวลา|ตอนนี้|วันนี้)/)) tags.push('Time');
    return [...new Set(tags)];
}

function generateStory(mems) {
    mems.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let story = "# Story Weave\n\n";
    
    mems.forEach(m => {
        story += `## ${m.content.rp_date} - ${m.character}\n`;
        story += `**Location**: ${m.content.rp_location || 'Unknown'}\n`;
        story += `**Mood**: ${m.content.rp_mood || 'Neutral'}\n\n`;
        story += `${m.content.diary}\n\n---\n\n`;
    });
    
    return story;
}

function generateLorebook(mems) {
    const lore = {
        name: "LumiPulse Generated Lorebook",
        entries: []
    };
    
    mems.forEach(m => {
        lore.entries.push({
            keys: [m.character],
            content: m.content.diary,
            comment: `From ${m.content.rp_date} at ${m.content.rp_location}`,
            selective: false,
            secondary_keys: [],
            constant: false
        });
    });
    
    return lore;
}

function highlightMemories(ids) {
    $('.lumi-card').removeClass('highlight');
    ids.forEach(id => {
        <LaTex>id_2</LaTex>{id}"]`).addClass('highlight');
    });
}

function detectWorldMode() {
    const ctx = SillyTavern.getContext();
    const chat = ctx.chat || [];
    const recent = chat.slice(-50);
    const text = recent.map(m => m.mes).join(' ').toLowerCase();
    
    if(text.match(/(fantasy|magic|wizard|elf|dwarf|dragon|castle|kingdom)/)) return 'Fantasy';
    if(text.match(/(sci-fi|space|robot|ai|future|technology)/)) return 'Sci-Fi';
    if(text.match(/(modern|today|city|car|phone|internet)/)) return 'Modern';
    return 'General';
}

// MODAL CONTROLLERS
// ═══════════════════════════════════════════════
function openModal(type = 'diary') {
    <LaTex>id_1</LaTex>('#lumi-title').text('LumiPulse - Settings');
    $('#lumi-overlay').css('display', 'flex').hide().fadeIn(200);
    renderSettings();
}

