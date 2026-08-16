import { Badge } from "@rbuilder/ui/components/badge";
import { cn } from "@rbuilder/utils/style";
import { CometCard } from "@/components/animation/comet-card";

type BaseCardProps = React.ComponentProps<"div"> & {
	title: string;
	description: string;
	tags?: string[];
	className?: string;
	children?: React.ReactNode;
};

export function BaseCard({ title, description, tags, className, children, ...props }: BaseCardProps) {
	return (
		<CometCard translateDepth={4} rotateDepth={8} glareOpacity={0.15}>
			<div
				{...props}
				className={cn(
					"group relative flex aspect-page size-full cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-background/40 p-1 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 dark:border-white/10",
					className,
				)}
			>
				{/* Inner Glassy Content Container */}
				<div className="relative flex size-full flex-col overflow-hidden rounded-xl bg-card/40 backdrop-blur-md">
					{children}

					{/* Bottom Glass Pill */}
					<div className="absolute inset-x-0 bottom-0 flex w-full flex-col justify-end gap-y-1 border-white/10 border-t bg-background/70 px-4 py-3.5 backdrop-blur-xl transition-colors duration-300 group-hover:bg-background/85">
						<h3 className="truncate font-bold text-foreground text-sm tracking-tight transition-colors group-hover:text-primary">
							{title}
						</h3>
						<p className="truncate text-muted-foreground text-xs">{description}</p>

						<div className={cn("mt-1.5 hidden flex-wrap items-center gap-1", tags && tags.length > 0 && "flex")}>
							{tags?.map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
									className="rounded-md border border-white/10 bg-primary/10 text-[10px] text-primary"
								>
									{tag}
								</Badge>
							))}
						</div>
					</div>
				</div>
			</div>
		</CometCard>
	);
}
