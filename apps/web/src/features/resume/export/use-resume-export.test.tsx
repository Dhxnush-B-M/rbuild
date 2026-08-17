import { i18n } from "@lingui/core";
import { sampleResumeData } from "@rbuilder/schema/resume/sample";
import { act, renderHook } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useResumeExport } from "./use-resume-export";

const mocks = vi.hoisted(() => ({
	createResumePdfBlob: vi.fn(
		async () => new Blob(["local"], { type: "application/pdf" }),
	),
	downloadWithAnchor: vi.fn(),
	fetch: vi.fn(
		async (_input: string | URL) =>
			new Response(new Blob(["server"], { type: "application/pdf" })),
	),
	toastError: vi.fn(),
}));

vi.mock("./pdf-document", () => ({
	createResumePdfBlob: mocks.createResumePdfBlob,
}));
vi.mock("@rbuilder/utils/file", () => ({
	downloadWithAnchor: mocks.downloadWithAnchor,
	generateFilename: (name: string, extension: string) => `${name}.${extension}`,
}));
vi.mock("@/features/resume/stylesheet/store", () => ({
	useStylesheetStore: (selector: (state: object) => unknown) =>
		selector({
			resumeId: undefined,
			mode: "legacy",
			source: { languageVersion: 1, text: "@version 1;\n" },
			applied: { languageVersion: 1, text: "@version 1;\n" },
		}),
}));
vi.mock("sonner", () => ({
	toast: {
		loading: vi.fn(() => "toast"),
		error: mocks.toastError,
		dismiss: vi.fn(),
	},
}));

beforeAll(() => i18n.loadAndActivate({ locale: "en", messages: {} }));

beforeEach(() => {
	mocks.createResumePdfBlob.mockClear();
	mocks.downloadWithAnchor.mockClear();
	mocks.fetch.mockClear();
	mocks.toastError.mockClear();
	vi.stubGlobal("fetch", mocks.fetch);
});

describe("useResumeExport", () => {
	it("downloads the PDF blob when requested", async () => {
		const { result } = renderHook(() =>
			useResumeExport({
				name: "Sample",
				slug: "sample",
				data: sampleResumeData,
			}),
		);

		await act(() => result.current.onDownloadPDF());

		expect(mocks.createResumePdfBlob).toHaveBeenCalledTimes(1);
		expect(mocks.downloadWithAnchor).toHaveBeenCalledTimes(1);
	});

	it("does not download an unstyled PDF when semantic rendering rejects", async () => {
		mocks.createResumePdfBlob.mockRejectedValueOnce(
			new Error("The semantic stylesheet could not be rendered.", {
				cause: [{ code: "RESOURCE_LIMIT", severity: "error" }],
			}),
		);
		const { result } = renderHook(() =>
			useResumeExport({
				name: "Sample",
				slug: "sample",
				data: sampleResumeData,
			}),
		);

		await act(() => result.current.onDownloadPDF());

		expect(mocks.downloadWithAnchor).not.toHaveBeenCalled();
		expect(mocks.toastError).toHaveBeenCalledTimes(1);
	});
});
