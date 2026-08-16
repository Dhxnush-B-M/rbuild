import type { ResumeData } from "@reactive-resume/schema/resume/data";
import type { SupabaseResumeRecord } from "@/libs/supabase/db";
import {
	deleteResumeFromSupabase,
	getResumeByIdFromSupabase,
	getResumeBySlugFromSupabase,
	getResumesFromSupabase,
	saveResumeToSupabase,
	uploadPictureToSupabase,
} from "@/libs/supabase/db";

export type FeatureFlags = {
	disableEmailAuth: boolean;
	disableSignups: boolean;
	disableImageProcessing: boolean;
	disableApiRateLimit: boolean;
	showSponsors: boolean;
	allowUnsafeOAuthRedirectUri: boolean;
	allowUnsafeAiBaseUrl: boolean;
};

export const defaultFeatureFlags: FeatureFlags = {
	disableEmailAuth: false,
	disableSignups: false,
	disableImageProcessing: false,
	disableApiRateLimit: false,
	showSponsors: false,
	allowUnsafeOAuthRedirectUri: false,
	allowUnsafeAiBaseUrl: false,
};

export type RouterOutput = {
	resume: {
		list: SupabaseResumeRecord[];
		getById: SupabaseResumeRecord | null;
		getBySlug: SupabaseResumeRecord | null;
		update: SupabaseResumeRecord;
	};
};

export type RouterInput = {
	resume: {
		list: { tags?: string[]; sort?: string };
		getById: { id: string };
		getBySlug: { username: string; slug: string };
		update: { id: string; data: ResumeData };
	};
};

export const client = {
	flags: {
		get: (): Promise<FeatureFlags> => Promise.resolve(defaultFeatureFlags),
	},
	resume: {
		list: async (): Promise<SupabaseResumeRecord[]> => {
			return await getResumesFromSupabase();
		},
		getById: async ({ id }: { id: string }): Promise<SupabaseResumeRecord | null> => {
			return await getResumeByIdFromSupabase(id);
		},
		getBySlug: async ({
			slug,
			username,
		}: {
			slug: string;
			username?: string;
		}): Promise<SupabaseResumeRecord | null> => {
			return await getResumeBySlugFromSupabase(slug, username);
		},
		update: async ({ id, data }: { id: string; data: ResumeData }): Promise<SupabaseResumeRecord> => {
			return (await saveResumeToSupabase({
				id,
				name: data.basics?.name || "My Resume",
				data,
			})) as unknown as SupabaseResumeRecord;
		},
		delete: async ({ id }: { id: string }): Promise<boolean> => {
			return await deleteResumeFromSupabase(id);
		},
		lock: async ({ id, isLocked }: { id: string; isLocked: boolean }): Promise<SupabaseResumeRecord> => {
			return (await saveResumeToSupabase({ id, name: "Resume", isLocked })) as unknown as SupabaseResumeRecord;
		},
		import: async ({ data }: { data: ResumeData }): Promise<SupabaseResumeRecord> => {
			return (await saveResumeToSupabase({
				id: `resume_${Date.now()}`,
				name: data.basics?.name || "Imported Resume",
				data,
			})) as unknown as SupabaseResumeRecord;
		},
		restore: (_args: { resumeId: string; versionId: string }): Promise<null> => {
			return Promise.resolve(null);
		},
		stylesheet: {
			get: (_args: { id: string }): Promise<null> => Promise.resolve(null),
			update: (_args: { id: string }): Promise<null> => Promise.resolve(null),
		},
	},
	storage: {
		upload: async (file: File): Promise<string | null> => {
			return await uploadPictureToSupabase(file);
		},
		delete: (_args: { filename: string }): Promise<boolean> => {
			return Promise.resolve(true);
		},
	},
	auth: {
		verifyPassword: (_args: { username: string; slug: string; password: string }): Promise<boolean> => {
			return Promise.resolve(true);
		},
	},
};

export const streamClient = {
	resume: {
		updates: {
			subscribe: (_args: { id: string }) => {
				return (async function* () {
					// Empty async generator for subscription without hanging connections
				})();
			},
		},
	},
};

