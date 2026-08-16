import z from "zod";

export const localeSchema = z.enum(["en-US"]);

export type Locale = z.infer<typeof localeSchema>;

export const defaultLocale: Locale = "en-US";

export function isLocale(value: unknown): value is Locale {
	return localeSchema.safeParse(value).success;
}

export function isCJKLocale(_locale?: string): boolean {
	return false;
}

export type Script = "hangul" | "kana" | "han-traditional" | "han-simplified" | "arabic" | "hebrew" | "thai";

export function isCjkScript(_script: Script): boolean {
	return false;
}

export function getLocaleScript(_locale?: string): Script | null {
	return null;
}

export function isRTL(_locale: string): boolean {
	return false;
}
