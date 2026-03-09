import fs from "node:fs";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProjectRoot } from "../lib/project.js";

const KEY_FILES = ["package.json", "tsconfig.json", "README.md", ".env.example"];

function walkDir(dir: string, depth: number, maxDepth: number, prefix: string): string[] {
  if (depth > maxDepth) return [];
  const lines: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return lines;
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : 1));
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e) continue;
    const isLast = i === entries.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const name = e.isDirectory() ? e.name + "/" : e.name;
    lines.push(prefix + branch + name);
    if (e.isDirectory() && depth < maxDepth) {
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      lines.push(...walkDir(path.join(dir, e.name), depth + 1, maxDepth, nextPrefix));
    }
  }
  return lines;
}

export function registerProjectStructure(server: McpServer): void {
  server.registerTool(
    "project-structure",
    {
      title: "Project structure",
      description: "Return directory tree or key files list",
      inputSchema: z.object({
        depth: z.number().optional(),
      }),
    },
    async (args) => {
      const root = getProjectRoot();
      const parts: string[] = [];
      const depth = args.depth ?? 2;
      if (depth > 0) {
        const base = path.basename(root) || ".";
        parts.push(base + "/");
        parts.push(...walkDir(root, 1, depth, ""));
      }
      const present = KEY_FILES.filter((f) => {
        try {
          fs.accessSync(path.join(root, f));
          return true;
        } catch {
          return false;
        }
      });
      parts.push("\nKey files at root: " + (present.length > 0 ? present.join(", ") : "none"));
      return { content: [{ type: "text" as const, text: parts.join("\n") }] };
    }
  );
}
