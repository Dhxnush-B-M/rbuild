import type { ResumeData } from "@reactive-resume/schema/resume/data";
import type { RouterOutput } from "@/libs/orpc/client";
import { FileTextIcon, SparkleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import { cn } from "@reactive-resume/utils/style";
import { createResumePdfBlob } from "@/features/resume/export/pdf-document";
import { createPdfFirstPageImageUrl } from "@/features/resume/preview/pdf-thumbnail";
import { getResumeThumbnailCacheKey } from "@/features/resume/preview/resume-thumbnail.shared";

type ResumeListItem = RouterOutput["resume"]["list"][number] & {
	data?: ResumeData;
};

type ThumbnailState = { status: "error" | "idle" | "loading" } | { status: "ready"; url: string };

type ResumeThumbnailProps = {
	isLocked: boolean;
	resume: ResumeListItem;
};

const throwIfAborted = (signal: AbortSignal) => {
	if (signal.aborted) throw new DOMException("Thumbnail generation aborted.", "AbortError");
};

const createResumeThumbnailUrl = async (data: ResumeData, signal: AbortSignal) => {
	const pdf = await createResumePdfBlob(data);
	throwIfAborted(signal);

	const url = await createPdfFirstPageImageUrl(pdf);

	if (signal.aborted) {
		URL.revokeObjectURL(url);
		throwIfAborted(signal);
	}

	return url;
};

function useResumeThumbnail(data: ResumeData | undefined, cacheKey: string | undefined): ThumbnailState {
	const {
		data: thumbnailData,
		error: thumbnailError,
		isError: thumbnailIsError,
	} = useQuery({
		queryKey: ["resume-thumbnail", cacheKey],
		queryFn: ({ signal }) => {
			if (!data) throw new Error("Resume data is required to generate a thumbnail.");
			return createResumeThumbnailUrl(data, signal);
		},
		enabled: Boolean(data && cacheKey),
		gcTime: 0,
		retry: false,
	});

	useEffect(() => {
		if (thumbnailError) console.error("Failed to generate resume thumbnail", thumbnailError);
	}, [thumbnailError]);

	useEffect(() => {
		const url = thumbnailData;

		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	}, [thumbnailData]);

	if (!data || !cacheKey) return { status: "idle" };
	if (thumbnailIsError) return { status: "error" };
	if (thumbnailData) return { status: "ready", url: thumbnailData };

	return { status: "loading" };
}

export function ResumeThumbnail({ isLocked, resume }: ResumeThumbnailProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(containerRef, { amount: 0.1, margin: "240px", once: true });
	const activeData = (resume.data || defaultResumeData) as ResumeData;

	const thumbnail = useResumeThumbnail(
		activeData,
		isInView
			? getResumeThumbnailCacheKey(resume.id, new Date(resume.updatedAt || resume.updated_at || Date.now()))
			: undefined,
	);

	return (
		<div
			ref={containerRef}
			className={cn("relative size-full overflow-hidden bg-background/60 transition-all", isLocked && "blur-xs")}
		>
			{thumbnail.status === "ready" ? (
				<div
					aria-hidden
					className="absolute inset-0 bg-center bg-contain bg-white bg-no-repeat transition-opacity duration-500"
					style={{ backgroundImage: `url(${thumbnail.url})` }}
				/>
			) : (
				/* Beautiful Resume Document Mini Preview Cover Layout */
				<div className="relative flex size-full flex-col justify-between rounded-lg border border-white/10 bg-card/80 p-4 shadow-inner backdrop-blur-md transition-all duration-300 group-hover:border-primary/40">
					{/* Document Mini Header */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-primary">
								<FileTextIcon weight="bold" className="size-4" />
							</div>
							<div className="flex-1 space-y-1">
								<div className="h-2 w-3/4 rounded-full bg-foreground/30" />
								<div className="h-1.5 w-1/2 rounded-full bg-primary/40" />
							</div>
						</div>
						<div className="h-px w-full bg-border/60" />
					</div>

					{/* Document Content Skeleton Lines */}
					<div className="space-y-2 py-1">
						<div className="space-y-1">
							<div className="h-1.5 w-2/5 rounded-full bg-primary/50 font-semibold text-[9px]" />
							<div className="h-1 w-full rounded-full bg-muted-foreground/20" />
							<div className="h-1 w-5/6 rounded-full bg-muted-foreground/20" />
						</div>
						<div className="space-y-1 pt-1">
							<div className="h-1.5 w-1/3 rounded-full bg-indigo-500/50" />
							<div className="h-1 w-full rounded-full bg-muted-foreground/20" />
							<div className="h-1 w-4/5 rounded-full bg-muted-foreground/20" />
						</div>
					</div>

					{/* Bottom Badge */}
					<div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
						<span className="font-mono text-[9px] text-primary/80 uppercase tracking-wider">Live Document</span>
						<SparkleIcon className="size-3 animate-pulse text-primary" />
					</div>
				</div>
			)}
		</div>
	);
}
