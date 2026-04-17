import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { z } from "zod";
import { ensureAdminTables, verifyPassword } from "../../../utils/auth";
import { ensureCoreTables } from "../../../utils/db";

export const prerender = false;

const deleteSchema = z.object({
    id: z.string().min(1, "ID ausente"),
    password: z.string().min(8, "Senha obrigatória"),
});

export const POST: APIRoute = async ({ request, redirect }) => {
    const url = new URL(request.url);
    const form = await request.formData();

    const parsed = deleteSchema.safeParse({
        id: form.get("id") ?? url.searchParams.get("id"),
        password: form.get("password"),
    });

    if (!parsed.success) {
        return new Response("Dados inválidos", { status: 400 });
    }

    if (!(await verifyPassword(parsed.data.password, env))) {
        return new Response("Senha incorreta", { status: 401 });
    }

    await ensureCoreTables(env);
    await ensureAdminTables(env);

    const currentTrack = await env.DB.prepare(
        "SELECT id, name, image_key FROM certification_tracks WHERE id = ?",
    )
        .bind(parsed.data.id)
        .first();

    if (currentTrack) {
        const imageKey = String((currentTrack as any).image_key || "");
        if (imageKey && env?.R2) {
            await env.R2.delete(imageKey);
        }

        await env.DB.prepare(
            `UPDATE certifications
             SET track_id = NULL, group_name = '', track_url = ''
             WHERE track_id = ? OR group_name = ?`,
        )
            .bind(parsed.data.id, (currentTrack as any).name)
            .run();

        await env.DB.prepare("DELETE FROM certification_tracks WHERE id = ?")
            .bind(parsed.data.id)
            .run();
    }

    return redirect("/admin/tracks");
};
