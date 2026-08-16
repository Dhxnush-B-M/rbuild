import type { SupabaseResumeRecord } from "@/libs/supabase/db";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { DotsThreeVerticalIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { useMemo } from "react";
import { Button } from "@rbuilder/ui/components/button";
import { ResumeContextMenu } from "../menus/context-menu";
import { ResumeDropdownMenu } from "../menus/dropdown-menu";
import { BaseCard } from "./base-card";
import { ResumeThumbnail } from "./resume-thumbnail";

type ResumeCardProps = {
	resume: SupabaseResumeRecord;
};

type ResumeLockOverlayProps = {
	isLocked: boolean;
};

export function ResumeCard({ resume }: ResumeCardProps) {
	const { i18n } = useLingui();
	const isLocked = Boolean(resume.is_locked || resume.isLocked);

	const updatedAt = useMemo(() => {
		const rawDate = resume.updatedAt || resume.updated_at;
		const date = rawDate ? new Date(rawDate) : new Date();
		return Intl.DateTimeFormat(i18n.locale, { dateStyle: "long", timeStyle: "short" }).format(date);
	}, [i18n.locale, resume.updatedAt, resume.updated_at]);

	return (
		<ResumeContextMenu resume={resume}>
			<div className="group relative">
				<Link to="/builder/$resumeId" params={{ resumeId: resume.id }} className="block cursor-default">
					<m.div
						className="will-change-transform"
						whileHover={{ y: -2, scale: 1.005 }}
						whileTap={{ scale: 0.998 }}
						transition={{ type: "spring", stiffness: 320, damping: 28 }}
					>
						<BaseCard title={resume.name} description={t`Last updated on ${updatedAt}`} tags={resume.tags}>
							<ResumeThumbnail resume={resume} isLocked={isLocked} />

							<ResumeLockOverlay isLocked={isLocked} />
						</BaseCard>
					</m.div>
				</Link>

				{/* Quick Options / Delete Button on Card */}
				<div className="absolute top-3 right-3 z-30 opacity-90 transition-opacity duration-200 hover:opacity-100">
					<ResumeDropdownMenu resume={resume}>
						<Button
							size="icon-sm"
							variant="ghost"
							className="size-7 rounded-full border border-white/10 bg-background/80 text-foreground shadow-md backdrop-blur-md hover:bg-background"
							aria-label="Resume options"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<DotsThreeVerticalIcon className="size-4" weight="bold" />
						</Button>
					</ResumeDropdownMenu>
				</div>
			</div>
		</ResumeContextMenu>
	);
}

function ResumeLockOverlay({ isLocked }: ResumeLockOverlayProps) {
	return (
		<AnimatePresence>
			{isLocked && (
				<m.div
					key="resume-lock-overlay"
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.6 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					className="absolute inset-0 flex items-center justify-center will-change-[opacity]"
				>
					<div className="flex items-center justify-center rounded-full bg-popover p-6">
						<LockSimpleIcon weight="thin" className="size-12 opacity-60" />
					</div>
				</m.div>
			)}
		</AnimatePresence>
	);
}
