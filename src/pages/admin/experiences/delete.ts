---
export const POST = async ({ request, locals, redirect }) => {
    // Basic delete handler
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id && locals.runtime?.env?.DB) {
        await locals.runtime.env.DB.prepare("DELETE FROM experiences WHERE id = ?").bind(id).run();
    }

    return redirect("/admin/experiences");
};
