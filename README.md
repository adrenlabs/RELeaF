# RELeaF
**Reverse Engineering & Local Analysis Framework**

RELeaF is an open-source, Android/Termux-first toolkit for organizing static analysis of APK, DEX, and native ELF files (.so). It is designed to be useful without an AI provider; optional AI integrations should remain separate, opt-in components.

> **Project status:** early experimental release. Test on sample files first. Tool availability and behavior vary across Termux devices and repositories.

## Goals
- Work from an Android phone using Termux.
- Inspect APK archives and inventory DEX/native library members.
- Use locally installed analysis tools rather than bundling large proprietary tools.
- Keep outputs organized and make failures/missing dependencies visible.
- Make AI assistance optional; never require a paid API for basic local inspection.
- Treat input binaries as data: do not install or execute analyzed APKs.

## Planned components
- **Local analysis bridge:** MCP stdio interface for compatible clients.
- **CLI workflows:** APK/DEX/ELF inventory and tool orchestration.
- **Optional AI adapter:** separate module; network use and model costs must be explicit.
- **Documentation:** setup, troubleshooting, safety, and reproducible reports.

## Requirements
- Android with [Termux](https://termux.dev/).
- Node.js 22 or newer for the MCP bridge.
- Optional tools such as JADX, apktool, radare2/Rizin, binutils and file for deeper analysis. Availability differs by Termux repository.

## Safety and privacy
- Only analyze files you own or are authorized to inspect.
- RELeaF is for static analysis. It does not promise original source recovery; decompiler output is approximate and can be incomplete.
- Never publish APKs, API keys, tokens, private paths, or proprietary analysis output in public issues or commits.
- Optional AI integrations may send prompts and analysis output to an external provider. Review what will be transmitted and provider billing before enabling them.
- Local tools can still contain bugs. Use a dedicated workspace and review commands before running them.

## Development status
This repository is being prepared from an experimental Termux MCP bridge and an optional local AI-agent prototype. The code and documentation will evolve; do not treat the project as production-ready. Contributions and bug reports should include Termux version, architecture, tool versions, and a redacted error log.

## License
MIT. See [LICENSE](LICENSE).