import type { ResumeData } from "@rbuilder/schema/resume/data";
import type { DialogProps } from "../store";
import type { ImportType } from "./import.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { DownloadSimpleIcon, FileIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { defaultResumeData } from "@rbuilder/schema/resume/default";
import { Button } from "@rbuilder/ui/components/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@rbuilder/ui/components/dialog";
import { FormControl, FormItem, FormLabel, FormMessage } from "@rbuilder/ui/components/form";
import { Input } from "@rbuilder/ui/components/input";
import { Spinner } from "@rbuilder/ui/components/spinner";
import { generateId, slugify } from "@rbuilder/utils/string";
import { Combobox } from "@/components/ui/combobox";
import { useFormBlocker } from "@/hooks/use-form-blocker";
import { saveResumeToSupabase } from "@/libs/supabase/db";
import { useAppForm } from "@/libs/tanstack-form";
import { useDialogStore } from "../store";
import { detectJsonImportType } from "./import.utils";

const formSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(""),
		file: z.undefined(),
	}),
	z.object({
		type: z.literal("rbuilder-json"),
		file: z
			.instanceof(File)
			.refine((file) => file.type === "application/json", { message: "File must be a JSON file" }),
	}),
	z.object({
		type: z.literal("rbuilder-v4-json"),
		file: z
			.instanceof(File)
			.refine((file) => file.type === "application/json", { message: "File must be a JSON file" }),
	}),
	z.object({
		type: z.literal("json-resume-json"),
		file: z
			.instanceof(File)
			.refine((file) => file.type === "application/json", { message: "File must be a JSON file" }),
	}),
]);

// Sniff the JSON shape rather than trusting its extension or MIME type.
async function detectImportType(file: File): Promise<ImportType> {
	const name = file.name.toLowerCase();
	const mime = file.type;

	if (mime === "application/json" || name.endsWith(".json")) {
		try {
			return detectJsonImportType(JSON.parse(await file.text()));
		} catch {
			return "";
		}
	}

	return "";
}

export function ImportResumeDialog(_: DialogProps<"resume.import">) {
	const navigate = useNavigate();
	const closeDialog = useDialogStore((state) => state.closeDialog);

	const inputRef = useRef<HTMLInputElement>(null);
	const [isImporting, setIsImporting] = useState<boolean>(false);

	const form = useAppForm({
		defaultValues: {
			type: "" as ImportType,
			file: undefined as File | undefined,
		},
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			if (value.type === "" || !value.file) return;

			setIsImporting(true);

			const toastId = toast.loading(t`Importing your resume...`);

			try {
				const parsed = JSON.parse(await value.file.text()) as Partial<ResumeData>;
				const data: ResumeData = { ...defaultResumeData, ...parsed };

				const id = generateId();
				const resumeName = data.basics?.name || "Imported Resume";
				await saveResumeToSupabase({
					id,
					name: resumeName,
					slug: slugify(resumeName),
					tags: [],
					data,
				});

				toast.success(t`Your resume has been imported successfully.`, { id: toastId, description: null });
				closeDialog();
				void navigate({ to: "/builder/$resumeId", params: { resumeId: id } });
			} catch {
				toast.error(t`An error occurred while importing your resume.`, { id: toastId, description: null });
			} finally {
				setIsImporting(false);
			}
		},
	});

	const type = useStore(form.store, (s) => s.values.type);
	const file = useStore(form.store, (s) => s.values.file);

	const onSelectFile = () => {
		if (!inputRef.current) return;
		inputRef.current.click();
	};

	const onUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0];
		if (!selected) return;
		form.setFieldValue("file", selected);
		// #7: pre-select the source format from the file's content; the user can still override below.
		form.setFieldValue("type", await detectImportType(selected));
	};

	// #6: only warn about unsaved changes once a file has actually been chosen — not on a bare type selection.
	useFormBlocker(form, { shouldBlock: () => Boolean(file) });

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<DownloadSimpleIcon />
					<Trans>Import an existing resume</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>
						Continue where you left off by importing a JSON resume exported from rbuilder or a compatible resume
						builder.
					</Trans>
				</DialogDescription>
			</DialogHeader>

			<form
				className="space-y-4"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field name="file">
					{(field) => (
						<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
							<FormLabel>
								<Trans>File</Trans>
							</FormLabel>
							<FormControl>
								<Input
									type="file"
									accept="application/json,.json"
									className="hidden"
									ref={inputRef}
									onChange={onUploadFile}
								/>

								<Button
									variant="outline"
									className="h-auto w-full flex-col border-dashed py-8 font-normal"
									onClick={onSelectFile}
								>
									{field.state.value ? (
										<>
											<FileIcon weight="thin" size={32} />
											<p>{field.state.value.name}</p>
										</>
									) : (
										<>
											<UploadSimpleIcon weight="thin" size={32} />
											<Trans>Click here to select a file to import</Trans>
										</>
									)}
								</Button>
							</FormControl>
							<FormMessage errors={field.state.meta.errors} />
						</FormItem>
					)}
				</form.Field>

				{file && (
					<form.Field name="type">
						{(field) => (
							<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
								<FormLabel>
									<Trans>Type</Trans>
								</FormLabel>
								<FormControl
									render={
										<Combobox
											showClear={false}
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value as ImportType)}
											options={[
												{
													value: "rbuilder-json",
													label: t({
														comment: "Import source option for current rbuilder JSON format",
														message: "rbuilder (JSON)",
													}),
												},
												{
													value: "rbuilder-v4-json",
													label: t({
														comment: "Import source option for legacy rbuilder v4 JSON format",
														message: "rbuilder v4 (JSON)",
													}),
												},
												{
													value: "json-resume-json",
													label: t({
														comment: "Import source option for standard JSON Resume format",
														message: "JSON Resume",
													}),
												},
											]}
										/>
									}
								/>
								{!field.state.value && (
									<p className="text-muted-foreground text-xs">
										<Trans>We couldn't detect the format automatically — please choose it above.</Trans>
									</p>
								)}
								<FormMessage errors={field.state.meta.errors} />
							</FormItem>
						)}
					</form.Field>
				)}
				<DialogFooter>
					<Button type="submit" disabled={!type || !file || isImporting}>
						{isImporting ? <Spinner /> : null}
						{isImporting ? t`Importing…` : t`Import`}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
