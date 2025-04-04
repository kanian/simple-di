import { singleton, transient } from "../types/symbols";
import { serviceRegistry } from "./serviceRegistry";

/**
 * Resets the dependency injection container.
 * This clears all singleton and transient instances and resets the container to its initial state.
 * Useful for testing and for scenarios where you need to reinitialize the container.
 */

import { singleton, transient } from "../types/symbols";
import { serviceRegistry } from "./serviceRegistry";

/**
 * Resets the dependency injection container.
 * This clears all singleton and transient instances and resets the container to its initial state.
 * Useful for testing and for scenarios where you need to reinitialize the container.
 */
export function resetContainer(): void {
  // Clear all entries in the service registry
  serviceRegistry().clear();

  // Optionally, if you have any other global state or caches, clear them here
  // For example, if you have a cache of instances, clear it
  // instanceCache.clear();
}
