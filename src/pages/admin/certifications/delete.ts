import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (id && locals.runtime?.env?.DB) {
		await locals.runtime.env.DB.prepare("DELETE FROM certifications WHERE id = ?").bind(id).run();
	}

	return redirect("/admin/certifications");
};

