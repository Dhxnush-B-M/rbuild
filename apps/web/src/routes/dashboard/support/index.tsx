import { t } from "@lingui/core/macro";
import {
	ArrowSquareOutIcon,
	ChatCircleDotsIcon,
	CheckIcon,
	CopySimpleIcon,
	EnvelopeSimpleIcon,
	HeadsetIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@reactive-resume/ui/components/button";
import { Separator } from "@reactive-resume/ui/components/separator";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/support/")({
	component: SupportRouteComponent,
});

function SupportRouteComponent() {
	const [copied, setCopied] = useState(false);

	const handleCopyEmail = async () => {
		await navigator.clipboard.writeText("support@resume-builder.com");
		setCopied(true);
		toast.success(t`Support email copied to clipboard!`);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleOpenLiveChat = () => {
		toast.info(t`Connecting to live customer support agent...`);
	};

	return (
		<div className="space-y-6">
			<DashboardHeader icon={HeadsetIcon} title={t`Customer Support`} />

			<Separator />

			<div className="mx-auto max-w-4xl pt-4">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Live Support Card */}
					<div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 sm:p-8">
						<div>
							<div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<ChatCircleDotsIcon size={32} />
							</div>
							<h3 className="mt-6 font-bold text-2xl text-foreground tracking-tight">24/7 Live Support</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								Chat directly with our support specialists for real-time help with resume editing, templates, and
								downloads.
							</p>
						</div>

						<div className="mt-8 pt-4">
							<Button size="lg" className="w-full gap-2 font-bold" onClick={handleOpenLiveChat}>
								<ChatCircleDotsIcon className="size-5" />
								<span>Start Live Chat</span>
							</Button>
						</div>
					</div>

					{/* Email Support Card */}
					<div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 sm:p-8">
						<div>
							<div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
								<EnvelopeSimpleIcon size={32} />
							</div>
							<h3 className="mt-6 font-bold text-2xl text-foreground tracking-tight">Email Support</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								Reach us directly by email. We reply to all inquiries and feedback in under 15 minutes.
							</p>

							{/* Interactive Email Bar */}
							<button
								type="button"
								onClick={handleCopyEmail}
								className="group mt-4 flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-white/10 bg-background/50 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-background/80"
							>
								<span className="truncate font-mono text-foreground text-xs sm:text-sm">
									support@resume-builder.com
								</span>
								<span className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs transition-colors group-hover:text-primary">
									{copied ? <CheckIcon className="size-4 text-emerald-400" /> : <CopySimpleIcon className="size-4" />}
									<span>{copied ? "Copied" : "Copy"}</span>
								</span>
							</button>
						</div>

						<div className="mt-8 pt-4">
							<Button
								size="lg"
								className="w-full gap-2 font-bold"
								nativeButton={false}
								render={
									<a href="mailto:support@resume-builder.com">
										<ArrowSquareOutIcon className="size-5" />
										<span>Send Email</span>
									</a>
								}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
