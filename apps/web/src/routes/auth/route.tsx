import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createNoindexFollowMeta } from "@/libs/seo";

export const Route = createFileRoute("/auth")({
	component: AuthLayout,
	head: () => ({
		meta: [createNoindexFollowMeta()],
	}),
});

function AuthLayout() {
	return <Outlet />;
}
