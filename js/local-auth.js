// ===== Lokal autentifikatsiya (server yo'q — hisoblar shu qurilmada) =====
const LOCAL_ACCOUNTS_KEY = 'local_accounts';

function localAccounts() {
    return Store.read(LOCAL_ACCOUNTS_KEY, {});
}

function saveLocalAccounts(accounts) {
    Store.write(LOCAL_ACCOUNTS_KEY, accounts);
}

function randomSalt() {
    const bytes = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashLocalPassword(password, salt) {
    const value = `${salt}:${password}`;
    if (window.crypto && crypto.subtle) {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
        return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    // Zaxira variant (crypto.subtle bo'lmaganda) — faqat lokal qulf uchun
    let hash = 5381;
    for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
    return `fallback-${(hash >>> 0).toString(16)}`;
}

// Birinchi kirishda parol shu qurilma uchun yaratiladi, keyingi kirishlarda tekshiriladi.
async function localSignIn(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, message: "To'g'ri email kiriting." };
    }
    if (!password || password.length < 4) {
        return { ok: false, message: "Parol kamida 4 belgidan iborat bo'lishi kerak." };
    }

    const accounts = localAccounts();
    const existing = accounts[cleanEmail];

    if (existing) {
        const hash = await hashLocalPassword(password, existing.salt);
        if (hash !== existing.hash) {
            return { ok: false, message: "Parol noto'g'ri. Qayta urinib ko'ring." };
        }
        return { ok: true, created: false, account: { name: existing.name, email: cleanEmail } };
    }

    const salt = randomSalt();
    accounts[cleanEmail] = {
        name: cleanEmail.split('@')[0],
        salt,
        hash: await hashLocalPassword(password, salt),
        createdAt: new Date().toISOString()
    };
    saveLocalAccounts(accounts);
    return { ok: true, created: true, account: { name: accounts[cleanEmail].name, email: cleanEmail } };
}

function isAdminAccount(user) {
    return Boolean(user && user.email === ADMIN_EMAIL);
}
