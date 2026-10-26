# RELeaF Termux MCP server

This is an early, dependency-free Node.js MCP stdio server. It exposes tools for environment checks, APK archive inventory, optional JADX invocation, native-library extraction, ELF inspection, and searching text files under the private workspace.

## Install
From the repository root in Termux:

```sh
bash scripts/setup-termux.sh
releaf-mcp --self-test
```

The server is intended to be launched by an MCP client as a local stdio process. Do not point a hosted remote connector at this local process directly.

## Notes
- Node.js 22+ is required.
- Install optional analysis tools separately and check whether they work on your Termux build.
- Decompilation writes to the private RELeaF workspace.
- The current source is an experimental first version and should be tested with sample APKs before relying on it.
