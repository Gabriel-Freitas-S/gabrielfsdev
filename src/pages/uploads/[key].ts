import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
    const env = locals.runtime?.env;
    if (!env?.R2) return new Response("R2 não configurado", { status: 500 });

    const key = params.key;
    if (!key) return new Response("Chave ausente", { status: 400 });

    try {
        const object = await env.R2.get(key);
        if (!object) return new Response("Não encontrado", { status: 404 });

        const headers = new Headers();
        headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        if (object.body) return new Response(object.body, { headers });
        const body = await object.arrayBuffer();
        return new Response(body, { headers });
    } catch (e) {
        console.error(e);
        return new Response("Erro ao servir arquivo", { status: 500 });
    }
};
