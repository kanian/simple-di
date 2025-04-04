import { singleton, transient } from "../types/symbols";
import { serviceRegistry } from "./serviceRegistry";

/**
 * Resets the dependency injection container.
 * This clears all singleton and transient instances and resets the container to its initial state.
 * Useful for testing and for scenarios where you need to reinitialize the container.
 */

