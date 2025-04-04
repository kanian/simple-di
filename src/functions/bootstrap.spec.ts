import { expect, test, describe, beforeEach } from 'bun:test';
import { Module } from '../types/Module';
import { bootstrap } from './bootstrap';
import { inject } from './inject';
import { initializeContainer } from './initializeContainer';
import { Service } from '../decorators/Service';

describe('Bootstrap Functionality', () => {
  beforeEach(() => {
    initializeContainer();
  });

  test('should process root module and its imports', () => {
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

    const moduleA = new Module({
      providers: [{
        provide: 'ServiceA',
        useClass: ServiceA,
      }],
    });

    const rootModule = new Module({
      imports: [moduleA],
      providers: [{
        provide: 'ServiceB',
        useClass: ServiceB,
      }],
    });

    bootstrap(rootModule);

    const instanceA: ServiceA = inject(ServiceA);
    const instanceB: ServiceB = inject(ServiceB);

    expect(instanceA.getValue()).toBe('A');
    expect(instanceB.getValue()).toBe('B');
  });

  test('should register value providers', () => {
    const CONFIG_TOKEN = 'appConfig';
    const config = { apiUrl: 'https://api.example.com', timeout: 3000 };

    const rootModule = new Module({
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    });

    bootstrap(rootModule);

    const configValue = inject(CONFIG_TOKEN);
    expect(configValue).toBe(config);
  });

  test('should register factory providers', () => {
    class ClassA {
      getValue() {
        return 'ClassA';
      }
    }
    const factory = () => {
      return new ClassA();
    };
    const rootModule = new Module({
      providers: [
        {
          provide: 'ClassA',
          useFactory: factory,
        },
      ],
    });
    bootstrap(rootModule);
    const instanceA = inject<ClassA>('ClassA');
    expect(instanceA.getValue()).toBe('ClassA');
  })
  
  test('should register raw class providers', () => {

    class TokenService {
      getValue() {
        return 'TokenService';
      }
    }

    const rootModule = new Module({
      providers: [TokenService],
    });

    bootstrap(rootModule);

    const instance = inject<TokenService>(TokenService);
    expect(instance.getValue()).toBe('TokenService');
  });

  test('should register class providers with tokens', () => {
    const TOKEN = Symbol('TestToken');

    @Service({ token: TOKEN })
    class TokenService {
      getValue() {
        return 'TokenService';
      }
    }

    const rootModule = new Module({
      providers: [
        {
          provide: TOKEN,
          useClass: TokenService,
        },
      ],
    });

    bootstrap(rootModule);

    const instance = inject<TokenService>(TOKEN);
    expect(instance.getValue()).toBe('TokenService');
  });

  test('should handle nested module imports', () => {
    @Service()
    class ServiceC {
      getValue() {
        return 'C';
      }
    }
    console.log('ServiceC name ', ServiceC.name);
    const moduleB = new Module({
      providers: [{
        provide: 'ServiceC',
        useClass: ServiceC,
      }],
    });

    const moduleA = new Module({
      imports: [moduleB],
    });

    const rootModule = new Module({
      imports: [moduleA],
    });

    bootstrap(rootModule);

    const instanceC: ServiceC = inject(ServiceC);
    expect(instanceC.getValue()).toBe('C');
  });
});
