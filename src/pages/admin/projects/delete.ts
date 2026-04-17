import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { z } from "zod";
import { verifyPassword } from "../../../utils/auth";
import { ensureCoreTables } from "../../../utils/db";

export const prerender = false;

const deleteSchema = z.object({
    id: z.string().min(1),
    password: z.string().min(8),
});

export const POST: APIRoute = async ({ request, redirect }) => {
    try {
        const formData = await request.formData();
        const parsed = deleteSchema.safeParse({
            id: formData.get("id"),
            password: formData.get("password"),
        });

        if (!parsed.success) {
            return new Response("Dados inválidos", { status: 400 });
        }

        // Verify password
        const passwordOk = await verifyPassword(parsed.data.password, env);
        if (!passwordOk) {
            return new Response("Senha incorreta", { status: 401 });
        }

        // Initialize DB
        await ensureCoreTables(env);

        // Mark project as inactive (soft delete)
        await env.DB.prepare(
            "UPDATE projects SET is_active = 0 WHERE id = ?"
        )
            .bind(parsed.data.id)
            .run();

        return redirect("/admin/projects?deleted=true");
    } catch (error: any) {
        return new Response(
            `Erro ao deletar: ${error?.message || "Unknown error"}`,
            { status: 500 }
        );
    }
};
