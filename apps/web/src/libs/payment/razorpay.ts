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
		name: "1 Month Pro Plan",
		durationText: "1 Month Access",
		amountInRupees: 11,
		amountInPaise: 1100,
		paymentLink: "https://rzp.io/rzp/p19j1zk",
	},
	{
		id: "3_months",
		name: "3 Months Pro Plan",
		durationText: "3 Months Access",
		amountInRupees: 21,
		amountInPaise: 2100,
		paymentLink: "https://rzp.io/rzp/2lKAJoA",
		popular: true,
		badge: "Best Value",
	},
];

/**
 * Initiates Razorpay Live Checkout payment modal
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
	const loaded = await loadRazorpayScript();
	if (!loaded || !window.Razorpay) {
		params.onError?.(
			"Unable to load payment gateway. Please check your internet connection.",
		);
		return;
	}

	const key =
		params.customKeyId ||
		(import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
		"";

	if (!key) {
		params.onError?.(
			"Razorpay Key ID is missing. Please configure VITE_RAZORPAY_KEY_ID in your environment variables.",
		);
		return;
	}

	const cleanPhone = (params.userPhone || "").replace(/[^0-9]/g, "");

	const options: RazorpayOptions = {
		key,
		amount: params.plan.amountInPaise,
		currency: "INR",
		name: "rbuilder",
		description: `Payment for ${params.plan.name}`,
		image: "https://rbuilder.space/apple-touch-icon-180x180.png",
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
		handler: (response) => {
			const paymentId = response.razorpay_payment_id;
			if (paymentId) {
				params.onSuccess(paymentId);
			} else {
				params.onError?.("No payment ID received.");
			}
		},
	};

	try {
		const rzp = new window.Razorpay(options);
		rzp.open();
	} catch (e) {
		params.onError?.(
			e instanceof Error ? e.message : "Error initiating checkout.",
		);
	}
}
