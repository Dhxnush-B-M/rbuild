import { GithubLogoIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@rbuilder/ui/components/button";
import { cn } from "@rbuilder/utils/style";
import { supabase } from "@/libs/supabase/client";

type SocialAuthProps = {
	requestSignUp?: boolean;
};

function GoogleColorIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={cn("size-5 shrink-0", className)} aria-hidden="true">
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

export function SocialAuth({ requestSignUp = false }: SocialAuthProps) {
	const handleOAuthSignIn = async (provider: "google" | "github") => {
		const toastId = toast.loading(`Connecting to ${provider === "google" ? "Google" : "GitHub"} OAuth 2.0...`);
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/onboarding`,
				},
			});

			if (error) {
				toast.error(error.message, { id: toastId });
				return;
			}
			toast.dismiss(toastId);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to sign in. Please try again.", { id: toastId });
		}
	};

	return (
		<div className="flex w-full flex-col gap-3">
			<Button
				type="button"
				size="lg"
				onClick={() => handleOAuthSignIn("google")}
				className="h-11 w-full justify-center gap-3 rounded-xl border border-white/15 bg-background/60 font-semibold text-foreground text-sm shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:bg-white/10 active:scale-[0.99]"
			>
				<GoogleColorIcon />
				<span>{requestSignUp ? "Sign up with Google (OAuth 2.0)" : "Continue with Google (OAuth 2.0)"}</span>
			</Button>

			<Button
				type="button"
				size="lg"
				variant="secondary"
				onClick={() => handleOAuthSignIn("github")}
				className="h-11 w-full justify-center gap-3 rounded-xl border border-white/15 bg-background/40 font-semibold text-foreground text-sm shadow-xs backdrop-blur-md transition-all hover:border-primary/40 hover:bg-white/10 active:scale-[0.99]"
			>
				<GithubLogoIcon className="size-5" />
				<span>{requestSignUp ? "Sign up with GitHub (OAuth 2.0)" : "Continue with GitHub (OAuth 2.0)"}</span>
			</Button>
		</div>
	);
}
