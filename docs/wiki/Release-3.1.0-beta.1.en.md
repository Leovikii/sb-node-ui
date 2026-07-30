# v3.1.0-beta.1

[简体中文](Release-3.1.0-beta.1)

`v3.1.0-beta.1` is the first public beta of Sing Sub 3.1. Use it where the `v3.0.0` Worker version remains available for rollback. It is not a stable release.

## Highlights

- Rebuilt the WebUI from Vue/PrimeVue to React 19 and Mantine 9, and removed the old frontend runtime dependencies.
- The default site entry now loads React directly while preserving routes, bilingual UI, color schemes, and Worker API semantics.
- Resources, profiles, rule sets, GitHub synchronization, and settings use Mantine components, forms, dialogs, notifications, and lightweight transitions.
- Improved responsive behavior from 320 to 1440 px, touch targets, keyboard operation, reduced motion, and protocol-aware node labels.
- CodeMirror, profile sorting, and heavy feature pages remain lazy-loaded. No commercial UI packages or license keys are required.

## Upgrade and data safety

- This release does not change workspace, revision, R2 object, subscription token, SRS, or GitHub sync formats. No data migration is required.
- Reuse the existing `WORKSPACE_BUCKET` and three runtime secrets. Do not regenerate, rotate, or delete secrets for this upgrade.
- Before deployment, run `npm ci`, `npm run verify`, and `npm run worker:dry-run`, and retain the previous Worker version.
- To roll back the beta, roll back only the Worker code version. Do not clear R2, move `head.json` backward, or restore an old data snapshot.

## Suggested beta checks

- Sign-in, profile preview, and subscription links;
- reading and editing node sets, templates, adapters, and rule sets;
- GitHub push/pull conflict direction and SRS build status;
- mobile dialogs, long node names, dark first paint, and route transitions.

## Known limitations

- Initial static JavaScript is smaller than in `v3.0.0`, but the total client JavaScript is larger after every lazy feature and CodeMirror have been loaded. Total bundle size remains an optimization target for the stable release.
- The production dependency audit reports React Router's RSC Mode CSRF advisory. Sing Sub is a client-only Hash Router application with no RSC or server action endpoint, so the affected path is not reachable.

See the [deployment guide](Deployment) and [release and recovery guide](../operations/release-and-recovery.md) for complete procedures.
