#!/usr/bin/env bash
#
# agent-memories skill installer
#
# Copies SKILL.md + references/ into every detected AI agent's skill directory
# and prints the MCP config snippet for each target.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/yorickchan/agent-memories/main/scripts/install.sh | bash
#   bash install.sh [--target <name>] [--skill-source <path>] [--print-config-only] [-h]
#
# Env:
#   AGENT_MEMORIES_HOST     - substituted into printed config (default: https://memories.agent-memories.com)
#   AGENT_MEMORIES_API_KEY  - substituted into printed config (default: placeholder)

set -euo pipefail

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

readonly SCRIPT_NAME="$(basename "$0")"

info()  { printf '%s\n' "$*"; }
warn()  { printf '[warn] %s\n' "$*" >&2; }
err()   { printf '[error] %s\n' "$*" >&2; }

print_help() {
  cat <<'EOF'
agent-memories skill installer

Copies the agent-memories skill (SKILL.md + references/) into every detected
AI agent's skill directory and prints MCP config snippets to paste.

USAGE
  bash install.sh [OPTIONS]

OPTIONS
  --target <name>         Install only one target (repeatable or comma-separated).
                          Valid: claude-code, claude-desktop, cursor, omp,
                          windsurf, zed, continue, agents
  --skill-source <path>   Override skill source directory (skip auto-detect).
  --print-config-only     Skip all copies; just print config snippets.
  -h, --help              Show this help.

ENVIRONMENT
  AGENT_MEMORIES_HOST     Substituted into printed config (default: https://memories.agent-memories.com)
  AGENT_MEMORIES_API_KEY  Substituted into printed config (default: placeholder)

EXAMPLES
  # Install for all detected agents
  bash install.sh

  # Install for Claude Code only
  bash install.sh --target claude-code

  # Just print config snippets (no file copies)
  bash install.sh --print-config-only

  # Use a custom skill source
  bash install.sh --skill-source /path/to/package
EOF
}

# ---------------------------------------------------------------------------
# Flag parsing
# ---------------------------------------------------------------------------

SELECTED_TARGETS=""
SKILL_SOURCE_OVERRIDE=""
PRINT_CONFIG_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      SELECTED_TARGETS="${SELECTED_TARGETS:+$SELECTED_TARGETS,}$2"
      shift 2
      ;;
    --skill-source)
      SKILL_SOURCE_OVERRIDE="$2"
      shift 2
      ;;
    --print-config-only)
      PRINT_CONFIG_ONLY=true
      shift
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      err "Unknown option: $1"
      print_help
      exit 1
      ;;
  esac
done

# Normalize comma-separated targets into an array
declare -a TARGET_FILTER=()
if [[ -n "$SELECTED_TARGETS" ]]; then
  IFS=',' read -ra TARGET_FILTER <<< "$SELECTED_TARGETS"
fi

# ---------------------------------------------------------------------------
# Skill source resolution
# ---------------------------------------------------------------------------

resolve_skill_source() {
  if [[ -n "$SKILL_SOURCE_OVERRIDE" ]]; then
    if [[ -f "$SKILL_SOURCE_OVERRIDE/SKILL.md" ]]; then
      SKILL_SRC="$SKILL_SOURCE_OVERRIDE"
      return 0
    else
      err "Skill source override does not contain SKILL.md: $SKILL_SOURCE_OVERRIDE"
      exit 1
    fi
  fi

  local candidates=(
    "node_modules/@agentmemories/mcp"
    "node_modules/@agentmemories/mcp/dist"
    "$HOME/.omp/agent/skills/agent-memories"
    "./packages/mcp"
    "../packages/mcp"
  )

  for candidate in "${candidates[@]}"; do
    if [[ -f "$candidate/SKILL.md" ]]; then
      SKILL_SRC="$candidate"
      return 0
    fi
  done

  err "Could not find SKILL.md in any expected location."
  err "Searched: ${candidates[*]}"
  err "Use --skill-source <path> to specify the package directory."
  exit 1
}

# ---------------------------------------------------------------------------
# OS detection
# ---------------------------------------------------------------------------

is_macos() {
  [[ "$(uname -s)" == "Darwin" ]]
}

# ---------------------------------------------------------------------------
# Target definitions
# ---------------------------------------------------------------------------

# Each target: name|skill_dir|config_path|config_key|has_skill
# skill_dir is empty for config-only targets.

