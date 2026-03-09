import fs from "node:fs/promises";
import path from "node:path";

export async function readManifest(root: string): Promise<object> {
  const filePath = path.join(root, "package.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as object;
  } catch {
    return {};
  }
}
