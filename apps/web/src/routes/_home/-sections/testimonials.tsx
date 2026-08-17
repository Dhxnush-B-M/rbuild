import {
	PaperPlaneIcon,
	StarIcon,
	UserCheckIcon,
	XIcon,
} from "@phosphor-icons/react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
	getFeedbacksFromSupabase,
	submitFeedbackToSupabase,
} from "@/libs/supabase/db";

type Testimonial = {
	id: string;
	name: string;
	description: string;
	date: string;
	gradient: string;
	rating: number;
};

const gradients = [
	"from-blue-500 via-indigo-500 to-purple-500",
	"from-emerald-400 via-teal-500 to-cyan-600",
	"from-rose-500 via-pink-500 to-amber-500",
	"from-violet-600 via-purple-500 to-fuchsia-500",
	"from-amber-400 via-orange-500 to-red-500",
	"from-cyan-400 via-blue-500 to-indigo-600",
];

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function playCenterClickSound() {
	try {
		const AudioCtx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(520, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
		gain.gain.setValueAtTime(0.3, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + 0.1);
	} catch {
		// ignore
	}
}

export function Testimonials() {
	const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [rating, setRating] = useState(5);
	const [hoverRating, setHoverRating] = useState(0);
	const [description, setDescription] = useState("");

	useEffect(() => {
		void getFeedbacksFromSupabase().then((feedbacks) => {
			if (feedbacks && feedbacks.length > 0) {
				const mapped: Testimonial[] = feedbacks.map((fb, idx) => ({
					id: fb.id,
					name: fb.user_name,
					description: fb.comment,
					date: new Date(fb.created_at).toLocaleDateString(),
					gradient: gradients[idx % gradients.length] ?? gradients[0] ?? "",
					rating: fb.rating || 5,
				}));
				setTestimonialsList(mapped);
			}
		});
	}, []);

	function handleCenterCircleClick() {
		playCenterClickSound();
		setIsModalOpen(true);
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!name || !description) return;

		const userEmail =
			email.trim() || `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`;

		await submitFeedbackToSupabase({
			name: name.trim(),
			email: userEmail,
			rating,
			comment: description.trim(),
		});

		const newTestimonial: Testimonial = {
			id: String(Date.now()),
			name: name.trim(),
			description: description.trim(),
			date: "Just now",
			gradient: "from-primary via-indigo-500 to-purple-500",
			rating,
		};

		setTestimonialsList((prev) => [newTestimonial, ...prev.slice(0, 7)]);
		setIsSubmitted(true);

		setTimeout(() => {
			setIsModalOpen(false);
			setIsSubmitted(false);
			setName("");
			setEmail("");
			setDescription("");
			setRating(5);
		}, 1800);
	}

	return (
		<section
			id="testimonials"
			className="relative overflow-hidden border-border/40 border-b py-20 md:py-28"
		>
			<style>{`
				@keyframes orbit {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
				@keyframes counterRotate {
					from { transform: rotate(0deg); }
					to { transform: rotate(-360deg); }
				}
				.animate-orbit {
					animation: orbit 40s linear infinite;
				}
				.animate-counter-rotate {
					animation: counterRotate 40s linear infinite;
				}
				.animate-orbit:hover, .animate-orbit:hover .animate-counter-rotate {
					animation-play-state: paused;
				}
			`}</style>

			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center space-y-4 text-center">
					<h2 className="bg-gradient-to-r from-foreground via-primary to-indigo-500 bg-clip-text font-extrabold text-3xl text-transparent tracking-tight sm:text-4xl md:text-5xl">
						Loved by Professionals Worldwide
					</h2>

					<p className="max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">
						Click the center{" "}
						<span className="font-semibold text-primary">rbuilder</span> circle
						to submit your feedback or explore live reviews.
					</p>
				</div>

				{/* 360 DEGREE ROTATING CIRCLE STAGE */}
				<div className="relative mt-16 flex h-[480px] w-full items-center justify-center overflow-hidden sm:h-[540px]">
					{/* CLICKABLE CENTER RBUILDER CIRCLE */}
					<button
						type="button"
						onClick={handleCenterCircleClick}
						title="Click to give feedback!"
						aria-label="Click to give feedback and play sound"
						className="absolute z-20 flex size-20 cursor-pointer items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-primary hover:shadow-primary/30 active:scale-95 sm:size-24"
					>
						<span className="text-center font-extrabold text-primary text-sm sm:text-base">
							rbuilder
						</span>
					</button>

					{/* Orbit Ring Container */}
					<div className="relative flex size-[360px] animate-orbit items-center justify-center rounded-full border border-primary/30 border-dashed sm:size-[450px]">
						{testimonialsList.length === 0 ? (
							<div className="text-muted-foreground text-xs">
								Click the center circle to submit the first review!
							</div>
						) : (
							testimonialsList.slice(0, 6).map((item, idx) => {
								const angle =
									(idx / Math.min(testimonialsList.length, 6)) * 2 * Math.PI;
								const radius =
									typeof window !== "undefined" && window.innerWidth < 640
										? 140
										: 180;
								const x = Math.cos(angle) * radius;
								const y = Math.sin(angle) * radius;

								return (
									<div
										key={item.id}
										style={{
											transform: `translate(${x}px, ${y}px)`,
										}}
										className="group/item absolute"
									>
										<div className="flex animate-counter-rotate flex-col items-center">
											<div
												className={`flex size-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} font-bold text-white shadow-lg transition-transform hover:scale-125 sm:size-14`}
											>
												<span className="text-xs sm:text-sm">
													{getInitials(item.name)}
												</span>
											</div>

											{/* Hover Tooltip Card */}
											<div className="pointer-events-none absolute bottom-16 z-30 w-56 -translate-x-1/2 rounded-2xl border border-white/20 bg-background/95 p-3.5 opacity-0 shadow-2xl backdrop-blur-xl transition-all group-hover/item:pointer-events-auto group-hover/item:opacity-100 sm:w-64">
												<div className="flex items-center justify-between">
													<p className="font-bold text-foreground text-xs">
														{item.name}
													</p>
													<div className="flex text-amber-400">
														{[1, 2, 3, 4, 5]
															.slice(0, item.rating)
															.map((star) => (
																<StarIcon
																	key={`star-${item.id}-${star}`}
																	weight="fill"
																	className="size-3"
																/>
															))}
													</div>
												</div>
												<p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
													"{item.description}"
												</p>
												<p className="mt-1 font-medium text-[10px] text-primary">
													{item.date}
												</p>
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>

			{/* POPUP MODAL DIALOG */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
					<div className="relative w-full max-w-lg rounded-3xl border border-primary/30 bg-background/95 p-8 shadow-2xl backdrop-blur-2xl">
						<button
							type="button"
							onClick={() => setIsModalOpen(false)}
							className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							<XIcon className="size-5" />
						</button>

						{isSubmitted ? (
							<div className="flex flex-col items-center py-8 text-center">
								<div className="flex size-16 animate-bounce items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
									<UserCheckIcon weight="bold" className="size-8" />
								</div>
								<h3 className="mt-4 font-bold text-foreground text-xl">
									Thank You!
								</h3>
								<p className="mt-2 text-muted-foreground text-sm">
									Your review has been saved to Supabase and joined the
									showcase!
								</p>
							</div>
						) : (
							<div>
								<div className="flex items-center gap-3 border-border/60 border-b pb-4">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
										<PaperPlaneIcon weight="fill" className="size-6" />
									</div>
									<div>
										<h3 className="font-bold text-foreground text-xl">
											Give Your Feedback
										</h3>
										<p className="text-muted-foreground text-xs">
											Fill out your name, rating, and review to join the circle!
										</p>
									</div>
								</div>

								<form onSubmit={handleSubmit} className="mt-6 space-y-4">
									<div>
										<label
											htmlFor="modal-name"
											className="block font-semibold text-foreground text-xs"
										>
											Your Name
										</label>
										<input
											id="modal-name"
											type="text"
											required
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Enter your name"
											className="mt-1.5 w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground text-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
										/>
									</div>

									<div>
										<label
											htmlFor="modal-email"
											className="block font-semibold text-foreground text-xs"
										>
											Your Email (Gmail)
										</label>
										<input
											id="modal-email"
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="your.email@gmail.com"
											className="mt-1.5 w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground text-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
										/>
									</div>

									<div>
										<span className="block font-semibold text-foreground text-xs">
											Rating
										</span>
										<div className="mt-1.5 flex items-center gap-1.5">
											{[1, 2, 3, 4, 5].map((star) => (
												<button
													key={star}
													type="button"
													onClick={() => setRating(star)}
													onMouseEnter={() => setHoverRating(star)}
													onMouseLeave={() => setHoverRating(0)}
													className="p-1 transition-transform hover:scale-125 focus:outline-none"
												>
													<StarIcon
														weight="fill"
														className={`size-7 ${
															star <= (hoverRating || rating)
																? "text-amber-400"
																: "text-muted-foreground/30"
														}`}
													/>
												</button>
											))}
											<span className="ml-2 font-bold text-muted-foreground text-sm">
												{rating} / 5
											</span>
										</div>
									</div>

									<div>
										<label
											htmlFor="modal-description"
											className="block font-semibold text-foreground text-xs"
										>
											Feedback / Review
										</label>
										<textarea
											id="modal-description"
											required
											rows={3}
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Share your thoughts about rbuilder..."
											className="mt-1.5 w-full rounded-xl border border-border bg-muted/40 p-3.5 text-foreground text-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
										/>
									</div>

									<button
										type="submit"
										className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 font-bold text-sm text-white shadow-primary/25 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
									>
										<PaperPlaneIcon weight="fill" className="size-4" />
										<span>Submit Feedback to Supabase</span>
									</button>
								</form>
							</div>
						)}
					</div>
				</div>
			)}
		</section>
	);
}
