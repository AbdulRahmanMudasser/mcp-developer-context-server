import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTestPlan(server: McpServer): void {
  server.registerPrompt(
    "test-plan",
    {
      title: "Test plan",
      description: "Suggest unit tests for a module",
      argsSchema: {
        module: z.string(),
        entryPoints: z.string().optional(),
      },
    },
    async ({ module: mod, entryPoints }) => {
      const entryText = entryPoints ?? "main exports";
      const text = `Suggest unit tests for the following module. Module: ${mod}. Entry points to cover: ${entryText}. Consider edge cases and error paths.`;
      return {
        messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
      };
    }
  );
}
