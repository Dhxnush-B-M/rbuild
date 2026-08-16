import type { MessageDescriptor, Messages } from "@lingui/core";
import type { Locale } from "@rbuilder/utils/locale";
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import Cookies from "js-cookie";
import { defaultLocale, isLocale as isLocaleUtil, isRTL } from "@rbuilder/utils/locale";
// @ts-expect-error generated locale catalog
import { messages as compiledMessages } from "../../locales/en-US.mjs";

export { isRTL };

const extractMessages = (mod: unknown): Messages => {
	if (!mod || typeof mod !== "object") return {};
	if ("messages" in mod && mod.messages && typeof mod.messages === "object") {
		return mod.messages as Messages;
	}
	if ("default" in mod && mod.default && typeof mod.default === "object") {
		const def = mod.default as Record<string, unknown>;
		if ("messages" in def && def.messages && typeof def.messages === "object") {
			return def.messages as Messages;
		}
		return def as Messages;
	}
	return mod as Messages;
};

const enUSMessages: Messages = (compiledMessages as Messages) || extractMessages(compiledMessages);

const storageKey = "locale";

const relativeTimeDivisions: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
	{ amount: 31_536_000_000, unit: "year" },
	{ amount: 2_592_000_000, unit: "month" },
	{ amount: 604_800_000, unit: "week" },
	{ amount: 86_400_000, unit: "day" },
	{ amount: 3_600_000, unit: "hour" },
	{ amount: 60_000, unit: "minute" },
];

export const localeMap = {
	"en-US": msg`English`,
} satisfies Record<Locale, MessageDescriptor>;

export function isLocale(locale: string): locale is Locale {
	return isLocaleUtil(locale);
}

export const resolveLocale = (locale: string): Locale => {
	return isLocale(locale) ? locale : defaultLocale;
};

export function formatRelativeTime(value: Date | string, formatter: Intl.RelativeTimeFormat, invalidFallback?: string) {
	const date = value instanceof Date ? value : new Date(value);
	const diffMs = date.getTime() - Date.now();
	if (Number.isNaN(diffMs)) return invalidFallback ?? formatter.format(0, "second");

	const division = relativeTimeDivisions.find((candidate) => Math.abs(diffMs) >= candidate.amount);

	return division
		? formatter.format(Math.round(diffMs / division.amount), division.unit)
		: formatter.format(0, "second");
}

export const getLocale = () => {
	if (typeof window !== "undefined") {
		const locale = Cookies.get(storageKey);
		if (locale && locale !== defaultLocale) {
			Cookies.set(storageKey, defaultLocale);
		}
	}
	return defaultLocale;
};

export const getLocaleMessages = (_locale: string) => {
	return Promise.resolve({ locale: defaultLocale, messages: enUSMessages });
};

export const loadLocale = (_locale: string) => {
	i18n.load({
		"en-US": enUSMessages,
		en: enUSMessages,
	});
	i18n.activate(defaultLocale);
	return Promise.resolve();
};

// Immediately activate English locale synchronously with full English messages
i18n.load({
	"en-US": enUSMessages,
	en: enUSMessages,
});
i18n.activate(defaultLocale);

export const changeLocale = (value: string | null) => {
	if (!value || !isLocale(value)) return;
	Cookies.set(storageKey, value);
	window.location.reload();
};
