import type { Icon } from "@phosphor-icons/react";
import { ArrowUpRightIcon, FileTextIcon, UsersIcon } from "@phosphor-icons/react";
import { m } from "motion/react";
import { useEffect, useState } from "react";

type Statistic = {
	id: string;
	label: string;
	subLabel: string;
	value: number;
	icon: Icon;
	gradient: string;
	glowColor: string;
};

type StatisticCardProps = {
	statistic: Statistic;
	index: number;
};

function StatisticCard({ statistic, index }: StatisticCardProps) {
	const Icon = statistic.icon;

	return (
		<m.div
			className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-primary/20 sm:p-10"
			initial={{ opacity: 0, y: 25 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
		>
			{/* Ambient Glowing Background Orb */}
			<div
				aria-hidden="true"
				className={`pointer-events-none absolute -top-16 -right-16 size-48 rounded-full ${statistic.glowColor} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
			/>

			<div className="relative z-10 flex flex-col justify-between gap-y-6">
				{/* Icon */}
				<div className="flex items-center justify-between">
					<div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 shadow-inner transition-transform duration-300 group-hover:scale-110">
						<Icon size={28} weight="duotone" className="text-primary" />
					</div>
				</div>

				{/* Stat Value with Vibrant Gradient */}
				<div className="space-y-1">
					<div className="flex items-baseline gap-x-2">
						<span className="bg-gradient-to-r from-foreground via-white to-primary bg-clip-text font-black text-6xl text-transparent tracking-tight md:text-7xl">
							{statistic.value.toLocaleString()}
						</span>
						<ArrowUpRightIcon
							size={24}
							className="text-primary/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						/>
					</div>
					<h3 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">{statistic.label}</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">{statistic.subLabel}</p>
				</div>
			</div>
		</m.div>
	);
}

import { getLiveAppStats } from "@/libs/supabase/db";

export function Statistics() {
	const [userCount, setUserCount] = useState(0);
	const [resumeCount, setResumeCount] = useState(0);

	useEffect(() => {
		void getLiveAppStats().then((stats) => {
			setUserCount(stats.userCount);
			setResumeCount(stats.resumeCount);
		});
	}, []);

	const statisticsList: Statistic[] = [
		{
			id: "users",
			label: "Active Users",
			subLabel: "Trusted by professionals crafting winning applications daily.",
			value: userCount,
			icon: UsersIcon,
			gradient: "from-sky-400 via-blue-500 to-indigo-600",
			glowColor: "bg-sky-500",
		},
		{
			id: "resumes",
			label: "Resumes Created",
			subLabel: "Tailored ATS-optimized resumes generated and exported worldwide.",
			value: resumeCount,
			icon: FileTextIcon,
			gradient: "from-primary via-indigo-400 to-purple-500",
			glowColor: "bg-primary",
		},
	];

	return (
		<section id="statistics" aria-labelledby="stats-heading" className="py-12 md:py-16">
			<h2 id="stats-heading" className="sr-only">
				Application Statistics
			</h2>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
				{statisticsList.map((statistic, index) => (
					<StatisticCard key={statistic.id} statistic={statistic} index={index} />
				))}
			</div>
		</section>
	);
}
