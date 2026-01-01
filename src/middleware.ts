import { defineMiddleware } from "astro/middleware";
import {
    SESSION_COOKIE,
    deleteSession,
    getSession,
    isSessionExpired,
    sessionCookieOptions,
    touchSession,
} from "./utils/auth";

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect, locals, request } = context;
    const pathname = url.pathname;
    const env = locals.runtime?.env;
    const isAdminRoute = pathname.startsWith("/admin");
    const isLogin = pathname.startsWith("/admin/login");
    const isLogout = pathname.startsWith("/admin/logout");
    const sessionToken = cookies.get(SESSION_COOKIE)?.value;

    if (isLogout) {
        if (sessionToken) {
            await deleteSession(env, sessionToken);
        }
        cookies.delete(SESSION_COOKIE, { path: "/" });
        return redirect("/admin/login");
    }

    if (isAdminRoute && !isLogin) {
        if (!sessionToken) {
            return redirect("/admin/login");
        }

        const session = await getSession(env, sessionToken);
        if (!session || !session.two_factor_verified || isSessionExpired(session)) {
            await deleteSession(env, sessionToken);
            cookies.delete(SESSION_COOKIE, { path: "/" });
            return redirect("/admin/login");
        }

        await touchSession(env, sessionToken);
        cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions(request.url));
    }

    return next();
});
