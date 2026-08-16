import { t } from "@lingui/core/macro";
import { PlusIcon } from "@phosphor-icons/react";
import { useDialogStore } from "@/dialogs/store";

export function CreateResumeCard() {
	const { openDialog } = useDialogStore();

	return (
		<button
			type="button"
			onClick={() => openDialog("resume.create", undefined)}
			className="group relative flex aspect-page size-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-zinc-400/60 border-dashed bg-zinc-100/50 p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600 hover:bg-zinc-200/60 hover:shadow-xl dark:border-zinc-700/80 dark:bg-zinc-900/30 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
		>
			<div className="flex flex-col items-center justify-center gap-y-3 transition-transform duration-300 group-hover:scale-105">
				<div className="flex size-14 items-center justify-center rounded-full transition-colors duration-300">
					<PlusIcon
						size={40}
						weight="regular"
						className="text-zinc-500 transition-transform duration-300 group-hover:text-foreground dark:text-zinc-400"
					/>
				</div>

				<span className="font-bold text-base text-zinc-600 tracking-tight transition-colors duration-300 group-hover:text-foreground sm:text-lg dark:text-zinc-400">
					{t`New resume`}
				</span>
			</div>

			{/* Accessible labels for screen readers & tests */}
			<span className="sr-only">{t`Create a new resume`}</span>
			<span className="sr-only">{t`Start building your resume from scratch`}</span>
		</button>
	);
}
