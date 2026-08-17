import { t } from "@lingui/core/macro";
import { ReadCvLogoIcon } from "@phosphor-icons/react";
import { Separator } from "@rbuilder/ui/components/separator";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getResumesFromSupabase } from "@/libs/supabase/db";
import { DashboardHeader } from "../-components/header";
import { GridView } from "./-components/grid-view";

export const Route = createFileRoute("/dashboard/resumes/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: resumes = [] } = useQuery({
		queryKey: ["resumes"],
		queryFn: () => getResumesFromSupabase(),
	});

	return (
		<div className="space-y-4">
			<DashboardHeader icon={ReadCvLogoIcon} title={t`Resumes`} />

			<Separator />

			<GridView
				resumes={
					resumes as unknown as Parameters<typeof GridView>[0]["resumes"]
				}
				hasResumes={resumes.length > 0}
			/>
		</div>
	);
}
