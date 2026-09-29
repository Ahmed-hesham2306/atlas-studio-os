import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
await mkdir("dist", { recursive: true });
const result = await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2022",
  legalComments: "inline",
  define: { "process.env.NODE_ENV": '"production"' },
});
const js = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
const css = await readFile("src/styles.css", "utf8");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f8fa"><meta name="description" content="Atlas Studio OS: a React and TypeScript portfolio concept with projects, tasks, clients, invoices, analytics and local persistence. Built by Ahmed Hesham."><title>Atlas — Studio OS · Ahmed Hesham</title><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;
await writeFile("dist/atlas.html", html);
if (existsSync("../site/package.json")) {
  await mkdir("../site/dist/assets/demos", { recursive: true });
  await writeFile("../site/dist/assets/demos/atlas.html", html);
}
console.log(`Built Atlas React app (${Math.round(html.length / 1024)} KB).`);
