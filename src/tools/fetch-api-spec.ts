import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchAndSummarizeOpenApi } from "../lib/openapi.js";

export function registerFetchApiSpec(server: McpServer): void {
  server.registerTool(
    "fetch-api-spec",
    {
      title: "Fetch API spec",
      description: "Fetch and summarize OpenAPI/Swagger from URL",
      inputSchema: z.object({
        url: z.string().url(),
      }),
    },
    async (args) => {
      const summary = await fetchAndSummarizeOpenApi(args.url);
      return { content: [{ type: "text" as const, text: summary }] };
    }
  );
}