get_target_info() {
  local name="$1"
  local home="$HOME"

  case "$name" in
    claude-code)
      echo "$home/.claude/skills/agent-memories"
      echo "$home/.claude.json"
      echo "mcpServers"
      echo "yes"
      ;;
    claude-desktop)
      echo ""
      if is_macos; then
        echo "$home/Library/Application Support/Claude/claude_desktop_config.json"
      else
        echo "$home/.config/Claude/claude_desktop_config.json"
      fi
      echo "mcpServers"
      echo "no"
      ;;
    cursor)
      echo "$home/.cursor/skills/agent-memories"
      echo "$home/.cursor/mcp.json"
      echo "mcpServers"
      echo "yes"
      ;;
    omp)
      echo "$home/.omp/agent/skills/agent-memories"
      echo "$home/.omp/agent/mcp.json"
      echo "mcpServers"
      echo "yes"
      ;;
    windsurf)
      echo "$home/.codeium/windsurf/skills/agent-memories"
      echo "$home/.codeium/windsurf/mcp_config.json"
      echo "mcp_servers"
      echo "yes"
      ;;
    zed)
      echo ""
      echo "$home/.config/zed/settings.json"
      echo "context_servers"
      echo "no"
      ;;
    continue)
      echo "$home/.continue/skills/agent-memories"
      echo "$home/.continue/config.yaml"
      echo "mcpServers"
      echo "yes"
      ;;
    agents)
      echo "$home/.agents/skills/agent-memories"
      echo "$home/.agents/"
      echo "mcpServers"
      echo "yes"
      ;;
    *)
      err "Unknown target: $name"
      err "Valid: claude-code, claude-desktop, cursor, omp, windsurf, zed, continue, agents"
      exit 1
      ;;
  esac
}

ALL_TARGETS=("claude-code" "claude-desktop" "cursor" "omp" "windsurf" "zed" "continue" "agents")

# Check if a target is selected (empty filter = all)
is_target_selected() {
  local name="$1"
  if [[ ${#TARGET_FILTER[@]} -eq 0 ]]; then
    return 0
  fi
  for t in "${TARGET_FILTER[@]}"; do
    [[ "$t" == "$name" ]] && return 0
  done
  return 1
}

# ---------------------------------------------------------------------------
# Install (copy) logic
# ---------------------------------------------------------------------------

install_skill_for_target() {
  local name="$1"
  local skill_dir="$2"
  local config_path="$3"
  local has_skill="$4"

  if [[ "$has_skill" != "yes" ]]; then
    return 0  # config-only target, no copy
  fi

  if [[ -z "$skill_dir" ]]; then
    return 0
  fi

  # Detection: install if skill-root parent exists OR config file exists
  local skill_root
  skill_root="$(dirname "$(dirname "$skill_dir")")"  # e.g. ~/.claude/skills -> ~/.claude

  if [[ ! -d "$skill_root" && ! -f "$config_path" ]]; then
    info "[skipped] $name not detected (no $skill_root or $config_path)"
    return 0
  fi

  mkdir -p "$skill_dir"
  cp "$SKILL_SRC/SKILL.md" "$skill_dir/SKILL.md"
  rm -rf "$skill_dir/references"
  cp -r "$SKILL_SRC/references" "$skill_dir/references"

  info "[installed] agent-memories skill -> $skill_dir/"
}

# ---------------------------------------------------------------------------
# Config snippet printing
# ---------------------------------------------------------------------------

get_host() {
  if [[ -n "${AGENT_MEMORIES_HOST:-}" ]]; then
    echo "$AGENT_MEMORIES_HOST"
  else
    echo "https://memories.agent-memories.com"
  fi
}

get_api_key() {
  if [[ -n "${AGENT_MEMORIES_API_KEY:-}" ]]; then
    echo "$AGENT_MEMORIES_API_KEY"
  else
    echo "am_live_..."
  fi
}

print_config_snippet() {
  local name="$1"
  local config_path="$2"
  local config_key="$3"
  local host
  local api_key
  host="$(get_host)"
  api_key="$(get_api_key)"

  echo ""
  echo "[$name]"
  # Shorten home in display
  local display_path="${config_path/#$HOME/~}"
  echo "  Config: $display_path  (key: $config_key)"

  case "$name" in
    continue)
      # Continue uses YAML
      cat <<EOF
  $config_key:
    agent-memories:
      command: npx
      args:
        - "@agentmemories/mcp"
      env:
        AGENT_MEMORIES_HOST: "$host"
        AGENT_MEMORIES_API_KEY: "$api_key"
EOF
      echo "  [note: Continue uses YAML config.yaml - verify key name in your version]"
      ;;
    windsurf)
      # Windsurf uses mcp_servers (snake_case)
      cat <<EOF
  {
    "$config_key": {
      "agent-memories": {
        "command": "npx",
        "args": ["@agentmemories/mcp"],
        "env": {
          "AGENT_MEMORIES_HOST": "$host",
          "AGENT_MEMORIES_API_KEY": "$api_key"
        }
      }
    }
  }
EOF
      echo "  [note: Windsurf uses mcp_servers (snake_case) - verify shape in your version]"
      ;;
    agents)
      # ~/.agents/skills/ is the shared global skills dir for:
      # Cline, Zed, Warp, Kimi Code CLI, Loaf, Dexto
      # Each has its own MCP config path - print all.
      echo "  Shared skill dir: auto-discovered by Cline, Zed, Warp, Kimi Code CLI, Loaf, Dexto"
      echo ""
      echo "  [Cline]  ~/.cline/mcp_config.json  (key: mcpServers)"
      cat <<EOF
  {
    "mcpServers": {
      "agent-memories": {
        "command": "npx",
        "args": ["@agentmemories/mcp"],
        "env": {
          "AGENT_MEMORIES_HOST": "$host",
          "AGENT_MEMORIES_API_KEY": "$api_key"
        }
      }
    }
  }
EOF
      echo ""
      echo "  [Zed]  ~/.config/zed/settings.json  (key: context_servers)"
      cat <<EOF
  {
    "context_servers": {
      "agent-memories": {
        "command": "npx",
        "args": ["@agentmemories/mcp"],
        "env": {
          "AGENT_MEMORIES_HOST": "$host",
          "AGENT_MEMORIES_API_KEY": "$api_key"
        }
      }
    }
  }
EOF
      echo ""
      echo "  [Warp]  ~/.warp/mcp_servers.json  (key: mcp_servers)"
      cat <<EOF
  {
    "mcp_servers": {
      "agent-memories": {
        "command": "npx",
        "args": ["@agentmemories/mcp"],
        "env": {
          "AGENT_MEMORIES_HOST": "$host",
          "AGENT_MEMORIES_API_KEY": "$api_key"
        }
      }
    }
  }
EOF
      echo ""
      echo "  [note: MCP config paths for Kimi Code CLI, Loaf, Dexto may vary - check agent docs]"
      ;;
    *)
      # Standard JSON mcpServers / context_servers shape
      cat <<EOF
  {
    "$config_key": {
      "agent-memories": {
        "command": "npx",
        "args": ["@agentmemories/mcp"],
        "env": {
          "AGENT_MEMORIES_HOST": "$host",
          "AGENT_MEMORIES_API_KEY": "$api_key"
        }
      }
    }
  }
