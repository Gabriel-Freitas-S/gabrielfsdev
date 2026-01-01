import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware((context, next) => {
    const { url, cookies, redirect } = context;

    // Protect /admin routes, excluding login
    if (url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin/login") && !url.pathname.startsWith("/admin/logout")) {
        const session = cookies.get("admin_session");
        if (!session || session.value !== "true") {
            return redirect("/admin/login");
        }
    }

    if (url.pathname === "/admin/logout") {
        cookies.delete("admin_session", { path: "/" });
        return redirect("/admin/login");
    }

    return next();
});
