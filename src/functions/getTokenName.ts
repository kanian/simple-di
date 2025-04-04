import { Injectable } from "../types/Injectable";
import { tokenName } from "../types/symbols";
import { Token } from "../types/Token";

/**
 * Get the token name for a class.
 * @param ctor The constructor of the class to get the token name for.
 * @typeParam T The type of the class
 * @returns The token name for the class, which can be a string or symbol.
 * If the token name is not set, it returns the class name.
 */
export function getTokenName<T>(ctor: Injectable<T>): Token {
  return ctor[tokenName] || ctor.name;
}
