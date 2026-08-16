import { Outlet } from "@tanstack/react-router";
import { BrandIcon } from "@reactive-resume/ui/components/brand-icon";

export function AuthLayout() {
	return (
		<div className="fade-in-0 slide-in-from-top-4 mx-auto flex h-svh w-dvw max-w-sm animate-in flex-col justify-center gap-y-6 px-4 xs:px-0 duration-300 ease-(--ease-out-strong)">
			<div className="mb-2 flex justify-center">
				<BrandIcon variant="logo" />
			</div>

			<Outlet />
		</div>
	);
}
