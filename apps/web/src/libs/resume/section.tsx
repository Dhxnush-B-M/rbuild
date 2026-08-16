import type { IconProps } from "@phosphor-icons/react";
import type { SectionType } from "@rbuilder/schema/resume/data";
import { t } from "@lingui/core/macro";
import {
	BookOpenIcon,
	BrainIcon,
	BriefcaseIcon,
	CameraIcon,
	CodeSimpleIcon,
	DiamondsFourIcon,
	DownloadIcon,
	EnvelopeSimpleIcon,
	FileTextIcon,
	GraduationCapIcon,
	HandHeartIcon,
	HeartIcon,
	IdentificationCardIcon,
	InfoIcon,
	LayoutIcon,
	LightningIcon,
	NotepadIcon,
	PaletteIcon,
	PuzzlePieceIcon,
	ReadCvLogoIcon,
	SealCheckIcon,
	ShareNetworkIcon,
	TextTIcon,
	TranslateIcon,
	TrophyIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { match } from "ts-pattern";
import { cn } from "@rbuilder/utils/style";

export { defaultSectionIconNames } from "@rbuilder/schema/resume/section-icons";

export type LeftSidebarSection = "picture" | "basics" | "summary" | SectionType | "custom";

// CustomSectionType values that are not in SectionType (used in custom sections only)
type CustomOnlyType = "cover-letter";

export type RightSidebarSection =
	| "template"
	| "layout"
	| "typography"
	| "design"
	| "page"
	| "notes"
	| "analysis"
	| "export"
	| "information";

export type SidebarSection = LeftSidebarSection | RightSidebarSection;

export const leftSidebarSections: LeftSidebarSection[] = [
	"picture",
	"basics",
	"summary",
	"profiles",
	"experience",
	"education",
	"projects",
	"skills",
	"languages",
	"interests",
	"awards",
	"certifications",
	"publications",
	"volunteer",
	"references",
	"custom",
] as const;

export const rightSidebarSections: RightSidebarSection[] = [
	"template",
	"layout",
	"typography",
	"design",
	"page",
	"export",
] as const;

export const getSectionTitle = (type: SidebarSection | CustomOnlyType): string => {
	return (
		match(type)
			// Left Sidebar Sections
			.with("picture", () => t`Picture`)
			.with("basics", () => t`Basics`)
			.with("summary", () => t`Summary`)
			.with("profiles", () => t`Profiles`)
			.with("experience", () => t`Experience`)
			.with("education", () => t`Education`)
			.with("projects", () => t`Projects`)
			.with("skills", () => t`Skills`)
			.with("languages", () => t`Languages`)
			.with("interests", () => t`Interests`)
			.with("awards", () => t`Awards`)
			.with("certifications", () => t`Certifications`)
			.with("publications", () => t`Publications`)
			.with("volunteer", () => t`Volunteer`)
			.with("references", () => t`References`)
			.with("custom", () => t`Custom Sections`)

			// Custom Section Types (not in main sidebar)
			.with("cover-letter", () => t`Cover Letter`)

			// Right Sidebar Sections
			.with("template", () => t`Template`)
			.with("layout", () => t`Layout`)
			.with("typography", () => t`Typography`)
			.with("design", () => t`Design`)
			.with("page", () => t`Page`)
			.with("notes", () => t`Notes`)
			.with("analysis", () => t`Resume Analysis`)
			.with("export", () => t`Export`)
			.with("information", () => t`Information`)

			.exhaustive()
	);
};

export const getSectionIcon = (type: SidebarSection | CustomOnlyType, props?: IconProps): React.ReactNode => {
	const iconProps = { ...props, className: cn("shrink-0", props?.className) };

	return (
		match(type)
			// Left Sidebar Sections - Upgraded Modern Icons
			.with("picture", () => <CameraIcon {...iconProps} />)
			.with("basics", () => <IdentificationCardIcon {...iconProps} />)
			.with("summary", () => <FileTextIcon {...iconProps} />)
			.with("profiles", () => <ShareNetworkIcon {...iconProps} />)
			.with("experience", () => <BriefcaseIcon {...iconProps} />)
			.with("education", () => <GraduationCapIcon {...iconProps} />)
			.with("projects", () => <CodeSimpleIcon {...iconProps} />)
			.with("skills", () => <LightningIcon {...iconProps} />)
			.with("languages", () => <TranslateIcon {...iconProps} />)
			.with("interests", () => <HeartIcon {...iconProps} />)
			.with("awards", () => <TrophyIcon {...iconProps} />)
			.with("certifications", () => <SealCheckIcon {...iconProps} />)
			.with("publications", () => <BookOpenIcon {...iconProps} />)
			.with("volunteer", () => <HandHeartIcon {...iconProps} />)
			.with("references", () => <UsersThreeIcon {...iconProps} />)
			.with("custom", () => <PuzzlePieceIcon {...iconProps} />)

			// Custom Section Types (not in main sidebar)
			.with("cover-letter", () => <EnvelopeSimpleIcon {...iconProps} />)

			// Right Sidebar Sections
			.with("template", () => <DiamondsFourIcon {...iconProps} />)
			.with("layout", () => <LayoutIcon {...iconProps} />)
			.with("typography", () => <TextTIcon {...iconProps} />)
			.with("design", () => <PaletteIcon {...iconProps} />)
			.with("page", () => <ReadCvLogoIcon {...iconProps} />)
			.with("notes", () => <NotepadIcon {...iconProps} />)
			.with("analysis", () => <BrainIcon {...iconProps} />)
			.with("export", () => <DownloadIcon {...iconProps} />)
			.with("information", () => <InfoIcon {...iconProps} />)

			.exhaustive()
	);
};
