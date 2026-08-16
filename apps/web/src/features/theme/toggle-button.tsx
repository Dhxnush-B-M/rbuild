import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { startTransition, useCallback } from "react";
import { useTheme } from "./provider";

export function ThemeToggleButton({ className, ...props }: React.ComponentProps<"button">) {
	const { theme, toggleTheme } = useTheme();

	const onToggleTheme = useCallback(() => {
		startTransition(() => {
			toggleTheme({ playSound: true });
		});
	}, [toggleTheme]);

	const isDark = theme === "dark";

	return (
		<button
			type="button"
			onClick={onToggleTheme}
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			title={isDark ? "Switch to light theme" : "Switch to dark theme"}
			className={`group relative flex size-10 items-center justify-center rounded-full border border-white/20 bg-background/40 shadow-md backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-muted/80 active:scale-95 dark:border-white/10 ${
				className ?? ""
			}`}
			{...props}
		>
			<span className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			{isDark ? (
				<SunIcon className="size-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
			) : (
				<MoonIcon className="size-5 text-indigo-500 transition-transform duration-300 group-hover:-rotate-12" />
			)}
		</button>
	);
}
