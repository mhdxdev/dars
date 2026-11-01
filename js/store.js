// ===== Umumiy saqlash qatlami (localStorage) =====
// Admin faqat shu akkaunt uchun ochiladi
const ADMIN_EMAIL = 'mhdxdev@gmail.com';

const Store = {
    KEYS: { users: 'lesson_users', slides: 'slide_overrides', chats: 'messenger_state' },

    read(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (e) {
            return fallback;
        }
    },

    write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    users() {
        return this.read(this.KEYS.users, []);
    },

    recordUser(user) {
        const users = this.users();
        const now = new Date().toISOString();
        const existing = users.find((u) => u.email === user.email);
        if (existing) {
            existing.name = user.name || existing.name;
            existing.lastSeen = now;
        } else {
            users.push({
                name: user.name || user.email,
                email: user.email || '',
                picture: user.picture || '',
                firstSeen: now,
                lastSeen: now
            });
        }
        this.write(this.KEYS.users, users);
    },

    slideOverrides() {
        return this.read(this.KEYS.slides, {});
    },

    saveSlideOverride(index, title) {
        const overrides = this.slideOverrides();
        overrides[index] = title;
        this.write(this.KEYS.slides, overrides);
    },

    chats() {
        return this.read(this.KEYS.chats, null);
    },

    saveChats(state) {
        this.write(this.KEYS.chats, state);
    }
};

function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

function formatTime(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
}
