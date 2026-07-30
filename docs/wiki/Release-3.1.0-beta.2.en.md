# v3.1.0-beta.2

[简体中文](Release-3.1.0-beta.2)

`v3.1.0-beta.2` is the second public beta of Sing Sub 3.1, focused on performance and editor polish. It is not a stable release; retain `v3.0.0` or the previous working Worker version for rollback.

## Highlights

- Replaced CodeMirror with Mantine `JsonInput`, retaining JSON validation, format-on-blur, monospace editing, and native keyboard undo/redo while removing 16 production dependencies.
- Reduced all client JavaScript to 281.87 KiB gzip, about 13.4% above `v3.0.0` and within the 15% stable-release budget. An automated build gate prevents regressions.
- Rule-set accordions now use the section Badge as the only visible heading, removing duplicated field headings.
- The source footer combines last-update time, update interval, and delete action. Changing an existing source interval preserves its backend-provided `last_updated` value.
- Further stabilized resource and profile editor headers, preview/edit switching, and mobile scroll areas to avoid unnecessary size shifts and relayout.

## Upgrade and data safety

- This release does not change Worker APIs, workspace/revision schemas, R2 objects, subscription tokens, SRS, or GitHub sync formats. No data migration is required.
- Last-update display uses the existing `last_updated` field in rule-set documents; no new endpoint or storage is introduced.
- Reuse the existing R2 binding and runtime secrets. Do not rotate or regenerate secrets for this frontend update.
- Before deployment, run `npm ci`, `npm run verify`, and `npm run worker:dry-run`, and retain the previous working Worker version.

## Suggested beta checks

- JSON syntax errors, format-on-blur, save, and preview;
- rule-set last-update time, update interval, and mobile control layout;
- stable Modal header and outer dimensions when switching preview/edit modes;
- profile full-screen scroll area and bottom actions.

The production dependency audit still reports React Router's RSC Mode CSRF advisory. Sing Sub is a client-only Hash Router application with no RSC or server action endpoint, so the affected path is not reachable.

See the [deployment guide](Deployment) and [release and recovery guide](../operations/release-and-recovery.md) for complete procedures.
