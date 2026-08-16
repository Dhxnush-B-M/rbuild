export interface RazorpayOptions {
	key: string;
	amount: number; // in currency sub-units (e.g. paise for INR)
	currency: string;
	name: string;
	description: string;
	image?: string;
	recurring?: boolean;
	notes?: Record<string, string>;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
		method?: string;
	};
	theme?: {
		color?: string;
	};
	handler: (response: {
		razorpay_payment_id: string;
		razorpay_order_id?: string;
		razorpay_signature?: string;
		razorpay_subscription_id?: string;
	}) => void;
	modal?: {
		ondismiss?: () => void;
	};
}

declare global {
	interface Window {
		Razorpay?: new (
			options: RazorpayOptions,
		) => {
			open: () => void;
			on: (event: string, callback: (response: unknown) => void) => void;
		};
	}
}

/**
 * Dynamically loads the Razorpay checkout.js script
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

		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

export type SubscriptionPlan = {
	id: "1_month" | "3_months";
	name: string;
	durationText: string;
	billingCycleText: string;
	durationMonths: number;
	amountInRupees: number;
	amountInPaise: number;
	badge?: string;
	isAutoPay: boolean;
	features: string[];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
	{
		id: "1_month",
		name: "1 Month Pro (AutoPay)",
		durationText: "1 Month",
		billingCycleText: "₹11 / month AutoPay",
		durationMonths: 1,
		amountInRupees: 11,
		amountInPaise: 1100, // ₹11 in paise
		badge: "UPI AutoPay",
		isAutoPay: true,
		features: [
			"Auto-renews at ₹11/month",
			"UPI AutoPay & Card Mandate",
			"Unlimited ATS resumes & PDF/Word exports",
			"Cancel anytime with 1-click in dashboard",
			"Full template gallery access",
		],
	},
	{
		id: "3_months",
		name: "3 Months Pro (AutoPay)",
		durationText: "3 Months",
		billingCycleText: "₹20 / 3 months AutoPay",
		durationMonths: 3,
		amountInRupees: 20,
		amountInPaise: 2000, // ₹20 in paise
		badge: "Best Value • AutoPay",
		isAutoPay: true,
		features: [
			"Auto-renews at ₹20 every 3 months",
			"UPI AutoPay (Save 40%)",
			"All Pro features & priority customer support",
			"Cancel anytime with 1-click in dashboard",
			"Free future template updates",
		],
	},
];

/**
 * Initiates Razorpay Live AutoPay Checkout payment popup
 */
export async function initiateRazorpayPayment(params: {
	plan: SubscriptionPlan;
	userName: string;
	userEmail: string;
	userPhone: string;
	customKeyId?: string;
	onSuccess: (paymentId: string) => void;
	onDismiss?: () => void;
	onError?: (error: string) => void;
}) {
	const loaded = await loadRazorpayScript();
	if (!loaded || !window.Razorpay) {
		params.onError?.("Failed to load Razorpay payment gateway. Please check your internet connection.");
		return;
	}

	const key = params.customKeyId || (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || "rzp_live_default_key";

	const options: RazorpayOptions = {
		key,
		amount: params.plan.amountInPaise,
		currency: "INR",
		name: "rbuilder Pro AutoPay",
		description: `${params.plan.name} - ${params.plan.billingCycleText}`,
		image: "https://api.dicebear.com/7.x/shapes/svg?seed=rbuilder",
		recurring: true,
		notes: {
			plan_id: params.plan.id,
			plan_name: params.plan.name,
			autopay: "enabled",
			billing_cycle: params.plan.durationText,
		},
		prefill: {
			name: params.userName,
			email: params.userEmail,
			contact: params.userPhone,
		},
		theme: {
			color: "#EA580C", // Vibrant orange/amber
		},
		handler: (response) => {
			const paymentOrSubId = response.razorpay_subscription_id || response.razorpay_payment_id;
			if (paymentOrSubId) {
				params.onSuccess(paymentOrSubId);
			} else {
				params.onError?.("Payment response was incomplete.");
			}
		},
		modal: {
			ondismiss: () => {
				params.onDismiss?.();
			},
		},
	};

	try {
		const rzp = new window.Razorpay(options);
		rzp.open();
	} catch (e) {
		params.onError?.(e instanceof Error ? e.message : "Error initiating Razorpay AutoPay checkout.");
	}
}
