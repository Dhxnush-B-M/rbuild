import { Trans } from "@lingui/react/macro";
import { CircleNotchIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { BrandIcon } from "@reactive-resume/ui/components/brand-icon";
import { Button } from "@reactive-resume/ui/components/button";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useResumeExport } from "@/features/resume/export/use-resume-export";
import { getResumeBySlugFromSupabase } from "@/libs/supabase/db";
import { PdfViewer } from "./pdf-viewer";

const publicResumeRoute = getRouteApi("/$username/$slug");

export function PublicResumeRoute() {
	const { username, slug } = publicResumeRoute.useParams();

	const { data: resume, isLoading } = useQuery({
		queryKey: ["public-resume", username, slug],
		queryFn: () => getResumeBySlugFromSupabase(slug, username),
	});

	const { onDownloadPDF, isExporting } = useResumeExport(resume as unknown as Parameters<typeof useResumeExport>[0]);

	if (isLoading || !resume) return <LoadingScreen />;

	const { basics, picture } = resume.data;

	return (
		<div className="mx-auto flex w-full flex-col items-center gap-6 px-4 py-6 print:m-0 print:block print:max-w-full print:p-0">
			<header className="flex w-full max-w-5xl flex-col items-center gap-4 text-center print:hidden">
				{picture?.url && !picture?.hidden && (
					<img
						src={picture.url}
						alt={basics?.name || "Avatar"}
						className="size-20 rounded-full object-cover shadow-sm"
					/>
				)}
				<div className="space-y-1">
					{basics?.name && <h1 className="font-semibold text-2xl tracking-tight">{basics.name}</h1>}
					{basics?.headline && <p className="text-muted-foreground">{basics.headline}</p>}
				</div>
				<Button onClick={() => void onDownloadPDF()} disabled={isExporting}>
					{isExporting ? (
						<CircleNotchIcon className="size-4 animate-spin" />
					) : (
						<DownloadSimpleIcon className="size-4" />
					)}
					<Trans>Download PDF</Trans>
				</Button>
			</header>

			<main className="w-full max-w-5xl bg-white print:max-w-full">
				<PdfViewer data={resume.data} className="block w-full" />
			</main>

			<footer className="flex justify-center print:hidden">
				<a
					href="/"
					className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
				>
					<BrandIcon variant="icon" className="size-5" />
					<Trans>Build your own resume</Trans>
				</a>
			</footer>
		</div>
	);
}
