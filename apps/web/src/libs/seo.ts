export const getCanonicalRootUrl = (origin?: string): string => {
	if (!origin && typeof window !== "undefined") {
		return `${window.location.origin}/`;
	}
	if (!origin) return "http://localhost:3000/";

	try {
		const url = new URL(origin);
		url.pathname = "/";
		url.search = "";
		url.hash = "";
		return url.toString();
	} catch {
		return "http://localhost:3000/";
	}
};

export const createNoindexFollowMeta = () => ({
	name: "robots",
	content: "noindex, follow",
});

type ResumeSocialMetaOptions = {
	canonicalUrl: string;
	title: string;
	description: string;
	imageUrl: string;
};

export const createResumeSocialMeta = ({
	canonicalUrl,
	title,
	description,
	imageUrl,
}: ResumeSocialMetaOptions) => [
	{ property: "og:type", content: "profile" },
	{ property: "og:title", content: title },
	{ property: "og:description", content: description },
	{ property: "og:url", content: canonicalUrl },
	{ property: "og:image", content: imageUrl },
	{ property: "twitter:card", content: "summary_large_image" },
	{ property: "twitter:title", content: title },
	{ property: "twitter:description", content: description },
	{ property: "twitter:image", content: imageUrl },
];
