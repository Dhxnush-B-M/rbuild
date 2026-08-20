import type { ResumeData } from "@rbuilder/schema/resume/data";
import { defaultResumeData } from "@rbuilder/schema/resume/default";
import { supabase } from "./client";

export interface SupabaseUserProfile {
	id: string;
	email: string;
	name?: string;
	avatar_url?: string;
	username?: string;
	phone?: string;
	provider?: string;
	subscription_plan?: "1_month" | "3_months";
	subscription_status?: "active" | "inactive" | "expired";
	subscription_amount?: number;
	subscription_expires_at?: string;
	payment_id?: string;
	onboarding_completed?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface SupabaseResumeRecord {
	id: string;
	user_id: string;
	name: string;
	slug: string;
	tags: string[];
	data: ResumeData;
	is_public: boolean;
	is_locked: boolean;
	has_password: boolean;
	created_at: string;
	updated_at: string;
	// compatibility aliases
	isPublic?: boolean;
	isLocked?: boolean;
	hasPassword?: boolean;
	userId?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface SupabaseFeedbackRecord {
	id: string;
	user_id?: string;
	user_name: string;
	user_email: string;
	avatar_url?: string;
	rating: number;
	comment: string;
	created_at: string;
}

/**
 * Fetch profile by email from Supabase (to verify subscription status across any device)
 */
export async function getProfileByEmailFromSupabase(
	email: string,
): Promise<SupabaseUserProfile | null> {
	if (!email) return null;
	const lowerEmail = email.trim().toLowerCase();

	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("email", lowerEmail)
			.maybeSingle();

		if (!error && data) {
			return data as SupabaseUserProfile;
		}
	} catch (e) {
		console.warn("Error fetching profile by email:", e);
	}
	return null;
}

/**
 * Fetch current authenticated user profile strictly from Supabase
 */
export async function getCurrentSupabaseUser(): Promise<SupabaseUserProfile | null> {
	try {
		// 1. Try Supabase Auth Session
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (session?.user?.email) {
			const user = session.user;
			const userEmail = (user.email || "").toLowerCase().trim();
			if (typeof window !== "undefined") {
				sessionStorage.setItem("rbuilder_auth_email", userEmail);
				localStorage.setItem("rbuilder_auth_email", userEmail);
			}

			const dbProfile = await getProfileByEmailFromSupabase(userEmail);
			if (dbProfile) return dbProfile;

			const profile: SupabaseUserProfile = {
				id: user.id,
				email: userEmail,
				name:
					(user.user_metadata?.full_name as string) ||
					(user.user_metadata?.name as string) ||
					userEmail.split("@")[0] ||
					"User",
				avatar_url:
					(user.user_metadata?.avatar_url as string) ||
					(user.user_metadata?.picture as string) ||
					`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail || "user")}`,
				username:
					(user.user_metadata?.user_name as string) || userEmail.split("@")[0],
				phone: (user.user_metadata?.phone as string) || "",
				provider: user.app_metadata?.provider || "google_oauth2",
				subscription_status:
					(user.user_metadata?.subscription_status as "active" | "inactive") ||
					"inactive",
				onboarding_completed: Boolean(user.user_metadata?.onboarding_completed),
				created_at: user.created_at,
			};

			return profile;
		}

		// 2. Check direct Google OAuth email in storage
		if (typeof window !== "undefined") {
			const storedEmail =
				sessionStorage.getItem("rbuilder_auth_email") ||
				localStorage.getItem("rbuilder_auth_email");

			if (storedEmail) {
				const dbProfile = await getProfileByEmailFromSupabase(storedEmail);
				if (dbProfile) return dbProfile;
			}
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Save / Update user profile directly in Supabase Database ('profiles' table)
 */
export async function saveUserToSupabase(
	user: Partial<SupabaseUserProfile> & { email: string },
) {
	const current: Partial<SupabaseUserProfile> =
		(await getCurrentSupabaseUser()) ?? {};
	const email = user.email.trim().toLowerCase();
	const userId = user.id || current.id || `user_${Date.now()}`;

	const profileData: SupabaseUserProfile = {
		id: userId,
		email,
		name: user.name || current.name || email.split("@")[0] || "User",
		avatar_url:
			user.avatar_url ||
			current.avatar_url ||
			`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
		username: user.username || current.username || email.split("@")[0],
		phone: user.phone || current.phone || "",
		provider: user.provider || current.provider || "google_oauth2",
		subscription_plan: user.subscription_plan || current.subscription_plan,
		subscription_status:
			user.subscription_status || current.subscription_status || "inactive",
		subscription_amount:
			user.subscription_amount ?? current.subscription_amount,
		subscription_expires_at:
			user.subscription_expires_at || current.subscription_expires_at,
		payment_id: user.payment_id || current.payment_id,
		onboarding_completed:
			user.onboarding_completed ?? current.onboarding_completed ?? false,
		updated_at: new Date().toISOString(),
	};

	try {
		await supabase
			.from("profiles")
			.upsert(profileData, { onConflict: "email" });
	} catch (e) {
		console.warn("Supabase profile sync exception:", e);
	}

	return profileData;
}

/**
 * Save resume document state directly to Supabase Database ('resumes' table)
 */
export async function saveResumeToSupabase(resume: {
	id: string;
	name: string;
	slug?: string;
	tags?: string[];
	data?: unknown;
	isPublic?: boolean;
	isLocked?: boolean;
	hasPassword?: boolean;
}): Promise<SupabaseResumeRecord> {
	const profile = await getCurrentSupabaseUser();
	const userId = profile?.id || "";

	const record = {
		id: resume.id,
		user_id: userId,
		name: resume.name,
		slug: resume.slug || resume.name.toLowerCase().replace(/\s+/g, "-"),
		tags: resume.tags || [],
		data: (resume.data as ResumeData) || defaultResumeData,
		is_public: resume.isPublic ?? true,
		is_locked: resume.isLocked ?? false,
		has_password: resume.hasPassword ?? false,
		updated_at: new Date().toISOString(),
	};

	// Persist directly to Supabase Database
	try {
		const { data, error } = await supabase
			.from("resumes")
			.upsert(record, { onConflict: "id" })
			.select();
		if (error) {
			console.error("Supabase resume save error:", error);
		} else if (data && data.length > 0) {
			return mapResumeRow(data[0] as Record<string, unknown>);
		}
	} catch (e) {
		console.warn("Supabase resume save exception:", e);
	}

	return mapResumeRow(record);
}

/**
 * Fetch resumes directly from Supabase Database ('resumes' table)
 */
export async function getResumesFromSupabase(): Promise<
	SupabaseResumeRecord[]
> {
	try {
		const profile = await getCurrentSupabaseUser();
		const userId = profile?.id;

		let query = supabase
			.from("resumes")
			.select("*")
			.order("updated_at", { ascending: false });
		if (userId) {
			query = query.eq("user_id", userId);
		}

		const { data, error } = await query;
		if (!error && data && data.length > 0) {
			return (data as Record<string, unknown>[]).map(mapResumeRow);
		}
	} catch (e) {
		console.warn("Error fetching resumes from Supabase:", e);
	}

	return [];
}

/**
 * Fetch a single resume by ID directly from Supabase
 */
export async function getResumeByIdFromSupabase(
	id: string,
): Promise<SupabaseResumeRecord | null> {
	try {
		const { data, error } = await supabase
			.from("resumes")
			.select("*")
			.eq("id", id)
			.maybeSingle();

		if (!error && data) {
			return mapResumeRow(data as Record<string, unknown>);
		}
	} catch (e) {
		console.warn("Error fetching resume by id:", e);
	}

	return null;
}

/**
 * Fetch a single resume by slug from Supabase
 */
export async function getResumeBySlugFromSupabase(
	slug: string,
	_username?: string,
): Promise<SupabaseResumeRecord | null> {
	try {
		const { data, error } = await supabase
			.from("resumes")
			.select("*")
			.eq("slug", slug)
			.eq("is_public", true)
			.maybeSingle();

		if (error || !data) return null;
		return mapResumeRow(data as Record<string, unknown>);
	} catch {
		return null;
	}
}

/**
 * Delete a resume by ID directly from Supabase
 */
export async function deleteResumeFromSupabase(id: string): Promise<boolean> {
	try {
		await supabase.from("resumes").delete().eq("id", id);
	} catch (e) {
		console.warn("Supabase resume delete error:", e);
	}

	return true;
}

/**
 * Fetch live counts of registered users and resumes for landing page from Supabase
 */
export async function getLiveAppStats(): Promise<{
	userCount: number;
	resumeCount: number;
}> {
	try {
		const [profilesRes, resumesRes] = await Promise.all([
			supabase.from("profiles").select("*", { count: "exact", head: true }),
			supabase.from("resumes").select("*", { count: "exact", head: true }),
		]);

		return {
			userCount: profilesRes.count ?? 0,
			resumeCount: resumesRes.count ?? 0,
		};
	} catch {
		return { userCount: 0, resumeCount: 0 };
	}
}

/**
 * Fetch feedbacks / testimonials from Supabase
 */
export async function getFeedbacksFromSupabase(): Promise<
	SupabaseFeedbackRecord[]
> {
	try {
		const { data, error } = await supabase
			.from("feedbacks")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(20);

		if (!error && data) {
			return data as SupabaseFeedbackRecord[];
		}
	} catch {
		// ignore
	}

	return [];
}

/**
 * Submit user feedback to Supabase
 */
export async function submitFeedbackToSupabase(feedback: {
	name: string;
	email: string;
	rating: number;
	comment: string;
	avatar_url?: string;
}): Promise<boolean> {
	try {
		const record = {
			user_name: feedback.name,
			user_email: feedback.email,
			rating: feedback.rating,
			comment: feedback.comment,
			avatar_url:
				feedback.avatar_url ||
				`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(feedback.email)}`,
		};

		const { error } = await supabase.from("feedbacks").insert(record);
		return !error;
	} catch (e) {
		console.warn("Feedback submit exception:", e);
		return false;
	}
}

/**
 * Submit callback request to Supabase
 */
export async function submitCallbackRequestToSupabase(request: {
	phone: string;
	reason: string;
	name?: string;
	email?: string;
}): Promise<boolean> {
	try {
		const profile = await getCurrentSupabaseUser();
		const record = {
			user_id: profile?.id || null,
			user_name: request.name || profile?.name || "User",
			user_email: request.email || profile?.email || "",
			phone: request.phone,
			reason: request.reason,
			status: "pending",
			created_at: new Date().toISOString(),
		};

		const { error } = await supabase.from("callback_requests").insert(record);
		if (!error) return true;

		// Fallback to feedbacks table if callback_requests table is created later
		await supabase.from("feedbacks").insert({
			user_id: profile?.id || null,
			user_name: `[CALLBACK] ${record.user_name} (${record.phone})`,
			user_email: record.user_email || "callback@rbuilder.space",
			comment: `Phone: ${record.phone}\nReason: ${record.reason}`,
			rating: 5,
		});
		return true;
	} catch (e) {
		console.warn("Callback request submit note:", e);
		return true;
	}
}

/**
 * Upload image / avatar to Supabase Storage
 */
export async function uploadPictureToSupabase(
	file: File,
	bucket = "avatars",
): Promise<string | null> {
	try {
		const ext = file.name.split(".").pop() || "jpg";
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
		const filePath = `uploads/${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: true,
			});

		if (uploadError) {
			console.warn(
				"Storage upload note, using inline fallback:",
				uploadError.message,
			);
			return await fileToDataUrl(file);
		}

		const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
		return data.publicUrl;
	} catch {
		return await fileToDataUrl(file);
	}
}

function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.readAsDataURL(file);
	});
}

function mapResumeRow(row: Record<string, unknown>): SupabaseResumeRecord {
	return {
		id: (row.id as string) || "",
		user_id: (row.user_id as string) || "",
		name: (row.name as string) || "Untitled",
		slug: (row.slug as string) || "",
		tags: (row.tags as string[]) || [],
		data: (row.data as ResumeData) || defaultResumeData,
		is_public: (row.is_public as boolean) ?? true,
		is_locked: (row.is_locked as boolean) ?? false,
		has_password: (row.has_password as boolean) ?? false,
		created_at: (row.created_at as string) || new Date().toISOString(),
		updated_at: (row.updated_at as string) || new Date().toISOString(),
		// Aliases
		isPublic: (row.is_public as boolean) ?? true,
		isLocked: (row.is_locked as boolean) ?? false,
		hasPassword: (row.has_password as boolean) ?? false,
		userId: (row.user_id as string) || "",
		createdAt: (row.created_at as string) || new Date().toISOString(),
		updatedAt: (row.updated_at as string) || new Date().toISOString(),
	};
}
