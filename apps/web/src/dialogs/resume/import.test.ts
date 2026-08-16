import { describe, expect, it } from "vitest";
import { detectJsonImportType } from "./import.utils";

describe("detectJsonImportType", () => {
	it("detects JSON Resume by a top-level basics without rbuilder sections/metadata", () => {
		expect(detectJsonImportType({ basics: { name: "A" }, work: [] })).toBe("json-resume-json");
	});

	it("detects the current rbuilder schema by metadata.page", () => {
		expect(detectJsonImportType({ basics: {}, sections: {}, metadata: { page: { locale: "en-US" } } })).toBe(
			"rbuilder-json",
		);
	});

	it("detects the legacy v4 schema by metadata without a page key", () => {
		expect(detectJsonImportType({ basics: {}, sections: {}, metadata: { template: "azurill" } })).toBe(
			"rbuilder-v4-json",
		);
	});

	it("returns an empty string for unrecognized shapes", () => {
		expect(detectJsonImportType({ foo: "bar" })).toBe("");
		expect(detectJsonImportType(null)).toBe("");
		expect(detectJsonImportType("nope")).toBe("");
	});
});
