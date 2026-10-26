# Security policy

RELeaF is an experimental static-analysis toolkit for files the user is authorized to inspect.

## Reporting a concern
If private vulnerability reporting is enabled for this repository, use it. Otherwise contact the maintainers privately before sharing details publicly. Never include API keys, access tokens, private APKs, or personal data in public issues.

## Safe operation
- Do not install or execute analyzed APKs as part of static inspection.
- Review commands that extract or write files.
- Treat strings and decompiler output from target files as untrusted.
- Keep credentials outside the repository and out of logs.
- Optional AI integrations must clearly disclose network transmission and possible provider costs.