export const orpc = {
	flags: {
		get: {
			queryOptions: () => ({
				queryKey: ["flags"],
				queryFn: () => client.flags.get(),
			}),
		},
	},
	resume: {
		list: {
			queryOptions: (_args?: { input?: { tags?: string[]; sort?: string } }) => ({
				queryKey: ["resumes"],
				queryFn: () => getResumesFromSupabase(),
			}),
			call: () => getResumesFromSupabase(),
		},
		getById: {
			queryOptions: ({ input }: { input: { id: string } }) => ({
				queryKey: ["resume", input.id],
				queryFn: () => getResumeByIdFromSupabase(input.id),
			}),
			call: ({ id }: { id: string }) => getResumeByIdFromSupabase(id),
		},
		getBySlug: {
			queryOptions: ({ input }: { input: { username: string; slug: string } }) => ({
				queryKey: ["resume", "slug", input.slug],
				queryFn: () => getResumeBySlugFromSupabase(input.slug, input.username),
			}),
			call: ({ slug, username }: { slug: string; username?: string }) => getResumeBySlugFromSupabase(slug, username),
		},
		getStyleProjection: {
			queryOptions: (_args?: { input?: { username: string; slug: string }; enabled?: boolean }) => ({
				queryKey: ["styleProjection"],
				queryFn: () => null,
			}),
		},
		stylesheet: {
			get: {
				queryOptions: (_args?: { input?: { id: string } }) => ({
					queryKey: ["stylesheet"],
					queryFn: () => null,
				}),
				call: (_args?: { id: string }) => Promise.resolve(null),
			},
			update: {
				call: (_args?: { id: string }) => Promise.resolve(null),
			},
			mutate: {
				call: (
					mutation: { expectedRevision?: number; expectedRenderDataVersion?: number; editGeneration?: number },
					_options?: { signal?: AbortSignal },
				) =>
					Promise.resolve({
						stylesheet: {
							mode: "legacy" as const,
							source: { languageVersion: 1, text: "" },
							applied: { languageVersion: 1, text: "" },
						},
						revision: (mutation?.expectedRevision || 0) + 1,
						renderDataVersion: mutation?.expectedRenderDataVersion || 0,
						editGeneration: mutation?.editGeneration || 0,
						diagnostics: [],
					}),
			},
			getState: {
				call: (_args?: { id: string }) =>
					Promise.resolve({
						stylesheet: {
							mode: "legacy" as const,
							source: { languageVersion: 1, text: "" },
							applied: { languageVersion: 1, text: "" },
						},
						revision: 0,
						renderDataVersion: 0,
					}),
			},
		},
		update: {
			call: ({ id, data }: { id: string; data: ResumeData }) =>
				saveResumeToSupabase({ id, name: data.basics?.name || "My Resume", data }),
		},
		listVersions: {
			queryOptions: (_args?: { input?: { resumeId: string } }) => ({
				queryKey: ["versions"],
				queryFn: () => [] as Array<{ id: string; label: string; createdAt: string }>,
			}),
			queryKey: (_args?: { input?: { resumeId: string } }) => ["versions"],
		},
		restoreVersion: {
			mutationOptions: () => ({
				mutationFn: (_args: { resumeId: string; versionId: string }) => Promise.resolve(null),
			}),
		},
		delete: {
			call: ({ id }: { id: string }) => deleteResumeFromSupabase(id),
			mutationOptions: () => ({
				mutationFn: async ({ id }: { id: string }) => deleteResumeFromSupabase(id),
			}),
		},
		setLocked: {
			mutationOptions: () => ({
				mutationFn: async ({ id, isLocked }: { id: string; isLocked: boolean }) =>
					saveResumeToSupabase({ id, name: "Resume", isLocked }),
			}),
		},
		import: {
			call: ({ data }: { data: ResumeData }) => client.resume.import({ data }),
			mutationOptions: () => ({
				mutationFn: async ({ data }: { data: ResumeData }) => client.resume.import({ data }),
			}),
		},
		verifyPassword: {
			mutationOptions: () => ({
				mutationFn: (args: { username: string; slug: string; password: string }) => client.auth.verifyPassword(args),
			}),
		},
	},
	storage: {
		upload: {
			call: (file: File) => uploadPictureToSupabase(file),
		},
		uploadFile: {
			mutationOptions: (_options?: { meta?: { noInvalidate?: boolean } }) => ({
				mutationFn: async (file: File) => ({ url: await uploadPictureToSupabase(file) }),
			}),
		},
		delete: {
			call: (args: { filename: string }) => client.storage.delete(args),
		},
		deleteFile: {
			mutationOptions: (_options?: { meta?: { noInvalidate?: boolean } }) => ({
				mutationFn: (args: { filename: string }) => client.storage.delete(args),
			}),
		},
	},
	auth: {
		verifyPassword: {
			call: (args: { username: string; slug: string; password: string }) => client.auth.verifyPassword(args),
		},
	},
};
