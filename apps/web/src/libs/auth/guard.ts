import { getCurrentSupabaseUser, getProfileByEmailFromSupabase } from "@/libs/supabase/db";

export type AccessStatus = "allowed" | "unauthenticated" | "needs_onboarding";

/**
 * Synchronous check for fast local rendering
 */
export function checkAuthAndOnboardingAccess(): AccessStatus {
	if (typeof window === "undefined") return "allowed";
	try {
		const cached = localStorage.getItem("rbuilder_user_profile");
		if (cached) {
			const profile = JSON.parse(cached);
			if (profile?.email) {
				return "allowed";
			}
		}

		const googleUser = localStorage.getItem("rbuilder_google_user");
		if (googleUser) {
			const parsed = JSON.parse(googleUser);
			if (parsed?.email) {
				return "allowed";
			}
		}

		return "unauthenticated";
	} catch {
		return "unauthenticated";
	}
}

/**
 * Asynchronous cross-device check querying Supabase directly by Gmail/Email.
 */
export async function verifyUserSubscriptionAcrossDevices(): Promise<AccessStatus> {
	if (typeof window === "undefined") return "allowed";

	const syncStatus = checkAuthAndOnboardingAccess();
	if (syncStatus === "allowed") return "allowed";

	try {
		// 1. Check current Supabase session
		const currentProfile = await getCurrentSupabaseUser();
		if (currentProfile?.email) {
			localStorage.setItem("rbuilder_user_profile", JSON.stringify(currentProfile));
			return "allowed";
		}

		// 2. Check if a google account email was registered
		const googleUserRaw = localStorage.getItem("rbuilder_google_user");
		if (googleUserRaw) {
			const googleUser = JSON.parse(googleUserRaw);
			if (googleUser?.email) {
				const dbProfile = await getProfileByEmailFromSupabase(googleUser.email);
				if (dbProfile?.email) {
					localStorage.setItem("rbuilder_user_profile", JSON.stringify(dbProfile));
					return "allowed";
				}
			}
		}

		return "unauthenticated";
	} catch {
		return "unauthenticated";
	}
}
