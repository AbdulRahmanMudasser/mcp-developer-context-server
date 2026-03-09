# mcp-developer-context-server

MCP Server that Exposes Project Context, Codebase Search, Safe Commands & API Spec Summary for Any Model Or MCP Client

## Prerequisites

- Node.js 20 or later

## Installation

```bash
git clone 
cd mcp-developer-context-server
npm install
```

## Configuration

Optional environment variables:

| Variable | Description |
|----------|-------------|
| `PROJECT_ROOT` | Directory treated as the project root. Defaults to the process working directory. |
| `ALLOWED_COMMANDS` | Comma-separated list of commands allowed by the run-command tool. If unset, a default list is used (e.g. `npm run lint`, `npm run typecheck`, `npm test`, `npx tsc --noEmit`). |

## Running

Build and start the server:

```bash
npm run build
npm start
```

For development without building:

```bash
npm run dev
```

The server runs over stdio and waits for client connections. Stop with Ctrl+C.

## Testing with MCP Inspector

Run the server under the MCP Inspector to exercise all capabilities:

```bash
npm run build
npm run inspector
```

Open http://localhost:6274 in a browser. Use the Tools, Resources, and Prompts tabs to invoke capabilities and verify responses.

### Tools: expected behavior

| Tool | Example input | Expected outcome |
|------|---------------|------------------|
| search-codebase | pattern: `registerTool`, glob: `**/*.ts` | Lines of the form `path:lineNum: snippet` for matching files; ignores `node_modules` and `dist`. |
| project-structure | (none) or depth: `1` | Directory tree and a line listing key files at root (e.g. package.json, tsconfig.json). |
| run-command | command: `npm run lint` | Exit code and command stdout/stderr. |
| run-command | command: `echo hello` | Message: "Command not allowed." |
| fetch-api-spec | url: a valid OpenAPI JSON URL | Summary with operations (method, path, operationId) and schema names. |
| validate-json | json: `{"a":1}`, action: `format` | Pretty-printed JSON. |
| validate-json | json: `{invalid`, action: `validate` | Error message: "Invalid JSON" and parse details. |

### Resources: expected behavior

| Resource URI | Expected outcome |
|--------------|------------------|
| project://manifest | JSON body of the project `package.json`. |
| project://config | JSON with `configFiles` (e.g. tsconfig.json, package.json) and `envExampleKeys` from `.env.example` if present. |
| api://spec | Message asking for a `url` query parameter. |
| api://spec?url=<OpenAPI-URL> | Same summary format as the fetch-api-spec tool. |

### Prompts: expected behavior

| Prompt | Example arguments | Expected outcome |
|--------|-------------------|------------------|
| code-review | code: a code snippet, focus: `performance` or empty | Single user message containing review instructions and the provided code. |
| api-usage | operationId: e.g. `getPets`, language: optional | Single user message requesting a client example for that operation. |
| test-plan | module: e.g. `src/index.ts`, entryPoints: optional | Single user message requesting unit test suggestions for the module. |

## Cursor setup

Add the server to your Cursor MCP configuration (e.g. in Cursor settings or the configured MCP config file):

```json
{
  "mcpServers": {
    "developer-context": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-developer-context-server/dist/index.js"],
      "env": {
        "PROJECT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

Replace paths with your actual project and server locations. Restart or reload Cursor so it picks up the server.

## Project structure

```
src/
  index.ts          Server entry; registers tools, resources, prompts; stdio transport.
  lib/              Shared helpers: project root, manifest read, OpenAPI summary.
  tools/            MCP tools: search-codebase, project-structure, run-command, fetch-api-spec, validate-json.
  resources/       MCP resources: project manifest, project config, API spec.
  prompts/         MCP prompts: code-review, api-usage, test-plan.
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm start` | Run the compiled server. |
| `npm run dev` | Run the server from source with tsx. |
| `npm run inspector` | Run the server under MCP Inspector (http://localhost:6274). |
| `npm run lint` | Run ESLint on `src/`. |
| `npm run typecheck` | Run TypeScript compiler in check-only mode. |
