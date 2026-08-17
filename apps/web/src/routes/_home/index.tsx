import { createFileRoute } from "@tanstack/react-router";
import { ResumeBackground } from "./-components/resume-background";
import { Faq } from "./-sections/faq";
import { Features } from "./-sections/features";
import { Footer } from "./-sections/footer";
import { Header } from "./-sections/header";
import { Hero } from "./-sections/hero";
import { Prefooter } from "./-sections/prefooter";
import { Statistics } from "./-sections/statistics";
import { Support } from "./-sections/support";
import { Templates } from "./-sections/templates";
import { Testimonials } from "./-sections/testimonials";

export const Route = createFileRoute("/_home/")({
	component: RouteComponent,
	head: () => ({
		meta: [{ name: "robots", content: "index, follow" }],
	}),
});

function RouteComponent() {
	return (
		<main
			id="main-content"
			className="relative min-h-screen overflow-x-hidden bg-background text-foreground"
		>
			{/* Ambient Full Page Background with Up-to-Down Light & Floating Resume Cards */}
			<ResumeBackground />

			<Header />
			<Hero />

			<div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-12">
				<div className="border-border/40 border-x [&>section:first-child]:border-t-0 [&>section]:border-border/40 [&>section]:border-t">
					<Statistics />
					<Features />
					<Templates />
					<Testimonials />
					<Support />
					<Faq />
					<Prefooter />
					<Footer />
				</div>
			</div>
		</main>
	);
}
