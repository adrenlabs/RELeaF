# RELeaF

![RELeaF geometric icon](https://raw.githubusercontent.com/adrenlabs/RELeaF/main/assets/releaf-logo.svg?v=3)
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

## Included in this initial prototype
- **Local MCP server** at `src/server.mjs` with six tools: environment check, APK inventory, optional JADX invocation, native-library extraction, ELF inspection, and workspace text search.
- **Termux installer** at `scripts/setup-termux.sh`.
- **Setup and safety documentation**.

The separate OpenAI API agent from the experimental development setup is **not included in this initial public commit**. Basic MCP tools do not require an AI API key; an AI client that calls them may have its own model/provider requirements and costs.

## Requirements
- Android with [Termux](https://termux.dev/).
- Node.js 22 or newer for the MCP bridge.
- Optional tools such as JADX, apktool, radare2/Rizin, binutils and file for deeper analysis. Availability differs by Termux repository.

## Optional local AI agent

An optional `releaf-agent` CLI can connect the MCP tools to a local OpenAI-compatible inference server. It does not require a cloud API key, but you must separately install/run a compatible local model server and use a model/template that supports tool calling. See [Local AI setup](docs/local-ai.md).

After installing the repository, check the tools and agent connection:

```sh
releaf-mcp --self-test
releaf-agent --self-test
npm run check
npm test
```

The agent is experimental; self-test verifies the MCP handshake, not that a model can successfully call tools.

## Safety and privacy
- Only analyze files you own or are authorized to inspect.
- RELeaF is for static analysis. It does not promise original source recovery; decompiler output is approximate and can be incomplete.
- Never publish APKs, API keys, tokens, private paths, or proprietary analysis output in public issues or commits.
- Optional AI integrations may send prompts and analysis output to an external provider. Review what will be transmitted and provider billing before enabling them.
- Local tools can still contain bugs. Use a dedicated workspace and review commands before running them.

## Development status
This is an initial experimental prototype. The MCP server has not yet been validated end-to-end on a range of Android/Termux devices. Test with non-sensitive sample files first; do not treat it as production-ready. Contributions and bug reports should include Termux version, architecture, tool versions, and a redacted error log.

## License
MIT. See [LICENSE](LICENSE).