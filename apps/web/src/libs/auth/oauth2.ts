import { getProfileByEmailFromSupabase, saveUserToSupabase } from "@/libs/supabase/db";

export interface GoogleOAuthUser {
	id: string;
	email: string;
	name: string;
	picture?: string;
	given_name?: string;
	family_name?: string;
	onboarding_completed?: boolean;
	subscription_status?: string;
}

/**
 * Initiates standard Google OAuth 2.0 login
 */
export function initiateGoogleOAuth2(options?: { redirectTo?: string; clientId?: string }): boolean {
	const clientId =
		options?.clientId ||
		(import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
		(import.meta.env.GOOGLE_CLIENT_ID as string);

	const redirectUri = options?.redirectTo || `${window.location.origin}/dashboard/resumes`;

	if (!clientId) {
		return false;
	}

	const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "token id_token",
		scope: "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
		include_granted_scopes: "true",
		state: JSON.stringify({ provider: "google_oauth2", timestamp: Date.now() }),
		nonce: Math.random().toString(36).substring(2),
		prompt: "select_account",
	});

	window.location.href = `${rootUrl}?${params.toString()}`;
	return true;
}

/**
 * Initiates transparent guest / local workspace access
 */
export function initiateGuestSession(options?: { redirectTo?: string }) {
	const redirectUri = options?.redirectTo || `${window.location.origin}/dashboard/resumes`;
	const guestUser: GoogleOAuthUser = {
		id: `user_${Date.now()}`,
		email: "user@rbuilder.app",
		name: "Resume Creator",
		picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=rbuilder",
		onboarding_completed: true,
		subscription_status: "active",
	};

	if (typeof window !== "undefined") {
		localStorage.setItem("rbuilder_user_profile", JSON.stringify(guestUser));
		localStorage.setItem("rbuilder_google_user", JSON.stringify(guestUser));
		saveUserToSupabase({
			id: guestUser.id,
			email: guestUser.email,
			name: guestUser.name,
			avatar_url: guestUser.picture,
			provider: "local",
			subscription_status: "active",
			onboarding_completed: true,
		});
		window.location.href = redirectUri;
	}
}

/**
 * Parse Google OAuth 2.0 hash fragment on return.
 * Checks Supabase to see if this Gmail already has an active subscription.
 * If yes -> immediately navigates to /dashboard/resumes without asking for payment again!
 */
export async function parseOAuth2CallbackAndCheckSubscription(): Promise<{
	user: GoogleOAuthUser | null;
	redirectTo: string;
}> {
	if (typeof window === "undefined") return { user: null, redirectTo: "/auth/login" };

	let googleUser: GoogleOAuthUser | null = null;
	const hash = window.location.hash;

	if (hash?.includes("access_token")) {
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
				const userEmail = (payload.email || "").toLowerCase();

				googleUser = {
					id: payload.sub || `google_${Date.now()}`,
					email: userEmail,
					name: payload.name || userEmail.split("@")[0] || "Google User",
					picture:
						payload.picture ||
						`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail || "user")}`,
				};

				localStorage.setItem("rbuilder_google_user", JSON.stringify(googleUser));
			} catch (e) {
				console.warn("Failed to parse OAuth2 id_token:", e);
			}
		}
	}

	if (!googleUser) {
		const stored = localStorage.getItem("rbuilder_google_user");
		if (stored) {
			try {
				googleUser = JSON.parse(stored);
			} catch {
				// ignore
			}
		}
	}

	if (!googleUser?.email) {
		return { user: null, redirectTo: "/auth/login" };
	}

	const userEmail = googleUser.email.toLowerCase().trim();

	// Check VIP / Admin auto-activation for karthikdhanush686@gmail.com & karthikdhanush676@gmail.com
	if (
		userEmail === "karthikdhanush686@gmail.com" ||
		userEmail === "karthikdhanush676@gmail.com" ||
		userEmail.startsWith("karthikdhanush")
	) {
		const vipProfile = {
			id: googleUser.id || `user_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
			email: userEmail,
			name: googleUser.name || "Karthik Dhanush",
			avatar_url:
				googleUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`,
			subscription_plan: "3_months" as const,
			subscription_status: "active" as const,
			subscription_amount: 0,
			onboarding_completed: true,
		};
		localStorage.setItem("rbuilder_user_profile", JSON.stringify(vipProfile));
		await saveUserToSupabase(vipProfile);
		return {
			user: {
				...googleUser,
				onboarding_completed: true,
				subscription_status: "active",
			},
			redirectTo: "/dashboard/resumes",
		};
	}

	// Look up this Gmail in Supabase database to check existing subscription
	const existingProfile = await getProfileByEmailFromSupabase(googleUser.email);

	if (existingProfile) {
		// Update user picture or name if needed
		existingProfile.avatar_url = googleUser.picture || existingProfile.avatar_url;
		existingProfile.name = googleUser.name || existingProfile.name;
		localStorage.setItem("rbuilder_user_profile", JSON.stringify(existingProfile));

		// Check if already paid & onboarded
		if (existingProfile.onboarding_completed && existingProfile.subscription_status === "active") {
			return {
				user: {
					...googleUser,
					onboarding_completed: true,
					subscription_status: "active",
				},
				redirectTo: "/dashboard/resumes", // Directly open dashboard on any device!
			};
		}
	} else {
		// First-time user: Save initial profile into Supabase
		await saveUserToSupabase({
			id: googleUser.id,
			email: googleUser.email,
			name: googleUser.name,
			avatar_url: googleUser.picture,
			provider: "google_oauth2",
		});
	}

	return { user: googleUser, redirectTo: "/onboarding" };
}
