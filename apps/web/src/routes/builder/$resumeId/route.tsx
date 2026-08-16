import type { BuilderLayout } from "./-store/sidebar";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { defaultResumeData } from "@rbuilder/schema/resume/default";
import { useResumeCleanup, useResumeStore } from "@/features/resume/builder/draft";
import { initializeStylesheetStore } from "@/features/resume/stylesheet/store";
import { checkAuthAndOnboardingAccess, verifyUserSubscriptionAcrossDevices } from "@/libs/auth/guard";
import { createNoindexFollowMeta } from "@/libs/seo";
import { getResumeByIdFromSupabase, saveResumeToSupabase } from "@/libs/supabase/db";
import { DesktopBuilderShell } from "./-components/desktop-builder-shell";
import { MobileBuilderShell } from "./-components/mobile-builder-shell";
import { getBuilderLayout } from "./-store/sidebar";

export const Route = createFileRoute("/builder/$resumeId")({
	component: RouteComponent,
	loader: async () => {
		const layout = await getBuilderLayout();
		return { layout, name: "My Resume" };
	},
	head: ({ loaderData }) => ({
		meta: loaderData
			? [{ title: `${loaderData.name} - rbuilder` }, createNoindexFollowMeta()]
			: [createNoindexFollowMeta()],
	}),
});

function RouteComponent() {
	const navigate = useNavigate();
	const { layout: initialLayout } = Route.useLoaderData();
	const { resumeId } = Route.useParams();

	const [loaded, setLoaded] = useState(false);
	const initializeResumeStore = useResumeStore((state) => state.initialize);
	const isReady = useResumeStore((state) => state.isReady);
	const initializedResumeId = useResumeStore((state) => state.resumeId);
	const isInitialized = isReady && initializedResumeId === resumeId;

	useResumeCleanup();

	useEffect(() => {
		let isMounted = true;

		async function checkAndInit() {
			const syncStatus = checkAuthAndOnboardingAccess();
			if (syncStatus !== "allowed") {
				const asyncStatus = await verifyUserSubscriptionAcrossDevices();
				if (!isMounted) return;
				if (asyncStatus === "unauthenticated") {
					void navigate({ to: "/auth/login", replace: true });
					return;
				}
				if (asyncStatus === "needs_onboarding") {
					void navigate({ to: "/onboarding", replace: true });
					return;
				}
			}

			const existing = await getResumeByIdFromSupabase(resumeId);
			if (!isMounted) return;

			if (existing) {
				const resumeObj = {
					id: existing.id,
					name: existing.name || "My Resume",
					slug: existing.slug || "my-resume",
					tags: existing.tags || [],
					data: existing.data || structuredClone(defaultResumeData),
					isPublic: existing.is_public ?? true,
					isLocked: existing.is_locked ?? false,
					hasPassword: existing.has_password ?? false,
					updatedAt: new Date(existing.updated_at || Date.now()),
				};
				initializeResumeStore(resumeObj);
			} else {
				const initialData = structuredClone(defaultResumeData);
				const newResume = {
					id: resumeId,
					name: "Untitled Resume",
					slug: "untitled-resume",
					tags: [],
					data: initialData,
					isPublic: true,
					isLocked: false,
					hasPassword: false,
					updatedAt: new Date(),
				};
				void saveResumeToSupabase(newResume);
				initializeResumeStore(newResume);
			}
			setLoaded(true);
		}

		void checkAndInit();

		return () => {
			isMounted = false;
		};
	}, [resumeId, initializeResumeStore, navigate]);

	const resumeData = useResumeStore((state) => state.resume?.data);

	useEffect(() => {
		if (!isInitialized || !resumeData) return;
		return initializeStylesheetStore({
			resumeId,
			initial: null,
			resumeData,
		});
	}, [isInitialized, resumeId, resumeData]);

	if (!loaded || !isInitialized) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center bg-background">
				<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	return <BuilderLayoutShell initialLayout={initialLayout} />;
}

function BuilderLayoutShell({ initialLayout }: { initialLayout: BuilderLayout }) {
	const isMobile = useMediaQuery("(max-width: 767px)", { initializeWithValue: false });

	if (isMobile) return <MobileBuilderShell />;
	return <DesktopBuilderShell initialLayout={initialLayout} />;
}
