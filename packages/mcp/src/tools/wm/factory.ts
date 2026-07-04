import type { Config } from "@agent-memories/shared"
import type { WmService } from "@agent-memories/shared"
import { makeWmPutHandler } from "./put.js";
import { makeWmGetHandler } from "./get.js";
import { makeWmListHandler } from "./list.js";
import { makeWmDeleteHandler } from "./delete.js";

export function createWmTools(config: Config, service: WmService) {
  return [
    makeWmPutHandler(config, service),
    makeWmGetHandler(config, service),
    makeWmListHandler(config, service),
    makeWmDeleteHandler(config, service),
  ];
}