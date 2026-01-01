import { legacyCertifications, legacyExperiences } from "../data/legacy";

export async function ensureCoreTables(env: any) {
    if (!env?.DB) return;
    await env.DB.batch([
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS experiences (id INTEGER PRIMARY KEY AUTOINCREMENT, company TEXT NOT NULL, role TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT, description TEXT NOT NULL, achievements TEXT)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS certifications (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, issuer TEXT NOT NULL, date TEXT NOT NULL, hours INTEGER, url TEXT, group_name TEXT)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
        ),
    ]);
}

export async function seedExperiencesIfEmpty(env: any) {
    if (!env?.DB) return;
    await ensureCoreTables(env);
    const { results } = await env.DB.prepare("SELECT COUNT(*) as count FROM experiences").run();
    const count = results?.[0]?.count ?? 0;
    if (count > 0) return;

    const inserts = legacyExperiences.map((xp) =>
        env.DB.prepare(
            "INSERT INTO experiences (company, role, start_date, end_date, description, achievements) VALUES (?, ?, ?, ?, ?, ?)",
        ).bind(
            xp.company,
            xp.role,
            xp.start_date,
            xp.end_date,
            xp.description,
            JSON.stringify(xp.achievements || []),
        ),
    );
    await env.DB.batch(inserts);
}

export async function seedCertificationsIfEmpty(env: any) {
    if (!env?.DB) return;
    await ensureCoreTables(env);
    const { results } = await env.DB.prepare("SELECT COUNT(*) as count FROM certifications").run();
    const count = results?.[0]?.count ?? 0;
    if (count > 0) return;

    const inserts = legacyCertifications.map((cert) =>
        env.DB.prepare(
            "INSERT INTO certifications (title, issuer, date, hours, url, group_name) VALUES (?, ?, ?, ?, ?, ?)",
        ).bind(
            cert.title,
            cert.issuer,
            cert.date,
            cert.hours ?? null,
            cert.url ?? "",
            cert.group_name ?? "",
        ),
    );
    await env.DB.batch(inserts);
}
