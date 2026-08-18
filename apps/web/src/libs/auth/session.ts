import { supabase } from "@/libs/supabase/client";
import { getProfileByEmailFromSupabase } from "@/libs/supabase/db";

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	emailVerified?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	username?: string;
};

export type AuthSession = {
	user: AuthUser;
	session: {
		id: string;
		userId: string;
		token: string;
		expiresAt: Date;
		createdAt: Date;
		updatedAt: Date;
	};
};

export const getSession = async (): Promise<AuthSession | null> => {
	try {
		// 1. Check Supabase auth session
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (session?.user) {
			const user = session.user;
			const email = (user.email || "").toLowerCase().trim();
			const dbProfile = await getProfileByEmailFromSupabase(email);

			const name =
				dbProfile?.name ||
				(user.user_metadata?.name as string) ||
				(user.user_metadata?.full_name as string) ||
				email.split("@")[0] ||
				"User";
			const image =
				dbProfile?.avatar_url ||
				(user.user_metadata?.avatar_url as string) ||
				(user.user_metadata?.picture as string) ||
				`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || "user")}`;

			return {
				user: {
					id: dbProfile?.id || user.id,
					name,
					email,
					image,
					emailVerified: true,
					createdAt: new Date(user.created_at),
					updatedAt: new Date(user.updated_at || user.created_at),
					username: dbProfile?.username || email.split("@")[0],
				},
				session: {
					id: session.access_token,
					userId: dbProfile?.id || user.id,
					token: session.access_token,
					expiresAt: new Date(
						session.expires_at
							? session.expires_at * 1000
							: Date.now() + 86400000,
					),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};
		}

		// 2. Check if user is authenticated via direct Google OAuth
		if (typeof window !== "undefined") {
			const storedEmail =
				sessionStorage.getItem("rbuilder_auth_email") ||
				localStorage.getItem("rbuilder_auth_email");

			if (storedEmail) {
				const dbProfile = await getProfileByEmailFromSupabase(storedEmail);
				if (dbProfile) {
					return {
						user: {
							id: dbProfile.id,
							name: dbProfile.name || dbProfile.email.split("@")[0] || "User",
							email: dbProfile.email,
							image:
								dbProfile.avatar_url ||
								`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dbProfile.email)}`,
							emailVerified: true,
							createdAt: new Date(dbProfile.created_at || Date.now()),
							updatedAt: new Date(dbProfile.updated_at || Date.now()),
							username: dbProfile.username || dbProfile.email.split("@")[0],
						},
						session: {
							id: `auth_${dbProfile.id}`,
							userId: dbProfile.id,
							token: `token_${dbProfile.id}`,
							expiresAt: new Date(Date.now() + 86400000),
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					};
				}
			}
		}
	} catch (e) {
		console.warn("getSession error:", e);
	}

	return null;
};
