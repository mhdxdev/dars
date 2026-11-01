// ===== Admin panel — faqat ADMIN_EMAIL uchun =====
let adminTab = 'users';

function adminStatCard(label, value) {
    return `
        <div class="bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2.5">
            <div class="text-[10px] uppercase tracking-wider text-slate-500">${escapeHtml(label)}</div>
            <div class="text-lg font-bold text-white">${escapeHtml(value)}</div>
        </div>`;
}

function adminBody(tab) {
    if (tab === 'users') {
        const users = Store.users();
        if (!users.length) {
            return '<p class="text-xs text-slate-400">Hali hech kim ro\'yxatdan o\'tmagan.</p>';
        }
        return `
            <div class="space-y-2">
                ${users.map((user) => `
                    <div class="flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2">
                        ${user.picture
                            ? `<img src="${escapeHtml(user.picture)}" alt="" class="w-7 h-7 rounded-full shrink-0">`
                            : `<span class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[11px] shrink-0">${escapeHtml((user.name || '?').charAt(0))}</span>`}
                        <div class="min-w-0 flex-1">
                            <div class="text-xs font-semibold text-white truncate">${escapeHtml(user.name)}</div>
                            <div class="text-[10px] text-slate-400 truncate">${escapeHtml(user.email)}</div>
                        </div>
                        <span class="text-[9px] uppercase tracking-wide text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 shrink-0">${escapeHtml(user.method || 'google')}</span>
                        <div class="text-[10px] text-slate-500 text-right shrink-0">${escapeHtml(formatTime(user.lastSeen))}</div>
                    </div>`).join('')}
            </div>
            <p class="text-[10px] text-slate-500 mt-3">Ro'yxat shu brauzerda saqlanadi — server yo'q.</p>`;
    }

    if (tab === 'lesson') {
        const slides = Array.from(document.querySelectorAll('#slides-container .slide'));
        return `
            <div class="space-y-2">
                ${slides.map((slide, index) => {
                    const heading = slide.querySelector('h2, h3');
                    const title = heading ? heading.textContent.trim() : `Slayd ${index + 1}`;
                    return `
                        <div class="flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-xl px-2.5 py-2">
                            <span class="text-[10px] text-slate-500 w-12 shrink-0">Slayd ${index + 1}</span>
                            <input data-slide-input="${index}" value="${escapeHtml(title)}" class="flex-1 min-w-0 bg-transparent text-xs text-white border-b border-transparent focus:border-indigo-500 focus:outline-none py-0.5">
                            <button data-goto="${index}" class="text-[10px] text-indigo-400 hover:text-indigo-300 shrink-0">Ochish</button>
                        </div>`;
                }).join('')}
            </div>
            <p class="text-[10px] text-slate-500 mt-3">Sarlavhani o'zgartirsangiz, slaydda darhol yangilanadi.</p>`;
    }

    const state = loadMessengerState();
    const users = Store.users();
    const messages = state.list.reduce((sum, chat) => sum + chat.thread.length, 0);
    const lastSeen = users.reduce((latest, user) => {
        if (!user.lastSeen) return latest;
        return !latest || user.lastSeen > latest ? user.lastSeen : latest;
    }, '');

    return `
        <div class="grid grid-cols-2 gap-2">
            ${adminStatCard('Foydalanuvchilar', users.length)}
            ${adminStatCard('Chatlar', state.list.length)}
            ${adminStatCard('Xabarlar', messages)}
            ${adminStatCard('Oxirgi faollik', lastSeen ? formatTime(lastSeen) : '—')}
        </div>
        <div class="mt-3 space-y-1.5">
            ${state.list.map((chat) => `
                <div class="flex items-center justify-between bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2">
                    <span class="text-xs text-slate-200 truncate">${chat.avatar} ${escapeHtml(chat.name)}</span>
                    <span class="text-[10px] text-slate-500 shrink-0">${chat.thread.length} xabar</span>
                </div>`).join('')}
        </div>`;
}

function renderAdmin() {
    const container = document.getElementById('view-admin');
    if (!container) return;

    const user = currentUser();
    if (!user || user.email !== ADMIN_EMAIL) {
        container.innerHTML = '<div class="glass-panel p-6 rounded-3xl text-center text-xs text-slate-400">Bu bo\'lim faqat administrator uchun.</div>';
        return;
    }

    const tabs = [
        { id: 'users', label: '👤 Foydalanuvchilar' },
        { id: 'lesson', label: '📊 Dars' },
        { id: 'stats', label: '💬 Statistika' }
    ];

    container.innerHTML = `
        <div class="glass-panel p-4 sm:p-6 rounded-3xl space-y-4">
            <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h2 class="text-base sm:text-lg font-bold text-white">Admin panel</h2>
                <span class="text-[10px] ${user.local ? 'text-sky-300' : 'text-emerald-400'} font-mono truncate">${escapeHtml(user.email)} · ${user.local ? 'lokal' : 'google'}</span>
            </div>
            <div class="flex flex-wrap gap-2">
                ${tabs.map((tab) => `
                    <button data-admin-tab="${tab.id}" class="px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition ${adminTab === tab.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}">${tab.label}</button>`).join('')}
            </div>
            <div id="admin-body">${adminBody(adminTab)}</div>
        </div>`;

    container.querySelectorAll('[data-admin-tab]').forEach((button) => {
        button.onclick = () => {
            adminTab = button.dataset.adminTab;
            renderAdmin();
        };
    });

    container.querySelectorAll('[data-slide-input]').forEach((input) => {
        input.oninput = () => {
            Store.saveSlideOverride(Number(input.dataset.slideInput), input.value);
            applySlideOverrides();
        };
    });

    container.querySelectorAll('[data-goto]').forEach((button) => {
        button.onclick = () => {
            goToSlide(Number(button.dataset.goto));
            showView('lesson');
        };
    });
}
