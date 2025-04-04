import 'reflect-metadata';

import { Injectable } from "../types/Injectable";
import { dependencies, PARAM_TOKENS_METADATA } from "../types/symbols";
import { serviceRegistry } from "./serviceRegistry";

// Helper function to autowire dependencies based on constructor parameters
export const autowireService = <T>(target: Injectable<T>): void => {
  const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];

  if (!paramTypes || paramTypes.length === 0) {
    target[dependencies] = [];
    return;
  }

  const paramTokens = Reflect.getMetadata(PARAM_TOKENS_METADATA, target) || [];

  const autowiredDeps = paramTypes.map((paramType: any, index: number) => {
    const customToken = paramTokens[index];
    const token = customToken || paramType;

    if (!serviceRegistry().has(token)) {
      serviceRegistry().set(token, paramType); // Store the class directly
    }

    return { token };
  });

  target[dependencies] = autowiredDeps;
}