import { m } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@reactive-resume/utils/style";

const textClassName = cn(
	"select-none fill-transparent font-extrabold text-5xl leading-none tracking-wider md:text-6xl",
);

type TextMaskEffectProps = {
	text: string;
	duration?: number;
	className?: string;
	"aria-hidden"?: boolean | "true" | "false";
};

export const TextMaskEffect = ({ text, duration = 16, className, "aria-hidden": ariaHidden }: TextMaskEffectProps) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [hovered, setHovered] = useState(false);
	const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

	// Repeating offsets for seamless horizontal loop moving left to right
	const offsets = [-600, -300, 0, 300, 600, 900];

	return (
		<div className="relative w-full overflow-hidden py-4">
			<svg
				ref={svgRef}
				width="100%"
				height="120"
				viewBox="0 0 600 70"
				aria-hidden={ariaHidden}
				aria-label="Text mask effect"
				className={cn("w-full select-none overflow-visible", className)}
				xmlns="http://www.w3.org/2000/svg"
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				onMouseMove={(e) => {
					if (!svgRef.current) return;
					const svgRect = svgRef.current.getBoundingClientRect();
					const cxPercentage = ((e.clientX - svgRect.left) / svgRect.width) * 100;
					const cyPercentage = ((e.clientY - svgRect.top) / svgRect.height) * 100;

					setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
				}}
			>
				<defs>
					<linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="35%">
						<stop offset="0%" stopColor="#38bdf8" />
						<stop offset="25%" stopColor="#818cf8" />
						<stop offset="50%" stopColor="#c084fc" />
						<stop offset="75%" stopColor="#f472b6" />
						<stop offset="100%" stopColor="#38bdf8" />
					</linearGradient>

					<m.radialGradient
						r="25%"
						id="revealMask"
						animate={maskPosition}
						gradientUnits="userSpaceOnUse"
						initial={{ cx: "50%", cy: "50%" }}
						transition={{ duration: 0, ease: "easeOut" }}
					>
						<stop offset="0%" stopColor="white" />
						<stop offset="100%" stopColor="black" />
					</m.radialGradient>

					<mask id="textMask">
						<rect x="-1000" y="-100" width="3000" height="300" fill="url(#revealMask)" />
					</mask>
				</defs>

				{/* Continuous Left-to-Right Animated Track */}
				<m.g
					animate={{ x: [-300, 0] }}
					transition={{
						duration,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				>
					{/* Outlined Base Text */}
					{offsets.map((offsetX) => (
						<text
							key={`base-${offsetX}`}
							x={offsetX + 150}
							y="50%"
							strokeWidth="0.6"
							textAnchor="middle"
							dominantBaseline="central"
							style={{ opacity: hovered ? 0.35 : 0.2 }}
							className={cn(textClassName, "stroke-foreground transition-opacity duration-300")}
						>
							{text}
						</text>
					))}

					{/* Subtle Glow / Accent Layer */}
					{offsets.map((offsetX) => (
						<text
							key={`glow-${offsetX}`}
							x={offsetX + 150}
							y="50%"
							strokeWidth="0.8"
							textAnchor="middle"
							dominantBaseline="central"
							className={cn(textClassName, "stroke-primary/40")}
						>
							{text}
						</text>
					))}

					{/* Interactive Gradient Highlight Mask Layer */}
					{offsets.map((offsetX) => (
						<text
							key={`mask-${offsetX}`}
							x={offsetX + 150}
							y="50%"
							strokeWidth="1.2"
							textAnchor="middle"
							mask="url(#textMask)"
							dominantBaseline="central"
							stroke="url(#textGradient)"
							className={cn(textClassName)}
						>
							{text}
						</text>
					))}
				</m.g>
			</svg>
		</div>
	);
};
