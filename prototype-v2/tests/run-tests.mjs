import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/varunkelkar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const { runTests } = require("./onboarding.spec.js");

const here = path.dirname(fileURLToPath(import.meta.url));
const prototypeDir = path.resolve(here, "..");
const workspaceDir = path.resolve(prototypeDir, "..");
const artifactDir = path.join(prototypeDir, "artifacts");
const port = 8766;
const baseUrl = `http://127.0.0.1:${port}/prototype-v2/`;
const python = "/Users/varunkelkar/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

await mkdir(artifactDir, { recursive: true });
const server = spawn(python, ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: workspaceDir, stdio: "ignore" });

const waitForServer = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Prototype server did not start");
};

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  await runTests({ browser, baseUrl, artifactDir });
  process.stdout.write("PASS: core flow, recovery, persistence, responsive layout, and reduced motion\n");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
