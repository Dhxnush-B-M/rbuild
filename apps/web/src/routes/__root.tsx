import { DirectionProvider } from "@base-ui/react/direction-provider";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { IconProps } from "@phosphor-icons/react";
import { IconContext } from "@phosphor-icons/react";
import { Toaster } from "@rbuilder/ui/components/sonner";
import { TooltipProvider } from "@rbuilder/ui/components/tooltip";
import type { Locale } from "@rbuilder/utils/locale";
import { HotkeysProvider } from "@tanstack/react-hotkeys";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { useEffect } from "react";
import { DialogManager } from "@/dialogs/manager";
import { ThemeProvider } from "@/features/theme/provider";
import { ConfirmDialogProvider } from "@/hooks/use-confirm";
import { PromptDialogProvider } from "@/hooks/use-prompt";
import type { AuthSession } from "@/libs/auth/session";
import { getLocale, isRTL } from "@/libs/locale";
import type { FeatureFlags, orpc } from "@/libs/orpc/client";
import { defaultFeatureFlags } from "@/libs/orpc/client";
import type { Theme } from "@/libs/theme";
import { getTheme } from "@/libs/theme";

type RouterContext = {
	theme: Theme;
	locale: Locale;
	orpc: typeof orpc;
	queryClient: QueryClient;
	session: AuthSession | null;
	flags: FeatureFlags;
};

const appName = "rbuilder";
const tagline = "Next-Generation Professional Resume Builder";
const title = `${appName} — ${tagline}`;
const description =
	"rbuilder provides a modern, intuitive platform to generate, customize, and export high-impact resumes in minutes.";
const iconContextValue: IconProps = { size: 16, weight: "regular" };

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	head: () => ({
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon",
				sizes: "128x128",
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml",
				sizes: "256x256 any",
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon-180x180.png",
				type: "image/png",
				sizes: "180x180 any",
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest",
				crossOrigin: "use-credentials",
			},
		],
		meta: [
			{ title },
			{ charSet: "UTF-8" },
			{ name: "description", content: description },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "theme-color", content: "#09090B" },
			{ name: "application-name", content: "rbuilder" },
			{ name: "robots", content: "index, follow" },
		],
	}),
	beforeLoad: () => {
		const theme = getTheme();
		const locale = getLocale();
		const flags = defaultFeatureFlags;
		const session: AuthSession | null = null;

		return { theme, locale, session, flags };
	},
});

function RootComponent() {
	const { theme, locale, queryClient } = Route.useRouteContext();
	const dir = isRTL(locale) ? "rtl" : "ltr";

	useEffect(() => {
		document.documentElement.lang = locale;
		document.documentElement.dir = dir;
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [dir, locale, theme]);

	return (
		<>
			<HeadContent />

			<QueryClientProvider client={queryClient}>
				<MotionConfig reducedMotion="user">
					<LazyMotion features={domAnimation}>
						<I18nProvider i18n={i18n}>
							<IconContext.Provider value={iconContextValue}>
								<ThemeProvider theme={theme}>
									<HotkeysProvider>
										<DirectionProvider>
											<TooltipProvider>
												<ConfirmDialogProvider>
													<PromptDialogProvider>
														<Outlet />

														<DialogManager />
														<Toaster richColors position="bottom-center" />
													</PromptDialogProvider>
												</ConfirmDialogProvider>
											</TooltipProvider>
										</DirectionProvider>
									</HotkeysProvider>
								</ThemeProvider>
							</IconContext.Provider>
						</I18nProvider>
					</LazyMotion>
				</MotionConfig>
			</QueryClientProvider>
		</>
	);
}
