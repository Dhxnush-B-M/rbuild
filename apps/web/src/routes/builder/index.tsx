import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/builder/")({
	beforeLoad: () => {
		throw redirect({ to: "/builder/$resumeId", params: { resumeId: "demo" }, replace: true });
	},
});
