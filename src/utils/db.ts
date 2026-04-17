import { legacyCertifications, legacyExperiences } from "../data/legacy";

export async function ensureCoreTables(env: any) {
    if (!env?.DB) return;
    await env.DB.batch([
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS experiences (id INTEGER PRIMARY KEY AUTOINCREMENT, company TEXT NOT NULL, role TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT, description TEXT NOT NULL, achievements TEXT)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS certification_tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, url TEXT DEFAULT '', image_key TEXT, image_mime TEXT, image_size_bytes INTEGER, image_updated_at TEXT)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS certifications (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, issuer TEXT NOT NULL, date TEXT NOT NULL, hours INTEGER, url TEXT, image_key TEXT, image_mime TEXT, image_size_bytes INTEGER, image_updated_at TEXT, track_url TEXT DEFAULT '', group_name TEXT, track_id INTEGER)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS admin_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
        ),
        env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, github_repo_id INTEGER NOT NULL UNIQUE, name TEXT NOT NULL, description TEXT, technologies TEXT DEFAULT '[]', is_private INTEGER DEFAULT 0, github_url TEXT NOT NULL, live_url TEXT, homepage TEXT, stars INTEGER DEFAULT 0, topics TEXT DEFAULT '[]', last_updated TEXT, synced_at TEXT, is_active INTEGER DEFAULT 0, custom_name TEXT, custom_description TEXT, order_position INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)",
        ),
    ]);

    // Safe migration for older databases.
    const pragma = await env.DB.prepare("PRAGMA table_info(certifications)").run();
    const columns = new Set((pragma.results || []).map((col: any) => col.name));
    if (!columns.has("track_url")) {
        await env.DB.prepare("ALTER TABLE certifications ADD COLUMN track_url TEXT").run();
    }
    if (!columns.has("track_id")) {
        await env.DB.prepare("ALTER TABLE certifications ADD COLUMN track_id INTEGER").run();
    }
    if (!columns.has("image_key")) {
        await env.DB.prepare("ALTER TABLE certifications ADD COLUMN image_key TEXT").run();
    }
    if (!columns.has("image_mime")) {
        await env.DB.prepare("ALTER TABLE certifications ADD COLUMN image_mime TEXT").run();
    }
    if (!columns.has("image_size_bytes")) {
        await env.DB.prepare("ALTER TABLE certifications ADD COLUMN image_size_bytes INTEGER").run();
    }
    if (!columns.has("image_updated_at")) {
        await env.DB.prepare("ALTER TABLE certifications ADD COLUMN image_updated_at TEXT").run();
    }

    const tracksPragma = await env.DB.prepare("PRAGMA table_info(certification_tracks)").run();
    const trackColumns = new Set((tracksPragma.results || []).map((col: any) => col.name));
    if (!trackColumns.has("image_key")) {
        await env.DB.prepare("ALTER TABLE certification_tracks ADD COLUMN image_key TEXT").run();
    }
    if (!trackColumns.has("image_mime")) {
        await env.DB.prepare("ALTER TABLE certification_tracks ADD COLUMN image_mime TEXT").run();
    }
    if (!trackColumns.has("image_size_bytes")) {
        await env.DB.prepare("ALTER TABLE certification_tracks ADD COLUMN image_size_bytes INTEGER").run();
    }
    if (!trackColumns.has("image_updated_at")) {
        await env.DB.prepare("ALTER TABLE certification_tracks ADD COLUMN image_updated_at TEXT").run();
    }

    // Backfill tracks from existing grouped certifications.
    await env.DB.prepare(
        `INSERT OR IGNORE INTO certification_tracks (name, url)
         SELECT TRIM(group_name), MAX(COALESCE(NULLIF(track_url, ''), ''))
         FROM certifications
         WHERE TRIM(COALESCE(group_name, '')) <> ''
         GROUP BY TRIM(group_name)`,
    ).run();

    // Sync track URL from certifications when track URL is still empty.
    await env.DB.prepare(
        `UPDATE certification_tracks
         SET url = (
                SELECT c.track_url
                FROM certifications c
                WHERE TRIM(COALESCE(c.group_name, '')) = certification_tracks.name
                    AND TRIM(COALESCE(c.track_url, '')) <> ''
                LIMIT 1
         )
         WHERE TRIM(COALESCE(url, '')) = ''
             AND EXISTS (
                SELECT 1
                FROM certifications c
                WHERE TRIM(COALESCE(c.group_name, '')) = certification_tracks.name
                    AND TRIM(COALESCE(c.track_url, '')) <> ''
         )`,
    ).run();

    // Link certifications to tracks by name when track_id is missing.
    await env.DB.prepare(
        `UPDATE certifications
         SET track_id = (
                SELECT t.id
                FROM certification_tracks t
                WHERE t.name = TRIM(COALESCE(certifications.group_name, ''))
                LIMIT 1
         )
         WHERE track_id IS NULL
             AND TRIM(COALESCE(group_name, '')) <> ''`,
    ).run();

    // Migrations for projects table
    const projectsPragma = await env.DB.prepare("PRAGMA table_info(projects)").run();
    const projectColumns = new Set((projectsPragma.results || []).map((col: any) => col.name));
    if (!projectColumns.has("github_repo_id")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN github_repo_id INTEGER").run();
    }
    if (!projectColumns.has("name")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN name TEXT").run();
    }
    if (!projectColumns.has("description")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN description TEXT").run();
    }
    if (!projectColumns.has("technologies")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN technologies TEXT DEFAULT '[]'").run();
    }
    if (!projectColumns.has("is_private")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN is_private INTEGER DEFAULT 0").run();
    }
    if (!projectColumns.has("github_url")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN github_url TEXT").run();
    }
    if (!projectColumns.has("live_url")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN live_url TEXT").run();
    }
    if (!projectColumns.has("homepage")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN homepage TEXT").run();
    }
    if (!projectColumns.has("stars")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN stars INTEGER DEFAULT 0").run();
    }
    if (!projectColumns.has("topics")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN topics TEXT DEFAULT '[]'").run();
    }
    if (!projectColumns.has("last_updated")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN last_updated TEXT").run();
    }
    if (!projectColumns.has("synced_at")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN synced_at TEXT").run();
    }
    if (!projectColumns.has("is_active")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN is_active INTEGER DEFAULT 0").run();
    }
    if (!projectColumns.has("custom_name")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN custom_name TEXT").run();
    }
    if (!projectColumns.has("custom_description")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN custom_description TEXT").run();
    }
    if (!projectColumns.has("order_position")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN order_position INTEGER DEFAULT 0").run();
    }
    if (!projectColumns.has("created_at")) {
        await env.DB.prepare("ALTER TABLE projects ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP").run();
    }
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
            "INSERT INTO certifications (title, issuer, date, hours, url, track_url, group_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ).bind(
            cert.title,
            cert.issuer,
            cert.date,
            cert.hours ?? null,
            cert.url ?? "",
            (cert as any).track_url ?? "",
            cert.group_name ?? "",
        ),
    );
    await env.DB.batch(inserts);
}
