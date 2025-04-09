import { singleton, transient } from '../types/symbols';
import { serviceRegistry } from './serviceRegistry';

/**
 * Resets the dependency injection container.
 * This clears all singleton and transient instances and resets the container to its initial state.
 * Useful for testing and for scenarios where you need to reinitialize the container.
 * NB: This function should be used with caution, as it will remove all registered services and instances.
 * It is primarily intended for testing purposes.
 * You will need to use registerValue if you are using custom tokens in order to get the same behavior as
 * before resetting the container.
 */
export function resetContainer(): void {
  const registry = serviceRegistry();
  // Clear all entries in the service registry
  registry.forEach((value, key) => {
    if (value) {
      // Clear singleton instances
      if (value[singleton]) {
        delete value[singleton];
      }
      // Clear transient instances
      if (value[transient]) {
        delete value[transient];
      }
    }
    registry.delete(key);
  });
  // Clear the registry itself
  registry.clear();
}
