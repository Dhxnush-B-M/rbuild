import type { Icon as IconType } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { SidebarTrigger } from "@rbuilder/ui/components/sidebar";
import { cn } from "@rbuilder/utils/style";

type Props = {
	title: string;
	icon: IconType;
	className?: string;
	actions?: ReactNode;
};

export function DashboardHeader({ title, icon: IconComponent, className, actions }: Props) {
	return (
		<div className={cn("relative flex items-center justify-between gap-x-3 pb-2", className)}>
			<SidebarTrigger className="absolute inset-s-0 md:hidden" />
			<div className="flex flex-1 items-center justify-center gap-x-3 md:justify-start">
				<div className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 p-2 shadow-inner backdrop-blur-md">
					<IconComponent weight="bold" className="size-5 text-primary" />
				</div>
				<h1 className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text font-bold text-2xl text-transparent tracking-tight sm:text-3xl">
					{title}
				</h1>
			</div>
			{actions ? <div className="flex items-center gap-x-2">{actions}</div> : null}
		</div>
	);
}
