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
 * Creates an authentic Razorpay Order via backend serverless endpoint
 */
export async function createDirectRazorpayOrder(params: {
	plan: SubscriptionPlanOption;
	userEmail: string;
	userName: string;
	userPhone?: string;
}): Promise<string | null> {
	try {
		const res = await fetch("/api/create-order", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				planId: params.plan.id,
				userEmail: params.userEmail,
				userName: params.userName,
				userPhone: params.userPhone,
			}),
		});

		if (res.ok) {
			const data = (await res.json()) as { id?: string };
			return data.id || null;
		}
	} catch (e) {
		console.warn("Direct order creation note:", e);
	}
	return null;
}

/**
 * Creates a dynamic multi-use Razorpay payment link on the fly
 */
export async function createDynamicPaymentLink(params: {
	plan: SubscriptionPlanOption;
	userEmail: string;
	userName: string;
	userPhone?: string;
}): Promise<string | null> {
	try {
		const res = await fetch("/api/create-link", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				planId: params.plan.id,
				userEmail: params.userEmail,
				userName: params.userName,
				userPhone: params.userPhone,
			}),
		});

		if (res.ok) {
			const data = (await res.json()) as { short_url?: string };
			return data.short_url || null;
		}
	} catch (e) {
		console.warn("Dynamic payment link creation note:", e);
	}
	return null;
}

/**
 * Initiates Razorpay Live Checkout payment via reliable hosted checkout
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
	try {
		const dynamicLink = await createDynamicPaymentLink(params);
		const paymentUrl = dynamicLink || params.plan.paymentLink;

		if (typeof window !== "undefined") {
			window.location.href = paymentUrl;
		}
	} catch (e) {
		if (typeof window !== "undefined") {
			window.location.href = params.plan.paymentLink;
		}
	}
}
