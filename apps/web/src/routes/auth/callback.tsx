import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseOAuth2CallbackAndCheckSubscription } from "@/libs/auth/oauth2";

export const Route = createFileRoute("/auth/callback")({
	component: AuthCallbackPage,
});

export function AuthCallbackPage() {
	const navigate = useNavigate();
	const [statusMessage, setStatusMessage] = useState("Authenticating with Google...");

	useEffect(() => {
		let isMounted = true;

		async function handleCallback() {
			try {
				setStatusMessage("Verifying your session...");
				const result = await parseOAuth2CallbackAndCheckSubscription();

				if (!isMounted) return;

				if (!result.user || !result.user.email) {
					toast.error("Authentication failed. Please try signing in again.");
					void navigate({ to: "/auth/login", replace: true });
					return;
				}

				toast.success(`Welcome, ${result.user.name || "User"}!`);

				// Validate redirect to prevent open redirects
				const target = result.redirectTo.startsWith("/dashboard") ? "/dashboard/resumes" : "/onboarding";
				void navigate({ to: target, replace: true });
			} catch (err) {
				console.error("Auth callback error:", err);
				toast.error("Failed to complete sign in. Please try again.");
				if (isMounted) {
					void navigate({ to: "/auth/login", replace: true });
				}
			}
		}

		void handleCallback();

		return () => {
			isMounted = false;
		};
	}, [navigate]);

	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
			<div className="flex flex-col items-center gap-4 rounded-3xl border border-border/80 bg-background/60 p-8 shadow-2xl backdrop-blur-2xl">
				<div className="size-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
				<h2 className="font-bold text-foreground text-lg">{statusMessage}</h2>
				<p className="text-muted-foreground text-xs">Securing your session and checking account status...</p>
			</div>
		</div>
	);
}
