import { m } from "motion/react";

const leftResumeCards = [
	{ src: "/templates/jpg/onyx.jpg", alt: "Onyx Resume Template", rotate: -12, top: "8%", left: "-60px", delay: 0 },
	{ src: "/templates/jpg/azurill.jpg", alt: "Azurill Resume Template", rotate: 8, top: "28%", left: "-80px", delay: 2 },
	{ src: "/templates/jpg/glalie.jpg", alt: "Glalie Resume Template", rotate: -10, top: "52%", left: "-50px", delay: 4 },
	{ src: "/templates/jpg/kakuna.jpg", alt: "Kakuna Resume Template", rotate: 6, top: "74%", left: "-70px", delay: 1 },
];

const rightResumeCards = [
	{
		src: "/templates/jpg/pikachu.jpg",
		alt: "Pikachu Resume Template",
		rotate: 12,
		top: "12%",
		right: "-60px",
		delay: 1.5,
	},
	{
		src: "/templates/jpg/chikorita.jpg",
		alt: "Chikorita Resume Template",
		rotate: -8,
		top: "34%",
		right: "-80px",
		delay: 3.5,
	},
	{
		src: "/templates/jpg/lapras.jpg",
		alt: "Lapras Resume Template",
		rotate: 10,
		top: "58%",
		right: "-50px",
		delay: 2.5,
	},
	{
		src: "/templates/jpg/ditgar.jpg",
		alt: "Ditgar Resume Template",
		rotate: -6,
		top: "78%",
		right: "-70px",
		delay: 0.5,
	},
];

export function ResumeBackground() {
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden">
			{/* Top-to-bottom Aurora Light Beams & Glows */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.18),rgba(255,255,255,0))]" />
			<div className="absolute top-[30%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/10 via-indigo-500/10 to-transparent blur-[140px]" />
			<div className="absolute top-[65%] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent blur-[130px]" />
			<div className="absolute bottom-0 left-1/2 h-[400px] w-full -translate-x-1/2 bg-gradient-to-t from-background via-transparent to-transparent" />

			{/* Subtle Cyber Grid Matrix */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

			{/* Left Side Floating Resume Cards (Up to Down) */}
			<div className="hidden lg:block">
				{leftResumeCards.map((card) => (
					<m.div
						key={card.src}
						className="absolute w-44 xl:w-56"
						style={{
							top: card.top,
							left: card.left,
						}}
						initial={{ opacity: 0, x: -50, rotate: card.rotate }}
						whileInView={{ opacity: 0.35, x: 0, rotate: card.rotate }}
						viewport={{ once: true }}
						animate={{
							y: [0, -16, 0],
						}}
						transition={{
							y: {
								duration: 6,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: card.delay,
							},
							opacity: { duration: 1 },
						}}
					>
						<div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-card/60 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all">
							<div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary/30 to-indigo-500/0 opacity-60 blur-sm" />
							<img
								src={card.src}
								alt={card.alt}
								className="relative aspect-[1/1.414] w-full rounded-xl object-cover object-top opacity-90 shadow-inner"
								loading="lazy"
							/>
						</div>
					</m.div>
				))}
			</div>

			{/* Right Side Floating Resume Cards (Up to Down) */}
			<div className="hidden lg:block">
				{rightResumeCards.map((card) => (
					<m.div
						key={card.src}
						className="absolute w-44 xl:w-56"
						style={{
							top: card.top,
							right: card.right,
						}}
						initial={{ opacity: 0, x: 50, rotate: card.rotate }}
						whileInView={{ opacity: 0.35, x: 0, rotate: card.rotate }}
						viewport={{ once: true }}
						animate={{
							y: [0, -16, 0],
						}}
						transition={{
							y: {
								duration: 6.5,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: card.delay,
							},
							opacity: { duration: 1 },
						}}
					>
						<div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-card/60 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all">
							<div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-bl from-blue-500/30 to-purple-500/0 opacity-60 blur-sm" />
							<img
								src={card.src}
								alt={card.alt}
								className="relative aspect-[1/1.414] w-full rounded-xl object-cover object-top opacity-90 shadow-inner"
								loading="lazy"
							/>
						</div>
					</m.div>
				))}
			</div>
		</div>
	);
}
