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
				if (profile.onboarding_completed && profile.subscription_status === "active") {
					return "allowed";
				}
				return "needs_onboarding";
			}
		}

		const googleUser = localStorage.getItem("rbuilder_google_user");
		if (googleUser) {
			const parsed = JSON.parse(googleUser);
			if (parsed?.onboarding_completed && parsed?.subscription_status === "active") {
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
 * If the user has subscribed on ANY device, grants instant access to dashboard.
 */
export async function verifyUserSubscriptionAcrossDevices(): Promise<AccessStatus> {
	if (typeof window === "undefined") return "allowed";

	const syncStatus = checkAuthAndOnboardingAccess();
	if (syncStatus === "allowed") return "allowed";

	try {
		// 1. Check current Supabase session
		const currentProfile = await getCurrentSupabaseUser();
		if (currentProfile?.email) {
			if (currentProfile.onboarding_completed && currentProfile.subscription_status === "active") {
				localStorage.setItem("rbuilder_user_profile", JSON.stringify(currentProfile));
				return "allowed";
			}
		}

		// 2. Check if a google account email was registered
		const googleUserRaw = localStorage.getItem("rbuilder_google_user");
		if (googleUserRaw) {
			const googleUser = JSON.parse(googleUserRaw);
			if (googleUser?.email) {
				const dbProfile = await getProfileByEmailFromSupabase(googleUser.email);
				if (dbProfile?.onboarding_completed && dbProfile?.subscription_status === "active") {
					localStorage.setItem("rbuilder_user_profile", JSON.stringify(dbProfile));
					return "allowed";
				}
				return "needs_onboarding";
			}
		}

		return "unauthenticated";
	} catch {
		return "unauthenticated";
	}
}
