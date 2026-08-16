import { cn } from "@rbuilder/utils/style";

type Props = {
	variant?: "logo" | "icon";
	className?: string;
};

export function BrandIcon({ variant = "logo", className }: Props) {
	return (
		<div
			className={cn("inline-flex select-none items-center gap-2.5 font-bold text-primary tracking-wider", className)}
		>
			<span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-purple-600 font-black text-lg text-white shadow-md transition-transform hover:scale-105">
				rB
			</span>
			{variant === "logo" && (
				<span className="bg-gradient-to-r from-foreground via-primary to-indigo-500 bg-clip-text font-extrabold text-2xl text-transparent tracking-tight">
					rbuilder
				</span>
			)}
		</div>
	);
}
