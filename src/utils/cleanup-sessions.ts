import { SESSION_MAX_INACTIVITY_MS } from "./auth";

/**
 * Clean up expired sessions from the database.
 * Call this periodically (e.g., on middleware init or via scheduled worker).
 */
export async function cleanupExpiredSessions(env: any): Promise<number> {
    if (!env?.DB) return 0;

    const cutoff = Date.now() - SESSION_MAX_INACTIVITY_MS;

    try {
        // Delete sessions that haven't been active since the cutoff time
        const result = await env.DB.prepare(
            "DELETE FROM admin_sessions WHERE last_active < ?"
        )
            .bind(cutoff)
            .run();

        return result.changes ?? 0;
    } catch (e) {
        console.error("Error cleaning up sessions:", e);
        return 0;
    }
}
