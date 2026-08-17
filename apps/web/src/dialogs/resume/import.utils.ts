export type ImportType =
	| ""
	| "rbuilder-json"
	| "rbuilder-v4-json"
	| "json-resume-json";

export function detectJsonImportType(parsed: unknown): ImportType {
	if (!parsed || typeof parsed !== "object") return "";
	const data = parsed as Record<string, unknown>;

	// JSON Resume standard: top-level `basics`, without rbuilder's `sections`/`metadata`.
	if ("basics" in data && !("sections" in data) && !("metadata" in data))
		return "json-resume-json";

	// rbuilder exports carry `sections` + `metadata`; the current schema's metadata has a `page` key,
	// the legacy v4 schema does not. Best-effort guess — the user can override the type below.
	if ("sections" in data || "metadata" in data) {
		const metadata = data.metadata as Record<string, unknown> | undefined;
		if (metadata && !("page" in metadata)) return "rbuilder-v4-json";
		return "rbuilder-json";
	}

	return "";
}
