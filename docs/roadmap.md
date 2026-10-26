# Roadmap

This is a practical roadmap, not a promise that every item is implemented.

## Available in the current prototype
- MCP stdio server with a small allowlist of static-analysis tools
- APK archive inventory, optional JADX decompilation, native library extraction and ELF/string inspection where local utilities exist
- Optional local-model agent client for OpenAI-compatible endpoints
- Termux install script and smoke checks

## Next priorities
1. Test on a clean Termux installation and record device/Node/tool versions.
2. Add fixture-based tests for APK inventory and error handling.
3. Harden path validation, output limits and subprocess timeouts.
4. Add Rizin/radare2 integrations behind explicit availability checks.
5. Add a small sample project/fixture that contains no copyrighted APK.
6. Improve tool-call compatibility across local model servers.
7. Document backups, workspace cleanup and known limitations.

## Not claimed yet
- Production readiness
- Compatibility with every Android version or Termux repository
- Accurate decompilation of every APK
- Working tool calls with every GGUF model
- A bundled model or one-click model-server installer
