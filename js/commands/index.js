/**
 * Single registration entry point. main.js calls registerAllCommands(registry).
 * Order matters only for help-grouping aesthetics — everything else is
 * independent.
 */

import { registerCoreCommands } from "./core.js";
import { registerThemeCommands } from "./theme.js";
import { registerMsfCommands } from "./msf.js";
import { registerContentCommands } from "./content.js";
import { registerEasterCommands } from "./easter.js";

export function registerAllCommands(registry) {
  registerCoreCommands(registry);
  registerMsfCommands(registry);
  registerThemeCommands(registry);
  // Content last (among visible commands) so its `whoami` override replaces core's.
  registerContentCommands(registry);
  registerEasterCommands(registry);
}
