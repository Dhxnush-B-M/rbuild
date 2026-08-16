import { t } from "@lingui/core/macro";
import { GlobeIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@reactive-resume/ui/components/button";
import { Separator } from "@reactive-resume/ui/components/separator";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/portfolio/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-6">
			<DashboardHeader icon={GlobeIcon} title={t`Portfolio`} />

			<Separator />

			<div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-white/15 border-dashed bg-card/30 p-8 text-center backdrop-blur-xl">
				<div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-secondary/50 shadow-inner">
					<LockSimpleIcon size={32} className="text-muted-foreground" />
				</div>

				<h3 className="mt-4 font-bold text-foreground text-xl tracking-tight sm:text-2xl">
					Portfolio Builder is Locked
				</h3>

				<p className="mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
					This feature is currently locked. Build and download your resumes directly using the resume editor.
				</p>

				<div className="mt-6">
					<Button nativeButton={false} render={<Link to="/dashboard/resumes" />}>
						<span>Back to Resumes</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
