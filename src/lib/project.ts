import fs from "node:fs";
import path from "node:path";

export function getProjectRoot(): string {
  const raw = process.env.PROJECT_ROOT?.trim();
  const root = path.resolve(raw ? raw : process.cwd());
  const stat = fs.statSync(root, { throwIfNoEntry: false });
  if (!stat?.isDirectory()) {
    return process.cwd();
  }
  return root;
}
