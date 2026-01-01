/// <reference path="../.astro/types.d.ts" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;

type ENV = {
    MY_KV: KVNamespace;
    DB: D1Database;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
    interface Locals extends Runtime { }
}
