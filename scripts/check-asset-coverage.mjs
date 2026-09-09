import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const publicRoot = join(root, "public", "assets");
const assetExtensions = new Set([".png", ".webp", ".jpg", ".jpeg", ".svg", ".mp3", ".ogg", ".mp4", ".webm"]);

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const normalize = (path) => path.replaceAll("\\", "/");
const docs = walk(join(root, "docs")).filter((file) => extname(file) === ".md");
const docText = docs.map((file) => readFileSync(file, "utf8")).join("\n");
const sourceFiles = [join(root, "app"), join(root, "components"), join(root, "lib")]
  .flatMap(walk)
  .filter((file) => [".ts", ".tsx", ".js", ".jsx", ".css"].includes(extname(file)));

const actual = walk(publicRoot)
  .filter((file) => assetExtensions.has(extname(file).toLowerCase()))
  .map((file) => normalize(relative(root, file)));
const undocumented = actual.filter((file) => !docText.includes(file));

const codeReferences = new Set();
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/["'`](\/assets\/[^"'`?#]+\.(?:png|webp|jpe?g|svg|mp3|ogg|mp4|webm))["'`]/gi)) {
    codeReferences.add(match[1]);
  }
}

const missingCodeFiles = [...codeReferences].filter((asset) => !existsSync(join(root, "public", asset)));
const undocumentedCodeFiles = [...codeReferences].filter((asset) => !docText.includes(`public${asset}`));

const missingApprovedFiles = [];
for (const line of docText.split(/\r?\n/)) {
  if (!/\b(approved|cleaned|generated)\b/.test(line)) continue;
  for (const match of line.matchAll(/public\/assets\/[^`|;，；\s]+\.(?:png|webp|jpe?g|svg|mp3|ogg|mp4|webm)/gi)) {
    if (!existsSync(join(root, match[0]))) missingApprovedFiles.push(match[0]);
  }
}

const failures = [
  ["存在未登记的 public 素材", undocumented],
  ["代码引用的素材文件不存在", missingCodeFiles],
  ["代码引用的素材无法反查文档", undocumentedCodeFiles],
  ["文档标记完成但文件不存在", [...new Set(missingApprovedFiles)]],
].filter(([, items]) => items.length);

if (failures.length) {
  for (const [title, items] of failures) {
    console.error(`\n${title}:`);
    for (const item of items) console.error(`- ${item}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Asset coverage passed: ${actual.length} files, ${codeReferences.size} code references.`);
}
