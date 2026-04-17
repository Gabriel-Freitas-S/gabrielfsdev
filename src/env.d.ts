/// <reference path="../.astro/types.d.ts" />

type R2Bucket = import("@cloudflare/workers-types").R2Bucket;

type ENV = {
    DB: D1Database;
    R2: R2Bucket;
    GITHUB_USERNAME?: string;
    GITHUB_TOKEN?: string;
    GITHUB_TOKEN_SECRET?: string;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
    interface Locals extends Runtime { }
}
