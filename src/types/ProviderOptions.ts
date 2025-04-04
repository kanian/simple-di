import { Constructor } from "./Constructor";
import { Injectable } from "./Injectable";

/**
 * ProviderOptions interface
 * This interface defines the structure of the options that can be passed to a provider.
 */
export type ProviderOptions =  {
  provide?: string | symbol; // Token to use for the provider
  useClass?: Injectable; // Class to use for the provider
  useValue?: any; // Value to use for the provider
  useFactory?: (...args: any[]) => any; // Factory function to create the provider
} | Constructor | Injectable;