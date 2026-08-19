// Supabase Edge Function: create-razorpay-order
// Creates a server-side verified order on Razorpay for subscription payments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RAZORPAY_KEY_ID =
	Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_TRIg5Ldvfs8ouy";
const RAZORPAY_KEY_SECRET =
	Deno.env.get("RAZORPAY_KEY_SECRET") || "UixGiGOA56S9qHTfOFODvx8s";

serve(async (req: Request) => {
	// Handle CORS preflight request
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const body = await req.json();
		const {
			planId = "1_month",
			amount = 11, // Amount in Rupees (₹11 or ₹21)
			currency = "INR",
			email,
			name,
			phone,
		} = body;

		// Convert rupees to paise (e.g., ₹11 -> 1100, ₹21 -> 2100)
		const amountInPaise = Math.round(Number(amount) * 100);
		const receiptId = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

		const authString = `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`;
		const basicAuth = btoa(authString);

		// Call Razorpay API to create the order
		const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${basicAuth}`,
			},
			body: JSON.stringify({
				amount: amountInPaise,
				currency: currency || "INR",
				receipt: receiptId,
				notes: {
					plan_id: planId,
					customer_email: email || "",
					customer_name: name || "",
					customer_phone: phone || "",
					platform: "rbuilder_web",
				},
			}),
		});

		const orderData = await razorpayResponse.json();

		if (!razorpayResponse.ok) {
			console.error("Razorpay order creation failed:", orderData);
			return new Response(
				JSON.stringify({
					error: orderData.error?.description || "Failed to create order on Razorpay",
					details: orderData,
				}),
				{
					status: razorpayResponse.status,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		// Return the created order to the client
		return new Response(
			JSON.stringify({
				success: true,
				orderId: orderData.id,
				amount: orderData.amount,
				currency: orderData.currency,
				keyId: RAZORPAY_KEY_ID,
				receipt: orderData.receipt,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Internal error in create-razorpay-order:", error);
		const err = error as Error;
		return new Response(
			JSON.stringify({
				error: err.message || "Internal Server Error",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	}
});
