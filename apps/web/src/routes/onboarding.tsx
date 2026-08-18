import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckCircleIcon,
	CreditCardIcon,
	CurrencyInrIcon,
	GraduationCapIcon,
	HeadsetIcon,
	LockIcon,
	PhoneIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StudentIcon,
	UserIcon,
	WalletIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandLogoSvg } from "@rbuilder/ui/components/brand-icon";
import {
	initiateRazorpayPayment,
	SUBSCRIPTION_PLANS,
	type SubscriptionPlanOption,
} from "@/libs/payment/razorpay";
import { getCurrentSupabaseUser, saveUserToSupabase } from "@/libs/supabase/db";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
});

function OnboardingPage() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [countryCode] = useState("+91");
	const [email, setEmail] = useState("");
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanOption>(
		SUBSCRIPTION_PLANS[0]!,
	);
	const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
	const [isLoading, setIsLoading] = useState(false);
	const [hasInitiatedPayment, setHasInitiatedPayment] = useState(false);
	const [paymentIdInput, setPaymentIdInput] = useState("");

	useEffect(() => {
		let isMounted = true;
		void getCurrentSupabaseUser().then((profile) => {
			if (!isMounted) return;
			if (
				profile?.onboarding_completed &&
				profile?.subscription_status === "active"
			) {
				void navigate({ to: "/dashboard/resumes", replace: true });
				return;
			}
			if (profile?.name) setFullName(profile.name);
			if (profile?.email) setEmail(profile.email);
			if (profile?.phone) setPhone(profile.phone);
			if (profile?.payment_id) setPaymentIdInput(profile.payment_id);
		});
		return () => {
			isMounted = false;
		};
	}, [navigate]);

	const handleNextStep = () => {
		if (currentStep === 1) {
			if (!fullName.trim()) {
				toast.error("Please enter your full name");
				return;
			}
			setCurrentStep(2);
		} else if (currentStep === 2) {
			if (!phone.trim()) {
				toast.error("Please enter your phone number");
				return;
			}
			setCurrentStep(3);
		} else if (currentStep === 3) {
			void handleInitiatePayment();
		}
	};

	const handlePrevStep = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
		}
	};

	const handleInitiatePayment = async (planOverride?: typeof selectedPlan) => {
		const planToPay = planOverride || selectedPlan;
		const userEmail = email.trim().toLowerCase() || "user@rbuilder.app";
		const userName = fullName.trim() || "Resume Creator";
		const userPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : "";

		setIsLoading(true);

		await initiateRazorpayPayment({
			plan: planToPay,
			userEmail,
			userName,
			userPhone,
			onSuccess: async (paymentId) => {
				setIsLoading(false);
				toast.success("🎉 Payment successful! Pro Plan activated.");
				const activeProfile = {
					name: userName,
					username: userName.toLowerCase().replace(/\s+/g, "-"),
					email: userEmail,
					phone: userPhone,
					subscription_status: "active" as const,
					subscription_plan: planToPay.id,
					subscription_amount: planToPay.amountInRupees,
					payment_id: paymentId,
					onboarding_completed: true,
				};
				await saveUserToSupabase(activeProfile);
				void navigate({ to: "/dashboard/resumes", replace: true });
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

	const handleVerifyPayment = async () => {
		const cleanRef = paymentIdInput.trim();
		if (!cleanRef || cleanRef.length < 5) {
			toast.error("Please enter a valid Razorpay Payment ID (e.g. pay_...) or UPI Reference Number.");
			return;
		}

		setIsLoading(true);
		const userEmail = email.trim().toLowerCase() || "user@rbuilder.app";
		const userName = fullName.trim() || "Resume Creator";
		const userPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : "";

		const activeProfile = {
			name: userName,
			username: userName.toLowerCase().replace(/\s+/g, "-"),
			email: userEmail,
			phone: userPhone,
			subscription_status: "active" as const,
			subscription_plan: selectedPlan.id,
			subscription_amount: selectedPlan.amountInRupees,
			payment_id: cleanRef,
			onboarding_completed: true,
		};

		await saveUserToSupabase(activeProfile);
		setIsLoading(false);
		toast.success("🎉 Payment verified! Pro access activated.");
		void navigate({ to: "/dashboard/resumes", replace: true });
	};

	const stepsConfig = [
		{ num: 1, label: "Name" },
		{ num: 2, label: "Phone" },
		{ num: 3, label: "Plan" },
	];

	return (
		<div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-x-hidden bg-[#F8F9FD] px-4 py-8 dark:bg-[#0C0D18]">
			{/* Ambient Gradient Blobs */}
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-40 dark:opacity-20"
			>
				<div className="size-[650px] animate-pulse rounded-full bg-gradient-to-tr from-purple-200/50 via-indigo-200/50 to-pink-100/50 blur-3xl" />
			</div>

			{/* Main Center Card (Image 1 UI/UX) */}
			<m.div
				initial={{ opacity: 0, scale: 0.97, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.45 }}
				className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[38px] border border-white/90 bg-white p-6 shadow-[0_20px_60px_rgba(109,40,217,0.09)] sm:p-8 dark:border-white/10 dark:bg-[#151624]"
			>
				{/* Top Step Counter & Logo */}
				<div className="mb-6 text-center">
					<div className="mb-3 flex items-center justify-center gap-2">
						<BrandLogoSvg className="size-7 shadow-sm shadow-purple-500/20" />
						<span className="font-extrabold text-foreground text-lg tracking-tight">rbuilder</span>
					</div>
					<p className="font-semibold text-[13px] text-muted-foreground">
						Step {currentStep} of 3
					</p>

					{/* Stepper Progress Bar */}
					<div className="mt-3 flex items-center justify-between px-2">
						{stepsConfig.map((s, idx) => {
							const isPassed = currentStep > s.num;
							const isCurrent = currentStep === s.num;
							return (
								<div key={s.num} className="flex flex-1 items-center">
									<div className="flex flex-col items-center">
										<div
											className={`flex size-8 items-center justify-center rounded-full font-bold text-xs transition-all ${
												isPassed
													? "bg-purple-600 text-white"
													: isCurrent
														? "bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-950"
														: "bg-neutral-100 text-muted-foreground dark:bg-white/10"
											}`}
										>
											{isPassed ? <CheckCircleIcon className="size-4" weight="bold" /> : s.num}
										</div>
										<span
											className={`mt-1 font-semibold text-[10px] ${
												isCurrent || isPassed ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
											}`}
										>
											{s.label}
										</span>
									</div>
									{idx < stepsConfig.length - 1 && (
										<div
											className={`mx-1.5 h-0.5 flex-1 border-t-2 border-dashed ${
												currentStep > idx + 1 ? "border-purple-600" : "border-neutral-200 dark:border-white/15"
											}`}
										/>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Step Content Container */}
				<AnimatePresence mode="wait">
					{/* STEP 1: Name */}
					{currentStep === 1 && (
						<m.div
							key="step1"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.25 }}
							className="flex flex-col items-center text-center"
						>
							{/* Illustrated Avatar Badge with Pencil */}
							<div className="relative mb-5 flex size-24 items-center justify-center rounded-full bg-purple-100/90 dark:bg-purple-950/50">
								<UserIcon className="size-12 text-purple-600" weight="fill" />
								<div className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-purple-600 text-white shadow-sm dark:border-[#151624]">
									<SparkleIcon className="size-3.5" weight="fill" />
								</div>
							</div>

							<h2 className="font-extrabold text-2xl text-foreground tracking-tight">
								Let's start with your name
							</h2>
							<p className="mt-1 text-muted-foreground text-xs">
								Please enter your full name
							</p>

							{/* Name Input Field */}
							<div className="mt-6 w-full text-left">
								<label htmlFor="fullname" className="font-semibold text-foreground text-xs">
									Full Name
								</label>
								<div className="relative mt-1.5">
									<div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
										<UserIcon className="size-4" />
									</div>
									<input
										id="fullname"
										type="text"
										placeholder="Enter your full name"
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
										className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 pr-4 pl-10 font-medium text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-purple-600 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:focus:bg-transparent"
									/>
								</div>
							</div>

							<button
								type="button"
								onClick={handleNextStep}
								className="mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 font-bold text-sm text-white shadow-md shadow-purple-600/25 transition-all hover:bg-purple-700 active:scale-[0.98]"
							>
								<span>Next</span>
								<ArrowRightIcon className="size-4" />
							</button>
						</m.div>
					)}

					{/* STEP 2: Phone */}
					{currentStep === 2 && (
						<m.div
							key="step2"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.25 }}
							className="flex flex-col items-center text-center"
						>
							{/* Phone Illustration Badge */}
							<div className="relative mb-5 flex size-24 items-center justify-center rounded-full bg-purple-100/90 dark:bg-purple-950/50">
								<PhoneIcon className="size-12 text-purple-600" weight="fill" />
							</div>

							<h2 className="font-extrabold text-2xl text-foreground tracking-tight">
								Enter your phone number
							</h2>
							<p className="mt-1 text-muted-foreground text-xs">
								We'll use this to stay in touch and recover your account
							</p>

							{/* Phone Input with Country Code */}
							<div className="mt-6 w-full text-left">
								<label htmlFor="phone" className="font-semibold text-foreground text-xs">
									Phone Number
								</label>
								<div className="mt-1.5 flex gap-2">
									<div className="flex h-12 items-center gap-1.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 px-3 font-medium text-foreground text-xs dark:border-white/10 dark:bg-white/5">
										<span>🇮🇳</span>
										<span>{countryCode}</span>
									</div>
									<input
										id="phone"
										type="tel"
										placeholder="Enter your phone number"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
										className="h-12 w-full flex-1 rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 font-medium text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-purple-600 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:focus:bg-transparent"
									/>
								</div>
								<div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
									<LockIcon className="size-3 text-emerald-600" />
									<span>Your number is safe with us</span>
								</div>
							</div>

							<button
								type="button"
								onClick={handleNextStep}
								className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 font-bold text-sm text-white shadow-md shadow-purple-600/25 transition-all hover:bg-purple-700 active:scale-[0.98]"
							>
								<span>Next</span>
								<ArrowRightIcon className="size-4" />
							</button>

							<button
								type="button"
								onClick={handlePrevStep}
								className="mt-3 flex items-center justify-center gap-1 font-semibold text-muted-foreground text-xs hover:text-foreground"
							>
								<ArrowLeftIcon className="size-3" />
								<span>Back</span>
							</button>
						</m.div>
					)}

					{/* STEP 3: Plan Selection (Image 2 Dark Slate Pricing UI) */}
					{currentStep === 3 && (
						<m.div
							key="step3"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.25 }}
							className="flex flex-col items-center text-center"
						>
							{/* Graduation Cap / Pro Badge */}
							<div className="relative mb-4 flex size-20 items-center justify-center rounded-full bg-purple-100/90 dark:bg-purple-950/50">
								<GraduationCapIcon className="size-10 text-purple-600" weight="fill" />
							</div>

							<h2 className="font-extrabold text-2xl text-foreground tracking-tight">
								Choose your plan
							</h2>
							<p className="mt-1 text-muted-foreground text-xs">
								Select the plan to unlock premium templates & ATS export
							</p>

							{/* Plan Cards */}
							<div className="mt-5 w-full space-y-3 text-left">
										{SUBSCRIPTION_PLANS.map((plan) => {
											const isSelected = selectedPlan.id === plan.id;
											return (
												<div
													key={plan.id}
													onClick={() => setSelectedPlan(plan)}
													className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 ${
														isSelected
															? "border-2 border-yellow-400 bg-[#171B26] text-white shadow-xl dark:bg-[#121520]"
															: "border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/80 dark:border-white/10 dark:bg-white/5"
													}`}
												>
													{/* Top Badges */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<div
																className={`size-4 rounded-full border-2 ${
																	isSelected
																		? "border-yellow-400 bg-yellow-400"
																		: "border-muted-foreground"
																}`}
															/>
															<span className="font-bold text-sm">
																{plan.id === "3_months" ? "Resume Pro" : "Resume Starter"}
															</span>
														</div>
														{plan.badge && (
															<span className="rounded-full bg-yellow-400 px-2.5 py-0.5 font-extrabold text-[10px] text-neutral-900">
																{plan.badge}
															</span>
														)}
													</div>

													{/* Price Row */}
													<div className="mt-2 flex items-baseline gap-2">
														<span className="font-extrabold text-2xl text-yellow-400">
															₹{plan.amountInRupees}
														</span>
														<span className="text-[11px] text-neutral-400">
															/ {plan.durationText}
														</span>
														<span className="text-[11px] text-neutral-400 line-through">
															₹{plan.id === "3_months" ? "63" : "22"}
														</span>
													</div>

													{/* Features List */}
													<div className="mt-3 space-y-1.5 border-neutral-700/50 border-t pt-3">
														<div className="flex items-center gap-2 text-[11px]">
															<CheckCircleIcon className="size-3.5 text-emerald-400" weight="fill" />
															<span>Unlimited High-Res PDF & DOCX Downloads</span>
														</div>
														<div className="flex items-center gap-2 text-[11px]">
															<CheckCircleIcon className="size-3.5 text-emerald-400" weight="fill" />
															<span>All 15+ ATS-Optimized Templates</span>
														</div>
														<div className="flex items-center gap-2 text-[11px]">
															<CheckCircleIcon className="size-3.5 text-emerald-400" weight="fill" />
															<span>Permanent Cloud Sync & Direct Share Link</span>
														</div>
													</div>
												</div>
											);
										})}
									</div>

									<button
										type="button"
										disabled={isLoading}
										onClick={() => void handleInitiatePayment()}
										className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 font-bold text-sm text-white shadow-md shadow-purple-600/25 transition-all hover:bg-purple-700 active:scale-[0.98]"
									>
										<WalletIcon className="size-4" weight="fill" />
										<span>{isLoading ? "Opening Razorpay..." : `Pay ₹${selectedPlan.amountInRupees} with Razorpay`}</span>
									</button>

									{/* Verification Section */}
									<div className="mt-5 w-full rounded-2xl border border-purple-200/80 bg-purple-50/50 p-4 text-left dark:border-purple-500/20 dark:bg-purple-950/20">
										<div className="flex items-center gap-2">
											<CheckCircleIcon className="size-4 text-purple-600 dark:text-purple-400" weight="fill" />
											<span className="font-bold text-xs text-foreground">Payment Verification</span>
										</div>
										<p className="mt-1 text-muted-foreground text-[11px]">
											After completing payment on Razorpay, enter your <strong>Razorpay Payment ID (e.g. pay_...)</strong> or <strong>UPI Reference / UTR Number</strong> below:
										</p>
										<input
											type="text"
											placeholder="e.g. pay_TRExsTqAfyzGiO or 12-digit UPI UTR"
											value={paymentIdInput}
											onChange={(e) => setPaymentIdInput(e.target.value)}
											className="mt-2.5 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-neutral-900"
										/>
										<button
											type="button"
											disabled={isLoading}
											onClick={() => void handleVerifyPayment()}
											className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-xs text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
										>
											<CheckCircleIcon className="size-4" weight="fill" />
											<span>{isLoading ? "Verifying..." : "Verify Payment & Unlock Dashboard"}</span>
										</button>
									</div>

									<button
										type="button"
										onClick={handlePrevStep}
										className="mt-4 flex items-center justify-center gap-1 font-semibold text-muted-foreground text-xs hover:text-foreground"
									>
										<ArrowLeftIcon className="size-3" />
										<span>Back</span>
									</button>
						</m.div>
					)}
				</AnimatePresence>
			</m.div>

		</div>
	);
}