EOF
      ;;
  esac
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  # Resolve skill source unless print-only
  SKILL_SRC=""
  if [[ "$PRINT_CONFIG_ONLY" == "false" ]]; then
    resolve_skill_source
    info "[source] skill source: $SKILL_SRC"
  fi

  # Install phase
  if [[ "$PRINT_CONFIG_ONLY" == "false" ]]; then
    echo ""
    echo "=== Installing skill ==="
    for target in "${ALL_TARGETS[@]}"; do
      if ! is_target_selected "$target"; then
        continue
      fi

      local info_lines
      info_lines="$(get_target_info "$target")"
      local skill_dir config_path config_key has_skill
      skill_dir="$(echo "$info_lines" | sed -n '1p')"
      config_path="$(echo "$info_lines" | sed -n '2p')"
      config_key="$(echo "$info_lines" | sed -n '3p')"
      has_skill="$(echo "$info_lines" | sed -n '4p')"

      install_skill_for_target "$target" "$skill_dir" "$config_path" "$has_skill"
    done
  fi

  # Config print phase
  echo ""
  echo "=== MCP Configuration ==="
  echo "Paste the snippet for each agent into the config file shown."
  echo "Set AGENT_MEMORIES_HOST and AGENT_MEMORIES_API_KEY env vars to auto-substitute."
  for target in "${ALL_TARGETS[@]}"; do
    if ! is_target_selected "$target"; then
      continue
    fi

    local info_lines
    info_lines="$(get_target_info "$target")"
    local skill_dir config_path config_key has_skill
    skill_dir="$(echo "$info_lines" | sed -n '1p')"
    config_path="$(echo "$info_lines" | sed -n '2p')"
    config_key="$(echo "$info_lines" | sed -n '3p')"
    has_skill="$(echo "$info_lines" | sed -n '4p')"

    print_config_snippet "$target" "$config_path" "$config_key"
  done

  echo ""
  echo "=== Done ==="
  echo "Restart your AI agent(s) to pick up the new skill and MCP server."
}

main
