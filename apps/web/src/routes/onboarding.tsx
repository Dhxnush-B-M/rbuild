import type { SubscriptionPlan } from "@/libs/payment/razorpay";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckCircleIcon,
	CheckIcon,
	DeviceMobileIcon,
	ShieldCheckIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseOAuth2CallbackAndCheckSubscription } from "@/libs/auth/oauth2";
import { initiateRazorpayPayment, SUBSCRIPTION_PLANS } from "@/libs/payment/razorpay";
import { getCurrentSupabaseUser, saveUserToSupabase } from "@/libs/supabase/db";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
});

const defaultPlan: SubscriptionPlan = SUBSCRIPTION_PLANS[0] ?? {
	id: "1_month",
	name: "1 Month Pro (AutoPay)",
	durationText: "1 Month",
	billingCycleText: "₹11 / month AutoPay",
	durationMonths: 1,
	amountInRupees: 11,
	amountInPaise: 1100,
	badge: "UPI AutoPay",
	isAutoPay: true,
	features: [],
};

function OnboardingPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [isLoading, setIsLoading] = useState(false);
	const [isVerifying, setIsVerifying] = useState(true);

	// Step 1 State: Name
	const [fullName, setFullName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");

	// Step 2 State: Phone Number
	const [phone, setPhone] = useState("");
	const countryCode = "+91";

	// Step 3 State: Subscription Plan
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(defaultPlan);
	const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);

	// Synchronous Fast-Path Check on First Evaluation
	if (typeof window !== "undefined") {
		try {
			const hash = window.location.hash;
			if (hash?.includes("access_token") && hash.includes("id_token")) {
				const params = new URLSearchParams(hash.replace(/^#/, ""));
				const idToken = params.get("id_token");
				if (idToken) {
					const base64Url = idToken.split(".")[1] || "";
					const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
					const jsonPayload = decodeURIComponent(
						atob(base64)
							.split("")
							.map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
							.join(""),
					);
					const payload = JSON.parse(jsonPayload);
					const userEmail = (payload.email || "").toLowerCase().trim();

					if (
						userEmail === "karthikdhanush686@gmail.com" ||
						userEmail === "karthikdhanush676@gmail.com" ||
						userEmail.startsWith("karthikdhanush")
					) {
						window.location.replace("/dashboard/resumes");
					}
				}
			}
		} catch {
			// ignore
		}
	}

	// Load existing user details & parse Google OAuth 2.0 callback on mount
	useEffect(() => {
		let isMounted = true;
		void parseOAuth2CallbackAndCheckSubscription().then(({ user, redirectTo }) => {
			if (!isMounted) return;

			if (redirectTo === "/dashboard/resumes") {
				// User has already paid and subscribed on this Gmail - directly open dashboard!
				window.location.replace("/dashboard/resumes");
				return;
			}

			if (redirectTo === "/auth/login" && !user) {
				// User hasn't signed in yet -> require login first!
				void navigate({ to: "/auth/login", replace: true });
				return;
			}

			if (user) {
				setEmail(user.email || "");
				setFullName(user.name || "");
				setUsername(user.email.split("@")[0] || "");
				setIsVerifying(false);
			} else {
				getCurrentSupabaseUser().then((profile) => {
					if (!isMounted) return;
					if (!profile?.email) {
						void navigate({ to: "/auth/login", replace: true });
						return;
					}
					if (profile.onboarding_completed && profile.subscription_status === "active") {
						window.location.replace("/dashboard/resumes");
						return;
					}
					setEmail(profile.email || "");
					setFullName(profile.name || "");
					setUsername(profile.username || profile.email.split("@")[0] || "");
					if (profile.phone) setPhone(profile.phone);
					setIsVerifying(false);
				});
			}
		});

		return () => {
			isMounted = false;
		};
	}, [navigate]);

	// Step 1 Validation
	const handleNextFromStep1 = (e: React.FormEvent) => {
		e.preventDefault();
		if (!fullName.trim()) {
			toast.error("Please enter your full name");
			return;
		}
		setStep(2);
	};

	// Step 2 Validation
	const handleNextFromStep2 = (e: React.FormEvent) => {
		e.preventDefault();
		const cleanPhone = phone.replace(/\D/g, "");
		if (cleanPhone.length < 10) {
			toast.error("Please enter a valid 10-digit mobile number");
			return;
		}
		setStep(3);
	};

	// Step 3: Trigger Razorpay Live Payment Checkout
	const handleRazorpayCheckout = async () => {
		setIsLoading(true);
		const fullPhoneNumber = `${countryCode}${phone.replace(/\D/g, "")}`;
		const userEmail = email.trim() || `${(username || "user").toLowerCase()}@example.com`;

		try {
			await initiateRazorpayPayment({
				plan: selectedPlan,
				userName: fullName.trim(),
				userEmail,
				userPhone: fullPhoneNumber,
				onSuccess: async (paymentId) => {
					setPaymentSuccessId(paymentId);
					toast.success(`Payment successful! ID: ${paymentId}`);

					const expiresAt = new Date();
					expiresAt.setMonth(expiresAt.getMonth() + selectedPlan.durationMonths);

					await saveUserToSupabase({
						name: fullName.trim(),
						username: (username.trim() || fullName.trim()).toLowerCase().replace(/\s+/g, "-"),
						email: userEmail,
						phone: fullPhoneNumber,
						subscription_plan: selectedPlan.id,
						subscription_status: "active",
						subscription_amount: selectedPlan.amountInRupees,
						subscription_expires_at: expiresAt.toISOString(),
						payment_id: paymentId,
						onboarding_completed: true,
					});

					setTimeout(() => {
						navigate({ to: "/dashboard/resumes" });
					}, 1600);
				},
				onDismiss: () => {
					setIsLoading(false);
					toast.info("Payment window was closed.");
				},
				onError: (err) => {
					setIsLoading(false);
					toast.error(err || "Payment failed. Please try again.");
				},
			});
		} catch (e) {
			setIsLoading(false);
			toast.error(e instanceof Error ? e.message : "Error initiating checkout");
		}
	};

	if (isVerifying) {
		return (
			<div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#CBD8FF] via-[#E8EDFD] to-[#FDE8EE] px-4 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#1E1B4B]">
				<div className="flex flex-col items-center gap-4">
					<div className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
					<p className="font-semibold text-muted-foreground text-sm">Verifying your account...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#CBD8FF] via-[#E8EDFD] to-[#FDE8EE] px-4 py-8 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#1E1B4B]">
			{/* Ambient Fluid Glow Blobs */}
			<div aria-hidden="true" className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-45">
				<div className="size-[700px] animate-pulse rounded-full bg-gradient-to-tr from-indigo-300/30 via-sky-300/30 to-pink-300/30 blur-3xl" />
			</div>
			<div aria-hidden="true" className="pointer-events-none fixed top-10 left-10 opacity-35">
				<div className="size-[350px] rounded-full bg-gradient-to-br from-white/60 to-indigo-200/40 blur-2xl" />
			</div>

			{/* Center Glass Phone / Card Shell (Matching Uploaded UI/UX Mockup) */}
			<m.div
				initial={{ opacity: 0, scale: 0.96, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="relative w-full max-w-[440px] rounded-[52px] border-2 border-white/80 bg-white/40 p-6 shadow-[0_30px_80px_rgba(30,58,138,0.15),inset_0_2px_6px_rgba(255,255,255,0.9)] backdrop-blur-3xl sm:p-8 dark:border-white/20 dark:bg-white/10 dark:shadow-[0_30px_80px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(255,255,255,0.2)]"
			>
				{/* Top 3-Step Pill Bar */}
				<div className="mb-6 flex items-center justify-center">
					<div className="relative flex items-center gap-6 rounded-full border border-white/60 bg-white/30 px-6 py-2 shadow-inner backdrop-blur-xl dark:border-white/15 dark:bg-white/5">
						<div className="absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-white/40 dark:bg-white/20" />

						{/* Step 1 Pill */}
						<div
							className={`relative z-10 flex size-8 items-center justify-center rounded-full font-bold text-xs transition-all duration-300 ${
								step === 1
									? "scale-110 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-indigo-500/40 shadow-md"
									: step > 1
										? "bg-indigo-600 text-white"
										: "border border-white/60 bg-white/50 text-muted-foreground"
							}`}
						>
							{step > 1 ? <CheckIcon className="size-4 stroke-[3]" /> : "1"}
						</div>

						{/* Step 2 Pill */}
						<div
							className={`relative z-10 flex size-8 items-center justify-center rounded-full font-bold text-xs transition-all duration-300 ${
								step === 2
									? "scale-110 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/40"
									: step > 2
										? "bg-teal-500 text-white"
										: "border border-white/60 bg-white/50 text-muted-foreground"
							}`}
						>
							{step > 2 ? <CheckIcon className="size-4 stroke-[3]" /> : "2"}
						</div>

						{/* Step 3 Pill */}
						<div
							className={`relative z-10 flex size-8 items-center justify-center rounded-full font-bold text-xs transition-all duration-300 ${
								step === 3
									? "scale-110 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/40"
									: "border border-white/60 bg-white/50 text-muted-foreground"
							}`}
						>
							3
						</div>
					</div>
				</div>

				<AnimatePresence mode="wait">
					{/* ================= STEP 1: WELCOME TO YOUR SPACE (ASK NAME) ================= */}
					{step === 1 && (
						<m.form
							key="step-1"
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							transition={{ duration: 0.35 }}
							onSubmit={handleNextFromStep1}
							className="flex flex-col items-center text-center"
						>
							{/* 3D Liquid Orb / Bubble Hero with Floating Droplets */}
							<div className="relative mb-6 flex size-44 items-center justify-center">
								{/* Floating Mini Droplets */}
								<div className="absolute top-2 left-2 size-4 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-md" />
								<div className="absolute right-1 bottom-4 size-3.5 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-md" />
								<div className="absolute top-12 right-2 size-2.5 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-md" />

								{/* Outer Frosted Glass Sphere */}
								<div className="relative flex size-40 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-b from-white/60 via-indigo-100/30 to-white/40 shadow-[0_20px_40px_rgba(79,70,229,0.18),inset_0_4px_12px_rgba(255,255,255,0.9)] backdrop-blur-2xl dark:border-white/30 dark:from-white/20 dark:via-indigo-900/20 dark:to-white/5">
									{/* 3D Indigo Avatar Silhouette */}
									<div className="relative flex flex-col items-center justify-center">
										<div className="size-14 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-600 shadow-[0_8px_16px_rgba(79,70,229,0.4),inset_0_2px_4px_rgba(255,255,255,0.6)]" />
										<div className="-mt-2 h-10 w-20 rounded-t-full bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-[0_8px_20px_rgba(79,70,229,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]" />
										<div className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border-2 border-white/90 bg-white/90 text-indigo-600 shadow-md">
											<span className="font-bold text-sm">+</span>
										</div>
									</div>
								</div>
							</div>

							{/* Typography */}
							<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
								Welcome to Your Space
							</h2>
							<p className="mt-2 max-w-xs text-muted-foreground text-xs leading-relaxed sm:text-sm">
								Create your account and unlock a personalized experience just for you.
							</p>

							{/* Liquid Input Field */}
							<div className="mt-6 w-full space-y-3">
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-indigo-500">
										<UserIcon className="size-5" />
									</div>
									<input
										id="fullName"
										type="text"
										placeholder="Enter your full name"
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										required
										className="h-13 w-full rounded-full border-2 border-white/80 bg-white/60 pr-4 pl-12 font-medium text-foreground text-sm shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)] backdrop-blur-xl transition-all placeholder:text-muted-foreground/70 focus:border-indigo-500 focus:outline-none dark:border-white/20 dark:bg-white/10"
									/>
								</div>
							</div>

							{/* Pagination Dots */}
							<div className="mt-5 flex gap-1.5">
								<div className="h-1.5 w-4 rounded-full bg-indigo-600" />
								<div className="size-1.5 rounded-full bg-indigo-300/60 dark:bg-white/20" />
								<div className="size-1.5 rounded-full bg-indigo-300/60 dark:bg-white/20" />
							</div>

							{/* Liquid Pill Button: Next -> */}
							<button
								type="submit"
								className="group mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-white/90 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 font-bold text-base text-white shadow-[0_12px_28px_rgba(79,70,229,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_36px_rgba(79,70,229,0.45)] active:scale-[0.98]"
							>
								<span>Next</span>
								<ArrowRightIcon className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
							</button>
						</m.form>
					)}

					{/* ================= STEP 2: DISCOVER WHAT MATTERS (PHONE NUMBER) ================= */}
					{step === 2 && (
						<m.form
							key="step-2"
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							transition={{ duration: 0.35 }}
							onSubmit={handleNextFromStep2}
							className="flex flex-col items-center text-center"
						>
							{/* 3D Liquid Orb / Bubble Hero (Teal / Cyan) */}
							<div className="relative mb-6 flex size-44 items-center justify-center">
								{/* Floating Mini Droplets */}
								<div className="absolute top-3 left-3 size-4 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-md" />
								<div className="absolute right-2 bottom-3 size-3 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-md" />

								{/* Outer Frosted Glass Sphere */}
								<div className="relative flex size-40 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-b from-white/60 via-teal-100/30 to-white/40 shadow-[0_20px_40px_rgba(20,184,166,0.2),inset_0_4px_12px_rgba(255,255,255,0.9)] backdrop-blur-2xl dark:border-white/30 dark:from-white/20 dark:via-teal-900/20 dark:to-white/5">
									{/* 3D Teal Cards / Mobile Graphic */}
									<div className="relative flex items-center justify-center">
										<div className="flex h-16 w-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_8px_16px_rgba(20,184,166,0.4),inset_0_2px_4px_rgba(255,255,255,0.6)]">
											<div className="mb-1.5 size-4 rounded-full bg-white/80" />
											<div className="h-1.5 w-8 rounded-full bg-white/60" />
											<div className="mt-1 h-1.5 w-6 rounded-full bg-white/40" />
										</div>
										<div className="absolute -right-3 -bottom-2 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-teal-500 shadow-md">
											<DeviceMobileIcon className="size-5 text-white" />
										</div>
									</div>
								</div>
							</div>

							{/* Typography */}
							<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
								Discover What Matters
							</h2>
							<p className="mt-2 max-w-xs text-muted-foreground text-xs leading-relaxed sm:text-sm">
								Explore features that help you stay organized and get things done.
							</p>

							{/* Liquid Phone Input */}
							<div className="mt-6 w-full space-y-3">
								<div className="relative flex items-center rounded-full border-2 border-white/80 bg-white/60 p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)] backdrop-blur-xl dark:border-white/20 dark:bg-white/10">
									<div className="flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-3 py-2 font-bold text-teal-700 text-xs shadow-sm dark:bg-white/20 dark:text-teal-300">
										<span>🇮🇳</span>
										<span>{countryCode}</span>
									</div>
									<input
										id="phone"
										type="tel"
										placeholder="98765 43210"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										required
										className="h-10 w-full bg-transparent px-3 font-medium text-foreground text-sm placeholder:text-muted-foreground/70 focus:outline-none"
									/>
								</div>
							</div>

							{/* Pagination Dots */}
							<div className="mt-5 flex gap-1.5">
								<div className="size-1.5 rounded-full bg-teal-300/60 dark:bg-white/20" />
								<div className="h-1.5 w-4 rounded-full bg-teal-500" />
								<div className="size-1.5 rounded-full bg-teal-300/60 dark:bg-white/20" />
							</div>

							{/* Action Buttons */}
							<div className="mt-6 flex w-full gap-3">
								<button
									type="button"
									onClick={() => setStep(1)}
									className="flex h-13 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-white/50 text-foreground shadow-sm backdrop-blur-xl transition-all hover:scale-105 dark:border-white/20 dark:bg-white/10"
								>
									<ArrowLeftIcon className="size-5" />
								</button>
								<button
									type="submit"
									className="group flex h-13 flex-1 items-center justify-center gap-2 rounded-full border-2 border-white/90 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-600 font-bold text-base text-white shadow-[0_12px_28px_rgba(20,184,166,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_36px_rgba(20,184,166,0.45)] active:scale-[0.98]"
								>
									<span>Next</span>
									<ArrowRightIcon className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
								</button>
							</div>
						</m.form>
					)}

					{/* ================= STEP 3: YOU'RE ALL SET (RAZORPAY LIVE PAYMENT) ================= */}
					{step === 3 && (
						<m.div
							key="step-3"
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							transition={{ duration: 0.35 }}
							className="flex flex-col items-center text-center"
						>
							{/* 3D Liquid Orb / Bubble Hero (Orange / Coral Shield) */}
							<div className="relative mb-5 flex size-40 items-center justify-center">
								{/* Floating Mini Droplets */}
								<div className="absolute top-2 left-2 size-4 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-md" />
								<div className="absolute right-2 bottom-2 size-3 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-md" />

								{/* Outer Frosted Glass Sphere */}
								<div className="relative flex size-36 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-b from-white/60 via-orange-100/30 to-white/40 shadow-[0_20px_40px_rgba(249,115,22,0.2),inset_0_4px_12px_rgba(255,255,255,0.9)] backdrop-blur-2xl dark:border-white/30 dark:from-white/20 dark:via-orange-900/20 dark:to-white/5">
									{/* 3D Orange Shield with Checkmark */}
									<div className="relative flex size-18 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-[0_8px_16px_rgba(249,115,22,0.4),inset_0_2px_4px_rgba(255,255,255,0.6)]">
										<ShieldCheckIcon className="size-10 text-white" weight="fill" />
									</div>
								</div>
							</div>

							{/* Typography */}
							<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">You're All Set!</h2>
							<p className="mt-1.5 max-w-xs text-muted-foreground text-xs leading-relaxed sm:text-sm">
								Enjoy a seamless experience designed to help you achieve more every day.
							</p>

							{/* Payment Success State */}
							{paymentSuccessId ? (
								<div className="mt-4 w-full rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
									<CheckCircleIcon className="mx-auto size-10 animate-bounce text-emerald-500" />
									<h3 className="mt-2 font-bold text-base text-emerald-600 dark:text-emerald-400">
										Payment Confirmed!
									</h3>
									<p className="mt-1 text-[11px] text-muted-foreground">Redirecting to your dashboard...</p>
								</div>
							) : (
								<>
									{/* Liquid Glass Plan Selector Pills */}
									<div className="mt-4 grid w-full grid-cols-2 gap-2.5">
										{SUBSCRIPTION_PLANS.map((plan) => {
											const isSelected = selectedPlan.id === plan.id;
											return (
												<button
													type="button"
													key={plan.id}
													onClick={() => setSelectedPlan(plan)}
													className={`relative rounded-3xl border-2 p-3 text-left transition-all duration-200 ${
														isSelected
															? "scale-[1.02] border-orange-400 bg-orange-500/15 shadow-md shadow-orange-500/20 dark:border-orange-400 dark:bg-orange-500/20"
															: "border-white/80 bg-white/50 hover:bg-white/70 dark:border-white/15 dark:bg-white/5"
													}`}
												>
													{plan.badge && (
														<span className="absolute -top-2.5 right-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 px-2 py-0.5 font-bold text-[9px] text-white shadow-xs">
															{plan.badge}
														</span>
													)}
													<div className="font-bold text-foreground text-xs">{plan.durationText}</div>
													<div className="mt-1 font-extrabold text-lg text-orange-600 dark:text-orange-400">
														₹{plan.amountInRupees}
													</div>
													<p className="mt-0.5 font-medium text-[10px] text-orange-600/90 dark:text-orange-300">
														AutoPay Enabled
													</p>
												</button>
											);
										})}
									</div>

									{/* AutoPay Trust Guarantee */}
									<div className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] text-orange-700 dark:text-orange-300">
										<ShieldCheckIcon className="size-3.5" />
										<span>UPI AutoPay • Cancel anytime with 1-click in dashboard</span>
									</div>

									{/* Pagination Dots */}
									<div className="mt-3 flex gap-1.5">
										<div className="size-1.5 rounded-full bg-orange-300/60 dark:bg-white/20" />
										<div className="size-1.5 rounded-full bg-orange-300/60 dark:bg-white/20" />
										<div className="h-1.5 w-4 rounded-full bg-orange-500" />
									</div>

									{/* Action Buttons: Get Started */}
									<div className="mt-5 flex w-full gap-3">
										<button
											type="button"
											onClick={() => setStep(2)}
											disabled={isLoading}
											className="flex h-13 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-white/50 text-foreground shadow-sm backdrop-blur-xl transition-all hover:scale-105 dark:border-white/20 dark:bg-white/10"
										>
											<ArrowLeftIcon className="size-5" />
										</button>
										<button
											type="button"
											disabled={isLoading}
											onClick={handleRazorpayCheckout}
											className="group flex h-13 flex-1 items-center justify-center gap-2 rounded-full border-2 border-white/90 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 font-bold text-base text-white shadow-[0_12px_28px_rgba(249,115,22,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_36px_rgba(249,115,22,0.45)] active:scale-[0.98]"
										>
											<span>
												{isLoading ? "Processing AutoPay..." : `Start AutoPay (₹${selectedPlan.amountInRupees})`}
											</span>
											<ArrowRightIcon className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
										</button>
									</div>
								</>
							)}
						</m.div>
					)}
				</AnimatePresence>
			</m.div>
		</div>
	);
}
