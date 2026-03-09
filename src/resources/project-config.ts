import fs from "node:fs/promises";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProjectRoot } from "../lib/project.js";

const CONFIG_FILES = ["tsconfig.json", "package.json", ".env.example", "eslint.config.js", ".prettierrc"];

export function registerProjectConfig(server: McpServer): void {
  server.registerResource(
    "project-config",
    "project://config",
    {
      title: "Project config",
      description: "Non-secret config summary",
      mimeType: "application/json",
    },
    async (uri) => {
      const root = getProjectRoot();
      const configFiles: string[] = [];
      for (const name of CONFIG_FILES) {
        try {
          await fs.access(path.join(root, name));
          configFiles.push(name);
        } catch {
          void 0;
        }
      }
      const envExampleKeys: string[] = [];
      const envPath = path.join(root, ".env.example");
      try {
        const content = await fs.readFile(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const match = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
          if (match?.[1]) envExampleKeys.push(match[1]);
        }
      } catch {
        void 0;
      }
      const out = { configFiles, envExampleKeys };
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(out, null, 2) }],
      };
    }
  );
}
