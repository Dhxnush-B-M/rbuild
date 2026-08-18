import { t } from "@lingui/core/macro";
import { ReadCvLogoIcon } from "@phosphor-icons/react";
import { Separator } from "@rbuilder/ui/components/separator";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import {
	getCurrentSupabaseUser,
	getResumesFromSupabase,
	saveUserToSupabase,
} from "@/libs/supabase/db";
import { DashboardHeader } from "../-components/header";
import { GridView } from "./-components/grid-view";

export const Route = createFileRoute("/dashboard/resumes/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: resumes = [] } = useQuery({
		queryKey: ["resumes"],
		queryFn: () => getResumesFromSupabase(),
	});

	// Automatically verify and activate subscription if redirected from Razorpay
	useEffect(() => {
		if (typeof window === "undefined") return;
		const searchParams = new URLSearchParams(window.location.search);
		const paymentId =
			searchParams.get("razorpay_payment_id") ||
			searchParams.get("razorpay_payment_link_id");
		const paymentStatus = searchParams.get("razorpay_payment_link_status");

		if (paymentId || paymentStatus === "paid") {
			toast.success("🎉 Payment verified! Your Pro access is now active.");
			void getCurrentSupabaseUser().then((profile) => {
				const updated = {
					...profile,
					email: profile?.email || "user@rbuilder.app",
					subscription_status: "active" as const,
					onboarding_completed: true,
					payment_id: paymentId || profile?.payment_id || undefined,
				};
				localStorage.setItem("rbuilder_user_profile", JSON.stringify(updated));
				void saveUserToSupabase(updated);
			});

			// Clean search params from URL
			try {
				window.history.replaceState(null, "", window.location.pathname);
			} catch {}
		}
	}, []);

	return (
		<div className="space-y-4">
			<DashboardHeader icon={ReadCvLogoIcon} title={t`Resumes`} />

			<Separator />

			<GridView
				resumes={
					resumes as unknown as Parameters<typeof GridView>[0]["resumes"]
				}
				hasResumes={resumes.length > 0}
			/>
		</div>
	);
}
