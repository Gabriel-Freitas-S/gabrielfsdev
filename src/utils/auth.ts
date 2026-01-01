const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_INACTIVITY_MS = 1000 * 60 * 60 * 24 * 2; // 2 days

const settingsTableSQL =
    "CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)";
const sessionsTableSQL =
    "CREATE TABLE IF NOT EXISTS admin_sessions (token TEXT PRIMARY KEY, created_at INTEGER NOT NULL, last_active INTEGER NOT NULL, two_factor_verified INTEGER NOT NULL DEFAULT 0, user_agent TEXT, ip TEXT)";

type AdminSessionRow = {
    token: string;
    created_at: number;
    last_active: number;
    two_factor_verified: number;
    user_agent?: string | null;
    ip?: string | null;
};

function requireDB(env: any) {
    if (!env?.DB) throw new Error("D1 database is required for admin auth");
}

export async function sha256Hex(value: string): Promise<string> {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function ensureAdminTables(env: any) {
    if (!env?.DB) return;
    await env.DB.prepare(settingsTableSQL).run();
    await env.DB.prepare(sessionsTableSQL).run();
}

export async function getStoredPasswordHash(env: any): Promise<string | null> {
    if (!env?.DB) return null;
    await ensureAdminTables(env);
    const { results } = await env.DB.prepare(
        "SELECT value FROM admin_settings WHERE key = 'admin_password' LIMIT 1",
    ).all();
    const stored = results?.[0]?.value ?? null;

    // Bootstrap from environment once if nothing stored yet
    if (!stored && env?.ADMIN_PASSWORD) {
        const hash = await sha256Hex(env.ADMIN_PASSWORD);
        await savePasswordHash(env, hash);
        return hash;
    }

    return stored;
}

export async function savePasswordHash(env: any, hash: string) {
    requireDB(env);
    await env.DB.prepare(
        "INSERT OR REPLACE INTO admin_settings (key, value) VALUES ('admin_password', ?)",
    )
        .bind(hash)
        .run();
}

export async function verifyPassword(input: string, env: any): Promise<boolean> {
    const storedHash = await getStoredPasswordHash(env);
    if (!storedHash) return false;

    const hashedInput = await sha256Hex(input);
    return hashedInput === storedHash;
}

function cleanBase32(input: string): string {
    return input.replace(/\s+/g, "").toUpperCase();
}

function base32ToBytes(value: string): Uint8Array {
    const cleaned = cleanBase32(value).replace(/=+$/, "");
    let bits = "";
    for (const char of cleaned) {
        const index = BASE32_ALPHABET.indexOf(char);
        if (index === -1) throw new Error("Invalid base32 character");
        bits += index.toString(2).padStart(5, "0");
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return new Uint8Array(bytes);
}

function bytesToBase32(bytes: Uint8Array): string {
    let bits = "";
    for (const byte of bytes) {
        bits += byte.toString(2).padStart(8, "0");
    }
    let output = "";
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5);
        if (chunk.length < 5) {
            output += BASE32_ALPHABET[parseInt(chunk.padEnd(5, "0"), 2)];
        } else {
            output += BASE32_ALPHABET[parseInt(chunk, 2)];
        }
    }
    return output;
}

export function generateTwoFactorSecret(byteLength = 20): string {
    const buffer = new Uint8Array(byteLength);
    crypto.getRandomValues(buffer);
    return bytesToBase32(buffer);
}

export async function getTwoFactorSecret(env: any): Promise<string | null> {
    if (!env?.DB) return null;
    await ensureAdminTables(env);
    const { results } = await env.DB.prepare(
        "SELECT value FROM admin_settings WHERE key = 'two_factor_secret' LIMIT 1",
    ).all();
    const secret = results?.[0]?.value ?? null;

    if (secret) return cleanBase32(secret);

    // Bootstrap from environment once if nothing stored yet
    if (env?.ADMIN_TOTP_SECRET) {
        const cleaned = cleanBase32(env.ADMIN_TOTP_SECRET);
        await saveTwoFactorSecret(env, cleaned);
        return cleaned;
    }

    return null;
}

