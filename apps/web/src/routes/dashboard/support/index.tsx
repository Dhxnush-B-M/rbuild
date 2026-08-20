import { t } from "@lingui/core/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowSquareOutIcon,
	CheckIcon,
	CopySimpleIcon,
	EnvelopeSimpleIcon,
	HeadsetIcon,
	PhoneCallIcon,
	SpinnerGapIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Button } from "@rbuilder/ui/components/button";
import { Separator } from "@rbuilder/ui/components/separator";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCurrentSupabaseUser, submitCallbackRequestToSupabase } from "@/libs/supabase/db";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/support/")({
	component: SupportRouteComponent,
});

function SupportRouteComponent() {
	const [copied, setCopied] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalStep, setModalStep] = useState<"options" | "callback">("options");
	
	// Form state
	const [phone, setPhone] = useState("");
	const [reason, setReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [phoneTouched, setPhoneTouched] = useState(false);
	const [reasonTouched, setReasonTouched] = useState(false);
	const [userName, setUserName] = useState("User");
	const [userEmail, setUserEmail] = useState("");

	useEffect(() => {
		void getCurrentSupabaseUser().then((profile) => {
			if (profile) {
				if (profile.name) setUserName(profile.name);
				if (profile.email) setUserEmail(profile.email);
				if (profile.phone) setPhone(profile.phone);
			}
		});
	}, []);

	const handleCopyEmail = async () => {
		await navigator.clipboard.writeText("contact@rbuilder.space");
		setCopied(true);
		toast.success(t`Support email copied to clipboard!`);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleOpenModal = () => {
		setModalStep("options");
		setIsModalOpen(true);
		setPhoneTouched(false);
		setReasonTouched(false);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setModalStep("options");
		setReason("");
		setPhoneTouched(false);
		setReasonTouched(false);
	};

	// Clean numeric phone check
	const cleanPhoneDigits = phone.replace(/\D/g, "");
	const isPhoneValid = cleanPhoneDigits.length >= 10;
	const isReasonValid = reason.trim().length > 0;

	const handleSubmitCallback = async (e: React.FormEvent) => {
		e.preventDefault();
		setPhoneTouched(true);
		setReasonTouched(true);

		if (!isPhoneValid) {
			toast.error(t`Please enter a valid phone number with at least 10 digits.`);
			return;
		}

		if (!isReasonValid) {
			toast.error(t`Please briefly describe what you need help with.`);
			return;
		}

		setIsSubmitting(true);
		try {
			const success = await submitCallbackRequestToSupabase({
				phone: phone.trim(),
				reason: reason.trim(),
				name: userName,
				email: userEmail,
			});

			if (success) {
				toast.success(t`🎉 Callback request submitted! Our team will call you soon.`);
				handleCloseModal();
			} else {
				toast.error(t`Could not submit callback request. Please try again.`);
			}
		} catch {
			toast.error(t`Something went wrong. Please try again.`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<DashboardHeader icon={HeadsetIcon} title={t`Customer Support`} />

			<Separator />

			<div className="mx-auto max-w-4xl pt-4">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Call Support Card */}
					<div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 sm:p-8">
						<div>
							<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<PhoneCallIcon size={32} />
							</div>
							<h3 className="mt-6 font-bold text-2xl text-foreground tracking-tight">
								Call Support
							</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								Call our support team between 7 PM and 7 AM. We’ll call you back
								within 24–48 hours, as soon as possible.
							</p>
						</div>

						<div className="mt-8 pt-4">
							<Button
								size="lg"
								className="w-full gap-2 font-bold"
								onClick={handleOpenModal}
							>
								<PhoneCallIcon className="size-5" />
								<span>Request a Call Back</span>
							</Button>
						</div>
					</div>

					{/* Email Support Card */}
					<div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 sm:p-8">
						<div>
							<div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
								<EnvelopeSimpleIcon size={32} />
							</div>
							<h3 className="mt-6 font-bold text-2xl text-foreground tracking-tight">
								Email Support
							</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								Reach us directly by email. We reply to all inquiries and
								feedback in under 15 minutes.
							</p>

							{/* Interactive Email Bar */}
							<button
								type="button"
								onClick={handleCopyEmail}
								className="group mt-4 flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-white/10 bg-background/50 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-background/80"
							>
								<span className="truncate font-mono text-foreground text-xs sm:text-sm">
									contact@rbuilder.space
								</span>
								<span className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs transition-colors group-hover:text-primary">
									{copied ? (
										<CheckIcon className="size-4 text-emerald-400" />
									) : (
										<CopySimpleIcon className="size-4" />
									)}
									<span>{copied ? "Copied" : "Copy"}</span>
								</span>
							</button>
						</div>

						<div className="mt-8 pt-4">
							<Button
								size="lg"
								className="w-full gap-2 font-bold"
								nativeButton={false}
								render={
									<a href="mailto:contact@rbuilder.space">
										<ArrowSquareOutIcon className="size-5" />
										<span>Send Email</span>
									</a>
								}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* SUPPORT DIALOG MODAL (Image 2 & Image 3) */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
						onClick={handleCloseModal}
						aria-hidden="true"
					/>

					{/* Modal Card */}
					<div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-background shadow-2xl transition-all">
						{modalStep === "options" ? (
							/* STEP 1: Contact Us (Image 2) */
							<div>
								{/* Header */}
								<div className="flex items-center justify-between border-border/50 border-b px-6 py-5">
									<h2 className="font-bold text-foreground text-xl tracking-tight">
										Contact Us
									</h2>
									<button
										type="button"
										onClick={handleCloseModal}
										className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
									>
										<XIcon className="size-5" />
									</button>
								</div>

								{/* Options List */}
								<div className="p-4">
									<button
										type="button"
										onClick={() => setModalStep("callback")}
										className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/50 p-4 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-md"
									>
										<div className="flex items-center gap-3.5">
											<div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-105">
												<PhoneCallIcon className="size-5" />
											</div>
											<div>
												<h4 className="font-semibold text-foreground text-sm">
													Request for callback
												</h4>
												<p className="text-muted-foreground text-xs">
													Call timings: 7:00 PM – 7:00 AM
												</p>
											</div>
										</div>

										<ArrowRightIcon className="size-4 text-blue-500 transition-transform group-hover:translate-x-1" />
									</button>
								</div>
							</div>
						) : (
							/* STEP 2: Request for Callback Form (Image 3) */
							<div>
								{/* Navy Header */}
								<div className="bg-[#0f172a] px-6 py-5 text-white">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<button
												type="button"
												onClick={() => setModalStep("options")}
												className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
											>
												<ArrowLeftIcon className="size-5" />
											</button>
											<div>
												<h2 className="font-bold text-lg text-white tracking-tight">
													Request for Callback
												</h2>
												<p className="text-slate-300 text-xs">
													Share your details for us to reach you?
												</p>
											</div>
										</div>

										<button
											type="button"
											onClick={handleCloseModal}
											className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
										>
											<XIcon className="size-5" />
										</button>
									</div>
								</div>

								{/* Form Body */}
								<form onSubmit={handleSubmitCallback} className="space-y-4 p-6">
									{/* Phone Field */}
									<div className="space-y-1.5">
										<label
											htmlFor="callback-phone"
											className="block font-semibold text-foreground text-xs sm:text-sm"
										>
											Where can we call you?
										</label>
										<div className="relative">
											<input
												id="callback-phone"
												type="tel"
												value={phone}
												onChange={(e) => {
													setPhone(e.target.value);
													setPhoneTouched(true);
												}}
												placeholder="+91 9876543210"
												className={`w-full rounded-xl border bg-background/80 px-3.5 py-2.5 font-medium text-foreground text-sm transition-colors focus:outline-none focus:ring-2 ${
													phoneTouched && !isPhoneValid
														? "border-red-500 focus:ring-red-500/30"
														: "border-border/80 focus:border-primary focus:ring-primary/20"
												}`}
											/>
										</div>

										<div className="flex items-center justify-between text-[11px]">
											{phoneTouched && !isPhoneValid ? (
												<span className="font-medium text-red-500">
													⚠️ Enter valid phone no. (at least 10 digits)
												</span>
											) : (
												<span className="text-muted-foreground">
													Include your country code if outside India
												</span>
											)}
											<span className="text-muted-foreground font-mono">
												{cleanPhoneDigits.length}/10
											</span>
										</div>
									</div>

									{/* Description / Reason Field */}
									<div className="space-y-1.5">
										<label
											htmlFor="callback-reason"
											className="block font-semibold text-foreground text-xs sm:text-sm"
										>
											Description<span className="text-red-500">*</span>
										</label>
										<textarea
											id="callback-reason"
											rows={4}
											value={reason}
											onChange={(e) => {
												setReason(e.target.value);
												setReasonTouched(true);
											}}
											placeholder="Briefly let us know what you need help with"
											className={`w-full resize-none rounded-xl border bg-background/80 p-3 text-foreground text-sm transition-colors focus:outline-none focus:ring-2 ${
												reasonTouched && !isReasonValid
													? "border-red-500 focus:ring-red-500/30"
													: "border-border/80 focus:border-primary focus:ring-primary/20"
											}`}
										/>
										{reasonTouched && !isReasonValid && (
											<span className="block text-[11px] font-medium text-red-500">
												Please fill in this field.
											</span>
										)}
									</div>

									{/* Submit CTA */}
									<div className="pt-2">
										<Button
											type="submit"
											size="lg"
											disabled={isSubmitting || !phone || !reason.trim()}
											className="w-full gap-2 font-bold"
										>
											{isSubmitting ? (
												<>
													<SpinnerGapIcon className="size-4 animate-spin" />
													<span>Sending Request...</span>
												</>
											) : (
												<span>Send Callback Request</span>
											)}
										</Button>
									</div>
								</form>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
