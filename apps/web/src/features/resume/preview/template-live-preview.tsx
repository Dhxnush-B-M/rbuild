import { cn } from "@reactive-resume/utils/style";

type TemplateLivePreviewProps = {
	alt: string;
	className?: string;
	fallbackSrc: string;
};

export function TemplateLivePreview({ alt, className, fallbackSrc }: TemplateLivePreviewProps) {
	return (
		<div className={cn("relative aspect-page w-full overflow-hidden rounded-md bg-white", className)}>
			<img src={fallbackSrc} alt={alt} className="size-full object-cover" />
		</div>
	);
}
