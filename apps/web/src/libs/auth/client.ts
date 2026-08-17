import type { Provider } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase/client";
import type { AuthSession } from "./session";
import { getSession } from "./session";

export const authClient = {
	getSession,
	useSession() {
		const [session, setSession] = useState<AuthSession | null>(null);
		const [isPending, setIsPending] = useState(true);

		useEffect(() => {
			let isMounted = true;
			getSession().then((sess) => {
				if (isMounted) {
					setSession(sess);
					setIsPending(false);
				}
			});

			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange(() => {
				getSession().then((sess) => {
					if (isMounted) {
						setSession(sess);
						setIsPending(false);
					}
				});
			});

			return () => {
				isMounted = false;
				subscription.unsubscribe();
			};
		}, []);

		return { data: session, isPending };
	},
	signIn: {
		email: async (options: { email: string; password: string }) => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: options.email,
				password: options.password,
			});
			return { data, error };
		},
		social: async (options: { provider: string; callbackURL?: string }) => {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: options.provider as Provider,
				options: { redirectTo: options.callbackURL },
			});
			return { data, error };
		},
	},
	signUp: {
		email: async (options: {
			email: string;
			password: string;
			name?: string;
			username?: string;
			[key: string]: unknown;
		}) => {
			const { data, error } = await supabase.auth.signUp({
				email: options.email,
				password: options.password,
				options: { data: { name: options.name, user_name: options.username } },
			});
			return { data, error };
		},
	},
	async changePassword(options: {
		currentPassword?: string;
		newPassword: string;
		revokeOtherSessions?: boolean;
	}) {
		const { data, error } = await supabase.auth.updateUser({
			password: options.newPassword,
		});
		return { data, error };
	},
	async requestPasswordReset(options: { email: string; redirectTo?: string }) {
		const { data, error } = await supabase.auth.resetPasswordForEmail(
			options.email,
			{
				redirectTo: options.redirectTo,
			},
		);
		return { data, error };
	},
	async resetPassword(options: { newPassword: string; token?: string }) {
		const { data, error } = await supabase.auth.updateUser({
			password: options.newPassword,
		});
		return { data, error };
	},
	apiKey: {
		create: async (_options?: Record<string, unknown>) =>
			Promise.resolve({ data: { key: `key_${Date.now()}` }, error: null }),
		list: async () => Promise.resolve({ data: [], error: null }),
		delete: async (_options?: Record<string, unknown>) =>
			Promise.resolve({ error: null }),
	},
	twoFactor: {
		enable: async (_options?: Record<string, unknown>) =>
			Promise.resolve({
				data: { totpURI: "", backupCodes: [] as string[] },
				error: null as { message?: string } | null,
			}),
		disable: async (_options?: Record<string, unknown>) =>
			Promise.resolve({ error: null as { message?: string } | null }),
		verifyTotp: async (_options: { code: string }) =>
			Promise.resolve({ error: null as { message?: string } | null }),
		verifyBackupCode: async (_options: { code: string }) =>
			Promise.resolve({ error: null as { message?: string } | null }),
	},
	async signOut(options?: {
		fetchOptions?: {
			onSuccess?: () => Promise<void> | void;
			onError?: (err: unknown) => void;
		};
	}) {
		try {
			await supabase.auth.signOut();
			options?.fetchOptions?.onSuccess?.();
		} catch (err) {
			options?.fetchOptions?.onError?.(err);
		}
	},
};
