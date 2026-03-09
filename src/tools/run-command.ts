import { spawnSync } from "node:child_process";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProjectRoot } from "../lib/project.js";

const DEFAULT_ALLOWED = [
  "npm run lint",
  "npm run typecheck",
  "npm run format:check",
  "npm test",
  "npx tsc --noEmit",
];

function getAllowedCommands(): string[] {
  const raw = process.env.ALLOWED_COMMANDS?.trim();
  if (raw) {
    return raw.split(",").map((c) => c.trim()).filter(Boolean);
  }
  return DEFAULT_ALLOWED;
}

export function registerRunCommand(server: McpServer): void {
  server.registerTool(
    "run-command",
    {
      title: "Run command",
      description: "Run an allowlisted command in project dir",
      inputSchema: z.object({
        command: z.string(),
      }),
    },
    async (args) => {
      const allowed = getAllowedCommands();
      const cmd = args.command.trim();
      if (!allowed.includes(cmd)) {
        return {
          content: [{ type: "text" as const, text: "Command not allowed." }],
        };
      }
      const root = getProjectRoot();
      const result = spawnSync(cmd, { shell: true, cwd: root, encoding: "utf-8" });
      const out = [result.stdout ?? "", result.stderr ?? ""].filter(Boolean).join("\n");
      const exit = result.status ?? result.signal ?? "?";
      const text = `Exit: ${exit}\n\n${out || "(no output)"}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );
}
