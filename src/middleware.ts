import { env } from "cloudflare:workers";
import { defineMiddleware } from "astro/middleware";
import {
    SESSION_COOKIE,
    deleteSession,
    getSession,
    isSessionExpired,
    sessionCookieOptions,
    touchSession,
} from "./utils/auth";

// Security headers for all responses
const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://cdn.jsdelivr.net; worker-src 'self' blob: https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://*; connect-src 'self' https://cloudflareinsights.com https://cdn.jsdelivr.net;",
};

function addSecurityHeaders(response: Response): Response {
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(securityHeaders)) {
        newHeaders.set(key, value);
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, cookies, redirect, locals, request } = context;
    const pathname = url.pathname;

    // Redirect /favicon.ico → /favicon.svg (browsers request .ico automatically)
    if (pathname === "/favicon.ico") {
        return redirect("/favicon.svg", 301);
    }

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

    const response = await next();
    return addSecurityHeaders(response);
});
