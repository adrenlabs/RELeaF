# Optional local AI agent

RELeaF's analysis tools work without an AI model. The optional `releaf-agent` CLI connects those tools to a **local OpenAI-compatible chat-completions endpoint**. This design does not require a cloud API key or paid AI API.

## Requirements

- Node.js 22+
- RELeaF installed from this repository
- A local inference server that exposes `/v1/chat/completions` and supports tool/function calling, such as a compatible llama.cpp server build
- A model and chat template that support tool calls. Not every GGUF/model template does.

## Start

Start your local inference server separately, listening only on loopback where possible. Example environment configuration:

```sh
export RELEAF_BASE_URL=http://127.0.0.1:8080/v1
export RELEAF_MODEL=Qwen3-4B
releaf-agent "inspect /storage/emulated/0/Download/sample.apk"
```

The URL and model name must match your server configuration. This command is an example, not a guarantee that the selected model supports tool calling. If your server uses a different endpoint or model name, change the environment variables.

Check the agent's MCP connection without making a model request:

```sh
releaf-agent --self-test
```

## Limitations and safety

- The agent is experimental and has not been verified on every Termux device/model combination.
- The local model may produce incorrect analysis or malformed tool arguments.
- The agent can call only the MCP tools exposed by RELeaF; it does not provide an unrestricted shell tool.
- Never run unknown APKs. Analyze only files you are authorized to inspect.
- Keep the local inference endpoint bound to loopback. Do not expose an unauthenticated model server to a public network.
- A local model avoids per-request cloud API fees, but it still uses device resources and may be slow or fail due to RAM/storage limits.
