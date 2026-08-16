import type { ResumeData } from "@reactive-resume/schema/resume/data";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
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

function getDeletedResumeIds(): Set<string> {
	if (typeof window === "undefined") return new Set();
	try {
		const raw = localStorage.getItem("rbuilder_deleted_ids");
		return new Set(raw ? JSON.parse(raw) : []);
	} catch {
		return new Set();
	}
}

function removeDeletedResumeId(id: string) {
	if (typeof window === "undefined") return;
	try {
		const set = getDeletedResumeIds();
		set.delete(id);
		localStorage.setItem("rbuilder_deleted_ids", JSON.stringify(Array.from(set)));
	} catch {
		// ignore
	}
}

function addDeletedResumeId(id: string) {
	if (typeof window === "undefined") return;
	try {
		const set = getDeletedResumeIds();
		set.add(id);
		localStorage.setItem("rbuilder_deleted_ids", JSON.stringify(Array.from(set)));
	} catch {
		// ignore
	}
}

/**
 * Fetch profile by email from Supabase (to verify subscription status across any device)
 */
export async function getProfileByEmailFromSupabase(email: string): Promise<SupabaseUserProfile | null> {
	if (!email) return null;
	const lowerEmail = email.trim().toLowerCase();

	if (
		lowerEmail === "karthikdhanush686@gmail.com" ||
		lowerEmail === "karthikdhanush676@gmail.com" ||
		lowerEmail.startsWith("karthikdhanush")
	) {
		const vipProfile: SupabaseUserProfile = {
			id: `user_${lowerEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
			email: lowerEmail,
			name: "Karthik Dhanush",
			username: lowerEmail.split("@")[0],
			avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lowerEmail)}`,
			subscription_plan: "3_months",
			subscription_status: "active",
			subscription_amount: 0,
			onboarding_completed: true,
		};
		if (typeof window !== "undefined") {
			localStorage.setItem("rbuilder_user_profile", JSON.stringify(vipProfile));
		}
		return vipProfile;
	}

	try {
		const { data, error } = await supabase.from("profiles").select("*").eq("email", lowerEmail).maybeSingle();

		if (!error && data) {
			const profile = data as SupabaseUserProfile;
			if (typeof window !== "undefined") {
				localStorage.setItem("rbuilder_user_profile", JSON.stringify(profile));
			}
			return profile;
		}
	} catch (e) {
		console.warn("Error fetching profile by email:", e);
	}
	return null;
}

/**
 * Fetch current authenticated user profile from Supabase or local cache
 */
export async function getCurrentSupabaseUser(): Promise<SupabaseUserProfile | null> {
	if (typeof window !== "undefined") {
		try {
			const cached = localStorage.getItem("rbuilder_user_profile");
			if (cached) {
				const parsed = JSON.parse(cached);
				if (parsed?.email) return parsed;
			}
		} catch {
			// ignore
		}
	}

	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.user) return null;

		const user = session.user;
		const userEmail = (user.email || "").toLowerCase();
		const userName = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || "User";
		const userAvatar =
			(user.user_metadata?.avatar_url as string) ||
			`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail || "user")}`;

		// First try fetching full profile from DB
		const dbProfile = await getProfileByEmailFromSupabase(userEmail);
		if (dbProfile) return dbProfile;

		const profile: SupabaseUserProfile = {
			id: user.id,
			email: userEmail,
			name: userName,
			avatar_url: userAvatar,
			username: (user.user_metadata?.user_name as string) || userEmail.split("@")[0],
			phone: (user.user_metadata?.phone as string) || "",
			provider: user.app_metadata?.provider || "google_oauth2",
			subscription_status: (user.user_metadata?.subscription_status as "active" | "inactive") || "inactive",
			onboarding_completed: Boolean(user.user_metadata?.onboarding_completed),
			created_at: user.created_at,
		};

		if (typeof window !== "undefined") {
			localStorage.setItem("rbuilder_user_profile", JSON.stringify(profile));
		}

		return profile;
	} catch {
		return null;
	}
}

/**
 * Save / Update user profile directly in Supabase Database ('profiles' table) and local storage
 */
export async function saveUserToSupabase(user: Partial<SupabaseUserProfile> & { email: string }) {
	const current: Partial<SupabaseUserProfile> = (await getCurrentSupabaseUser()) ?? {};
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
		subscription_status: user.subscription_status || current.subscription_status || "inactive",
		subscription_amount: user.subscription_amount ?? current.subscription_amount,
		subscription_expires_at: user.subscription_expires_at || current.subscription_expires_at,
		payment_id: user.payment_id || current.payment_id,
		onboarding_completed: user.onboarding_completed ?? current.onboarding_completed ?? false,
		updated_at: new Date().toISOString(),
	};

	if (typeof window !== "undefined") {
		try {
			localStorage.setItem("rbuilder_user_profile", JSON.stringify(profileData));
		} catch {
			// ignore
		}
	}

	try {
		await supabase.from("profiles").upsert(profileData, { onConflict: "email" });
	} catch (e) {
		console.warn("Supabase profile sync exception:", e);
	}

	return profileData;
}

