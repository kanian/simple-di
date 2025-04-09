import { expect, test, describe, beforeEach, it, afterEach } from 'bun:test';
import { resetContainer } from './resetContainer';
import { Service } from '../decorators/Service';
import { inject } from './inject';
import { initializeContainer } from './initializeContainer';
import { registerValue } from './registerValue';
import { serviceRegistry } from './serviceRegistry';

describe('resetContainer', () => {
  // Always reset after each test to avoid interference between tests
  afterEach(() => {
    resetContainer();
  });

  it('should clear all transient instances', () => {
    @Service({ lifecycle: 'transient' })
    class TransientService {
      public value: number = Math.random();
    }

    // Create a few instances to ensure they're registered
    inject(TransientService);

    // Reset the container
    resetContainer();
    initializeContainer();

    // The registry should be cleared, but we can still create new instances
    const newInstance = inject(TransientService);
    // This here is to show you that resetContainer is quirky
    expect(serviceRegistry().size).toBe(0);
    // This here is to show you that you must use registerValue to get the same behavior
    // as before resetting the container
    registerValue(TransientService, TransientService);
    inject(TransientService);
    expect(serviceRegistry().size).toBe(1);

  });

  it('clear all instances for custom tokens', () => {
    @Service({ token: 'customToken' })
    class CustomService {
      public value: number = Math.random();
    }
    // Create initial instance
    registerValue('customToken', CustomService);
    // Create initial instance
    let instance1: CustomService | undefined = undefined;
    expect(() => {
      instance1 = inject('customToken');
    }).not.toThrow();
    expect(instance1).toBeDefined();

    // Reset the container
    resetContainer();
    initializeContainer();
    expect(() => {
      inject('customToken');
    }).toThrow(/No dependency registered/);
  });

  it('should clear all singleton instances', () => {
    @Service()
    class SingletonService {
      public value: number = Math.random();
    }

    @Service()
    class AnotherSingletonService {
      public value: number = Math.random();
    }
    // Create initial instance
    let instance1: SingletonService | undefined = undefined;
    let anotherInstance1: AnotherSingletonService | undefined = undefined;
    expect(() => {
      instance1 = inject(SingletonService);
      anotherInstance1 = inject(AnotherSingletonService);
    }).not.toThrow();
    expect(instance1).toBeDefined();
    expect(anotherInstance1).toBeDefined();
    // Reset the container
    resetContainer();
    initializeContainer();
    expect(serviceRegistry().size).toBe(0);
    // Get a new instance - it should have a different value
    registerValue(SingletonService, SingletonService);
    const instance2: SingletonService = inject(SingletonService);
    expect(instance2).not.toBe(instance1);
    expect(serviceRegistry().size).toBe(1);
  });

  it('should clear registered values', () => {
    const CONFIG_TOKEN = 'appConfig';
    const config = { apiUrl: 'https://api.example.com' };

    registerValue(CONFIG_TOKEN, config);

    // Verify the value is registered
    const configValue = inject(CONFIG_TOKEN);
    expect(configValue).toBe(config);

    // Reset the container
    resetContainer();
    initializeContainer();

    // The value should no longer be registered
    expect(() => inject(CONFIG_TOKEN)).toThrow(/No dependency registered/);
  });

  it('should allow re-registration of services after reset', () => {
    const SERVICE_TOKEN = 'serviceToken';

    @Service({ token: SERVICE_TOKEN })
    class OriginalService {
      getValue() {
        return 'original';
      }
    }

    const original = inject<OriginalService>(SERVICE_TOKEN);
    expect(original.getValue()).toBe('original');

    // Reset the container
    resetContainer();
    initializeContainer();
    expect(serviceRegistry().size).toBe(0);

    // Register a new service with the same token
    @Service({ token: SERVICE_TOKEN })
    class NewService {
      getValue() {
        return 'new';
      }
    }

    const newInstance = inject<NewService>(SERVICE_TOKEN);
    expect(newInstance.getValue()).toBe('new');
    expect(serviceRegistry().size).toBe(1);
  });
});
