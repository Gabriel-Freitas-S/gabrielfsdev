import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { syncProjectsFromGitHub } from "../../../utils/github";
import { ensureCoreTables } from "../../../utils/db";

export const prerender = false;

async function runSync(context: Parameters<APIRoute>[0]) {
    const { locals } = context;

    const redirectTo = (location: string) =>
        new Response(null, {
            status: 302,
            headers: { Location: location },
        });
    
    // Tenta obter env de várias formas para garantir compatibilidade com o runtime
    const runtime = (locals as any).runtime;
    const cloudflareEnv = runtime?.env || env;

    try {
        // Initialize DB
        await ensureCoreTables(cloudflareEnv);

        // Get GitHub credentials from environment
        const githubUsername = String(cloudflareEnv?.GITHUB_USERNAME || "").trim();
        const githubToken = String(
            cloudflareEnv?.GITHUB_TOKEN_SECRET || cloudflareEnv?.GITHUB_TOKEN || "",
        ).trim();

        if (!githubUsername || !githubToken) {
            const details = encodeURIComponent(
                `Credenciais GitHub ausentes. Username: ${githubUsername ? "OK" : "Missing"}, Token: ${githubToken ? "OK" : "Missing"}.`,
            );
            return redirectTo(`/admin/projects?error=credentials&message=${details}`);
        }

        // Sync projects
        const result = await syncProjectsFromGitHub(
            cloudflareEnv,
            githubUsername,
            githubToken
        );

        if (result.error) {
            const message = encodeURIComponent(result.error);
            return redirectTo(`/admin/projects?error=sync&message=${message}`);
        }

        // Redirect back to projects page with success
        return redirectTo(`/admin/projects?synced=true&inserted=${result.inserted}&updated=${result.updated}`);
    } catch (error: any) {
        const message = encodeURIComponent(error?.message || "Unknown error");
        return redirectTo(`/admin/projects?error=internal&message=${message}`);
    }
}

export const POST: APIRoute = async (context) => runSync(context);

export const GET: APIRoute = async (context) => runSync(context);
