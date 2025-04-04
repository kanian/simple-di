import { Token } from '../types/Token';

// Global registry for services to enable autowiring
const _serviceRegistry = new Map<Token, any>();

export const serviceRegistry = () => _serviceRegistry;
