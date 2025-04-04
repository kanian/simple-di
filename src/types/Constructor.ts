/**
 * A constructor type that can be used to create instances of a class.
 * It is a generic type that takes an optional type parameter T, which represents
 * the type of the instance being created.
 */
export type Constructor<T = {}> = new (...args: any[]) => T;
