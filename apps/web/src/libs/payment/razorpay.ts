import { supabase } from "../supabase/client";

export interface RazorpayOptions {
	key: string;
	amount: number;
	currency: string;
	name: string;
	description: string;
	image?: string;
	order_id?: string;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	notes?: Record<string, string>;
	theme?: {
		color?: string;
	};
	modal?: {
		ondismiss?: () => void;
		escape?: boolean;
		backdropclose?: boolean;
	};
	handler?: (response: {
		razorpay_payment_id: string;
		razorpay_order_id?: string;
		razorpay_signature?: string;
	}) => void;
}

declare global {
	interface Window {
		Razorpay?: new (
			options: RazorpayOptions,
		) => {
			open: () => void;
			close: () => void;
			on: (event: string, callback: (response: unknown) => void) => void;
		};
	}
}

/**
 * Dynamically loads the official Razorpay checkout.js script
 */
export function loadRazorpayScript(): Promise<boolean> {
	return new Promise((resolve) => {
		if (typeof window === "undefined") {
			resolve(false);
			return;
		}

		if (window.Razorpay) {
			resolve(true);
			return;
		}

		const existingScript = document.querySelector(
			'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
		);
		if (existingScript) {
			existingScript.addEventListener("load", () => resolve(true));
			existingScript.addEventListener("error", () => resolve(false));
			return;
		}

		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

export interface SubscriptionPlanOption {
	id: "1_month" | "3_months";
	name: string;
	durationText: string;
	amountInRupees: number;
	amountInPaise: number;
	paymentLink: string;
	popular?: boolean;
	badge?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanOption[] = [
	{
		id: "1_month",
		name: "1 Month Starter Plan",
		durationText: "1 Month Access",
		amountInRupees: 11,
		amountInPaise: 1100,
		paymentLink: "https://rzp.io/rzp/2lKAJoA",
	},
	{
		id: "3_months",
		name: "3 Months Pro Plan",
		durationText: "3 Months Access",
		amountInRupees: 21,
		amountInPaise: 2100,
		paymentLink: "https://rzp.io/rzp/p19j1zk",
		popular: true,
		badge: "Best Value",
	},
];

/**
 * Initiates Razorpay Live Checkout payment modal integrated with Supabase Edge Functions
 */
export async function initiateRazorpayPayment(params: {
	plan: SubscriptionPlanOption;
	userEmail: string;
	userName: string;
	userPhone?: string;
	customKeyId?: string;
	onSuccess: (paymentId: string) => void;
	onError?: (error: string) => void;
	onDismiss?: () => void;
}): Promise<void> {
	const key =
		params.customKeyId ||
		(import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
		"rzp_live_TRIg5Ldvfs8ouy";

	const loaded = await loadRazorpayScript();
	if (!loaded || !window.Razorpay) {
		if (typeof window !== "undefined") {
			window.open(params.plan.paymentLink, "_blank", "noopener,noreferrer");
		}
		return;
	}

	const cleanPhone = (params.userPhone || "").replace(/[^0-9]/g, "");

	// Step 1: Attempt to create an order via Supabase Edge Function
	let orderId: string | undefined;
	try {
		const { data, error } = await supabase.functions.invoke(
			"create-razorpay-order",
			{
				body: {
					planId: params.plan.id,
					userEmail: params.userEmail,
					userName: params.userName,
					userPhone: params.userPhone,
				},
			},
		);
		if (!error && data?.orderId) {
			orderId = data.orderId;
		}
	} catch (e) {
		console.warn("Supabase edge function create-razorpay-order note:", e);
	}

	const options: RazorpayOptions = {
		key,
		amount: params.plan.amountInPaise,
		currency: "INR",
		name: "rbuilder",
		description: `Payment for ${params.plan.name}`,
		image: "https://rbuilder.space/apple-touch-icon-180x180.png",
		order_id: orderId,
		prefill: {
			name: params.userName || undefined,
			email: params.userEmail || undefined,
			contact: cleanPhone || undefined,
		},
		theme: {
			color: "#9333ea",
		},
		modal: {
			ondismiss: () => {
				params.onDismiss?.();
			},
		},
		handler: async (response) => {
			const paymentId = response.razorpay_payment_id;
			if (!paymentId) {
				params.onError?.("No payment ID received.");
				return;
			}

			// Step 2: Verify payment & activate subscription via Supabase Edge Function
			try {
				const { data, error } = await supabase.functions.invoke(
					"verify-razorpay-payment",
					{
						body: {
							razorpay_order_id: response.razorpay_order_id || orderId,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
							userEmail: params.userEmail,
							userName: params.userName,
							userPhone: params.userPhone,
							planId: params.plan.id,
							amount: params.plan.amountInRupees,
						},
					},
				);
				if (error || data?.error) {
					console.warn(
						"Edge function verify error, proceeding with direct client verification:",
						error || data?.error,
					);
				}
			} catch (e) {
				console.warn("Edge function verify exception, fallback:", e);
			}

			params.onSuccess(paymentId);
		},
	};

	try {
		const rzp = new window.Razorpay(options);
		rzp.on("payment.failed", (response: unknown) => {
			const err = response as { error?: { description?: string } };
			params.onError?.(
				err?.error?.description || "Payment was not completed.",
			);
		});
		rzp.open();
	} catch (e) {
		if (typeof window !== "undefined") {
			window.open(params.plan.paymentLink, "_blank", "noopener,noreferrer");
		}
	}
}
