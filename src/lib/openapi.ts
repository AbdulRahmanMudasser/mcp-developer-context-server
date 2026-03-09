interface OpenApiDoc {
  paths?: Record<string, Record<string, { operationId?: string; summary?: string }>>;
  openapi?: string;
  info?: { title?: string; version?: string };
  components?: { schemas?: Record<string, unknown> };
}

export async function fetchAndSummarizeOpenApi(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return `Request failed: ${res.status} ${res.statusText}`;
    }
    const data = (await res.json()) as OpenApiDoc;
    const parts: string[] = [];
    if (data.info?.title || data.info?.version) {
      parts.push(`API: ${data.info.title ?? "Unknown"} ${data.info.version ?? ""}`.trim());
    }
    const HTTP_METHODS = new Set(["get", "post", "put", "delete", "patch", "options", "head", "trace"]);
    if (data.paths && typeof data.paths === "object") {
      const operations: string[] = [];
      for (const [pathKey, methods] of Object.entries(data.paths)) {
        if (methods && typeof methods === "object") {
          for (const [method, spec] of Object.entries(methods)) {
            if (!HTTP_METHODS.has(method.toLowerCase())) continue;
            if (spec && typeof spec === "object") {
              const opId = (spec as { operationId?: string }).operationId;
              const summary = (spec as { summary?: string }).summary;
              const line = `${method.toUpperCase()} ${pathKey}${opId ? ` (${opId})` : ""}${summary ? ` - ${summary}` : ""}`;
              operations.push(line);
            }
          }
        }
      }
      if (operations.length > 0) {
        parts.push("Operations:\n" + operations.join("\n"));
      }
    }
    if (data.components?.schemas && typeof data.components.schemas === "object") {
      const names = Object.keys(data.components.schemas);
      if (names.length > 0) {
        parts.push("Schemas: " + names.join(", "));
      }
    }
    return parts.length > 0 ? parts.join("\n\n") : "No paths or schemas found in spec.";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Error fetching or parsing OpenAPI spec: ${message}`;
  }
}