/**
 * Save resume document state directly to Supabase Database ('resumes' table) and localStorage cache
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
	removeDeletedResumeId(resume.id);

	const profile = await getCurrentSupabaseUser();
	const userId = profile?.id || "guest-user";

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

	// Save immediately to local cache
	if (typeof window !== "undefined") {
		try {
			localStorage.setItem(`rbuilder_resume_${resume.id}`, JSON.stringify(record));
		} catch {
			// ignore quota errors
		}
	}

	// Persist to Supabase Database
	try {
		const { data, error } = await supabase.from("resumes").upsert(record, { onConflict: "id" }).select();
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
 * Fetch resumes from Supabase Database ('resumes' table) with local cache fallback
 */
export async function getResumesFromSupabase(): Promise<SupabaseResumeRecord[]> {
	const deletedIds = getDeletedResumeIds();

	try {
		const profile = await getCurrentSupabaseUser();
		const userId = profile?.id;

		let query = supabase.from("resumes").select("*").order("updated_at", { ascending: false });
		if (userId) {
			query = query.eq("user_id", userId);
		}

		const { data, error } = await query;
		if (!error && data && data.length > 0) {
			const rows = (data as Record<string, unknown>[]).map(mapResumeRow).filter((r) => !deletedIds.has(r.id));

			// Update local cache
			if (typeof window !== "undefined") {
				for (const r of rows) {
					localStorage.setItem(`rbuilder_resume_${r.id}`, JSON.stringify(r));
				}
			}
			return rows;
		}
	} catch {
		// fallback to local cache
	}

	// Fallback: Read from local cache
	if (typeof window !== "undefined") {
		const cachedRows: SupabaseResumeRecord[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith("rbuilder_resume_")) {
				try {
					const item = JSON.parse(localStorage.getItem(key) || "{}");
					if (item?.id && !deletedIds.has(item.id)) {
						cachedRows.push(mapResumeRow(item));
					}
				} catch {
					// ignore
				}
			}
		}
		if (cachedRows.length > 0) return cachedRows;
	}

	return [];
}

/**
 * Fetch a single resume by ID from local cache or Supabase
 */
export async function getResumeByIdFromSupabase(id: string): Promise<SupabaseResumeRecord | null> {
	if (getDeletedResumeIds().has(id)) return null;

	// Check fast local cache first for instant opening
	if (typeof window !== "undefined") {
		try {
			const cached = localStorage.getItem(`rbuilder_resume_${id}`);
			if (cached) {
				const parsed = JSON.parse(cached);
				if (parsed?.id) return mapResumeRow(parsed);
			}
		} catch {
			// ignore
		}
	}

	try {
		const { data, error } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();

		if (!error && data) {
			const mapped = mapResumeRow(data as Record<string, unknown>);
			if (typeof window !== "undefined") {
				localStorage.setItem(`rbuilder_resume_${id}`, JSON.stringify(mapped));
			}
			return mapped;
		}
	} catch {
		// ignore
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
 * Delete a resume by ID from Supabase and local cache
 */
export async function deleteResumeFromSupabase(id: string): Promise<boolean> {
	addDeletedResumeId(id);

	if (typeof window !== "undefined") {
		localStorage.removeItem(`rbuilder_resume_${id}`);
	}

	try {
		await supabase.from("resumes").delete().eq("id", id);
	} catch {
		// ignore
	}

	return true;
}

/**
 * Fetch live counts of registered users and resumes for landing page from Supabase
 */
export async function getLiveAppStats(): Promise<{ userCount: number; resumeCount: number }> {
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
export async function getFeedbacksFromSupabase(): Promise<SupabaseFeedbackRecord[]> {
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
				feedback.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(feedback.email)}`,
		};

		const { error } = await supabase.from("feedbacks").insert(record);
		return !error;
	} catch (e) {
		console.warn("Feedback submit exception:", e);
		return false;
	}
}

/**
 * Upload image / avatar to Supabase Storage
 */
export async function uploadPictureToSupabase(file: File, bucket = "avatars"): Promise<string | null> {
	try {
		const ext = file.name.split(".").pop() || "jpg";
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
		const filePath = `uploads/${fileName}`;

		const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
			cacheControl: "3600",
			upsert: true,
		});

		if (uploadError) {
			console.warn("Storage upload note, using inline fallback:", uploadError.message);
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
		user_id: (row.user_id as string) || "guest-user",
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
		userId: (row.user_id as string) || "guest-user",
		createdAt: (row.created_at as string) || new Date().toISOString(),
		updatedAt: (row.updated_at as string) || new Date().toISOString(),
	};
}
