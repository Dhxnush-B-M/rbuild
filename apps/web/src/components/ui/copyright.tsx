import { Trans } from "@lingui/react/macro";
import { cn } from "@rbuilder/utils/style";

type Props = React.ComponentProps<"div">;

export function Copyright({ className, ...props }: Props) {
	return (
		<div
			className={cn("text-center text-muted-foreground/80 text-xs leading-relaxed sm:text-left", className)}
			{...props}
		>
			<p>
				<Trans>© {new Date().getFullYear()} rbuilder. All rights reserved.</Trans>
			</p>
			<p>
				<Trans>Built for professional career growth.</Trans>
			</p>
		</div>
	);
}
