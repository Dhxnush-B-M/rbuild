import { describe, expect, it } from "vitest";
import {
	createNoindexFollowMeta,
	createResumeSocialMeta,
	getCanonicalRootUrl,
} from "./seo";

describe("getCanonicalRootUrl", () => {
	it("uses production default when no origin is available", () => {
		expect(getCanonicalRootUrl()).toBe("https://rbuilder.space/");
	});

	it("normalizes an app origin to the root URL", () => {
		expect(getCanonicalRootUrl("https://rbuilder.space")).toBe(
			"https://rbuilder.space/",
		);
	});
});

describe("createNoindexFollowMeta", () => {
	it("returns the robots noindex metadata used by private app surfaces", () => {
		expect(createNoindexFollowMeta()).toEqual({
			name: "robots",
			content: "noindex, follow",
		});
	});
});

describe("createResumeSocialMeta", () => {
	it("generates clean social meta tags", () => {
		const meta = createResumeSocialMeta({
			canonicalUrl: "https://rbuilder.space/user/sample",
			title: "Resume Title",
			description: "Resume Description",
			imageUrl: "https://rbuilder.space/image.jpg",
		});

		expect(meta.length).toBeGreaterThan(0);
		expect(meta).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					property: "og:title",
					content: "Resume Title",
				}),
				expect.objectContaining({
					property: "twitter:title",
					content: "Resume Title",
				}),
			]),
		);
	});
});
