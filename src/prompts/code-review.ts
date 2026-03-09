import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCodeReview(server: McpServer): void {
  server.registerPrompt(
    "code-review",
    {
      title: "Code review",
      description: "Review code for security, performance, or style",
      argsSchema: {
        code: z.string(),
        focus: z.string().optional(),
      },
    },
    async ({ code, focus }) => {
      const focusText = focus ? focus : "general quality";
      const text = `Review the following code for ${focusText}. Focus on security, performance, and style as relevant.\n\nCode:\n\n${code}`;
      return {
        messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
      };
    }
  );
}
