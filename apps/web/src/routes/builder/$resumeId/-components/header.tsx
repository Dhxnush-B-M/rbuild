import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	CaretDownIcon,
	CheckCircleIcon,
	CircleNotchIcon,
	DownloadSimpleIcon,
	LockSimpleIcon,
	LockSimpleOpenIcon,
	PaletteIcon,
	SidebarSimpleIcon,
	TrashSimpleIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { Button } from "@rbuilder/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@rbuilder/ui/components/dropdown-menu";
import {
	useCurrentBuilderResumeSelector,
	useCurrentResume,
	usePatchResume,
	useResumeStore,
} from "@/features/resume/builder/draft";
import { ResumeDownloadDialog } from "@/features/resume/export/download-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteResumeFromSupabase } from "@/libs/supabase/db";
import { useBuilderSidebar } from "../-store/sidebar";

export function BuilderHeader() {
	// Subscribe to only the metadata fields this header renders. Selecting the whole resume re-renders
	// the header on every keystroke (immer replaces the resume reference on each content edit).
	const name = useCurrentBuilderResumeSelector((resume) => resume.name);
	const isLocked = useCurrentBuilderResumeSelector((resume) => resume.isLocked);
	const { toggleSidebar } = useBuilderSidebar();

	// Equal-width flex-1 side groups keep the center title group truly centered regardless of the
	// wider Download button on the right.
	return (
		<div className="absolute inset-x-0 top-0 z-50 flex h-14 min-w-0 items-center gap-x-2 border-white/10 border-b bg-background/65 px-1.5 shadow-lg backdrop-blur-2xl">
			<div className="flex min-w-0 flex-1 items-center justify-start">
				{/* Hidden below `md`: on mobile the sidebar panels never mount, so `toggleSidebar` no-ops — the bottom tab bar handles this. */}
				<Button size="icon" variant="ghost" className="hidden md:flex" onClick={() => toggleSidebar("left")}>
					<SidebarSimpleIcon />
					<span className="sr-only">
						<Trans comment="Screen-reader label for opening or closing the left sidebar in resume builder">
							Toggle left sidebar
						</Trans>
					</span>
				</Button>
			</div>

			<div className="flex min-w-0 items-center gap-x-1">
				<Button
					size="icon"
					variant="ghost"
					aria-label={t({
						comment: "Accessible label for button navigating from builder to resumes dashboard",
						message: "Go to resumes dashboard",
					})}
					nativeButton={false}
					render={
						<Link to="/dashboard/resumes" search={{ sort: "lastUpdatedAt", tags: [] }}>
							<ArrowLeftIcon className="size-4.5" />
						</Link>
					}
				/>
				<span className="me-2.5 text-muted-foreground">/</span>
				<h2 className="min-w-0 truncate font-medium">{name}</h2>
				{isLocked && <LockSimpleIcon className="ms-2 text-muted-foreground" />}
				<SaveStatusIndicator />
				<BuilderHeaderDropdown />
				<Button
					size="icon"
					variant="ghost"
					aria-label={t`Theme and design settings`}
					onClick={() => toggleSidebar("right")}
				>
					<PaletteIcon className="size-4.5" />
				</Button>
			</div>

			<div className="flex min-w-0 flex-1 items-center justify-end gap-x-1">
				<ResumeDownloadButton />
			</div>
		</div>
	);
}

function ResumeDownloadButton() {
	const resume = useCurrentResume();

	return (
		<ResumeDownloadDialog
			resume={resume}
			trigger={(disabled) => (
				<Button
					size="sm"
					aria-label={t({
						comment: "Primary action in the builder header to open resume download options",
						message: "Download options",
					})}
					disabled={disabled}
					className="px-2 sm:px-2.5"
				>
					{disabled ? (
						<CircleNotchIcon className="animate-spin sm:me-1.5" />
					) : (
						<DownloadSimpleIcon className="sm:me-1.5" />
					)}
					<span className="hidden sm:inline">
						<Trans comment="Primary action in the builder header to open resume download options">Download</Trans>
					</span>
				</Button>
			)}
		/>
	);
}

function SaveStatusIndicator() {
	const status = useResumeStore((state) => state.saveStatus);
	if (status === "idle") return null;

	const { icon, label } = match(status)
		.with("saving", () => ({
			icon: <CircleNotchIcon className="animate-spin" />,
			label: t({
				comment: "Tooltip text shown in builder header while changes are syncing to the server",
				message: "Saving...",
			}),
		}))
		.with("saved", () => ({
			icon: <CheckCircleIcon />,
			label: t({
				comment: "Tooltip text shown in builder header after changes successfully saved to the server",
				message: "Saved",
			}),
		}))
		.with("error", () => ({
			icon: <WarningCircleIcon className="text-destructive" />,
			label: t({
				comment: "Tooltip text shown in builder header when an auto-save operation fails",
				message: "Error saving resume",
			}),
		}))
		.exhaustive();

	return (
		<Button size="icon" variant="ghost" disabled title={label} aria-label={label} className="cursor-default">
			{icon}
		</Button>
	);
}

function BuilderHeaderDropdown() {
	const resume = useCurrentResume();
	const patchResume = usePatchResume();
	const confirm = useConfirm();
	const navigate = useNavigate();

	if (!resume) return null;

	const id = resume.id;
	const isLocked = resume.isLocked;

	const handleToggleLock = async () => {
		if (!isLocked) {
			const confirmation = await confirm(t`Are you sure you want to lock this resume?`, {
				description: t`When locked, the resume cannot be updated or deleted.`,
			});

			if (!confirmation) return;
		}

		patchResume((draft) => {
			draft.isLocked = !isLocked;
		});
		toast.success(!isLocked ? "Resume locked." : "Resume unlocked.");
	};

	const handleDelete = async () => {
		const confirmation = await confirm("Are you sure you want to delete this resume?", {
			description: "This action cannot be undone.",
		});

		if (!confirmation) return;

		await deleteResumeFromSupabase(id);
		toast.success("Your resume has been deleted successfully.");
		void navigate({ to: "/dashboard/resumes" });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button size="icon" variant="ghost" aria-label={t`Resume options`}>
						<CaretDownIcon />
					</Button>
				}
			/>

			<DropdownMenuContent>
				<DropdownMenuItem onClick={handleToggleLock}>
					{isLocked ? <LockSimpleOpenIcon className="me-2" /> : <LockSimpleIcon className="me-2" />}
					{isLocked ? <Trans>Unlock</Trans> : <Trans>Lock</Trans>}
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem variant="destructive" disabled={isLocked} onClick={handleDelete}>
					<TrashSimpleIcon className="me-2" />
					<Trans>Delete</Trans>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
