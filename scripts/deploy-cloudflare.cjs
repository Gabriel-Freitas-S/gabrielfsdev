#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const readline = require("node:readline");

const target = (process.argv[2] || "preview").toLowerCase();
const approvalPhrase = "AUTORIZO_DEPLOY_PRODUCAO_GABRIELFSDEV";

function runCommand(command, args) {
    const useWindowsShell = process.platform === "win32";
    const finalCommand = useWindowsShell ? "cmd.exe" : command;
    const finalArgs = useWindowsShell
        ? ["/d", "/s", "/c", [command, ...args].join(" ")]
        : args;

    const result = spawnSync(finalCommand, finalArgs, {
        stdio: "inherit",
    });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

function ask(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    if (target !== "preview" && target !== "production") {
        console.error("Alvo invalido. Use: preview ou production");
        process.exit(1);
    }

    if (target === "production") {
        if (!process.stdin.isTTY) {
            console.error("Deploy de producao bloqueado sem terminal interativo.");
            process.exit(1);
        }

        const answer = await ask(
            `Digite ${approvalPhrase} para autorizar deploy em producao: `,
        );

        if (answer.trim() !== approvalPhrase) {
            console.error("Deploy de producao bloqueado: autorizacao invalida.");
            process.exit(1);
        }
    }

    const args = ["wrangler", "deploy", "dist/server/entry.mjs", "--config", "wrangler.toml", "--assets", "dist/client"];

    if (target === "production") {
        args.push("--env", "production");
    } else {
        args.push("--env", "preview");
    }

    console.log(`Iniciando deploy para ${target}...`);
    const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
    runCommand(npxCommand, args);
}

main().catch((error) => {
    console.error("Falha no deploy:", error);
    process.exit(1);
});
