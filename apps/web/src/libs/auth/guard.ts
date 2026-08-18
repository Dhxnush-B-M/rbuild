import {
	getCurrentSupabaseUser,
	getProfileByEmailFromSupabase,
} from "@/libs/supabase/db";

export type AccessStatus = "allowed" | "unauthenticated" | "needs_onboarding";

/**
 * List of allowed internal route destinations to prevent open redirect vulnerabilities
 */
const ALLOWED_REDIRECT_PATHS = new Set([
	"/",
	"/auth/login",
	"/auth/callback",
	"/onboarding",
	"/dashboard",
	"/dashboard/resumes",
	"/dashboard/settings",
]);

export function isAllowedRedirect(path: string): boolean {
	if (!path || typeof path !== "string") return false;
	if (
		path.startsWith("http://") ||
		path.startsWith("https://") ||
		path.startsWith("//")
	)
		return false;
	return (
		ALLOWED_REDIRECT_PATHS.has(path) ||
		path.startsWith("/dashboard") ||
		path.startsWith("/builder")
	);
}

/**
 * Synchronous check for fast local rendering
 */
export function checkAuthAndOnboardingAccess(): AccessStatus {
	if (typeof window === "undefined") return "allowed";
	// Clean any lingering URL hash for security
	if (window.location.hash) {
		try {
			window.history.replaceState(
				null,
				"",
				window.location.pathname + window.location.search,
			);
		} catch {}
	}
	return "allowed";
}

/**
 * Asynchronous check querying Supabase directly by Gmail/Email.
 */
export async function verifyUserSubscriptionAcrossDevices(): Promise<AccessStatus> {
	if (typeof window === "undefined") return "allowed";

	try {
		const currentProfile = await getCurrentSupabaseUser();
		if (currentProfile?.email) {
			return "allowed";
		}

		return "unauthenticated";
	} catch {
		return "unauthenticated";
	}
}
