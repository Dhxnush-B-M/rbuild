import { corsHeaders } from "../_shared/cors.ts";

interface OrderRequest {
	planId: "1_month" | "3_months";
	userEmail?: string;
	userName?: string;
	userPhone?: string;
}

const PLAN_AMOUNTS: Record<string, { amountInPaise: number; name: string }> = {
	"1_month": { amountInPaise: 1100, name: "1 Month Starter Plan" },
	"3_months": { amountInPaise: 2100, name: "3 Months Pro Plan" },
};

Deno.serve(async (req: Request) => {
	// Handle preflight OPTIONS
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const keyId =
			Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_TRXEpVGtuAA9yX";
		const keySecret =
			Deno.env.get("RAZORPAY_KEY_SECRET") || "1nfd1EuEwzsuS1cYJtn5su6q";

		if (!keyId || !keySecret) {
			return new Response(
				JSON.stringify({ error: "Razorpay credentials not configured" }),
				{
					status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		const body = (await req.json().catch(() => ({}))) as OrderRequest;
		const planId = body.planId || "1_month";
		const amount =
			planId === "3_months" ? 2100 : 1100; // In paise (₹21 or ₹11)
		const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

		// Call Razorpay API to create an authenticated order
		const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;
		const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
			method: "POST",
			headers: {
				Authorization: authHeader,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount,
				currency: "INR",
				receipt: receiptId,
				notes: {
					userEmail: body.userEmail || "",
					userName: body.userName || "",
					planId,
				},
			}),
		});

		if (!orderResponse.ok) {
			const errorText = await orderResponse.text();
			console.error("Razorpay order creation error:", errorText);
			return new Response(
				JSON.stringify({
					error: "Failed to create order on Razorpay",
					details: errorText,
				}),
				{
					status: orderResponse.status,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		const orderData = await orderResponse.json();

		return new Response(
			JSON.stringify({
				orderId: orderData.id,
				amount: orderData.amount,
				currency: orderData.currency,
				keyId,
				planId,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("Edge function unexpected error:", message);
		return new Response(
			JSON.stringify({ error: "Internal server error", details: message }),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	}
});
