import { t } from "@lingui/core/macro";
import { CaretDownIcon } from "@phosphor-icons/react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@rbuilder/ui/components/accordion";
import { Button } from "@rbuilder/ui/components/button";
import { cn } from "@rbuilder/utils/style";
import type { RightSidebarSection } from "@/libs/resume/section";
import { getSectionIcon, getSectionTitle } from "@/libs/resume/section";
import { useSectionStore } from "../../../-store/section";

type Props = React.ComponentProps<typeof AccordionContent> & {
	type: RightSidebarSection;
};

export function SectionBase({ type, className, ...props }: Props) {
	const collapsed = useSectionStore(
		(state) => state.sections[type]?.collapsed ?? false,
	);
	const toggleCollapsed = useSectionStore((state) => state.toggleCollapsed);
	const sectionTitle = getSectionTitle(type);

	return (
		<div
			id={`sidebar-${type}`}
			className="relative rounded-2xl border border-white/10 bg-card/40 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/50"
		>
			<Accordion
				value={collapsed ? [] : [type]}
				onValueChange={() => toggleCollapsed(type)}
				className="space-y-3"
			>
				<AccordionItem value={type} className="group/accordion-item space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex flex-1 items-center gap-x-2.5">
							<AccordionTrigger
								className="items-center justify-center p-0"
								render={
									<Button
										size="icon-sm"
										variant="ghost"
										aria-label={t`Toggle ${sectionTitle} section`}
										className="size-7 rounded-lg hover:bg-white/10"
									>
										<CaretDownIcon className="transition-transform duration-200 group-data-closed/accordion-item:-rotate-90" />
									</Button>
								}
							/>

							<div className="flex items-center gap-x-2">
								<div className="text-primary">{getSectionIcon(type)}</div>
								<h2 className="line-clamp-1 font-bold text-foreground text-lg tracking-tight sm:text-xl">
									{sectionTitle}
								</h2>
							</div>
						</div>
					</div>

					<AccordionContent
						className={cn("overflow-hidden pt-2 pb-0", className)}
						{...props}
					/>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
