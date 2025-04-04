export const singleton = Symbol.for('singleton');
export const dependencies = Symbol.for('dependencies');
export const tokenName = Symbol.for('tokenName');
export const transient = Symbol.for('transient');
// Symbol to store parameter injection tokens
export const PARAM_TOKENS_METADATA = Symbol('paramTokens');