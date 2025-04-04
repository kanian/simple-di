import { Token } from "../types/Token";
import { inject } from "./inject";
import { serviceRegistry } from "./serviceRegistry";

/**
 * Register a value or class as a service for dependency injection.
 * If the value is a class, it will be instantiated.
 * If resolveDeps is true, dependencies will be injected into the class instance.
 * If the value is not a class, it will be registered as is.
 * @param token The token to register the value or class under.
 * @param value The value or class to register.
 * @param resolveDeps Whether to resolve dependencies for the class instance.
 * @returns void
 */
export function registerValue(
  token: Token,
  value: any,
  resolveDeps = false
): void {
  const isClass =
    typeof value === 'function' && /^class\s/.test(value.toString());
  const instance = isClass
    ? resolveDeps
      ? inject(value)
      : new value()
    : value;
  serviceRegistry().set(token, {
    isValue: true,
    value: instance,
  });
}