import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { EyeIcon, EyeSlashIcon, LockOpenIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";
import z from "zod";
import { Button } from "@reactive-resume/ui/components/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@reactive-resume/ui/components/form";
import { Input } from "@reactive-resume/ui/components/input";
import { useAppForm } from "@/libs/tanstack-form";

const formSchema = z.object({
	password: z.string().min(1).max(64),
});

type Props = {
	redirectPath: string;
};

export function ResumePasswordPage({ redirectPath }: Props) {
	const navigate = useNavigate();
	const [showPassword, toggleShowPassword] = useToggle(false);

	const [username, slug] = redirectPath.split("/").slice(1) as [string, string];
	if (!username || !slug) throw navigate({ to: "/" });

	const form = useAppForm({
		defaultValues: { password: "" },
		validators: { onSubmit: formSchema },
		onSubmit: () => {
			toast.success(t`Password verified successfully.`);
			void navigate({ to: redirectPath, replace: true });
		},
	});

	return (
		<>
			<div className="space-y-4 text-center">
				<h1 className="font-semibold text-2xl tracking-tight">
					<Trans>The resume you are trying to access is password protected</Trans>
				</h1>

				<div className="text-muted-foreground leading-relaxed">
					<Trans>Please enter the password shared with you by the owner of the resume to continue.</Trans>
				</div>
			</div>

			<form
				className="space-y-6"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field name="password">
					{(field) => (
						<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
							<FormLabel>
								<Trans>Password</Trans>
							</FormLabel>
							<div className="flex items-center gap-x-2">
								<FormControl
									render={
										<Input
											name={field.name}
											type={showPassword ? "text" : "password"}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
										/>
									}
								/>

								<Button size="icon" variant="ghost" onClick={toggleShowPassword}>
									{showPassword ? <EyeSlashIcon /> : <EyeIcon />}
								</Button>
							</div>
							<FormMessage errors={field.state.meta.errors} />
						</FormItem>
					)}
				</form.Field>

				<Button className="w-full" type="submit">
					<LockOpenIcon />
					<Trans>Access Resume</Trans>
				</Button>
			</form>
		</>
	);
}
