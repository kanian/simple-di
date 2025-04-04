import { expect, test, describe, it, beforeEach } from 'bun:test';

import { PARAM_TOKENS_METADATA } from './types/symbols';
import { Service } from './decorators/Service';
import { Inject } from './decorators/Inject';
import { registerValue } from './functions/registerValue';
import { inject } from './functions/inject';
import { initializeContainer } from './functions/initializeContainer';

describe('Enhanced Dependency Injection System', () => {
  // Reset registry before each test
  beforeEach(() => {
    initializeContainer();
  });

  describe('Basic DI functionality', () => {
    test('should handle explicit dependencies', () => {
      @Service()
      class ServiceA {
        getValue() {
          return 'A';
        }
      }
      @Service(ServiceA)
      class ServiceB {
        constructor(private serviceA: ServiceA) {}
        getValue() {
          return this.serviceA.getValue() + 'B';
        }
      }

      initializeContainer();
      const instance: ServiceB = inject(ServiceB);
      expect(instance.getValue()).toBe('AB');
    });

    test('should autowire dependencies without explicit dependencies provided', () => {
      @Service()
      class ServiceA {
        getValue() {
          return 'A';
        }
      }

      @Service()
      class ServiceB {
        getValue() {
          return 'B';
        }
      }

      @Service()
      class AutowiredService {
        constructor(private serviceA: ServiceA, private serviceB: ServiceB) {}

        getValue() {
          return this.serviceA.getValue() + this.serviceB.getValue();
        }
      }

      initializeContainer();
      const instance: AutowiredService = inject(AutowiredService);
      expect(instance.getValue()).toBe('AB');
    });

    it('should create a single instance', () => {
      @Service()
      class TestService {
        public value: number = Math.random();
      }

      const instance1: TestService = inject(TestService);
      const instance2: TestService = inject(TestService);

      expect(instance1).toBe(instance2);
      expect(instance1.value).toBe(instance2.value);
    });

    it('should create a new instance for transient services', () => {
      @Service({ lifecycle: 'transient' })
      class TransientService {
        public value: number = Math.random();
      }

      const instance1: TransientService = inject(TransientService);
      const instance2: TransientService = inject(TransientService);

      expect(instance1).not.toBe(instance2);
      expect(instance1.value).not.toBe(instance2.value);
    });
  });

  describe('Named tokens', () => {
    it('should register and inject services with custom token names', () => {
      @Service({ token: 'CustomNamedService' })
      class NamedService {
        getValue() {
          return 'Named';
        }
      }

      @Service()
      class DependentService {
        constructor(
          @Inject('CustomNamedService') private service: NamedService
        ) {}

        getValue() {
          return `Using ${this.service.getValue()}`;
        }
      }

      initializeContainer();
      const instance: DependentService = inject(DependentService);
      expect(instance.getValue()).toBe('Using Named');

      // Can also inject directly by token
      const namedInstance = inject<NamedService>('CustomNamedService');
      expect(namedInstance.getValue()).toBe('Named');
    });

    it('should register and inject services with custom token names and token name dependencies', () => {
      @Service({ token: 'AnotherCustomNamedService' })
      class AnotherNamedService {
        getValue() {
          return 'AnotherNamed';
        }
      }
      @Service({
        token: 'CustomNamedService',
        dependencies: ['AnotherCustomNamedService'],
      })
      class NamedService {
        constructor(private service: AnotherNamedService) {}
        getValue() {
          return `${this.service.getValue()} Named`;
        }
      }

      @Service()
      class DependentService {
        constructor(private service: NamedService) {}

        getValue() {
          return `Using ${this.service.getValue()}`;
        }
      }

      initializeContainer();
      const instance: DependentService = inject(DependentService);
      expect(instance.getValue()).toBe('Using AnotherNamed Named');

      // Can also inject directly by token
      const namedInstance = inject<NamedService>('CustomNamedService');
      expect(namedInstance.getValue()).toBe('AnotherNamed Named');
    });
    it('should allow symbol tokens', () => {
      const TOKEN = Symbol('TestToken');

      @Service({ token: TOKEN })
      class SymbolService {
        getValue() {
          return 'Symbol';
        }
      }

      const instance = inject<SymbolService>(TOKEN);
      expect(instance.getValue()).toBe('Symbol');
    });
  });

  describe('Value dependencies', () => {
    it('should register and inject value dependencies', () => {
      const CONFIG_TOKEN = 'appConfig';
      const config = { apiUrl: 'https://api.example.com', timeout: 3000 };

      registerValue(CONFIG_TOKEN, config);

      @Service()
      class ApiService {
        constructor(@Inject(CONFIG_TOKEN) private config: any) {}

        getApiUrl() {
          return this.config.apiUrl;
        }
      }

      const paramTokens = Reflect.getMetadata(
        PARAM_TOKENS_METADATA,
        ApiService
      );
      console.log('in Test; Param Tokens:', paramTokens);

      const apiService = inject<ApiService>(ApiService);
      expect(apiService.getApiUrl()).toBe('https://api.example.com');

      // Can also get the value directly
      const configValue = inject(CONFIG_TOKEN);
      expect(configValue).toBe(config);
    });

    it('should handle multiple values and mixed dependencies', () => {
      class Helper {
        getValue() {
          return 'helper';
        }
      }
      registerValue('HELPER', Helper);
      registerValue('AGE', 42);
      @Service()
      class MixedService {
        constructor(
          @Inject('HELPER') public helper: Helper,
          @Inject('AGE') public age: number
        ) {}

        getValues() {
          return {
            helper: this.helper.getValue(),
            age: this.age,
          };
        }
      }

      const instance = inject<MixedService>(MixedService);
      console.log('instance', instance);
      const values = instance.getValues();

      expect(values.helper).toBe('helper');
      expect(values.age).toBe(42);
    });
  });

  describe('Error handling', () => {
    it('should throw error for unregistered tokens', () => {
      expect(() => inject('NonExistentToken')).toThrow(
        /No dependency registered/
      );
    });

    it('should throw error for incomplete dependencies', () => {
      class Dependency1 {}
      class Dependency2 {}

      function createBadService() {
        @Service(Dependency1)
        class BadService {
          constructor(private dep1: Dependency1, private dep2: Dependency2) {}
        }
        return BadService;
      }

      expect(createBadService).toThrow(/Incomplete dependencies/);
    });
  });
});
