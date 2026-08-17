// rbuilder brand icon - rb neon green monogram
import { cn } from "@rbuilder/utils/style";

type Props = {
	variant?: "logo" | "icon";
	className?: string;
};

/**
 * Inline SVG rb mark.
 * Use this when you need the mark directly embedded in JSX (login page, onboarding hero, etc.)
 */
export function BrandLogoSvg({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 220 200"
			className={cn("shrink-0", className)}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="rbuilder logo"
			role="img"
		>
			<defs>
				<linearGradient
					id="rb-green-grad"
					x1="0"
					y1="0"
					x2="220"
					y2="200"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor="#3FFFA3" />
					<stop offset="55%" stopColor="#00EB7C" />
					<stop offset="100%" stopColor="#00C262" />
				</linearGradient>
			</defs>
			{/* r left stem + arch */}
			<path
				fill="url(#rb-green-grad)"
				d="M18 170 L18 98 C18 55 48 22 92 22 L115 22 L115 48 L92 48 C65 48 48 64 48 98 L48 170 Z"
			/>
			{/* b tall stem */}
			<path
				fill="url(#rb-green-grad)"
				d="M100 14 L126 14 L126 170 L100 170 Z"
			/>
			{/* b right bowl */}
			<path
				fill="url(#rb-green-grad)"
				d="M126 82 C126 82 142 76 158 76 C188 76 204 96 204 124 C204 152 188 172 158 172 C142 172 126 166 126 166 L126 142 C126 142 142 148 158 148 C172 148 178 138 178 124 C178 110 172 100 158 100 C142 100 126 106 126 106 Z"
			/>
		</svg>
	);
}

/**
 * Theme-aware brand component — renders SVG image files for clean dark/light switching.
 *
 * variant="logo"  → full horizontal lockup (rb mark + "rbuilder" wordmark)
 *                   Use h-* className (e.g. h-9, h-10) to control height; width auto.
 *
 * variant="icon"  → standalone square rb mark only
 *                   Use size-* className (e.g. size-8, size-10) for square sizing.
 */
export function BrandIcon({ variant = "logo", className }: Props) {
	const { dark, light } =
		variant === "icon"
			? { dark: "/icon/dark.svg", light: "/icon/light.svg" }
			: { dark: "/logo/dark.svg", light: "/logo/light.svg" };

	return (
		<>
			<img
				src={dark}
				alt="rbuilder"
				className={cn("hidden shrink-0 dark:block", className)}
			/>
			<img
				src={light}
				alt="rbuilder"
				className={cn("shrink-0 dark:hidden", className)}
			/>
		</>
	);
}
