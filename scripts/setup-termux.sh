#!/data/data/com.termux/files/usr/bin/bash
set -eu
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
DEST="$HOME/.local/share/releaf"
BIN_DIR="${PREFIX:-/data/data/com.termux/files/usr}/bin"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install with: pkg install nodejs"
  exit 1
fi
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) { console.error("Node.js 22+ required; found " + process.versions.node); process.exit(1) }'
mkdir -p "$DEST" "$DEST/workspace" "$BIN_DIR"
chmod 700 "$DEST" "$DEST/workspace"
install -m 700 "$ROOT_DIR/src/server.mjs" "$DEST/server.mjs"
install -m 700 "$ROOT_DIR/src/agent.mjs" "$DEST/agent.mjs"
cat > "$BIN_DIR/releaf-mcp" <<'WRAPPER'
#!/data/data/com.termux/files/usr/bin/bash
exec node "$HOME/.local/share/releaf/server.mjs" "$@"
WRAPPER
chmod 700 "$BIN_DIR/releaf-mcp"
cat > "$BIN_DIR/releaf-agent" <<'WRAPPER'
#!/data/data/com.termux/files/usr/bin/bash
exec node "$HOME/.local/share/releaf/agent.mjs" "$@"
WRAPPER
chmod 700 "$BIN_DIR/releaf-agent"
node --check "$DEST/server.mjs"
echo "Installed RELeaF MCP server: $DEST/server.mjs"
echo "Self-test: releaf-mcp --self-test"
echo "Agent self-test: releaf-agent --self-test"
echo "This installer does not change any existing REA installation or client config."
