import { supabase } from "@/libs/supabase/client";

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
	// Query Supabase auth session and database profile directly

	// 2. Check Supabase auth session
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (session?.user) {
			const user = session.user;
			const email = user.email || "user@example.com";
			const name =
				(user.user_metadata?.name as string) ||
				(user.user_metadata?.full_name as string) ||
				email.split("@")[0] ||
				"User";
			const image =
				(user.user_metadata?.avatar_url as string) ||
				(user.user_metadata?.picture as string) ||
				`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

			return {
				user: {
					id: user.id,
					name,
					email,
					image,
					emailVerified: true,
					createdAt: new Date(user.created_at),
					updatedAt: new Date(user.updated_at || user.created_at),
					username: email.split("@")[0],
				},
				session: {
					id: session.access_token,
					userId: user.id,
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
	} catch {
		// fallback below
	}

	// Fallback Guest Session
	return {
		user: {
			id: "guest-user",
			name: "Guest User",
			email: "guest@gmail.com",
			image: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuestUser",
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			username: "guest",
		},
		session: {
			id: "guest-session-token",
			userId: "guest-user",
			token: "guest-token",
			expiresAt: new Date(Date.now() + 365 * 86400000),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	};
};
