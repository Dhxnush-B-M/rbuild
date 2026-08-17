import { SparkleIcon, UserIcon } from "@phosphor-icons/react";
import { m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function LoginPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleInstantEnter = (e?: React.FormEvent) => {
		e?.preventDefault();
		setLoading(true);
		toast.success("Opening your workspace...");

		const userName = name.trim() || "Resume Creator";
		const userEmail = email.trim().toLowerCase() || "user@rbuilder.app";

		const profile = {
			id: `user_${Date.now()}`,
			email: userEmail,
			name: userName,
			avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`,
			onboarding_completed: true,
			subscription_status: "active",
		};

		localStorage.setItem("rbuilder_user_profile", JSON.stringify(profile));
		localStorage.setItem("rbuilder_google_user", JSON.stringify(profile));

		setTimeout(() => {
			window.location.href = `${window.location.origin}/dashboard/resumes`;
		}, 300);
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

			{/* Outer Tablet Frame */}
			<m.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="relative w-full max-w-[480px] rounded-[44px] border-[6px] border-neutral-800/80 bg-neutral-900/5 p-4 shadow-[0_30px_70px_rgba(0,0,0,0.25)] backdrop-blur-3xl sm:p-8 dark:border-neutral-700/80"
			>
				{/* Inner Frosted Water-Glass Card */}
				<div className="relative overflow-hidden rounded-[36px] border-2 border-white/70 bg-white/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] backdrop-blur-2xl dark:border-white/20 dark:bg-white/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)]">
					{/* Top Frosted Avatar Silhouette */}
					<div className="mb-6 flex flex-col items-center justify-center">
						<div className="relative flex size-20 items-center justify-center rounded-full border-2 border-white/80 bg-white/50 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_2px_5px_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/30 dark:bg-white/15 dark:shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(255,255,255,0.3)]">
							<div className="flex size-12 items-center justify-center rounded-full bg-neutral-800 text-white shadow-md dark:bg-white dark:text-neutral-900">
								<UserIcon className="size-6" weight="fill" />
							</div>
						</div>

						<h2 className="mt-4 font-extrabold text-2xl text-foreground tracking-tight">Welcome to rbuilder</h2>
						<p className="mt-1 text-muted-foreground text-xs">Access your free resume workspace</p>
					</div>

					{/* Instant Access Form */}
					<form onSubmit={handleInstantEnter} className="space-y-3.5">
						<div>
							<input
								type="text"
								placeholder="Your Name (Optional)"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-12 w-full rounded-2xl border border-white/70 bg-white/50 px-4 font-medium text-foreground text-sm placeholder:text-muted-foreground/70 focus:border-indigo-500 focus:outline-none dark:border-white/20 dark:bg-white/10"
							/>
						</div>

						<div>
							<input
								type="email"
								placeholder="Your Email (Optional)"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-12 w-full rounded-2xl border border-white/70 bg-white/50 px-4 font-medium text-foreground text-sm placeholder:text-muted-foreground/70 focus:border-indigo-500 focus:outline-none dark:border-white/20 dark:bg-white/10"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="group relative flex h-13 w-full items-center justify-center gap-2.5 rounded-full border-2 border-white/90 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 font-bold text-base text-white shadow-[0_12px_28px_rgba(79,70,229,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_36px_rgba(79,70,229,0.45)] active:scale-[0.98]"
						>
							<SparkleIcon className="size-5 text-indigo-200" weight="fill" />
							<span>{loading ? "Opening Workspace..." : "Start Building Free"}</span>
						</button>
					</form>

					{/* Bottom Trust Notice */}
					<div className="mt-6 text-center">
						<p className="text-[11px] text-muted-foreground/80">
							100% Free • Open Source • Zero Tracking • Instant Access
						</p>
					</div>
				</div>
			</m.div>
		</div>
	);
}
