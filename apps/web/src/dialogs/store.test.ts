import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dialogSchemaRegistries, dialogTypeSchema } from "./schemas";
import { useDialogStore } from "./store";

describe("useDialogStore", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Reset store state between tests
		useDialogStore.setState({ open: false, activeDialog: null, onBeforeClose: null });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("openDialog", () => {
		it("uses schema entries from domain registries", () => {
			expect(dialogSchemaRegistries.map((registry) => registry.domain)).toEqual(["auth", "resume"]);
			expect(dialogTypeSchema.options).toHaveLength(
				dialogSchemaRegistries.reduce((total, registry) => total + registry.schemas.length, 0),
			);
		});

		it("opens a dialog and sets activeDialog", () => {
			useDialogStore.getState().openDialog("auth.change-password", undefined);

			const state = useDialogStore.getState();
			expect(state.open).toBe(true);
			expect(state.activeDialog?.type).toBe("auth.change-password");
		});

		it("clears any existing onBeforeClose handler", () => {
			useDialogStore.setState({ onBeforeClose: () => true });
			useDialogStore.getState().openDialog("resume.create", undefined);

			expect(useDialogStore.getState().onBeforeClose).toBeNull();
		});

		it("preserves dialog data for typed payloads", () => {
			const data = { id: "r1", name: "My Resume", slug: "my-resume", tags: [] };
			useDialogStore.getState().openDialog("resume.update", data);

			const active = useDialogStore.getState().activeDialog;
			expect(active?.type).toBe("resume.update");
			if (active?.type === "resume.update") {
				expect(active.data).toEqual(data);
			}
		});
	});

	describe("closeDialog", () => {
		it("immediately sets open to false", () => {
			useDialogStore.setState({
				open: true,
				activeDialog: { type: "auth.change-password", data: undefined },
			});

			useDialogStore.getState().closeDialog();
			expect(useDialogStore.getState().open).toBe(false);
		});

		it("clears activeDialog after animation timeout", () => {
			useDialogStore.setState({
				open: true,
				activeDialog: { type: "auth.change-password", data: undefined },
			});

			useDialogStore.getState().closeDialog();

			// Still present before timeout
			expect(useDialogStore.getState().activeDialog).not.toBeNull();

			// Cleared after ANIMATION_DURATION (150ms)
			vi.advanceTimersByTime(150);
			expect(useDialogStore.getState().activeDialog).toBeNull();
		});
	});

	describe("onBeforeClose guard", () => {
		it("calls onBeforeClose and prevents close when it returns false", () => {
			const guard = vi.fn().mockReturnValue(false);
			useDialogStore.setState({
				open: true,
				activeDialog: { type: "auth.change-password", data: undefined },
				onBeforeClose: guard,
			});

			useDialogStore.getState().closeDialog();

			expect(guard).toHaveBeenCalled();
			expect(useDialogStore.getState().open).toBe(true);
			expect(useDialogStore.getState().activeDialog).not.toBeNull();
		});

		it("allows close when onBeforeClose returns true", () => {
			const guard = vi.fn().mockReturnValue(true);
			useDialogStore.setState({
				open: true,
				activeDialog: { type: "auth.change-password", data: undefined },
				onBeforeClose: guard,
			});

			useDialogStore.getState().closeDialog();

			expect(guard).toHaveBeenCalled();
			expect(useDialogStore.getState().open).toBe(false);
		});

		it("allows close when no onBeforeClose is registered", () => {
			useDialogStore.setState({
				open: true,
				activeDialog: { type: "auth.change-password", data: undefined },
				onBeforeClose: null,
			});

			useDialogStore.getState().closeDialog();
			expect(useDialogStore.getState().open).toBe(false);
		});
	});
});
