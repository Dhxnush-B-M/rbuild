import type { SupabaseResumeRecord } from "@/libs/supabase/db";
import { t } from "@lingui/core/macro";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDialogStore } from "@/dialogs/store";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteResumeFromSupabase, saveResumeToSupabase } from "@/libs/supabase/db";

export function useResumeMenuActions(resume: SupabaseResumeRecord) {
	const confirm = useConfirm();
	const queryClient = useQueryClient();
	const { openDialog } = useDialogStore();

	const handleToggleLock = async () => {
		if (!resume.is_locked) {
			const confirmed = await confirm(t`Are you sure you want to lock this resume?`, {
				description: t`When locked, the resume cannot be updated or deleted.`,
			});
			if (!confirmed) return;
		}

		await saveResumeToSupabase({
			id: resume.id,
			name: resume.name,
			isLocked: !resume.is_locked,
		});

		await queryClient.invalidateQueries({ queryKey: ["resumes"] });
		toast.success(!resume.is_locked ? "Resume locked." : "Resume unlocked.");
	};

	const handleDelete = async () => {
		const confirmed = await confirm(t`Are you sure you want to delete this resume?`, {
			description: t`This action cannot be undone.`,
		});
		if (!confirmed) return;

		const toastId = toast.loading(t`Deleting your resume...`);
		const ok = await deleteResumeFromSupabase(resume.id);

		if (ok) {
			await queryClient.invalidateQueries({ queryKey: ["resumes"] });
			toast.success(t`Your resume has been deleted successfully.`, { id: toastId });
		} else {
			toast.error(t`Failed to delete resume.`, { id: toastId });
		}
	};

	return {
		handleDelete,
		handleDuplicate: () =>
			openDialog("resume.duplicate", {
				id: resume.id,
				name: resume.name,
				slug: resume.slug,
				tags: resume.tags || [],
				shouldRedirect: true,
			}),
		handleToggleLock,
		handleUpdate: () =>
			openDialog("resume.update", {
				id: resume.id,
				name: resume.name,
				slug: resume.slug,
				tags: resume.tags || [],
			}),
	};
}
