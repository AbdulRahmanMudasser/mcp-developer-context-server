import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProjectRoot } from "../lib/project.js";
import { readManifest } from "../lib/manifest.js";

export function registerProjectManifest(server: McpServer): void {
  server.registerResource(
    "project-manifest",
    "project://manifest",
    {
      title: "Project manifest",
      description: "Contents of package.json",
      mimeType: "application/json",
    },
    async (uri) => {
      const root = getProjectRoot();
      const manifest = await readManifest(root);
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(manifest, null, 2) }],
      };
    }
  );
}
