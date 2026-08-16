import type { Layout } from "react-resizable-panels";
import type { BuilderLayout } from "../-store/sidebar";
import { Trans } from "@lingui/react/macro";
import { Outlet } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { usePanelRef } from "react-resizable-panels";
import { ResizableGroup, ResizablePanel, ResizableSeparator } from "@reactive-resume/ui/components/resizable";
import { BuilderSidebarLeft } from "../-sidebar/left";
import { BuilderSidebarRight } from "../-sidebar/right";
import {
	mapPanelLayoutToBuilderLayout,
	setBuilderLayout,
	useBuilderSidebar,
	useBuilderSidebarStore,
} from "../-store/sidebar";
import { BuilderHeader } from "./header";

export type BuilderLayoutShellProps = {
	initialLayout: BuilderLayout;
};

export function DesktopBuilderShell({ initialLayout }: BuilderLayoutShellProps) {
	// Only rendered when `BuilderLayoutShell` has already decided we're on desktop, so sidebar sizing is unconditional.
	const canPersistLayoutRef = useRef(false);

	const leftSidebarRef = usePanelRef();
	const rightSidebarRef = usePanelRef();

	const setLeftSidebar = useBuilderSidebarStore((state) => state.setLeftSidebar);
	const setRightSidebar = useBuilderSidebarStore((state) => state.setRightSidebar);
	const setLayout = useBuilderSidebarStore((state) => state.setLayout);

	const { maxSidebarSize, minSidebarSize, collapsedSidebarSize, groupResizeBehavior } = useBuilderSidebar();

	useEffect(() => {
		setLayout(initialLayout);
		canPersistLayoutRef.current = true;
	}, [initialLayout, setLayout]);

	const onLayoutChanged = (layout: Layout) => {
		const nextLayout = mapPanelLayoutToBuilderLayout(layout);
		if (!canPersistLayoutRef.current) return;
		setLayout(nextLayout);
		setBuilderLayout(nextLayout);
	};

	useEffect(() => {
		if (!leftSidebarRef || !rightSidebarRef) return;

		setLeftSidebar(leftSidebarRef);
		setRightSidebar(rightSidebarRef);
	}, [leftSidebarRef, rightSidebarRef, setLeftSidebar, setRightSidebar]);

	const sidebarMinSize = `${minSidebarSize}px`;
	const sidebarCollapsedSize = `${collapsedSidebarSize}px`;
	const leftSidebarSize = `${initialLayout.left}%`;
	const rightSidebarSize = `${initialLayout.right}%`;
	const artboardSize = `${initialLayout.artboard}%`;

	return (
		<div className="relative flex h-svh flex-col overflow-hidden bg-background">
			{/* Ambient Fluid Water-Like Light Glow Reflections */}
			<div aria-hidden="true" className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-30">
				<div className="size-[800px] animate-pulse rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-indigo-600/20 blur-3xl" />
			</div>
			<div aria-hidden="true" className="pointer-events-none fixed top-10 left-1/4 opacity-25">
				<div className="size-[450px] rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-500/20 blur-3xl" />
			</div>
			<div aria-hidden="true" className="pointer-events-none fixed right-1/4 bottom-10 opacity-25">
				<div className="size-[500px] rounded-full bg-gradient-to-tl from-purple-500/20 to-pink-500/20 blur-3xl" />
			</div>

			<a
				href="#main-content"
				className="sr-only rounded-md bg-popover px-4 py-2 text-sm ring-2 ring-ring focus:not-sr-only focus:absolute focus:inset-s-2 focus:top-2 focus:z-[100]"
			>
				<Trans>Skip to main content</Trans>
			</a>

			<BuilderHeader />

			<ResizableGroup orientation="horizontal" className="relative z-10 mt-14 flex-1" onLayoutChanged={onLayoutChanged}>
				<ResizablePanel
					collapsible
					id="left"
					panelRef={leftSidebarRef}
					groupResizeBehavior={groupResizeBehavior}
					maxSize={maxSidebarSize}
					minSize={sidebarMinSize}
					collapsedSize={sidebarCollapsedSize}
					defaultSize={leftSidebarSize}
					className="z-20 h-[calc(100svh-3.5rem)] border-white/10 border-r backdrop-blur-2xl"
				>
					<BuilderSidebarLeft />
				</ResizablePanel>
				<ResizableSeparator withHandle className="z-50 border-white/10" />
				<ResizablePanel id="artboard" defaultSize={artboardSize} className="h-[calc(100svh-3.5rem)]">
					<main id="main-content" className="h-full">
						<Outlet />
					</main>
				</ResizablePanel>
				<ResizableSeparator withHandle className="z-50 border-white/10" />
				<ResizablePanel
					collapsible
					id="right"
					panelRef={rightSidebarRef}
					groupResizeBehavior={groupResizeBehavior}
					maxSize={maxSidebarSize}
					minSize={sidebarMinSize}
					collapsedSize={0}
					defaultSize={rightSidebarSize}
					className="z-20 h-[calc(100svh-3.5rem)] border-white/10 border-l backdrop-blur-2xl"
				>
					<BuilderSidebarRight />
				</ResizablePanel>
			</ResizableGroup>
		</div>
	);
}
