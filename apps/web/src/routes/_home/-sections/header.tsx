import { ArrowRightIcon } from "@phosphor-icons/react";
import { BrandIcon } from "@rbuilder/ui/components/brand-icon";
import { Link } from "@tanstack/react-router";
import { m, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import { ThemeToggleButton } from "@/features/theme/toggle-button";

export function Header() {
	const y = useMotionValue(0);
	const lastScroll = useRef(0);
	const ticking = useRef(false);
	const springY = useSpring(y, { stiffness: 300, damping: 40 });

	useEffect(() => {
		if (typeof window === "undefined") return;

		function onScroll() {
			const current = window.scrollY ?? 0;
			if (!ticking.current) {
				window.requestAnimationFrame(() => {
					if (current > 32 && current > lastScroll.current) {
						y.set(-100);
					} else {
						y.set(0);
					}
					lastScroll.current = current;
					ticking.current = false;
				});
				ticking.current = true;
			}
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [y]);

	return (
		<m.header
			style={{ y: springY }}
			className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 sm:px-6 lg:px-8"
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.35, ease: "easeOut" }}
		>
			<nav
				aria-label="Main navigation"
				className="pointer-events-auto mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full bg-background/60 px-4 py-2.5 shadow-2xl shadow-black/10 backdrop-blur-2xl transition-all duration-300 sm:mt-4"
			>
				{/* Brand Logo */}
				<Link
					to="/"
					className="flex items-center gap-x-2 transition-transform duration-300 hover:scale-105"
					aria-label="rbuilder - Go to homepage"
				>
					<BrandIcon className="h-9" />
				</Link>

				{/* Controls */}
				<div className="flex items-center gap-x-3">
					<ThemeToggleButton />

					<Link
						to="/dashboard/resumes"
						aria-label="Go to builder"
						title="Go to builder"
						className="group relative flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95"
					>
						<ArrowRightIcon className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
					</Link>
				</div>
			</nav>
		</m.header>
	);
}
