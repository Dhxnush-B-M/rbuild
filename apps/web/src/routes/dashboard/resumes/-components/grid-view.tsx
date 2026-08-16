import type { RouterOutput } from "@/libs/orpc/client";
import { Trans } from "@lingui/react/macro";
import { AnimatePresence, m } from "motion/react";
import { CreateResumeCard } from "./cards/create-card";
import { ResumeCard } from "./cards/resume-card";

type Resume = RouterOutput["resume"]["list"][number];

type Props = {
	resumes: Resume[];
	hasResumes: boolean;
};

export function GridView({ resumes, hasResumes }: Props) {
	if (resumes.length === 0 && hasResumes) {
		return (
			<p className="py-8 text-center text-muted-foreground text-sm">
				<Trans>No resumes match your search.</Trans>
			</p>
		);
	}

	return (
		<div className="grid 3xl:grid-cols-6 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
			{/* Always display Create Resume Card as the first item */}
			<m.div
				initial={{ y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ y: -20 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				className="will-change-[transform,opacity]"
			>
				<CreateResumeCard />
			</m.div>

			{/* Render created resume cards */}
			<AnimatePresence initial={false} mode="popLayout">
				{resumes.map((resume, index) => (
					<m.div
						layout
						key={resume.id}
						initial={{ y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{
							opacity: 0,
							y: -20,
							filter: "blur(8px)",
						}}
						transition={{ duration: 0.2, delay: Math.min(0.12, (index + 1) * 0.02), ease: "easeOut" }}
						className="will-change-[transform,opacity]"
					>
						<ResumeCard resume={resume} />
					</m.div>
				))}
			</AnimatePresence>
		</div>
	);
}
