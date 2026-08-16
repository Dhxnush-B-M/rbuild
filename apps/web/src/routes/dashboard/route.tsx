import { Trans } from "@lingui/react/macro";
import { createFileRoute, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@rbuilder/ui/components/sidebar";
import { checkAuthAndOnboardingAccess, verifyUserSubscriptionAcrossDevices } from "@/libs/auth/guard";
import { createNoindexFollowMeta } from "@/libs/seo";
import { getDashboardSidebarState, setDashboardSidebarState } from "./-components/functions";
import { DashboardSidebar } from "./-components/sidebar";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	loader: () => {
		const sidebarState = getDashboardSidebarState();
		return { sidebarState };
	},
	head: () => ({
		meta: [createNoindexFollowMeta()],
	}),
});

function RouteComponent() {
	const router = useRouter();
	const navigate = useNavigate();
	const { sidebarState } = Route.useLoaderData();
	const [access, setAccess] = useState<"checking" | "allowed">("checking");

	useEffect(() => {
		const syncStatus = checkAuthAndOnboardingAccess();
		if (syncStatus === "allowed") {
			setAccess("allowed");
			return;
		}

		void verifyUserSubscriptionAcrossDevices().then((status) => {
			if (status === "unauthenticated") {
				void navigate({ to: "/auth/login", replace: true });
			} else if (status === "needs_onboarding") {
				void navigate({ to: "/onboarding", replace: true });
			} else {
				setAccess("allowed");
			}
		});
	}, [navigate]);

	const handleSidebarOpenChange = (open: boolean) => {
		setDashboardSidebarState(open);
		void router.invalidate();
	};

	if (access === "checking") {
		return (
			<div className="flex min-h-screen w-full items-center justify-center bg-background">
				<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-background">
			{/* Ambient Glassy Background Blobs */}
			<div aria-hidden="true" className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-30">
				<div className="size-[700px] animate-pulse rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-3xl" />
			</div>
			<div aria-hidden="true" className="pointer-events-none fixed top-10 left-10 opacity-20">
				<div className="size-[400px] rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl" />
			</div>

			<SidebarProvider open={sidebarState} onOpenChange={handleSidebarOpenChange}>
				<a
					href="#main-content"
					className="sr-only rounded-md bg-popover px-4 py-2 text-sm ring-2 ring-ring focus:not-sr-only focus:absolute focus:inset-s-2 focus:top-2 focus:z-[100]"
				>
					<Trans>Skip to main content</Trans>
				</a>

				<DashboardSidebar />

				<main id="main-content" className="@container relative z-10 flex-1 p-4 md:ps-2">
					<div className="min-h-[calc(100vh-2rem)] rounded-3xl border border-white/10 bg-background/50 p-6 shadow-2xl backdrop-blur-2xl">
						<Outlet />
					</div>
				</main>
			</SidebarProvider>
		</div>
	);
}
