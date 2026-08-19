export const onRequestPost: PagesFunction = async (context) => {
	const keyId = "rzp_live_TRXEpVGtuAA9yX";
	const keySecret = "1nfd1EuEwzsuS1cYJtn5su6q";

	try {
		const body = (await context.request.json().catch(() => ({}))) as {
			planId?: string;
			userEmail?: string;
			userName?: string;
			userPhone?: string;
		};

		const planId = body.planId || "1_month";
		const amount = planId === "3_months" ? 2100 : 1100;
		const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

		const auth = btoa(`${keyId}:${keySecret}`);
		const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
			method: "POST",
			headers: {
				Authorization: `Basic ${auth}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount,
				currency: "INR",
				receipt,
				notes: {
					userEmail: body.userEmail || "",
					userName: body.userName || "",
					planId,
				},
			}),
		});

		const data = await rzpRes.json();
		return new Response(JSON.stringify(data), {
			status: rzpRes.status,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		return new Response(JSON.stringify({ error: msg }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
};

export const onRequestOptions: PagesFunction = async () => {
	return new Response("ok", {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
		},
	});
};
