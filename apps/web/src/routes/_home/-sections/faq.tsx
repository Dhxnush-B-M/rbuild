import { m } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@rbuilder/ui/components/accordion";

type FAQItemData = {
	question: string;
	answer: string;
};

const faqItems: FAQItemData[] = [
	{
		question: "How does rbuilder pricing work?",
		answer:
			"You can start creating, customizing, and previewing resumes for free. We also provide affordable Pro access (₹11 for 1 Month or ₹20 for 3 Months) for unlimited high-resolution PDF exports and premium features.",
	},
	{
		question: "How is my data protected?",
		answer:
			"Your data is stored securely in your browser's local memory and Supabase database, and is never shared with third parties.",
	},
	{
		question: "Can I export my resume to PDF?",
		answer:
			"Absolutely! You can export your resume to PDF with a single click. The exported PDF maintains all your formatting and styling perfectly.",
	},
	{
		question: "Is rbuilder available in multiple languages?",
		answer: "Yes, rbuilder supports English with comprehensive international typography and multi-font rendering.",
	},
	{
		question: "What makes rbuilder different from other resume builders?",
		answer:
			"rbuilder is open-source, privacy-focused, and completely free. Unlike other resume builders, it doesn't show ads, track your data, or limit your features behind a paywall.",
	},
	{
		question: "How do I share my resume?",
		answer:
			"You can share your resume via a unique public URL, protect it with a password, or download it as a PDF to share directly.",
	},
];

export function Faq() {
	return (
		<section id="frequently-asked-questions" className="relative overflow-hidden py-16 md:py-24">
			<div className="mx-auto max-w-3xl space-y-12">
				{/* Centered Top Section Header */}
				<m.div
					className="space-y-4 text-center will-change-[transform,opacity]"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.45 }}
				>
					<h2 className="bg-gradient-to-r from-foreground via-white to-primary/80 bg-clip-text font-extrabold text-3xl text-transparent tracking-tight sm:text-4xl md:text-5xl">
						Frequently Asked Questions
					</h2>

					<p className="mx-auto max-w-xl text-muted-foreground text-sm leading-relaxed sm:text-base">
						Everything you need to know about building, exporting, and styling your resume with rbuilder.
					</p>
				</m.div>

				{/* Centered Accordion List */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.45, delay: 0.1 }}
					className="w-full will-change-[transform,opacity]"
				>
					<Accordion multiple className="space-y-4">
						{faqItems.map((item, index) => (
							<FAQItemComponent key={item.question} item={item} index={index} />
						))}
					</Accordion>
				</m.div>
			</div>
		</section>
	);
}

type FAQItemComponentProps = {
	item: FAQItemData;
	index: number;
};

function FAQItemComponent({ item, index }: FAQItemComponentProps) {
	return (
		<m.div
			className="will-change-[transform,opacity]"
			initial={{ opacity: 0, y: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.25, delay: Math.min(0.2, index * 0.04) }}
		>
			<AccordionItem
				value={item.question}
				className="group overflow-hidden rounded-2xl border border-white/10 bg-card/50 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-card/75 data-[state=open]:border-primary/50 data-[state=open]:bg-card/85"
			>
				<AccordionTrigger className="px-6 py-5 text-left font-semibold text-base transition-colors hover:text-primary sm:text-lg">
					<span>{item.question}</span>
				</AccordionTrigger>
				<AccordionContent className="px-6 pt-1 pb-6 text-muted-foreground text-sm leading-relaxed sm:text-base">
					<div className="border-white/5 border-t pt-4">{item.answer}</div>
				</AccordionContent>
			</AccordionItem>
		</m.div>
	);
}
