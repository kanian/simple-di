import { Constructor } from "./Constructor";
import { DependencyDescriptor } from "./DependencyDescriptor";
import { singleton, dependencies, tokenName, transient } from "./symbols";

/**
 * Injectable interface extends the Constructor type and adds metadata properties
 * for dependency injection.
 * It is used to define classes that can be injected as dependencies.
 */
export interface Injectable<T> extends Constructor<T> {
  [singleton]?: T;
  [dependencies]?: DependencyDescriptor[];
  [tokenName]?: string | symbol;
  [transient]?: boolean;
}