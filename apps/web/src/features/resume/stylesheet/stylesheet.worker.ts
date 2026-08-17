/// <reference lib="webworker" />

import {
	analyzeStylesheet,
	compileStylesheet,
} from "@rbuilder/resume/stylesheet";
import { collectCompiledColorTokens } from "./color-tokens";
import type { CompileWorkerRequest, CompileWorkerResponse } from "./protocol";

self.addEventListener(
	"message",
	({ data }: MessageEvent<CompileWorkerRequest>) => {
		if (data.type !== "compile") return;
		const compiled = compileStylesheet(data.source);
		const diagnostics = compiled.program
			? [
					...compiled.diagnostics,
					...analyzeStylesheet(compiled.program, data.semanticTree),
				]
			: compiled.diagnostics;
		const response: CompileWorkerResponse = {
			type: "compile_result",
			requestId: data.requestId,
			editGeneration: data.editGeneration,
			program: compiled.program,
			diagnostics,
			colorTokens: collectCompiledColorTokens(
				data.source.text,
				compiled.program,
			),
		};
		self.postMessage(response);
	},
);
