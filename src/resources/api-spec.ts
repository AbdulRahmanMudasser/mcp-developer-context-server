import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchAndSummarizeOpenApi } from "../lib/openapi.js";

export function registerApiSpec(server: McpServer): void {
  server.registerResource(
    "api-spec",
    "api://spec",
    {
      title: "API spec",
      description: "OpenAPI spec or summary",
      mimeType: "text/plain",
    },
    async (uri) => {
      const url = uri.searchParams.get("url");
      if (!url) {
        return {
          contents: [
            { uri: uri.href, mimeType: "text/plain", text: "Provide url query parameter, e.g. api://spec?url=https://..." },
          ],
        };
      }
      const summary = await fetchAndSummarizeOpenApi(url);
      return {
        contents: [{ uri: uri.href, mimeType: "text/plain", text: summary }],
      };
    }
  );
}
