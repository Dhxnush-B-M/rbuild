import type { ErrorComponentProps } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";
import { ArrowClockwiseIcon, HouseIcon, WarningIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@rbuilder/ui/components/alert";
import { BrandIcon } from "@rbuilder/ui/components/brand-icon";
import { Button, buttonVariants } from "@rbuilder/ui/components/button";

export function ErrorScreen({ error, reset }: ErrorComponentProps) {
	return (
		<div className="mx-auto flex h-svh max-w-md flex-col items-center justify-center gap-y-4 px-4">
			<BrandIcon variant="logo" className="size-12" />

			<Alert variant="destructive">
				<WarningIcon />
				<AlertTitle>
					<Trans>Something went wrong</Trans>
				</AlertTitle>
				<AlertDescription className="break-words font-mono text-xs">
					{error?.message || <Trans>An unexpected error stopped this page from loading.</Trans>}
				</AlertDescription>
			</Alert>

			<div className="flex items-center gap-x-2">
				<Button onClick={reset}>
					<ArrowClockwiseIcon />
					<Trans>Try again</Trans>
				</Button>

				<Link to="/dashboard" className={buttonVariants({ variant: "secondary" })}>
					<HouseIcon />
					<Trans>Go to dashboard</Trans>
				</Link>
			</div>
		</div>
	);
}
