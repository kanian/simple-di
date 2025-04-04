import { Constructor } from "./Constructor";
import { Module } from "./Module";
import { ProviderOptions } from "./ProviderOptions";

/**
 * RootModuleOptions interface
 * This interface defines the structure of the options that can be passed to a root module.
 */
export interface ModuleOptions {
  imports?: Module[]; // Other modules to import
  providers?: ProviderOptions[]; // Services to register in this module
}
