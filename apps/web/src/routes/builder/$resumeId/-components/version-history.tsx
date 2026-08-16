import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@reactive-resume/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@reactive-resume/ui/components/dropdown-menu";

type BuilderVersionHistoryProps = {
	resumeId: string;
};

export function BuilderVersionHistory(_props: BuilderVersionHistoryProps) {
	const [open, setOpen] = useState(false);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger
				render={
					<Button size="icon" variant="ghost" aria-label={t`Version history`}>
						<ClockCounterClockwiseIcon />
					</Button>
				}
			/>

			<DropdownMenuContent align="start" className="w-64">
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						<Trans>Version history</Trans>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<div className="px-2 py-3 text-muted-foreground text-xs">
						<Trans>All changes are auto-saved to Supabase in real time.</Trans>
					</div>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
