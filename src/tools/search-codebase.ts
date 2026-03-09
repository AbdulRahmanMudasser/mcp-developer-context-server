import fs from "node:fs/promises";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fg from "fast-glob";
import { getProjectRoot } from "../lib/project.js";

const MAX_FILES = 50;
const MAX_MATCHES = 100;

export function registerSearchCodebase(server: McpServer): void {
  server.registerTool(
    "search-codebase",
    {
      title: "Search codebase",
      description: "Search files by pattern with optional glob",
      inputSchema: z.object({
        pattern: z.string(),
        glob: z.string().optional(),
      }),
    },
    async (args) => {
      const root = getProjectRoot();
      const globPattern = args.glob ?? "**/*";
      let regex: RegExp;
      try {
        regex = new RegExp(args.pattern);
      } catch {
        regex = new RegExp(args.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      }
      const files = await fg(globPattern, {
        cwd: root,
        absolute: true,
        ignore: ["**/node_modules/**", "**/dist/**"],
        onlyFiles: true,
      });
      const lines: string[] = [];
      let matchCount = 0;
      for (let i = 0; i < files.length && i < MAX_FILES && matchCount < MAX_MATCHES; i++) {
        const filePath = files[i];
        if (filePath === undefined) continue;
        const rel = path.relative(root, filePath);
        let content: string;
        try {
          content = await fs.readFile(filePath, "utf-8");
        } catch {
          continue;
        }
        const fileLines = content.split("\n");
        for (let lineNum = 0; lineNum < fileLines.length && matchCount < MAX_MATCHES; lineNum++) {
          const line = fileLines[lineNum];
          if (line === undefined) continue;
          if (regex.test(line)) {
            matchCount++;
            lines.push(`${rel}:${lineNum + 1}: ${line.trim().slice(0, 120)}`);
          }
        }
      }
      const text = lines.length > 0 ? lines.join("\n") : "No matches found.";
      return { content: [{ type: "text" as const, text }] };
    }
  );
}
