import { describe, expect, it } from "vitest";
import { inspectResumePdf } from "@rbuilder/pdf/semantic";
import { sampleResumeData } from "@rbuilder/schema/resume/sample";

describe("@rbuilder/pdf/semantic", () => {
	it("publicly exposes invalid applied-source diagnostics", () => {
		const data = structuredClone(sampleResumeData);
		const invalid = { languageVersion: 1, text: "@version 1; section { color: ; }" };
		data.metadata.stylesheet = { mode: "semantic", source: invalid, applied: invalid };

		const inspection = inspectResumePdf({ data });

		expect(inspection.diagnostics).toContainEqual(expect.objectContaining({ severity: "error" }));
		expect(inspection.presentation).toEqual({});
	});
});
