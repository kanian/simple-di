import 'reflect-metadata';

import { autowireService } from "../functions/autowireService";
import { getTokenName } from "../functions/getTokenName";
import { inject } from "../functions/inject";
import { serviceRegistry } from "../functions/serviceRegistry";
import { Injectable } from "../types/Injectable";
import { ServiceOptions } from "../types/ServiceOptions";
import { transient, tokenName, dependencies, singleton } from "../types/symbols";
import { Token } from "../types/Token";

/**
 * Service decorator function to register a class as a service for dependency injection.
 * @param optionsOrDep Service options or a dependency token
 * @param manualDeps Manual dependencies to be injected
 * @returns A decorator function that registers the class as a service
 */
export function Service(
  optionsOrDep?: ServiceOptions | Token | any,
  ...manualDeps: Array<Token | any>
) {
  return function (target: Injectable<any>) {
    let options: ServiceOptions = {};
    let deps: Array<Token | any> = [];

    // Store lifecycle information
    let isTransient: boolean = false;

    // Parse arguments to handle different call patterns
    if (optionsOrDep) {
      if (
        typeof optionsOrDep === 'object' &&
        !(optionsOrDep instanceof Function) &&
        ('dependencies' in optionsOrDep ||
          'lifecycle' in optionsOrDep ||
          'token' in optionsOrDep)
      ) {
        // It's an options object
        options = optionsOrDep;
        deps = options.dependencies || [];
        isTransient = options.lifecycle === 'transient';
        target[transient] = isTransient;
      } else {
        // It's a dependency
        let mDeps = manualDeps || [];
        deps = [optionsOrDep, ...mDeps];
      }
    }

    // Set custom token name if provided
    if (options.token) {
      target[tokenName] = options.token;
    }

    // Register the service for autowiring
    const serviceToken = getTokenName(target);
    serviceRegistry().set(serviceToken, target);

    // Get required dependencies from constructor
    const requiredDeps = Reflect.getMetadata('design:paramtypes', target) || [];

    // If manual dependencies were provided, process them
    if (deps.length > 0) {
      if (deps.length !== requiredDeps.length) {
        throw new Error(
          `Incomplete dependencies specified for ${target.name}. ` +
            `Constructor requires ${requiredDeps.length} dependencies, but ` +
            `only ${deps.length} were manually provided. ` +
            `Either provide all dependencies or none for autowiring.`
        );
      }

      // Convert dependencies into descriptors
      target[dependencies] = deps.map((dep) => {
        if (
          dep instanceof Function ||
          typeof dep === 'string' ||
          typeof dep === 'symbol'
        ) {
          // It's a token (class, string, or symbol)
          return { token: dep };
        } else {
          // It's a value
          return {
            token: Symbol('anonymous'),
            value: dep,
          };
        }
      });
    }

    // Create a singleton getter property for the service
    Object.defineProperty(target, 'instance', {
      get: () => {
        if (isTransient) {
          // For transient services, always create a new instance
          return inject(target, true); // New parameter to force new instance
        }
        if (!target[singleton]) {
          // Autowire if not manually specified
          if (!target[dependencies]) {
            autowireService(target);
          }
          inject(target);
        }
        return target[singleton];
      },
      configurable: false,
      enumerable: true,
    });
  };
}