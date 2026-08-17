import { getCurrentSupabaseUser, getProfileByEmailFromSupabase, saveUserToSupabase } from "@/libs/supabase/db";

export type AccessStatus = "allowed" | "unauthenticated" | "needs_onboarding";

/**
 * Synchronous check for fast local rendering
 */
export function checkAuthAndOnboardingAccess(): AccessStatus {
	if (typeof window === "undefined") return "allowed";
	try {
		// 1. Check if returning from Google OAuth redirect with hash token
		const hash = window.location.hash;
		if (hash && (hash.includes("id_token") || hash.includes("access_token"))) {
			const params = new URLSearchParams(hash.replace(/^#/, ""));
			const idToken = params.get("id_token");
			if (idToken) {
				try {
					const base64Url = idToken.split(".")[1] || "";
					const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
					const jsonPayload = decodeURIComponent(
						atob(base64)
							.split("")
							.map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
							.join(""),
					);
					const payload = JSON.parse(jsonPayload);
					const userEmail = (payload.email || "").toLowerCase().trim();
					if (userEmail) {
						const googleUser = {
							id: payload.sub || `google_${Date.now()}`,
							email: userEmail,
							name: payload.name || userEmail.split("@")[0] || "Google User",
							picture:
								payload.picture ||
								`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail || "user")}`,
							onboarding_completed: true,
							subscription_status: "active",
						};
						localStorage.setItem("rbuilder_google_user", JSON.stringify(googleUser));
						localStorage.setItem("rbuilder_user_profile", JSON.stringify(googleUser));
						void saveUserToSupabase({
							id: googleUser.id,
							email: googleUser.email,
							name: googleUser.name,
							avatar_url: googleUser.picture,
							provider: "google_oauth2",
							subscription_status: "active",
							onboarding_completed: true,
						});
						return "allowed";
					}
				} catch (e) {
					console.warn("Failed to parse OAuth id_token in guard:", e);
				}
			}
		}

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
