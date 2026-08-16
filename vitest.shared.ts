import { defineConfig } from "vitest/config";

export function createVitestProjectConfig(options: {
	name: string;
	dirname: string;
	plugins?: unknown[];
	resolve?: unknown;
}) {
	return defineConfig({
		plugins: options.plugins as never,
		resolve: options.resolve as never,
		test: {
			name: options.name,
			root: options.dirname,
			passWithNoTests: true,
			environment: "happy-dom",
		},
	});
}
