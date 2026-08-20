import {
	EnvelopeSimpleIcon,
	FileTextIcon,
	GlobeIcon,
	HeadsetIcon,
	PhoneCallIcon,
	SparkleIcon,
	TranslateIcon,
} from "@phosphor-icons/react";
import { BrandIcon } from "@rbuilder/ui/components/brand-icon";

export function Support() {
	return (
		<section
			id="support"
			className="relative overflow-hidden border-border/40 border-b py-20 md:py-28"
		>
			<style>{`
				@keyframes brandBlink {
					0%, 100% {
						transform: scale(1);
						filter: drop-shadow(0 0 15px rgba(147, 51, 234, 0.4)) drop-shadow(0 0 35px rgba(16, 185, 129, 0.3));
						opacity: 0.9;
					}
					50% {
						transform: scale(1.06);
						filter: drop-shadow(0 0 30px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 60px rgba(16, 185, 129, 0.6));
						opacity: 1;
					}
				}
				@keyframes pulseGlow {
					0%, 100% { opacity: 0.2; transform: scale(1); }
					50% { opacity: 0.45; transform: scale(1.15); }
				}
				.animate-brand-blink {
					animation: brandBlink 3s ease-in-out infinite;
				}
				.animate-pulse-glow {
					animation: pulseGlow 4s ease-in-out infinite;
				}
			`}</style>

			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25"
			>
				<div className="size-[650px] animate-pulse-glow rounded-full bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-emerald-500/30 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-6xl px-4">
				<div className="flex flex-col items-center text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-medium text-primary text-xs shadow-inner">
						<HeadsetIcon className="size-4 animate-bounce text-primary" />
						<span>24/7 Dedicated Support & Assistance</span>
					</div>

					<h2 className="mt-6 max-w-3xl font-extrabold text-3xl tracking-tight sm:text-4xl md:text-5xl">
						Always Supported, Whenever You Need Us
					</h2>
				</div>

				{/* ANIMATED BLINKING & GLOWING BRAND LOGO */}
				<div className="relative mt-12 flex flex-col items-center justify-center py-6">
					<div className="relative flex items-center justify-center">
						{/* Multi-layer Pulsing Halo Rings */}
						<div className="absolute size-36 animate-ping rounded-full bg-primary/20 duration-1000" />
						<div className="absolute size-48 rounded-full bg-gradient-to-tr from-purple-500/20 to-emerald-500/20 blur-xl" />

						{/* Center Blinking Logo Container */}
						<div className="animate-brand-blink relative z-10 flex size-28 items-center justify-center rounded-3xl border border-primary/40 bg-background/80 p-5 shadow-2xl backdrop-blur-2xl transition-transform sm:size-36">
							<BrandIcon variant="logo" className="h-16 w-auto sm:h-20" />
							<span className="absolute -top-1.5 -right-1.5 flex size-4">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex size-4 rounded-full bg-emerald-500 shadow-sm" />
							</span>
						</div>
					</div>

					<div className="mt-6 flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
						<span className="size-2 animate-pulse rounded-full bg-emerald-500" />
						<span className="font-semibold text-foreground">rbuilder Live Workspace</span>
						<span>•</span>
						<span>Always Online & Ready</span>
					</div>
				</div>

				{/* THREE FEATURE CARDS */}
				<div className="mt-16 grid gap-8 md:grid-cols-3">
					<div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-background/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-2xl">
						<div>
							<div className="flex items-center justify-between">
								<div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-inner">
									<PhoneCallIcon
										weight="fill"
										className="size-7 animate-pulse"
									/>
								</div>
								<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-bold text-[11px] text-emerald-500">
									<span className="size-2 animate-ping rounded-full bg-emerald-500" />
									24/7 Active
								</span>
							</div>

							<h3 className="mt-6 font-bold text-foreground text-xl tracking-tight">
								24/7 Dedicated Email Support
							</h3>

							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								Direct help available round the clock. Get immediate assistance
								with template customization, PDF exports, and account management
								anytime.
							</p>
						</div>

						<div className="mt-8 overflow-hidden border-border/50 border-t pt-6">
							<a
								href="mailto:contact@rbuilder.space"
								title="contact@rbuilder.space"
								className="inline-flex max-w-full items-center gap-2 overflow-hidden font-semibold text-emerald-500 text-xs hover:underline sm:text-sm"
							>
								<EnvelopeSimpleIcon weight="bold" className="size-4 shrink-0" />
								<span className="truncate">contact@rbuilder.space</span>
							</a>
						</div>
					</div>

					<div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-background/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl">
						<div>
							<div className="flex items-center justify-between">
								<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner">
									<SparkleIcon weight="fill" className="size-7 animate-pulse" />
								</div>
								<span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-bold text-[11px] text-primary">
									Full Assistance
								</span>
							</div>

							<h3 className="mt-6 font-bold text-foreground text-xl tracking-tight">
								Full Help to Build Resume
							</h3>

							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								Step-by-step guidance to craft job-winning resumes. Our smart
								tools and expert recommendations help tailor your experience for
								ATS filters.
							</p>
						</div>

						<div className="mt-8 border-border/50 border-t pt-6">
							<a
								href="/dashboard/resumes"
								className="inline-flex items-center gap-2 font-semibold text-primary text-sm hover:underline"
							>
								<FileTextIcon weight="bold" className="size-4" />
								<span>Start Building Now &rarr;</span>
							</a>
						</div>
					</div>

					<div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-background/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-2xl">
						<div>
							<div className="flex items-center justify-between">
								<div className="flex size-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-500 shadow-inner">
									<GlobeIcon weight="fill" className="size-7 animate-pulse" />
								</div>
								<span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 font-bold text-[11px] text-purple-500">
									50+ Languages
								</span>
							</div>

							<h3 className="mt-6 font-bold text-foreground text-xl tracking-tight">
								Most Multi-Language Support
							</h3>

							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								Create resumes in over 50+ languages with full RTL support,
								localized date formats, and global typography for international
								career opportunities.
							</p>
						</div>

						<div className="mt-8 border-border/50 border-t pt-6">
							<span className="inline-flex items-center gap-2 font-semibold text-purple-500 text-sm">
								<TranslateIcon weight="bold" className="size-4" />
								<span>50+ Languages Supported</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
