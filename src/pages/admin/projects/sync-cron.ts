import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { syncProjectsFromGitHub } from "../../../utils/github";
import { ensureCoreTables } from "../../../utils/db";

export const prerender = false;

/**
 * Scheduled sync handler for cron job
 * Should be called once per week by Cloudflare cron trigger
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        // Verify the request comes from Cloudflare (cron trigger)
        // Cron requests from Cloudflare have specific headers
        const cfCronKey = request.headers.get("cf-cron");

        if (!cfCronKey) {
            return new Response(
                JSON.stringify({
                    error: "Forbidden",
                    message: "This endpoint can only be called by Cloudflare cron",
                }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        // Initialize DB
        await ensureCoreTables(env);

        // Get GitHub credentials from environment
        const githubUsername = String(env?.GITHUB_USERNAME || "").trim();
        const githubToken = String(env?.GITHUB_TOKEN_SECRET || env?.GITHUB_TOKEN || "").trim();

        if (!githubUsername || !githubToken) {
            return new Response(
                JSON.stringify({
                    error: "Configuration error",
                    message: "GitHub credentials not configured",
                    timestamp: new Date().toISOString(),
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        console.log(
            `[CRON] Starting projects sync at ${new Date().toISOString()}`
        );

        // Sync projects
        const result = await syncProjectsFromGitHub(
            env,
            githubUsername,
            githubToken
        );

        if (result.error) {
            console.error(`[CRON] Sync failed: ${result.error}`);
            return new Response(
                JSON.stringify({
                    error: "Sync failed",
                    message: result.error,
                    timestamp: new Date().toISOString(),
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const successMsg = `[CRON] Sync completed: ${result.inserted} inserted, ${result.updated} updated at ${new Date().toISOString()}`;
        console.log(successMsg);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Projects synced successfully",
                inserted: result.inserted,
                updated: result.updated,
                timestamp: new Date().toISOString(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error: any) {
        const errorMsg = `[CRON] Error: ${error?.message || "Unknown error"}`;
        console.error(errorMsg);

        return new Response(
            JSON.stringify({
                error: "Internal server error",
                message: error?.message || "Unknown error",
                timestamp: new Date().toISOString(),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
