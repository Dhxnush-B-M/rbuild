// Supabase Edge Function: verify-razorpay-payment
// Cryptographically verifies Razorpay payment signatures and activates Pro subscriptions in Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";

const RAZORPAY_KEY_ID =
	Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_TRIg5Ldvfs8ouy";
const RAZORPAY_KEY_SECRET =
	Deno.env.get("RAZORPAY_KEY_SECRET") || "UixGiGOA56S9qHTfOFODvx8s";
const SUPABASE_URL =
	Deno.env.get("SUPABASE_URL") || "https://auxppvofumzpvpzvgfdw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eHBwdm9mdW16cHZwenZnZmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjAyNDE1NCwiZXhwIjoyMTAxNjAwMTU0fQ.qbIm37eysTiWY31cWlz51JORwg38LEcTnPG0igkThcE";

/**
 * Computes HMAC SHA256 hex digest using Web Crypto API
 */
async function computeHmacSha256(secret: string, message: string): Promise<string> {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret);
	const messageData = encoder.encode(message);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyData,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		messageData,
	);

	const hashArray = Array.from(new Uint8Array(signatureBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
	// Handle CORS preflight request
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const body = await req.json();
		const {
			razorpay_payment_id,
			razorpay_order_id,
			razorpay_signature,
			email,
			name,
			phone,
			planId = "1_month",
			amount = 11,
		} = body;

		if (!razorpay_payment_id) {
			return new Response(
				JSON.stringify({ error: "Missing razorpay_payment_id" }),
				{ status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
			);
		}

		let isVerified = false;

		// 1. If order_id and signature are provided, verify cryptographic HMAC signature
		if (razorpay_order_id && razorpay_signature) {
			const expectedSignature = await computeHmacSha256(
				RAZORPAY_KEY_SECRET,
				`${razorpay_order_id}|${razorpay_payment_id}`,
			);

			if (expectedSignature.toLowerCase() === razorpay_signature.toLowerCase()) {
				isVerified = true;
			}
		}

		// 2. Direct API verification with Razorpay to ensure payment is captured
		if (!isVerified) {
			const authString = `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`;
			const basicAuth = btoa(authString);

			const verifyRes = await fetch(
				`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
				{
					headers: {
						Authorization: `Basic ${basicAuth}`,
					},
				},
			);

			if (verifyRes.ok) {
				const paymentDetails = await verifyRes.json();
				if (
					paymentDetails.status === "captured" ||
					paymentDetails.status === "authorized"
				) {
					isVerified = true;
				}
			}
		}

		if (!isVerified) {
			return new Response(
				JSON.stringify({ error: "Invalid payment signature or uncaptured payment." }),
				{ status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
			);
		}

		// Initialize Supabase Admin client with Service Role Key
		const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
			},
		});

		const userEmail = (email || "").trim().toLowerCase();
		const userName = (name || "").trim() || "Resume Creator";
		const userPhone = (phone || "").trim();

		// Update or Insert profile in Supabase
		const { data: existingProfile } = await supabaseAdmin
			.from("profiles")
			.select("id, email")
			.eq("email", userEmail)
			.maybeSingle();

		const profileData = {
			id: existingProfile?.id || userEmail,
			email: userEmail,
			name: userName,
			username: userName.toLowerCase().replace(/\s+/g, "-"),
			phone: userPhone,
			subscription_status: "active",
			subscription_plan: planId,
			subscription_amount: Number(amount),
			payment_id: razorpay_payment_id,
			onboarding_completed: true,
			updated_at: new Date().toISOString(),
		};

		const { error: upsertError } = await supabaseAdmin
			.from("profiles")
			.upsert(profileData, { onConflict: "email" });

		if (upsertError) {
			console.error("Supabase upsert profile error:", upsertError);
			return new Response(
				JSON.stringify({ error: "Failed to update profile in database", details: upsertError }),
				{ status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: "Payment successfully verified! Pro subscription activated.",
				profile: profileData,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Internal error in verify-razorpay-payment:", error);
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
