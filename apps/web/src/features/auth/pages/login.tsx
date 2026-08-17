import {
	LightningIcon,
	ShieldCheckIcon,
	SparkleIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { initiateGoogleOAuth2 } from "@/libs/auth/oauth2";

function GoogleColorIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={className} aria-hidden="true">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
			/>
		</svg>
	);
}

export function LoginPage() {
	const [loading, setLoading] = useState(false);

	const handleGoogleLogin = async () => {
		setLoading(true);
		toast.loading("Connecting with Google...");
		const success = await initiateGoogleOAuth2();
		if (!success) {
			setLoading(false);
			toast.dismiss();
			toast.error("Failed to connect with Google. Please try again.");
		}
	};

	return (
		<div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#FAF5FF] p-4 sm:p-6 dark:from-[#0B0C16] dark:via-[#111222] dark:to-[#17182E]">
			{/* Ambient Fluid Background Blobs */}
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-60 dark:opacity-30"
			>
				<div className="size-[650px] animate-pulse rounded-full bg-gradient-to-tr from-purple-300/40 via-indigo-300/40 to-pink-200/40 blur-3xl" />
			</div>
			<div
				aria-hidden="true"
				className="pointer-events-none fixed top-10 left-10 opacity-40 dark:opacity-20"
			>
				<div className="size-[300px] rounded-full bg-purple-400/20 blur-2xl" />
			</div>

			{/* Center Floating App Card (Image 3 UI/UX) */}
			<m.div
				initial={{ opacity: 0, scale: 0.96, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.45, ease: "easeOut" }}
				className="relative w-full max-w-[430px] overflow-hidden rounded-[38px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(109,40,217,0.08)] backdrop-blur-2xl sm:p-8 dark:border-white/10 dark:bg-[#141523]/95 dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
			>
				{/* Brand Logo Header */}
				<div className="flex flex-col items-center text-center">
					<div className="flex items-center gap-2">
						<div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
							<SparkleIcon className="size-5" weight="fill" />
						</div>
						<span className="font-extrabold text-2xl text-foreground tracking-tight">
							rbuilder
						</span>
					</div>
					<p className="mt-1 font-medium text-muted-foreground text-xs tracking-wide">
						Build. Customize. Succeed.
					</p>

					{/* Stylized Illustrated Character with Laptop */}
					<div className="relative my-4 flex h-36 w-full items-center justify-center">
						<div className="absolute size-32 rounded-full bg-purple-100/80 blur-lg dark:bg-purple-950/40" />
						<svg
							className="relative z-10 h-32 w-auto"
							viewBox="0 0 200 160"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							{/* Background Books & Leaves */}
							<rect x="145" y="115" width="35" height="8" rx="2" fill="#C4B5FD" />
							<rect x="140" y="125" width="45" height="10" rx="2" fill="#7C3AED" />
							<rect x="142" y="137" width="42" height="9" rx="2" fill="#A78BFA" />

							{/* Plant pot */}
							<path d="M22 130L26 148H36L40 130H22Z" fill="#DDD6FE" />
							<circle cx="28" cy="120" r="6" fill="#8B5CF6" />
							<circle cx="34" cy="115" r="5" fill="#6D28D9" />

							{/* Character Body */}
							<circle cx="100" cy="50" r="22" fill="#FCD34D" />
							{/* Hair */}
							<path
								d="M78 50C78 36 90 28 100 28C110 28 122 36 122 50C122 56 120 64 120 64L116 52L84 52L80 64C80 64 78 56 78 50Z"
								fill="#1E1B4B"
							/>
							<circle cx="94" cy="48" r="2" fill="#1E1B4B" />
							<circle cx="106" cy="48" r="2" fill="#1E1B4B" />
							<path
								d="M97 55C98 57 102 57 103 55"
								stroke="#1E1B4B"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
							{/* Purple Sweater */}
							<path
								d="M72 82C72 70 82 66 100 66C118 66 128 70 128 82L132 120H68L72 82Z"
								fill="#6D28D9"
							/>
							{/* Laptop */}
							<path
								d="M62 105L75 75H125L138 105H62Z"
								fill="#E2E8F0"
								stroke="#CBD5E1"
								strokeWidth="2"
							/>
							<circle cx="100" cy="90" r="4" fill="#94A3B8" />
							<rect x="54" y="105" width="92" height="6" rx="3" fill="#94A3B8" />
						</svg>
					</div>

					<h2 className="font-extrabold text-xl text-foreground tracking-tight sm:text-2xl">
						Welcome back!
					</h2>
					<p className="mt-1 text-muted-foreground text-xs">
						Sign in to continue your resume journey
					</p>
				</div>

				{/* 3 Value Propositions with Purple Icon Badges */}
				<div className="mt-5 space-y-3 text-left">
					<div className="flex items-center gap-3 rounded-2xl border border-purple-100/80 bg-purple-50/50 p-2.5 transition-colors dark:border-white/5 dark:bg-white/5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
							<ShieldCheckIcon className="size-5" weight="duotone" />
						</div>
						<div className="flex flex-col">
							<span className="font-bold text-foreground text-xs">Secure & Private</span>
							<span className="text-[11px] text-muted-foreground">Your data is safe with us</span>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-2xl border border-purple-100/80 bg-purple-50/50 p-2.5 transition-colors dark:border-white/5 dark:bg-white/5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
							<LightningIcon className="size-5" weight="fill" />
						</div>
						<div className="flex flex-col">
							<span className="font-bold text-foreground text-xs">Quick & Easy</span>
							<span className="text-[11px] text-muted-foreground">One tap sign-in with Google</span>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-2xl border border-purple-100/80 bg-purple-50/50 p-2.5 transition-colors dark:border-white/5 dark:bg-white/5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
							<TargetIcon className="size-5" weight="duotone" />
						</div>
						<div className="flex flex-col">
							<span className="font-bold text-foreground text-xs">ATS-Optimized Resumes</span>
							<span className="text-[11px] text-muted-foreground">Tailored templates to land interviews</span>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="relative my-5 flex items-center justify-center">
					<div className="w-full border-border/70 border-t" />
					<span className="absolute bg-white px-3 font-medium text-[11px] text-muted-foreground lowercase dark:bg-[#141523]">
						or
					</span>
				</div>

				{/* Google Sign-In Button */}
				<div>
					<button
						type="button"
						onClick={handleGoogleLogin}
						disabled={loading}
						className="group relative flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 font-bold text-neutral-800 text-sm shadow-sm transition-all duration-200 hover:border-purple-300 hover:bg-neutral-50/90 hover:shadow-md active:scale-[0.98] dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
					>
						<GoogleColorIcon className="size-5 transition-transform duration-200 group-hover:scale-110" />
						<span>{loading ? "Redirecting..." : "Continue with Google"}</span>
					</button>
				</div>

				{/* Footer Policy Notice */}
				<div className="mt-5 text-center">
					<p className="text-[11px] text-muted-foreground/80 leading-relaxed">
						<ShieldCheckIcon className="mr-1 inline-block size-3.5 align-text-bottom text-purple-600 dark:text-purple-400" />
						By continuing, you agree to our{" "}
						<a href="/#terms" className="font-medium text-foreground underline hover:text-purple-600">
							Terms of Service
						</a>{" "}
						and{" "}
						<a href="/#privacy" className="font-medium text-foreground underline hover:text-purple-600">
							Privacy Policy
						</a>
					</p>
				</div>
			</m.div>
		</div>
	);
}
