import { Module } from "../types/Module";
import { tokenName } from "../types/symbols";
import { getTokenName } from "./getTokenName";
import { initializeContainer } from "./initializeContainer";
import { inject } from "./inject";
import { registerValue } from "./registerValue";
import { serviceRegistry } from "./serviceRegistry";


export function bootstrap(rootModule: Module) {
  // Process the root module and all its imports recursively
  const processedModules = new Set();
  const processModule = (module: Module) => {
    if (processedModules.has(module)) return;
    processedModules.add(module);

    // Process imported modules first
    if (module.imports && Array.isArray(module.imports)) {
      module.imports.forEach(processModule);
    }

    // Register providers
    if (module.providers && Array.isArray(module.providers)) {
      module.providers.forEach(provider => {
        // Provider might be a class or an object with provide/useClass properties
        if (typeof provider === 'function') {
          // It's a class
          if (!serviceRegistry().has(getTokenName(provider))) {
            serviceRegistry().set(getTokenName(provider), provider);
          }
        } else if (provider && typeof provider === 'object') {
          if (provider.provide && provider.useValue) {
            // It's a value provider
            registerValue(provider.provide, provider.useValue);
          } else if (provider.provide && provider.useClass) {
            // It's a class provider with a token
            const ctor = provider.useClass;
            ctor[tokenName] = provider.provide;
            serviceRegistry().set(provider.provide, ctor);
          } else if(provider.provide && provider.useFactory) {
            // It's a factory provider
            const factory = provider.useFactory;
            const value = factory();
            registerValue(provider.provide, value);
          }
        }
      });
    }
  };

  // Start processing from the root module
  processModule(rootModule);

  // Initialize the container to resolve all dependencies
  initializeContainer();

  // // Return the root instance if there's a bootstrap provider
  // if (rootModule.bootstrap) {
  //   return inject(rootModule.bootstrap);
  // }
}