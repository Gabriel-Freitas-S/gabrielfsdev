import type { APIRoute } from "astro";
import { z } from "zod";
import { ensureAdminTables, verifyPassword } from "../../../utils/auth";
import { ensureCoreTables } from "../../../utils/db";

export const prerender = false;

const deleteSchema = z.object({
	id: z.string().min(1, "ID ausente"),
	password: z.string().min(8, "Senha obrigatória"),
});

export const POST: APIRoute = async ({ request, locals, redirect }) => {
	const env = locals.runtime?.env;
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
	if (env?.DB) {
		await env.DB.prepare("DELETE FROM certifications WHERE id = ?")
			.bind(parsed.data.id)
			.run();
	}

	return redirect("/admin/certifications");
};

