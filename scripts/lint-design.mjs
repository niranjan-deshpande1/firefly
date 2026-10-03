// Drift checks from docs/design/build-manual.md 14.5, adapted for Firefly (DESIGN.md D3, D4).
// app/globals.css is the token file, so it is the one place literals may appear.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "components"];
const TOKEN_FILE = join("app", "globals.css");
const EXTS = /\.(tsx?|css|mjs)$/;

const CHECKS = [
  ["literal color", /#[0-9A-Fa-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/],
  ["locked property without a token", /(font-?family|font-?size|border-?radius|z-?index)\s*:\s*(?!var\()/i],
  ["literal px, ms or easing", /\b\d+(px|ms)\b|cubic-bezier/],
  ["banned effect", /gradient|backdrop-filter|backdrop-blur|drop-shadow|text-shadow/],
];

function walk(dir) {
  let out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out = out.concat(walk(path));
    else if (EXTS.test(name) && path !== TOKEN_FILE) out.push(path);
  }
  return out;
}

const failures = [];
for (const root of ROOTS) {
  let files = [];
  try { files = walk(root); } catch { continue; }
  for (const file of files) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      for (const [label, re] of CHECKS) {
        if (re.test(line)) failures.push(`${file}:${i + 1}  ${label}: ${line.trim()}`);
      }
    });
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`\n${failures.length} design drift match(es). Use tokens from app/globals.css.`);
  process.exit(1);
}
console.log("design drift checks: clean");
