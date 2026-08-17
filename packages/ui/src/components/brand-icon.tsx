// rbuilder brand icon - rb neon green monogram v2
import { cn } from "@rbuilder/utils/style";

type Props = {
	variant?: "logo" | "icon";
	className?: string;
};

/**
 * The canonical "rb" neon-green monogram SVG.
 * Used everywhere a logo mark appears: headers, footers, sidebars, login, onboarding, loading screens.
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
					<stop offset="0%" stopColor="#3DFFA0" />
					<stop offset="55%" stopColor="#00E87A" />
					<stop offset="100%" stopColor="#00C060" />
				</linearGradient>
			</defs>

			{/* ── "r" letterform ──────────────────────────────────────── */}
			{/* Left vertical stem of the r */}
			<path
				fill="url(#rb-green-grad)"
				d="M18 170 L18 98
           C18 55 48 22 92 22
           L115 22 L115 48
           L92 48
           C65 48 48 64 48 98
           L48 170 Z"
			/>

			{/* ── "b" letterform ──────────────────────────────────────── */}
			{/* Tall vertical stem of the b — shared / overlapping with r arch */}
			<path
				fill="url(#rb-green-grad)"
				d="M100 14 L126 14 L126 170 L100 170 Z"
			/>

			{/* Bowl of the b (right circular half) */}
			<path
				fill="url(#rb-green-grad)"
				d="M126 82
           C126 82 142 76 158 76
           C188 76 204 96 204 124
           C204 152 188 172 158 172
           C142 172 126 166 126 166
           L126 142
           C126 142 142 148 158 148
           C172 148 178 138 178 124
           C178 110 172 100 158 100
           C142 100 126 106 126 106 Z"
			/>
		</svg>
	);
}

/**
 * Full brand mark: logo + wordmark.
 * Use variant="icon" to render only the mark (no text).
 */
export function BrandIcon({ variant = "logo", className }: Props) {
	return (
		<div
			className={cn(
				"inline-flex select-none items-center gap-2.5",
				className,
			)}
		>
			<BrandLogoSvg className="size-8 drop-shadow-[0_0_8px_rgba(0,232,122,0.35)] transition-transform hover:scale-105" />
			{variant === "logo" && (
				<span className="bg-gradient-to-r from-[#3DFFA0] via-[#00E87A] to-[#00C060] bg-clip-text font-extrabold text-2xl text-transparent tracking-tight">
					rbuilder
				</span>
			)}
		</div>
	);
}
