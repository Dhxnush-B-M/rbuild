import type { SupabaseResumeRecord } from "@/libs/supabase/db";
import { createFileRoute, lazyRouteComponent, notFound } from "@tanstack/react-router";
import { createNoindexFollowMeta, createResumeSocialMeta, getCanonicalRootUrl } from "@/libs/seo";
import { getResumeBySlugFromSupabase } from "@/libs/supabase/db";

type LoaderData = SupabaseResumeRecord;

export const Route = createFileRoute("/$username/$slug")({
	component: lazyRouteComponent(() => import("@/features/resume/public/public-resume"), "PublicResumeRoute"),
	loader: async ({ params }) => {
		const { username, slug } = params;
		const reserved = ["auth", "api", "dashboard", "builder", "templates", "assets"];
		if (!username || !slug || reserved.includes(username.toLowerCase())) {
			throw notFound();
		}

		const resume = await getResumeBySlugFromSupabase(slug, username);
		if (!resume) {
			throw notFound();
		}

		return { resume: resume as LoaderData };
	},
	head: ({ loaderData, params }) => {
		const resume = loaderData?.resume;
		const name = resume ? resume.data?.basics?.name || resume.name || "Resume" : "rbuilder";

		if (!resume?.data) {
			return { meta: [{ title: `${name} - rbuilder` }, createNoindexFollowMeta()] };
		}

		const basics = resume.data.basics || {};
		const summary = resume.data.summary || { content: "" };
		const metadata = resume.data.metadata || { template: "azurill" };
		const socialTitle = basics.headline ? `${name} — ${basics.headline}` : name;
		const summaryText = (summary.content || "")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim();
		const description = summaryText || basics.headline || name;

		const base = getCanonicalRootUrl(typeof window === "undefined" ? undefined : window.location.origin);
		const canonicalUrl = `${base}${params.username}/${params.slug}`;
		const imageUrl = `${base}templates/jpg/${metadata.template}.jpg`;

		return {
			meta: [
				{ title: `${name} - rbuilder` },
				createNoindexFollowMeta(),
				...createResumeSocialMeta({ canonicalUrl, title: socialTitle, description, imageUrl }),
			],
			links: [{ rel: "canonical", href: canonicalUrl }],
		};
	},
});
