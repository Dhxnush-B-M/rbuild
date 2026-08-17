import { ArrowRightIcon, SparkleIcon, UserIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { m } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCurrentSupabaseUser, saveUserToSupabase } from "@/libs/supabase/db";

export const Route = createFileRoute("/onboarding")({
	component: OnboardingPage,
});

function OnboardingPage() {
	const navigate = useNavigate();
	const [fullName, setFullName] = useState("");
	const [jobTitle, setJobTitle] = useState("");
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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

	const handleFinishOnboarding = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!fullName.trim()) {
			toast.error("Please enter your name");
			return;
		}

		setIsLoading(true);
		const userEmail = email.trim() || "user@rbuilder.app";
		const profile = {
			name: fullName.trim(),
			username: (fullName.trim()).toLowerCase().replace(/\s+/g, "-"),
			email: userEmail,
			job_title: jobTitle.trim(),
			onboarding_completed: true,
			subscription_status: "active" as const,
		};

		localStorage.setItem("rbuilder_user_profile", JSON.stringify(profile));
		await saveUserToSupabase(profile);

		toast.success("Workspace ready!");
		void navigate({ to: "/dashboard/resumes" });
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
				className="relative w-full max-w-[460px] rounded-[44px] border-2 border-white/80 bg-white/40 p-8 shadow-[0_30px_80px_rgba(30,58,138,0.15),inset_0_2px_6px_rgba(255,255,255,0.9)] backdrop-blur-3xl dark:border-white/20 dark:bg-white/10"
			>
				<form onSubmit={handleFinishOnboarding} className="flex flex-col items-center text-center">
					{/* Icon Header */}
					<div className="relative mb-6 flex size-24 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-b from-white/70 to-indigo-100/50 shadow-lg backdrop-blur-2xl dark:border-white/20 dark:from-white/20 dark:to-white/5">
						<SparkleIcon className="size-10 text-primary" weight="duotone" />
					</div>

					<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						Set Up Your Workspace
					</h2>
					<p className="mt-2 text-muted-foreground text-xs leading-relaxed sm:text-sm">
						Customize your profile to start creating professional, ATS-optimized resumes.
					</p>

					<div className="mt-6 w-full space-y-3.5 text-left">
						<div>
							<label htmlFor="name" className="font-semibold text-foreground text-xs">
								Your Name
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
									required
									className="h-11 w-full rounded-2xl border border-white/80 bg-white/70 pr-4 pl-10 font-medium text-foreground text-sm shadow-xs backdrop-blur-xl transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none dark:border-white/20 dark:bg-white/10"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="role" className="font-semibold text-foreground text-xs">
								Target Job Title (Optional)
							</label>
							<input
								id="role"
								type="text"
								placeholder="e.g. Software Engineer, Marketing Manager"
								value={jobTitle}
								onChange={(e) => setJobTitle(e.target.value)}
								className="mt-1 h-11 w-full rounded-2xl border border-white/80 bg-white/70 px-4 font-medium text-foreground text-sm shadow-xs backdrop-blur-xl transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none dark:border-white/20 dark:bg-white/10"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-white/90 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 font-bold text-sm text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98]"
					>
						<span>{isLoading ? "Preparing..." : "Get Started & Build Resume"}</span>
						<ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
					</button>
				</form>
			</m.div>
		</div>
	);
}

