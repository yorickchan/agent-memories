import { loadConfig } from "./config.js"
import { startServer } from "./server.js"
import { ToolRegistry } from "./router.js"
import { HttpMemoryService } from "./proxy/http-memory-service.js"
import { HttpKgService } from "./proxy/http-kg-service.js"
import { HttpWmService } from "./proxy/http-wm-service.js"
import { createMemoryTools } from "./tools/memory/factory.js"
import { createKgTools } from "./tools/kg/factory.js"
import { createWmTools } from "./tools/wm/factory.js"
import type { MemoryService } from "@agent-memories/shared"
import type { KgService } from "@agent-memories/shared"
import type { WmService } from "@agent-memories/shared"

async function main() {
  const config = loadConfig();

  // HTTP proxies implement the same method names as real services.
  // The type bridge (as unknown as ServiceType) is structural —
  // tool handlers call methods by name, not by nominal type.
  const memoryService = new HttpMemoryService(config) as unknown as MemoryService;
  const kgService = new HttpKgService(config) as unknown as KgService;
  const wmService = new HttpWmService(config) as unknown as WmService;

  const registry = new ToolRegistry();
  for (const handler of createMemoryTools(config, memoryService)) {
    registry.register(handler);
  }
  for (const handler of createKgTools(config, kgService)) {
    registry.register(handler);
  }
  for (const handler of createWmTools(config, wmService)) {
    registry.register(handler);
  }

  await startServer(config, registry);
}

main().catch((err) => {
  process.stderr.write(`fatal: ${(err as Error).message}\n`);
  process.exit(1);
});
