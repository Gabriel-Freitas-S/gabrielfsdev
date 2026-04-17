import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { z } from "zod";
import { ensureAdminTables, verifyPassword } from "../../../utils/auth";
import { ensureCoreTables } from "../../../utils/db";

export const prerender = false;

const deleteImageSchema = z.object({
    id: z.string().min(1, "ID ausente"),
    password: z.string().min(8, "Senha obrigatória"),
});

export const POST: APIRoute = async ({ request, redirect }) => {
    const url = new URL(request.url);
    const form = await request.formData();

    const parsed = deleteImageSchema.safeParse({
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

    const cert = await env.DB.prepare(
        "SELECT image_key FROM certifications WHERE id = ?",
    )
        .bind(parsed.data.id)
        .first();

    const imageKey = String((cert as any)?.image_key || "");
    if (imageKey && env?.R2) {
        await env.R2.delete(imageKey);
    }

    await env.DB.prepare(
        "UPDATE certifications SET image_key = NULL, image_mime = NULL, image_size_bytes = NULL, image_updated_at = NULL WHERE id = ?",
    )
        .bind(parsed.data.id)
        .run();

    return redirect(`/admin/certifications/${parsed.data.id}`);
};
