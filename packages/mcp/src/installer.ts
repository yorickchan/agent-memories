import { existsSync, cpSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir, platform } from "node:os";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Target {
  name: string;
  skillDir: string | null; // null = config-only (no skill system)
  configPath: string;
  configKey: string;
  hasSkill: boolean;
}

interface Flags {
  targets: string[]; // empty = all
  skillSource: string | null;
  printConfigOnly: boolean;
  help: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HOME = homedir();
const IS_MACOS = platform() === "darwin";

const ALL_TARGET_NAMES = [
  "claude-code",
  "claude-desktop",
  "cursor",
  "omp",
  "windsurf",
  "zed",
  "continue",
  "agents",
] as const;

const VALID_TARGETS: Record<string, true> = Object.fromEntries(
  ALL_TARGET_NAMES.map((t) => [t, true as const])
);

// ---------------------------------------------------------------------------
// Skill source resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the directory containing SKILL.md + references/.
 * Search order:
 *   1. --skill-source override
 *   2. Package root (parent of dist/ where this file lives after build)
 *   3. dist/ subdirectory
 *   4. node_modules/@agentmemories/mcp (installed package root)
 *   5. node_modules/@agentmemories/mcp/dist
 *   6. ~/.omp/agent/skills/agent-memories (existing OMP install)
 *   7. ./packages/mcp (dev mode)
 */
function resolveSkillSource(override: string | null): string {
  const here = dirname(fileURLToPath(import.meta.url)); // dist/ or src/

  const candidates: string[] = [];

  if (override) {
    candidates.push(resolve(override));
  } else {
    // From dist/cli.js -> package root is one level up
    candidates.push(resolve(here, ".."));
    // dist/ itself (build:skill copies into dist/)
    candidates.push(here);
    candidates.push("node_modules/@agentmemories/mcp");
    candidates.push("node_modules/@agentmemories/mcp/dist");
    candidates.push(resolve(HOME, ".omp/agent/skills/agent-memories"));
    candidates.push("./packages/mcp");
    candidates.push("../packages/mcp");
  }

  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, "SKILL.md"))) {
      return resolve(candidate);
    }
  }

  throw new Error(
    "Could not find SKILL.md in any expected location.\n" +
      "Searched:\n  " +
      candidates.join("\n  ") +
      "\nUse --skill-source <path> to specify the package directory."
  );
}

// ---------------------------------------------------------------------------
// Target definitions
// ---------------------------------------------------------------------------

function getTargetInfo(name: string): Target {
  switch (name) {
    case "claude-code":
      return {
        name,
        skillDir: resolve(HOME, ".claude/skills/agent-memories"),
        configPath: resolve(HOME, ".claude.json"),
        configKey: "mcpServers",
        hasSkill: true,
      };
    case "claude-desktop":
      return {
        name,
        skillDir: null,
        configPath: IS_MACOS
          ? resolve(HOME, "Library/Application Support/Claude/claude_desktop_config.json")
          : resolve(HOME, ".config/Claude/claude_desktop_config.json"),
        configKey: "mcpServers",
        hasSkill: false,
      };
    case "cursor":
      return {
        name,
        skillDir: resolve(HOME, ".cursor/skills/agent-memories"),
        configPath: resolve(HOME, ".cursor/mcp.json"),
        configKey: "mcpServers",
        hasSkill: true,
      };
    case "omp":
      return {
        name,
        skillDir: resolve(HOME, ".omp/agent/skills/agent-memories"),
        configPath: resolve(HOME, ".omp/agent/mcp.json"),
        configKey: "mcpServers",
        hasSkill: true,
      };
    case "windsurf":
      return {
        name,
        skillDir: resolve(HOME, ".codeium/windsurf/skills/agent-memories"),
        configPath: resolve(HOME, ".codeium/windsurf/mcp_config.json"),
        configKey: "mcp_servers",
        hasSkill: true,
      };
    case "zed":
      return {
        name,
        skillDir: null,
        configPath: resolve(HOME, ".config/zed/settings.json"),
        configKey: "context_servers",
        hasSkill: false,
      };
    case "continue":
      return {
        name,
        skillDir: resolve(HOME, ".continue/skills/agent-memories"),
        configPath: resolve(HOME, ".continue/config.yaml"),
        configKey: "mcpServers",
        hasSkill: true,
      };
    case "agents":
      return {
        name,
        skillDir: resolve(HOME, ".agents/skills/agent-memories"),
        configPath: resolve(HOME, ".agents/"),
        configKey: "mcpServers",
        hasSkill: true,
      };
    default:
      throw new Error(
        `Unknown target: ${name}\nValid: ${ALL_TARGET_NAMES.join(", ")}`
      );
  }
}

