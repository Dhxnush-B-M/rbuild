import type { Icon } from "@phosphor-icons/react";
import {
	CheckCircleIcon,
	FileArrowUpIcon,
	FilePdfIcon,
	LightningIcon,
	PaletteIcon,
	ShieldCheckIcon,
} from "@phosphor-icons/react";
import { m } from "motion/react";
import { BrandIcon } from "@rbuilder/ui/components/brand-icon";
import { cn } from "@rbuilder/utils/style";

type Feature = {
	id: string;
	icon: Icon;
	title: string;
	description: string;
};

const features: Feature[] = [
	{
		id: "live-preview",
		icon: LightningIcon,
		title: "Real-Time Live Preview",
		description: "Instant side-by-side editing with high-precision PDF rendering as you type.",
	},
	{
		id: "data-privacy",
		icon: ShieldCheckIcon,
		title: "100% Privacy & Security",
		description: "Your career data remains private and secure. Zero tracking, zero third-party data selling.",
	},
	{
		id: "ats-optimized",
		icon: CheckCircleIcon,
		title: "ATS Parser Optimized",
		description: "Engineered layouts and clean typography designed to achieve maximum match scores on ATS scanners.",
	},
	{
		id: "export-options",
		icon: FilePdfIcon,
		title: "Instant PDF & Shareable Links",
		description: "Download pixel-perfect PDFs anytime or generate password-protected public web links.",
	},
	{
		id: "customization",
		icon: PaletteIcon,
		title: "Unlimited Customization",
		description: "Customize colors, typography, section order, and spacing to match your personal brand.",
	},
	{
		id: "smart-import",
		icon: FileArrowUpIcon,
		title: "Smart Import & Multi-Resume",
		description: "Import existing data and manage unlimited tailored resume versions.",
	},
];

function FeatureCard({ icon: Icon, title, description }: Feature) {
	return (
		<m.div
			className={cn(
				"group relative flex min-h-48 flex-col gap-4 overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg",
			)}
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.1 }}
			transition={{ duration: 0.35, ease: "easeOut" }}
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			/>

			<div aria-hidden="true" className="relative">
				<div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
					<Icon size={24} weight="duotone" />
				</div>
			</div>

			<div className="relative flex flex-col gap-y-1.5">
				<h3 className="font-bold text-lg tracking-tight transition-colors group-hover:text-primary">{title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</div>
		</m.div>
	);
}

export function Features() {
	return (
		<section id="features" className="container mx-auto border-border/40 border-b px-4 py-16 md:py-24">
			<m.div
				className="mb-12 flex flex-col items-center space-y-4 text-center will-change-[transform,opacity]"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.45 }}
			>
				<div className="flex items-center gap-3">
					<BrandIcon variant="logo" />
				</div>

				<h2 className="bg-gradient-to-r from-foreground via-primary to-indigo-500 bg-clip-text font-extrabold text-3xl text-transparent tracking-tight md:text-5xl">
					Powerful Resume Building Features
				</h2>

				<p className="max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
					Everything you need to create, customize, and share job-winning resumes effortlessly.
				</p>
			</m.div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{features.map((feature) => (
					<FeatureCard key={feature.id} {...feature} />
				))}
			</div>
		</section>
	);
}
