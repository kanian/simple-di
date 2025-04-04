import 'reflect-metadata';
import { PARAM_TOKENS_METADATA } from "../types/symbols";
import { Token } from "../types/Token";

/**
 *  Inject decorator for dependency injection.
 * @param token The token to inject. This can be a string, symbol, or class.
 * @returns A parameter decorator that can be applied to a constructor parameter.
 */
export function Inject(token: Token): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    // For constructor parameters, target is the constructor function
    const constructor = propertyKey ? target.constructor : target;

    // Get existing tokens or initialize empty array
    const existingTokens: Record<number, Token> =
      Reflect.getMetadata(PARAM_TOKENS_METADATA, constructor) || {};

    // Add this parameter's token
    existingTokens[parameterIndex] = token;

    // Store back on the constructor
    Reflect.defineMetadata(PARAM_TOKENS_METADATA, existingTokens, constructor);
  };
}