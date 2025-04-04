import { Injectable } from "./Injectable";

/**
 * A token is a unique identifier for a service or dependency in the DI system.
 * It can be a string, symbol, or an Injectable class.
 */
export type Token = string | symbol | Injectable<any>;
