import { UserIcon } from "@phosphor-icons/react";
import { m } from "motion/react";
import { toast } from "sonner";
import { cn } from "@reactive-resume/utils/style";
import { initiateGoogleOAuth2 } from "@/libs/auth/oauth2";

function GoogleColorIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={cn("size-6 shrink-0", className)} aria-hidden="true">
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
	const handleGoogleSignIn = () => {
		toast.loading("Connecting to Google OAuth 2.0...");
		initiateGoogleOAuth2({
			redirectTo: `${window.location.origin}/onboarding`,
		});
	};

	return (
		<div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 p-4 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-900">
			{/* Ambient Fluid Glow Spheres */}
			<div aria-hidden="true" className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-40">
				<div className="size-[600px] animate-pulse rounded-full bg-gradient-to-tr from-cyan-400/20 via-blue-500/20 to-indigo-500/20 blur-3xl" />
			</div>
			<div aria-hidden="true" className="pointer-events-none fixed top-10 left-10 opacity-30">
				<div className="size-[350px] rounded-full bg-gradient-to-br from-white/30 to-slate-400/20 blur-2xl" />
			</div>

			{/* Outer Tablet Frame (Matching Mockup Tablet Device) */}
			<m.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="relative w-full max-w-[480px] rounded-[44px] border-[6px] border-neutral-800/80 bg-neutral-900/5 p-4 shadow-[0_30px_70px_rgba(0,0,0,0.25)] backdrop-blur-3xl sm:p-8 dark:border-neutral-700/80"
			>
				{/* Inner Frosted Water-Glass Card (Exact Mockup Bubble Card) */}
				<div className="relative overflow-hidden rounded-[36px] border-2 border-white/70 bg-white/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] backdrop-blur-2xl dark:border-white/20 dark:bg-white/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)]">
					{/* Top Frosted Avatar Silhouette */}
					<div className="mb-8 flex flex-col items-center justify-center">
						<div className="relative flex size-24 items-center justify-center rounded-full border-2 border-white/80 bg-white/50 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_2px_5px_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/30 dark:bg-white/15 dark:shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(255,255,255,0.3)]">
							<div className="flex size-14 items-center justify-center rounded-full bg-neutral-800 text-white shadow-md dark:bg-white dark:text-neutral-900">
								<UserIcon className="size-8" weight="fill" />
							</div>
						</div>

						<h2 className="mt-4 font-extrabold text-2xl text-foreground tracking-tight">Welcome Back</h2>
						<p className="mt-1 text-muted-foreground text-xs">Sign in with your Google account to continue</p>
					</div>

					{/* Frosted Glass Pill Button: Sign In with Google */}
					<div className="space-y-4 pt-2">
						<button
							type="button"
							onClick={handleGoogleSignIn}
							className="group relative flex h-14 w-full items-center justify-center gap-3.5 rounded-full border-2 border-white/90 bg-gradient-to-b from-white/95 to-white/75 px-6 font-bold text-base text-neutral-900 shadow-[0_12px_28px_rgba(0,0,0,0.12),inset_0_2px_3px_rgba(255,255,255,1)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] active:scale-[0.98] dark:border-white/30 dark:from-white/25 dark:to-white/10 dark:text-white dark:shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.4)]"
						>
							<GoogleColorIcon className="size-6 transition-transform duration-300 group-hover:scale-110" />
							<span>Sign in with Google</span>
						</button>
					</div>

					{/* Subtle Bottom Trust Notice */}
					<div className="mt-8 text-center">
						<p className="text-[11px] text-muted-foreground/80">
							OAuth 2.0 Secure Authentication • Instant 1-Click Access
						</p>
					</div>
				</div>
			</m.div>
		</div>
	);
}