export async function saveTwoFactorSecret(env: any, secret: string) {
    requireDB(env);
    await ensureAdminTables(env);
    await env.DB.prepare(
        "INSERT OR REPLACE INTO admin_settings (key, value) VALUES ('two_factor_secret', ?)",
    )
        .bind(cleanBase32(secret))
        .run();
}

async function hotp(secretBytes: Uint8Array, counter: number, digits = 6) {
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setBigUint64(0, BigInt(counter));
    const key = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, buf);
    const bytes = new Uint8Array(signature);
    const offset = bytes[bytes.length - 1] & 0xf;
    const code =
        ((bytes[offset] & 0x7f) << 24) |
        ((bytes[offset + 1] & 0xff) << 16) |
        ((bytes[offset + 2] & 0xff) << 8) |
        (bytes[offset + 3] & 0xff);
    const otp = code % 10 ** digits;
    return otp.toString().padStart(digits, "0");
}

export async function verifyTOTP(secret: string, token: string, window = 2) {
    const normalizedToken = token.trim();
    if (!/^\d{6}$/.test(normalizedToken)) return false;
    const secretBytes = base32ToBytes(secret);
    const step = Math.floor(Date.now() / 1000 / 30);

    for (let i = -window; i <= window; i++) {
        const expected = await hotp(secretBytes, step + i);
        if (expected === normalizedToken) return true;
    }
    return false;
}

function randomHex(bytes = 32) {
    const buffer = new Uint8Array(bytes);
    crypto.getRandomValues(buffer);
    return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function createSession(env: any, request: Request, opts?: { twoFactorVerified?: boolean }) {
    requireDB(env);
    await ensureAdminTables(env);
    const token = randomHex(32);
    const now = Date.now();
    const ua = request.headers.get("user-agent")?.slice(0, 255) ?? null;
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? null;

    await env.DB.prepare(
        "INSERT OR REPLACE INTO admin_sessions (token, created_at, last_active, two_factor_verified, user_agent, ip) VALUES (?, ?, ?, ?, ?, ?)",
    )
        .bind(token, now, now, opts?.twoFactorVerified ? 1 : 0, ua, ip)
        .run();

    return { token, createdAt: now, lastActive: now };
}

export async function getSession(env: any, token: string): Promise<AdminSessionRow | null> {
    if (!env?.DB) return null;
    const row = await env.DB.prepare(
        "SELECT token, created_at, last_active, two_factor_verified, user_agent, ip FROM admin_sessions WHERE token = ?",
    )
        .bind(token)
        .first();
    return (row as AdminSessionRow | undefined) ?? null;
}

export function isSessionExpired(session: AdminSessionRow): boolean {
    return Date.now() - session.last_active > SESSION_MAX_INACTIVITY_MS;
}

export async function touchSession(env: any, token: string) {
    if (!env?.DB) return;
    const now = Date.now();
    await env.DB.prepare("UPDATE admin_sessions SET last_active = ? WHERE token = ?")
        .bind(now, token)
        .run();
}

export async function deleteSession(env: any, token: string) {
    if (!env?.DB) return;
    await env.DB.prepare("DELETE FROM admin_sessions WHERE token = ?")
        .bind(token)
        .run();
}

export function sessionCookieOptions(url: string) {
    return {
        path: "/",
        httpOnly: true,
        sameSite: "Lax" as const,
        secure: url.startsWith("https"),
        maxAge: 60 * 60 * 24 * 30,
    };
}

export function otpAuthURI(secret: string, label = "admin", issuer = "gabrielfs.dev") {
    const encodedLabel = encodeURIComponent(label);
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedSecret = encodeURIComponent(cleanBase32(secret));
    return `otpauth://totp/${encodedLabel}?secret=${encodedSecret}&issuer=${encodedIssuer}&period=30&digits=6`;
}
