import type { AuthSession } from "@/libs/auth/session";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PaletteIcon, SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
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
} from "@reactive-resume/ui/components/dropdown-menu";
import { useTheme } from "@/features/theme/provider";
import { authClient } from "@/libs/auth/client";
import { isTheme } from "@/libs/theme";

type Props = {
	children: ({ session }: { session: AuthSession }) => React.ComponentProps<typeof DropdownMenuTrigger>["render"];
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
				localStorage.removeItem("rbuilder_user_profile");
				localStorage.removeItem("rbuilder_google_user");
			}

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

	const activeSession: AuthSession = session?.user
		? session
		: {
				user: {
					id: "logged_in_user",
					name: "User",
					email: "user@gmail.com",
					image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: "user",
				},
				session: {
					id: "auth-session",
					userId: "logged_in_user",
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
							<Trans comment="Menu item that opens appearance theme selection submenu">Theme</Trans>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
								<DropdownMenuRadioItem value="light">
									<Trans comment="Appearance theme option for light mode">Light</Trans>
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="dark">
									<Trans comment="Appearance theme option for dark mode">Dark</Trans>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuItem onClick={handleLogout}>
					<SignOutIcon />
					<Trans comment="User menu action to sign out of current account">Logout</Trans>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
