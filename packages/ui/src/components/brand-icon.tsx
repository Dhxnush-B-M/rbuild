import { cn } from "@rbuilder/utils/style";

type Props = {
	variant?: "logo" | "icon";
	className?: string;
};

export function BrandLogoSvg({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 100 100"
			className={cn("size-8 shrink-0", className)}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect width="100" height="100" rx="28" fill="url(#rbuilder-logo-grad)" />
			<path
				d="M50 22C50 37.464 37.464 50 22 50C37.464 50 50 62.536 50 78C50 62.536 62.536 50 78 50C62.536 50 50 37.464 50 22Z"
				fill="white"
			/>
			<path
				d="M68 28V36M64 32H72"
				stroke="white"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
			<path
				d="M78 36V42M75 39H81"
				stroke="white"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<defs>
				<linearGradient
					id="rbuilder-logo-grad"
					x1="0"
					y1="0"
					x2="100"
					y2="100"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#9333EA" />
					<stop offset="0.5" stopColor="#7C3AED" />
					<stop offset="1" stopColor="#4F46E5" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export function BrandIcon({ variant = "logo", className }: Props) {
	return (
		<div
			className={cn(
				"inline-flex select-none items-center gap-2.5 font-bold text-primary tracking-wider",
				className,
			)}
		>
			<BrandLogoSvg className="size-9 shadow-md shadow-purple-500/20 transition-transform hover:scale-105" />
			{variant === "logo" && (
				<span className="bg-gradient-to-r from-foreground via-purple-600 to-indigo-600 bg-clip-text font-extrabold text-2xl text-transparent tracking-tight">
					rbuilder
				</span>
			)}
		</div>
	);
}

