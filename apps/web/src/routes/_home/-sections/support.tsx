import {
	CodeIcon,
	CpuIcon,
	DatabaseIcon,
	EnvelopeSimpleIcon,
	FileTextIcon,
	GlobeIcon,
	HeadsetIcon,
	LightningIcon,
	PaletteIcon,
	PhoneCallIcon,
	ShieldCheckIcon,
	SparkleIcon,
	TerminalIcon,
	TranslateIcon,
} from "@phosphor-icons/react";

const flyingLogos = [
	{
		id: "1",
		name: "PDF Engine",
		icon: LightningIcon,
		color: "text-amber-400",
		glow: "shadow-amber-500/20",
		delay: "0s",
	},
	{
		id: "2",
		name: "ATS Parser",
		icon: ShieldCheckIcon,
		color: "text-emerald-400",
		glow: "shadow-emerald-500/20",
		delay: "0.5s",
	},
	{ id: "3", name: "Local DB", icon: DatabaseIcon, color: "text-blue-400", glow: "shadow-blue-500/20", delay: "1s" },
	{
		id: "4",
		name: "Custom Styling",
		icon: PaletteIcon,
		color: "text-purple-400",
		glow: "shadow-purple-500/20",
		delay: "1.5s",
	},
	{ id: "5", name: "Global Fonts", icon: GlobeIcon, color: "text-pink-400", glow: "shadow-pink-500/20", delay: "2s" },
	{
		id: "6",
		name: "Fast Render",
		icon: CpuIcon,
		color: "text-indigo-400",
		glow: "shadow-indigo-500/20",
		delay: "2.5s",
	},
	{
		id: "7",
		name: "Multi-Resume",
		icon: FileTextIcon,
		color: "text-teal-400",
		glow: "shadow-teal-500/20",
		delay: "3s",
	},
	{ id: "8", name: "Clean Code", icon: CodeIcon, color: "text-rose-400", glow: "shadow-rose-500/20", delay: "3.5s" },
	{ id: "9", name: "CLI Tools", icon: TerminalIcon, color: "text-cyan-400", glow: "shadow-cyan-500/20", delay: "4s" },
	{
		id: "10",
		name: "Smart Import",
		icon: SparkleIcon,
		color: "text-yellow-400",
		glow: "shadow-yellow-500/20",
		delay: "4.5s",
	},
];

export function Support() {
	return (
		<section id="support" className="relative overflow-hidden border-border/40 border-b py-20 md:py-28">
			<style>{`
				@keyframes flyBlink {
					0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
					50% { transform: translateY(-16px) scale(1.1); opacity: 1; filter: drop-shadow(0 0 12px currentColor); }
				}
				@keyframes pulseGlow {
					0%, 100% { opacity: 0.2; transform: scale(1); }
					50% { opacity: 0.4; transform: scale(1.1); }
				}
				.animate-fly-blink {
					animation: flyBlink 5s ease-in-out infinite;
				}
				.animate-pulse-glow {
					animation: pulseGlow 4s ease-in-out infinite;
				}
			`}</style>

			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25"
			>
				<div className="size-[650px] animate-pulse-glow rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 blur-3xl" />
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

					<p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
						Email us directly at{" "}
						<a
							href="mailto:karthikdhanush686@gmail.com"
							className="break-all font-semibold text-primary underline underline-offset-4 hover:opacity-80"
						>
							karthikdhanush686@gmail.com
						</a>
					</p>
				</div>

				{/* 10 ANIMATED FLYING & BLINKING LOGOS SHOWCASE */}
				<div className="relative mt-16 flex items-center justify-center py-10">
					<div className="grid grid-cols-5 gap-6 sm:gap-10 md:gap-14">
						{flyingLogos.map((logo) => {
							const Icon = logo.icon;
							return (
								<div
									key={logo.id}
									style={{ animationDelay: logo.delay }}
									className="group flex animate-fly-blink flex-col items-center justify-center"
								>
									<div
										className={`relative flex size-14 items-center justify-center rounded-3xl border border-border/80 bg-background/80 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 group-hover:scale-125 group-hover:border-primary/50 sm:size-20 ${logo.glow}`}
									>
										<Icon
											className={`size-7 sm:size-10 ${logo.color} transition-transform duration-300 group-hover:scale-110`}
										/>
										<span className="absolute -top-1 -right-1 flex size-3 animate-ping rounded-full bg-primary" />
									</div>
									<span className="mt-2 font-semibold text-[11px] text-muted-foreground tracking-tight group-hover:text-foreground sm:text-xs">
										{logo.name}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* THREE FEATURE CARDS */}
				<div className="mt-16 grid gap-8 md:grid-cols-3">
					<div className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-background/60 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-2xl">
						<div>
							<div className="flex items-center justify-between">
								<div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-inner">
									<PhoneCallIcon weight="fill" className="size-7 animate-pulse" />
								</div>
								<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-bold text-[11px] text-emerald-500">
									<span className="size-2 animate-ping rounded-full bg-emerald-500" />
									24/7 Active
								</span>
							</div>

							<h3 className="mt-6 font-bold text-foreground text-xl tracking-tight">
								24/7 Full Calling & Live Support
							</h3>

							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								Direct help available round the clock. Get immediate assistance with template customization, PDF
								exports, and account management anytime.
							</p>
						</div>

						<div className="mt-8 overflow-hidden border-border/50 border-t pt-6">
							<a
								href="mailto:karthikdhanush686@gmail.com"
								title="karthikdhanush686@gmail.com"
								className="inline-flex max-w-full items-center gap-2 overflow-hidden font-semibold text-emerald-500 text-xs hover:underline sm:text-sm"
							>
								<EnvelopeSimpleIcon weight="bold" className="size-4 shrink-0" />
								<span className="truncate">karthikdhanush686@gmail.com</span>
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

							<h3 className="mt-6 font-bold text-foreground text-xl tracking-tight">Full Help to Build Resume</h3>

							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								Step-by-step guidance to craft job-winning resumes. Our smart tools and expert recommendations help
								tailor your experience for ATS filters.
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

							<h3 className="mt-6 font-bold text-foreground text-xl tracking-tight">Most Multi-Language Support</h3>

							<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
								Create resumes in over 50+ languages with full RTL support, localized date formats, and global
								typography for international career opportunities.
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
