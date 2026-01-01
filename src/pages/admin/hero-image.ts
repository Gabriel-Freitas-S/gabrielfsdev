import type { APIRoute } from "astro";
import { z } from "zod";
import { verifyPassword } from "../../utils/auth";
import { ensureCoreTables } from "../../utils/db";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPE = "image/webp";

async function ensureTable(env: any) {
    if (!env?.DB) return;
    await env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
    ).run();
}

const uploadSchema = z.object({
    password: z.string().min(8, "Senha obrigatória"),
});

export const POST: APIRoute = async ({ request, locals, redirect }) => {
    const env = locals.runtime?.env;

    if (!env?.R2) {
        return new Response("R2 não configurado", { status: 500 });
    }
    if (!env?.DB) {
        return new Response("D1 não configurado", { status: 500 });
    }

    try {
        const form = await request.formData();
        await ensureCoreTables(env);
        const parsed = uploadSchema.safeParse({ password: form.get("password") });

        if (!parsed.success) {
            return new Response("Dados inválidos", { status: 400 });
        }

        if (!(await verifyPassword(parsed.data.password, env))) {
            return new Response("Senha incorreta", { status: 401 });
        }

        const file = form.get("image");

        if (!(file instanceof File)) {
            return new Response("Arquivo inválido", { status: 400 });
        }
        if (file.type !== ALLOWED_TYPE) {
            return new Response("Apenas .webp é permitido", { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return new Response("Arquivo excede 2MB", { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const key = `hero-${Date.now()}.webp`;

        await env.R2.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: ALLOWED_TYPE,
            },
        });

        await ensureTable(env);
        await env.DB.prepare(
            "INSERT OR REPLACE INTO site_content (key, value) VALUES ('hero_image_key', ?)",
        )
            .bind(key)
            .run();

        return redirect("/admin/content?img=1");
    } catch (err) {
        console.error(err);
        return new Response("Erro ao fazer upload", { status: 500 });
    }
};
