import type { RightSidebarSection } from "@/libs/resume/section";
import { Fragment, useRef } from "react";
import { match } from "ts-pattern";
import { ScrollArea } from "@rbuilder/ui/components/scroll-area";
import { Copyright } from "@/components/ui/copyright";
import { rightSidebarSections } from "@/libs/resume/section";
import { DesignSectionBuilder } from "./sections/design";
import { ExportSectionBuilder } from "./sections/export";
import { LayoutSectionBuilder } from "./sections/layout";
import { PageSectionBuilder } from "./sections/page";
import { TemplateSectionBuilder } from "./sections/template";
import { TypographySectionBuilder } from "./sections/typography";

function getSectionComponent(type: RightSidebarSection) {
	return match(type)
		.with("template", () => <TemplateSectionBuilder />)
		.with("layout", () => <LayoutSectionBuilder />)
		.with("typography", () => <TypographySectionBuilder />)
		.with("design", () => <DesignSectionBuilder />)
		.with("page", () => <PageSectionBuilder />)
		.with("export", () => <ExportSectionBuilder />)
		.otherwise(() => null);
}

export function BuilderSidebarRight() {
	const scrollAreaRef = useRef<HTMLDivElement | null>(null);

	return (
		<ScrollArea
			ref={scrollAreaRef}
			className="@container h-[calc(100svh-3.5rem)] overflow-hidden bg-background/50 backdrop-blur-2xl"
		>
			<div className="space-y-4 p-4">
				{rightSidebarSections.map((section) => (
					<Fragment key={section}>{getSectionComponent(section)}</Fragment>
				))}

				<Copyright className="mx-auto py-2 text-center" />
			</div>
		</ScrollArea>
	);
}
