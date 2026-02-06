1. Fix remaining `react-hooks/set-state-in-effect` in receiving hooks (`useCreateManualReceivingsBoxes.ts`, `useEditReceivingsBoxes.ts`) by replacing state-setting effects with derived state patterns.
2. Resolve `react-hooks/preserve-manual-memoization` in product hooks (`useInactiveProducts.ts`, `useMarketplaceListings.ts`, `useProducts.ts`) by aligning dependencies or removing unsafe memoization.
3. Remove unused default React imports that cause build errors across components.
4. Re-run `pnpm lint` and `pnpm build` to verify fixes.
