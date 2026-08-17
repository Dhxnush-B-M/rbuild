import {
	ArrowRightIcon,
	FileTextIcon,
	GlobeIcon,
	IdentificationCardIcon,
	PaletteIcon,
	TranslateIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { Button } from "@rbuilder/ui/components/button";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { CometCard } from "@/components/animation/comet-card";
import { Spotlight } from "@/components/animation/spotlight";

const welcomeLanguages = [
	{ lang: "Kannada", text: "ಸುಸ್ವಾಗತ", phonetics: "Suswagatha", flag: "🇮🇳" },
	{ lang: "English", text: "Welcome", phonetics: "Hello", flag: "🌐" },
	{ lang: "Tamil", text: "வணக்கம்", phonetics: "Vanakkam", flag: "🇮🇳" },
	{ lang: "Telugu", text: "స్వాగతం", phonetics: "Swagatham", flag: "🇮🇳" },
	{ lang: "Hindi", text: "नमस्ते • स्वागत", phonetics: "Namaste", flag: "🇮🇳" },
	{ lang: "Malayalam", text: "സ്വാഗതം", phonetics: "Swagatham", flag: "🇮🇳" },
];

export function Hero() {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % welcomeLanguages.length);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	const currentWelcome = welcomeLanguages[currentIndex] ??
		welcomeLanguages[0] ?? {
			lang: "Kannada",
			text: "ಸುಸ್ವಾಗತ",
			phonetics: "Suswagatha",
			flag: "🇮🇳",
		};

	return (
		<section
			id="hero"
			className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden border-b py-20 md:py-28"
		>
			<Spotlight />

			<div className="relative z-10 flex max-w-4xl flex-col items-center gap-y-6 px-4 text-center">
				{/* Headline */}
				<m.div
					className="space-y-3 will-change-[transform,opacity]"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.35 }}
				>
					<h1 className="bg-gradient-to-r from-foreground via-primary to-indigo-500 bg-clip-text font-extrabold text-4xl text-transparent leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Build Job-Winning Resumes in Minutes
					</h1>
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide md:text-sm">
						Free • Multilingual • ATS-Friendly • Privacy-Focused
					</p>
				</m.div>

				{/* Description */}
				<m.p
					className="max-w-2xl text-base text-muted-foreground leading-relaxed will-change-[transform,opacity] md:text-xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.5 }}
				>
					rbuilder gives you complete control over your resume with real-time
					live previews, high-precision exports, and support for all languages.
				</m.p>

				{/* CTA Button */}
				<m.div
					className="flex flex-col items-center gap-4 pt-2 will-change-[transform,opacity] sm:flex-row sm:gap-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.65 }}
				>
					<Button
						size="lg"
						nativeButton={false}
						className="group relative overflow-hidden px-8 py-6 font-bold text-base shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40"
						render={
							<Link to="/dashboard/resumes">
								<span className="relative z-10 flex items-center gap-2.5">
									<span>Create My Resume</span>
									<ArrowRightIcon
										aria-hidden="true"
										className="size-5 transition-transform group-hover:translate-x-1"
									/>
								</span>
							</Link>
						}
					/>
				</m.div>
			</div>

			{/* Interactive Builder Showcase Mockup Card */}
			<m.div
				className="mt-12 w-full will-change-[transform,opacity]"
				initial={{ opacity: 0, y: 60 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
			>
				<CometCard
					glareOpacity={0.1}
					className="relative mx-auto 3xl:max-w-7xl max-w-5xl px-4 md:px-12 lg:px-0"
				>
					<div className="relative overflow-hidden rounded-2xl border border-white/15 bg-card/60 p-2 shadow-2xl backdrop-blur-xl">
						{/* Mock Builder Workspace */}
						<div className="grid min-h-[440px] grid-cols-12 gap-2 p-3 sm:min-h-[500px]">
							{/* Left Sidebar Mockup */}
							<div className="hidden flex-col gap-2 rounded-xl border border-white/10 bg-background/50 p-3 md:col-span-4 md:flex">
								<div className="flex items-center justify-between rounded-lg bg-primary/10 p-2 font-semibold text-primary text-xs">
									<div className="flex items-center gap-2">
										<TranslateIcon className="size-4" />
										<span>All Languages Supported</span>
									</div>
									<GlobeIcon className="size-3.5 opacity-75" />
								</div>

								{/* Language Tags List in Sidebar */}
								<div className="space-y-1.5 rounded-lg border border-white/5 bg-card/40 p-2.5 text-xs">
									<p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
										Languages Active
									</p>
									<div className="flex flex-wrap gap-1 pt-1">
										{welcomeLanguages.slice(0, 8).map((l, i) => (
											<span
												key={l.lang}
												className={`rounded-md px-2 py-0.5 font-medium text-[11px] transition-all ${
													i === currentIndex
														? "bg-primary text-primary-foreground shadow-sm"
														: "bg-background/60 text-muted-foreground hover:text-foreground"
												}`}
											>
												{l.lang}
											</span>
										))}
									</div>
								</div>

								<div className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground text-xs hover:bg-white/5">
									<UserIcon className="size-4" />
									<span>Basics & Contact</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground text-xs hover:bg-white/5">
									<FileTextIcon className="size-4" />
									<span>Experience & Projects</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground text-xs hover:bg-white/5">
									<IdentificationCardIcon className="size-4" />
									<span>Skills & Education</span>
								</div>
								<div className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground text-xs hover:bg-white/5">
									<PaletteIcon className="size-4" />
									<span>Styling & Typography</span>
								</div>
							</div>

							{/* Center Live Resume Document Mockup */}
							<div className="col-span-12 flex items-center justify-center rounded-xl border border-white/10 bg-background/40 p-4 md:col-span-8">
								<div className="aspect-[1/1.414] w-full max-w-[400px] rounded-lg border border-white/15 bg-card/95 p-6 shadow-2xl backdrop-blur-md transition-all hover:scale-[1.01]">
									{/* Top Header with Live Multilingual Welcome */}
									<div className="border-primary/40 border-b-2 pb-4">
										<div className="flex items-center justify-between">
											<div className="h-6">
												<AnimatePresence mode="wait">
													<m.div
														key={currentWelcome.lang}
														initial={{ opacity: 0, y: 6 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -6 }}
														transition={{ duration: 0.3 }}
														className="flex items-center gap-2"
													>
														<span className="font-bold text-foreground text-lg sm:text-xl">
															{currentWelcome.text}
														</span>
														<span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-[10px] text-primary">
															{currentWelcome.lang}
														</span>
													</m.div>
												</AnimatePresence>
											</div>
											<span className="text-sm">{currentWelcome.flag}</span>
										</div>

										<p className="mt-1 font-medium text-muted-foreground text-xs">
											Software Engineer • Multi-Language Resume
										</p>

										<div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground/80">
											<span>📧 user@example.com</span>
											<span>🌐 portfolio.dev</span>
											<span>📍 Bengaluru, India</span>
										</div>
									</div>

									{/* Multi-Language Greetings Grid */}
									<div className="mt-4 space-y-2">
										<div className="flex items-center justify-between">
											<h4 className="font-bold text-primary text-xs uppercase tracking-wider">
												Welcome In All Languages
											</h4>
											<span className="font-mono text-[10px] text-muted-foreground">
												Universal UTF-8
											</span>
										</div>

										<div className="grid grid-cols-2 gap-2">
											<div className="rounded-lg border border-white/10 bg-background/50 p-2 transition-colors hover:border-primary/40">
												<p className="font-bold text-foreground text-xs">
													ಕನ್ನಡ (Kannada)
												</p>
												<p className="font-medium text-primary text-xs">
													ಸುಸ್ವಾಗತ
												</p>
											</div>

											<div className="rounded-lg border border-white/10 bg-background/50 p-2 transition-colors hover:border-primary/40">
												<p className="font-bold text-foreground text-xs">
													English
												</p>
												<p className="font-medium text-primary text-xs">
													Welcome
												</p>
											</div>

											<div className="rounded-lg border border-white/10 bg-background/50 p-2 transition-colors hover:border-primary/40">
												<p className="font-bold text-foreground text-xs">
													தமிழ் (Tamil)
												</p>
												<p className="font-medium text-primary text-xs">
													வணக்கம்
												</p>
											</div>

											<div className="rounded-lg border border-white/10 bg-background/50 p-2 transition-colors hover:border-primary/40">
												<p className="font-bold text-foreground text-xs">
													తెలుగు (Telugu)
												</p>
												<p className="font-medium text-primary text-xs">
													స్వాగతం
												</p>
											</div>

											<div className="rounded-lg border border-white/10 bg-background/50 p-2 transition-colors hover:border-primary/40">
												<p className="font-bold text-foreground text-xs">
													हिन्दी (Hindi)
												</p>
												<p className="font-medium text-primary text-xs">
													नमस्ते • स्वागत
												</p>
											</div>

											<div className="rounded-lg border border-white/10 bg-background/50 p-2 transition-colors hover:border-primary/40">
												<p className="font-bold text-foreground text-xs">
													മലയാളം (Malayalam)
												</p>
												<p className="font-medium text-primary text-xs">
													സ്വാഗതം
												</p>
											</div>
										</div>
									</div>

									{/* Skills / Global Badges */}
									<div className="mt-4 space-y-1.5">
										<h4 className="font-bold text-primary text-xs uppercase tracking-wider">
											Global & Regional Fonts
										</h4>
										<div className="flex flex-wrap gap-1.5">
											<span className="rounded-md border border-white/10 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground">
												ಕನ್ನಡ (KN)
											</span>
											<span className="rounded-md border border-white/10 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground">
												English (EN)
											</span>
											<span className="rounded-md border border-white/10 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground">
												தமிழ் (TA)
											</span>
											<span className="rounded-md border border-white/10 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground">
												తెలుగు (TE)
											</span>
											<span className="rounded-md border border-white/10 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground">
												हिन्दी (HI)
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CometCard>
			</m.div>
		</section>
	);
}
