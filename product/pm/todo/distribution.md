# Distribution 10/10

- [x] Subpath exports for core, elements, control, render, fold, ids, routes, htmx
- [x] `sideEffects: false` declared
- [x] npm provenance attestation on publish
- [x] `npm pack --dry-run` shows only dist/src files
- [x] All subpath imports resolve correctly
- [x] `tsc --noEmit` clean, all tests pass
- [ ] Package size under 100KB unpacked (currently 444KB due to source maps + 62KB README — compressed is 93KB)
