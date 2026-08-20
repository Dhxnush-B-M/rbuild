import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PaletteIcon, SignOutIcon } from "@phosphor-icons/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@rbuilder/ui/components/dropdown-menu";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/features/theme/provider";
import { authClient } from "@/libs/auth/client";
import type { AuthSession } from "@/libs/auth/session";
import { supabase } from "@/libs/supabase/client";
import { getCurrentSupabaseUser } from "@/libs/supabase/db";
import { isTheme } from "@/libs/theme";

type Props = {
	children: ({
		session,
	}: {
		session: AuthSession;
	}) => React.ComponentProps<typeof DropdownMenuTrigger>["render"];
};

export function UserDropdownMenu({ children }: Props) {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();

	const handleThemeChange = (value: string) => {
		if (!isTheme(value)) return;
		setTheme(value);
	};

	const handleLogout = async () => {
		const toastId = toast.loading(t`Signing out...`);

		try {
			if (typeof window !== "undefined") {
				sessionStorage.removeItem("rbuilder_auth_email");
				localStorage.removeItem("rbuilder_auth_email");
			}
			await supabase.auth.signOut();
			await authClient.signOut({
				fetchOptions: {
					onSuccess: async () => {
						toast.dismiss(toastId);
						await router.invalidate();
						await router.navigate({ to: "/" });
					},
					onError: (_error: unknown) => {
						toast.dismiss(toastId);
						void router.navigate({ to: "/" });
					},
				},
			});
		} catch {
			toast.dismiss(toastId);
			void router.navigate({ to: "/" });
		}
	};

	const [supabaseProfile, setSupabaseProfile] = useState<{
		name?: string;
		email?: string;
		avatar_url?: string;
	} | null>(null);

	useEffect(() => {
		let isMounted = true;
		void getCurrentSupabaseUser().then((profile) => {
			if (isMounted && profile) {
				setSupabaseProfile(profile);
			}
		});
		return () => {
			isMounted = false;
		};
	}, []);

	const activeSession: AuthSession = {
		user: {
			id: session?.user?.id || supabaseProfile?.email || "",
			name:
				supabaseProfile?.name ||
				(typeof window !== "undefined"
					? sessionStorage.getItem("rbuilder_onboarding_name")
					: null) ||
				session?.user?.name ||
				"User",
			email:
				session?.user?.email ||
				supabaseProfile?.email ||
				(typeof window !== "undefined"
					? sessionStorage.getItem("rbuilder_auth_email") ||
						localStorage.getItem("rbuilder_auth_email")
					: null) ||
				"",
			image:
				session?.user?.image ||
				supabaseProfile?.avatar_url ||
				`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(supabaseProfile?.email || session?.user?.email || "user")}`,
			emailVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
			username:
				(supabaseProfile?.name || session?.user?.name || "user")
					.toLowerCase()
					.replace(/\s+/g, "-"),
		},
		session: {
			id: "auth-session",
			userId: session?.user?.id || supabaseProfile?.email || "",
			token: "",
			expiresAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={children({ session: activeSession })} />

			<DropdownMenuContent align="start" side="top">
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<PaletteIcon />
							<Trans comment="Menu item that opens appearance theme selection submenu">
								Theme
							</Trans>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup
								value={theme}
								onValueChange={handleThemeChange}
							>
								<DropdownMenuRadioItem value="light">
									<Trans comment="Appearance theme option for light mode">
										Light
									</Trans>
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="dark">
									<Trans comment="Appearance theme option for dark mode">
										Dark
									</Trans>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuItem onClick={handleLogout}>
					<SignOutIcon />
					<Trans comment="User menu action to sign out of current account">
						Logout
					</Trans>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
