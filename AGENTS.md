# Sing-Sub agent entry

Before changing this repository, read [`docs/agent/README.md`](docs/agent/README.md) and follow its routing instructions.

The public README and `docs/wiki` are user documentation. Do not use them as the engineering plan or progress ledger.

Long-lived rules:

- `3.0.0` is the rollback baseline; `3.1.0` is the prepared React/Mantine stable release. Historical prereleases must not be presented as stable releases.
- Do not deploy production, rotate secrets, alter R2 data, or publish a release unless the user explicitly requests it.
- Browser code uses the typed client in `src/api`; features must not call Worker storage or GitHub directly.
- Keep Worker, shared-contract, revision, sync, and SRS semantics unchanged during the frontend migration.
- Runtime UI dependencies must use an approved open-source license without a license key, revenue/headcount/funding eligibility test, or annual renewal.
- Update `docs/agent/progress.md` after each completed migration task and record new durable decisions before implementation.
- Preserve user changes and keep mechanical migration diffs separate from behavior changes.