// ---------------------------------------------------------------------------
// Install (copy) logic
// ---------------------------------------------------------------------------

function installSkillForTarget(target: Target, skillSrc: string): void {
  if (!target.hasSkill || !target.skillDir) {
    return; // config-only target
  }

  // Detection: install if skill-root parent exists OR config file exists
  // skillDir = ~/.claude/skills/agent-memories -> skill root parent = ~/.claude
  const skillRootParent = resolve(target.skillDir, "..", "..");

  if (!existsSync(skillRootParent) && !existsSync(target.configPath)) {
    console.log(`[skipped] ${target.name} not detected (no ${skillRootParent} or ${target.configPath})`);
    return;
  }

  mkdirSync(target.skillDir, { recursive: true });
  copyFileSync(resolve(skillSrc, "SKILL.md"), resolve(target.skillDir, "SKILL.md"));

  // Idempotent: remove old references, copy fresh
  const refsDest = resolve(target.skillDir, "references");
  rmSync(refsDest, { recursive: true, force: true });
  cpSync(resolve(skillSrc, "references"), refsDest, { recursive: true });

  console.log(`[installed] agent-memories skill -> ${target.skillDir}/`);
}

// ---------------------------------------------------------------------------
// Config snippet printing
// ---------------------------------------------------------------------------

// Host/api-key come from env (with placeholders) - inlined at call sites below.


function shortenHome(p: string): string {
  if (p.startsWith(HOME)) {
    return "~" + p.slice(HOME.length);
  }
  return p;
}

function printJsonConfig(key: string, host: string, apiKey: string): void {
  console.log(`  {`);
  console.log(`    "${key}": {`);
  console.log(`      "agent-memories": {`);
  console.log(`        "command": "npx",`);
  console.log(`        "args": ["@agentmemories/mcp"],`);
  console.log(`        "env": {`);
  console.log(`          "AGENT_MEMORIES_HOST": "${host}",`);
  console.log(`          "AGENT_MEMORIES_API_KEY": "${apiKey}"`);
  console.log(`        }`);
  console.log(`      }`);
  console.log(`    }`);
  console.log(`  }`);
}

function printConfigSnippet(target: Target): void {
  const host = process.env.AGENT_MEMORIES_HOST ?? "https://memories.agent-memories.com";
  const apiKey = process.env.AGENT_MEMORIES_API_KEY ?? "am_live_...";

  console.log("");
  console.log(`[${target.name}]`);
  console.log(`  Config: ${shortenHome(target.configPath)}  (key: ${target.configKey})`);

  if (target.name === "continue") {
    // Continue uses YAML
    console.log(`  ${target.configKey}:`);
    console.log(`    agent-memories:`);
    console.log(`      command: npx`);
    console.log(`      args:`);
    console.log(`        - "@agentmemories/mcp"`);
    console.log(`      env:`);
    console.log(`        AGENT_MEMORIES_HOST: "${host}"`);
    console.log(`        AGENT_MEMORIES_API_KEY: "${apiKey}"`);
    console.log(`  [note: Continue uses YAML config.yaml - verify key name in your version]`);
  } else if (target.name === "windsurf") {
    printJsonConfig(target.configKey, host, apiKey);
    console.log(`  [note: Windsurf uses mcp_servers (snake_case) - verify shape in your version]`);
  } else if (target.name === "agents") {
    // ~/.agents/skills/ is the shared global skills dir for:
    // Cline, Zed, Warp, Kimi Code CLI, Loaf, Dexto
    // Each has its own MCP config path - print all.
    console.log(`  Shared skill dir: auto-discovered by Cline, Zed, Warp, Kimi Code CLI, Loaf, Dexto`);
    console.log("");
    console.log(`  [Cline]  ~/.cline/mcp_config.json  (key: mcpServers)`);
    printJsonConfig("mcpServers", host, apiKey);
    console.log("");
    console.log(`  [Zed]  ~/.config/zed/settings.json  (key: context_servers)`);
    printJsonConfig("context_servers", host, apiKey);
    console.log("");
    console.log(`  [Warp]  ~/.warp/mcp_servers.json  (key: mcp_servers)`);
    printJsonConfig("mcp_servers", host, apiKey);
    console.log("");
    console.log(`  [note: MCP config paths for Kimi Code CLI, Loaf, Dexto may vary - check agent docs]`);
  } else {
    // Standard JSON shape (claude-code, claude-desktop, cursor, omp, zed)
    printJsonConfig(target.configKey, host, apiKey);
  }
}

