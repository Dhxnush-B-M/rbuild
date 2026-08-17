import type { Icon } from "@phosphor-icons/react";
import {
	EnvelopeSimpleIcon,
	LinkedinLogoIcon,
	XLogoIcon,
} from "@phosphor-icons/react";
import { BrandIcon } from "@rbuilder/ui/components/brand-icon";
import { Button } from "@rbuilder/ui/components/button";
import { m } from "motion/react";
import { useState } from "react";

type FooterLinkItem = {
	url: string;
	label: string;
};

type SocialLink = {
	url: string;
	label: string;
	icon: Icon;
};

const socialLinks: SocialLink[] = [
	{
		url: "mailto:karthikdhanush686@gmail.com",
		label: "Gmail / Email Support",
		icon: EnvelopeSimpleIcon,
	},
	{ url: "https://linkedin.com", label: "LinkedIn", icon: LinkedinLogoIcon },
	{ url: "https://x.com", label: "X (Twitter)", icon: XLogoIcon },
];

export function Footer() {
	return (
		<m.footer
			id="footer"
			className="container mx-auto border-border/30 border-t p-4 pb-8 will-change-[opacity] md:p-8 md:pb-12"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			viewport={{ once: true }}
			transition={{ duration: 0.45 }}
		>
			<div className="grid grid-cols-1 gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-3">
				<div className="space-y-4">
					<BrandIcon variant="logo" className="h-9" />

					<div className="space-y-2">
						<h2 className="font-semibold text-lg tracking-tight">rbuilder</h2>
						<p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
							A modern resume builder designed to empower your career growth
							with intuitive tools, high impact designs, and privacy.
						</p>
					</div>

					<div className="flex items-center gap-2 pt-2">
						{socialLinks.map((social) => (
							<Button
								key={social.label}
								size="icon-sm"
								variant="ghost"
								nativeButton={false}
								render={
									<a
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${social.label} (opens in new tab)`}
									>
										<social.icon aria-hidden="true" size={18} />
									</a>
								}
							/>
						))}
					</div>
				</div>

				<FooterLinkGroup
					title="Resources"
					links={[
						{ url: "/dashboard/resumes", label: "Builder Application" },
						{ url: "#templates", label: "Resume Templates" },
					]}
				/>

				<FooterLinkGroup
					title="Support"
					links={[
						{
							url: "mailto:karthikdhanush686@gmail.com",
							label: "24/7 Email Support",
						},
						{ url: "#frequently-asked-questions", label: "FAQ" },
					]}
				/>
			</div>

			<div className="flex flex-col items-center justify-between gap-4 border-border/40 border-t pt-6 text-muted-foreground text-xs sm:flex-row">
				<p>© {new Date().getFullYear()} rbuilder. All rights reserved.</p>
				<p>By the community, for the community.</p>
			</div>
		</m.footer>
	);
}

function FooterLinkGroup({
	title,
	links,
}: {
	title: string;
	links: FooterLinkItem[];
}) {
	return (
		<div className="space-y-4">
			<h2 className="font-medium text-muted-foreground text-sm tracking-tight">
				{title}
			</h2>
			<ul className="space-y-3">
				{links.map((link) => (
					<FooterLink key={link.label} url={link.url} label={link.label} />
				))}
			</ul>
		</div>
	);
}

function FooterLink({ url, label }: FooterLinkItem) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<li className="relative">
			<a
				href={url}
				className="relative inline-block text-sm transition-colors hover:text-foreground"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{label}
				<m.div
					aria-hidden="true"
					initial={{ width: 0, opacity: 0 }}
					animate={
						isHovered ? { width: "100%", opacity: 1 } : { width: 0, opacity: 0 }
					}
					transition={{ duration: 0.2, ease: "easeOut" }}
					className="pointer-events-none absolute inset-s-0 -bottom-0.5 h-px rounded-md bg-primary will-change-[width,opacity]"
				/>
			</a>
		</li>
	);
}
