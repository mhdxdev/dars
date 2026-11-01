// ===== Telegram Web uslubidagi messenger (demo rejim) =====
const DEMO_CHATS = [
    {
        id: 'saved',
        name: 'Saqlangan xabarlar',
        avatar: '📌',
        thread: [
            { text: "Ochiq dars materiallari shu chatda saqlanadi.", out: false, time: '09:10' }
        ]
    },
    {
        id: 'parents',
        name: '9-A sinf ota-onalari',
        avatar: '👥',
        thread: [
            { text: "Assalomu alaykum! Ertaga ochiq dars bo'ladi.", out: false, time: '08:40' },
            { text: "Ratsional ko'rsatkichli daraja mavzusi.", out: false, time: '08:41' },
            { text: "Barcha o'quvchilar qatnashadi, rahmat!", out: true, time: '08:52' }
        ]
    },
    {
        id: 'dilnoza',
        name: 'Dilnoza R.',
        avatar: '👩‍🏫',
        thread: [
            { text: 'Formulalar faylini tashladim, tekshirib ko\'ring.', out: false, time: 'Kechga yaqin' },
            { text: "Rahmat, ko'rib chiqaman.", out: true, time: '09:05' }
        ]
    },
    {
        id: 'bot',
        name: 'Dars bot',
        avatar: '🤖',
        thread: [
            { text: 'Bugungi reja tayyor: 22 slayd, 3 ta mashq.', out: false, time: '07:30' }
        ]
    }
];

let messengerState = null;
let showThreadOnMobile = false;

function loadMessengerState() {
    if (messengerState) return messengerState;
    messengerState = Store.chats();
    if (!messengerState) {
        messengerState = {
            activeId: DEMO_CHATS[0].id,
            list: DEMO_CHATS.map((chat) => ({
                id: chat.id,
                name: chat.name,
                avatar: chat.avatar,
                preview: chat.thread[chat.thread.length - 1].text,
                thread: chat.thread.map((message, i) => ({ id: `${chat.id}-${i}`, ...message }))
            }))
        };
        Store.saveChats(messengerState);
    }
    return messengerState;
}

function activeChat() {
    const state = loadMessengerState();
    return state.list.find((chat) => chat.id === state.activeId) || state.list[0];
}

function openChat(id) {
    const state = loadMessengerState();
    state.activeId = id;
    showThreadOnMobile = true;
    Store.saveChats(state);
    renderMessenger();
}

function sendMessage(text) {
    const value = (text || '').trim();
    if (!value) return;
    const state = loadMessengerState();
    const chat = activeChat();
    if (!chat) return;
    const time = new Date().toTimeString().slice(0, 5);
    chat.thread.push({ id: `${chat.id}-${Date.now()}`, text: value, out: true, time });
    chat.preview = value;
    Store.saveChats(state);
    renderMessenger();
}

function renderMessenger() {
    const container = document.getElementById('view-messenger');
    if (!container) return;

    const state = loadMessengerState();
    const chat = activeChat();
    const wide = window.innerWidth >= 640;
    const showThread = wide || showThreadOnMobile;

    const listItems = state.list.map((item) => {
        const active = chat && item.id === chat.id;
        return `
            <button data-chat="${escapeHtml(item.id)}" class="w-full text-left px-3 py-2.5 flex items-center gap-2.5 border-b border-slate-800/70 ${active ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'}">
                <span class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">${item.avatar}</span>
                <span class="min-w-0 flex-1">
                    <span class="block text-xs font-semibold text-white truncate">${escapeHtml(item.name)}</span>
                    <span class="block text-[11px] text-slate-400 truncate">${escapeHtml(item.preview || '')}</span>
                </span>
            </button>`;
    }).join('');

    const thread = chat ? chat.thread.map((message) => `
        <div class="flex ${message.out ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[82%] px-3 py-1.5 rounded-2xl text-[12px] leading-relaxed ${message.out ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-slate-800 text-slate-100 rounded-bl-md'}">
                ${escapeHtml(message.text)}
                <span class="block text-[9px] mt-0.5 text-right ${message.out ? 'text-indigo-200' : 'text-slate-400'}">${escapeHtml(message.time)}</span>
            </div>
        </div>`).join('') : '';

    container.innerHTML = `
        <div class="glass-panel rounded-3xl overflow-hidden flex h-[70vh] min-h-[420px]">
            <aside class="${showThread ? 'hidden sm:flex' : 'flex'} w-full sm:w-72 shrink-0 border-r border-slate-800 flex-col">
                <div class="px-3 py-3 border-b border-slate-800">
                    <div class="flex items-center justify-between gap-2">
                        <h2 class="text-sm font-bold text-white">Messenger</h2>
                        <span class="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">Demo</span>
                    </div>
                    <p class="text-[10px] text-slate-500 leading-snug mt-1">Chatlar shu qurilmada saqlanadi</p>
                </div>
                <div class="overflow-y-auto flex-1">${listItems}</div>
            </aside>

            <section class="${showThread ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0">
                <header class="px-3 py-2.5 border-b border-slate-800 flex items-center gap-2">
                    <button id="chat-back" class="sm:hidden text-slate-400 hover:text-white text-sm px-1">&larr;</button>
                    <span class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">${chat ? chat.avatar : ''}</span>
                    <div class="min-w-0">
                        <div class="text-xs font-semibold text-white truncate">${chat ? escapeHtml(chat.name) : ''}</div>
                        <div class="text-[10px] text-emerald-400">online</div>
                    </div>
                </header>
                <div id="thread" class="flex-1 overflow-y-auto p-3 space-y-2">${thread}</div>
                <form id="msg-form" class="p-2.5 border-t border-slate-800 flex gap-2">
                    <input id="msg-input" autocomplete="off" placeholder="Xabar yozing..." class="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl text-xs font-semibold shrink-0">Yuborish</button>
                </form>
            </section>
        </div>`;

    container.querySelectorAll('[data-chat]').forEach((element) => {
        element.onclick = () => openChat(element.dataset.chat);
    });

    const form = container.querySelector('#msg-form');
    const input = container.querySelector('#msg-input');
    form.onsubmit = (event) => {
        event.preventDefault();
        sendMessage(input.value);
    };
    container.querySelector('#chat-back').onclick = () => {
        showThreadOnMobile = false;
        renderMessenger();
    };

    const threadElement = container.querySelector('#thread');
    threadElement.scrollTop = threadElement.scrollHeight;
}
