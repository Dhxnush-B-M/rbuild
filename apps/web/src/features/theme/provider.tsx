import type { PropsWithChildren } from "react";
import type { Theme } from "@/libs/theme";
import { useRouter } from "@tanstack/react-router";
import { createContext, use, useEffect } from "react";
import { setThemeCookie } from "@/libs/theme";

type ThemeContextValue = {
	theme: Theme;
	setTheme: (value: Theme, options?: { playSound?: boolean }) => void;
	toggleTheme: (options?: { playSound?: boolean }) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = PropsWithChildren<{ theme: Theme }>;

export function ThemeProvider({ children, theme }: Props) {
	const router = useRouter();

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	async function setTheme(value: Theme, options: { playSound?: boolean } = {}) {
		const { playSound = true } = options;

		document.documentElement.classList.toggle("dark", value === "dark");
		setThemeCookie(value);
		void router.invalidate();

		if (!playSound) return;

		try {
			const soundClip = value === "dark" ? "/sounds/switch-off.mp3" : "/sounds/switch-on.mp3";
			const audio = new Audio(soundClip);
			await audio.play().catch(() => playSynthClick(value === "dark"));
		} catch {
			playSynthClick(value === "dark");
		}
	}

	function toggleTheme(options: { playSound?: boolean } = {}) {
		void setTheme(theme === "dark" ? "light" : "dark", options);
	}

	return <ThemeContext value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
	const value = use(ThemeContext);

	if (!value) throw new Error("useTheme must be used within a ThemeProvider");

	return value;
}

function playSynthClick(isDark: boolean) {
	try {
		const AudioCtx =
			window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(isDark ? 320 : 640, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(isDark ? 120 : 880, ctx.currentTime + 0.08);
		gain.gain.setValueAtTime(0.25, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.08);
	} catch {
		// ignore audio errors
	}
}
