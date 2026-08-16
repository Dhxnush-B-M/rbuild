import type { SectionType } from "@reactive-resume/schema/resume/data";
import type { LeftSidebarSection } from "@/libs/resume/section";
import { t } from "@lingui/core/macro";
import { CaretDownIcon } from "@phosphor-icons/react";
import { getDefaultSectionIconName } from "@reactive-resume/schema/resume/section-icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@reactive-resume/ui/components/accordion";
import { Button } from "@reactive-resume/ui/components/button";
import { cn } from "@reactive-resume/utils/style";
import { IconPicker } from "@/components/input/icon-picker";
import { useCurrentBuilderResumeSelector, useUpdateResumeData } from "@/features/resume/builder/draft";
import { getSectionIcon, getSectionTitle } from "@/libs/resume/section";
import { useSectionStore } from "../../../-store/section";
import { SectionDropdownMenu } from "./section-menu";

type Props = React.ComponentProps<typeof AccordionContent> & {
	type: LeftSidebarSection;
};

export function SectionBase({ type, className, ...props }: Props) {
	const updateResumeData = useUpdateResumeData();
	// Subscribe to only this section's slice, not the whole resume.
	const section = useCurrentBuilderResumeSelector((resume) => {
		const data = resume.data;
		return type === "basics"
			? data.basics
			: type === "summary"
				? data.summary
				: type === "picture"
					? data.picture
					: type === "custom"
						? data.customSections
						: data.sections[type];
	});

	const isHidden = "hidden" in section && section.hidden;
	const hasSectionIcon = !["picture", "basics", "custom"].includes(type);
	const rawIcon = "icon" in section && typeof section.icon === "string" ? section.icon : "";
	const fallbackIcon = hasSectionIcon ? getDefaultSectionIconName(type as "summary" | SectionType) : "";
	const sectionIcon = rawIcon === "none" ? "" : rawIcon || fallbackIcon;

	const sectionTitle = ("title" in section && section.title) || getSectionTitle(type);

	const collapsed = useSectionStore((state) => state.sections[type]?.collapsed ?? false);
	const toggleCollapsed = useSectionStore((state) => state.toggleCollapsed);

	const onIconChange = (icon: string) => {
		const valueToStore = icon === "" ? "none" : icon;

		updateResumeData((draft) => {
			if (type === "summary") {
				draft.summary.icon = valueToStore;
			} else if (type !== "basics" && type !== "picture" && type !== "custom") {
				draft.sections[type as SectionType].icon = valueToStore;
			}
		});
	};

	return (
		<div
			id={`sidebar-${type}`}
			className={cn(
				"relative rounded-2xl border border-white/10 bg-card/40 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/50",
				isHidden && "opacity-50",
			)}
		>
			<Accordion value={collapsed ? [] : [type]} onValueChange={() => toggleCollapsed(type)} className="space-y-3">
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
								{hasSectionIcon ? (
									<IconPicker value={sectionIcon} onChange={onIconChange} size="icon" variant="ghost" />
								) : (
									<div className="text-primary">{getSectionIcon(type)}</div>
								)}
								<h2 className="line-clamp-1 font-bold text-foreground text-lg tracking-tight sm:text-xl">
									{sectionTitle}
								</h2>
							</div>
						</div>

						{!["picture", "basics", "custom"].includes(type) && (
							<SectionDropdownMenu type={type as "summary" | SectionType} />
						)}
					</div>

					<AccordionContent className={cn("pt-2", className)} {...props} />
				</AccordionItem>
			</Accordion>
		</div>
	);
}