// ---------------------------------------------------------------------------
// Flag parsing
// ---------------------------------------------------------------------------

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {
    targets: [],
    skillSource: null,
    printConfigOnly: false,
    help: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg) {
      i++;
      continue;
    }
    switch (arg) {
      case "--target": {
        const val = argv[i + 1];
        if (!val) {
          throw new Error("--target requires a value");
        }
        for (const t of val.split(",")) {
          const trimmed = t.trim();
          if (!VALID_TARGETS[trimmed]) {
            throw new Error(
              `Unknown target: ${trimmed}\nValid: ${ALL_TARGET_NAMES.join(", ")}`
            );
          }
          flags.targets.push(trimmed);
        }
        i += 2;
        break;
      }
      case "--skill-source": {
        const val = argv[i + 1];
        if (!val) {
          throw new Error("--skill-source requires a value");
        }
        flags.skillSource = val;
        i += 2;
        break;
      }
      case "--print-config-only":
        flags.printConfigOnly = true;
        i++;
        break;
      case "-h":
      case "--help":
        flags.help = true;
        i++;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return flags;
}

function printHelp(): void {
  console.log(`agent-memories skill installer

Copies the agent-memories skill (SKILL.md + references/) into every detected
AI agent's skill directory and prints MCP config snippets to paste.

USAGE
  npx @agentmemories/mcp install [OPTIONS]

OPTIONS
  --target <name>         Install only one target (repeatable or comma-separated).
                          Valid: ${ALL_TARGET_NAMES.join(", ")}
  --skill-source <path>   Override skill source directory (skip auto-detect).
  --print-config-only     Skip all copies; just print config snippets.
  -h, --help              Show this help.

ENVIRONMENT
  AGENT_MEMORIES_HOST     Substituted into printed config (default: https://memories.agent-memories.com)
  AGENT_MEMORIES_API_KEY  Substituted into printed config (default: placeholder)

EXAMPLES
  # Install for all detected agents
  npx @agentmemories/mcp install

  # Install for Claude Code only
  npx @agentmemories/mcp install --target claude-code

  # Just print config snippets (no file copies)
  npx @agentmemories/mcp install --print-config-only
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function runInstaller(): Promise<void> {
  const flags = parseFlags(process.argv.slice(3));

  if (flags.help) {
    printHelp();
    return;
  }

  const selectedTargets =
    flags.targets.length > 0
      ? flags.targets.map((t) => getTargetInfo(t))
      : ALL_TARGET_NAMES.map((t) => getTargetInfo(t));

  // Resolve skill source unless print-only
  let skillSrc: string | null = null;
  if (!flags.printConfigOnly) {
    skillSrc = resolveSkillSource(flags.skillSource);
    console.log(`[source] skill source: ${skillSrc}`);
  }

  // Install phase
  if (!flags.printConfigOnly && skillSrc) {
    console.log("");
    console.log("=== Installing skill ===");
    for (const target of selectedTargets) {
      installSkillForTarget(target, skillSrc);
    }
  }

  // Config print phase
  console.log("");
  console.log("=== MCP Configuration ===");
  console.log("Paste the snippet for each agent into the config file shown.");
  console.log(
    "Set AGENT_MEMORIES_HOST and AGENT_MEMORIES_API_KEY env vars to auto-substitute."
  );
  for (const target of selectedTargets) {
    printConfigSnippet(target);
  }

  console.log("");
  console.log("=== Done ===");
  console.log("Restart your AI agent(s) to pick up the new skill and MCP server.");
}
