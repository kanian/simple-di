import { Token } from "./Token";

/**
 * DependencyDescriptor interface describes a dependency in the DI system.
 */
export interface DependencyDescriptor {
  token: Token;
  value?: any; // For value dependencies
}
