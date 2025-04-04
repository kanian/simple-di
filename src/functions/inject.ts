import { Injectable } from "../types/Injectable";
import { transient, singleton, dependencies } from "../types/symbols";
import { Token } from "../types/Token";
import { autowireService } from "./autowireService";
import { serviceRegistry } from "./serviceRegistry";

/**
 * Injects a service based on the provided token.
 * If the token is a string or symbol, it will look up the registered service.
 * If the token is a class, it will instantiate the class and resolve its dependencies.
 * If the service is registered as a singleton, it will return the cached instance unless forceNew is true.
 * If the service is registered as transient, a new instance will be created each time.
 * If the service is registered as a value, it will return the value directly.
 * @param token The token to resolve the service.
 * @typeParam T The type of the service to resolve.
 * @param forceNew Whether or not to force a new instance of the service.
 * @returns The resolved service instance.
 * @throws Error if the service is not registered or if a dependency cannot be resolved.
 */
export const inject = <T>(token: Token, forceNew = false): T => {
  if (typeof token === 'string' || typeof token === 'symbol') {
    const registered = serviceRegistry().get(token);
    if (!registered) {
      throw new Error(`No dependency registered for token "${String(token)}"`);
    }

    if (registered.isValue) {
      return registered.value;
    }

    token = registered; // Directly use the class constructor for services
  }

  const ctor = token as Injectable<T>;
  const isTransient = ctor[transient];

  // For singleton services, return cached instance unless forceNew is true
  if (!forceNew && !isTransient && ctor[singleton]) {
    return ctor[singleton];
  }

  if (!ctor[dependencies]) {
    autowireService(ctor);
  }

  const deps = ctor[dependencies] || [];
  const resolvedDeps = deps.map((dep) => {
    const depInstance = inject(dep.token);
    if (!depInstance) {
      throw new Error(
        `Failed to resolve dependency for token "${String(dep.token)}"`
      );
    }
    return depInstance;
  });

  const instance = new ctor(...resolvedDeps);

  // Only cache singleton instances
  if (!isTransient && !forceNew) {
    ctor[singleton] = instance;
  }

  return instance;
}