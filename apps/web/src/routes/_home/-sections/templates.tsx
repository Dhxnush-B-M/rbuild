import { templateSchema } from "@rbuilder/schema/templates";
import { useNavigate } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useState } from "react";

export function TemplatesSection() {
	const navigate = useNavigate();
	const [isPaused, setIsPaused] = useState(false);

	const templateKeys = templateSchema.options;

	return (
		<section className="relative overflow-hidden py-24 md:py-32">
			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="mx-auto max-w-4xl px-6 text-center"
			>
				<h2 className="font-extrabold text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
					Designed to stand out.
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
					Hover to pause the 3D rotating showcase of professional resume
					templates crafted for maximum impact.
				</p>
			</m.div>

			{/* 3D Circular Rotating Carousel Stage */}
			<section
				aria-label="Template Carousel Stage"
				className="relative mt-12 flex h-[480px] w-full items-center justify-center overflow-hidden md:h-[550px]"
				onMouseEnter={() => setIsPaused(true)}
				onMouseLeave={() => setIsPaused(false)}
			>
				<div className="relative flex size-full items-center justify-center [perspective:1200px]">
					<m.div
						className="relative flex size-full items-center justify-center [transform-style:preserve-3d]"
						animate={{ rotateY: isPaused ? undefined : [0, 360] }}
						transition={{
							rotateY: {
								duration: 35,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							},
						}}
					>
						{templateKeys.map((key, index) => {
							const total = templateKeys.length;
							const angle = (360 / total) * index;
							const name = key.charAt(0).toUpperCase() + key.slice(1);
							const imageUrl = `/templates/jpg/${key}.jpg`;

							return (
								<button
									type="button"
									key={key}
									onClick={() => void navigate({ to: "/dashboard/resumes" })}
									className="absolute flex cursor-pointer items-center justify-center border-none bg-transparent p-0 text-left transition-transform duration-300 focus:outline-none"
									style={{
										transform: `rotateY(${angle}deg) translateZ(480px)`,
									}}
								>
									<m.div
										className="group relative w-44 rounded-xl border border-white/20 bg-card/80 p-2 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary/80 sm:w-52 md:w-56 dark:border-white/10"
										whileHover={{ y: -8 }}
									>
										<div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-background">
											<img
												src={imageUrl}
												alt={name}
												onError={(e) => {
													(e.target as HTMLImageElement).src =
														"/images/hero-builder-preview.png";
												}}
												className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
											/>

											{/* Subtle overlay gradient on hover */}
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
											<div className="absolute inset-x-0 bottom-0 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
												<p className="font-bold text-sm tracking-wide drop-shadow-md">
													{name}
												</p>
											</div>
										</div>
									</m.div>
								</button>
							);
						})}
					</m.div>
				</div>
			</section>
		</section>
	);
}

export { TemplatesSection as Templates };
