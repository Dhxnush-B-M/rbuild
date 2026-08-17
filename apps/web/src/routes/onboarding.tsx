import { CheckCircleIcon, ShieldCheckIcon, SparkleIcon, UserIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { m } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { initiateRazorpayPayment, SUBSCRIPTION_PLANS, type SubscriptionPlanOption } from "@/libs/payment/razorpay";
import { getCurrentSupabaseUser, saveUserToSupabase } from "@/libs/supabase/db";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
});

function OnboardingPage() {
	const navigate = useNavigate();
	const [fullName, setFullName] = useState("");
	const [jobTitle, setJobTitle] = useState("");
	const [email, setEmail] = useState("");
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanOption>(SUBSCRIPTION_PLANS[0]!);
	const [isLoading, setIsLoading] = useState(false);
	const [paymentSuccess, setPaymentSuccess] = useState(false);

	useEffect(() => {
		let isMounted = true;
		void getCurrentSupabaseUser().then((profile) => {
			if (!isMounted) return;
			if (profile?.name) setFullName(profile.name);
			if (profile?.email) setEmail(profile.email);
		});
		return () => {
			isMounted = false;
		};
	}, []);

	const handleCompleteWithPayment = async () => {
		const userEmail = email.trim().toLowerCase() || "user@rbuilder.app";
		const userName = fullName.trim() || "Resume Creator";

		setIsLoading(true);
		await initiateRazorpayPayment({
			plan: selectedPlan,
			userEmail,
			userName,
			onSuccess: async (paymentId) => {
				setPaymentSuccess(true);
				toast.success("Payment successful! Pro Plan activated.");

				const profile = {
					name: userName,
					username: userName.toLowerCase().replace(/\s+/g, "-"),
					email: userEmail,
					job_title: jobTitle.trim(),
					subscription_status: "active" as const,
					subscription_plan: selectedPlan.id,
					payment_id: paymentId,
					subscription_amount: selectedPlan.amountInRupees,
					onboarding_completed: true,
				};

				localStorage.setItem("rbuilder_user_profile", JSON.stringify(profile));
				await saveUserToSupabase(profile);

				setTimeout(() => {
					void navigate({ to: "/dashboard/resumes", replace: true });
				}, 1000);
			},
			onError: (error) => {
				setIsLoading(false);
				toast.error(error || "Payment was cancelled or failed.");
			},
			onDismiss: () => {
				setIsLoading(false);
			},
		});
	};

	const handleFreeAccess = async (e?: React.FormEvent) => {
		e?.preventDefault();
		setIsLoading(true);
		const userEmail = email.trim().toLowerCase() || "user@rbuilder.app";
		const userName = fullName.trim() || "Resume Creator";

		const profile = {
			name: userName,
			username: userName.toLowerCase().replace(/\s+/g, "-"),
			email: userEmail,
			job_title: jobTitle.trim(),
			subscription_status: "active" as const,
			onboarding_completed: true,
		};

		localStorage.setItem("rbuilder_user_profile", JSON.stringify(profile));
		await saveUserToSupabase(profile);

		toast.success("Welcome to your workspace!");
		void navigate({ to: "/dashboard/resumes", replace: true });
	};

	return (
		<div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#CBD8FF] via-[#E8EDFD] to-[#FDE8EE] px-4 py-8 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#1E1B4B]">
			<div aria-hidden="true" className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-45">
				<div className="size-[700px] animate-pulse rounded-full bg-gradient-to-tr from-indigo-300/30 via-sky-300/30 to-pink-300/30 blur-3xl" />
			</div>

			<m.div
				initial={{ opacity: 0, scale: 0.96, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="relative w-full max-w-[480px] rounded-[44px] border-2 border-white/80 bg-white/40 p-8 shadow-[0_30px_80px_rgba(30,58,138,0.15),inset_0_2px_6px_rgba(255,255,255,0.9)] backdrop-blur-3xl dark:border-white/20 dark:bg-white/10"
			>
				<div className="flex flex-col items-center text-center">
					{/* Icon Header */}
					<div className="relative mb-5 flex size-20 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-b from-white/70 to-indigo-100/50 shadow-lg backdrop-blur-2xl dark:border-white/20 dark:from-white/20 dark:to-white/5">
						<SparkleIcon className="size-8 text-indigo-600" weight="duotone" />
					</div>

					<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						Welcome to rbuilder
					</h2>
					<p className="mt-1.5 text-muted-foreground text-xs leading-relaxed sm:text-sm">
						Personalize your workspace and choose your plan.
					</p>

					{/* Profile Inputs */}
					<div className="mt-5 w-full space-y-3 text-left">
						<div>
							<label htmlFor="name" className="font-semibold text-foreground text-xs">
								Your Full Name
							</label>
							<div className="relative mt-1">
								<div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
									<UserIcon className="size-4" />
								</div>
								<input
									id="name"
									type="text"
									placeholder="e.g. Alex Johnson"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									className="h-11 w-full rounded-2xl border border-white/80 bg-white/70 pr-4 pl-10 font-medium text-foreground text-sm shadow-xs backdrop-blur-xl transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:outline-none dark:border-white/20 dark:bg-white/10"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="role" className="font-semibold text-foreground text-xs">
								Target Job Title
							</label>
							<input
								id="role"
								type="text"
								placeholder="e.g. Software Engineer, Product Designer"
								value={jobTitle}
								onChange={(e) => setJobTitle(e.target.value)}
								className="mt-1 h-11 w-full rounded-2xl border border-white/80 bg-white/70 px-4 font-medium text-foreground text-sm shadow-xs backdrop-blur-xl transition-all placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:outline-none dark:border-white/20 dark:bg-white/10"
							/>
						</div>
					</div>

					{/* Plan Selection */}
					<div className="mt-5 w-full text-left">
						<label className="font-semibold text-foreground text-xs">Select Plan</label>
						<div className="mt-2 grid grid-cols-2 gap-2.5">
							{SUBSCRIPTION_PLANS.map((plan) => {
								const isSelected = selectedPlan.id === plan.id;
								return (
									<button
										type="button"
										key={plan.id}
										onClick={() => setSelectedPlan(plan)}
										className={`relative rounded-2xl border-2 p-3 text-left transition-all ${
											isSelected
												? "border-indigo-600 bg-indigo-50/80 shadow-md dark:border-indigo-500 dark:bg-indigo-950/40"
												: "border-white/80 bg-white/60 hover:bg-white/80 dark:border-white/10 dark:bg-white/5"
										}`}
									>
										{plan.badge && (
											<span className="absolute -top-2 right-2 rounded-full bg-indigo-600 px-2 py-0.5 font-bold text-[9px] text-white">
												{plan.badge}
											</span>
										)}
										<div className="font-bold text-foreground text-xs">{plan.durationText}</div>
										<div className="mt-1 font-extrabold text-indigo-600 text-lg dark:text-indigo-400">
											₹{plan.amountInRupees}
										</div>
										<p className="text-[10px] text-muted-foreground">Full Pro Features</p>
									</button>
								);
							})}
						</div>
					</div>

					{/* Actions */}
					<div className="mt-6 w-full space-y-2.5">
						<button
							type="button"
							disabled={isLoading}
							onClick={handleCompleteWithPayment}
							className="group flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-white/90 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 font-bold text-sm text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
						>
							<ShieldCheckIcon className="size-4" weight="bold" />
							<span>{isLoading ? "Processing..." : `Upgrade Pro (₹${selectedPlan.amountInRupees})`}</span>
						</button>

						<button
							type="button"
							disabled={isLoading}
							onClick={handleFreeAccess}
							className="flex h-10 w-full items-center justify-center rounded-full border border-white/60 bg-white/30 font-medium text-foreground text-xs transition-all hover:bg-white/60 dark:border-white/10 dark:bg-white/5"
						>
							<span>Continue with Basic Access</span>
						</button>
					</div>

					{paymentSuccess && (
						<div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-xs">
							<CheckCircleIcon className="size-4" weight="fill" />
							<span>Pro Plan activated successfully!</span>
						</div>
					)}
				</div>
			</m.div>
		</div>
	);
}

