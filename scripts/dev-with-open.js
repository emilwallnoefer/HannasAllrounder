#!/usr/bin/env node
const { spawn, exec } = require("child_process");

const dev = spawn("npx next dev", {
  stdio: "inherit",
  shell: true,
});

function openBrowser(url) {
  const cmd =
    process.platform === "win32"
      ? `start ${url}`
      : process.platform === "darwin"
        ? `open ${url}`
        : `xdg-open ${url}`;
  exec(cmd, () => {});
}

setTimeout(() => openBrowser("http://localhost:3000"), 3000);

dev.on("exit", (code) => process.exit(code ?? 0));
