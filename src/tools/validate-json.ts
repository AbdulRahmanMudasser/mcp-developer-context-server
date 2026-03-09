import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerValidateJson(server: McpServer): void {
  server.registerTool(
    "validate-json",
    {
      title: "Validate JSON",
      description: "Validate or format a JSON string",
      inputSchema: z.object({
        json: z.string(),
        action: z.enum(["validate", "format", "minify"]).optional(),
      }),
    },
    async (args) => {
      const action = args.action ?? "validate";
      let parsed: unknown;
      try {
        parsed = JSON.parse(args.json);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: `Invalid JSON: ${message}` }] };
      }
      if (action === "format") {
        return { content: [{ type: "text" as const, text: JSON.stringify(parsed, null, 2) }] };
      }
      if (action === "minify") {
        return { content: [{ type: "text" as const, text: JSON.stringify(parsed) }] };
      }
      const formatted = JSON.stringify(parsed, null, 2);
      return {
        content: [{ type: "text" as const, text: `Valid JSON.\n\nFormatted:\n${formatted}` }],
      };
    }
  );
}
