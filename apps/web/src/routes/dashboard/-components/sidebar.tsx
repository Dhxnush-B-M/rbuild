import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	GlobeIcon,
	HeadsetIcon,
	LockSimpleIcon,
	ReadCvLogoIcon,
} from "@phosphor-icons/react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@rbuilder/ui/components/avatar";
import { BrandIcon } from "@rbuilder/ui/components/brand-icon";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "@rbuilder/ui/components/sidebar";
import { getInitials } from "@rbuilder/utils/string";
import { Link } from "@tanstack/react-router";
import { UserDropdownMenu } from "@/features/user/dropdown-menu";

type SidebarItem = {
	icon: React.ReactNode;
	label: MessageDescriptor;
	href: React.ComponentProps<typeof Link>["to"];
	isLocked?: boolean;
};

const appSidebarItems = [
	{
		icon: <ReadCvLogoIcon />,
		label: msg`Resumes`,
		href: "/dashboard/resumes",
	},
	{
		icon: <GlobeIcon />,
		label: msg`Portfolio`,
		href: "/dashboard/portfolio",
		isLocked: true,
	},
	{
		icon: <HeadsetIcon />,
		label: msg`Customer Support`,
		href: "/dashboard/support",
	},
] as const satisfies SidebarItem[];

type SidebarItemListProps = {
	items: readonly SidebarItem[];
};

function SidebarItemList({ items }: SidebarItemListProps) {
	const { i18n } = useLingui();

	return (
		<SidebarMenu>
			{items.map((item) => (
				<SidebarMenuItem key={item.href}>
					<SidebarMenuButton
						title={i18n.t(item.label)}
						render={
							<Link
								to={item.href}
								activeProps={{ className: "bg-sidebar-accent" }}
								className="flex items-center justify-between"
							>
								<div className="flex items-center gap-2">
									{item.icon}
									<span className="shrink-0 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:-ms-8 group-data-[collapsible=icon]:opacity-0">
										{i18n.t(item.label)}
									</span>
								</div>

								{item.isLocked && (
									<LockSimpleIcon
										weight="bold"
										className="size-3.5 text-muted-foreground/70 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:hidden"
									/>
								)}
							</Link>
						}
					/>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}

export function DashboardSidebar() {
	const { i18n } = useLingui();

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							className="h-auto justify-center"
							render={
								<Link to="/">
									<BrandIcon variant="icon" className="size-6" />
									<h1 className="sr-only">rbuilder</h1>
								</Link>
							}
						/>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent aria-label={i18n.t(msg`Dashboard`)} role="navigation">
				<SidebarGroup>
					<SidebarGroupLabel>
						<Trans>App</Trans>
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarItemList items={appSidebarItems} />
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarSeparator />

			<SidebarFooter className="gap-y-0">
				<SidebarMenu>
					<SidebarMenuItem>
						<UserDropdownMenu>
							{({ session }) => {
								const user = session?.user ?? {
									name: "Builder User",
									email: "user@example.com",
									image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
								};
								return (
									<SidebarMenuButton className="h-auto gap-x-3 group-data-[collapsible=icon]:p-1!">
										<Avatar className="size-8 shrink-0 transition-all group-data-[collapsible=icon]:size-6">
											<AvatarImage src={user.image ?? undefined} />
											<AvatarFallback className="group-data-[collapsible=icon]:text-[0.5rem]">
												{getInitials(user.name)}
											</AvatarFallback>
										</Avatar>

										<div className="transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:-ms-8 group-data-[collapsible=icon]:opacity-0">
											<p className="font-medium">{user.name}</p>
											<p className="text-muted-foreground text-xs">
												{user.email}
											</p>
										</div>
									</SidebarMenuButton>
								);
							}}
						</UserDropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
