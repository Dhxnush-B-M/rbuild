import { fileURLToPath } from "node:url";
// @boundaries-ignore root shared Vitest config
import { createVitestProjectConfig } from "../../vitest.shared";

const config = createVitestProjectConfig({
	name: "@rbuilder/pdf",
	dirname: fileURLToPath(new URL(".", import.meta.url)),
});

export default { ...config, oxc: { jsx: { runtime: "automatic" as const } } };
