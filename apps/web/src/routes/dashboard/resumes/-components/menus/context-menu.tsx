import type { RouterOutput } from "@/libs/orpc/client";
import { Trans } from "@lingui/react/macro";
import { LockSimpleIcon, LockSimpleOpenIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@rbuilder/ui/components/context-menu";
import { useResumeMenuActions } from "./use-resume-menu-actions";

type Props = {
	resume: RouterOutput["resume"]["list"][number];
	children: React.ComponentProps<typeof ContextMenuTrigger>["render"];
};

export function ResumeContextMenu({ resume, children }: Props) {
	const { handleDelete, handleToggleLock } = useResumeMenuActions(resume);

	return (
		<ContextMenu>
			<ContextMenuTrigger render={children} />

			<ContextMenuContent>
				<ContextMenuItem onClick={handleToggleLock}>
					{resume.isLocked ? <LockSimpleOpenIcon /> : <LockSimpleIcon />}
					{resume.isLocked ? (
						<Trans comment="Resume card context menu action to remove edit lock">Unlock</Trans>
					) : (
						<Trans comment="Resume card context menu action to prevent edits">Lock</Trans>
					)}
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem variant="destructive" disabled={resume.isLocked} onClick={handleDelete}>
					<TrashSimpleIcon />
					<Trans comment="Resume card context menu destructive action to remove a resume">Delete</Trans>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
