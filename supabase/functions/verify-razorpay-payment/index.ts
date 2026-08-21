import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyRequest {
	razorpay_order_id?: string;
	razorpay_payment_id: string;
	razorpay_signature?: string;
	userEmail: string;
	userName?: string;
	userPhone?: string;
	planId?: string;
	amount?: number;
}

/**
 * Validates HMAC SHA-256 signature using native Web Crypto API in Deno
 */
async function verifyRazorpaySignature(
	orderId: string,
	paymentId: string,
	secret: string,
	signature: string,
): Promise<boolean> {
	if (!orderId || !paymentId || !secret || !signature) return false;

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const text = `${orderId}|${paymentId}`;
	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(text),
	);

	const hashArray = Array.from(new Uint8Array(signatureBuffer));
	const calculatedHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return calculatedHex.toLowerCase() === signature.toLowerCase();
}

Deno.serve(async (req: Request) => {
	// Handle preflight OPTIONS
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const keySecret =
			Deno.env.get("RAZORPAY_KEY_SECRET") || "1nfd1EuEwzsuS1cYJtn5su6q";
		const supabaseUrl =
			Deno.env.get("SUPABASE_URL") ||
			"https://auxppvofumzpvpzvgfdw.supabase.co";
		const supabaseServiceKey =
			Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eHBwdm9mdW16cHZwenZnZmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjAyNDE1NCwiZXhwIjoyMTAxNjAwMTU0fQ.qbIm37eysTiWY31cWlz51JORwg38LEcTnPG0igkThcE";

		const body = (await req.json().catch(() => ({}))) as VerifyRequest;
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			userEmail,
			userName,
			userPhone,
			planId,
			amount,
		} = body;

		if (!razorpay_payment_id || !userEmail) {
			return new Response(
				JSON.stringify({
					error: "Missing required fields (razorpay_payment_id, userEmail)",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		// Verify signature if order_id and signature are provided
		if (razorpay_order_id && razorpay_signature) {
			const isValid = await verifyRazorpaySignature(
				razorpay_order_id,
				razorpay_payment_id,
				keySecret,
				razorpay_signature,
			);

			if (!isValid) {
				console.error("Razorpay signature verification failed!");
				return new Response(
					JSON.stringify({ error: "Invalid Razorpay payment signature" }),
					{
						status: 400,
						headers: { ...corsHeaders, "Content-Type": "application/json" },
					},
				);
			}
		}

		// Activate user profile in Supabase Database using admin client
		const supabase = createClient(supabaseUrl, supabaseServiceKey);
		const cleanEmail = userEmail.trim().toLowerCase();
		const planAmount = amount || (planId === "3_months" ? 21 : 11);

		const expiryDate = new Date();
		if (planId === "3_months") {
			expiryDate.setMonth(expiryDate.getMonth() + 3);
		} else if (planId === "6_months") {
			expiryDate.setMonth(expiryDate.getMonth() + 6);
		} else if (planId === "1_year") {
			expiryDate.setFullYear(expiryDate.getFullYear() + 1);
		} else {
			expiryDate.setMonth(expiryDate.getMonth() + 1);
		}

		const { data, error } = await supabase
			.from("profiles")
			.upsert(
				{
					email: cleanEmail,
					name: userName || "Resume Creator",
					username:
						(userName || cleanEmail.split("@")[0] || "user")
							.toLowerCase()
							.replace(/\s+/g, "-"),
					phone: userPhone || "",
					subscription_status: "active",
					subscription_plan: planId || "1_month",
					subscription_amount: planAmount,
					subscription_expires_at: expiryDate.toISOString(),
					payment_id: razorpay_payment_id,
					onboarding_completed: true,
					updated_at: new Date().toISOString(),
				},
				{ onConflict: "email" },
			)
			.select()
			.single();

		if (error) {
			console.error("Error activating profile in Supabase:", error);
			return new Response(
				JSON.stringify({
					error: "Failed to update profile in database",
					details: error.message,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: "Payment verified and Pro subscription activated successfully",
				profile: data,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("verify-razorpay-payment unexpected error:", message);
		return new Response(
			JSON.stringify({ error: "Internal server error", details: message }),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	}
});
