import type { Icon } from "@phosphor-icons/react";
import type { BuilderPreviewPageLayout } from "./page-layout";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from "@phosphor-icons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { m } from "motion/react";
import { useControls, useTransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@reactive-resume/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@reactive-resume/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@reactive-resume/ui/components/tooltip";
import { cn } from "@reactive-resume/utils/style";
import { isEditableElementFocused, useResumeStore } from "@/features/resume/builder/draft";

type BuilderDockProps = {
	pageLayout?: BuilderPreviewPageLayout;
	onTogglePageLayout?: () => void;
};

export function BuilderDock(_props: BuilderDockProps) {
	const { zoomIn, zoomOut, resetTransform } = useControls();

	const undo = useResumeStore((state) => state.undo);
	const redo = useResumeStore((state) => state.redo);

	useHotkey("Mod+0", () => resetTransform());
	// App-level undo/redo of resume state via keyboard shortcuts
	useHotkey("Mod+Z", () => {
		if (isEditableElementFocused()) return;
		undo();
	});
	useHotkey("Mod+Shift+Z", () => {
		if (isEditableElementFocused()) return;
		redo();
	});
	useHotkey("Control+Y", () => {
		if (isEditableElementFocused()) return;
		redo();
	});

	return (
		<div className="fixed inset-x-0 bottom-20 flex items-center justify-center md:bottom-4">
			<m.div
				initial={{ opacity: 0, y: -18 }}
				animate={{ opacity: 0.6, y: 0 }}
				whileHover={{ opacity: 1, y: -2, scale: 1.01 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				className="flex items-center rounded-full border border-white/15 bg-background/65 px-3 py-1 shadow-2xl backdrop-blur-2xl will-change-[transform,opacity]"
			>
				<DockIcon icon={MagnifyingGlassMinusIcon} title={t`Zoom out`} onClick={() => zoomOut(0.15)} />
				<ZoomMenu />
				<DockIcon icon={MagnifyingGlassPlusIcon} title={t`Zoom in`} onClick={() => zoomIn(0.15)} />
			</m.div>
		</div>
	);
}

function ZoomMenu() {
	const scale = useTransformComponent((ctx) => ctx.state.scale);
	const { centerView, resetTransform } = useControls();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						size="sm"
						variant="ghost"
						aria-label={t`Zoom level`}
						className="h-8 min-w-14 px-2 font-medium text-xs tabular-nums"
					>
						{Math.round(scale * 100)}%
					</Button>
				}
			/>

			<DropdownMenuContent side="top" align="center">
				<DropdownMenuItem onClick={() => centerView(1)}>
					<Trans>Actual size (100%)</Trans>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => resetTransform()}>
					<Trans>Fit to view</Trans>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

type DockIconProps = {
	title: string;
	icon: Icon;
	disabled?: boolean;
	onClick: () => void;
	iconClassName?: string;
	active?: boolean;
};

function DockIcon({ icon: Icon, title, disabled, onClick, iconClassName, active }: DockIconProps) {
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<m.div
						className="will-change-transform"
						whileHover={disabled ? undefined : { y: -1, scale: 1.04 }}
						whileTap={disabled ? undefined : { scale: 0.97 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
					>
						<Button
							size="icon"
							variant="ghost"
							disabled={disabled}
							className={cn(active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary")}
							onClick={onClick}
							aria-label={title}
						>
							<Icon className={cn("size-4", iconClassName)} />
						</Button>
					</m.div>
				}
			/>

			<TooltipContent side="top" align="center" className="font-medium">
				{title}
			</TooltipContent>
		</Tooltip>
	);
}
